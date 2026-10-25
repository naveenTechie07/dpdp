# PROMPT 09: Pillar 2 — Section 5 Multilingual Notice Builder & 1-Click WhatsApp Opt-in
## Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)
### Application: DPDP_Secure | Srujana Tech Fest 2026

> **HOW TO USE:** Copy the entire code block below and paste directly into your terminal or chat as a `/goal` command. It is 100% self-contained, pre-configured for the existing `DPDP_Secure` codebase, and includes all necessary cybersecurity guardrails.

---

### DIRECT COPY-PASTE PROMPT:

```markdown
/goal
Build the complete Consent and Purpose Management Suite in `DPDP_Secure` complying with Section 5 and Section 6 of the DPDP Act, 2023. Enable small businesses to generate itemised Section 5 notices in English, Kannada, and Hindi, dispatch them via WhatsApp with one click, simulate citizen opt-in, and maintain an immutable consent ledger with cryptographic SHA-256 integrity proofs.

### Context & Existing Workspace:
- Workspace root: `N:\chnayka\DPDP_Secure`
- Target files: `views/consent-collectionpoints.ejs`, `views/consent-ledger.ejs`, `src/controllers/consentController.js`, `src/routes/consentRoutes.js`, `public/js/consentManager.js`, `server.js`.
- Brand Protection: Strictly use `DPDP_Secure`. Never use any deprecated or legacy brand names.

### Mandatory Requirements:

1. Cybersecurity & Consent Integrity Guardrails:
   - **URI Injection Defense:** When generating WhatsApp click-to-chat links (`https://wa.me/?text=...`), strictly URL-encode the notice text using `encodeURIComponent()` to prevent URI parameter injection or XSS payload reflection.
   - **Cryptographic Non-Repudiation (SHA-256 Ledger Chaining):** Every consent event must compute an immutable SHA-256 hash:
     `crypto.createHash('sha256').update(phone + purposeCode + status + timestamp + tenantId).digest('hex')`
     This provides statutory proof of when consent was given or withdrawn.
   - **Prohibition of Bundled Consent:** Enforce granular purpose toggles in the notice builder. Under Section 6(1), consent must be specific and unconditional; clinical lab reporting must not be bundled with promotional advertising.

2. Multilingual Section 5 Notice Builder (`views/consent-collectionpoints.ejs`):
   Upgrade the view to provide:
   - **Pre-Configured SME Purpose Profiles:**
     - "Diagnostic Test Booking & Lab Report Dispatch" (Aarogya Clinic)
     - "Retail Order Processing & Home Delivery"
     - "Professional Tax Archival & Billing"
   - **Statutory Notice Content Requirements:**
     - Itemised personal data collected (Name, Mobile, Age, Health Test Details).
     - Specified purpose of processing.
     - Manner of consent withdrawal under Section 6(4).
     - Grievance redressal contact details (DPO Ramesh Kumar).
   - **Multilingual Language Switcher:**
     - **English**
     - **Kannada (`ಕನ್ನಡ`):**
       "ಆರೋಗ್ಯ ಡಯಾಗ್ನೋಸ್ಟಿಕ್ ಸೆಂಟರ್ - ಡೇಟಾ ರಕ್ಷಣೆ ಸೂಚನೆ (DPDP ಕಾಯ್ದೆ 2023)... ವಾಟ್ಸಾಪ್ ಮೂಲಕ ವರದಿಗಳನ್ನು ಸ್ವೀಕರಿಸಲು ದಯವಿಟ್ಟು 'YES' ಎಂದು ಉತ್ತರಿಸಿ."
     - **Hindi (`हिन्दी`):**
       "आरोग्य डायग्नोस्टिक सेंटर - डेटा गोपनीयता सूचना (DPDP अधिनियम 2023)... व्हाट्सएप पर रिपोर्ट प्राप्त करने के लिए 'YES' लिखकर भेजें।"

