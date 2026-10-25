# DPDP_Secure — Master Implementation Prompt: Complete All Half-Finished Features

**Target Directory:** `N:\chnayka\DPDP_Secure/`  
**Problem Statement:** LS-04 — Personal Data in Informal Systems  
**Event:** Srujana Tech Fest 2026  
**Status:** Core pillars (discovery, consent, DSR, breach) are fully implemented. Remaining ~35 features across Governance, Assessments, Integrations, Settings, Consent, and Cookies modules have views but NO backend functionality — they are static HTML shells with no data, no CRUD, no API endpoints.

---

## CURRENT STATE ANALYSIS

### What's Already Implemented (Working End-to-End)

| Area | Status |
|------|--------|
| Authentication (login, Google OAuth, demo login, logout, session mgmt) | ✅ Complete |
| Data Discovery & PII Scanner (WhatsApp, Excel, CSV parsing, Verhoeff Aadhaar) | ✅ Complete |
| Consent Management (Section 5 notices, consent ledger, SHA-256 proofs) | ✅ Complete |
| DSR/Rights Workflows (Section 11 access, Section 12 erasure, CGST conflict) | ✅ Complete |
| Incident & Breach Management (create, triage, dispatch, DPBI dossier) | ✅ Complete |
| Audit Trail (SHA-256 hash chaining) | ✅ Complete |
| Dashboard Metrics | ✅ Complete |
| Data Assets CRUD | ✅ Just implemented |
| Data Tags CRUD | ✅ Just implemented |
| Workflows CRUD | ✅ Just implemented |

### What's HALF-COMPLETED (View exists, route exists, but NO data/CRUD/API)

The following views render static HTML with zero data, no CRUD operations, and no API endpoints. Each needs: model functions, API routes, and frontend wire-up.

## MASTER IMPLEMENTATION PROMPT

---

### OVERARCHING INSTRUCTIONS

You are a senior full-stack engineer implementing the remaining features of DPDP_Secure, a DPDP Act 2023 compliance platform for Indian SMEs. All code must follow the existing patterns established in the codebase:

**Architecture Patterns to Follow:**
- Express.js with EJS templates
- SQLite database via `sqlite3` (already configured in `src/models/db.js`)
- Model layer in `src/models/index.js` (uses `run`, `get`, `all`, `runTransaction`)
- Route files in `src/routes/` (mounted in `server.js` via `app.use('/', routeFile)`)
- Controller files in `src/controllers/` (separate logic from routes)
- Services in `src/services/` (business logic)
- Middleware in `src/middlewares/` (auth, error handling)
- Views in `views/` directory (EJS templates)
- All database operations use parameterized queries (no string concatenation)
- All mutations write to `audit_logs` via `models.logAuditEvent()`
- All dates use ISO 8601 format (`new Date().toISOString()`)
- All IDs use `uuidv4()` from the `uuid` package
- All API responses follow `{ success: true/false, data: ..., message: ... }` format
- All error handling wraps in try/catch with `console.error` and proper HTTP status codes
- Tenant ID defaults to `'TENANT-AAROGYA-01'` when not in session
- User info from `req.session?.user` (name, tenantId, role)

**Design System:**
- Dark theme with `slate-900` background (`#0b0f19`)
- Glassmorphism cards (`bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-xl p-6`)
- Primary color: `sky-500` (`#3b82f6`)
- Accent colors: `emerald-500` (success), `amber-500` (warning), `red-500` (danger), `slate-400` (muted)
- Buttons: `btn-primary` (sky-500), `btn-secondary` (slate-700), `btn-danger` (red-500)
- Form inputs: `input-field` (slate-800 bg, border-slate-600, focus:ring-sky-500)
- Stats cards: `StatsCard` component pattern

---

## PRIORITY 1 — DATA MANAGEMENT (CRITICAL — Just Implemented)

These three features have been fully implemented. Verify they work:

