# Srujana (DataSentinel) — Backend API Service

> **Core Engine:** Modular Monolith REST API built with Node.js, Express, TypeScript, and Prisma ORM.  
> **Statutory Domain:** Digital Personal Data Protection Act, 2023 (DPDP Act) & DPDP Rules, 2025 (India).  
> **Compliance Target:** Micro, Small & Medium Enterprises (MSMEs) & Indian Citizens.

---

## 🏗️ Architectural Overview

The Srujana backend is engineered as a **Modular Monolith**. Each privacy domain operates within an isolated module containing its own controller, service, routes, and validation schemas, unified through strict multi-tenant isolation and append-only audit logging.

```
main/backend/
├── prisma/
│   ├── schema.prisma             # Relational data model (Tenants, Users, RoPA, Consent, DSR, Assets, Audit)
│   └── seed.ts                   # Seed script for tenants, legal rules, and demo accounts
├── src/
│   ├── config/
│   │   └── env.ts                # Validated environment variables (JWT secret, DB URL, Port)
│   ├── middleware/
│   │   ├── auth.ts               # JWT signature verification & role assignment
│   │   ├── tenant.ts             # Strict tenant isolation (enforces req.tenantId on Prisma queries)
│   │   └── errorHandler.ts       # Centralized error handler with DPDP violation codes
│   ├── modules/
│   │   ├── auth/                 # Dual registration (MSME vs Citizen), bcrypt hashing, JWT issuance
│   │   ├── discovery/            # File upload, child process spawning of Python scanner, risk flags
│   │   ├── mapping/              # RoPA registers, data elements, flows, recipients, React Flow graph API
│   │   ├── governance/           # Deterministic legal rules, asset classification, retention schedules
│   │   ├── consent/              # Multilingual notices (EN, HI, KN), affirmative ledger, SHA-256 receipts
│   │   ├── dsr/                  # Citizen rights intake (Access, Erasure, Correction, Grievance, Nominee)
│   │   ├── cookies/              # Website cookie crawler & categorizer (Essential, Analytics, Marketing)
│   │   ├── platform/             # Tenant workspace metadata, plan configurations, stats
│   │   └── audit/                # Cryptographic append-only event logging
│   ├── python/
│   │   └── scanner.py            # Offline PII detection engine with Verhoeff Aadhaar checksum
│   ├── app.ts                    # Express application configuration & route binding
│   └── index.ts                  # Server entrypoint (Port 5000)
└── test/                         # Jest/Supertest integration test suites
```

---

## ⚡ Key Modules & Capabilities

### 1. Dual-Persona Authentication (`modules/auth`)
* **🏢 MSME Business (Data Fiduciary):** Creates a company tenant workspace, seeds `ADMIN`, `COMPLIANCE_OFFICER`, and `VIEWER` roles, and enables full enterprise compliance management.
* **👤 Individual Citizen (Data Principal):** Creates a personal privacy vault (`plan: CITIZEN`), links mobile/email for statutory notices, and connects to the Citizen Privacy Rights Portal.
* **Demo Credentials Available:**
  * MSME Admin: `ramesh.kumar@aarogyadiagnostics.in` / `Password123!`
  * Citizen Principal: `rahul.sharma@example.com` / `Password123!`

### 2. Offline Data Discovery & PII Engine (`modules/discovery` + `python/scanner.py`)
* Ingests local Excel (`.xlsx`, `.xls`) and CSV files uploaded by the business.
* Spawns an offline Python child process (`scanner.py`) that uses **Pandas** and **OpenPyXL**.
* **Indian Aadhaar Checksum:** Implements the mathematical **Verhoeff algorithm** using dihedral group $D_5$ permutation and multiplication tables to eliminate false positives in 12-digit numbers.
* Detects Indian PAN cards (`[A-Z]{5}[0-9]{4}[A-Z]`), 10-digit Indian mobile numbers (`[6-9]\d{9}`), and clinical healthcare keywords (`prescription`, `diagnosis`, `blood`, `tsh`, `biopsy`).
* Automatically flags unencrypted high-risk PII assets with severity rankings (`CRITICAL`, `HIGH`, `MEDIUM`).

