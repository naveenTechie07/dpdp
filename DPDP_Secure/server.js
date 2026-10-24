const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    // Pass data to the template for SEO and dynamic content
    res.render('index', {
        title: 'Modern SEO-Friendly Node.js App',
        description: 'A lightning-fast, server-side rendered application built with Node.js, Express, and EJS for optimal SEO.',
        path: '/'
    });
});

app.get('/settings/branding', (req, res) => {
    res.render('branding', {
        title: 'Branding & Theme | DPDP_Secure',
        description: 'Customize logo and tenant theme colors.',
        path: '/settings/branding',
        breadcrumbs: ['Workspace', 'Settings', 'Branding']
    });
});

app.get('/profile', (req, res) => {
    res.render('profile', {
        title: 'User Profile | DPDP_Secure',
        description: 'Manage your account information.',
        path: '/profile',
        breadcrumbs: ['Workspace', 'Profile']
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Us | Modern Node.js App',
        description: 'Learn more about our fast and SEO-optimized architecture.',
        path: '/about'
    });
});

app.get('/discovery/connectors', (req, res) => {
    res.render('discovery-connectors', {
        title: 'Data Discovery - DPDP_Secure',
        description: 'Connect data sources, run scans, and review PII findings.',
        breadcrumbs: ['Workspace', 'Data Discovery']
    });
});

app.get('/inventory/assets', (req, res) => {
    res.render('inventory-assets', {
        title: 'Data Assets - DPDP_Secure',
        description: 'Inventory of all data systems and containers.',
        breadcrumbs: ['Workspace', 'Data Mapping', 'Data Assets']
    });
});

app.get('/inventory/tags', (req, res) => {
    res.render('inventory-tags', {
        title: 'Classification Tags - DPDP_Secure',
        description: 'Define PII/sensitivity categories.',
        breadcrumbs: ['Workspace', 'Data Mapping', 'Classification']
    });
});

app.get('/inventory/ropa', (req, res) => {
    res.render('inventory-ropa', {
        title: 'Processing Activities - DPDP_Secure',
        description: 'Record of Processing Activities.',
        breadcrumbs: ['Workspace', 'Data Mapping', 'Ropa']
    });
});

app.get('/inventory/lineage', (req, res) => {
    res.render('inventory-lineage', {
        title: 'Data Lineage - DPDP_Secure',
        description: 'Track how data flows between systems.',
        breadcrumbs: ['Workspace', 'Data Mapping', 'Lineage']
    });
});

app.get('/inventory/assessment-enrichment', (req, res) => {
    res.render('inventory-assessment-enrichment', {
        title: 'Assessment Enrichment - DPDP_Secure',
        description: 'Map assessment answers to data assets.',
        breadcrumbs: ['Workspace', 'Data Mapping', 'Field Mappings']
    });
});

// Governance Routes
app.get('/governance/processors', (req, res) => {
    res.render('governance-processors', {
        title: 'Data Processors - DPDP_Secure',
        description: 'Vendor register.',
        breadcrumbs: ['Workspace', 'Governance', 'Processors']
    });
});

app.get('/governance/retention', (req, res) => {
    res.render('governance-retention', {
        title: 'Retention - DPDP_Secure',
        description: 'Retention policies.',
        breadcrumbs: ['Workspace', 'Governance', 'Retention']
    });
});

app.get('/governance/cross-border', (req, res) => {
    res.render('governance-cross-border', {
        title: 'Cross-Border Transfers - DPDP_Secure',
        description: 'Track international data transfers.',
        breadcrumbs: ['Workspace', 'Governance', 'Cross Border']
    });
});

app.get('/governance/evidence', (req, res) => {
    res.render('governance-evidence', {
        title: 'Compliance Evidence - DPDP_Secure',
        description: 'Store and manage compliance documents.',
        breadcrumbs: ['Workspace', 'Governance', 'Evidence']
    });
});

app.get('/governance/security-controls', (req, res) => {
    res.render('governance-security', {
        title: 'Security Controls - DPDP_Secure',
        description: 'Track security controls.',
        breadcrumbs: ['Workspace', 'Governance', 'Security']
    });
});