| Feature | Route | View | Model | Route |
|---|---|---|---|---|
| Data Assets | `/inventory/assets` + `POST /api/assets/create` | `inventory-assets.ejs`, `inventory-asset-create.ejs` | `getDataAssets`, `createDataAsset` | `discoveryRoutes.js` |
| Data Tags | `/inventory/tags` + `POST /api/tags/create` | `inventory-tags.ejs`, `inventory-tag-create.ejs` | `getDataTags`, `createDataTag` | `discoveryRoutes.js` |
| Workflows | `/privacy/workflows/create` + `POST /api/workflows/create` | `privacy-workflows.ejs` (modal) | `getWorkflows`, `createWorkflow` | `privacyRoutes.js` |

**Verification needed:** Test all three create flows end-to-end.

---

## PRIORITY 2 — GOVERNANCE MODULE (5 features)

All five governance views exist but have NO backend. Each needs: model functions, API routes, create views, and list view integration.

### 2.1 Data Processors (`/governance/processors`)

**Database Table:** `data_processors`
```sql
CREATE TABLE IF NOT EXISTS data_processors (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    processorName TEXT NOT NULL,
    serviceType TEXT,
    dataCategories TEXT,
    jurisdiction TEXT,
    adequacyDecision TEXT,
    contractSigned INTEGER DEFAULT 0,
    dpaSigned INTEGER DEFAULT 0,
    lastReviewed DATETIME,
    riskLevel TEXT DEFAULT 'MEDIUM',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/governance/processors` — List all processors
- `POST /api/governance/processors` — Create processor
- `PUT /api/governance/processors/:id` — Update processor
- `DELETE /api/governance/processors/:id` — Delete processor

**View:** `governance-processors.ejs` — Already exists, just needs data populated

**Model Functions:** `getDataProcessors`, `createDataProcessor`, `updateDataProcessor`, `deleteDataProcessor`

---

### 2.2 Retention Policies (`/governance/retention`)

**Database Table:** `retention_policies`
```sql
CREATE TABLE IF NOT EXISTS retention_policies (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    policyName TEXT NOT NULL,
    dataCategory TEXT,
    retentionPeriod TEXT,
    legalBasis TEXT,
    autoDelete INTEGER DEFAULT 0,
    lastReviewed DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/governance/retention` — List all policies
- `POST /api/governance/retention` — Create policy
- `PUT /api/governance/retention/:id` — Update policy
- `DELETE /api/governance/retention/:id` — Delete policy

**Model Functions:** `getRetentionPolicies`, `createRetentionPolicy`, `updateRetentionPolicy`, `deleteRetentionPolicy`

---

### 2.3 Cross-Border Transfers (`/governance/cross-border`)

**Database Table:** `cross_border_transfers`
```sql
CREATE TABLE IF NOT EXISTS cross_border_transfers (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    destinationCountry TEXT,
    recipientName TEXT,
    dataCategories TEXT,
    transferMechanism TEXT,
    adequacyDecision TEXT,
    lastReviewed DATETIME,
    riskLevel TEXT DEFAULT 'MEDIUM',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/governance/cross-border` — List all transfers
- `POST /api/governance/cross-border` — Create transfer record
- `PUT /api/governance/cross-border/:id` — Update transfer
- `DELETE /api/governance/cross-border/:id` — Delete transfer

**Model Functions:** `getCrossBorderTransfers`, `createCrossBorderTransfer`, `updateCrossBorderTransfer`, `deleteCrossBorderTransfer`

---

### 2.4 Compliance Evidence (`/governance/evidence`)

**Database Table:** `compliance_evidence`
```sql
CREATE TABLE IF NOT EXISTS compliance_evidence (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    documentName TEXT NOT NULL,
    documentType TEXT,
    uploadedBy TEXT,
    filePath TEXT,
    fileSize INTEGER,
    verified INTEGER DEFAULT 0,
    expiryDate DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/governance/evidence` — List all evidence
- `POST /api/governance/evidence` — Upload evidence (multer)
- `DELETE /api/governance/evidence/:id` — Delete evidence

**Model Functions:** `getComplianceEvidence`, `createComplianceEvidence`, `deleteComplianceEvidence`

---

### 2.5 Security Controls (`/governance/security-controls`)

