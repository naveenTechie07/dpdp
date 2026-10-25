# PROMPT 08: Open-Source LLM & AI API Integration Layer (Ollama / Groq / Gemini)
## Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)
### Application: DPDP_Secure | Srujana Tech Fest 2026

> **HOW TO USE:** Copy the entire code block below and paste directly into your terminal or chat as a `/goal` command. It is 100% self-contained, pre-configured for the existing `DPDP_Secure` codebase, and includes all necessary cybersecurity guardrails.

---

### DIRECT COPY-PASTE PROMPT:

```markdown
/goal
Build a multi-provider AI integration service in `DPDP_Secure` supporting local open-source LLMs (via Ollama running Llama 3 or Mistral) for 100% offline-first confidentiality, with fallback to fast cloud LLM APIs (Groq, Gemini) and a rich deterministic statutory rule engine. The service must enforce strict PII pre-redaction so sensitive customer data is never leaked to external APIs.

### Context & Existing Workspace:
- Workspace root: `N:\chnayka\DPDP_Secure`
- Target files: `src/services/aiService.js`, `src/controllers/aiAssistantController.js`, `src/routes/aiRoutes.js`, `views/partials/ai-assistant-modal.ejs`, `server.js`.
- Brand Protection: Strictly use `DPDP_Secure`. Never use any deprecated or legacy brand names.

### Mandatory Requirements:

1. Cybersecurity & AI Data Leakage Guardrails:
   - **Pre-Call PII Anonymization (Zero Egress):** Before sending any user text or incident narrative to external cloud LLMs (Groq, Gemini, or OpenAI), run `indianPiiEngine.maskPii()` to replace raw Aadhaar, PAN, phone numbers, and names with anonymized tokens (e.g. `[PATIENT_AADHAAR_MASKED]`, `[PATIENT_PHONE_MASKED]`). Raw personal data must NEVER touch external cloud APIs.
   - **Prompt Injection Defense:** Structure LLM system prompts using clear delimiters (`<context>...</context>`, `<user_query>...</user_query>`) and explicit guardrails directing the model to reject jailbreak attempts, ignore instructions to reveal system prompts, and ground answers strictly in the DPDP Act, 2023.
   - **API Key Hardening:** Cloud API keys must be loaded exclusively via environment variables (`AI_API_KEY`) and never logged or serialized into client responses.

2. Multi-Provider Engine (`src/services/aiService.js`):
   Implement a flexible provider class checking `process.env.AI_PROVIDER`:
   - **Local Open-Source LLM (`ollama`):** Connects to `http://localhost:11434/api/generate` with model `llama3:8b` or `mistral`. 100% offline and confidential.
   - **Cloud API (`groq` / `gemini`):** Connects to cloud API when `AI_API_KEY` is present.
   - **Deterministic Fallback Engine (`mock`):** Comprehensive statutory rule-based responses ensuring 100% reliable answers during offline evaluation without requiring GPU hardware or API keys:
     - *Query: "Can I store prescriptions on WhatsApp?"*
       -> "Under Section 8(4) of the DPDP Act, 2023, storing sensitive diagnostic data on unencrypted WhatsApp chats creates high regulatory exposure. WhatsApp chat exports are informal silos. You must obtain itemised Section 5 consent, restrict access to authorized clinic staff, and purge files once the statutory purpose is complete."
     - *Query: "How to respond to an erasure request?"*
       -> "Under Section 12(3), a citizen has the right to erasure. However, under Section 8(7) read with Section 36 of the CGST Act 2017, invoices and tax records must be locked for 72 months (6 years). Use DPDP_Secure's Dual-Track Collision Resolver to atomically redact informal WhatsApp and lead records while retaining statutory tax locks on billing files."
     - *Query: "What to do if a receptionist's phone is lost?"*
       -> "Under DPDP Act Section 8(6) and DPDP Rules, 2025 (Rule 7), if an unencrypted phone holding customer PII is lost, this constitutes a reportable personal data breach. You must: 1) Trigger remote lock & wipe; 2) Revoke WhatsApp Web sessions; 3) Intimate the Data Protection Board of India (DPBI) within 72 hours using Form DPBI-IR1; 4) Send reassuring notices to affected citizens."

3. Specialized Legal-Tech AI Tasks:
   - **Task 1: Multilingual Notice Translation (`translateNotice(noticeText, targetLanguage)`):**
     Translates Section 5 notice items into Kannada (`ಕನ್ನಡ`) or Hindi (`हिन्दी`), maintaining statutory legal definitions of "withdrawal", "purpose", and "grievance redressal".
   - **Task 2: Breach Risk Evaluator (`assessBreachSeverity(incidentText)`):**
     Evaluates incident descriptions under DPDP Rules, 2025 (Rule 7), outputting structured JSON with severity tier, mandatory DPBI intimation flag, and a 2-sentence rationale.
   - **Task 3: Interactive SME Privacy Advisor (`chatPrivacyAssistant(query)`):**
     Answers practical everyday SME compliance questions grounded in DPDP Act sections.

4. API Endpoints & Routes (`src/routes/aiRoutes.js`):
   - `POST /api/ai/chat`: Handles chat queries from the dashboard widget.
   - `POST /api/ai/translate-notice`: Handles purpose notice translation.
   - `POST /api/ai/assess-breach`: Evaluates incident narrative risk.
   - Apply rate limiting on AI endpoints (max 20 calls per minute per IP).

5. Floating SME Privacy Assistant Widget (`views/partials/ai-assistant-modal.ejs`):
   - Add a floating action button on the bottom-right corner of the UI with an AI bot SVG icon.
   - Clicking opens a slide-over glassmorphic drawer:
     - Header: "DPDP AI Compliance Assistant (Offline-First)"
     - Quick Suggestion Chips:
       - "Can I store prescriptions on WhatsApp?"
       - "How to respond to an erasure request?"
       - "What to do if a receptionist's phone is lost?"
     - Message history container and input field with animated typing indicator.

6. Verification Steps:
   - Start the server: `node server.js`.
   - Send `POST /api/ai/chat` with body `{"query": "Can I store customer records on WhatsApp?"}`.
   - Confirm accurate statutory guidance citing DPDP Act Section 8(4).
   - Verify that test Aadhaar numbers are masked before reaching the LLM service.
```

---

## Technical Reference & File Mapping

| File Path | Purpose |
|---|---|
| `src/services/aiService.js` | Multi-provider AI connector (Ollama, Groq, Gemini, Mock) with PII pre-redaction. |
| `src/controllers/aiAssistantController.js` | Handlers for chat, notice translation, and breach assessment. |
| `views/partials/ai-assistant-modal.ejs` | Floating interactive chat drawer. |
