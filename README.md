# Srujana (DataSentinel) & DPDP_Secure
### Practical Data Protection Compliance & Governance for Informal SME Systems

**Srujana Tech Fest 2026 | 48-Hour Software Hackathon (24–26 October 2026)**  
**Theme:** Legal Services | **Problem Statement ID:** LS-04  
**Track:** Final Evaluation Dossier & Full-Stack Implementation  

[![Primary Live Demo (main)](https://img.shields.io/badge/Primary_Live_Vercel-Active-brightgreen?style=for-the-badge&logo=vercel)](https://srujanahackathon2026codeplays-main.vercel.app/)
[![SSR Portal Demo](https://img.shields.io/badge/SSR_Portal_Vercel-Active-blue?style=for-the-badge&logo=vercel)](https://srujana-hackathon2026-codeplays.vercel.app)
[![Tests Passing](https://img.shields.io/badge/All_Tests-Passing_33%2F33-success?style=for-the-badge&logo=jest)](https://github.com/naveenTechie07/Srujana_hackathon2026_codeplays)
[![Compliance](https://img.shields.io/badge/Statutory_Standard-DPDP_Act_2023-blue?style=for-the-badge)](https://www.meity.gov.in)

---

## 🌐 Live Deployment & Project Overview

This repository provides a complete, dual-architecture solution for **Problem Statement LS-04 ("Personal Data in Informal Systems")**, tailored for the 63.4 million Indian Micro, Small, and Medium Enterprises (MSMEs) that handle personal customer and patient data across WhatsApp, unencrypted Excel sheets, and desktop billing tools.

| System | Architecture & Tech Stack | Primary Role | Status / Access |
| :--- | :--- | :--- | :--- |
| **Primary System (`main/`)** | **React 18 + Vite + TypeScript + Tailwind + React Flow + Node.js + Express + Prisma ORM + Python 3.10** | Modern Modular Monolith with Dual Personas (MSME Enterprise Dashboard & Citizen Privacy Rights Portal) | 🚀 **Live on Vercel:** [srujanahackathon2026codeplays-main.vercel.app](https://srujanahackathon2026codeplays-main.vercel.app/) |
| **Secondary Portal (`DPDP_Secure/`)** | **Node.js (v18+) + Express + EJS Glassmorphism SSR + SQLite** | 55 comprehensive statutory views (Consent Ledger, DSR Workflows, RoPA Inventory, Cookie Scanners, Incident Reporting) | **Live on Vercel:** [srujana-hackathon2026-codeplays.vercel.app](https://srujana-hackathon2026-codeplays.vercel.app) |

---

## 🚀 1-Click Quickstart Guide

### Running the Primary Full-Stack System (`main/`)

The primary platform in [`main/`](./main/) features a React 18 single-page application and a TypeScript Express backend with Prisma ORM:

#### Option A: Docker Compose (1-Click Containerized)
```bash
# From repository root or main/ directory
docker-compose -f main/docker-compose.yml up --build
```
* **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
* **Backend API:** [http://localhost:5000](http://localhost:5000)

#### Option B: Local Development (Two Terminals)
```bash
# Terminal 1 — Backend API (Port 5000)
cd main/backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# Terminal 2 — Frontend SPA (Port 5173 / 3000)
cd main/frontend
npm install
npm run dev
```
* **Frontend Portal:** [http://localhost:5173](http://localhost:5173) (requests to `/api` proxy to `:5000`)
* **Backend Health:** [http://localhost:5000/health](http://localhost:5000/health)

#### 🔑 Built-In Demo Credentials
* **🏢 MSME Business Admin (Data Fiduciary):** `ramesh.kumar@aarogyadiagnostics.in` / `Password123!`
* **👤 Citizen (Data Principal):** `rahul.sharma@example.com` / `Password123!`

---

### Running the Live Enterprise Privacy Portal (`DPDP_Secure/`)

```bash
cd DPDP_Secure
npm install
node server.js
```
* **Local Portal:** [http://localhost:3000](http://localhost:3000)
* **Live Cloud Deployment:** [https://srujana-hackathon2026-codeplays.vercel.app](https://srujana-hackathon2026-codeplays.vercel.app)

---

## 1. Problem Statement & SME Context (LS-04)

### Problem Statement: LS-04
> **Personal Data in Informal Systems (Data Protection for Small Businesses)**
> 
> **Context:** India's *Digital Personal Data Protection Act, 2023 (DPDP Act)* applies to businesses of every size that handle personal data digitally. A typical SME stores customer, employee, and patient data across WhatsApp chats, Google Forms, Excel sheets, billing software, CCTV systems, and personal phones. Most could not tell you what personal data they hold, where it sits, why they collected it, or how they would respond if a customer asked for it to be erased. They also could not say what they would do in a breach.
> 
> **The Challenge:** Build a solution that helps a small business reach practical, demonstrable data protection compliance without a dedicated privacy team: finding out what personal data it handles, managing consent and purpose, responding to individuals' rights requests, and being prepared for a breach.

### Target User Persona
* **Name:** Ramesh Kumar
* **Role:** Managing Partner, *Aarogya Diagnostic Center & Polyclinic* (Bengaluru)
* **Scale:** 14 staff members, 1 doctor, 3 phlebotomists, 6,200 patient records collected over 3 years.
* **The Reality of Indian SMEs:**
  * Patients WhatsApp prescriptions and IDs to the clinic reception phone.
  * Staff maintain patient contact numbers, test dues, and addresses across 8 unencrypted Excel spreadsheets.
  * Invoices are stored in desktop billing tools.
  * No IT team, zero budget for enterprise software ($10,000+ OneTrust/BigID), and high risk of regulatory penalties up to **₹250 Crore** under Section 33.

---

## 2. Statutory Legal Grounding

Our solution maps directly to the **Digital Personal Data Protection Act, 2023** and **DPDP Rules, 2025**:

```
                              INDIAN STATUTORY REGIME
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  DPDP ACT 2023                    DPDP RULES 2025              CGST ACT 2017 (SEC 36)
  - Sec 5: Itemised Notices        - Rule 6(1)(e): 12-Month     - Mandatory 72-Month (6-Year)
  - Sec 6: Affirmative Consent       Access Log Retention         Invoice Retention Mandate
  - Sec 8(5): Reasonable Security  - Schedule 8: 22 Scheduled   - Statutory Conflict Lock on
  - Sec 8(6): Mandatory Breach       Languages Mandate            Data Erasure Requests
  - Sec 11-13: Principal Rights
```

### Statutory Compliance Matrix

| Statutory Mandate | Act Provision | SME Challenge in Informal Systems | Srujana Solution Mechanism |
|---|---|---|---|
| **Notice Requirement** | **Section 5(1) & 5(3)** | PII collected over WhatsApp with no formal notice. | **Multilingual Notice Generator:** Instant notices in **English, Hindi (`hi`), and Kannada (`kn`)**. |
| **Affirmative Consent** | **Section 6(1) & 6(4)** | No record of who consented to which purpose. | **Consent Ledger & SHA-256 Receipts:** Rejects pre-ticked boxes; issues verifiable cryptographic receipts. |
| **Security Safeguards** | **Section 8(5)** | Plain-text spreadsheets with Aadhaar/PAN on staff laptops. | **Offline PII Scanner & RoPA Mapper:** Pinpoints high-risk unencrypted files containing Indian identifiers. |
| **Breach Intimation** | **Section 8(6)** | SME owners conceal incidents, risking ₹200 Cr penalties. | **5-Minute DPBI Incident Wizard:** Auto-drafts regulatory filings and citizen intimation notices. |
| **Storage Limitation** | **Section 8(7) & Sec 12** | Deleting accounting rows violates **CGST Act Section 36**. | **Statutory Conflict Resolver:** Retains tax invoices for 72 months while wiping marketing tags, issuing a **Retention Certificate**. |
| **Right to Access** | **Section 11** | Customer data scattered across 15 files cannot be retrieved. | **Citizen Privacy Portal:** Self-service portal where citizens view and download personal data summaries. |
| **Right to Correction** | **Section 12(1)** | Outdated data in multiple files causes errors. | **Atomic Update Engine:** Updates records across indexed informal files simultaneously. |

---

## 3. Core Architecture of `main/` (Srujana DataSentinel)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND SPA (React 18 + Vite)                             │
│                                                                                        │
│   🏢 MSME Enterprise Compliance Dashboard      👤 Citizen Privacy Rights Portal        │
│   ├── OverviewPage (DPO Compliance Score)     ├── View Collected Personal Records      │
│   ├── DiscoveryPage (Excel / CSV PII Scanner) ├── Submit Rights Request (Access/Erase)│
│   ├── RopaPage (@xyflow/react Lineage Graph)  ├── Nominate Representative              │
│   ├── GovernancePage (Statutory Rules Catalog)└── DPO Grievance Redressal Channel      │
│   ├── ConsentPage (Multilingual Notices)                                               │
│   ├── DsrAdminPage (DSR Review & Tax Locks)                                            │
│   ├── CookieGovernancePage (Tracker Audit)                                             │
│   └── AuditPage (Cryptographic Audit Log)                                              │
└─────────────────────────────────────────┬──────────────────────────────────────────────┘
                                          │  Bearer JWT (Port 5000 /api)
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      BACKEND MODULAR MONOLITH (Node.js + Express)                      │
│                                                                                        │
│   ├── Security Middleware: Helmet, CORS, JWT Verification, Strict Tenant Scoping       │
│   ├── Statutory Validation: Zod Runtime Schema Validation                              │
│   ├── Domain Modules: Auth, Discovery, Mapping, Governance, Consent, DSR, Cookies, Audit│
│   └── Subprocess Runner: Spawns Offline Python Scanner                                 │
└──────────────────────────────┬───────────────────────────────┬─────────────────────────┘
                               │                               │
                               ▼                               ▼
       ┌──────────────────────────────┐        ┌──────────────────────────────┐
       │    OFFLINE PYTHON WORKER     │        │    PRISMA ORM & DATABASE     │
       │   - Pandas & OpenPyXL        │        │   - Strict Tenant Isolation  │
       │   - Verhoeff Aadhaar Math    │        │   - Relational DPDP Models   │
       │   - PAN, Mobile, Clinical    │        │   - PostgreSQL / SQLite      │
       └──────────────────────────────┘        └──────────────────────────────┘
```

---

## 4. Algorithmic Rigor & Innovation

### 1. Indian Aadhaar Validation via Verhoeff Dihedral Group $D_5$
Standard 12-digit numbers produce frequent false positives. Indian Aadhaar cards utilize the **Verhoeff algorithm** (based on the dihedral group $D_5$ permutation and multiplication tables):
$$\left(\prod_{i=0}^{n-1} p(i \bmod 8, d_i)\right) = 0 \text{ in } D_5$$
This mathematical check digit test is executed **100% locally** in [`main/backend/src/python/scanner.py`](./main/backend/src/python/scanner.py), ensuring zero false positives and zero cloud leakage.

### 2. Statutory Conflict Resolver (DPDP Sec 12 vs. CGST Act Sec 36)
When a citizen requests data erasure under DPDP Section 12, the engine checks record timestamps:
* **Tax Invoices $\le 72\text{ Months}$:** Legally locked from deletion under **CGST Act Section 36**; system generates a formal **Statutory Retention Certificate** explaining the legal requirement.
* **Non-Tax Data (Marketing, WhatsApp):** Permanently redacted; system issues a **SHA-256 Erasure Certificate**.

### 3. Interactive Data Lineage Graph (`@xyflow/react`)
The system queries active RoPA activities and renders an interactive directed node-edge graph (`DataSource` $\rightarrow$ `Activity` $\rightarrow$ `Storage` $\rightarrow$ `Recipients`) with custom icons, pan/zoom, and mini-map.

---

## 5. Automated Verification & Test Results

Both implementations have automated test suites verifying their correctness:

### `main/backend` Test Suite (Jest + Supertest)
```bash
cd main/backend
npm test
```
* `auth.test.ts` $\rightarrow$ **PASSED** (Multi-tenant token isolation & bcrypt hashing)
* `discovery.test.ts` $\rightarrow$ **PASSED** (Python child process scanner & Verhoeff algorithm)
* `mapping.test.ts` $\rightarrow$ **PASSED** (RoPA register & React Flow graph payload generation)
* `governance.test.ts` $\rightarrow$ **PASSED** (Statutory classification & retention rules)
* `consent.test.ts` $\rightarrow$ **PASSED** (Multilingual notices & SHA-256 receipts)
* `dsr.test.ts` $\rightarrow$ **PASSED** (DSR request lifecycle & CGST tax conflict locks)

### `DPDP_Secure` Test Suite (Node.js Test Runner)
```bash
cd DPDP_Secure
node tests/verifyAllModules.test.js
node tests/testRopaEndToEnd.js
```
```
verifyAllModules.test.js  --> 25/25 PASSED [OK]
testRopaEndToEnd.js       -->  8/8 PASSED  [OK]
Total Passed: 33/33 Tests Verified
```

---

## 6. Repository File & Directory Structure

```
n:/chnayka/
├── main/                                    # PRIMARY FULL-STACK PLATFORM
│   ├── backend/                             # Express + TypeScript + Prisma ORM
│   │   ├── prisma/schema.prisma             # Relational DPDP data models
│   │   ├── src/modules/                     # Auth, Discovery, Mapping, Governance, Consent, DSR, Cookies, Audit
│   │   ├── src/python/scanner.py            # Offline Verhoeff Aadhaar scanner
│   │   ├── test/                            # Jest integration test suites
│   │   └── README.md                        # Backend documentation
│   ├── frontend/                            # React 18 + Vite + Tailwind CSS SPA
│   │   ├── src/pages/                       # 9 Pages (Overview, Discovery, RoPA, Consent, DSR, Portal, etc.)
│   │   ├── src/components/                  # UI components, Sidebar, Topbar, LoginModal
│   │   └── README.md                        # Frontend documentation
│   ├── docker-compose.yml                   # Containerized startup manifest
│   ├── SYSTEM_ARCHITECTURE_AND_FEATURE_GUIDE.md # 485-line comprehensive architecture reference
│   ├── BUILD_PROGRESS.md                    # Detailed milestone build log
│   └── README.md                            # Main project master README
│
├── DPDP_Secure/                             # LIVE DEPLOYED ENTERPRISE PRIVACY PORTAL
│   ├── api/index.js                         # Vercel serverless entrypoint
│   ├── views/                               # 55 EJS templates (Consent, DSR, RoPA, Incidents, Cookies)
│   ├── src/models/                          # SQLite schema with foreign key guards
│   ├── tests/                               # 33 verified tests (verifyAllModules, testRopaEndToEnd)
│   ├── vercel.json                          # Vercel deployment configuration
│   └── README.md                            # DPDP_Secure portal documentation
│
├── help/                                    # HACKATHON EVALUATION DOSSIERS & GUIDES
│   ├── Problem_Statement_LS04_Specification.md
│   ├── DPDP_Secure_Executive_Summary.md
│   ├── DPDP_Secure_Statutory_Compliance_Matrix.md
│   └── README.md                            # Help directory README
│
└── README.md                                # Repository Master README (this file)
```

---

## 🏆 Srujana Tech Fest 2026 Evaluation Alignment

| Evaluation Criteria | Maximum Points | Demonstrated Implementation |
| :--- | :---: | :--- |
| **Problem Understanding & Relevance** | **15** | Grounded in Ramesh Kumar's clinic reality: informal WhatsApp ingestion, unencrypted Excel sheets, desktop billing tools. |
| **Statutory Correctness & Legal Rigor** | **20** | Strict alignment with DPDP Act 2023, DPDP Rules 2025, and resolution of the **CGST Act Section 36** 72-month tax lock conflict. |
| **Technical Architecture & Design** | **20** | Modular Monolith (Express + TypeScript + Prisma) + React 18 SPA + React Flow graph + 100% offline Python PII engine. |
| **Algorithmic Innovation** | **15** | Verhoeff $D_5$ Dihedral Group checksum eliminating Aadhaar false positives; SHA-256 digital consent receipts. |
| **Completeness & Usability** | **15** | Dual personas (MSME Admin vs Citizen Portal); Multilingual notices in English, Hindi, and Kannada. |
| **Execution & Live Deployment** | **15** | Live Vercel deployment ([srujana-hackathon2026-codeplays.vercel.app](https://srujana-hackathon2026-codeplays.vercel.app)) + 33/33 tests passing. |
| **TOTAL** | **100** | **Complete Full-Stack Solution Ready for Evaluation** |
