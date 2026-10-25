# DPDP_Secure: 15 Standalone Implementation Prompts Index
## Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)
### Srujana Tech Fest 2026 | Legal Services Track | Srujana Hackathon

---

## Executive Overview

This directory contains **15 standalone, individual markdown prompt specifications** to systematically transform and elevate `DPDP_Secure` into a complete, hackathon-winning application.

Each prompt is self-contained, with complete technical context, exact target files, prompt instructions for the AI/engineer, implementation specifications, and step-by-step verification commands.

---

## Master Architecture Rules
1. **Brand Identity Protection:** Strict and mandatory compliance. NEVER write, generate, or commit any legacy or deprecated brand names. Always and strictly use **`DPDP_Secure`** across all code, views, routes, headers, and documentation.
2. **Directory Isolation:** All work executes strictly inside the **`DPDP_Secure`** directory.
3. **Preserve & Elevate Existing Features:** Retain and enhance the existing 54 Express routes, 55 EJS templates, and custom CSS design system (`public/css/style.css`), adapting them into a unified, high-performance SME privacy management platform.
4. **100% Offline-First / Zero Cloud Egress Security:** All sensitive PII extraction, validation, and redaction must run locally within the Node.js runtime to prevent confidential SME data leaks.
5. **Open-Source LLM / API Flexibility:** Integrate local open-source LLMs (Ollama / Llama 3) with cloud API fallback (Groq / Gemini / OpenAI-compatible) for intelligent multilingual translation and privacy advisory.
6. **Vercel Production Readiness:** The final prompt (Prompt 15) packages the complete application for serverless deployment on Vercel with zero regressions.

---

## The 15 Sequential Implementation Prompts

| # | Prompt File | Scope & Deliverable | Primary Target Files |
|---|---|---|---|
| **01** | [**`PROMPT_01_Architecture_Harmonization.md`**](PROMPT_01_Architecture_Harmonization.md) | Modular MVC Architecture, Directory Setup & Dependencies | `package.json`, `.env.example`, `src/config/`, `server.js` |
| **02** | [**`PROMPT_02_Design_System_SME_Dashboard.md`**](PROMPT_02_Design_System_SME_Dashboard.md) | Enterprise Design System, Glassmorphic Theme & SME Dashboard UI | `public/css/style.css`, `views/partials/header.ejs`, `views/index.ejs` |
| **03** | [**`PROMPT_03_Google_OAuth_RBAC.md`**](PROMPT_03_Google_OAuth_RBAC.md) | Google OAuth 2.0 Integration & Session-Based Multi-Role RBAC | `src/config/passport.js`, `src/middlewares/authMiddleware.js`, `views/auth-login.ejs` |
| **04** | [**`PROMPT_04_Persistence_Layer_Data_Models.md`**](PROMPT_04_Persistence_Layer_Data_Models.md) | Local SQLite Persistence Layer & SME Data Models | `src/models/db.js`, `src/models/seed.js`, `src/models/index.js` |
| **05** | [**`PROMPT_05_Indian_PII_Verhoeff_Engine.md`**](PROMPT_05_Indian_PII_Verhoeff_Engine.md) | Deterministic Indian PII Engine & Verhoeff $D_5$ Aadhaar Validator | `src/services/verhoeffAlgorithm.js`, `src/services/indianPiiEngine.js` |
| **06** | [**`PROMPT_06_Informal_Silo_File_Parsers.md`**](PROMPT_06_Informal_Silo_File_Parsers.md) | Informal Silo File Parsers (WhatsApp, Excel, Tally CSV) | `src/services/fileParsers.js`, `src/controllers/discoveryController.js` |
| **07** | [**`PROMPT_07_Interactive_Scanner_RoPA.md`**](PROMPT_07_Interactive_Scanner_RoPA.md) | Interactive Silo Scanner UI & Automated RoPA Synthesis | `views/discovery-connectors.ejs`, `views/inventory-ropa.ejs`, `public/js/discoveryScanner.js` |
| **08** | [**`PROMPT_08_LLM_AI_Integration_Layer.md`**](PROMPT_08_LLM_AI_Integration_Layer.md) | Open-Source LLM & AI API Integration Layer (Ollama / Groq / Gemini) | `src/services/aiService.js`, `views/partials/ai-assistant-modal.ejs` |
| **09** | [**`PROMPT_09_Section_5_Notice_WhatsApp_Consent.md`**](PROMPT_09_Section_5_Notice_WhatsApp_Consent.md) | Section 5 Multilingual Notice Builder & 1-Click WhatsApp Opt-in | `views/consent-collectionpoints.ejs`, `views/consent-ledger.ejs` |
| **10** | [**`PROMPT_10_Citizen_DSR_Section_11_12_Workflows.md`**](PROMPT_10_Citizen_DSR_Section_11_12_Workflows.md) | Citizen DSR Intake Portal & Section 11/12 Access Workflows | `views/public-dsr-portal.ejs`, `views/privacy-requests.ejs` |
| **11** | [**`PROMPT_11_CGST_Tax_Lock_Collision_Resolver.md`**](PROMPT_11_CGST_Tax_Lock_Collision_Resolver.md) | Statutory Collision Resolver (CGST 6-Yr Tax Lock vs. DPDP Erasure) | `src/services/statutoryCollisionResolver.js`, `src/services/certificateGenerator.js` |
| **12** | [**`PROMPT_12_Breach_Triage_Threat_Modeling.md`**](PROMPT_12_Breach_Triage_Threat_Modeling.md) | SME Breach Threat Modeling & Incident Triage Engine | `views/incidents-dashboard.ejs`, `views/incidents-management.ejs` |
| **13** | [**`PROMPT_13_72Hour_DPBI_Dossier_Citizen_Alerts.md`**](PROMPT_13_72Hour_DPBI_Dossier_Citizen_Alerts.md) | 72-Hour DPBI Regulatory Intimation Dossier & Plain Citizen Alerts | `src/services/dossierGenerator.js`, `views/dpbi-dossier-print.ejs` |
| **14** | [**`PROMPT_14_E2E_Testing_Demo_Seeder.md`**](PROMPT_14_E2E_Testing_Demo_Seeder.md) | Unified End-to-End Workflow Testing, Audit Trail & Demo Seeder | `src/models/demoSeeder.js`, `tests/e2eWorkflow.test.js`, `views/settings-audit-log.ejs` |
| **15** | [**`PROMPT_15_Production_Hardening_Vercel_Deploy.md`**](PROMPT_15_Production_Hardening_Vercel_Deploy.md) | Production Hardening, Serverless Packaging & Vercel Deployment | `vercel.json`, `api/index.js`, `DEPLOYMENT.md`, `.vercelignore` |

---

## How to Execute

Each prompt file contains a prominent **`DIRECT COPY-PASTE PROMPT`** block designed for 1-click execution:
1. Open any prompt file (e.g. [`PROMPT_01_Architecture_Harmonization.md`](PROMPT_01_Architecture_Harmonization.md)).
2. Copy the entire code block starting with `/goal`.
3. Paste directly into your Antigravity chat or terminal window.
4. The agent will execute the exact step with all cybersecurity guardrails, verify it locally, and report completion.
5. Proceed sequentially from Prompt 01 to Prompt 15 for complete end-to-end implementation.