3. 1-Click WhatsApp Opt-in Generator:
   - Button: `📲 Generate WhatsApp Notice Link`
   - Generates clickable link: `https://wa.me/?text=[ENCODED_NOTICE_TEXT]` with a quick copy-to-clipboard button.
   - **Evaluator Fast-Track Simulator:**
     - Card: "⚡ Simulate Citizen WhatsApp Interaction"
     - Field: Patient Mobile (pre-filled with `+91 9845012345 - Ramesh Sharma`)
     - Button: `Simulate Patient Sending 'YES' on WhatsApp`
     - Making `POST /api/consent/record-consent` creates a real-time event in the database.

4. Immutable Consent Event Ledger (`views/consent-ledger.ejs`):
   Display a chronological audit grid:
   - Columns:
     - Timestamp (ISO 8601)
     - Data Principal Identifier (`+91 9845012345`)
     - Purpose Code (`PURP-DIAGNOSTIC-REPORTING`)
     - Language (`Kannada`, `English`, `Hindi`)
     - Consent State (Badge: Emerald `ACTIVE`, Amber `WITHDRAWN`)
     - Channel (`WhatsApp Business`, `Web Form`, `Paper Form`)
     - SHA-256 Cryptographic Hash Proof
     - Action: `Withdraw Consent` button (demonstrates immediate statutory revocation under Section 6(4)).

5. Controller & Endpoints (`src/controllers/consentController.js`, `src/routes/consentRoutes.js`):
   Implement complete backend endpoints:
   - `GET /consent/collection-points`:
     - Queries active notices and renders `views/consent-collectionpoints.ejs` with `{ title: 'Collection points - DPDP_Secure', description: 'Design and publish Section 5 multilingual notices.', breadcrumbs: ['Workspace', 'Consent', 'Collection points'], notices }`.
   - `GET /consent/ledger`:
     - Queries `consent_events` from SQLite and renders `views/consent-ledger.ejs` with `{ title: 'Consent ledger - DPDP_Secure', description: 'Summary records — one row per consent capture event.', breadcrumbs: ['Workspace', 'Consent', 'Consent ledger'], events }`.
   - `POST /api/consent/notices`:
     - Receives `{ title, purposeCode, language, noticeText }` and saves to SQLite `consent_notices`.
     - Returns JSON `{ success: true, noticeId }`.
   - `GET /api/consent/notices/:id`:
     - Returns notice details JSON.
   - `POST /api/consent/record-consent`:
     - Receives `{ phone, purposeCode, channel, status }`.
     - Computes SHA-256 hash proof: `sha256(phone + purposeCode + status + timestamp)`.
     - Inserts record into `consent_events` and writes to `audit_logs`.
     - Returns JSON `{ success: true, eventId, sha256Proof }`.
   - `POST /api/consent/withdraw-consent`:
     - Marks consent status as `WITHDRAWN` for the given phone and purpose.
     - Logs revocation event to `audit_logs`.
     - Returns JSON `{ success: true, message: 'Consent withdrawn under Section 6(4)' }`.

6. Verification Steps:
   - Start the server: `node server.js`.
   - Open `http://localhost:3000/consent/collection-points`.
   - Toggle English, Kannada, and Hindi notice tabs.
   - Click "Simulate Patient Sending 'YES' on WhatsApp".
   - Open `http://localhost:3000/consent/ledger` and confirm the new consent row appears with status `ACTIVE` and a valid SHA-256 hash.
   - Click "Withdraw Consent" and confirm status flips to `WITHDRAWN`.
```

---

## Technical Reference & File Mapping

| File Path | Purpose |
|---|---|
| `views/consent-collectionpoints.ejs` | Section 5 multilingual notice builder and 1-click WhatsApp copy generator. |
| `views/consent-ledger.ejs` | Immutable chronological consent log with SHA-256 integrity proofs. |
| `src/controllers/consentController.js` | Handlers for saving notices, logging consent grants, and revocations. |
| `src/routes/consentRoutes.js` | Mounts collection-points, consent ledger, and consent API routes. |
