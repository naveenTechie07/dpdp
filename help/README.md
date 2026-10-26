# Srujana 2026 Hackathon Documentation & Evaluation Hub
### Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)

**Srujana Tech Fest 2026 | 48-Hour Software Hackathon (24–26 October 2026)**  
**Theme:** Legal Services | **Problem Statement ID:** LS-04  
**Track:** Final Evaluation Dossier & Full-Stack Implementation  

---

## 📚 Overview of Help & Evaluation Documents

This directory contains the comprehensive documentation dossiers, statutory legal analyses, architectural blueprints, and evaluation materials prepared for the Srujana Tech Fest 2026 evaluation jury:

| Document | Purpose & Key Content | Direct Link |
| :--- | :--- | :--- |
| **Problem Statement LS-04 Specification** | Official problem statement breakdown, SME informal systems context, pain points of 63.4M Indian MSMEs, and evaluation scope. | [`Problem_Statement_LS04_Specification.md`](./Problem_Statement_LS04_Specification.md) |
| **Executive Summary Dossier** | Complete high-level project summary, target persona (*Ramesh Kumar, Aarogya Polyclinic*), 4 functional pillars, and business impact. | [`DPDP_Secure_Executive_Summary.md`](./DPDP_Secure_Executive_Summary.md) |
| **Statutory Compliance Matrix** | Detailed mapping of statutory mandates under **DPDP Act 2023**, **DPDP Rules 2025**, and **CGST Act 2017 Section 36** tax retention rules. | [`DPDP_Secure_Statutory_Compliance_Matrix.md`](./DPDP_Secure_Statutory_Compliance_Matrix.md) |
| **Technical Architecture Dossier** | Complete design decisions, modular monolith breakdown, Verhoeff mathematical algorithm, and 100% offline compute philosophy. | [`DPDP_Secure_Technical_Architecture.md`](./DPDP_Secure_Technical_Architecture.md) |
| **SME Realistic Scenarios** | 4 real-world operational scenarios (WhatsApp prescription ingestion, Excel formula preservation, DSR tax conflicts, 5-minute breach pack). | [`DPDP_Secure_SME_Realistic_Scenarios.md`](./DPDP_Secure_SME_Realistic_Scenarios.md) |
| **Demo Flow & Jury Pitch Script** | Step-by-step 7-minute live demonstration flow, presentation talking points, and anticipated jury Q&A. | [`DPDP_Secure_Demo_Flow_And_Pitch_Script.md`](./DPDP_Secure_Demo_Flow_And_Pitch_Script.md) |
| **Complete Running Guide** | Quickstart instructions for running both the primary full-stack platform (`main/`) and the live portal (`DPDP_Secure/`). | [`DPDP_Secure_Complete_Running_Guide.md`](./DPDP_Secure_Complete_Running_Guide.md) |
| **Automated Verification Report** | Test suite execution logs and pass verification (33/33 tests passing with zero failures). | [`AUTOMATED_VERIFICATION_REPORT.md`](./AUTOMATED_VERIFICATION_REPORT.md) |
| **Final Submission Checklist** | Rule compliance audit across Rule 139, Rule 141, repository hygiene, and evaluation criteria readiness. | [`FINAL_SUBMISSION_CHECKLIST.md`](./FINAL_SUBMISSION_CHECKLIST.md) |

---

## 🏛️ The Dual Implementation Architectures

Our submission provides two complementary, production-grade implementations addressing both the modern full-stack web and server-side compliance needs:

### 1. Primary Full-Stack Platform: Srujana DataSentinel ([`main/`](../main/))
* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, `@xyflow/react` (React Flow data lineage graph).
* **Backend:** Node.js (v18+), Express, TypeScript, Prisma ORM (PostgreSQL/SQLite), Zod validation.
* **Offline PII Engine:** Python 3.10 with Pandas, OpenPyXL, and mathematical **Verhoeff Dihedral Group $D_5$ Aadhaar checksum**.
* **Dual Personas:**
  * 🏢 **MSME Enterprise Center:** Complete compliance workspace for the business owner.
  * 👤 **Citizen Privacy Rights Portal:** Self-service portal for patients/customers to inspect data, request corrections, and lodge grievances.
* **Quickstart:**
  ```bash
  # Docker Compose (1-click)
  docker-compose -f main/docker-compose.yml up --build
  
  # Or Two Terminals:
  cd main/backend && npm install && npx prisma db push && npm run dev
  cd main/frontend && npm install && npm run dev
  ```
* **Documentation:** Master guide in [`main/README.md`](../main/README.md), frontend in [`main/frontend/README.md`](../main/frontend/README.md), backend in [`main/backend/README.md`](../main/backend/README.md).

### 2. Live Deployed Enterprise Privacy Centre ([`DPDP_Secure/`](../DPDP_Secure/))
* **Stack:** Node.js, Express, EJS glassmorphic SSR UI, SQLite embedded database.
* **Features:** 55 statutory compliance views, consent ledger, DSR workflows, RoPA registry, cookie scanners, and DPBI breach wizard.
* **Live Vercel Deployment:** [https://srujana-hackathon2026-codeplays.vercel.app](https://srujana-hackathon2026-codeplays.vercel.app)
* **Local Launch:**
  ```bash
  cd DPDP_Secure
  npm install
  node server.js
  ```
* **Test Verification:** 33/33 tests passing (`verifyAllModules.test.js` & `testRopaEndToEnd.js`).

---

## 🏆 Srujana Tech Fest 2026 — 100-Point Evaluation Rubric

| Rubric Criterion | Weight | How Our Project Satisfies the Requirement |
| :--- | :---: | :--- |
| **Problem Statement & Relevance** | **15 pts** | Grounded in the reality of Ramesh Kumar (Aarogya Polyclinic) with 6,200 patient records scattered across WhatsApp, unencrypted Excel, and desktop billing tools. |
| **Tech Strategy & Legal Rigor** | **20 pts** | 100% offline local compute architecture; strict compliance with DPDP Act 2023, DPDP Rules 2025, and **CGST Act Section 36** 72-month tax lock conflict resolver. |
| **Implementation & Completeness** | **25 pts** | Fully working React 18 SPA + Express TypeScript Modular Monolith + 55 EJS enterprise views + 33/33 automated tests passing. |
| **Presentation & Live Demo** | **20 pts** | Live cloud deployment on Vercel + polished presentation script in [`DPDP_Secure_Demo_Flow_And_Pitch_Script.md`](./DPDP_Secure_Demo_Flow_And_Pitch_Script.md). |
| **Viability & Real-World Impact** | **20 pts** | Zero-cloud-leakage, zero subscription fees, and designed specifically for non-technical small business owners. |
| **Total Score** | **100 pts** | **Comprehensive Full-Stack Implementation Ready for Evaluation** |

---

## ⚖️ Professional Boundaries & Statutory Disclaimer
*In accordance with Rule 139 of Srujana Tech Fest 2026:*
> **Disclaimer:** This project is an operational compliance and technical governance prototype designed to assist small enterprises in implementing data protection safeguards under the Digital Personal Data Protection Act, 2023. Automated notices, reports, and assessments do not constitute formal legal counsel or binding legal advice.