**Database Table:** `security_controls`
```sql
CREATE TABLE IF NOT EXISTS security_controls (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    controlName TEXT NOT NULL,
    controlCategory TEXT,
    implementationStatus TEXT DEFAULT 'planned',
    effectiveness TEXT DEFAULT 'medium',
    lastTested DATETIME,
    nextReview DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/governance/security-controls` — List all controls
- `POST /api/governance/security-controls` — Create control
- `PUT /api/governance/security-controls/:id` — Update control
- `DELETE /api/governance/security-controls/:id` — Delete control

**Model Functions:** `getSecurityControls`, `createSecurityControl`, `updateSecurityControl`, `deleteSecurityControl`

---

## PRIORITY 3 — ASSESSMENT AUTOMATION (4 features)

### 3.1 Assessment Dashboard (`/assessment/dashboard`)

**Database Table:** `assessments`
```sql
CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    assessmentName TEXT NOT NULL,
    assessmentType TEXT,
    status TEXT DEFAULT 'draft',
    score INTEGER DEFAULT 0,
    totalQuestions INTEGER DEFAULT 0,
    answeredQuestions INTEGER DEFAULT 0,
    lastCompleted DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/assessment/dashboard` — List all assessments
- `POST /api/assessment/dashboard` — Create assessment
- `PUT /api/assessment/dashboard/:id` — Update assessment

**Model Functions:** `getAssessments`, `createAssessment`, `updateAssessment`

---

### 3.2 Assessment Templates (`/assessment/templates`)

**Database Table:** `assessment_templates`
```sql
CREATE TABLE IF NOT EXISTS assessment_templates (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    templateName TEXT NOT NULL,
    framework TEXT,
    questionCount INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/assessment/templates` — List all templates
- `POST /api/assessment/templates` — Create template
- `PUT /api/assessment/templates/:id` — Update template
- `DELETE /api/assessment/templates/:id` — Delete template

**Model Functions:** `getAssessmentTemplates`, `createAssessmentTemplate`, `updateAssessmentTemplate`, `deleteAssessmentTemplate`

---

### 3.3 PIA/DPIA (`/assessment/pia-dpia`)

**Database Table:** `pia_dpia_assessments`
```sql
CREATE TABLE IF NOT EXISTS pia_dpia_assessments (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    assessmentName TEXT NOT NULL,
    dataCategory TEXT,
    riskLevel TEXT,
    status TEXT DEFAULT 'draft',
    mitigations TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/assessment/pia-dpia` — List all assessments
- `POST /api/assessment/pia-dpia` — Create assessment
- `PUT /api/assessment/pia-dpia/:id` — Update assessment

**Model Functions:** `getPiaDpiaAssessments`, `createPiaDpiaAssessment`, `updatePiaDpiaAssessment`

---

### 3.4 Assessment Settings (`/assessment/settings`)

**Database Table:** `assessment_settings`
```sql
CREATE TABLE IF NOT EXISTS assessment_settings (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    settingKey TEXT NOT NULL,
    settingValue TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/assessment/settings` — Get all settings
- `POST /api/assessment/settings` — Create/update setting

**Model Functions:** `getAssessmentSettings`, `upsertAssessmentSetting`

---

## PRIORITY 4 — INTEGRATIONS (3 features)

### 4.1 Integrations Dashboard (`/integrations/dashboard`)

**Database Table:** `integrations`
```sql
CREATE TABLE IF NOT EXISTS integrations (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    integrationName TEXT NOT NULL,
    provider TEXT,
    status TEXT DEFAULT 'inactive',
    apiKeyPrefix TEXT,
    lastSynced DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/integrations/dashboard` — List all integrations
- `POST /api/integrations/dashboard` — Create integration
- `PUT /api/integrations/dashboard/:id` — Update integration
- `DELETE /api/integrations/dashboard/:id` — Delete integration

**Model Functions:** `getIntegrations`, `createIntegration`, `updateIntegration`, `deleteIntegration`

---

### 4.2 Integrations Hub (`/integrations/hub`)

**Database Table:** `integration_hub`
```sql
CREATE TABLE IF NOT EXISTS integration_hub (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    connectorName TEXT NOT NULL,
    connectorType TEXT,
    config JSON,
    isActive INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/integrations/hub` — List all connectors