// Assessment Automation Routes
app.get('/assessment/dashboard', (req, res) => {
    res.render('assessment-dashboard', {
        title: 'Assessment Automation - DPDP_Secure',
        description: 'Overview of PIA & DPIA assessments.',
        breadcrumbs: ['Workspace', 'Assessment Automation', 'Dashboard']
    });
});

app.get('/assessment/templates', (req, res) => {
    res.render('assessment-templates', {
        title: 'Assessment Templates - DPDP_Secure',
        description: 'Define question sets and automation rules.',
        breadcrumbs: ['Workspace', 'Assessment Automation', 'Templates']
    });
});

app.get('/assessment/pia-dpia', (req, res) => {
    res.render('assessment-piadpia', {
        title: 'PIA & DPIA - DPDP_Secure',
        description: 'PIA and DPIA intake, workflows, and monitoring.',
        breadcrumbs: ['Workspace', 'Assessments']
    });
});

app.get('/assessment/settings', (req, res) => {
    res.render('assessment-settings', {
        title: 'Assessment Settings - DPDP_Secure',
        description: 'Configure assessment module settings.',
        breadcrumbs: ['Workspace', 'Assessments', 'Settings']
    });
});

// Consent & Permissions Routes
app.get('/consent/dashboard', (req, res) => {
    res.render('consent-dashboard', {
        title: 'Consent Dashboard - DPDP_Secure',
        description: 'Summary for this module only.',
        breadcrumbs: ['Workspace', 'Consent', 'Dashboard']
    });
});

app.get('/consent/purposes', (req, res) => {
    res.render('consent-purposes', {
        title: 'Consent Purposes - DPDP_Secure',
        description: 'Latest version per purpose group.',
        breadcrumbs: ['Workspace', 'Consent', 'Purposes']
    });
});

app.get('/consent/preferences', (req, res) => {
    res.render('consent-preferences', {
        title: 'Preference Library - DPDP_Secure',
        description: 'Create reusable preferences.',
        breadcrumbs: ['Workspace', 'Consent', 'Preference Library']
    });
});

app.get('/consent/preference-centers', (req, res) => {
    res.render('consent-preferencecenters', {
        title: 'Preference Centers - DPDP_Secure',
        description: 'Configure which purposes are shown in the privacy portal preference centre.',
        breadcrumbs: ['Workspace', 'Consent', 'Preference Centers']
    });
});

app.get('/consent/collection-points', (req, res) => {
    res.render('consent-collectionpoints', {
        title: 'Collection points - DPDP_Secure',
        description: 'Select a collection point type, create a draft, then build and publish from the details workspace.',
        breadcrumbs: ['Workspace', 'Consent', 'Collection points']
    });
});

app.get('/consent/data-elements', (req, res) => {
    res.render('consent-dataelements', {
        title: 'Data Elements - DPDP_Secure',
        description: 'Define reusable field types for consent collection point forms.',
        breadcrumbs: ['Workspace', 'Consent', 'Data elements']
    });
});

app.get('/consent/ledger', (req, res) => {
    res.render('consent-ledger', {
        title: 'Consent ledger - DPDP_Secure',
        description: 'Summary records — one row per consent capture event.',
        breadcrumbs: ['Workspace', 'Consent', 'Consent ledger']
    });
});



app.get('/consent/transactions', (req, res) => {
    res.render('consent-transactions', {
        title: 'Transactions - DPDP_Secure',
        description: 'View all consent capture transactions.',
        breadcrumbs: ['Workspace', 'Consent', 'Transactions']
    });
});

app.get('/consent/policies', (req, res) => {
    res.render('consent-policies', {
        title: 'Policies - DPDP_Secure',
        description: 'Legal documents stored in the policy service.',
        breadcrumbs: ['Workspace', 'Consent', 'Policies']
    });
});

app.get('/consent/portal-settings', (req, res) => {
    res.render('consent-portalsettings', {
        title: 'Portal Settings - DPDP_Secure',
        description: 'Configure privacy portal access and settings.',
        breadcrumbs: ['Workspace', 'Consent', 'Portal Settings']
    });
});

