# PROMPT 02: Enterprise-Grade Design System, Glassmorphic Theme & SME Dashboard UI Overhaul
## Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)
### Application: DPDP_Secure | Srujana Tech Fest 2026

> **HOW TO USE:** Copy the entire code block below and paste directly into your terminal or chat as a `/goal` command. It is 100% self-contained, pre-configured for the existing `DPDP_Secure` codebase, and includes all necessary cybersecurity guardrails.

---

### DIRECT COPY-PASTE PROMPT:

```markdown
/goal
Elevate the existing user interface of `DPDP_Secure` into an award-winning, sleek, dark-themed SaaS experience with glassmorphism, responsive navigation, and an intuitive SME executive dashboard wired to real backend metrics and controller logic.

### Context & Existing Workspace:
- Workspace root: `N:\chnayka\DPDP_Secure`
- Target files: 
  - `src/controllers/dashboardController.js` (NEW backend controller)
  - `src/routes/dashboardRoutes.js` (NEW modular dashboard router)
  - `public/css/style.css`
  - `views/partials/header.ejs`
  - `views/partials/footer.ejs`
  - `views/index.ejs`
  - `server.js` (mount dashboard routes on `/`)
- Brand Protection: Strictly use `DPDP_Secure`. Never use any deprecated or legacy brand names.

### Mandatory Requirements:

1. Cybersecurity & Frontend Guardrails:
   - **XSS Prevention:** Ensure all dynamic output in EJS templates uses standard HTML-escaped tags (`<%= %>`) rather than unescaped raw HTML (`<%- %>`), preventing Cross-Site Scripting when rendering tenant names, file names, and user queries.
   - **Zero External CDN Dependencies:** Use local styles in `public/css/style.css` and inline SVG paths for icons, avoiding third-party CDN script injection vectors.
   - **Input Sanitization & Truncation:** Add CSS text-truncation defenses (`text-overflow: ellipsis`, `overflow: hidden`) to prevent visual layout breaking or UI redressing from malicious long strings.

2. Backend Dashboard Controller & Endpoints (`src/controllers/dashboardController.js`):
   Create a real backend controller that queries local persistence (via `src/models/index.js`) with safe fallback defaults:
   - `renderDashboard(req, res)`:
     - Queries `getDashboardMetrics(tenantId)` and `getAuditLogs(tenantId, 5)`.
     - Passes to `views/index.ejs`:
       - `title`: `'Executive Compliance Dashboard - DPDP_Secure'`
       - `description`: `'Aarogya Diagnostic Center • Real-Time DPDP Act, 2023 Compliance Posture'`
       - `path`: `'/'`
       - `breadcrumbs`: `['Workspace', 'Dashboard']`
       - `silosCount`: Count of connected informal data silos (default: 3)
       - `piiCount`: Total count of discovered Indian PII elements (default: 1420)
       - `activeNoticesCount`: Count of active Section 5 multilingual notices (default: 3)
       - `pendingDsrCount`: Count of pending Data Principal rights requests (default: 1)
       - `taxLockedCount`: Count of invoices with active CGST 6-year tax lock (default: 1)
       - `activeIncidentsCount`: Count of open security incidents (default: 0)
       - `complianceScore`: Calculated health score (default: 84)
       - `recentActivity`: Array of latest 5 events from `audit_logs`
   - `getMetricsJson(req, res)`:
     - Endpoint: `GET /api/dashboard/metrics`
     - Returns JSON `{ success: true, metrics: { silosCount, piiCount, activeNoticesCount, pendingDsrCount, taxLockedCount, activeIncidentsCount, complianceScore } }` for dynamic frontend polling.
   - Mount these in `src/routes/dashboardRoutes.js` and mount in `server.js`.

3. Design System Tokens (`public/css/style.css`):
   Implement a cohesive modern dark-mode palette:
   - Canvas Background: `#0b0f19` (Obsidian / Midnight Slate)
   - Card Surfaces: `rgba(17, 24, 39, 0.75)` with `backdrop-filter: blur(16px)` and border `1px solid rgba(255, 255, 255, 0.08)`
   - Brand Accent: `#3b82f6` (Vibrant Indigo) with gradient `linear-gradient(135deg, #2563eb, #1d4ed8)`
   - Compliance Success: `#10b981` (Emerald Green)
   - Statutory Tax Lock / Warning: `#f59e0b` (Amber Gold)
   - Breach / Critical Alert: `#ef4444` (Crimson Red)
   - Typography: System sans-serif stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
   - Add class utilities: `.glass-card`, `.badge-pill`, `.status-dot-active`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-outline`.

4. Sidebar & Header Navigation (`views/partials/header.ejs`):
   Reorganize the existing navigation into 5 clean statutory groups:
   1. **Workspace Overview:** Executive Dashboard (`/`)
   2. **Pillar 1 - Data Discovery & RoPA:** Silo Scanner (`/discovery/connectors`), RoPA Register (`/inventory/ropa`), Data Assets (`/inventory/assets`)
   3. **Pillar 2 - Consent & Notices:** Multilingual Notices (`/consent/collection-points`), Consent Event Ledger (`/consent/ledger`), Purpose Library (`/consent/purposes`)
   4. **Pillar 3 - Citizen Rights & DSR:** Requests Queue (`/privacy/requests`), Rights Workflows (`/privacy/workflows`)
   5. **Pillar 4 - Breach Triage & DPBI:** Incident Management (`/incidents/management`), Breach Dashboard (`/incidents/dashboard`), Notification Dispatches (`/notifications/center`)
   Header Topbar:
   - Tenant Badge: "Aarogya Diagnostic Center (Indiranagar, Bengaluru)" with a green status indicator "DPDP Compliance: <%= complianceScore %>%".
   - Global Quick-Action command bar hint (`Ctrl + K`).
   - User profile dropdown displaying the active authenticated role.

5. Executive SME Dashboard (`views/index.ejs`):
   Rebuild the homepage using the dynamic data from `dashboardController`:
   - **Hero Metric Banner:**
     - Compliance Health Gauge: Large radial score showing `<%= complianceScore %>/100 (Low Regulatory Risk)`.
     - Statutory Exposure Meter: Highlighting **₹0 Active Penalties** versus unmitigated **₹250 Crore statutory exposure**.
   - **The 4 Pillar Command Cards:**
     - *Card 1 (Discovery):* `<%= silosCount %> Informal Silos Active`, `<%= piiCount %> Indian PII Elements Discovered`.
     - *Card 2 (Consent):* `<%= activeNoticesCount %> Multilingual Notices Active`, `94.2% Patient WhatsApp Opt-in Rate`.
     - *Card 3 (DSR):* `<%= pendingDsrCount %> Pending Erasure Request`, `<%= taxLockedCount %> CGST Section 36 Tax Lock Applied`.
     - *Card 4 (Breach Triage):* `<%= activeIncidentsCount %> Active Breaches`, `72-Hour DPBI Response Workflow Armed`.
   - **Interactive Quick-Action Dock:**
     - Button: "⚡ Scan New Silo (WhatsApp / Excel)"
     - Button: "💬 Send WhatsApp Consent Notice"
     - Button: "🛡️ Resolve Erasure Request"
     - Button: "🚨 Triage Security Incident"
   - **Recent Activity Feed:**
     - Chronological timeline rendered dynamically from `recentActivity`.

6. Verification Steps:
   - Start the server: `node server.js`.
   - Open `http://localhost:3000/`.
   - Verify that all glassmorphic cards render cleanly with real dynamic numbers from `dashboardController`.
   - Verify that `GET /api/dashboard/metrics` returns HTTP 200 with JSON stats.
   - Resize viewport to mobile dimensions (375px) and verify sidebar collapse and horizontal scroll prevention.
   - Confirm zero console errors and clean typography.
```

---

## Technical Reference & File Mapping

| File Path | Purpose |
|---|---|
| `src/controllers/dashboardController.js` | Queries persistence layer and passes real metrics to `views/index.ejs` and JSON API. |
| `src/routes/dashboardRoutes.js` | Mounts `/` and `/api/dashboard/metrics`. |
| `public/css/style.css` | Glassmorphic design system tokens, classes, and responsive layout. |
| `views/partials/header.ejs` | 5-pillar statutory navigation and tenant header. |
| `views/index.ejs` | Executive SME compliance command center. |