- `POST /api/integrations/hub` — Create connector
- `PUT /api/integrations/hub/:id` — Update connector

**Model Functions:** `getIntegrationHub`, `createIntegrationHub`, `updateIntegrationHub`

---

### 4.3 API Keys (`/integrations/api-keys`)

**Database Table:** `api_keys`
```sql
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    keyName TEXT NOT NULL,
    keyPrefix TEXT,
    keyHash TEXT,
    scopes TEXT,
    lastUsed DATETIME,
    expiresAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/integrations/api-keys` — List all API keys
- `POST /api/integrations/api-keys` — Create API key
- `DELETE /api/integrations/api-keys/:id` — Revoke API key

**Model Functions:** `getApiKeys`, `createApiKey`, `deleteApiKey`

---

## PRIORITY 5 — SETTINGS (6 features)

### 5.1 General Settings (`/settings/general`)

**Database Table:** `tenant_settings`
```sql
CREATE TABLE IF NOT EXISTS tenant_settings (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    settingKey TEXT NOT NULL,
    settingValue TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id),
    UNIQUE(tenantId, settingKey)
);
```

**API Endpoints:**
- `GET /api/settings/general` — Get all settings
- `POST /api/settings/general` — Upsert setting

**Model Functions:** `getTenantSettings`, `upsertTenantSetting`

---

### 5.2 SSO Settings (`/settings/sso`)

**Database Table:** `sso_settings`
```sql
CREATE TABLE IF NOT EXISTS sso_settings (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    provider TEXT NOT NULL,
    clientId TEXT,
    clientSecret TEXT,
    redirectUri TEXT,
    isEnabled INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/settings/sso` — Get SSO config
- `POST /api/settings/sso` — Save SSO config

**Model Functions:** `getSsoSettings`, `upsertSsoSetting`

---

### 5.3 Branding Settings (`/settings/branding`)

**Database Table:** `branding_settings`
```sql
CREATE TABLE IF NOT EXISTS branding_settings (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    logoUrl TEXT,
    primaryColor TEXT DEFAULT '#3b82f6',
    secondaryColor TEXT DEFAULT '#10b981',
    companyName TEXT,
    faviconUrl TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/settings/branding` — Get branding
- `POST /api/settings/branding` — Save branding

**Model Functions:** `getBrandingSettings`, `upsertBrandingSetting`

---

### 5.4 Organization Settings (`/settings/organization`)

**Database Table:** `organization_settings`
```sql
CREATE TABLE IF NOT EXISTS organization_settings (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    organizationName TEXT,
    parentOrganization TEXT,
    country TEXT,
    industry TEXT,
    employeeCount INTEGER,
    dataProcessingPurpose TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/settings/organization` — Get org settings
- `POST /api/settings/organization` — Save org settings

**Model Functions:** `getOrganizationSettings`, `upsertOrganizationSetting`

---

### 5.5 Roles & Permissions (`/settings/roles`)

**Database Table:** `role_permissions`
```sql
CREATE TABLE IF NOT EXISTS role_permissions (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    roleName TEXT NOT NULL,
    permissions TEXT,
    isSystem INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/settings/roles` — List all roles
- `POST /api/settings/roles` — Create role
- `PUT /api/settings/roles/:id` — Update role
- `DELETE /api/settings/roles/:id` — Delete role

**Model Functions:** `getRoles`, `createRole`, `updateRole`, `deleteRole`

---

### 5.6 Localization (`/settings/localization`)

**Database Table:** `localization_settings`
```sql
CREATE TABLE IF NOT EXISTS localization_settings (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    language TEXT NOT NULL,
    isDefault INTEGER DEFAULT 0,
    translations TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/settings/localization` — Get all locales
- `POST /api/settings/localization` — Upsert locale

**Model Functions:** `getLocalizationSettings`, `upsertLocalizationSetting`

---

## PRIORITY 6 — CONSENT MANAGEMENT (7 features)

### 6.1 Consent Dashboard (`/consent/dashboard`)

