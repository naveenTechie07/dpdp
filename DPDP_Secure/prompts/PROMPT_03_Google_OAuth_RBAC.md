# PROMPT 03: Google OAuth 2.0 Integration & Session-Based Multi-Role RBAC
## Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)
### Application: DPDP_Secure | Srujana Tech Fest 2026

> **HOW TO USE:** Copy the entire code block below and paste directly into your terminal or chat as a `/goal` command. It is 100% self-contained, pre-configured for the existing `DPDP_Secure` codebase, and includes all necessary cybersecurity guardrails.

---

### DIRECT COPY-PASTE PROMPT:

```markdown
/goal
Implement secure Google OAuth 2.0 authentication and session-based Role-Based Access Control (RBAC) in `DPDP_Secure`, including session fixation defense, state CSRF mitigation, and an instant "Evaluator Fast-Track Login" bypass for hackathon demonstration.

### Context & Existing Workspace:
- Workspace root: `N:\chnayka\DPDP_Secure`
- Target files: `src/config/passport.js` (or `src/services/authService.js`), `src/middlewares/authMiddleware.js`, `src/routes/authRoutes.js`, `views/auth-login.ejs`, `server.js`.
- Brand Protection: Strictly use `DPDP_Secure`. Never use any deprecated or legacy brand names.

### Mandatory Requirements:

1. Cybersecurity & Identity Guardrails:
   - **OAuth CSRF Defense:** Generate a cryptographically random `state` token using `crypto.randomBytes(32).toString('hex')` stored in the session, and verify `req.query.state === req.session.oauthState` on OAuth callback to prevent login CSRF attacks.
   - **Session Fixation Defense:** Always invoke `req.session.regenerate()` immediately upon successful login before populating user identity and role into `req.session.user`.
   - **Cookie Hardening:** Ensure session cookies have `httpOnly: true`, `sameSite: 'lax'`, and dynamic `secure: process.env.NODE_ENV === 'production'`.
   - **Brute-Force Rate Limiting:** Attach a strict rate limiter to `/auth/login` and `/auth/demo-login` (max 10 login attempts per 10 minutes per IP).

2. Multi-Role RBAC Hierarchy:
   Define 4 distinct SME tenant roles:
   - `SME_OWNER`: Full administrative control (DSR execution, incident declaration, DPBI submission, user management).
   - `COMPLIANCE_OFFICER`: RoPA review, consent notice drafting, DSR investigation, audit trail inspection.
   - `RECEPTION_STAFF`: Informal file scanner, 1-click WhatsApp notice dispatcher, view-only rights.
   - `AUDITOR`: Read-only access to immutable audit log, RoPA register, and SHA-256 compliance certificates.

3. Authentication Routes (`src/routes/authRoutes.js`):
   - `GET /auth/login`: Renders the login view (`views/auth-login.ejs`).
   - `GET /auth/google`: Initiates Google OAuth redirect with random state.
   - `GET /auth/google/callback`: Validates OAuth response and initializes session.
   - `POST /auth/demo-login`: **Evaluator Fast-Track mode** allowing one-click login without requiring Google API credentials. Accepts `{ role: 'owner' | 'reception' | 'auditor' }`:
     - `owner` -> Ramesh Kumar (`ramesh@aarogyaclinic.in`, Role: `SME_OWNER`)
     - `reception` -> Priya Sharma (`reception@aarogyaclinic.in`, Role: `RECEPTION_STAFF`)
     - `auditor` -> Rajesh Iyer (`auditor@privacyaudit.in`, Role: `AUDITOR`)
   - `GET /auth/logout`: Clears session and redirects to `/auth/login`.

4. Middleware Guards (`src/middlewares/authMiddleware.js`):
   - `isAuthenticated`: Verifies active session exists; in development mode, if no session exists, falls back to demo `SME_OWNER` session for friction-free evaluation.
   - `requireRole(allowedRoles)`: Enforces role permissions on sensitive operations (e.g., executing erasure or filing DPBI breach reports), returning a sanitized `403 Forbidden` view if unauthorized.
   - Inject `req.session.user` into `res.locals.currentUser` for display on the top navigation bar.

5. Login UI (`views/auth-login.ejs`):
   - Design a dark glassmorphic login screen matching the design system.
   - Official "Sign in with Google" button.
   - Prominently styled **"⚡ Hackathon Evaluator Fast-Track (1-Click Login)"** card with 3 role buttons:
     - Button: "Login as SME Owner (Ramesh Kumar)"
     - Button: "Login as Receptionist (Priya Sharma)"
     - Button: "Login as Regulatory Auditor (Rajesh Iyer)"

6. Verification Steps:
   - Start the server: `node server.js`.
   - Navigate to `http://localhost:3000/auth/login`.
   - Click "Login as SME Owner (Ramesh Kumar)".
   - Verify redirect to `/` with "Ramesh Kumar" and badge `SME_OWNER` displayed on top header.
   - Click logout and verify redirect back to `/auth/login`.
```

---

## Technical Reference & File Mapping

| File Path | Purpose |
|---|---|
| `src/routes/authRoutes.js` | OAuth endpoints, callback handler, demo-login bypass, logout. |
| `src/middlewares/authMiddleware.js` | `isAuthenticated` and `requireRole` route guards. |
| `views/auth-login.ejs` | Login portal with Google OAuth button and Evaluator Fast-Track buttons. |
