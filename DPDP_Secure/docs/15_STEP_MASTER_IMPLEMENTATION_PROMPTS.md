# DPDP_Secure: Master 15-Prompt End-to-End Implementation Blueprint
## Complete System Transformation for Problem Statement LS-04: Personal Data in Informal Systems
### Srujana Tech Fest 2026 | Legal Services Track | Srujana Hackathon

---

## Master Architecture & Execution Rules
1. **Brand Identity Protection:** Strict and mandatory compliance. NEVER write, generate, or commit any legacy or deprecated brand names. Always and strictly use **`DPDP_Secure`** across all code, views, routes, headers, and documentation.
2. **Directory Isolation:** All work executes strictly inside the **`DPDP_Secure`** directory.
3. **Preserve & Elevate Existing Features:** Retain and enhance the existing 54 Express routes, 55 EJS templates, and custom CSS design system (`public/css/style.css`), adapting them into a unified, high-performance SME privacy management platform.
4. **100% Offline-First / Zero Cloud Egress Security:** All sensitive PII extraction, validation, and redaction must run locally within the Node.js runtime to prevent confidential SME data leaks.
5. **Open-Source LLM / API Flexibility:** Integrate local open-source LLMs (Ollama / Llama 3) with cloud API fallback (Groq / Gemini / OpenAI-compatible) for intelligent multilingual translation and privacy advisory.
6. **Vercel Production Readiness:** The final prompt (Prompt 15) must package the complete application for serverless deployment on Vercel with zero regressions.

---

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   THE 15-STEP MASTER IMPLEMENTATION ROADMAP                             │
├────────┬───────────────────────────────────────────────────────────────────────────────┤
│ PROMPT │ TITLE & SCOPE                                                                 │
├────────┼───────────────────────────────────────────────────────────────────────────────┤
│ 01     │ Core Architecture Harmonization, Directory Restructuring & Dependencies       │
│ 02     │ Enterprise-Grade Design System, Glassmorphic Theme & SME Dashboard UI         │
│ 03     │ Google OAuth 2.0 Integration & Session-Based Multi-Role RBAC                  │
│ 04     │ Local Persistence Layer (SQLite / Prisma) & SME Data Models                   │
│ 05     │ Pillar 1 Backend: Deterministic Indian PII Engine & Verhoeff Aadhaar Validator│
│ 06     │ Pillar 1 Backend: Informal Silo File Parsers (WhatsApp, Excel, Tally CSV)     │
│ 07     │ Pillar 1 Frontend: Interactive Silo Scanner UI & Automated RoPA Synthesis     │
│ 08     │ Open-Source LLM & AI API Integration Layer (Ollama / Groq / Gemini)           │
│ 09     │ Pillar 2: Section 5 Multilingual Notice Builder & 1-Click WhatsApp Opt-in     │
│ 10     │ Pillar 3: Citizen DSR Intake Portal & Section 11/12 Access Workflows          │
│ 11     │ Pillar 3: Statutory Collision Resolver (CGST 6-Yr Tax Lock vs. DPDP Erasure)  │
│ 12     │ Pillar 4: SME Breach Threat Modeling & Incident Triage Engine                 │
│ 13     │ Pillar 4: 72-Hour DPBI Regulatory Intimation Dossier & Plain Citizen Alerts   │
│ 14     │ Unified End-to-End Workflow Testing, Audit Trail & Live Hackathon Demo Seeder │
│ 15     │ Production Hardening, Serverless Packaging & Vercel Deployment                │
└────────┴───────────────────────────────────────────────────────────────────────────────┘
```

---

## PROMPT 01: Core Architecture Harmonization, Directory Restructuring & Dependencies

### Objective
Restructure `DPDP_Secure` into a clean, modular Model-View-Controller (MVC) and service-oriented Express architecture while maintaining backwards compatibility with all 54 existing routes and 55 EJS views. Install essential production dependencies and configure environment management.

### Exact Files to Modify / Create
* Modify: `package.json`
* Create: `.env.example`, `.env`
* Create: `src/config/appConfig.js`
* Create: `src/services/`, `src/controllers/`, `src/routes/`, `src/models/`, `src/utils/`, `src/middlewares/`
* Modify: `server.js` (refactor into modular route loaders)

### Implementation Prompt Specification
```markdown
You are an expert full-stack Node.js systems architect. Your task is to modernize and modularize the existing DPDP_Secure application without breaking any existing routes or views.

1. Package Configuration:
   Update `package.json` with the following production dependencies:
   - `express`: ^5.2.1
   - `ejs`: ^6.0.1
   - `dotenv`: ^16.4.5
   - `cors`: ^2.8.5
   - `cookie-parser`: ^1.4.7
   - `express-session`: ^1.18.0
   - `multer`: ^1.4.5-lts.1 (for local informal file uploads)
   - `helmet`: ^8.0.0 (security headers)
   - `uuid`: ^10.0.0
   - DevDependencies: `nodemon`: ^3.1.7

2. Directory Structure:
   Create a clean, layered modular structure:
   DPDP_Secure/
   ├── src/
   │   ├── config/          # Environment & constants
   │   ├── controllers/     # Request handlers for discovery, consent, DSR, incidents
   │   ├── middlewares/     # Auth, session, error handling, file upload validation
   │   ├── models/          # Data schemas and local database client
   │   ├── routes/          # Express router modules
   │   ├── services/        # PII detection, Verhoeff engine, LLM connector, tax-lock resolver
   │   └── utils/           # Helper functions, formatters, SHA-256 cert generators
   ├── public/              # Preserved vanilla CSS, JS, and icons
   ├── views/               # Preserved 55 EJS templates
   └── data/sample_data/    # Informal SME datasets (clinic chats, leads, invoices)

3. Refactor `server.js`:
   - Initialize security middlewares (helmet, cors, cookieParser, express-session).
   - Mount static asset serving from `public/`.
   - Configure EJS templating engine pointing to `views/`.
   - Organize router mounting:
     - `/auth/*` -> `src/routes/authRoutes.js`
     - `/discovery/*` & `/api/discovery/*` -> `src/routes/discoveryRoutes.js`
     - `/consent/*` & `/api/consent/*` -> `src/routes/consentRoutes.js`
     - `/privacy/*` & `/api/privacy/*` -> `src/routes/privacyRoutes.js`
     - `/incidents/*` & `/api/incidents/*` -> `src/routes/incidentRoutes.js`
     - Retain all legacy routes (`/inventory/*`, `/governance/*`, `/cookies/*`, `/settings/*`) to guarantee zero 404 regressions.
   - Implement a centralized error-handling middleware.

