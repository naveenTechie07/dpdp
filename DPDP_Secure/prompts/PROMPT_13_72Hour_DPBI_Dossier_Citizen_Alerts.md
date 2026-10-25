# PROMPT 13: Pillar 4 — 72-Hour DPBI Regulatory Intimation Dossier & Plain Citizen Alerts
## Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)
### Application: DPDP_Secure | Srujana Tech Fest 2026

> **HOW TO USE:** Copy the entire code block below and paste directly into your terminal or chat as a `/goal` command. It is 100% self-contained, pre-configured for the existing `DPDP_Secure` codebase, and includes all necessary cybersecurity guardrails.

---

### DIRECT COPY-PASTE PROMPT:

```markdown
/goal
Build the automated Dual-Notification generation engine in `DPDP_Secure`. The engine must generate a formal, printable 72-Hour DPBI Regulatory Intimation Dossier (Form DPBI-IR1) complete with statutory legal findings under DPDP Rules, 2025 (Rule 7), and ready-to-dispatch plain-language customer alerts in English, Kannada, and Hindi to fulfill all Section 8(6) obligations without leaking technical vulnerabilities.

### Context & Existing Workspace:
- Workspace root: `N:\chnayka\DPDP_Secure`
- Target files:
  - `src/services/dossierGenerator.js` (NEW statutory dossier & alert text generator)
  - `src/controllers/incidentController.js` (Updated with dossier & alert dispatch methods)
  - `src/routes/incidentRoutes.js` (Updated with dossier routes)
  - `views/dpbi-dossier-print.ejs` (NEW formal printable report view)
  - `views/incidents-management.ejs` (Updated with dossier triggers)
  - `views/notifications-center.ejs` (Updated with dispatch queue)
  - `server.js` (Mount updated incident routes)
- Brand Protection: Strictly use `DPDP_Secure`. Never use any deprecated or legacy brand names.

### Mandatory Requirements:

1. Cybersecurity & Communications Guardrails:
   - **Vulnerability Concealment in Public Notices:** Customer notifications must reassure individuals and provide actionable safety steps (e.g. watch for phishing, ignore payment demands) without disclosing internal technical architecture, unpatched software versions, or credentials that attackers could exploit.
   - **Regulatory Dossier Integrity:** The DPBI dossier must format timestamps, incident vectors, and headcount figures into an immutable regulatory submission record (Form DPBI-IR1) with a SHA-256 fingerprint.
   - **Audit Trail Chaining:** Generating the dossier and dispatching alerts must record immutable entries in `audit_logs`.

2. 72-Hour DPBI Regulatory Intimation Dossier (`src/services/dossierGenerator.js`):
   Implement `generateDpbiDossier(incidentId)` returning:
   - **Form Identifier:** Form DPBI-IR1 (Section 8(6) & Rule 7).
   - **Entity Identification:**
     - Data Fiduciary: Aarogya Diagnostic Center
     - Registration / GSTIN: `29AAAAA0000A1Z5`
     - Address: Indiranagar, Bengaluru, Karnataka - 560038
     - DPO / Grievance Officer: Ramesh Kumar (`privacy@aarogyaclinic.in`)
   - **Incident Chronology:**
     - Breach Occurrence Timestamp
     - Discovery Timestamp
     - Intimation Submission Timestamp (within statutory 72 hours)
   - **Impacted Data Categories:** Identity (Aadhaar/PAN), Contact (Mobile), Clinical Health Data (Biopsy/Blood panels).
   - **Estimated Exposure:** ~250 Patients.
   - **Immediate Remedial Actions Taken:** Remote device wipe triggered, WhatsApp multi-device tokens revoked, local lab network credentials rotated, affected patients contacted.

3. Printable Statutory Report (`views/dpbi-dossier-print.ejs`):
   - Formal layout with statutory header:
     `DATA PROTECTION BOARD OF INDIA | FORM DPBI-IR1 (Section 8(6) & Rule 7)`
   - 1-click print styling (`window.print()`) optimized for PDF export.

4. Plain-Language Citizen Alerts in Regional Languages:
   Generate ready-to-dispatch SMS and WhatsApp alerts in 3 languages:
   1. **English:**
      "Dear Aarogya Clinic Patient, on [Date], a clinic front-desk mobile phone was reported lost. Your contact and appointment record were stored on the device. We immediately triggered a remote wipe and locked the phone. No unauthorized access has been confirmed. As a precaution, please ignore any suspicious payment messages claiming to be from our clinic. For queries, contact our DPO at privacy@aarogyaclinic.in."
   2. **Kannada (`ಕನ್ನಡ`):**
      "ಆರೋಗ್ಯ ಕ್ಲಿನಿಕ್ ರೋಗಿಗಳಿಗೆ ಪ್ರಮುಖ ಸೂಚನೆ: ನಮ್ಮ ಕ್ಲಿನಿಕ್‌ನ ರಿಸೆಪ್ಷನ್ ಮೊಬೈಲ್ ಕಳೆದುಹೋಗಿದ್ದು, ಸುರಕ್ಷತಾ ಕ್ರಮವಾಗಿ ಅದನ್ನು ತಕ್ಷಣ ದೂರದಿಂದಲೇ ಲಾಕ್ ಮಾಡಲಾಗಿದೆ. ಯಾವುದೇ ಅನಧಿಕೃತ ಸಂದೇಶಗಳು ಬಂದರೆ ದಯವಿಟ್ಟು ಗಮನಿಸಬೇಡಿ..."
   3. **Hindi (`हिन्दी`):**
      "आरोग्य क्लिनिक के सम्मानित मरीज, आपको सूचित किया जाता है कि क्लिनिक का एक फोन खो गया था जिसे तुरंत ब्लॉक कर दिया गया है..."

5. Backend Endpoints (`src/routes/incidentRoutes.js`):
   - `GET /incidents/dossier/:id`: Renders printable Form DPBI-IR1 view (`views/dpbi-dossier-print.ejs`).
   - `POST /api/incidents/dispatch-alerts`:
     - Accepts `{ incidentId, channels: ['SMS', 'WhatsApp'], languages: ['EN', 'KN', 'HI'] }`.
     - Simulates multi-channel bulk dispatch, logs audit entry, and updates incident `citizenAlertSent = true`.
     - Returns JSON `{ success: true, deliveredCount: 250, channels: ['SMS', 'WhatsApp'] }`.
   - `GET /notifications/center`: Renders `views/notifications-center.ejs` displaying simulated dispatch queue and templates.

6. Verification Steps:
   - Start the server: `node server.js`.
   - Open `http://localhost:3000/incidents/management`.
   - Open the "Lost Receptionist Smartphone" incident.
   - Click "Generate 72-Hour DPBI Dossier".
   - Confirm formal report renders at `/incidents/dossier/:id` with all mandatory Rule 7 fields.
   - Click "Dispatch Customer Alerts" and confirm English and Kannada dispatches appear in `/notifications/center`.
```

---

## Technical Reference & File Mapping

| File Path | Purpose |
|---|---|
| `src/services/dossierGenerator.js` | Generates Form DPBI-IR1 statutory dossier and citizen alert texts. |
| `src/controllers/incidentController.js` | Renders printable dossier and processes alert dispatches. |
| `src/routes/incidentRoutes.js` | Mounts incident management, dossier, and alert endpoints. |
| `views/dpbi-dossier-print.ejs` | Formal printable regulatory filing view. |
| `views/notifications-center.ejs` | Multi-channel citizen alert dispatch queue. |
