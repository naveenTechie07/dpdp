# DPDP_Secure: Enterprise & SME System Architecture
## Technical Architecture, Component Design & Directory Specification

---

## 1. System Overview

`DPDP_Secure` is a lightweight, high-performance web application designed to deliver comprehensive privacy management and compliance capabilities for Indian Micro, Small, and Medium Enterprises (MSMEs).

### 1.1 Architecture Highlights
* **Runtime:** Node.js (v18+) with Express 5.
* **Rendering Engine:** Server-Side Rendered (SSR) Embedded JavaScript (EJS) with reusable partial layouts (`header.ejs`, `footer.ejs`).
* **Design System:** Vanilla CSS (`public/css/style.css`) utilizing CSS custom properties (variables), responsive CSS Grid, Flexbox, glassmorphism cards, and an accessible dark-mode aesthetic.
* **Compute Model:** 100% Offline-First / Zero Cloud Egress. All file parsing, regular expression matching, and algorithmic validation (such as the Verhoeff algorithm for Aadhaar) occur locally within the Node.js runtime.

---

## 2. Directory Structure

```
DPDP_Secure/
├── data/
│   └── sample_data/
│       ├── clinic_reception_chat.txt       # WhatsApp chat export containing raw PII
│       ├── customer_leads.csv              # Customer lead tracker spreadsheet
│       └── invoices_billing.csv            # Tally/Billing export with statutory tax records
├── docs/
│   ├── LS-04_MASTER_RESEARCH_AND_EXECUTION_PLAN.md # Problem Statement LS-04 Master Guide
│   └── DPDP_SECURE_SYSTEM_ARCHITECTURE.md          # System Architecture & Technical Spec
├── public/
│   └── css/
│       └── style.css                       # Global design system & theme variables
├── views/
│   ├── partials/
│   │   ├── header.ejs                      # Sidebar navigation, topbar search & active links
│   │   └── footer.ejs                      # Common footer scripts
│   ├── index.ejs                           # Main executive compliance dashboard
│   ├── discovery-connectors.ejs            # Pillar 1: Data Discovery & Local Silo Scans
│   ├── inventory-ropa.ejs                  # Pillar 1: Record of Processing Activities (RoPA)
│   ├── inventory-assets.ejs                # Pillar 1: System and file container inventory
│   ├── inventory-tags.ejs                  # Pillar 1: Data classification tag library
│   ├── consent-collectionpoints.ejs        # Pillar 2: Multilingual Section 5 notices & WhatsApp
│   ├── consent-purposes.ejs                # Pillar 2: Granular purpose definitions & toggles
│   ├── consent-ledger.ejs                  # Pillar 2: Immutable consent capture event ledger
│   ├── privacy-requests.ejs                # Pillar 3: Section 11/12 DSR & CGST tax lock engine
│   ├── privacy-workflows.ejs               # Pillar 3: DSR stage-based resolution pipelines
│   ├── incidents-dashboard.ejs             # Pillar 4: Breach monitoring & threat overview
│   ├── incidents-management.ejs            # Pillar 4: 72-Hour DPBI dossier & customer dispatches
│   ├── notifications-center.ejs            # Multichannel alerts (SMS, WhatsApp, Email)
│   ├── settings-*.ejs                      # Tenant settings, RBAC, branding, audit logs
│   └── 404.ejs                             # Clean fallback page
├── server.js                               # Central application server & route definitions
├── package.json                            # Project metadata & dependencies
└── README.md                               # Project documentation & run guide
```

---

## 3. Core Subsystems & Route Architecture

### 3.1 Pillar 1: Data Discovery & RoPA Engine
* **Routes:**
  * `GET /discovery/connectors`: Interface for scanning local files and viewing discovered PII findings.
  * `GET /inventory/ropa`: Record of Processing Activities (RoPA) summarizing processing legal basis and retention terms.
  * `GET /inventory/assets`: Inventory of informal repositories (WhatsApp folders, desktop spreadsheets, billing archives).
  * `GET /inventory/tags`: Classification dictionary of Indian PII categories.
