# PROMPT 10: Pillar 3 — Citizen DSR Intake Portal & Section 11/12 Access Workflows
## Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)
### Application: DPDP_Secure | Srujana Tech Fest 2026

> **HOW TO USE:** Copy the entire code block below and paste directly into your terminal or chat as a `/goal` command. It is 100% self-contained, pre-configured for the existing `DPDP_Secure` codebase, and includes all necessary cybersecurity guardrails.

---

### DIRECT COPY-PASTE PROMPT:

```markdown
/goal
Build the complete Data Principal Rights (DSR) intake, search, and resolution subsystem in `DPDP_Secure` complying with Section 11 and Section 12 of the DPDP Act, 2023. Implement a public-facing citizen request portal (`/dsr`) with anti-DDoS rate limiting and OTP verification, a backend silo search engine that scans WhatsApp and spreadsheets for citizen records, and an administrative DSR operations queue in `views/privacy-requests.ejs`.

### Context & Existing Workspace:
- Workspace root: `N:\chnayka\DPDP_Secure`
- Target files:
  - `src/services/dsrSearchEngine.js` (NEW backend search engine)
  - `src/controllers/privacyController.js` (NEW backend DSR controller)
  - `src/routes/privacyRoutes.js` (NEW routes module)
  - `views/public-dsr-portal.ejs` (NEW public citizen intake view)
  - `views/privacy-requests.ejs` (Updated administrative DSR queue)
  - `server.js` (Mount privacy routes)
- Brand Protection: Strictly use `DPDP_Secure`. Never use any deprecated or legacy brand names.

### Mandatory Requirements:

1. Cybersecurity & Intake Guardrails:
   - **Anti-DDoS Rate Limiting on Public Portal:** Apply strict rate limiting on `POST /api/privacy/submit-dsr` (max 5 requests per 15 minutes per IP) to prevent spam and denial of service.
   - **Identity Verification Checkpoint:** Under Sections 11 and 12, an SME must not disclose or erase records without verifying the identity of the Data Principal. Implement a simulated SMS/OTP verification step (`882190`) before accepting or approving requests.
   - **Input Sanitization:** Sanitize all citizen inputs (strip HTML tags from grievance text, validate E.164 phone formats) before database insertion.

2. Backend Silo Search Engine (`src/services/dsrSearchEngine.js`):
   Implement `locateCitizenOccurrences(identifier)`:
   - Searches across all 3 sample files (`data/sample_data/`):
     1. **`clinic_reception_chat.txt`:** Scans lines for name, phone, or email. Returns array of `{ file: 'clinic_reception_chat.txt', line: lineNumber, matchedSnippet: text }`.
     2. **`customer_leads.csv`:** Scans CSV rows for matching name, phone, Aadhaar, or PAN. Returns `{ file: 'customer_leads.csv', row: rowIndex, matchedSnippet: rowData }`.
     3. **`invoices_billing.csv`:** Scans invoice rows for customer name or phone. Returns `{ file: 'invoices_billing.csv', invoiceNumber, invoiceDate, amount, gstin }`.
   - Returns aggregated search results in JSON format.

3. Public Citizen Rights Portal (`views/public-dsr-portal.ejs`):
   Build an accessible external intake form at `/dsr`:
   - **Data Principal Information:** Full Name, Registered Mobile Number, Email Address.
   - **Statutory Request Type (Dropdown):**
     - Section 11: Right to Access Summary of Personal Data & Processing Activities.
     - Section 12: Right to Correction & Updating of Inaccurate Data.
     - Section 12: Right to Erasure of Personal Data.
     - Section 13: Grievance Redressal / Complaint.
   - **Identity Verification Step:**
     - Button: "Send Verification Code via SMS"
     - 1-click test button: "Auto-Fill Test OTP (882190)" for judge demonstration.
   - **Submission Confirmation:**
     - Generates unique ticket tracking code (e.g. `DSR-2026-8819`).
     - Displays statutory response window: "Under DPDP Act Section 11/12, your request will be resolved within 7 working days."

4. Admin DSR Operations Queue (`views/privacy-requests.ejs`):
   Upgrade the view to display active tickets queried from SQLite `privacy_requests`:
   - Filter Tabs: `All Requests`, `New Intake`, `Awaiting Tax Review`, `Completed`.
   - **Pre-Loaded Live Hackathon Ticket:**
     - Ticket: `DSR-2026-8819`
     - Principal: `Deepa Nair`
     - Contact: `+91 9988776655 | deepa.nair@corp.com`
     - Request Type: `Complete Erasure under Section 12`
     - Status: `Awaiting Statutory Tax-Lock Review`
   - **Silo Occurrence Drawer:**
     - Clicking on Deepa Nair's ticket triggers `GET /api/privacy/dsr/:id/occurrences` and opens a slide-out drawer locating all occurrences across connected informal silos:
       1. **WhatsApp Reception Chat (`clinic_reception_chat.txt`):** Line 14: Mobile query for diagnostic test.
       2. **Customer Leads Spreadsheet (`customer_leads.csv`):** Row 5: Name, Phone, Aadhaar (`6734 5234 8901`), PAN (`PQRST3456D`).
       3. **Tally Billing Export (`invoices_billing.csv`):** Row 5: Invoice `INV-2024-309`, Date `2024-09-15`, Amount `Rs. 12,000`, GSTIN `29DDDDD3333D1Z1`.

5. Section 11 Access Summary Generator:
   - Endpoint: `GET /api/privacy/dsr/:id/summary`
   - Produces a downloadable summary report detailing all personal data held, processing purposes, and confirming absence of unauthorized third-party sharing.

6. Controller & Routes (`src/controllers/privacyController.js`, `src/routes/privacyRoutes.js`):
   - `GET /dsr`: Renders public citizen intake portal.
   - `POST /api/privacy/submit-dsr`: Validates OTP and registers ticket in SQLite.
   - `GET /privacy/requests`: Queries `privacy_requests` and renders admin queue.
   - `GET /api/privacy/dsr/:id/occurrences`: API returning mapped silo occurrences.
   - `GET /api/privacy/dsr/:id/summary`: Renders Section 11 summary report.

7. Verification Steps:
   - Start the server: `node server.js`.
   - Open `http://localhost:3000/dsr`.
   - Fill form for "Ramesh Sharma", click auto-fill OTP, and submit request.
   - Confirm ticket is created in SQLite with unique reference code.
   - Open `http://localhost:3000/privacy/requests`.
   - Open Deepa Nair's ticket (`DSR-2026-8819`) and verify that occurrences across WhatsApp, Leads, and Billing are accurately displayed.
```

---

## Technical Reference & File Mapping

| File Path | Purpose |
|---|---|
| `src/services/dsrSearchEngine.js` | Locates citizen occurrences across WhatsApp chats and spreadsheets. |
| `src/controllers/privacyController.js` | Handles citizen submission, admin queue rendering, and occurrences API. |
| `views/public-dsr-portal.ejs` | Public-facing citizen intake form with simulated OTP verification. |
| `views/privacy-requests.ejs` | Administrative DSR queue and informal occurrence locator drawer. |
