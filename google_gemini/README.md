# DPDPA for Small Business (Srujana 2026 - LS-04)
**Offline-First Data Protection Compliance Prototype for Indian SMEs**  
*Chanakya University — Srujana Tech Fest 2026 (Problem Statement LS-04: Personal Data in Informal Systems)*

---

## 🎯 Problem Statement LS-04 Context
Under India's **Digital Personal Data Protection Act, 2023 (DPDP Act)**, micro, small, and medium enterprises (MSMEs) store sensitive customer, employee, and patient data across informal channels:
- WhatsApp chats with lab reports & prescriptions
- Google Forms & customer lead CSVs
- Excel billing & appointment spreadsheets
- Personal employee phones & billing desks

Small business owners (e.g., diagnostic clinic owners, retail merchants) have no dedicated legal or IT security teams, yet face statutory penalties up to **₹250 Crore** for data protection failures.

This prototype provides a **100% Offline-First, Local Compute** compliance solution requiring zero cloud connectivity, zero subscription fees, and preventing any sensitive data from leaving the SME's physical machine.

---

## 🏗️ Architecture & 4 Pillars of Compliance

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DPDPA FOR SMALL BUSINESS (REACT UI)                  │
│       Data Map (RoPA) │ Multilingual Consent │ DSR Erasure │ Breach    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Local REST API (FastAPI)
┌───────────────────────────────────▼────────────────────────────────────┐
│                    OFFLINE-FIRST LOCAL PYTHON ENGINE                   │
│                                                                        │
│ 1. SCANNER ENGINE:                                                     │
│    - Indian Phone Numbers (+91/0/10-digit)                             │
│    - PAN Numbers with 4th Character Individual 'P' Validation          │
│    - 12-Digit Aadhaar Numbers with Verhoeff Mathematical Checksum      │
│    - UPI IDs (@okaxis, @okhdfcbank, @paytm, @ybl, etc.)                │
│    - Diagnostic & Clinical Terms (Thyroid, Diabetes, Lipid, etc.)      │
│                                                                        │
│ 2. EXCEL & SPREADSHEET REDACTOR:                                       │
│    - openpyxl cell-level XML manipulation                              │
│    - Preserves =SUM(), =VLOOKUP(), formulas, styles, & cell coords     │
│                                                                        │
│ 3. STATUTORY RESOLUTION ENGINE:                                        │
│    - DPDP Act Sec 8(7) vs CGST Act Sec 36 (72 months / 6-year cutoff)  │
│    - Tax-audit locked invoices preserve financials, purge marketing    │
│    - Generates SHA-256 Proof of Statutory Erasure Certificate          │
│                                                                        │
│ 4. EMBEDDED SQLITE LEDGER & INCIDENT REPORTER:                         │
│    - Zero-config local database for affirmative consent records        │
│    - DPBI statutory Section 8(6) regulatory filing dossier             │
│    - Multilingual Section 5 notices (English, Kannada, Hindi)          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 How to Run (1-Click Local Execution)

### Prerequisites:
- Python 3.10+
- Node.js 18+ (already bundled & built into `frontend/dist`)

### Step 1: Install Python dependencies (one-time)
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Launch the Prototype
**On Windows:**
Double-click `start.bat` or run:
```bash
python run.py
```

The prototype will start FastAPI on port 8000 and automatically open your default browser to:
**http://localhost:8000**

---

## 🧪 Automated Test Suite

Run the full pytest suite from `google_gemini/backend`:
```bash
cd backend
python -m pytest tests -v
```

### Test Coverage Summary:
- `tests/test_scanner.py`: Validates Indian phone, PAN individual person validation (`4th character == 'P'`), Aadhaar Verhoeff checksum algorithm, UPI handles, and clinical keyword extraction.
- `tests/test_statutory_rules.py`: Tests the 72-month (6-year) CGST Act retention boundary condition.
- `tests/test_redactor.py`: Verifies that openpyxl cell redaction does not alter cell coordinates or corrupt `=SUM()` and `=VLOOKUP()` formulas.

---

## ⚖️ Statutory Mapping Matrix

| Section / Act | Statutory Requirement | How Prototype Implements It |
|---|---|---|
| **DPDP Act Sec 5** | Multilingual Notice & Purpose Limitation | Templates in English, Kannada, and Hindi with WhatsApp copy-paste snippet |
| **DPDP Act Sec 6** | Affirmative Consent Management | Embedded SQLite consent ledger with timestamp, principal ID, and purpose |
| **DPDP Act Sec 8(6)** | Mandatory Breach Notification to DPBI & Data Principals | 5-minute incident triage wizard generating statutory DPBI dossier & customer SMS/WhatsApp alerts |
| **DPDP Act Sec 8(7)** | Erasure upon Purpose Completion | Atomic cell redaction replacing personal data with `[REDACTED_DPDP_SEC_12]` |
| **CGST Act Sec 36** | 72-Month Statutory Tax Invoice Retention | Automatically detects invoices < 6 years, locks financial data for tax audit, and issues a SHA-256 Statutory Retention Certificate |
| **DPDP Act Sec 11** | Right to Access Information | One-click search identifying all files, categories, and third-party processors |
| **DPDP Act Sec 12** | Right to Correction and Erasure | Cell-level openpyxl XML redaction preserving formula references without shifting rows |

---

## 🏆 Evaluation Readiness (Srujana 2026)
- **Zero Cloud Data Leakage**: No data is sent to external cloud APIs or third parties.
- **Micro-business Friendly**: Designed specifically for non-technical Indian SME owners.
- **Legally Sound**: Reconciles the genuine dilemma between DPDP Act and India's Goods and Services Tax laws.
