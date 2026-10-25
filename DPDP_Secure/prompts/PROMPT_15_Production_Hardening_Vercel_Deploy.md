# PROMPT 15: Production Hardening, Serverless Packaging & Vercel Deployment
## Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)
### Application: DPDP_Secure | Srujana Tech Fest 2026

> **HOW TO USE:** Copy the entire code block below and paste directly into your terminal or chat as a `/goal` command. It is 100% self-contained, pre-configured for the existing `DPDP_Secure` codebase, and includes all necessary cybersecurity guardrails.

---

### DIRECT COPY-PASTE PROMPT:

```markdown
/goal
Package `DPDP_Secure` for seamless serverless deployment on Vercel as a high-performance Node.js / Express application. Configure the serverless entrypoint (`api/index.js`), route rewriting in `vercel.json`, static asset caching, read-only serverless filesystem database handling (using `/tmp` or seeded in-memory fallback), environment variable management, and production security headers.

### Context & Existing Workspace:
- Workspace root: `N:\chnayka\DPDP_Secure`
- Target files: `vercel.json`, `api/index.js`, `.vercelignore`, `DEPLOYMENT.md`, `package.json`, `server.js`.
- Brand Protection: Strictly use `DPDP_Secure`. Never use any deprecated or legacy brand names.

### Mandatory Requirements:

1. Cybersecurity & Serverless Guardrails:
   - **Production Security Headers (`helmet`):**
     - Strict-Transport-Security (HSTS): `maxAge: 31536000, includeSubDomains: true`.
     - X-Content-Type-Options: `nosniff`.
     - X-Frame-Options: `SAMEORIGIN`.
     - Content Security Policy (CSP): Allow local styles, Google Fonts, and inline SVGs.
   - **Read-Only Filesystem Resilience:** Vercel functions run in ephemeral containers where the root filesystem is strictly read-only. Database operations must detect `process.env.VERCEL` and write SQLite only to `/tmp/dpdp_secure.db`, or fall back to an in-memory seeded store to prevent `EROFS: read-only file system` crashes.
   - **Secret Isolation:** Ensure `.vercelignore` excludes `.env`, `.git`, `node_modules`, `tests`, and `privacy_related/`. Secrets are configured exclusively via Vercel Environment Variables.

2. Serverless Express Adapter (`api/index.js`):
   Create the serverless entrypoint for Vercel functions:
   ```javascript
   const app = require('../server.js');

   module.exports = (req, res) => {
       return app(req, res);
   };
   ```

   In `server.js`, export the Express instance:
   ```javascript
   module.exports = app;

   if (require.main === module) {
       app.listen(PORT, () => {
           console.log(`Server is running at http://localhost:${PORT}`);
       });
   }
   ```

3. Vercel Configuration (`vercel.json`):
   Configure serverless routes and static asset caching:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/index.js",
         "use": "@vercel/node"
       },
       {
         "src": "public/**",
         "use": "@vercel/static"
       }
     ],
     "routes": [
       {
         "src": "/css/(.*)",
         "dest": "/public/css/$1"
       },
       {
         "src": "/js/(.*)",
         "dest": "/public/js/$1"
       },
       {
         "src": "/(.*)",
         "dest": "/api/index.js"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

4. Database Handling in Serverless Environment:
   In `src/models/db.js`:
   - Detect `process.env.VERCEL`:
     - If true, point SQLite file path to `path.join('/tmp', 'dpdp_secure.db')`.
     - If the database file does not exist in `/tmp`, run migrations and seed data automatically on cold start.
   - Guarantee that all 54 routes and 55 views render with `HTTP 200 OK` on Vercel without throwing database file errors.

5. Deployment Guide (`DEPLOYMENT.md`):
   Provide complete deployment instructions:
   1. Prerequisites: `npm install -g vercel`.
   2. Build test: `npm run build`.
   3. Deploy command:
      ```bash
      cd DPDP_Secure
      vercel login
      vercel --prod
      ```
   4. Environment variables to set on Vercel Dashboard:
      - `SESSION_SECRET`: Strong 32-character random string.
      - `NODE_ENV`: `production`
      - `AI_PROVIDER`: `mock` (or `groq` / `gemini`)
      - `AI_API_KEY`: (Optional) Cloud AI API key.
      - `GOOGLE_CLIENT_ID`: (Optional) Google OAuth Client ID.
      - `GOOGLE_CLIENT_SECRET`: (Optional) Google OAuth Secret.
   5. Verification checklist for `https://dpdp-secure.vercel.app`:
      - Verify Homepage (HTTP 200)
      - Verify Discovery Scanner (`/discovery/connectors`)
      - Verify Consent Notices (`/consent/collection-points`)
      - Verify DSR Requests (`/privacy/requests`)
      - Verify Breach Triage (`/incidents/management`)
      - Test "⚡ Instant Hackathon Demo Mode" button.

6. Verification Steps:
   - Verify `api/index.js` exports the app handler correctly.
   - Verify `vercel.json` contains valid JSON syntax.
   - Test local execution via `node server.js` to ensure the serverless export does not affect local development.
   - Review `DEPLOYMENT.md` for complete deployment readiness.
```

---

## Technical Reference & File Mapping

| File Path | Purpose |
|---|---|
| `vercel.json` | Vercel serverless routing and static asset caching configuration. |
| `api/index.js` | Serverless Express entrypoint for Vercel lambdas. |
| `.vercelignore` | Excludes secrets, tests, and git repositories from deployment bundle. |
| `DEPLOYMENT.md` | Complete CLI and dashboard deployment instructions. |
