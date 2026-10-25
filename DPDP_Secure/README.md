# DPDP_Secure
## Data Protection & Privacy Compliance Platform for Small Businesses (SMEs)
### Srujana Tech Fest 2026 | Legal Services Track | Problem Statement LS-04

---

## Overview

**DPDP_Secure** is a server-side rendered (SSR) web application built using **Node.js, Express, and EJS**. It is engineered specifically to solve **Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)** under India's **Digital Personal Data Protection Act, 2023 (DPDP Act)** and the **DPDP Rules, 2025**.

Indian SMEs typically store personal, employee, and customer data across **WhatsApp chats, Google Forms, desktop Excel sheets, and billing software**. DPDP_Secure enables small business owners without a dedicated privacy or legal team to achieve practical, demonstrable, and audit-ready compliance across all four statutory pillars.

---

## The Four Core Compliance Pillars

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DPDP_SECURE: 4-PILLAR COMPLIANCE SUITE                          │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ PILLAR 1: DATA DISCOVERY │ PILLAR 2: CONSENT/NOTICE │ PILLAR 3: RIGHTS & ERASURE       │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ • Local Silo File Scan   │ • Section 5 Itemised Form│ • Section 11/12 Access & Erasure │
│ • WhatsApp Chat Parser   │ • Multilingual (EN/KN/HI)│ • CGST Act 6-Yr Tax Lock Engine  │
│ • Verhoeff Aadhaar Engine│ • 1-Click WhatsApp Link  │ • Formula-Safe Redaction Engine  │
│ • Entity-Aware PAN Regex │ • Immutable Consent Log  │ • SHA-256 Compliance Certificate │
│ Route: /discovery/*      │ Route: /consent/*        │ Route: /privacy/*                │
├──────────────────────────┴──────────────────────────┴──────────────────────────────────┤
│ PILLAR 4: BREACH PREPAREDNESS & TRIAGE                                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • SME Threat Scenarios (Lost Phone, Leaked WhatsApp Chat, Compromised Billing PC)      │
│ • Section 8(6) & Rule 7 Compliance (Dual Notification: Citizen + DPBI)                │
│ • 72-Hour DPBI Regulatory Intimation Dossier Generator                                │
│ • Multi-Channel Plain Language Customer Alert Dispatches (WhatsApp / SMS)              │
│ Route: /incidents/*                                                                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Pillar 1: Data Discovery & RoPA in Informal Systems**
   - **Local Silo Scanning:** Parses unstructured files including WhatsApp chat exports (`clinic_reception_chat.txt`), lead spreadsheets (`customer_leads.csv`), and billing logs (`invoices_billing.csv`).
   - **Indian PII Engine:** Zero-hallucination regex and deterministic algorithms:
     - **Aadhaar:** 12-digit detection with dihedral group $D_5$ **Verhoeff algorithm** validation.
     - **PAN:** 10-character validation with entity-type checking (4th character `'P'` = personal data).
     - **Phone & UPI:** Indian mobile series (`+91 [6-9]\d{9}`) and UPI payment handles (`@okhdfcbank`, `@oksbi`, etc.).
     - **Health Keywords:** Clinical diagnosis lexicon flagging sensitive health data.
   - **Auto-generated RoPA:** Generates Record of Processing Activities under Section 8(4).

2. **Pillar 2: Consent & Purpose Management**
   - **Section 5 Multilingual Notices:** Standardized notices with granular purpose toggles available in **English, Kannada (`ಕನ್ನಡ`), and Hindi (`हिन्दी`)**.
   - **1-Click WhatsApp Opt-in:** Generates WhatsApp sharing links (`wa.me`) for front-desk staff.
   - **Immutable Consent Ledger:** Chronological capture of consent grants and withdrawals under Section 6.

3. **Pillar 3: Data Principal Rights & Erasure (DSR)**
   - **Section 11 (Access) & Section 12 (Erasure/Correction):** End-to-end request lifecycle tracking.
   - **CGST Act Section 36 Conflict Resolution:** Automatically identifies tax-critical invoices requiring **72-month (6-year)** statutory retention under Section 36 of the Central Goods and Services Tax Act, 2017 while safely redacting marketing and chat records.
   - **Formula-Safe Redaction:** Sanitizes spreadsheets to prevent CSV formula injection.
   - **Cryptographic Audit Certificate:** Generates SHA-256 signed compliance certificates for customers.

4. **Pillar 4: Breach Preparedness & Triage**
   - **SME Threat Scenarios:** Lost staff smartphone, misdirected WhatsApp message, or compromised desktop billing PC.
   - **72-Hour DPBI Regulatory Intimation Dossier:** Generates formal compliance filings required under Section 8(6) and DPDP Rules, 2025 (Rule 7).
   - **Plain Language Citizen Alerts:** Generates clear, non-panicking WhatsApp/SMS customer alerts.

---

## Tech Stack & Architecture

- **Backend:** Node.js, Express 5
- **Frontend / Templating:** EJS (Embedded JavaScript), HTML5, Custom CSS
- **Design System:** Custom dark theme with glassmorphism (`public/css/style.css`)
- **Compute Model:** 100% Offline-First / Local Compute — zero sensitive data egress to third-party clouds.

---

## Project Structure

```
DPDP_Secure/
├── data/
│   └── sample_data/
│       ├── clinic_reception_chat.txt       # WhatsApp chat export containing raw PII
│       ├── customer_leads.csv              # Customer lead tracker spreadsheet
│       └── invoices_billing.csv            # Tally/Billing export with statutory tax records
├── docs/
│   ├── LS-04_MASTER_RESEARCH_AND_EXECUTION_PLAN.md # Master Research & Execution Plan
│   └── DPDP_SECURE_SYSTEM_ARCHITECTURE.md          # Complete Technical Architecture
├── public/
│   └── css/
│       └── style.css                       # Global styles and design system variables
├── views/
│   ├── partials/
│   │   ├── header.ejs                      # Fully connected active sidebar navigation
│   │   └── footer.ejs                      # Common footer scripts
│   ├── index.ejs                           # Main executive dashboard
│   ├── discovery-connectors.ejs            # Data Discovery & Local Silo Scans
│   ├── inventory-ropa.ejs                  # Record of Processing Activities (RoPA)
│   ├── consent-collectionpoints.ejs        # Multilingual Section 5 Notices & WhatsApp
│   ├── consent-ledger.ejs                  # Immutable Consent Capture Event Ledger
│   ├── privacy-requests.ejs                # DSR Management & CGST Tax Lock Resolution
│   ├── incidents-management.ejs            # Breach Triage & 72-Hour DPBI Dossier
│   └── ...                                 # Additional modules (Cookies, Roles, Audit Log)
├── server.js                               # Application entry point and route definitions
├── package.json                            # Project dependencies and metadata
└── README.md                               # Project guide
```

---

## Quickstart & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm (Node Package Manager)

### Step 1: Navigate to Directory
```bash
cd DPDP_Secure
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Application
```bash
node server.js
```

### Step 4: Access in Browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## Documentation & References

- **15 Standalone Implementation Prompts (Individual MD Files):** [`prompts/`](prompts/)
- **15-Step Master Implementation Prompts (Combined):** [`docs/15_STEP_MASTER_IMPLEMENTATION_PROMPTS.md`](docs/15_STEP_MASTER_IMPLEMENTATION_PROMPTS.md)
- **Problem Statement LS-04 Master Blueprint:** [`docs/LS-04_MASTER_RESEARCH_AND_EXECUTION_PLAN.md`](docs/LS-04_MASTER_RESEARCH_AND_EXECUTION_PLAN.md)
- **Technical System Architecture:** [`docs/DPDP_SECURE_SYSTEM_ARCHITECTURE.md`](docs/DPDP_SECURE_SYSTEM_ARCHITECTURE.md)
- **Sample Datasets:** Located in [`data/sample_data/`](data/sample_data/)