**API Endpoints:**
- `GET /api/consent/dashboard` — Get dashboard metrics (total consents, active, withdrawn, by purpose)

**Model Functions:** `getConsentDashboardMetrics`

### 6.2 Consent Purposes (`/consent/purposes`)

**Database Table:** `consent_purposes`
```sql
CREATE TABLE IF NOT EXISTS consent_purposes (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    purposeName TEXT NOT NULL,
    purposeCode TEXT UNIQUE NOT NULL,
    description TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/consent/purposes` — List all purposes
- `POST /api/consent/purposes` — Create purpose
- `PUT /api/consent/purposes/:id` — Update purpose
- `DELETE /api/consent/purposes/:id` — Delete purpose

**Model Functions:** `getConsentPurposes`, `createConsentPurpose`, `updateConsentPurpose`, `deleteConsentPurpose`

---

### 6.3 Consent Preferences (`/consent/preferences`)

**Database Table:** `consent_preferences`
```sql
CREATE TABLE IF NOT EXISTS consent_preferences (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    preferenceName TEXT NOT NULL,
    preferenceValue TEXT,
    isGlobal INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/consent/preferences` — List all preferences
- `POST /api/consent/preferences` — Create preference
- `PUT /api/consent/preferences/:id` — Update preference

**Model Functions:** `getConsentPreferences`, `createConsentPreference`, `updateConsentPreference`

---

### 6.4 Consent Preference Centers (`/consent/preference-centers`)

**Database Table:** `consent_preference_centers`
```sql
CREATE TABLE IF NOT EXISTS consent_preference_centers (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    centerName TEXT NOT NULL,
    purposeIds TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/consent/preference-centers` — List all centers
- `POST /api/consent/preference-centers` — Create center
- `PUT /api/consent/preference-centers/:id` — Update center

**Model Functions:** `getPreferenceCenters`, `createPreferenceCenter`, `updatePreferenceCenter`

---

### 6.5 Consent Data Elements (`/consent/data-elements`)

**Database Table:** `consent_data_elements`
```sql
CREATE TABLE IF NOT EXISTS consent_data_elements (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    elementName TEXT NOT NULL,
    elementType TEXT,
    isSensitive INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/consent/data-elements` — List all data elements
- `POST /api/consent/data-elements` — Create data element
- `PUT /api/consent/data-elements/:id` — Update data element

**Model Functions:** `getDataElements`, `createDataElement`, `updateDataElement`

---

### 6.6 Consent Transactions (`/consent/transactions`)

**Database Table:** `consent_transactions`
```sql
CREATE TABLE IF NOT EXISTS consent_transactions (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    principalPhone TEXT,
    purposeCode TEXT,
    actionType TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    sha256Proof TEXT,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/consent/transactions` — List all transactions
- `GET /api/consent/transactions/:id` — Get transaction details

**Model Functions:** `getConsentTransactions`, `getConsentTransactionById`

---

### 6.7 Consent Policies (`/consent/policies`)

**Database Table:** `consent_policies`
```sql
CREATE TABLE IF NOT EXISTS consent_policies (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    policyName TEXT NOT NULL,
    policyText TEXT,
    version TEXT DEFAULT '1.0',
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/consent/policies` — List all policies
- `POST /api/consent/policies` — Create policy
- `PUT /api/consent/policies/:id` — Update policy
- `DELETE /api/consent/policies/:id` — Delete policy

**Model Functions:** `getConsentPolicies`, `createConsentPolicy`, `updateConsentPolicy`, `deleteConsentPolicy`

---

### 6.8 Consent Portal Settings (`/consent/portal-settings`)

**Database Table:** `consent_portal_settings`
```sql
CREATE TABLE IF NOT EXISTS consent_portal_settings (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    settingKey TEXT NOT NULL,
    settingValue TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/consent/portal-settings` — Get settings
- `POST /api/consent/portal-settings` — Upsert setting

**Model Functions:** `getPortalSettings`, `upsertPortalSetting`

---

## PRIORITY 7 — COOKIE MANAGEMENT (6 features)

### 7.1 Cookies Dashboard (`/cookies/dashboard`)

