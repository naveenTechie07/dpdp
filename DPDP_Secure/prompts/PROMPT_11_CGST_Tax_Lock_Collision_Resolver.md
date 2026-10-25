# PROMPT 11: Pillar 3 — Statutory Collision Resolver (CGST 6-Yr Tax Lock vs. DPDP Erasure)
## Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)
### Application: DPDP_Secure | Srujana Tech Fest 2026

> **HOW TO USE:** Copy the entire code block below and paste directly into your terminal or chat as a `/goal` command. It is 100% self-contained, pre-configured for the existing `DPDP_Secure` codebase, and includes all necessary cybersecurity guardrails.

---

### DIRECT COPY-PASTE PROMPT:

```markdown
/goal
Build the legal-tech signature breakthrough in `DPDP_Secure`: an automated Dual-Track Statutory Collision Resolver. The engine automatically reconciles DPDP Act Section 12 erasure with the Central Goods and Services Tax (CGST) Act, 2017 Section 36 mandatory 6-year retention lock, applying formula-safe atomic redaction on informal records while locking tax invoices and generating a SHA-256 signed erasure compliance certificate.

### Context & Existing Workspace:
- Workspace root: `N:\chnayka\DPDP_Secure`
- Target files:
  - `src/services/statutoryCollisionResolver.js` (NEW statutory resolution engine)
  - `src/services/certificateGenerator.js` (NEW cryptographic certificate generator)
  - `src/controllers/privacyController.js` (Updated with erasure execution & download endpoints)
  - `src/routes/privacyRoutes.js` (Updated with erasure routes)
  - `views/privacy-requests.ejs` (Updated with resolution modal)
  - `server.js` (Mount updated privacy routes)
- Brand Protection: Strictly use `DPDP_Secure`. Never use any deprecated or legacy brand names.

### Mandatory Requirements:

1. Cybersecurity & Atomic File Guardrails:
   - **Atomic File Writing:** When rewriting spreadsheets or chat files during redaction, write first to a temporary file (`.tmp`) and atomically rename it (`fs.renameSync`) to prevent corrupted partial files or data loss in the event of an unexpected process exit.
   - **Formula Injection Defense During Redaction:** Ensure that sanitized rows in CSV files never introduce unescaped characters (`=`, `+`, `-`, `@`) that could trigger CSV formula execution in Excel.
   - **Cryptographic Audit Certificate (SHA-256):** Compute a SHA-256 digital fingerprint across `ticketId + principalPhone + informalRedactionsCount + taxLockedCount + timestamp` to produce a verifiable, tamper-proof audit certificate for the citizen and tax authorities.

2. Statutory Conflict Analysis:
   - **DPDP Act Section 12(3):** Grants Data Principals the right to erasure of personal data.
   - **CGST Act Section 36:** Mandates retention of accounts, records, and invoices for **72 months (6 years)** from the annual return due date. Deleting invoices violates tax law and exposes the SME to criminal prosecution.
   - **DPDP Act Section 8(7):** Explicitly allows retention of personal data if retention is necessary for compliance with any law for the time being in force.

3. The Dual-Track Execution Engine (`src/services/statutoryCollisionResolver.js`):
   Implement `executeSmartErasure(ticketId, principalIdentifier)`:
   - **Track A: Informal Silos (WhatsApp Chats, Lead Sheets):**
     - Immediate full redaction using atomic file write.
     - In `data/sample_data/clinic_reception_chat.txt`, replace all occurrences of Deepa Nair / `9988776655` / `deepa.nair@corp.com` with `[REDACTED-DPDP-SEC-12]`.
     - In `data/sample_data/customer_leads.csv`, replace Row 5 cells with `[REDACTED-DPDP-SEC-12]`.
   - **Track B: Financial & Tax Invoices (`invoices_billing.csv`):**
     - Calculate invoice age against current statutory date (72 months / 6 years threshold).
     - **Case 1 (Invoice > 6 Years Old, e.g. `INV-2017-001`):**
       - Classification: `STATUTORY_RETENTION_EXPIRED`.
       - Full erasure permitted and executed.
     - **Case 2 (Invoice < 6 Years Old, e.g. `INV-2024-309` for Deepa Nair):**
       - Classification: `MANDATORY_TAX_RETENTION_ACTIVE`.
       - **Pseudonymization & Statutory Lock:**
         - Retain GSTIN, invoice amount, tax line items, and invoice number until statutory expiry date (`2030-12-31`).
         - Mask personal phone number to `+91 99XXXXXX55`.
         - Record statutory justification: `CGST Act, 2017 Section 36 read with DPDP Act, 2023 Section 8(7)`.
   - Update SQLite ticket status to `TAX_LOCKED` / `COMPLETED`.
   - Record immutable event in `audit_logs`.

4. Cryptographic Proof Certificate Generator (`src/services/certificateGenerator.js`):
   Generate official compliance proof:
   - Certificate ID: `CERT-ERASURE-2026-9921`
   - Principal Identifier: `Deepa Nair / +91 9988776655`
   - Timestamp of Execution
   - Audit Summary:
     - Informal Records Erased: 2 files (`clinic_reception_chat.txt`, `customer_leads.csv`)
     - Invoices Preserved under CGST Section 36: 1 invoice (`INV-2024-309`)
   - SHA-256 Digital Fingerprint
   - Generate printable HTML/PDF saved in `data/certificates/`.

5. Backend Endpoints (`src/routes/privacyRoutes.js`):
   - `POST /api/privacy/execute-erasure`:
     - Body: `{ ticketId: 'DSR-2026-8819', principalPhone: '9988776655' }`
     - Executes `statutoryCollisionResolver.executeSmartErasure()`
     - Returns JSON `{ success: true, certificateId, informalRedactions, taxLockedInvoices, certUrl }`
   - `GET /api/privacy/download-cert/:id`:
     - Streams the generated SHA-256 compliance certificate HTML/PDF.
   - `GET /privacy/workflows`:
     - Renders stage-based DSR pipeline view (`views/privacy-workflows.ejs`).

6. Interactive UI in `views/privacy-requests.ejs`:
   - Add action button on Deepa Nair's ticket: `🛡️ Execute Smart Erasure`.
   - Clicking opens the **Smart Resolution Modal**:
     - Visual breakdown of files before and after erasure.
     - Green Banner: "WhatsApp Chat & Lead Sheet Redacted Permanently".
     - Amber Banner: "Statutory Tax Lock Activated on Invoice INV-2024-309 (Protected under CGST Act Section 36 until 2030-12-31)".
     - Button: `📥 Download Cryptographic Erasure Certificate (PDF)`.

7. Verification Steps:
   - Start the server: `node server.js`.
   - Open `http://localhost:3000/privacy/requests`.
   - Open ticket `DSR-2026-8819` (Deepa Nair) and click "Execute Smart Erasure".
   - Confirm lead record has `[REDACTED-DPDP-SEC-12]` on Aadhaar and phone.
   - Confirm invoice `INV-2024-309` is NOT deleted, but locked under CGST Section 36.
   - Click "Download Certificate" and verify the SHA-256 hash certificate renders.
```

---

## Technical Reference & File Mapping

| File Path | Purpose |
|---|---|
| `src/services/statutoryCollisionResolver.js` | Reconciles DPDP Section 12 with CGST Section 36 via Section 8(7). |
| `src/services/certificateGenerator.js` | Generates SHA-256 tamper-proof erasure compliance certificates. |
| `src/controllers/privacyController.js` | Handles erasure execution and certificate download endpoints. |
| `src/routes/privacyRoutes.js` | Mounts privacy API routes. |
| `views/privacy-requests.ejs` | Interactive resolution modal with before/after comparison. |
