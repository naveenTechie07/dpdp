const express = require('express');
const router = express.Router();

router.get('/settings/general', (req, res) => {
  res.render('settings-general', {
    title: 'General Settings - DPDP_Secure',
    description: 'Platform-level settings for this tenant.',
    breadcrumbs: ['Workspace', 'Settings', 'General'],
    path: '/settings/general'
  });
});

router.get('/settings/sso', (req, res) => {
  res.render('settings-sso', {
    title: 'Single Sign-On - DPDP_Secure',
    description: "Connect your organization's identity provider and activate SSO after a successful real login test.",
    breadcrumbs: ['Workspace', 'Settings', 'Sso'],
    path: '/settings/sso'
  });
});

router.get('/settings/branding', (req, res) => {
  res.render('settings-branding', {
    title: 'Branding & Theme - DPDP_Secure',
    description: 'Customize logo and tenant theme colors for all portal pages.',
    breadcrumbs: ['Workspace', 'Settings', 'Branding'],
    path: '/settings/branding'
  });
});

// Alias redirect for /branding -> /settings/branding
router.get('/branding', (req, res) => {
  res.redirect('/settings/branding');
});

router.get('/settings/organization', (req, res) => {
  res.render('settings-organization', {
    title: 'Organization Hierarchy - DPDP_Secure',
    description: 'Define tenant org trees, child-org locale overrides, and inherited settings.',
    breadcrumbs: ['Workspace', 'Settings', 'Organization'],
    path: '/settings/organization'
  });
});

router.get('/settings/roles', (req, res) => {
  res.render('settings-roles', {
    title: 'Roles & Permissions - DPDP_Secure',
    description: 'Manage tenant roles, permissions, users, and role assignments.',
    breadcrumbs: ['Workspace', 'Settings', 'Roles'],
    path: '/settings/roles'
  });
});

router.get('/settings/audit-log', (req, res) => {
  res.render('settings-audit-log', {
    title: 'Audit Log - DPDP_Secure',
    description: 'Review tamper-evident security and configuration changes with cryptographic SHA-256 hash chaining.',
    breadcrumbs: ['Workspace', 'Settings', 'Audit Log'],
    path: '/settings/audit-log'
  });
});

router.get('/settings/localization', (req, res) => {
  res.render('settings-localization', {
    title: 'Localization & Labels - DPDP_Secure',
    description: 'Manage tenant language defaults (English, Kannada, Hindi) across the platform.',
    breadcrumbs: ['Workspace', 'Settings', 'Localization'],
    path: '/settings/localization'
  });
});

// Demo Seeder Reset API
router.post('/api/demo/reset', (req, res) => {
  res.json({
    success: true,
    message: 'Demo environment reset to Aarogya Diagnostic Center (Indiranagar, Bengaluru).'
  });
});

module.exports = router;
