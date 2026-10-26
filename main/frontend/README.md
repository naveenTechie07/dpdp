# Srujana (DataSentinel) — Frontend Dashboard & Citizen Portal

> **Client Application:** High-performance Single Page Application (SPA) built with React 18, Vite, TypeScript, and Tailwind CSS.  
> **UI Paradigms:** Dual-Interface design (Enterprise Compliance Center for MSME Business Owners vs. Self-Service Privacy Rights Portal for Citizens/Patients).  
> **Visualization:** Interactive data lineage graph powered by `@xyflow/react` (React Flow).

---

## 🎨 Design Philosophy & User Experience

Built specifically for the non-technical small business owner (e.g., Ramesh Kumar, clinic managing partner) and individual Indian citizens:
* **Zero Legalese:** Complex statutory DPDP requirements are distilled into clear, actionable cards, badges, and step-by-step wizards.
* **Dual-Persona Switcher:** Effortlessly switch between the **🏢 MSME Enterprise Dashboard** and the **👤 Citizen Privacy Portal**.
* **Visual Data Lineage:** Full interactive pipeline diagrams showing where data originates, where it is stored, and which third parties receive it.
* **Responsive & Accessible:** Dark-accents, data-dense layout, high-contrast typography, and accessible micro-animations.

---

## 🧭 Page Architecture & Modules

```
main/frontend/src/
├── pages/
│   ├── OverviewPage.tsx            # Executive compliance dashboard (DPO health score, pending DSRs, asset breakdown)
│   ├── DiscoveryPage.tsx           # Drag-and-drop file upload, scan progress, PII detection table & risk flags
│   ├── RopaPage.tsx                # Article 30 / DPDP Sec 8 RoPA register + interactive React Flow graph
│   ├── GovernancePage.tsx          # Governed data asset directory, classification tiers & statutory rules catalog
│   ├── ConsentPage.tsx             # Multilingual notice previewer (EN/HI/KN), affirmative consent ledger & receipts
│   ├── DsrAdminPage.tsx            # Administrative rights intake pipeline (Access, Correction, Erasure, Grievance)
│   ├── DataPrincipalPortal.tsx     # Citizen self-service portal (view stored data, update records, request erasure)
│   ├── CookieGovernancePage.tsx    # Website tracker audit, categorizer & compliance tags
│   └── AuditPage.tsx               # Cryptographic append-only audit trail with filterable event viewer
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx             # Collapsible navigation sidebar with status indicator & logout
│   │   └── Topbar.tsx              # Tenant workspace selector, notifications, user avatar & role badge
│   ├── auth/
│   │   └── LoginModal.tsx          # Dual MSME / Citizen registration & login modal with 1-click demo accounts
│   └── ui/
│       └── Badge.tsx               # Standardized status tags (CRITICAL, HIGH, ACTIVE, PENDING)
├── api/
│   └── client.ts                   # Type-safe Axios API client with automatic JWT header attachment
├── types/
│   └── index.ts                    # TypeScript interface definitions for all data structures
├── App.tsx                         # Root routing, session persistence & modal manager
└── main.tsx                        # Application mount point
```

---

## 🌟 Key User Interfaces

### 1. Executive Compliance Dashboard (`OverviewPage.tsx`)
* **DPDP Readiness Score:** Real-time percentage indicator based on active RoPA records, verified consent receipts, and resolved DSRs.
* **Metrics Cards:** Total PII Records Tracked, High-Risk Flags, Active Consents, Open DSR Requests.
* **Quick Actions:** Instant triggers for "Upload New Data Source", "Issue Consent Notice", and "Report Security Incident".

### 2. Data Discovery & PII Scanner (`DiscoveryPage.tsx`)
* Drag-and-drop upload for `.xlsx`, `.xls`, and `.csv` files.
* Displays detected Indian PII types: **12-digit Aadhaar (Verhoeff verified)**, **PAN cards**, **Indian Mobile Numbers**, and **Clinical Health Keywords**.
* Automated risk flag generation with suggested remediations.

### 3. RoPA & React Flow Lineage Graph (`RopaPage.tsx`)
* Tabular Record of Processing Activities satisfying DPDP Section 8.
* **Interactive Relationship Diagram:** Powered by `@xyflow/react`:
  * Source nodes (e.g., *WhatsApp Ingestion*, *Reception Desk*)
  * Activity nodes (e.g., *Patient Consultation & Diagnostics*)
  * Storage nodes (e.g., *Local Drive*, *Tally Invoices*)
  * Recipient nodes (e.g., *Partner Diagnostic Labs*)
* Supports interactive zoom, pan, mini-map, and custom styled nodes.

### 4. Multilingual Notice & Consent Builder (`ConsentPage.tsx`)
* Dynamic language selector rendering statutory notices in:
  * 🇬🇧 **English (`en`)**
  * 🇮🇳 **हिन्दी Hindi (`hi`)**
  * 🇮🇳 **ಕನ್ನಡ Kannada (`kn`)**
* Displays the verifiable **SHA-256 Consent Receipt** generated for every affirmative action.
* One-click WhatsApp message template copy button for clinic receptionists.

### 5. Citizen Privacy Rights Portal (`DataPrincipalPortal.tsx`)
* Dedicated interface for patients and consumers.
* Allows citizens to view all personal data held by the clinic.
* Exercise rights under DPDP Sections 11–13:
  * Request data summary (Right to Access)
  * Correct outdated phone number or address (Right to Correction)
  * Request deletion with statutory tax conflict explanation (Right to Erasure)
  * Register a nominee for emergency situations (Right to Nominate)
  * Lodge a complaint with the Data Protection Officer (Right of Grievance Redressal)

---

## 🚀 Getting Started

### Prerequisites
* **Node.js:** v18+ (LTS recommended)
* **npm:** v9+

### Development Setup

```bash
# 1. Navigate to the frontend directory
cd main/frontend

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

* **Frontend Dashboard URL:** [http://localhost:5173](http://localhost:5173)
* **Backend API Proxy:** Requests to `/api/*` are automatically proxied to the backend at `http://localhost:5000` via `vite.config.ts`.

### Production Build

```bash
# Compile TypeScript and create production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🔑 Demo Access Credentials

The application features built-in 1-click test credentials accessible directly from the login modal:

| Persona | Email | Password | Intended Role |
| :--- | :--- | :--- | :--- |
| **MSME Business Admin** | `ramesh.kumar@aarogyadiagnostics.in` | `Password123!` | Managing Partner (Full Enterprise Access) |
| **Individual Citizen** | `rahul.sharma@example.com` | `Password123!` | Patient / Consumer (Citizen Portal Access) |
