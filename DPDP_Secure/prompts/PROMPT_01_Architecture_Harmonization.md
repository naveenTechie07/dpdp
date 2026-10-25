# PROMPT 01: Core Architecture Harmonization, Complete Backend Route Audit & Dependencies
## Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)
### Application: DPDP_Secure | Srujana Tech Fest 2026

> **HOW TO USE:** Copy the entire code block below and paste directly into your terminal or chat as a `/goal` command. It is 100% self-contained, pre-configured for the existing `DPDP_Secure` codebase, and includes all necessary cybersecurity guardrails.

---

### DIRECT COPY-PASTE PROMPT:

```markdown
/goal
Analyze the existing backend in `DPDP_Secure/server.js`, perform a complete audit of all 54 existing routes and 55 EJS templates, identify any missing routes and body parsers, and transform the backend into a modular, production-grade Model-View-Controller (MVC) architecture with zero broken routes, full core middleware, and complete backwards compatibility.

### Context & Existing Workspace:
- Workspace root: `N:\chnayka\DPDP_Secure`
- Current state: Express 5 application with all 54 GET routes defined monolithically in `server.js` and 55 EJS templates in `views/`. Currently missing body parsing middleware (`express.json`, `express.urlencoded`), modular router organization, and backend controller wiring.
- Brand Protection Rule: Strictly use `DPDP_Secure` everywhere. Never use any deprecated or legacy brand names.

### Mandatory Requirements:

1. Package Configuration (`package.json`):
   Ensure `package.json` contains the following production dependencies:
   - `express`: ^5.2.1
   - `ejs`: ^6.0.1
   - `dotenv`: ^16.4.5
   - `cors`: ^2.8.5
   - `cookie-parser`: ^1.4.7
   - `express-session`: ^1.18.0
   - `multer`: ^1.4.5-lts.1
   - `helmet`: ^8.0.0
   - `uuid`: ^10.0.0
   - `express-rate-limit`: ^7.4.0
   DevDependencies:
   - `nodemon`: ^3.1.7

2. Critical Core Middleware Configuration (In `server.js`):
   - **Body Parsers (CRITICAL FOR ALL BACKEND POST ROUTES):** Mount `express.json({ limit: '10mb' })` and `express.urlencoded({ extended: true, limit: '10mb' })` immediately after security headers so that all incoming form and API POST requests have access to `req.body`.
   - **Cookie & Session Parsers:** Mount `cookieParser()` and `express-session`:
     - `httpOnly: true` (prevents client-side script theft of session cookies).
     - `sameSite: 'lax'` (CSRF mitigation).
     - `secure`: dynamic based on `process.env.NODE_ENV === 'production'`.
   - **Helmet Security Headers:** Configure CSP allowing inline SVGs, styles, and scripts required by the local dark-mode glassmorphic theme.
   - **Global Rate Limiter:** Apply 100 requests per 15 minutes per IP on `/api/*` routes.
   - **Global Context Middleware:** Inject default template locals (`title`, `description`, `path`, `breadcrumbs`, `currentUser`, `tenant`) via `res.locals` so that no EJS view crashes with `undefined` reference errors.
   - **Centralized Error Handler:** Catch all unhandled rejections and render a safe 500 error view suppressing internal stack traces in production.

3. Directory Restructuring:
   Create the following modular architecture inside `DPDP_Secure`:
   ```
   DPDP_Secure/
   ├── src/
   │   ├── config/          # Environment & constants (appConfig.js)
   │   ├── controllers/     # Request handlers (dashboard, discovery, consent, privacy, incidents, demo)
   │   ├── middlewares/     # Auth, session, rate-limiting, error handling
   │   ├── models/          # Data schemas, SQLite database client, demo seeder, audit logger
   │   ├── routes/          # Modular Express routers (dashboard, discovery, consent, privacy, etc.)
   │   ├── services/        # PII detection, Verhoeff engine, file parsers, RoPA, collision resolver, AI
   │   └── utils/           # Formatters, cryptographic hash helpers
   ├── public/              # Preserved CSS, JS, and icons
   ├── views/               # Preserved 55 EJS templates
   └── data/sample_data/    # Informal SME datasets (clinic chats, leads, invoices)
   ```

4. Comprehensive Backend Route Audit & Modular Router Map:
   Audit all 54 existing routes in `server.js` and cleanly distribute them into dedicated router modules inside `src/routes/`:
   - `src/routes/dashboardRoutes.js`:
     - `GET /` (wired to `dashboardController.renderDashboard`)
     - `GET /about`, `GET /profile`, `GET /settings/branding`
   - `src/routes/discoveryRoutes.js`:
     - `GET /discovery/connectors`, `GET /inventory/assets`, `GET /inventory/tags`, `GET /inventory/ropa`, `GET /inventory/lineage`, `GET /inventory/assessment-enrichment`
     - Plus new API routes: `POST /api/discovery/scan-sample`, `POST /api/discovery/upload`, `GET /api/discovery/findings`, `GET /api/ropa/export-csv`, `GET /api/ropa/data`
   - `src/routes/consentRoutes.js`:
     - `GET /consent/dashboard`, `GET /consent/purposes`, `GET /consent/preferences`, `GET /consent/preference-centers`, `GET /consent/collection-points`, `GET /consent/data-elements`, `GET /consent/ledger`, `GET /consent/transactions`, `GET /consent/policies`, `GET /consent/portal-settings`
     - `GET /cookies/dashboard`, `GET /cookies/scans`, `GET /cookies/scans/:id`, `GET /cookies/logs`, `GET /cookies/banners`, `GET /cookies/geo-rules`
     - Plus new API routes: `POST /api/consent/notices`, `POST /api/consent/record-consent`, `POST /api/consent/withdraw-consent`
   - `src/routes/privacyRoutes.js`:
     - `GET /privacy/dashboard`, `GET /privacy/requests`, `GET /privacy/workflows`, `GET /privacy/workflows/:id`, `GET /privacy/forms`, `GET /privacy/forms/:id`
     - `GET /dsr` (Public citizen rights intake portal)
     - Plus new API routes: `POST /api/privacy/submit-dsr`, `GET /api/privacy/dsr/:id/occurrences`, `GET /api/privacy/dsr/:id/summary`, `POST /api/privacy/execute-erasure`, `GET /api/privacy/download-cert/:id`
   - `src/routes/incidentRoutes.js`:
     - `GET /incidents/dashboard`, `GET /incidents/management`, `GET /incidents/dossier/:id`
     - `GET /notifications/center`
     - Plus new API routes: `POST /api/incidents/create`, `POST /api/incidents/triage`, `POST /api/incidents/dispatch-alerts`
   - `src/routes/governanceRoutes.js`:
     - `GET /governance/processors`, `GET /governance/retention`, `GET /governance/cross-border`, `GET /governance/evidence`, `GET /governance/security-controls`
     - `GET /assessment/dashboard`, `GET /assessment/templates`, `GET /assessment/pia-dpia`, `GET /assessment/settings`
   - `src/routes/integrationRoutes.js`:
     - `GET /integrations/dashboard`, `GET /integrations/hub`, `GET /integrations/api-keys`
   - `src/routes/settingsRoutes.js`:
     - `GET /settings/general`, `GET /settings/sso`, `GET /settings/branding`, `GET /settings/organization`, `GET /settings/roles`, `GET /settings/audit-log`, `GET /settings/localization`
     - Plus new API route: `POST /api/demo/reset`
   - `src/routes/authRoutes.js`:
     - `GET /auth/login`, `GET /auth/google`, `GET /auth/google/callback`, `POST /auth/demo-login`, `GET /auth/logout`, `GET /auth/me`
   - `src/routes/aiRoutes.js`:
     - `POST /api/ai/chat`, `POST /api/ai/translate-notice`, `POST /api/ai/assess-breach`

5. Refactor `server.js`:
   - Initialize all security and body-parsing middlewares.
   - Mount all modular routers.
   - Retain 404 handler rendering `views/404.ejs` for unmatched paths.
   - Export `app` using `module.exports = app;` with `if (require.main === module) { app.listen(PORT, ...); }`.

6. Verification Steps:
   - Run `npm install` inside `DPDP_Secure`.
   - Start the server: `node server.js`.
   - Verify `http://localhost:3000/` responds with `HTTP 200 OK`.
   - Verify that all core navigation routes (`/discovery/connectors`, `/inventory/ropa`, `/privacy/requests`, `/incidents/management`, etc.) return `HTTP 200 OK`.
   - Verify that sending a test JSON POST request to `/api/discovery/scan-sample` parses `req.body` without throwing undefined errors.
   - Confirm zero occurrences of deprecated legacy brand names across all files.
```

---

## Technical Reference & File Mapping

| File Path | Purpose |
|---|---|
| `package.json` | Updated dependencies and scripts (`start`, `dev`, `test`). |
| `.env.example` & `.env` | Environment configuration. |
| `src/config/appConfig.js` | Centralized config reader. |
| `src/middlewares/errorHandler.js` | Sanitized error handling middleware. |
| `src/routes/*.js` | Dedicated modular route handlers mapping all 54 existing routes + new APIs. |
| `server.js` | Modular entrypoint with security, body parsers, and route mounts. |
