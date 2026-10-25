# PROMPT 14: Unified End-to-End Workflow Testing, Audit Trail & Live Hackathon Demo Seeder
## Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)
### Application: DPDP_Secure | Srujana Tech Fest 2026

> **HOW TO USE:** Copy the entire code block below and paste directly into your terminal or chat as a `/goal` command. It is 100% self-contained, pre-configured for the existing `DPDP_Secure` codebase, and includes all necessary cybersecurity guardrails.

---

### DIRECT COPY-PASTE PROMPT:

```markdown
/goal
Build a unified end-to-end integration test suite verifying all 4 compliance pillars and all 54 existing routes, a tamper-evident audit trail with SHA-256 hash chaining, and an automated demo seeding script (`npm run seed:demo`) in `DPDP_Secure`. The seeder resets and loads the complete Aarogya Diagnostic Center walkthrough in one command, supported by a 1-click "⚡ Instant Hackathon Demo Mode" button wired to a real backend reset API endpoint.

### Context & Existing Workspace:
- Workspace root: `N:\chnayka\DPDP_Secure`
- Target files:
  - `src/models/demoSeeder.js` (NEW automated demo seeder)
  - `src/models/auditLogger.js` (NEW hash-chained audit logging service)
  - `src/controllers/demoController.js` (NEW demo controller for 1-click reset)
  - `tests/e2eWorkflow.test.js` (NEW integration test suite)
  - `views/settings-audit-log.ejs` (Updated tamper-evident audit view)
  - `views/index.ejs` (Updated with 1-click demo button)
  - `package.json` (add scripts: `"seed:demo"`, `"test:e2e"`)
  - `server.js` (mount demo reset API)
- Brand Protection: Strictly use `DPDP_Secure`. Never use any deprecated or legacy brand names.

### Mandatory Requirements:

1. Cybersecurity & Audit Integrity Guardrails:
   - **Cryptographic Hash Chaining (Tamper-Evidence):** Every audit log entry must hash the previous entry's digest:
     `currentHash = crypto.createHash('sha256').update(prevHash + timestamp + actor + action + resource + details).digest('hex')`
     Any manual modification or deletion of database records breaks the hash chain, providing verifiable regulatory audit proof.
   - **Automated Regression Safeguard:** The integration test suite must verify that all 54 existing routes return `HTTP 200 OK` and that zero routes throw uncaught exceptions.
   - **Isolated Demo Seeding:** The seeder must execute strictly against local `data/dpdp_secure.db` without affecting external environments.

2. Automated Demo Seeding Script (`src/models/demoSeeder.js`):
   Implement `seedDemoData()` runnable via `npm run seed:demo`:
   - **Tenant:** Aarogya Diagnostic Center (Indiranagar, Bengaluru).
   - **Users:**
     - Ramesh Kumar (SME Owner)
     - Priya Sharma (Front-Desk Receptionist)
     - Rajesh Iyer (Independent Regulatory Auditor)
   - **Informal Silos Mapped:**
     1. WhatsApp Chat Backup (`data/sample_data/clinic_reception_chat.txt`)
     2. Customer Leads Spreadsheet (`data/sample_data/customer_leads.csv`)
     3. Invoices Billing CSV (`data/sample_data/invoices_billing.csv`)
   - **Discovered PII Summary:** 1,420 items categorized (Aadhaar, PAN, Health diagnoses, Phone, UPI VPAs).
   - **Active Section 5 Notices:** English, Kannada (`ಕನ್ನಡ`), and Hindi (`हिन्दी`).
   - **Live DSR Ticket:** `DSR-2026-8819` for Deepa Nair (Erasure requested, CGST 6-year tax lock active on Invoice `INV-2024-309`).
   - **Active Incident:** "Lost Receptionist Android Phone" with ready-to-print 72-Hour DPBI Dossier.

3. Tamper-Evident Audit Log (`views/settings-audit-log.ejs`):
   Display an immutable security and compliance ledger:
   - Columns:
     - Timestamp (ISO 8601)
     - Actor & Role (e.g. `Ramesh Kumar (SME_OWNER)`)
     - Statutory Event (`DISCOVERY_SCAN`, `CONSENT_CAPTURED`, `DSR_ERASURE_EXECUTED`, `TAX_LOCK_APPLIED`, `BREACH_INTIMATED`)
     - Target Silo / Principal (`clinic_reception_chat.txt`, `Deepa Nair`)
     - Details / Legal Ground (`CGST Act Sec 36 Retention Lock Applied until 2030-12-31`)
     - SHA-256 Digest (Chained hash proving ledger integrity)

4. Automated End-to-End Test Suite (`tests/e2eWorkflow.test.js`):
   Write tests asserting all 4 pillars AND all 54 existing routes:
   - `testAllExistingRoutes()`:
     - Iterate through an array of all 54 existing navigation routes (`/`, `/discovery/connectors`, `/inventory/assets`, `/inventory/ropa`, `/consent/ledger`, `/privacy/requests`, `/incidents/management`, `/settings/general`, etc.).
     - Send GET requests and assert every single route returns `HTTP 200 OK` and valid HTML.
   - `testPillar1Discovery()`: Verhoeff algorithm validates valid Aadhaar `3421 8901 2345` and rejects invalid barcodes; entity PAN correctly identifies individual vs corporate.
   - `testPillar2Consent()`: Section 5 notices render in English, Kannada, and Hindi; 1-click WhatsApp opt-in registers in ledger.
   - `testPillar3ErasureAndTaxLock()`: Deepa Nair erasure redacts WhatsApp and lead entries with `[REDACTED-DPDP-SEC-12]` while preserving billing record `INV-2024-309` under CGST Section 36; generates valid SHA-256 certificate.
   - `testPillar4BreachTriage()`: Lost smartphone incident correctly flags critical health severity and prepares DPBI 72-hour filing.
   - Run tests via `npm run test:e2e` and verify all assertions return green.

5. 1-Click Demo Reset API & Button (`src/controllers/demoController.js`):
   - Endpoint: `POST /api/demo/reset`
     - Calls `seedDemoData()`
     - Returns JSON `{ success: true, message: 'Demo environment reset to Aarogya Clinic' }`
   - Header button in `views/index.ejs`:
     `⚡ Instant Hackathon Demo Mode`
   - Clicking triggers AJAX call to `/api/demo/reset` and reloads the dashboard with pre-loaded demo metrics.

6. Verification Steps:
   - Run `npm run seed:demo`.
   - Confirm console logs indicate successful seeding.
   - Run `npm run test:e2e`. Confirm all 4 pillar integration tests pass AND all 54 routes return `HTTP 200 OK` with 100% assertions green.
   - Open `http://localhost:3000/settings/audit-log` and verify the cryptographic audit entries.
   - Test the "⚡ Instant Hackathon Demo Mode" button on the dashboard.
```

---

## Technical Reference & File Mapping

| File Path | Purpose |
|---|---|
| `src/models/demoSeeder.js` | Automated reset and seeding script for live demonstration. |
| `src/models/auditLogger.js` | SHA-256 hash-chained immutable audit logging engine. |
| `src/controllers/demoController.js` | 1-click demo reset API endpoint. |
| `tests/e2eWorkflow.test.js` | Integration test suite verifying all 4 pillars and all 54 existing routes. |
| `views/settings-audit-log.ejs` | Tamper-evident cryptographic audit log view. |
