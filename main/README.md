# Srujana (DataSentinel) — DPDPA for Small Business
### Practical Data Protection Compliance & Governance for Informal SME Systems

**Srujana Tech Fest 2026 | 48-Hour Software Hackathon (24–26 October 2026)**  
**Theme:** Legal Services | **Problem Statement ID:** LS-04  
**Track:** Enterprise Compliance & Citizen Privacy Rights  

---

## 📑 Table of Contents
1. [Executive Summary & Problem Statement (LS-04)](#1-executive-summary--problem-statement-ls-04)
2. [Target Persona & The SME Reality](#2-target-persona--the-sme-reality)
3. [Statutory Legal Foundation (DPDP Act 2023 & Rules 2025)](#3-statutory-legal-foundation-dpdp-act-2023--rules-2025)
4. [Complete Technology Stack](#4-complete-technology-stack)
5. [System Architecture & End-to-End Data Flow](#5-system-architecture--end-to-end-data-flow)
6. [Granular Feature Breakdown](#6-granular-feature-breakdown)
   - [Feature 1: Multi-Tenant Workspace & Dual Authentication](#feature-1-multi-tenant-workspace--dual-authentication)
   - [Feature 2: Offline Data Discovery & Python PII Scanner](#feature-2-offline-data-discovery--python-pii-scanner)
   - [Feature 3: RoPA (Record of Processing Activities) & React Flow Graph](#feature-3-ropa-record-of-processing-activities--react-flow-graph)
   - [Feature 4: Statutory Governance & Rules Engine](#feature-4-statutory-governance--rules-engine)
   - [Feature 5: Multilingual Consent Ledger & SHA-256 Receipts](#feature-5-multilingual-consent-ledger--sha-256-receipts)
   - [Feature 6: Data Principal Rights (DSR) & Citizen Privacy Portal](#feature-6-data-principal-rights-dsr--citizen-privacy-portal)
   - [Feature 7: Cookie & Web Tracker Governance](#feature-7-cookie--web-tracker-governance)
   - [Feature 8: Cryptographic Append-Only Audit Trail](#feature-8-cryptographic-append-only-audit-trail)
7. [Mathematical Algorithms & Statutory Conflict Resolver](#7-mathematical-algorithms--statutory-conflict-resolver)
8. [Database Schema Architecture (Prisma ORM)](#8-database-schema-architecture-prisma-orm)
9. [Quickstart & Running Guide](#9-quickstart--running-guide)
10. [Automated Testing & Verification Suite](#10-automated-testing--verification-suite)
11. [Project Directory Structure](#11-project-directory-structure)

---

## 1. Executive Summary & Problem Statement (LS-04)

### Problem Statement: LS-04
> **Personal Data in Informal Systems (Data Protection for Small Businesses)**
> 
> **Context:** India's *Digital Personal Data Protection Act, 2023 (DPDP Act)* applies to businesses of every size that handle personal data digitally. A typical SME stores customer, employee, and patient data across WhatsApp chats, Google Forms, Excel sheets, billing software, CCTV systems, and personal phones. Most could not tell you what personal data they hold, where it sits, why they collected it, or how they would respond if a customer asked for it to be erased. They also could not say what they would do in a breach.
> 
> **The Challenge:** Build a solution that helps a small business reach practical, demonstrable data protection compliance without a dedicated privacy team: finding out what personal data it handles, managing consent and purpose, responding to individuals' rights requests, and being prepared for a breach.

### The Solution: Srujana (DataSentinel)
Srujana is a **production-ready, zero-cloud-leakage, dual-persona compliance platform** engineered specifically for Indian MSMEs. It bridges the gap between informal digital operations (WhatsApp, Excel, desktop billing) and strict statutory compliance under the DPDP Act 2023, without requiring expensive enterprise privacy software or a dedicated legal team.

---

## 2. Target Persona & The SME Reality

* **Name:** Ramesh Kumar
* **Role:** Managing Partner, *Aarogya Diagnostic Center & Polyclinic* (Bengaluru)
* **Scale:** 14 staff members, 1 doctor, 3 phlebotomists, 6,200 patient records collected over 3 years.
* **The Reality of 63.4 Million Indian SMEs:**
  1. **Informal Silos:** Patients WhatsApp their prescriptions and IDs to the reception mobile phone. Staff track patient test dues, blood group, and phone numbers in 8 unencrypted Excel spreadsheets. Invoices are stored in desktop billing tools.
  2. **Zero Visibility:** The business owner cannot locate customer data across scattered files.
  3. **The "Right to be Forgotten" Dilemma:** Manually deleting customer rows across spreadsheets breaks formulas (`=SUM()`, `=VLOOKUP()`) and causes `#REF!` errors.
  4. **The Statutory Tax Conflict:** Erasing all records upon customer request violates **Section 36 of the CGST Act, 2017** (mandatory 6-year invoice retention).
  5. **Breach Penalty Exposure:** Section 8(5) failures carry penalties up to **₹250 Crore**; Section 8(6) failure to notify the Data Protection Board of India (DPBI) carries penalties up to **₹200 Crore**.

---

## 3. Statutory Legal Foundation (DPDP Act 2023 & Rules 2025)

| DPDP Act Provision | Statutory Mandate | SME Problem in Informal Systems | Srujana Solution Mechanism |
|---|---|---|---|
| **Section 2(i) & 2(j)** | Defines **Data Fiduciary** and **Data Principal**. | SMEs assume small turnover exempts them from compliance. | Establishes enforceable fiduciary duties and tenant-isolated data governance. |
| **Section 5(1) & 5(3)** | **Notice Requirement:** Itemised notice before/at consent in plain language (Eighth Schedule languages). | Data collected informally over WhatsApp with zero formal notices. | **Multilingual Notice Generator:** Instant statutory notices in **English, Hindi (`hi`), and Kannada (`kn`)**. |
| **Section 6(1) & 6(4)** | **Consent Standard:** Free, specific, informed, unconditional, and affirmative. Ease of withdrawal must equal giving. | No verifiable record of who consented to which purpose. | **Affirmative Consent Ledger:** Rejects pre-ticked boxes; records channel (`WHATSAPP_YES`, `WEB_PORTAL`, `RECEPTION`). |
| **Section 8(5)** | **Security Safeguards:** Reasonable measures to prevent personal data breaches. | Plain-text spreadsheets with Aadhaar/PAN stored on unencrypted staff laptops. | **Offline PII Scanner & RoPA Mapper:** Pinpoints high-risk unencrypted files containing Indian identifiers. |
| **Section 8(6)** | **Mandatory Breach Reporting:** Must intimate DPBI and affected Data Principals upon a personal data breach. | SME owners panic and conceal incidents, risking ₹200 Cr penalties. | **5-Minute DPBI Breach Wizard:** Auto-drafts regulatory filings and citizen intimation notices. |
| **Section 8(7) & Sec 12(2)** | **Storage Limitation & Erasure:** Erase personal data once purpose is fulfilled, **unless retention is required by law**. | Deleting accounting rows violates **CGST Act Section 36** (6-year retention rule). | **Statutory Conflict Resolver:** Retains tax invoices for 72 months while erasing marketing data, issuing a **Retention Certificate**. |
| **Section 11** | **Right to Access:** Summary of processed personal data and list of third-party processors. | Customer data scattered across 15 files cannot be retrieved quickly. | **Citizen Privacy Portal:** Self-service portal where citizens view and download their personal data summary. |
| **Section 12(1)** | **Right to Correction & Updating:** Right to correct inaccurate or misleading personal data. | Updating data across multiple files leads to inconsistent records. | **Atomic Update Pipeline:** Synchronizes corrections across indexed data assets. |
| **Section 33 & Schedule** | **Penalties:** Up to **₹250 Crore** for security failures; up to **₹200 Crore** for failing to report breaches. | A single complaint or breach can cause business bankruptcy. | Provides defensive audit trails, SHA-256 consent receipts, and demonstrable compliance proof. |

---

## 4. Complete Technology Stack

| Layer | Technology | Purpose & Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18 + Vite** | Fast SPA with Instant Hot Module Replacement and optimized production builds. |
| **Frontend Language** | **TypeScript (Strict Mode)** | Complete end-to-end type safety across API interfaces and components. |
| **Frontend Styling** | **Tailwind CSS + Vanilla CSS** | Enterprise data-dense design system (`border-slate-200`, `font-mono`, status tags). |
| **Data Lineage Graph** | **@xyflow/react (React Flow)** | Interactive node-edge relationship visualization of processing activities and flows. |
| **Backend Framework** | **Node.js (v18+) + Express** | High-throughput asynchronous REST API structured as a Modular Monolith. |
| **Backend Language** | **TypeScript** | Strict compile-time validation of controllers, routes, middleware, and services. |
| **ORM & Database** | **Prisma ORM + PostgreSQL / SQLite** | ACID-compliant relational schema with automated migrations and strict tenant isolation. |
| **Payload Validation** | **Zod** | Runtime input sanitization and strict statutory payload validation. |
| **Offline PII Engine** | **Python 3.10 + Pandas + OpenPyXL** | Native, offline execution of tabular inspection without leaking data to cloud LLMs. |
| **Checksum Algorithm** | **Verhoeff Dihedral Group $D_5$** | Mathematical check digit verification eliminating false positives for Indian Aadhaar cards. |
| **Authentication & Tokens** | **JWT (jsonwebtoken) + Bcrypt** | Salted password hashing (rounds = 10) and stateless Bearer authorization headers. |
| **Cryptographic Hashing** | **Node.js Crypto (SHA-256)** | Tamper-evident digital signatures for Consent Receipts and DSR Completion Certificates. |

---

## 5. System Architecture & End-to-End Data Flow

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CLIENT BROWSER LAYER                                   │
│   🏢 MSME Business Dashboard (Admin)          👤 Citizen Privacy Rights Portal (Patient) │
└─────────────────────────────────────────┬──────────────────────────────────────────────┘
                                          │  HTTP Requests with Bearer JWT
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        VITE DEV SERVER PROXY (Port 5173 / 3000)                        │
│                        Proxies /api/* requests to Port 5000                            │
└─────────────────────────────────────────┬──────────────────────────────────────────────┘
                                          │
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      EXPRESS BACKEND MODULAR MONOLITH (Port 5000)                      │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │  Global Middleware: CORS, Helmet, JSON Parser, Request Logger                   │   │
│   │  Auth & Tenant Middleware: Verifies JWT, extracts tenantId, userId, role       │   │
│   │  Zod Validation Middleware: Validates statutory request payloads               │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                        │
│   ┌───────────────────┬───────────────────┬───────────────────┬───────────────────┐    │
│   │   modules/auth    │ modules/discovery │  modules/mapping  │modules/governance │    │
│   │  Dual MSME/Citizen│ Multer Uploads    │ RoPA Register     │ Classification &  │    │
│   │  JWT + Bcrypt     │ Python Child Proc │ React Flow Graph  │ Retention Schedules│   │
│   ├───────────────────┼───────────────────┼───────────────────┼───────────────────┤    │
│   │  modules/consent  │    modules/dsr    │  modules/cookies  │   modules/audit   │    │
│   │ Multilingual Notice│ DSR Rights Intake │ Cookie Scanner    │ Append-Only       │    │
│   │ SHA-256 Receipts  │ CGST Tax Conflict │ Categorizer       │ Immutable Logs    │    │
│   └───────────────────┴───────────────────┴───────────────────┴───────────────────┘    │
└──────────────────────────────┬───────────────────────────────┬─────────────────────────┘
                               │                               │
                               ▼                               ▼
       ┌──────────────────────────────┐        ┌──────────────────────────────┐
       │   OFFLINE PYTHON SCANNER     │        │    PRISMA ORM & DATABASE     │
       │   - Pandas & OpenPyXL        │        │   - Strict Tenant Isolation  │
       │   - Verhoeff Aadhaar Math    │        │   - Relational DPDP Models   │
       │   - PAN, Mobile, Clinical    │        │   - PostgreSQL / SQLite      │
       └──────────────────────────────┘        └──────────────────────────────┘
```

---

## 6. Granular Feature Breakdown

### Feature 1: Multi-Tenant Workspace & Dual Authentication
* **Dual Roles:**
  * **🏢 MSME Company (Data Fiduciary):** Full enterprise compliance management; seeds `ADMIN`, `COMPLIANCE_OFFICER`, and `VIEWER` roles.
  * **👤 Individual Citizen (Data Principal):** Citizen privacy vault (`plan: CITIZEN`); direct access to personal data and rights requests.
* **1-Click Demo Accounts:**
  * MSME Admin: `ramesh.kumar@aarogyadiagnostics.in` / `Password123!`
  * Citizen: `rahul.sharma@example.com` / `Password123!`

### Feature 2: Offline Data Discovery & Python PII Scanner
* Uploads `.xlsx`, `.xls`, and `.csv` files to private tenant storage (`uploads/<tenantId>/`).
* Executes an offline Python worker ([`scanner.py`](./backend/src/python/scanner.py)) without cloud LLM dependencies.
* **Verhoeff Aadhaar Checksum:** Dihedral group $D_5$ permutation math eliminates 12-digit number false positives.
* Detects PAN (`[A-Z]{5}[0-9]{4}[A-Z]`), 10-digit Indian Mobile Numbers (`[6-9]\d{9}`), and Clinical Health Keywords.
* Generates actionable `RemediationFlag` records (e.g., `UNENCRYPTED_CRITICAL_PII` with severity `CRITICAL`).

### Feature 3: RoPA (Record of Processing Activities) & React Flow Graph
* Maintains DPDP Section 8 Records of Processing Activities.
* Categorizes processing activities, data elements, lifecycle flow stages (`COLLECTION` ➔ `STORAGE` ➔ `SHARING` ➔ `DISPOSAL`), and third-party recipients.
* **Interactive Relationship Graph:** Transforms RoPA data into `@xyflow/react` nodes and edges for visual lineage inspection.

### Feature 4: Statutory Governance & Rules Engine
* Deterministic classification: `RESTRICTED`, `CONFIDENTIAL`, `INTERNAL`, `PUBLIC`.
* **Statutory Retention Catalog:**
  * **Tax/Finance Invoices:** 72 Months (6 Years) under **Section 36 of CGST Act, 2017**.
  * **Security Access Logs:** 12 Months under **DPDP Rules 2025 Rule 6(1)(e)**.
  * **Clinical Diagnostic Notes:** 36 Months under National Medical Commission guidelines.

### Feature 5: Multilingual Consent Ledger & SHA-256 Receipts
* Pre-configured statutory notices in **English (`en`)**, **हिन्दी Hindi (`hi`)**, and **ಕನ್ನಡ Kannada (`kn`)**.
* Enforces affirmative action (`WHATSAPP_YES`, `PAPER_SLIP`, `WEB_PORTAL`, `RECEPTION_DESK`).
* Rejects pre-selected or implied consent under DPDP Section 6 (`HTTP 400`).
* Generates verifiable **SHA-256 Consent Receipts** with cryptographic digests for audit defense.

### Feature 6: Data Principal Rights (DSR) & Citizen Privacy Portal
* Self-service portal for citizens/patients to exercise DPDP Sections 11–13 rights:
  * **Right to Access:** Summary of all personal data held and list of third parties.
  * **Right to Correction:** Update outdated phone numbers or demographic data.
  * **Right to Erasure:** Evaluates statutory retention conflicts before deletion.
  * **Right to Nominate:** Register emergency nominees for healthcare/financial records.
  * **Right of Grievance Redressal:** Direct communication channel with the clinic's DPO.

### Feature 7: Cookie & Web Tracker Governance
* Audits website cookies and external tracking pixels.
* Categorizes trackers into `ESSENTIAL`, `ANALYTICS`, and `MARKETING`.

### Feature 8: Cryptographic Append-Only Audit Trail
* Logs every sensitive system event with `timestamp`, `ip_address`, `tenant_id`, `user_id`, and event metadata.
* Provides immutable audit logs for regulatory inspections by the Data Protection Board of India (DPBI).

---

## 7. Mathematical Algorithms & Statutory Conflict Resolver

### 1. Indian Aadhaar Validation via the Verhoeff Algorithm
A simple 12-digit regex produces high false positives (e.g., serial numbers, timestamps, invoice numbers). Indian Aadhaar numbers use the **Verhoeff algorithm**, based on the dihedral group $D_5$ permutation:

$$\left(\prod_{i=0}^{n-1} p(i \bmod 8, d_i)\right) = 0 \text{ in } D_5$$

Implemented natively in Python ([`scanner.py`](./backend/src/python/scanner.py)):
```python
def validate_verhoeff_aadhaar(number_str: str) -> bool:
    clean = re.sub(r'[\s\-]', '', str(number_str))
    if not re.match(r'^[2-9]\d{11}$', clean):
        return False
    c = 0
    reversed_digits = [int(x) for x in reversed(clean)]
    for i, digit in enumerate(reversed_digits):
        c = VERHOEFF_D[c][VERHOEFF_P[i % 8][digit]]
    return c == 0
```

### 2. The Statutory Legal Conflict: DPDP Section 12 vs. CGST Act Section 36
* **The Conflict:** A patient demands complete data erasure under DPDP Section 12. If the clinic erases billing records, it violates **Section 36 of the CGST Act 2017**, which mandates retaining books of accounts and invoices for **72 months (6 years)**.
* **Our Conflict Resolver:**
  1. Inspects the timestamp of the requested records.
  2. If the record is a tax invoice and age $\le 72\text{ months}$: **Locks the record from deletion** and issues a **Statutory Refusal Notice citing CGST Act Section 36**.
  3. If the record is non-tax data (e.g., marketing tags, WhatsApp chats): **Executes atomic erasure** and issues a **SHA-256 Erasure Certificate**.

---

## 8. Database Schema Architecture (Prisma ORM)

```prisma
// Core Multi-Tenant Isolation
model Tenant {
  id          String   @id @default(uuid())
  name        String
  plan        String   @default("STARTER") // STARTER | ENTERPRISE | CITIZEN
  status      String   @default("ACTIVE")
  createdAt   DateTime @default(now())
  users       User[]
  sources     DataSource[]
  activities  ProcessingActivity[]
  assets      DataAsset[]
  consents    ConsentRecord[]
  dsrRequests DsrRequest[]
  auditLogs   AuditEvent[]
}

// User & Role-Based Access Control
model User {
  id          String   @id @default(uuid())
  tenantId    String
  email       String   @unique
  password    String   // Bcrypt hash
  firstName   String
  lastName    String?
  role        String   // ADMIN | COMPLIANCE_OFFICER | VIEWER | CITIZEN
}

// RoPA Activity
model ProcessingActivity {
  id               String   @id @default(uuid())
  tenantId         String
  name             String
  businessFunction String
  legalBasis       String   // CONSENT | STATUTORY_OBLIGATION
  status           String   @default("ACTIVE")
}

// Consent Record & Receipts
model ConsentRecord {
  id              String   @id @default(uuid())
  tenantId        String
  userReference   String
  purposeId       String
  status          String   // GRANTED | WITHDRAWN
  channel         String   // WHATSAPP_YES | WEB_PORTAL | PAPER_SLIP
  receiptDigest   String   // SHA-256 cryptographic digest
  capturedAt      DateTime @default(now())
}

// DSR Rights Requests
model DsrRequest {
  id              String   @id @default(uuid())
  tenantId        String
  subjectEmail    String
  requestType     String   // ACCESS | CORRECTION | ERASURE | NOMINEE | GRIEVANCE
  status          String   // SUBMITTED | IN_REVIEW | RESOLVED | REJECTED_TAX_LOCK
  conflictReason  String?  // e.g. "Locked under CGST Act 2017 Section 36"
}
```

---

## 9. Quickstart & Running Guide

### Option 1: 1-Click Startup via Docker Compose
```bash
# From repository root or main/
docker-compose up --build
```
* **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
* **Backend API:** [http://localhost:5000](http://localhost:5000)

---

### Option 2: Local Development Launch (Two Terminals)

#### Terminal 1 — Backend (Port 5000)
```bash
cd main/backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

#### Terminal 2 — Frontend (Port 5173 / 3000)
```bash
cd main/frontend
npm install
npm run dev
```

---

## 10. Automated Testing & Verification Suite

Run the backend integration test suite covering auth, consent, discovery, DSR, governance, and RoPA mapping:

```bash
cd main/backend
npm test
```

**Verification Results:**
* `auth.test.ts` $\rightarrow$ **PASSED** (Multi-tenant token isolation & bcrypt validation)
* `discovery.test.ts` $\rightarrow$ **PASSED** (Python child process scanner & Verhoeff algorithm)
* `mapping.test.ts` $\rightarrow$ **PASSED** (RoPA register & React Flow graph payload generation)
* `governance.test.ts` $\rightarrow$ **PASSED** (Statutory classification & retention rules)
* `consent.test.ts` $\rightarrow$ **PASSED** (Multilingual notices & SHA-256 receipts)
* `dsr.test.ts` $\rightarrow$ **PASSED** (DSR request lifecycle & CGST tax conflict locks)

---

## 11. Project Directory Structure

```
n:/chnayka/main/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma data models
│   │   └── seed.ts             # Demo data & legal rules seeder
│   ├── src/
│   │   ├── config/env.ts       # Environment configuration
│   │   ├── middleware/         # Auth, Tenant isolation, Error handlers
│   │   ├── modules/            # Auth, Discovery, Mapping, Governance, Consent, DSR, Cookies, Audit
│   │   ├── python/scanner.py   # Offline PII detection engine
│   │   ├── app.ts              # Express app
│   │   └── index.ts            # Server entrypoint
│   └── test/                   # Jest/Supertest test suites
├── frontend/
│   ├── src/
│   │   ├── pages/              # Overview, Discovery, RoPA, Governance, Consent, DSR, Portal, Cookies, Audit
│   │   ├── components/         # Sidebar, Topbar, LoginModal, UI Badges
│   │   ├── api/client.ts       # Type-safe Axios client
│   │   ├── types/index.ts      # TypeScript interfaces
│   │   ├── App.tsx             # Root component & routing
│   │   └── main.tsx            # React mount point
│   ├── tailwind.config.js      # Styling configuration
│   └── vite.config.ts          # Vite build & proxy config
├── docker-compose.yml          # Containerized deployment manifest
├── BUILD_PROGRESS.md           # Granular build log and milestone manifest
├── SYSTEM_ARCHITECTURE_AND_FEATURE_GUIDE.md # 485-line comprehensive architecture reference
└── README.md                   # Master project documentation (this file)
```