4. Brand & Security Verification:
   Ensure zero occurrences of deprecated legacy terms. Strictly maintain DPDP_Secure branding everywhere.
   Run `npm install` and verify `node server.js` starts cleanly on `http://localhost:3000` with HTTP 200 on `/`.
```

---

## PROMPT 02: Enterprise-Grade Design System, Glassmorphic Theme & SME Dashboard UI Overhaul

### Objective
Transform the user experience into an award-winning, sleek, dark-themed SaaS interface with glassmorphism, responsive navigation, micro-interactions, and an intuitive SME executive dashboard tailored for non-technical business owners.

### Exact Files to Modify / Create
* Modify: `public/css/style.css`
* Modify: `views/partials/header.ejs`
* Modify: `views/partials/footer.ejs`
* Modify: `views/index.ejs`

### Implementation Prompt Specification
```markdown
You are an elite frontend UI/UX engineer specializing in dark-themed enterprise dashboards and modern vanilla CSS.

1. Design Tokens & CSS Variables in `public/css/style.css`:
   Implement a cohesive, modern color palette:
   - Canvas Background: `#0b0f19` (Deep Obsidian / Midnight Slate)
   - Glass Card Surfaces: `rgba(17, 24, 39, 0.75)` with `backdrop-filter: blur(16px)` and border `1px solid rgba(255, 255, 255, 0.08)`
   - Brand Accent: `#3b82f6` (Vibrant Indigo/Blue) with gradient `#2563eb` -> `#1d4ed8`
   - Compliance Success: `#10b981` (Emerald Green)
   - Retention Lock / Warning: `#f59e0b` (Amber Gold)
   - Statutory Breach / Critical: `#ef4444` (Crimson Red)
   - Text Hierarchy: Primary `#f9fafb`, Secondary `#9ca3af`, Muted `#6b7280`
   - Modern Typography: System sans-serif stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) with crisp line heights and tracking.

2. Navigation Header & Sidebar (`views/partials/header.ejs`):
   - Refactor the sidebar navigation into 5 clean, logical groups:
     1. **Workspace Overview:** Executive Dashboard (`/`)
     2. **Pillar 1 - Data Discovery & RoPA:** Silo Scanner (`/discovery/connectors`), RoPA Register (`/inventory/ropa`), Assets (`/inventory/assets`)
     3. **Pillar 2 - Consent & Notices:** Multilingual Notices (`/consent/collection-points`), Consent Ledger (`/consent/ledger`), Purposes (`/consent/purposes`)
     4. **Pillar 3 - Citizen Rights & DSR:** Requests Queue (`/privacy/requests`), Rights Workflows (`/privacy/workflows`)
     5. **Pillar 4 - Breach Triage & DPBI:** Incident Management (`/incidents/management`), Breach Dashboard (`/incidents/dashboard`), Alerts (`/notifications/center`)
   - Add SME Tenant Badge: "Aarogya Diagnostic Center (Indiranagar, Bengaluru)" with a 1-click status pill "DPDP Ready: 84%".
   - Include a global Quick-Action bar (`Ctrl + K`) for instant navigation.

3. Executive SME Dashboard (`views/index.ejs`):
   - **Hero Metric Banner:**
     - Compliance Health Score: Large radial or progress gauge (e.g. 84/100, "Low Regulatory Risk").
     - Statutory Exposure Meter: Showing ₹0 potential penalty vs. unmitigated ₹250 Crore statutory risk.
   - **4 Pillar Command Cards:**
     - *Card 1 (Discovery):* 3 Informal Silos Connected (WhatsApp, Leads Sheet, Billing CSV), 1,420 Indian PII items tracked.
     - *Card 2 (Consent):* 3 Active Purpose Notices (English, Kannada, Hindi), 94.2% WhatsApp opt-in rate.
     - *Card 3 (DSR):* 1 Pending Erasure Request (Deepa Nair), 1 CGST Section 36 Tax Lock Active.
     - *Card 4 (Breach Preparedness):* 0 Active Breaches, 72-Hour DPBI Response Workflow Armed.
   - **Interactive Quick-Action Dock:**
     - Button: "Scan New Silo (WhatsApp / Excel)"
     - Button: "Send WhatsApp Consent Notice"
     - Button: "Resolve Erasure Request"
     - Button: "Triage Security Incident"

Ensure zero external CSS dependencies (pure vanilla CSS). Verify responsive layout on mobile, tablet, and desktop viewports.
```

---

## PROMPT 03: Google OAuth 2.0 Integration & Session-Based Multi-Role RBAC

### Objective
Implement a secure, modern Google OAuth 2.0 authentication flow and session-based Role-Based Access Control (RBAC) designed for SME staff and business owners, featuring a demo bypass toggle for instant hackathon evaluation.

### Exact Files to Modify / Create
* Create: `src/config/passport.js` (or lightweight OAuth client `src/services/authService.js`)
* Create: `src/middlewares/authMiddleware.js`
* Create: `src/routes/authRoutes.js`
* Create: `views/auth-login.ejs`
* Modify: `server.js`

### Implementation Prompt Specification
```markdown
You are a cybersecurity and web identity expert. Implement Google OAuth 2.0 authentication and session management in DPDP_Secure.

1. Authentication Architecture:
   - Use `google-auth-library` or `passport-google-oauth20` with `express-session`.
   - Support environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `CALLBACK_URL`.
   - Provide an instant "Demo / Quick Login" mode when OAuth credentials are not configured, enabling jury members to test all roles immediately without Google API keys.

2. Role-Based Access Control (RBAC):
   Define 4 SME tenant roles:
   - `SME_OWNER` (Full administrative authority, DSR execution, breach declaration, settings).
   - `COMPLIANCE_OFFICER` (RoPA review, consent management, DSR review, DPBI reporting).
   - `RECEPTION_STAFF` (View-only consent generator, WhatsApp notice sender, informal file scanner).
   - `AUDITOR` (Read-only access to immutable audit log, RoPA, and SHA-256 erasure certificates).