* **PII Engine Algorithms:**
  * **Verhoeff Dihedral Algorithm ($D_5$):** Validates 12-digit Aadhaar numbers using permutation and multiplication tables.
  * **Entity-Aware PAN Validation:** Validates 10-character alphanumeric PAN strings and inspects the 4th character (`P` = Individual / PII, `C`/`F`/`T` = Non-Personal Data).
  * **Indian Phone Parser:** Captures 10-digit mobile series prefixed with `+91` or `0`.
  * **UPI VPA Pattern Matcher:** Identifies popular Indian payment handles (`@okhdfcbank`, `@oksbi`, `@okicici`, `@paytm`, `@ybl`).

---

### 3.2 Pillar 2: Consent & Purpose Management Engine
* **Routes:**
  * `GET /consent/collection-points`: Notice generator for WhatsApp, physical forms, and web portals.
  * `GET /consent/purposes`: Itemised purpose builder under DPDP Act Section 5.
  * `GET /consent/ledger`: Chronological audit log of customer consent grants and withdrawals under Section 6.
* **Multilingual Engine:**
  * Supports English, Kannada (`ಕನ್ನಡ`), and Hindi (`हिन्दी`).
  * Generates 1-click WhatsApp opt-in links (`https://wa.me/?text=...`) for non-technical retail or clinic staff.

---

### 3.3 Pillar 3: Data Principal Rights & Erasure Engine (DSR)
* **Routes:**
  * `GET /privacy/requests`: Queue of incoming Section 11 (Access) and Section 12 (Erasure/Correction) requests.
  * `GET /privacy/workflows`: Configurable stage pipelines (Identity Verification, Discovery, Tax Collision Check, Redaction, Audit Log).
* **Statutory Collision Resolver (DPDP vs. CGST Section 36):**
  * When an erasure request is executed for a customer:
    * Informal files (WhatsApp chat logs, marketing spreadsheets): Full redaction with `[REDACTED-DPDP-SEC-12]`.
    * Invoices < 6 years old: Personal contact details are masked, but transaction amounts and GSTINs are locked under CGST Act Section 36 statutory retention.
    * Invoices > 6 years old: Full deletion permitted.
  * SHA-256 cryptographic proof certificate generated for the Data Principal.

---

### 3.4 Pillar 4: Breach Preparedness & Incident Triage Engine
* **Routes:**
  * `GET /incidents/dashboard`: Overview of incident metrics and risk tiers under DPDP Rules, 2025 (Rule 7).
  * `GET /incidents/management`: Incident triage workflows for lost employee phones, leaked customer chats, or billing system compromises.
* **Deliverables Generated:**
  * **72-Hour DPBI Regulatory Intimation Dossier:** Formal statutory filing report for the Data Protection Board of India.
  * **Plain Language Customer Dispatches:** Reassuring, non-panicking WhatsApp/SMS customer alerts with safety guidelines.

---

## 4. Design System & Styling Architecture

The styling in `public/css/style.css` adheres to modern CSS standards:
* **Color Palette:**
  * Background Primary: `#0b0f19` (Deep Slate / Dark Navy)
  * Surface Cards: `#111827` with `rgba(255, 255, 255, 0.05)` borders (Glassmorphism)
  * Accent Primary: `#3b82f6` (Indigo / Cobalt Blue)
  * Success / Compliance: `#10b981` (Emerald Green)
  * Warning / Retention Lock: `#f59e0b` (Amber)
  * Critical / Breach Alert: `#ef4444` (Crimson Red)
  * Text Primary: `#f9fafb`, Text Muted: `#9ca3af`
* **Typography:** System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) with precise typographic scale.
* **Component Modularity:** Badges, data tables, metric cards, action buttons, and modal dialogs are defined with class-based utilities avoiding inline styling.

---

## 5. Security & Privacy Guarantees

1. **No Data Egress:** All PII extraction, validation, and redaction execute inside the local Node.js process. No sensitive files or data are transmitted to external servers.
2. **Formula Injection Defense:** Spreadsheets are processed with strict sanitization, neutralizing malicious prefixes (`=`, `+`, `-`, `@`) during export.
3. **Audit Trail Integrity:** All actions (discovery scans, consent updates, erasures, breach declarations) generate immutable, timestamped entries in the local audit log.