**Database Table:** `cookie_scan_results`
```sql
CREATE TABLE IF NOT EXISTS cookie_scan_results (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    websiteUrl TEXT NOT NULL,
    scanDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    cookieCount INTEGER DEFAULT 0,
    necessaryCount INTEGER DEFAULT 0,
    nonNecessaryCount INTEGER DEFAULT 0,
    status TEXT DEFAULT 'completed',
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/cookies/dashboard` — List all scans
- `POST /api/cookies/dashboard` — Create scan record

**Model Functions:** `getCookieScans`, `createCookieScan`

---

### 7.2 Cookies Scans (`/cookies/scans`)

**API Endpoints:**
- `GET /api/cookies/scans` — List all scans
- `POST /api/cookies/scans` — Create scan
- `GET /api/cookies/scans/:id` — Get scan details

**Model Functions:** `getCookieScans`, `createCookieScan`, `getCookieScanById`

---

### 7.3 Cookies Logs (`/cookies/logs`)

**Database Table:** `cookie_consent_logs`
```sql
CREATE TABLE IF NOT EXISTS cookie_consent_logs (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    sessionId TEXT,
    action TEXT,
    cookieCategories TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/cookies/logs` — List all consent logs
- `POST /api/cookies/logs` — Create log entry

**Model Functions:** `getCookieConsentLogs`, `createCookieConsentLog`

---

### 7.4 Cookies Banners (`/cookies/banners`)

**Database Table:** `cookie_banners`
```sql
CREATE TABLE IF NOT EXISTS cookie_banners (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    bannerName TEXT NOT NULL,
    bannerText TEXT,
    buttonText TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/cookies/banners` — List all banners
- `POST /api/cookies/banners` — Create banner
- `PUT /api/cookies/banners/:id` — Update banner
- `DELETE /api/cookies/banners/:id` — Delete banner

**Model Functions:** `getCookieBanners`, `createCookieBanner`, `updateCookieBanner`, `deleteCookieBanner`

---

### 7.5 Cookies Geo Rules (`/cookies/geo-rules`)

**Database Table:** `cookie_geo_rules`
```sql
CREATE TABLE IF NOT EXISTS cookie_geo_rules (
    id TEXT PRIMARY KEY,
    tenantId TEXT NOT NULL,
    countryCode TEXT NOT NULL,
    ruleType TEXT NOT NULL,
    ruleValue TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(tenantId) REFERENCES tenants(id)
);
```

**API Endpoints:**
- `GET /api/cookies/geo-rules` — List all geo rules
- `POST /api/cookies/geo-rules` — Create geo rule
- `PUT /api/cookies/geo-rules/:id` — Update geo rule
- `DELETE /api/cookies/geo-rules/:id` — Delete geo rule

**Model Functions:** `getGeoRules`, `createGeoRule`, `updateGeoRule`, `deleteGeoRule`

---

## IMPLEMENTATION CHECKLIST

For each feature area, implement in this order:

1. **Database Schema** — Add `CREATE TABLE IF NOT EXISTS` to `db.js` SCHEMA_DDL
2. **Model Functions** — Add CRUD functions to `src/models/index.js`
3. **API Routes** — Add GET/POST/PUT/DELETE routes to appropriate route file
4. **View Updates** — Update EJS template to fetch data via fetch() and render dynamically
5. **Test** — Start server, navigate to page, verify data loads and CRUD works

**Critical: All new API endpoints must:**
- Use parameterized queries (no SQL injection)
- Include tenantId isolation
- Log audit events via `models.logAuditEvent()`
- Return consistent JSON format: `{ success: boolean, data?: any, message: string, error?: string }`
- Handle errors with try/catch and proper HTTP status codes

---

## FILES TO MODIFY (Priority Order)

