# PROMPT 12: Pillar 4 — SME Breach Threat Modeling & Incident Triage Engine
## Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)
### Application: DPDP_Secure | Srujana Tech Fest 2026

> **HOW TO USE:** Copy the entire code block below and paste directly into your terminal or chat as a `/goal` command. It is 100% self-contained, pre-configured for the existing `DPDP_Secure` codebase, and includes all necessary cybersecurity guardrails.

---

### DIRECT COPY-PASTE PROMPT:

```markdown
/goal
Build the Incident Management and Breach Triage module in `DPDP_Secure` tailored specifically to informal SME risk vectors. The engine must provide one-click threat scenario templates, calculate statutory risk scores under DPDP Rules, 2025 (Rule 7), arm an immutable 72-hour regulatory countdown timer, persist incidents to SQLite, and guide business owners through containment.

### Context & Existing Workspace:
- Workspace root: `N:\chnayka\DPDP_Secure`
- Target files: `views/incidents-dashboard.ejs`, `views/incidents-management.ejs`, `src/controllers/incidentController.js`, `src/routes/incidentRoutes.js`, `src/services/breachRiskCalculator.js`, `server.js`.
- Brand Protection: Strictly use `DPDP_Secure`. Never use any deprecated or legacy brand names.

### Mandatory Requirements:

1. Cybersecurity & Incident Guardrails:
   - **Confidentiality & Access Control:** Restrict incident declaration and triage actions strictly to `SME_OWNER` and `COMPLIANCE_OFFICER` roles via the `requireRole` middleware.
   - **Immutable Incident Chronology:** Once an incident is declared, its initial discovery timestamp (`discoveredAt`) must be permanently locked to prevent retroactive falsification of regulatory reporting timelines.
   - **Data Spill Prevention:** Incident description fields and notes must not store unmasked plaintext Aadhaar or health diagnostic records.

2. Pre-Configured SME Threat Scenario Templates:
   In `views/incidents-management.ejs`, provide one-click scenario simulations:
   1. **Scenario 1: Lost Receptionist Smartphone (Critical Risk):**
      - Unencrypted Android phone lost at Indiranagar Metro Station.
      - Contains 250+ unencrypted WhatsApp patient chats, Aadhaar card photos, and diagnostic test requisitions.
   2. **Scenario 2: Misdirected WhatsApp Medical Report (High Risk):**
      - Reception staff accidentally dispatched a patient's confidential biopsy and blood panel report to an incorrect mobile number.
   3. **Scenario 3: Compromised Desktop Billing Computer (Medium Risk):**
      - Ransomware / malware detected on front-desk computer running Tally.
      - Daily local backup accessible; no confirmed exfiltration outside local network.

3. Statutory Severity & Risk Calculator (`src/services/breachRiskCalculator.js`):
   Evaluate incidents under DPDP Act Section 8(6) and DPDP Rules, 2025 (Rule 7):
   - **Inputs:** Data Categories Impacted (Identity, Financial, Clinical Health), Estimated Headcount, Safeguards in Place (Encryption / Screen lock).
   - **Scoring Rules:**
     - Presence of Aadhaar or Clinical Health Data immediately elevates severity to `HIGH` or `CRITICAL`.
     - Headcount > 100 individuals triggers high-volume regulatory alert.
   - **Outputs:**
     - Severity Rating: `CRITICAL` (Score: 88/100).
     - Mandatory DPBI Intimation Flag: `TRUE`.
     - Statutory Reporting Deadline: `72 Hours from discovery`.
     - Immediate Containment Action Items:
       1. Trigger Google Find My Device remote lock & wipe.
       2. Revoke WhatsApp Business linked web sessions.
       3. Generate DPBI 72-Hour Regulatory Intimation Dossier.
       4. Issue reassuring citizen alerts.

4. Incident Controller & Backend Endpoints (`src/controllers/incidentController.js`, `src/routes/incidentRoutes.js`):
   Implement complete backend endpoints:
   - `GET /incidents/management`:
     - Queries `incidents` from SQLite and renders `views/incidents-management.ejs`.
   - `GET /incidents/dashboard`:
     - Queries severity breakdown and renders `views/incidents-dashboard.ejs`.
   - `POST /api/incidents/create`:
     - Receives `{ incidentTitle, scenarioType, impactedSilos, estimatedCount, dataCategories }`.
     - Runs `breachRiskCalculator.calculateRisk(req.body)`.
     - Persists incident into SQLite `incidents` table with 72-hour statutory deadline.
     - Logs cryptographic audit entry.
     - Returns JSON `{ success: true, incidentId, severity, statutoryDeadline, score, containmentActions }`.
   - `POST /api/incidents/triage`:
     - Updates containment action checkboxes in the database.

5. Interactive Incident Management UI (`views/incidents-management.ejs`):
   - Header Countdown Card: "72-Hour DPBI Statutory Notification Countdown: 68h 14m Remaining".
   - Button: `🚨 Declare New Security Incident`.
   - Multi-Step Incident Wizard Modal:
     - Step 1: Scenario Selection (Choose from templates or enter custom).
     - Step 2: Impacted Silo Mapping (WhatsApp, Leads, or Billing).
     - Step 3: Automated Risk Scoring & DPBI Filing Recommendation.
     - Step 4: Containment Checklist.
   - Active Incidents Table with severity pills, status timeline, and action buttons.

6. Verification Steps:
   - Start the server: `node server.js`.
   - Open `http://localhost:3000/incidents/management`.
   - Click "Declare New Security Incident" and select "Lost Receptionist Smartphone".
   - Confirm that `POST /api/incidents/create` creates an incident record in SQLite.
   - Confirm that the risk engine calculates severity as `CRITICAL` due to Aadhaar + clinical health data.
   - Confirm the 72-hour countdown timer is armed and containment recommendations appear.
```

---

## Technical Reference & File Mapping

| File Path | Purpose |
|---|---|
| `src/services/breachRiskCalculator.js` | Severity scoring and mandatory DPBI intimation rules under Rule 7. |
| `src/controllers/incidentController.js` | Incident declaration, triage, and status transitions. |
| `src/routes/incidentRoutes.js` | Incident creation, triage, and dashboard route mounts. |
| `views/incidents-management.ejs` | Interactive triage wizard and 72-hour statutory countdown clock. |
