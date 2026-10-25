# PROMPT 07: Pillar 1 Frontend & Backend — Interactive Silo Scanner UI & Automated RoPA Synthesis
## Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)
### Application: DPDP_Secure | Srujana Tech Fest 2026

> **HOW TO USE:** Copy the entire code block below and paste directly into your terminal or chat as a `/goal` command. It is 100% self-contained, pre-configured for the existing `DPDP_Secure` codebase, and includes all necessary cybersecurity guardrails.

---

### DIRECT COPY-PASTE PROMPT:

```markdown
/goal
Build the complete interactive Data Discovery Studio and backend RoPA Synthesis Engine in `DPDP_Secure`. The solution must allow small business owners to upload informal files (or click 1 button to scan pre-loaded clinic samples), view animated real-time PII extraction with risk tags, automatically derive a statutory Record of Processing Activities (RoPA) under Section 8(4), and export signed RoPA documents.

### Context & Existing Workspace:
- Workspace root: `N:\chnayka\DPDP_Secure`
- Target files:
  - `src/services/ropaService.js` (NEW backend RoPA synthesis engine)
  - `src/controllers/discoveryController.js` (Updated with RoPA generation & exports)
  - `src/routes/discoveryRoutes.js` (Updated with RoPA endpoints)
  - `views/discovery-connectors.ejs` (Updated interactive discovery view)
  - `views/inventory-ropa.ejs` (Updated dynamic RoPA view)
  - `public/js/discoveryScanner.js` (Safe client-side controller)
- Brand Protection: Strictly use `DPDP_Secure`. Never use any deprecated or legacy brand names.

### Mandatory Requirements:

1. Cybersecurity & Frontend Guardrails:
   - **DOM-based XSS Defense:** When dynamically generating findings rows from AJAX responses in `public/js/discoveryScanner.js`, strictly use `document.createElement()` and `textContent` (or safe escaping) rather than inserting unsanitized strings via `innerHTML`.
   - **Double-Submission Prevention:** Disable the scan and upload buttons during active scanning, displaying a spinner and progress percentage to prevent race conditions or duplicate concurrent scans.
   - **Client-Side File Type Validation:** Validate uploaded file extensions (`.txt`, `.csv`, `.xlsx`) and file size (< 10MB) before submitting.

2. Backend RoPA Synthesis Engine (`src/services/ropaService.js`):
   Implement logic that inspects all `pii_findings` in the local database and synthesizes statutory RoPA records under Section 8(4):
   - Derives activities from silo types:
     1. **Patient Booking & WhatsApp Report Dispatch:**
        - Categories: "Identity (Aadhaar), Contact (Mobile, Indiranagar Address), Clinical Health Data (Blood Sugar, Lipid Profile, Thyroid Panel)"
        - Purpose: "Delivery of requested medical lab reports to patient"
        - Legal Basis: "Section 6 - Consent / Section 4 - Lawful Purpose"
        - Storage: "Local Reception Android Device & Desktop Billing PC"
        - Retention: "3 Years for clinical reports / 6 Years for Billing Invoices"
        - Security Safeguards: "Local Storage, Screen Lock, Zero Cloud Egress"
     2. **Customer Lead Management & Home Sample Collection:**
        - Categories: "Identity (Aadhaar, PAN), Contact (Mobile, Email)"
        - Purpose: "Coordinating home diagnostic sample collection"
        - Legal Basis: "Section 6 - Consent"
        - Storage: "Local Lead Spreadsheet"
        - Retention: "1 Year or until consent withdrawal"
        - Security Safeguards: "Password-protected Excel sheet"
     3. **Billing, GST & Statutory Tax Invoicing:**
        - Categories: "Financial (GSTIN, Invoice Amount, Payment Mode), Contact (Phone)"
        - Purpose: "Compliance with tax invoicing regulations"
        - Legal Basis: "CGST Act 2017 Section 36 read with DPDP Act Section 8(7)"
        - Storage: "Desktop Billing Software (Tally)"
        - Retention: "72 Months (6 Years) mandatory tax lock"
        - Security Safeguards: "Air-gapped desktop PC, daily local backup"
   - Persists synthesized records into SQLite `ropa_records` table and updates compliance score.

3. Discovery & RoPA Backend Endpoints (`src/routes/discoveryRoutes.js`):
   - `GET /discovery/connectors`:
     - Queries local database and renders `views/discovery-connectors.ejs` passing `{ title: 'Data Discovery - DPDP_Secure', description: 'Connect data sources, run scans, and review PII findings.', breadcrumbs: ['Workspace', 'Data Discovery'], silos, findings }`.
   - `GET /inventory/ropa`:
     - Queries `ropa_records` from SQLite and renders `views/inventory-ropa.ejs` passing `{ title: 'Processing Activities (RoPA) - DPDP_Secure', description: 'Statutory Record of Processing Activities under DPDP Act Section 8(4).', breadcrumbs: ['Workspace', 'Data Mapping', 'RoPA'], ropaRecords }`.
   - `GET /api/ropa/export-csv`:
     - Streams a sanitized CSV file of the RoPA with formula injection defense (`'`) and headers: `Activity Name,Categories of Personal Data,Purpose,Legal Basis,Retention Period,Storage Location,Safeguards`.
   - `GET /api/ropa/data`:
     - Returns RoPA records in JSON format: `{ success: true, count: 3, records: [...] }`.
   - `POST /api/ropa/generate`:
     - Triggers automated RoPA re-synthesis from current `pii_findings` and returns updated activities.