### 3. RoPA & Data Lineage Graph (`modules/mapping`)
* Maintains Article 30 / DPDP Section 8 Records of Processing Activities (RoPA).
* Tracks data lifecycles: `COLLECTION` ➔ `STORAGE` ➔ `SHARING` ➔ `DISPOSAL`.
* Endpoint `GET /api/v1/mapping/graph` exports node-and-edge relationships for dynamic rendering in **React Flow**.

### 4. Statutory Governance & Conflict Engine (`modules/governance`)
* Resolves classifications deterministically without hallucination: `RESTRICTED`, `CONFIDENTIAL`, `INTERNAL`, `PUBLIC`.
* **Statutory Retention Rules:**
  * **Tax Invoices:** Mandatory **72 months (6 years)** under **Section 36 of Central Goods & Services Tax (CGST) Act, 2017**.
  * **Access Logs:** Mandatory **12 months** under **DPDP Rules 2025 Rule 6(1)(e)**.
  * **Clinical Records:** Mandatory **36 months** under National Medical Commission guidelines.
  * **Marketing Leads:** Immediate erasure upon consent withdrawal.

### 5. Multilingual Consent Management (`modules/consent`)
* Generates statutory Section 5 notices in **English (`en`)**, **हिन्दी Hindi (`hi`)**, and **ಕನ್ನಡ Kannada (`kn`)**.
* Rejects pre-ticked or implied consent under DPDP Section 6 (`HTTP 400 DPDP_SEC_6_VIOLATION`).
* Produces tamper-evident **SHA-256 Consent Receipts**:
  $$\text{Digest} = \text{SHA-256}(\text{TenantId} + \text{UserRef} + \text{PurposeId} + \text{CapturedAt})$$

### 6. Citizen Rights & DSR Intake (`modules/dsr`)
* Implements DPDP Sections 11–13: Right to Access, Right to Correction/Updating, Right to Erasure, Nominee Management, and Grievance Redressal.
* Evaluates erasure requests against the **CGST Act Section 36** conflict resolver:
  * Recent invoices $\le 72\text{ months}$ are legally locked; issues a formal retention certificate citing Section 36.
  * Non-tax data $> 72\text{ months}$ is erased with a cryptographic completion certificate.

### 7. Cookie & Tracker Scanner (`modules/cookies`)
* Audits web endpoints for cookies and external tracking scripts.
* Classifies cookies into `ESSENTIAL`, `ANALYTICS`, and `MARKETING`.

### 8. Immutable Audit Trail (`modules/audit`)
* Cryptographic append-only audit log recording every sensitive action with `timestamp`, `ip_address`, `tenant_id`, and `user_id`.

---

## 🚀 Quickstart & Setup

### Prerequisites
* **Node.js:** v18+ (LTS recommended)
* **npm:** v9+
* **Python:** 3.10+ with `pandas` and `openpyxl` (`pip install pandas openpyxl`)

### Installation & Launch

```bash
# 1. Navigate to the backend directory
cd main/backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Generate Prisma Client and apply migrations
npx prisma generate
npx prisma db push

# 5. (Optional) Seed demo data and statutory rules
npm run seed

# 6. Start the API server in development mode
npm run dev
```

* **API Server Port:** `http://localhost:5000`
* **Health Check:** `http://localhost:5000/health`

---

## 🧪 Testing

Run the automated test suite using Jest and Supertest:

```bash
# Run all module tests
npm test

# Run tests with coverage
npm test -- --coverage
```

Test suites cover:
- Authentication & JWT tenant validation (`test/auth.test.ts`)
- Discovery & PII scanner integration (`test/discovery.test.ts`)
- RoPA mapping & graph endpoints (`test/mapping.test.ts`)
- Statutory governance rules (`test/governance.test.ts`)
- Multilingual consent & receipts (`test/consent.test.ts`)
- DSR rights intake & retention conflicts (`test/dsr.test.ts`)