3. Routes in `src/routes/authRoutes.js`:
   - `GET /auth/login`: Renders modern dark-themed login screen (`views/auth-login.ejs`).
   - `GET /auth/google`: Initiates Google OAuth redirect.
   - `GET /auth/google/callback`: Handles OAuth response, extracts email, name, avatar, and creates/retrieves local user session.
   - `POST /auth/demo-login`: Instant one-click login selecting role (`SME_OWNER`, `RECEPTION_STAFF`, etc.).
   - `GET /auth/logout`: Clears session and redirects to `/auth/login`.

4. Login UI (`views/auth-login.ejs`):
   - Center card with subtle glassmorphic glow.
   - Official Google "Sign in with Google" SVG button.
   - "Hackathon Quick Evaluation Mode" role selector buttons with pre-filled demo accounts:
     - "Login as Ramesh Kumar (SME Owner)"
     - "Login as Priya Sharma (Receptionist)"
     - "Login as External Legal Auditor"
   - Tenant branding: "DPDP_Secure - India's Data Protection Engine for Small Businesses".

5. Middleware Enforcement:
   - `isAuthenticated`: Redirects unauthenticated users to `/auth/login`.
   - `hasRole([...roles])`: Restricts high-stakes routes (e.g. `/privacy/execute-erasure`, `/incidents/submit-dpbi`) to authorized roles.
   - Attach `req.user` to `res.locals` so user profile and role badge appear on the top header.
```

---

## PROMPT 04: Local Persistence Layer (SQLite / Prisma) & SME Data Models

### Objective
Create a zero-configuration, lightweight local database layer (SQLite via Prisma or `better-sqlite3`) to persist informal file discovery results, consent logs, DSR workflows, and audit trails without requiring external cloud database setup.

### Exact Files to Modify / Create
* Create: `prisma/schema.prisma` (or `src/models/db.js` using SQLite)
* Create: `src/models/seed.js`
* Create: `src/models/index.js`

### Implementation Prompt Specification
```markdown
You are a database engineer. Set up a lightweight, zero-configuration local SQLite persistence layer in DPDP_Secure that guarantees 100% offline-first security and rapid query performance.

1. Schema Definitions:
   - `Tenant`: id, businessName, businessType (Clinic, Retail, Service), gstNumber, address, dpoName, dpoEmail, createdAt.
   - `User`: id, tenantId, email, name, role, avatarUrl, provider (google/demo), createdAt.
   - `DataSilo`: id, tenantId, name, siloType (WHATSAPP, SPREADSHEET, GOOGLE_FORMS, BILLING_CSV), filePath, lastScannedAt, itemCount, riskLevel.
   - `PiiFinding`: id, siloId, entityName, piiType (AADHAAR, PAN, PHONE, EMAIL, UPI, CLINICAL_DATA), rawSampleMasked, lineNumber, confidenceScore, isRedacted.
   - `RoPARecord`: id, tenantId, activityName, dataCategories, legalBasis, retentionPeriod, storageLocation, encryptionStatus, processorsInvolved.
   - `ConsentNotice`: id, tenantId, title, purposeCode, language (EN, KN, HI), noticeText, version, isActive.
   - `ConsentEvent`: id, tenantId, dataPrincipalPhone, purposeCode, consentStatus (GRANTED, WITHDRAWN), channel (WHATSAPP, WEB, PAPER), timestamp, hashProof.
   - `PrivacyRequest`: id, tenantId, ticketNumber, principalName, principalPhone, requestType (ACCESS, ERASURE, CORRECTION), status (PENDING, TAX_LOCKED, COMPLETED), requestDate, resolutionDate, certHash.
   - `Incident`: id, tenantId, incidentTitle, scenarioType (LOST_PHONE, MISDIRECTED_CHAT, RANSOMWARE), riskLevel (CRITICAL, HIGH, MEDIUM), affectedCount, reportedToDpbi, citizenAlertSent, createdAt.
   - `AuditLog`: id, tenantId, userId, action, resource, detailsJson, timestamp, ipAddress.

2. Database Client & Helper:
   - Initialize the SQLite database in `data/dpdp_secure.db`.
   - Provide clean async repository functions: `getSilos()`, `saveFindings()`, `getRoPA()`, `logConsent()`, `getDSRs()`, `logAudit()`.

3. Seeding Script (`src/models/seed.js`):
   - Seed `Tenant`: "Aarogya Diagnostic Center", GST: "29AAAAA0000A1Z5", Owner: "Ramesh Kumar".
   - Seed the 3 informal silos corresponding to `data/sample_data/`:
     - `clinic_reception_chat.txt` (WhatsApp chat backup)
     - `customer_leads.csv` (Lead spreadsheet)
     - `invoices_billing.csv` (Billing system export)
   - Add initial DSR for "Deepa Nair" requesting erasure under Section 12.
   - Add npm script: `"seed": "node src/models/seed.js"`.
```

---

## PROMPT 05: Pillar 1 Backend — Deterministic Indian PII Engine & Verhoeff Aadhaar Validator

### Objective
Build a specialized, zero-hallucination Indian PII detection and validation engine in Node.js that accurately extracts Indian identity markers and sensitive health data while avoiding false positives.

### Exact Files to Modify / Create
* Create: `src/services/verhoeffAlgorithm.js`
* Create: `src/services/indianPiiEngine.js`
* Create: `tests/piiEngine.test.js`

### Implementation Prompt Specification
```markdown
You are a senior cryptography and data parsing engineer. Build a high-performance, deterministic Indian PII detection engine in Node.js.

1. Verhoeff Dihedral Group $D_5$ Algorithm (`src/services/verhoeffAlgorithm.js`):
   Implement the exact multiplication table ($d$), permutation table ($p$), and inverse table ($inv$) for the dihedral group $D_5$:
   - `validateVerhoeff(str)`: Returns true if the checksum digit of the 12-digit string satisfies $\sum_{i=0}^{n-1} d(c, p(i \bmod 8, digit)) = 0$.
   - Must reject random 12-digit barcodes, tracking numbers, or order IDs that fail the Verhoeff checksum.

