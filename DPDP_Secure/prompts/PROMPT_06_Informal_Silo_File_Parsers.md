# PROMPT 06: Pillar 1 Backend — Informal Silo File Parsers & Data Discovery Controller
## Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)
### Application: DPDP_Secure | Srujana Tech Fest 2026

> **HOW TO USE:** Copy the entire code block below and paste directly into your terminal or chat as a `/goal` command. It is 100% self-contained, pre-configured for the existing `DPDP_Secure` codebase, and includes all necessary cybersecurity guardrails.

---

### DIRECT COPY-PASTE PROMPT:

```markdown
/goal
Build dedicated file ingestion and parsing pipelines in Node.js for `DPDP_Secure` capable of ingesting informal SME data repositories (WhatsApp chat exports, desktop spreadsheets, billing CSVs). The parsers must neutralize spreadsheet formula injection vulnerabilities, enforce strict file upload security, integrate with the Indian PII engine, and persist findings to the SQLite database.

### Context & Existing Workspace:
- Workspace root: `N:\chnayka\DPDP_Secure`
- Target files: `src/services/fileParsers.js`, `src/controllers/discoveryController.js`, `src/routes/discoveryRoutes.js`, `server.js`.
- Sample data files: `data/sample_data/clinic_reception_chat.txt`, `data/sample_data/customer_leads.csv`, `data/sample_data/invoices_billing.csv`.
- Brand Protection: Strictly use `DPDP_Secure`. Never use any deprecated or legacy brand names.

### Mandatory Requirements:

1. Cybersecurity & Upload Guardrails:
   - **Formula Injection (CSV Injection) Neutralization:** Spreadsheet cells starting with `=`, `+`, `-`, or `@` can execute malicious commands in Microsoft Excel. The parser must detect and sanitize these cells by prepending a safe apostrophe (`'`).
   - **Path Traversal Defense:** When processing uploaded files, sanitize filenames using `path.basename()` and strictly forbid directory traversal characters (`..`, `/`, `\`).
   - **MIME-Type & Size Enforcement:** Configure `multer` with a 10MB file limit and restrict acceptable MIME types to `text/plain`, `text/csv`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.
   - **Ephemeral Storage:** Unlink and remove uploaded temporary files immediately after in-memory parsing to prevent disk accumulation of raw customer data.

2. Informal Silo Parsers (`src/services/fileParsers.js`):
   Implement dedicated parsing logic:
   1. **WhatsApp Chat Parser (`parseWhatsAppChat(content, filename)`):**
      - Detect both iOS and Android export formats:
        - `\[(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\]\s*([^:]+):\s*(.*)`
        - `(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2})\s*-\s*([^:]+):\s*(.*)`
      - Handle multiline messages by appending non-timestamped lines to the previous message.
      - Extract line metadata: `timestamp`, `sender`, `message`, `lineNumber`.
      - Scan message text through `indianPiiEngine.scanTextForPii()`.
      - Flag attached media references (e.g. `prescription.pdf (file attached)`, `<Media omitted>`).
   2. **Spreadsheet & CSV Parser (`parseCsvOrExcel(contentOrBuffer, filename)`):**
      - Parse CSV rows and Excel sheets.
      - Apply formula injection defense across all cells.
      - Map findings to specific column names, row indices, and customer names.
   3. **Sample Data Pre-Loader (`scanPreloadedSamples()`):**
      - Ingest and scan the 3 pre-staged sample files in `data/sample_data/` in one call:
        - `clinic_reception_chat.txt` -> Identifies WhatsApp patient chats with Aadhaar, phone, health tests.
        - `customer_leads.csv` -> Identifies customer lead spreadsheet with Aadhaar, PAN, phone.
        - `invoices_billing.csv` -> Identifies billing records with GSTIN, invoice numbers, amounts, phones.
      - Persist findings to `data_silos` and `pii_findings` tables in SQLite via `src/models/index.js`.

3. Discovery Controller (`src/controllers/discoveryController.js`):
   Implement complete backend controller methods:
   - `renderConnectors(req, res)`:
     - Queries existing silos and findings from SQLite and renders `views/discovery-connectors.ejs`.
   - `scanSampleFiles(req, res)`:
     - Triggered by `POST /api/discovery/scan-sample`.
     - Calls `fileParsers.scanPreloadedSamples()`.
     - Returns JSON:
       ```json
       {
         "success": true,
         "totalFilesScanned": 3,
         "totalPiiCount": 1420,
         "silos": [
           { "name": "clinic_reception_chat.txt", "type": "WHATSAPP_CHAT", "count": 840 },
           { "name": "customer_leads.csv", "type": "SPREADSHEET_CSV", "count": 420 },
           { "name": "invoices_billing.csv", "type": "BILLING_SYSTEM", "count": 160 }
         ],
         "findingsSample": [...]
       }
       ```
   - `uploadAndScan(req, res)`:
     - Triggered by `POST /api/discovery/upload`.
     - Processes `req.file` via `multer`, runs appropriate parser, saves findings, unlinks temp file, and returns results.
   - `getFindings(req, res)`:
     - Triggered by `GET /api/discovery/findings`.
     - Returns stored findings filtered by category (`AADHAAR`, `PAN`, `HEALTH`, `PHONE`, `ALL`).

4. Route Registration (`src/routes/discoveryRoutes.js`):
   - Mount:
     - `GET /discovery/connectors` -> `discoveryController.renderConnectors`
     - `POST /api/discovery/scan-sample` -> `discoveryController.scanSampleFiles`
     - `POST /api/discovery/upload` -> `upload.single('siloFile')`, `discoveryController.uploadAndScan`
     - `GET /api/discovery/findings` -> `discoveryController.getFindings`

5. Verification Steps:
   - Start the server: `node server.js`.
   - Send `POST /api/discovery/scan-sample` using `curl` or browser.
   - Verify that 3 silos and ~1420 PII findings are inserted into SQLite.
   - Verify that Ramesh Sharma's Aadhaar `3421 8901 2345` is extracted, validated via Verhoeff, and masked as `XXXX-XXXX-2345`.
   - Verify that Priya Patel's PAN `ABCDE1234F` is extracted and flagged as `INDIVIDUAL_PAN`.
```

---

## Technical Reference & File Mapping

| File Path | Purpose |
|---|---|
| `src/services/fileParsers.js` | WhatsApp chat parsing, CSV formula defense, sample data loader. |
| `src/controllers/discoveryController.js` | Handles upload requests, sample scan triggers, and findings queries. |
| `src/routes/discoveryRoutes.js` | Mounts discovery endpoints with upload validation middleware. |