app.get('/cookies/dashboard', (req, res) => {
    res.render('cookies-dashboard', {
        title: 'Cookie Dashboard - DPDP_Secure',
        description: 'Summary counts for this module. Each card opens a dedicated screen with one primary table.',
        breadcrumbs: ['Workspace', 'Cookies', 'Dashboard']
    });
});

app.get('/cookies/scans', (req, res) => {
    res.render('cookies-scans', {
        title: 'Site scans - DPDP_Secure',
        description: 'Crawl a website to automatically discover cookies, pixels, and tracking SDKs.',
        breadcrumbs: ['Workspace', 'Cookies', 'Site scans']
    });
});

app.get('/cookies/scans/:id', (req, res) => {
    res.render('cookies-scans-detail', {
        title: 'https://www.dpdpsecure.in - DPDP_Secure',
        description: '',
        breadcrumbs: ['Workspace', 'Cookies', 'Site scans', `Scan #${req.params.id}`],
        scanId: req.params.id
    });
});

app.get('/cookies/logs', (req, res) => {
    res.render('cookies-logs', {
        title: 'Consent logs - DPDP_Secure',
        description: 'One table of consent events. Log a new event with the form above the grid.',
        breadcrumbs: ['Workspace', 'Cookies', 'Consent logs']
    });
});

app.get('/cookies/banners', (req, res) => {
    res.render('cookies-banners', {
        title: 'Cookie Banners - DPDP_Secure',
        description: 'Design, brand, and publish cookie consent banners for your websites.',
        breadcrumbs: ['Workspace', 'Cookies', 'Banners']
    });
});

app.get('/cookies/geo-rules', (req, res) => {
    res.render('cookies-georules', {
        title: 'Geo rules - DPDP_Secure',
        description: 'One table of regional defaults. Add a rule with the form above the grid.',
        breadcrumbs: ['Workspace', 'Cookies', 'Geo rules']
    });
});

app.get('/privacy/dashboard', (req, res) => {
    res.render('privacy-dashboard', {
        title: 'Privacy Rights - DPDP_Secure',
        description: 'Manage DPRR requests, intake forms, and data principal rights workflows.',
        breadcrumbs: ['Workspace', 'Privacy', 'Dashboard']
    });
});

app.get('/privacy/requests', (req, res) => {
    res.render('privacy-requests', {
        title: 'Data Rights Requests - DPDP_Secure',
        description: 'Account Holder rights requests across all channels',
        breadcrumbs: ['Workspace', 'Privacy', 'Requests']
    });
});

app.get('/privacy/workflows', (req, res) => {
    res.render('privacy-workflows', {
        title: 'Workflows - DPDP_Secure',
        description: 'Configurable stage-based workflows for Data Principal Rights requests',
        breadcrumbs: ['Workspace', 'Privacy', 'Workflows']
    });
});

app.get('/privacy/workflows/:id', (req, res) => {
    res.render('privacy-workflows-detail', {
        title: 'DPDP_Secure DPDPA Rights Workflow - DPDP_Secure',
        description: 'DPDPA 2023 rights handling for DPDP_Secure banking customers — 30-day SLA with RBI data retention checks.',
        breadcrumbs: ['Workspace', 'Privacy', 'Workflows', req.params.id]
    });
});

app.get('/privacy/forms', (req, res) => {
    res.render('privacy-forms', {
        title: 'Data Rights Requests Intake Forms - DPDP_Secure',
        description: 'Design intake forms for Account Holder Data Rights Requests. Select an integration type, build the form, and publish it.',
        breadcrumbs: ['Workspace', 'Privacy', 'Form designer']
    });
});

app.get('/privacy/forms/:id', (req, res) => {
    const tab = req.query.tab || 'designer';
    res.render('privacy-forms-detail', {
        title: 'DPDP_Secure Data Rights Intake - DPDP_Secure',
        description: '',
        tab: tab,
        breadcrumbs: ['Workspace', 'Privacy', 'Form designer', req.params.id]
    });
});

// Incidents & Breaches Routes
app.get('/incidents/dashboard', (req, res) => {
    res.render('incidents-dashboard', {
        title: 'Dashboard - DPDP_Secure',
        description: 'Breach notification compliance under DPDPA Section 8(6). Track incidents, assess notifiability, and manage DPBI submissions.',
        breadcrumbs: ['Workspace', 'Incidents & Breaches', 'Dashboard']
    });
});