2. Comprehensive Indian PII Detection Rules (`src/services/indianPiiEngine.js`):
   Implement `scanTextForPii(text, contextMetadata)` returning an array of matched entities:
   - **Aadhaar Number:**
     - Regex: `\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b`
     - Must exclude numbers starting with 0 or 1.
     - Must pass `validateVerhoeff(normalizedAadhaar)`.
     - Sensitivity: `CRITICAL`.
   - **Permanent Account Number (PAN):**
     - Regex: `\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b`
     - Entity validation: Check 4th character. If `'P'`, flag as `INDIVIDUAL_PAN` (Personal Data). If `'C'`, `'F'`, `'H'`, `'T'`, flag as `ENTITY_PAN` (Corporate / Non-Personal Data).
     - Sensitivity: `HIGH` for Individual, `LOW` for Corporate.
   - **Indian Mobile Numbers:**
     - Regex: `\b(?:\+91[-\s]?|0)?[6-9]\d{9}\b`
     - Sensitivity: `MEDIUM`.
   - **UPI Virtual Payment Address (VPA):**
     - Regex: `\b[a-zA-Z0-9.\-_]{2,256}@(okhdfcbank|oksbi|okicici|okaxis|paytm|ybl|upi)\b`
     - Sensitivity: `HIGH`.
   - **Clinical / Health PII Lexicon:**
     - Match diagnostic and clinical terms: `Prescription`, `Diagnosis`, `Blood Sugar`, `HbA1c`, `Biopsy`, `Thyroid`, `TSH`, `Ultrasound`, `ECG`, `HIV`, `Chemotherapy`, `Oncology`.
     - Sensitivity: `CRITICAL` (Health Data under Section 2(t) / special processing safeguards).
   - **Email Addresses:** Standard RFC 5322 regex.

3. Sanitization & Masking:
   - Implement `maskPii(value, piiType)`:
     - Aadhaar: `XXXX-XXXX-1234`
     - PAN: `XXXXX1234F`
     - Phone: `+91 98XXXXXX45`

4. Unit Tests (`tests/piiEngine.test.js`):
   - Test with valid Aadhaar `3421 8901 2345` (Pass) vs. invalid Aadhaar `1234 5678 9012` (Fail).
   - Test individual PAN `ABCDE1234F` (Personal) vs company PAN `ABCDE1234C` (Corporate).
   - Verify zero false positives on standard 10-digit invoice numbers or 12-digit transaction hashes.
```

---

## PROMPT 06: Pillar 1 Backend — Informal Silo File Parsers & Upload Pipeline

### Objective
Create robust file ingestion and parsing pipelines for unstructured and informal SME formats: WhatsApp chat exports, nested Excel spreadsheets, and billing CSVs.

### Exact Files to Modify / Create
* Create: `src/services/fileParsers.js`
* Create: `src/controllers/discoveryController.js`
* Create: `src/routes/discoveryRoutes.js`
* Modify: `server.js`

### Implementation Prompt Specification
```markdown
You are a backend data integration specialist. Build file ingestion and parsing services for informal SME data repositories in DPDP_Secure.

1. Informal Silo Parsers (`src/services/fileParsers.js`):
   - **WhatsApp Chat Parser (`parseWhatsAppChat(content)`):**
     - Supports both iOS and Android text export formats:
       - `[DD/MM/YY, HH:MM:SS AM/PM] Sender: Message`
       - `DD/MM/YYYY, HH:MM - Sender: Message`
     - Splits chat lines into structured objects: `{ timestamp, sender, message, lineNumber }`.
     - Runs each message through `indianPiiEngine.js`.
     - Detects attached media references (e.g. `prescription.pdf (file attached)`, `<Media omitted>`).
   - **Spreadsheet / CSV Parser (`parseCsvOrExcel(buffer, filename)`):**
     - Parses CSV or Excel rows.
     - Preserves cell line numbers and column headers.
     - **Formula-Injection Shield:** Neutralizes any cell beginning with `=`, `+`, `-`, or `@` to prevent execution attacks when opening exported audit sheets.
     - Scans each column and cell against `indianPiiEngine.js`.

2. Controller & Routes (`src/controllers/discoveryController.js`, `src/routes/discoveryRoutes.js`):
   - `POST /api/discovery/upload`: Accepts file upload via `multer` (stores in `data/uploads/` with temporary retention).
   - `POST /api/discovery/scan-sample`: Instant scan of the pre-staged sample files in `data/sample_data/`:
     - `clinic_reception_chat.txt`
     - `customer_leads.csv`
     - `invoices_billing.csv`
   - `GET /api/discovery/findings`: Returns aggregated PII findings grouped by silo, sensitivity tier, and category.
   - `GET /api/discovery/ropa`: Returns auto-generated Record of Processing Activities derived from discovered findings.

3. Performance & Safety:
   - Ensure streaming or chunked processing so large 10,000-line chat exports do not block the Node.js event loop.
   - Mask raw values in API responses by default (never return unmasked Aadhaar over the API).
```

---

## PROMPT 07: Pillar 1 Frontend — Interactive Silo Scanner UI & Automated RoPA Synthesis

### Objective
Rebuild `views/discovery-connectors.ejs` and `views/inventory-ropa.ejs` into an intuitive discovery studio where an SME owner can drag and drop informal files, view real-time scanning progress, and explore an auto-synthesized RoPA register.

### Exact Files to Modify / Create
* Modify: `views/discovery-connectors.ejs`
* Modify: `views/inventory-ropa.ejs`
* Create: `public/js/discoveryScanner.js`

### Implementation Prompt Specification
```markdown
You are a frontend UI engineer specializing in data visualization. Build the interactive Data Discovery Studio for DPDP_Secure.

1. Discovery Studio UI (`views/discovery-connectors.ejs`):
   - **Upload & Connector Panel:**
     - Drag-and-drop zone supporting `.txt` (WhatsApp), `.csv`, `.xlsx` (Excel), and `.json`.
     - Quick-Action Demo Button: "Scan Pre-Loaded Aarogya Clinic Files" (1-click trigger for judges).
     - Connector cards for: WhatsApp Business Backup, Desktop Spreadsheets, Google Forms Ingestion, Tally/Billing Export.
   - **Live Progress & Threat Radar:**
     - Animated progress bar during scan execution.
     - Real-time counters: Total Files Scanned, Total Personal Records Discovered, Critical Health Findings, Validated Aadhaar Cards.
   - **Interactive Findings Table:**
     - Columns: File Source, Extracted Entity, PII Category (Badge: Aadhaar, PAN, Health, Phone), Masked Value, Validation Proof (e.g. "Verhoeff $D_5$ Verified"), Risk Tier (Critical/High/Medium), Action (Redact / Link to RoPA).
     - Filter tabs: "All (1,420)", "Critical Health (42)", "Aadhaar / KYC (128)", "Financial / UPI (85)".

