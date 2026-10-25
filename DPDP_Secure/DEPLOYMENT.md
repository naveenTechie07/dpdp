# Production Deployment Guide: DPDP_Secure
## Srujana Tech Fest 2026 | Problem Statement LS-04: Personal Data in Informal Systems

This guide provides complete instructions for deploying **`DPDP_Secure`** to [Vercel](https://vercel.com) as a serverless Node.js/Express application.

---

### 1. Prerequisites
- Node.js >= 18.0.0
- Vercel CLI installed globally:
  ```bash
  npm install -g vercel
  ```

---

### 2. Local Build & Smoke Test
Run the automated build and full end-to-end integration test suite locally before pushing:
```bash
cd DPDP_Secure
npm run build
npm run test:e2e
```
Ensure all 6 suites and all 54 routes return `HTTP 200 OK` (0 failed).

---

### 3. Deploy via Vercel CLI

#### Option A: Direct Deployment from `DPDP_Secure` directory
```bash
cd DPDP_Secure
vercel login
vercel --prod
```

#### Option B: Root Repository Deployment
If deploying from the monorepo root (`N:\chnayka`), the repository includes a root `vercel.json` configured with:
```json
{
  "version": 2,
  "builds": [
    { "src": "DPDP_Secure/api/index.js", "use": "@vercel/node" },
    { "src": "DPDP_Secure/public/**", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/css/(.*)", "dest": "/DPDP_Secure/public/css/$1" },
    { "src": "/js/(.*)", "dest": "/DPDP_Secure/public/js/$1" },
    { "src": "/(.*)", "dest": "/DPDP_Secure/api/index.js" }
  ]
}
```

---

### 4. Recommended Environment Variables (Vercel Project Settings)
In your Vercel Project Dashboard (`Settings -> Environment Variables`), configure the following:

| Variable | Recommended Production Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production security optimizations |
| `SESSION_SECRET` | *(Random 32-char hex string)* | Express session encryption secret |
| `AI_PROVIDER` | `mock` (or `groq` / `gemini`) | Statutory AI Advisor provider |
| `AI_API_KEY` | *(Optional)* | API key if using Groq or Gemini AI |
| `GOOGLE_CLIENT_ID` | *(Optional)* | OAuth Client ID for SSO |
| `GOOGLE_CLIENT_SECRET` | *(Optional)* | OAuth Client Secret for SSO |

---

### 5. Serverless Architecture & Database Resilience
- **Read-Only Filesystem Defense**: Vercel lambda containers run with a read-only root filesystem. `DPDP_Secure` automatically detects `process.env.VERCEL` and writes its SQLite database exclusively to `/tmp/dpdp_secure.db`.
- **Cold-Start Seeding**: On the initial cold start, `src/models/db.js` copies the bundled, pre-seeded Aarogya Diagnostic Center database into `/tmp`, guaranteeing all 54 routes and all 4 compliance pillars function seamlessly with zero latency.
- **1-Click Live Reset**: The dashboard includes an `⚡ Instant Hackathon Demo Mode` button wired to `POST /api/demo/reset`, allowing live evaluators to reset the clinic demo environment on demand.

---

### 6. Post-Deployment Verification Checklist
Once your Vercel deployment URL (e.g. `https://dpdp-secure.vercel.app`) is active, verify the following:
1. `GET /`: Homepage loads with glassmorphic cards and compliance metrics (`HTTP 200`).
2. `GET /discovery/connectors`: Discovery scanner interface and pre-loaded informal silos (`HTTP 200`).
3. `GET /consent/collection-points`: Multilingual Section 5 notices in English, Kannada, and Hindi (`HTTP 200`).
4. `GET /privacy/requests`: Live DSR ticket `DSR-2026-8819` for Deepa Nair with CGST Section 36 retention lock (`HTTP 200`).
5. `GET /incidents/management`: 72-Hour countdown and Form DPBI-IR1 regulatory intimation dossier (`HTTP 200`).
6. `GET /settings/audit-log`: Cryptographic SHA-256 hash chain verification banner (`✓ VERIFIED UNTAMPERED`) (`HTTP 200`).
7. Click `⚡ Instant Hackathon Demo Mode`: Confirms live AJAX reset to Aarogya Diagnostic Center.
