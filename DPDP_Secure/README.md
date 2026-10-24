# DPDP_Secure

A scalable, server-side rendered (SSR) web application built using Node.js, Express, and EJS. The application serves as a comprehensive privacy and compliance management dashboard with a focus on dark-themed, modern UI components.

## Features

- **Dynamic Navigation:** Server-side routed sidebar navigation with active state management.
- **Privacy Rights Management:** Modules for managing Data Subject Requests (DSR), Consent, and Workflows.
- **Incidents & Breaches:** Comprehensive dashboard for tracking and managing security incidents.
- **Settings & Administration:**
  - **Organization Hierarchy:** Manage business units, regions, and legal entities.
  - **Roles & Permissions (RBAC):** Manage user access with granular control.
  - **Audit Log:** Track and review tenant-scoped security and configuration changes.
  - **Localization:** Configure platform languages, AI-assisted translations, and label overrides.
- **Modern UI:** Built entirely with custom vanilla CSS (`style.css`), featuring a responsive layout, dark theme, and glassmorphism elements.

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** EJS (Embedded JavaScript templates), HTML, Custom CSS
- **Icons:** SVG icons (inline)

## Project Structure

```
DPDP_Secure/
├── public/
│   └── css/
│       └── style.css       # Global styles and design system variables
├── views/
│   ├── partials/
│   │   ├── header.ejs      # Sidebar navigation and top bar search
│   │   └── footer.ejs      # Common footer scripts
│   ├── index.ejs           # Main dashboard
│   ├── settings-*.ejs      # Settings module views (e.g. Roles, Audit Log, Localization)
│   └── ...                 # Other module views
├── server.js               # Application entry point and route definitions
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- npm (Node Package Manager)

### Installation

1. Navigate to directory:
   ```bash
   cd DPDP_Secure
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   *(Note: Ensure `express` and `ejs` are installed as per your `package.json`)*

3. Start the server:
   ```bash
   node server.js
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Development Notes

- **Routing:** All routes are defined centrally in `server.js`. EJS templates receive a `title` variable which is used in `header.ejs` to set the active state of navigation links.
- **Styling:** Avoid inline styles where possible. Add new UI components to the CSS architecture established in `public/css/style.css`.
- **Icons:** We use raw SVG paths for optimum performance without relying on external font libraries.