2. Auto-Synthesized RoPA View (`views/inventory-ropa.ejs`):
   - Display the statutory **Record of Processing Activities (RoPA)** under Section 8(4):
     - Table columns: Processing Activity, Personal Data Categories, Purpose of Processing, Legal Basis (Section 4/Section 6), Storage Location, Retention Period, Security Safeguards.
   - Banner: "Auto-generated from informal silo discovery scan. Fully compliant with DPDP Act 2023 Section 8(4)."
   - Export Options: "Download Signed RoPA PDF" and "Export Excel RoPA".

3. Client-Side Script (`public/js/discoveryScanner.js`):
   - Handle AJAX submission to `/api/discovery/scan-sample` and `/api/discovery/upload`.
   - Animate the counter tickers and populate tables dynamically without full page refresh.
```

---

## PROMPT 08: Open-Source LLM & AI API Integration Layer (Ollama / Groq / Gemini)

### Objective
Build a modular AI integration service supporting local open-source LLMs (Ollama Llama 3 / Mistral) for 100% offline-first confidentiality, with fallback to cloud AI APIs (Groq, Gemini, or OpenAI-compatible) for multilingual translation, semantic PII extraction, and SME privacy advisory.

### Exact Files to Modify / Create
* Create: `src/services/aiService.js`
* Create: `src/controllers/aiAssistantController.js`
* Create: `src/routes/aiRoutes.js`
* Create: `views/partials/ai-assistant-modal.ejs`

### Implementation Prompt Specification
```markdown
You are an applied AI engineer. Build a flexible, multi-provider AI integration layer for DPDP_Secure that works both fully offline and via cloud APIs.

1. Provider Architecture in `src/services/aiService.js`:
   Implement a unified interface supporting multiple backends based on environment configuration (`AI_PROVIDER` = `ollama` | `groq` | `gemini` | `mock`):
   - **Local Open-Source LLM (Ollama):** Endpoint `http://localhost:11434/api/generate` with model `llama3:8b` or `mistral`. Ensures 100% data privacy with zero data leaving the SME premise.
   - **Fast Cloud LLM (Groq / Gemini):** Uses ultra-fast API endpoints when external connectivity is available.
   - **Deterministic Fallback (Mock/Rule-based):** Built-in deterministic statutory responses so the application functions with zero external dependencies during offline evaluations.

2. AI Capabilities & Task Prompts:
   - **Task 1: Multilingual Section 5 Notice Translation:**
     Translates legal notice items into 22 Eighth Schedule languages (focusing on Kannada `ಕನ್ನಡ` and Hindi `हिन्दी`), maintaining precise legal definitions of "withdrawal", "purpose", and "grievance redressal".
   - **Task 2: Breach Severity & Risk Assessor:**
     Analyzes incident details (e.g. "Reception phone lost with 200 patient WhatsApp lab reports") and calculates risk tier under DPDP Rules, 2025 Rule 7, detailing impact on confidentiality, likelihood of harm, and mandatory DPBI intimation criteria.
   - **Task 3: Interactive SME Privacy Assistant:**
     Conversational assistant embedded in the dashboard helping non-technical SME owners answer daily compliance questions (e.g., "Can I send lab reports over WhatsApp under DPDP?", "How long must I store customer bills?").

3. Endpoints & UI Component:
   - `POST /api/ai/chat`: Handles conversational queries from the dashboard modal.
   - `POST /api/ai/translate-notice`: Translates purpose notice into Kannada or Hindi.
   - `POST /api/ai/assess-breach`: Evaluates incident narrative and returns structured risk parameters.
   - Component: Floating "DPDP AI Assistant" icon on the bottom right of all views opening `views/partials/ai-assistant-modal.ejs`.
```

---

## PROMPT 09: Pillar 2: Section 5 Multilingual Notice Builder & 1-Click WhatsApp Opt-in

### Objective
Implement the complete Section 5 Notice and Section 6 Consent lifecycle in `DPDP_Secure`, enabling small business owners to generate itemised notices in English, Kannada, and Hindi, dispatch them via WhatsApp with one click, and track responses in an immutable consent ledger.

### Exact Files to Modify / Create
* Modify: `views/consent-collectionpoints.ejs`
* Modify: `views/consent-ledger.ejs`
* Create: `src/controllers/consentController.js`
* Create: `src/routes/consentRoutes.js`
* Create: `public/js/consentManager.js`

### Implementation Prompt Specification
```markdown
You are a legal-tech developer. Build the Consent and Purpose Management Suite for DPDP_Secure according to Section 5 and Section 6 of the DPDP Act, 2023.

1. Pre-Packaged SME Purpose Templates:
   Provide pre-configured notice configurations for typical small businesses:
   - **Diagnostic Polyclinic:** Patient Booking, Diagnostic Reporting, Critical Value Alerts, Prescription Delivery.
   - **Retail & E-Commerce:** Order Processing, Invoicing & Delivery Tracking, Warranty & Customer Support.
   - **Professional Services:** Client Onboarding, Tax Filing, Document Archival.

2. Multilingual Notice Builder (`views/consent-collectionpoints.ejs`):
   - Notice generator displaying required Section 5 elements:
     - Exact personal data items requested (Phone, Name, Address, Health symptoms).
     - Specified purpose of processing.
     - Method of consent withdrawal under Section 6(4).
     - Data Protection Officer / Grievance Redressal contact details.
   - Instant language selector tabs:
     - **English**
     - **Kannada (`ಕನ್ನಡ`):** "ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಡೇಟಾ ರಕ್ಷಣೆ ಸೂಚನೆ (DPDP ಕಾಯ್ದೆ 2023)"
     - **Hindi (`हिन्दी`):** "डिजिटल व्यक्तिगत डेटा संरक्षण सूचना (DPDP अधिनियम 2023)"
   - Toggle options for granular opt-in (separate consent for diagnostic reporting vs. promotional offers).

3. 1-Click WhatsApp Consent Flow:
   - Generate instant click-to-chat WhatsApp link: `https://wa.me/?text=[ENCODED_NOTICE_TEXT]`.
   - Pre-formatted WhatsApp message body:
     ```
     *Aarogya Diagnostic Center - Privacy Notice*
     Dear Patient, under the DPDP Act 2023, we collect your Name, Mobile, and Test Details solely for delivering your lab reports.
     • Data Stored Securely on Local Clinic Server
     • No Third-Party Sharing Without Consent
     • You may withdraw consent anytime by replying 'STOP'.
     Reply *YES* to consent to receive your reports via WhatsApp.
     ```
   - Simulation button: "Simulate Patient WhatsApp Reply 'YES'".

