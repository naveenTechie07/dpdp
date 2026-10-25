# PROMPT 04: Local Persistence Layer (SQLite), Data Models & Core Repository Logic
## Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)
### Application: DPDP_Secure | Srujana Tech Fest 2026

> **HOW TO USE:** Copy the entire code block below and paste directly into your terminal or chat as a `/goal` command. It is 100% self-contained, pre-configured for the existing `DPDP_Secure` codebase, and includes all necessary cybersecurity guardrails.

---

### DIRECT COPY-PASTE PROMPT:

```markdown
/goal
Build a high-performance, zero-configuration local persistence layer using SQLite in `DPDP_Secure` that guarantees 100% offline-first execution, parameterized query safety, transaction management, serverless filesystem compatibility, and complete repository methods for all backend controllers.

### Context & Existing Workspace:
- Workspace root: `N:\chnayka\DPDP_Secure`
- Target files: `src/models/db.js`, `src/models/index.js`, `src/models/seed.js`, `package.json`.
- Brand Protection: Strictly use `DPDP_Secure`. Never use any deprecated or legacy brand names.

### Mandatory Requirements:

1. Cybersecurity & Persistence Guardrails:
   - **SQL Injection Defense:** All database queries must strictly use prepared statements / parameterized queries (e.g. `db.prepare('SELECT * FROM data_silos WHERE tenantId = ?').all(tenantId)`). Zero string interpolation in SQL.
   - **Zero Cloud Egress Guarantee:** The database runs 100% locally as an embedded SQLite database (`data/dpdp_secure.db`). No sensitive customer data, Aadhaar records, or lab tests may be sent to any external cloud database.
   - **Serverless Filesystem Adaptation:** In `src/models/db.js`, dynamically resolve the database path:
     `const dbPath = process.env.VERCEL ? path.join('/tmp', 'dpdp_secure.db') : path.join(__dirname, '../../data/dpdp_secure.db');`
     Ensure directory exists using `fs.mkdirSync(path.dirname(dbPath), { recursive: true })` so that Vercel serverless functions never throw `EROFS` read-only errors.
   - **Token Encryption at Rest:** If storing any external API keys or auth tokens, encrypt them using Node.js `crypto` with `aes-256-gcm` using a key derived from `SESSION_SECRET`.
   - **Git Hygiene:** Ensure `data/*.db` and `data/*.db-journal` are ignored in `.gitignore`.

2. Database Engine & Schema (`src/models/db.js`):
   Initialize SQLite (using `better-sqlite3` or `sqlite3`) and execute full DDL with indices on startup:
   - `tenants`:
     `CREATE TABLE IF NOT EXISTS tenants (id TEXT PRIMARY KEY, businessName TEXT, businessType TEXT, gstNumber TEXT, address TEXT, dpoName TEXT, dpoEmail TEXT, complianceScore INTEGER DEFAULT 84, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);`
   - `data_silos`:
     `CREATE TABLE IF NOT EXISTS data_silos (id TEXT PRIMARY KEY, tenantId TEXT, siloName TEXT, siloType TEXT, filePath TEXT, itemCount INTEGER DEFAULT 0, riskLevel TEXT, lastScannedAt DATETIME, FOREIGN KEY(tenantId) REFERENCES tenants(id));`
   - `pii_findings`:
     `CREATE TABLE IF NOT EXISTS pii_findings (id TEXT PRIMARY KEY, siloId TEXT, entityName TEXT, piiType TEXT, maskedValue TEXT, rawSample TEXT, lineNumber INTEGER, confidenceScore REAL, isRedacted INTEGER DEFAULT 0, FOREIGN KEY(siloId) REFERENCES data_silos(id));`
   - `ropa_records`:
     `CREATE TABLE IF NOT EXISTS ropa_records (id TEXT PRIMARY KEY, tenantId TEXT, activityName TEXT, dataCategories TEXT, purpose TEXT, legalBasis TEXT, retentionPeriod TEXT, storageLocation TEXT, securitySafeguards TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);`
   - `consent_notices`:
     `CREATE TABLE IF NOT EXISTS consent_notices (id TEXT PRIMARY KEY, tenantId TEXT, title TEXT, purposeCode TEXT, language TEXT, noticeText TEXT, version TEXT, isActive INTEGER DEFAULT 1, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);`
   - `consent_events`:
     `CREATE TABLE IF NOT EXISTS consent_events (id TEXT PRIMARY KEY, tenantId TEXT, dataPrincipalPhone TEXT, purposeCode TEXT, status TEXT, channel TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, sha256Proof TEXT);`
   - `privacy_requests`:
     `CREATE TABLE IF NOT EXISTS privacy_requests (id TEXT PRIMARY KEY, tenantId TEXT, ticketNumber TEXT UNIQUE, principalName TEXT, principalPhone TEXT, principalEmail TEXT, requestType TEXT, status TEXT, statutoryLockReason TEXT, certHash TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);`
   - `incidents`:
     `CREATE TABLE IF NOT EXISTS incidents (id TEXT PRIMARY KEY, tenantId TEXT, incidentTitle TEXT, scenarioType TEXT, severity TEXT, affectedCount INTEGER DEFAULT 0, dataCategories TEXT, containmentActions TEXT, reportedToDpbi INTEGER DEFAULT 0, citizenAlertSent INTEGER DEFAULT 0, discoveredAt DATETIME DEFAULT CURRENT_TIMESTAMP, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);`
   - `audit_logs`:
     `CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, tenantId TEXT, actor TEXT, action TEXT, resource TEXT, detailsJson TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, prevHash TEXT, hash TEXT);`
   - Performance Indices:
     `CREATE INDEX IF NOT EXISTS idx_pii_silo ON pii_findings(siloId);`
     `CREATE INDEX IF NOT EXISTS idx_consent_phone ON consent_events(dataPrincipalPhone);`
     `CREATE INDEX IF NOT EXISTS idx_privacy_ticket ON privacy_requests(ticketNumber);`
     `CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(timestamp);`

3. Repository Helper Methods (`src/models/index.js`):
   Provide clean, synchronous/asynchronous data access methods:
   - **Dashboard Metrics:**
     - `getDashboardMetrics(tenantId)`: Computes `{ silosCount, piiCount, activeNoticesCount, pendingDsrCount, taxLockedCount, activeIncidentsCount, complianceScore }`.
   - **Silos & Findings:**
     - `getSilos(tenantId)`, `saveSilo(siloData)`, `savePiiFindings(findingsArray)`, `getFindingsBySilo(siloId)`, `getAllFindings(tenantId)`
   - **RoPA Synthesis:**
     - `getRoPARecords(tenantId)`, `saveRoPARecords(ropaArray)`
   - **Consent Management:**
     - `getActiveNotices(tenantId)`, `saveNotice(noticeData)`, `recordConsentEvent(eventData)`, `withdrawConsent(phone, purposeCode)`, `getConsentLedger(tenantId)`
   - **Privacy & DSR:**
     - `getPrivacyRequests(tenantId)`, `getDsrByTicket(ticketNumber)`, `createDsrRequest(dsrData)`, `updateDsrStatus(ticketId, status, details)`
   - **Incidents & Breach:**
     - `getIncidents(tenantId)`, `getIncidentById(id)`, `createIncident(incidentData)`, `updateIncidentStatus(id, updates)`
   - **Audit Trail & Cryptography:**
     - `getLatestAuditLog(tenantId)`, `logAuditEvent(tenantId, actor, action, resource, details)`, `getAuditLogs(tenantId, limit)`
   - **Transactions:**
     - `runTransaction(callback)`: Wraps multiple writes inside an atomic SQLite transaction.

4. Seeder Script (`src/models/seed.js`):
   Create a standalone seed script pre-populating:
   - Tenant: "Aarogya Diagnostic Center", GST: "29AAAAA0000A1Z5", Owner: "Ramesh Kumar".
   - The 3 sample silos mapped to `data/sample_data/`:
     - `clinic_reception_chat.txt` (WhatsApp chat backup)
     - `customer_leads.csv` (Lead spreadsheet)
     - `invoices_billing.csv` (Billing system export)
   - Deepa Nair's pending DSR erasure ticket (`DSR-2026-8819`).
   - Incident: "Lost Receptionist Smartphone (Android)" with 250 affected patients.
   - Add npm script in `package.json`: `"seed": "node src/models/seed.js"`.

5. Verification Steps:
   - Run `node src/models/seed.js`.
   - Confirm `data/dpdp_secure.db` is generated with all 9 tables.
   - Run test query verifying `getDashboardMetrics('TENANT-AAROGYA-01')` returns correct counts.
   - Verify transaction rollback on intentional query failure to validate ACID compliance.
```

---

## Technical Reference & File Mapping

| File Path | Purpose |
|---|---|
| `src/models/db.js` | SQLite initialization, serverless path resolution, and schema DDL. |
| `src/models/index.js` | Full repository methods for dashboard, discovery, consent, DSR, incidents, and audits. |
| `src/models/seed.js` | Pre-populates Aarogya Diagnostic Center database environment. |