4. Discovery Studio UI (`views/discovery-connectors.ejs`):
   Upgrade the view to provide:
   - **Connector Overview Grid:**
     - 4 Cards: WhatsApp Backups, Desktop Spreadsheets, Google Forms, Billing Exports.
   - **Interactive Action Dock:**
     - Drag-and-drop dropzone supporting `.txt`, `.csv`, `.xlsx`.
     - **Fast-Track Demo Button:** `⚡ Scan Pre-Loaded Aarogya Clinic Files` (1-click trigger).
   - **Live Threat Radar & Metric Tickers:**
     - Animated counter cards: Total Records Scanned, Validated Aadhaar Numbers (Verhoeff $D_5$), Individual PANs, Clinical Health Findings, Financial UPI Handles.
   - **Interactive Findings Table:**
     - Filter tabs: All Findings, Critical Health, Aadhaar & KYC, Financial / UPI, Contacts.
     - Table Columns: Source Silo, Data Principal, PII Type (Crimson `AADHAAR`, Amber `PAN`, Red `HEALTH`), Masked Value, Verification Proof (`Verhoeff D5 Valid`), Action.

5. Dynamic RoPA View (`views/inventory-ropa.ejs`):
   - Renders the synthesized RoPA rows dynamically:
     - Activity Name, Personal Data Categories, Purpose, Legal Basis, Storage Location, Retention Period, Security Safeguards.
   - Action Buttons:
     - Button: `📊 Export RoPA CSV` (points to `/api/ropa/export-csv`).
     - Button: `📄 Print Official RoPA` (`window.print()`).

6. Client-Side Script (`public/js/discoveryScanner.js`):
   - Handle `#btnScanSample` click:
     - Show progress bar, animate ticker numbers.
     - Make `POST /api/discovery/scan-sample`.
     - Dynamically populate table rows safely using `textContent`.
     - Display toast: "Scan Complete: Discovered 1,420 Indian PII items across 3 informal silos."

7. Verification Steps:
   - Start the server: `node server.js`.
   - Open `http://localhost:3000/discovery/connectors`.
   - Click "Scan Pre-Loaded Aarogya Clinic Files".
   - Verify progress animation runs and table populates with Aadhaar, PAN, phone, and health items.
   - Open `http://localhost:3000/inventory/ropa` and verify the synthesized RoPA register.
   - Click "Export RoPA CSV" and verify download returns a clean, sanitized CSV.
```

---

## Technical Reference & File Mapping

| File Path | Purpose |
|---|---|
| `src/services/ropaService.js` | Synthesizes statutory RoPA records under DPDP Act Section 8(4). |
| `src/controllers/discoveryController.js` | RoPA rendering, CSV streaming, JSON API, and re-synthesis handler. |
| `src/routes/discoveryRoutes.js` | Mounts discovery connectors, RoPA views, and export endpoints. |
| `views/discovery-connectors.ejs` | Interactive discovery studio with dropzone and findings table. |
| `views/inventory-ropa.ejs` | Statutory RoPA table with CSV export and print styling. |
| `public/js/discoveryScanner.js` | Client-side AJAX scan controller with safe DOM rendering. |