4. Immutable Consent Event Ledger (`views/consent-ledger.ejs`):
   - Records each consent capture event:
     - Timestamp, Data Principal Identifier (Phone/Email), Purpose Code, Consent State (`ACTIVE`, `WITHDRAWN`), Capture Channel (`WhatsApp Business`, `Web Form`, `Paper Intake`), Cryptographic SHA-256 Hash.
   - Action: "Withdraw Consent" button demonstrating immediate status flip and audit entry.
```

---

## PROMPT 10: Pillar 3: Citizen DSR Intake Portal & Section 11/12 Access Workflows

### Objective
Build the Data Subject Rights (DSR) management subsystem in `DPDP_Secure`, supporting Data Principal requests for Access (Section 11) and Correction/Erasure (Section 12), with identity verification and automated silo discovery.

### Exact Files to Modify / Create
* Modify: `views/privacy-requests.ejs`
* Modify: `views/privacy-workflows.ejs`
* Create: `src/controllers/privacyController.js`
* Create: `src/routes/privacyRoutes.js`
* Create: `views/public-dsr-portal.ejs`

### Implementation Prompt Specification
```markdown
You are a full-stack engineer. Implement the Data Principal Rights (DSR) intake and resolution system in DPDP_Secure complying with Section 11 and Section 12 of the DPDP Act, 2023.

1. Public Citizen Rights Intake Screen (`views/public-dsr-portal.ejs`):
   - Clean, accessible external form where a customer, patient, or employee can submit:
     - Full Name, Registered Mobile Number, Email Address.
     - Request Type:
       - Section 11: Right to Access Summary of Personal Data & Processing Activities.
       - Section 12: Right to Correction & Updating.
       - Section 12: Right to Erasure of Personal Data.
       - Section 13: Right of Grievance Redressal.
     - Simulated OTP verification step to verify the identity of the Data Principal before processing.

2. Admin DSR Queue & Workflow (`views/privacy-requests.ejs`, `views/privacy-workflows.ejs`):
   - Ticket list with status pills: `New Intake`, `Identity Verified`, `Silos Scanned`, `Tax Collision Evaluated`, `Resolved`, `Certificate Issued`.
   - Pre-loaded live hackathon ticket:
     - Ticket: `DSR-2026-8819`
     - Principal: `Deepa Nair`
     - Request: `Complete Erasure of Personal Data (Section 12)`
     - Status: `Awaiting Statutory Tax-Lock Review`
   - Detailed Request Drawer showing all files where Deepa Nair's data exists:
     1. `clinic_reception_chat.txt` (Line 14: Mobile + Prescription query)
     2. `customer_leads.csv` (Row 5: Aadhaar, PAN, Corp Email)
     3. `invoices_billing.csv` (Invoice `INV-2024-309`: Rs. 12,000 + GSTIN)

3. Section 11 Access Summary Generator:
   - 1-Click button: "Generate Section 11 Data Summary PDF".
   - Produces a clean summary report listing all personal data held, processing purposes, and third parties with whom data was shared.
```

---

## PROMPT 11: Pillar 3: Statutory Collision Resolver (CGST 6-Yr Tax Lock vs. DPDP Erasure)

### Objective
Implement the signature legal-tech breakthrough in `DPDP_Secure`: an automated Dual-Track Statutory Collision Resolver that harmonizes the DPDP Act Section 12 right to erasure with the Central Goods and Services Tax (CGST) Act, 2017 Section 36 mandatory 6-year retention lock.

### Exact Files to Modify / Create
* Create: `src/services/statutoryCollisionResolver.js`
* Modify: `src/controllers/privacyController.js`
* Create: `src/services/certificateGenerator.js`
* Modify: `views/privacy-requests.ejs`

### Implementation Prompt Specification
```markdown
You are a legal-tech algorithms architect specializing in statutory harmonization. Build the Statutory Collision Resolver in DPDP_Secure.

1. The Statutory Dilemma:
   - **DPDP Act, 2023 Section 12(3):** Data Principal has the right to erasure of personal data that is no longer necessary for the purpose for which it was processed.
   - **CGST Act, 2017 Section 36:** Every registered taxpayer must maintain books of account and invoices for **72 months (6 years)** from the due date of furnishing of the annual return. Deleting billing records exposes the SME to tax penalties and prosecution.
   - **DPDP Act, 2023 Section 8(7):** Explicitly permits retaining personal data if retention is necessary for compliance with any law for the time being in force.

2. The Dual-Track Execution Engine (`src/services/statutoryCollisionResolver.js`):
   Implement `executeSmartErasure(ticketId, principalIdentifier)`:
   - **Track A: Informal Silos (WhatsApp Chats, Google Forms, Lead Spreadsheets):**
     - Immediate full redaction.
     - Replace sensitive strings (Aadhaar, phone, home address, medical symptoms) with `[REDACTED-DPDP-SEC-12]`.
     - Neutralize formula injection risks in spreadsheets.
   - **Track B: Financial & Tax Invoices (`invoices_billing.csv`):**
     - Calculate invoice age against current statutory date (threshold: 72 months / 6 years).
     - **Case 1 (Invoice > 6 Years Old, e.g. `INV-2017-001`):**
       Status: `STATUTORY_RETENTION_EXPIRED`. Full erasure permitted and executed.
     - **Case 2 (Invoice < 6 Years Old, e.g. `INV-2024-309` for Deepa Nair):**
       Status: `MANDATORY_TAX_RETENTION_ACTIVE`.
       Apply **Pseudonymization & Statutory Lock**:
       - Retain GSTIN, invoice amount, tax line items, and invoice number until statutory expiry date (`2030-12-31`).
       - Mask personal phone number and personal notes.
       - Attach statutory justification tag citing `CGST Act, 2017 Section 36 read with DPDP Act, 2023 Section 8(7)`.

3. SHA-256 Tamper-Proof Erasure Certificate (`src/services/certificateGenerator.js`):
   Generate a cryptographic compliance certificate:
   - Certificate ID, Data Principal ID, Timestamp.
   - Detailed audit breakdown: Informal records erased (Count: 2), Invoices preserved under CGST Section 36 (Count: 1).
   - SHA-256 digital fingerprint of the action, verifiable by regulatory auditors.
   - Downloadable in printable HTML/PDF format.