app.get('/incidents/management', (req, res) => {
    res.render('incidents-management', {
        title: 'Incident Management - DPDP_Secure',
        description: 'Track, assess, and respond to data incidents and security breaches. Manage DPBI notifications and remediation actions.',
        breadcrumbs: ['Workspace', 'Incidents & Breaches', 'Incident Management']
    });
});

// Integrations Routes
app.get('/integrations/dashboard', (req, res) => {
    res.render('integrations-dashboard', {
        title: 'Dashboard - DPDP_Secure',
        description: 'Connect DPDP_Secure to your MarTech stack. Consent withdrawals, rights requests, and cookie decisions are delivered in real time.',
        breadcrumbs: ['Workspace', 'Integrations', 'Dashboard']
    });
});

app.get('/integrations/hub', (req, res) => {
    res.render('integrations-hub', {
        title: 'Integrations Hub - DPDP_Secure',
        description: 'Connect DPDP_Secure to your MarTech tools — consent withdrawals, erasure completions, and cookie updates are delivered automatically.',
        breadcrumbs: ['Workspace', 'Integrations', 'Integrations Hub']
    });
});

app.get('/integrations/api-keys', (req, res) => {
    res.render('integrations-apikeys', {
        title: 'API keys - DPDP_Secure',
        description: 'Generate service keys for web, mobile, and backend integrations.',
        breadcrumbs: ['Workspace', 'API keys']
    });
});

// Notifications Routes
app.get('/notifications/center', (req, res) => {
    const tab = req.query.tab || 'providers';
    res.render('notifications-center', {
        title: 'Notification Center - DPDP_Secure',
        description: 'Configure providers, message templates, and test sends for email, SMS, WhatsApp, and in-app channels.',
        breadcrumbs: ['Workspace', 'Notifications'],
        activeTab: tab
    });
});

// Settings Routes
app.get('/settings/general', (req, res) => {
    res.render('settings-general', {
        title: 'General Settings - DPDP_Secure',
        description: 'Platform-level settings for this tenant.',
        breadcrumbs: ['Workspace', 'Settings', 'General']
    });
});

app.get('/settings/sso', (req, res) => {
    res.render('settings-sso', {
        title: 'Single Sign-On - DPDP_Secure',
        description: "Connect your organization's identity provider and activate SSO after a successful real login test.",
        breadcrumbs: ['Workspace', 'Settings', 'Sso']
    });
});

app.get('/settings/branding', (req, res) => {
    res.render('settings-branding', {
        title: 'Branding & Theme - DPDP_Secure',
        description: 'Customize logo and tenant theme colors for all portal pages.',
        breadcrumbs: ['Workspace', 'Settings', 'Branding']
    });
});

app.get('/settings/organization', (req, res) => {
    res.render('settings-organization', {
        title: 'Organization Hierarchy - DPDP_Secure',
        description: 'Define tenant org trees, child-org locale overrides, and inherited settings.',
        breadcrumbs: ['Workspace', 'Settings', 'Organization']
    });
});

app.get('/settings/roles', (req, res) => {
    res.render('settings-roles', {
        title: 'Roles & Permissions - DPDP_Secure',
        description: 'Manage tenant roles, permissions, users, and role assignments.',
        breadcrumbs: ['Workspace', 'Settings', 'Roles']
    });
});

app.get('/settings/audit-log', (req, res) => {
    res.render('settings-audit-log', {
        title: 'Audit Log - DPDP_Secure',
        description: 'Review security and configuration changes for this tenant.',
        breadcrumbs: ['Workspace', 'Settings', 'Audit Log']
    });
});

app.get('/settings/localization', (req, res) => {
    res.render('settings-localization', {
        title: 'Localization & Labels - DPDP_Secure',
        description: 'Manage tenant language defaults, translations, and label substitutions across the platform.',
        breadcrumbs: ['Workspace', 'Settings', 'Localization']
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Page Not Found',
        description: 'The page you are looking for does not exist.',
        path: ''
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