### Tier 1 — Data Management (DONE)
- [x] `backend/app/models/index.js` — Added `createDataAsset`, `getDataAssets`, `createDataTag`, `getDataTags`, `createWorkflow`, `getWorkflows`
- [x] `src/models/db.js` — Added `data_assets`, `data_tags`, `workflows` tables
- [x] `src/routes/discoveryRoutes.js` — Added asset/tag CRUD routes
- [x] `src/routes/privacyRoutes.js` — Added workflow CRUD route
- [x] `views/inventory-assets.ejs` — Added create button wiring
- [x] `views/inventory-tags.ejs` — Added create button wiring
- [x] `views/privacy-workflows.ejs` — Added create modal + AJAX submit
- [x] `views/inventory-asset-create.ejs` — **NEW** create form
- [x] `views/inventory-tag-create.ejs` — **NEW** create form

### Tier 2 — Governance (5 features)
- [ ] `src/models/index.js` — Add `getDataProcessors`, `createDataProcessor`, `updateDataProcessor`, `deleteDataProcessor`, etc.
- [ ] `src/models/db.js` — Add `data_processors`, `retention_policies`, `cross_border_transfers`, `compliance_evidence`, `security_controls` tables
- [ ] `src/routes/governanceRoutes.js` — Add all CRUD API routes
- [ ] `views/governance-processors.ejs` — Wire up fetch + CRUD
- [ ] `views/governance-retention.ejs` — Wire up fetch + CRUD
- [ ] `views/governance-cross-border.ejs` — Wire up fetch + CRUD
- [ ] `views/governance-evidence.ejs` — Wire up fetch + CRUD
- [ ] `views/governance-security.ejs` — Wire up fetch + CRUD

### Tier 3 — Assessment Automation (4 features)
- [ ] `src/models/index.js` — Add assessment model functions
- [ ] `src/models/db.js` — Add `assessments`, `assessment_templates`, `pia_dpia_assessments`, `assessment_settings` tables
- [ ] `src/routes/governanceRoutes.js` — Add assessment CRUD routes
- [ ] Views for all 4 assessment pages

### Tier 4 — Integrations (3 features)
- [ ] `src/models/index.js` — Add integration model functions
- [ ] `src/models/db.js` — Add `integrations`, `integration_hub`, `api_keys` tables
- [ ] `src/routes/integrationRoutes.js` — Add all CRUD routes
- [ ] Views for all 3 integration pages

### Tier 5 — Settings (6 features)
- [ ] `src/models/index.js` — Add settings model functions
- [ ] `src/models/db.js` — Add `tenant_settings`, `sso_settings`, `branding_settings`, `organization_settings`, `role_permissions`, `localization_settings` tables
- [ ] `src/routes/settingsRoutes.js` — Add all settings CRUD routes
- [ ] Views for all 6 settings pages

### Tier 6 — Consent Management (7 features)
- [ ] `src/models/index.js` — Add consent management model functions
- [ ] `src/models/db.js` — Add `consent_purposes`, `consent_preferences`, `consent_data_elements`, `consent_transactions`, `consent_policies`, `consent_portal_settings` tables
- [ ] `src/routes/consentRoutes.js` — Add all consent CRUD routes
- [ ] Views for all 7 consent pages

### Tier 7 — Cookie Management (6 features)
- [ ] `src/models/index.js` — Add cookie model functions
- [ ] `src/models/db.js` — Add `cookie_scan_results`, `cookie_consent_logs`, `cookie_banners`, `cookie_geo_rules` tables
- [ ] `src/routes/consentRoutes.js` — Add cookie CRUD routes (consentRoutes already exists)
- [ ] Views for all 6 cookie pages

---

## TESTING CHECKLIST

After implementing each feature:
1. [ ] Start server: `cd N:\chnayka\DPDP_Secure && npm start`
2. [ ] Navigate to the page: `http://localhost:3000/[route]`
3. [ ] Verify data loads (not empty)
4. [ ] Test create: Fill form, submit, verify item appears in list
5. [ ] Test edit: Click edit, modify, save, verify update
6. [ ] Test delete: Click delete, verify item removed
7. [ ] Check audit log: `/settings/audit-log` should show the action
8. [ ] Verify no console errors in browser DevTools

---

**Total Files to Modify:** ~25  
**Total New Files:** 3 (already created: inventory-asset-create.ejs, inventory-tag-create.ejs, privacy-workflow-create.ejs not needed since modal)  
**Estimated Effort:** 12-16 hours for a single developer