4. UI Feedback in `views/privacy-requests.ejs`:
   - Interactive modal displaying the side-by-side comparison before and after erasure execution.
   - Amber alert badge: "Statutory Tax Lock Activated on Invoice INV-2024-309 (Protected under CGST Act Section 36 until 2030-12-31)".
   - Green success badge: "WhatsApp and Lead Records Erased Permanently".
```

---

## PROMPT 12: Pillar 4: SME Breach Threat Modeling & Incident Triage Engine

### Objective
Build the incident management and threat triage engine in `DPDP_Secure` tailored to informal SME breach scenarios, calculating statutory risk parameters under DPDP Rules, 2025 (Rule 7).

### Exact Files to Modify / Create
* Modify: `views/incidents-dashboard.ejs`
* Modify: `views/incidents-management.ejs`
* Create: `src/controllers/incidentController.js`
* Create: `src/routes/incidentRoutes.js`
* Create: `src/services/breachRiskCalculator.js`

### Implementation Prompt Specification
```markdown
You are an incident response and cybersecurity specialist. Implement the Breach Triage and Incident Management module in DPDP_Secure.

1. Pre-Configured SME Threat Scenario Templates:
   In `views/incidents-management.ejs`, provide one-click simulations for common informal SME breach vectors:
   - **Scenario 1: Lost Receptionist Smartphone (Critical Risk):**
     Unencrypted Android smartphone lost at public transit stop. Contains 250+ unencrypted WhatsApp patient chats, Aadhaar card photos, and diagnostic test requisitions.
   - **Scenario 2: Misdirected WhatsApp Diagnostic Report (High Risk):**
     Receptionist accidentally dispatched a patient's confidential biopsy report to an incorrect WhatsApp mobile number.
   - **Scenario 3: Compromised Desktop Billing Computer (Medium Risk):**
     Ransomware infection detected on front-desk PC running Tally. Local backup accessible, no external exfiltration confirmed.

2. Statutory Risk & Severity Calculator (`src/services/breachRiskCalculator.js`):
   Evaluates incidents under DPDP Act Section 8(6) and DPDP Rules, 2025 (Rule 7):
   - **Parameters:** Data Categories Impacted (Identity, Financial, Health/Clinical), Volume of Affected Principals, Breach Vector, Safeguards in Place (Encryption / Pin lock).
   - **Output:**
     - Severity Score (1 to 100) and Tier (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
     - **Mandatory Intimation Flag:** Determines if statutory intimation to the Data Protection Board of India (DPBI) is mandatory (Threshold: High/Critical severity or health/financial data).
     - **Countdown Clock:** 72-hour statutory notification countdown timer from time of incident discovery.

3. Interactive Incident Management UI (`views/incidents-management.ejs`):
   - "Declare Incident" button with modal wizard:
     - Step 1: Select Incident Scenario or enter custom title.
     - Step 2: Select impacted informal silos.
     - Step 3: Automated PII exposure quantification.
     - Step 4: Instant Risk Evaluation & Action Plan.
   - Timeline tracker: Discovery -> Containment -> DPBI Filing -> Citizen Notification -> Post-Incident Review.
```

---

## PROMPT 13: Pillar 4: 72-Hour DPBI Regulatory Intimation Dossier & Plain Citizen Alerts

### Objective
Implement the automated dual-notification generation engine in `DPDP_Secure`: generating the formal 72-hour regulatory dossier for the Data Protection Board of India (DPBI) and multi-channel plain-language alerts for affected individuals in regional languages.

### Exact Files to Modify / Create
* Create: `src/services/dossierGenerator.js`
* Create: `views/dpbi-dossier-print.ejs`
* Modify: `views/incidents-management.ejs`
* Modify: `views/notifications-center.ejs`

### Implementation Prompt Specification
```markdown
You are a regulatory compliance and legal communications expert. Build the dual-notification breach reporting engine in DPDP_Secure.

1. Statutory Requirement:
   Under DPDP Act Section 8(6) read with DPDP Rules, 2025 (Rule 7), in the event of a personal data breach, the Data Fiduciary must intimate:
   1. The **Data Protection Board of India (DPBI)** within **72 hours** of becoming aware.
   2. Each **affected Data Principal** in plain, understandable language.

2. 72-Hour DPBI Regulatory Intimation Dossier (`src/services/dossierGenerator.js`):
   Generate a formal, publication-ready regulatory dossier containing:
   - **Form DPBI-IR1:** Initial Incident Report.
   - Entity Details: Aarogya Diagnostic Center (Registration, GSTIN, DPO Contact).
   - Nature & Chronology of Incident: Exact timestamps of breach occurrence and discovery.
   - Scope of Exposure: Categories of personal data (Aadhaar, clinical health data, mobile numbers) and estimated headcount (250 patients).
   - Technical Assessment: Impact on confidentiality, integrity, and availability.
   - Immediate Remedial Measures Taken: Remote wipe triggered via Google Find My Device, WhatsApp Business sessions revoked, affected patients contacted.
   - Export Options: "Print Official DPBI Dossier" and "Export Signed PDF".

3. Plain-Language Citizen Alerts in Regional Languages:
   Generate ready-to-dispatch SMS and WhatsApp notices that explain the event without triggering undue panic:
   - **English:**
     "Dear Aarogya Clinic Patient, we are writing to inform you that a clinic reception phone was reported lost on [Date]. Your name and test booking record may have been stored on the device. We have immediately locked the device remotely and notified authorities. As a safety measure, please ignore any suspicious payment requests claiming to be from our clinic. For queries, contact our DPO at privacy@aarogyaclinic.in."
   - **Kannada (`ಕನ್ನಡ`):**
     "ಆರೋಗ್ಯ ಕ್ಲಿನಿಕ್ ರೋಗಿಗಳಿಗೆ ಪ್ರಮುಖ ಸೂಚನೆ: ನಮ್ಮ ಕ್ಲಿನಿಕ್‌ನ ರಿಸೆಪ್ಷನ್ ಮೊಬೈಲ್ ಕಳೆದುಹೋಗಿದ್ದು, ಸುರಕ್ಷತಾ ಕ್ರಮವಾಗಿ ಅದನ್ನು ತಕ್ಷಣ ದೂರದಿಂದಲೇ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ..."
   - **Hindi (`हिन्दी`):**
     "आरोग्य क्लिनिक के सम्मानित मरीज, आपको सूचित किया जाता है कि क्लिनिक का एक रिसेप्शन फोन खो गया था, जिसे तुरंत ब्लॉक कर दिया गया है..."
   - Multi-channel dispatch integration in `views/notifications-center.ejs` with simulated bulk send progress.
```

---

## PROMPT 14: Unified End-to-End Workflow Testing, Audit Trail & Live Hackathon Demo Seeder

### Objective
Implement a comprehensive end-to-end integration test suite, tamper-evident tenant audit trail, and an automated demo seeding command (`npm run seed:demo`) that sets up the entire application for a flawless 15-minute live hackathon presentation.

### Exact Files to Modify / Create
* Create: `src/models/demoSeeder.js`
* Create: `tests/e2eWorkflow.test.js`
* Modify: `views/settings-audit-log.ejs`
* Create: `package.json` (add `"seed:demo"`, `"test:e2e"`)
* Modify: `views/index.ejs` (add 1-click "Reset & Run Hackathon Demo" button)

### Implementation Prompt Specification
```markdown
You are a senior QA engineer and hackathon demo director. Prepare DPDP_Secure for flawless, end-to-end evaluation.

1. Automated Demo Seeding Script (`src/models/demoSeeder.js`):
   - Command: `npm run seed:demo`
   - Pre-populates the database with:
     - Tenant: "Aarogya Diagnostic Center (Indiranagar, Bengaluru)".
     - Discovered Silos: WhatsApp chat (`clinic_reception_chat.txt`), Leads spreadsheet (`customer_leads.csv`), Invoices (`invoices_billing.csv`).
     - 1,420 Indian PII items categorized (Aadhaar, PAN, Health, UPI).
     - Active Multilingual Notices in English, Kannada, and Hindi.
     - Live DSR Ticket: Deepa Nair erasure request with active CGST Section 36 6-year tax lock.
     - Triaged Breach Incident: "Lost Receptionist Android Phone" with ready-to-print 72-Hour DPBI Dossier.

2. Tamper-Evident Audit Log (`views/settings-audit-log.ejs`):
   - Displays chronological, immutable ledger of all operations:
     - Silo scans, PII discoveries, consent creations, WhatsApp opt-ins, DSR executions, CGST tax locks applied, breach declarations, DPBI filings.
   - Includes timestamp, actor, IP address, and SHA-256 integrity hash for each row.

3. Automated Integration Test Suite (`tests/e2eWorkflow.test.js`):
   - Test 1: Verhoeff algorithm validates valid Aadhaar and rejects invalid order IDs.
   - Test 2: File parsers extract 100% of PII from WhatsApp chat and spreadsheet files.
   - Test 3: Consent generator correctly outputs multilingual notices and valid WhatsApp URLs.
   - Test 4: Erasure workflow correctly redacts WhatsApp chats while preserving CGST Section 36 billing records.
   - Test 5: Breach calculator correctly identifies high-risk health data and enforces 72-hour DPBI reporting.
   - Run tests with `npm run test:e2e` and verify all tests pass with 100% assertions green.

4. 1-Click Quick Demo Reset Button:
   - Add a subtle, prominent header button on the dashboard: "⚡ Instant Hackathon Demo Mode".
   - Clicking this automatically triggers `seed:demo` via API and refreshes the view to the start of the 15-minute presentation script.
```

---

## PROMPT 15: Production Hardening, Serverless Packaging & Vercel Deployment

### Objective
Prepare `DPDP_Secure` for production deployment on Vercel as a high-performance, serverless Node.js / Express application with zero build errors, secure environment configuration, and global CDN asset delivery.

### Exact Files to Modify / Create
* Create: `vercel.json`
* Create: `api/index.js` (Serverless Express wrapper)
* Modify: `package.json` (Vercel build scripts)
* Create: `DEPLOYMENT.md`
* Create: `.vercelignore`

### Implementation Prompt Specification
```markdown
You are a DevOps and cloud deployment engineer specializing in Vercel and serverless Node.js architectures. Package DPDP_Secure for seamless production deployment on Vercel.

1. Serverless Adapter (`api/index.js`):
   - Create the serverless entrypoint for Vercel:
     ```javascript
     const app = require('../server.js');
     module.exports = app;
     ```
   - In `server.js`, export the `app` instance using `module.exports = app;` while keeping `if (require.main === module) { app.listen(PORT, ...); }` so local `node server.js` runs identically.

2. Vercel Configuration (`vercel.json`):
   Configure serverless routes and static asset optimization:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/index.js",
         "use": "@vercel/node"
       },
       {
         "src": "public/**",
         "use": "@vercel/static"
       }
     ],
     "routes": [
       {
         "src": "/css/(.*)",
         "dest": "/public/css/$1"
       },
       {
         "src": "/js/(.*)",
         "dest": "/public/js/$1"
       },
       {
         "src": "/(.*)",
         "dest": "/api/index.js"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. Database & Storage in Serverless Environment:
   - Ensure the SQLite or local memory adapter detects read-only filesystem environments (Vercel `/tmp` directory handling).
   - If deploying with serverless SQLite, point database file to `/tmp/dpdp_secure.db` or initialize in-memory store with sample data automatically seeded on cold start.
   - Fallback graceful degradation: If external database is unavailable, serve seeded demo data so all 54 routes and views render perfectly with 200 OK.

4. Security & Production Hardening:
   - Enable HTTP Strict Transport Security (HSTS), X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN.
   - Configure `.vercelignore`:
     ```
     .git
     .env
     node_modules
     tests
     privacy_related
     ```

5. Step-by-Step Vercel Deployment Guide (`DEPLOYMENT.md`):
   - Command-line deployment:
     ```bash
     npm install -g vercel
     vercel login
     vercel --prod
     ```
   - Environment variables setup on Vercel Dashboard:
     - `SESSION_SECRET`
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `AI_PROVIDER` (mock / groq / gemini)
     - `AI_API_KEY`
   - Verification checklist:
     - Access `https://dpdp-secure.vercel.app`
     - Verify homepage renders with HTTP 200
     - Verify all 4 pillar views render cleanly
     - Test demo login and sample file scanning.
```

---

## Brand & Safety Verification Checklist

Before running any prompt, verify the following strict rules:
* [x] Zero occurrences of legacy forbidden brand names across all code, views, routes, headers, and documentation.
* [x] All paths and edits are strictly localized within `DPDP_Secure/`.
* [x] No changes are pushed to remote Git repositories without explicit user instruction.
* [x] 100% offline-first local compute fallback is preserved.
