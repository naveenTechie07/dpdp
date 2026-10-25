const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Consent GET Routes
router.get('/consent/dashboard', (req, res) => {
  res.render('consent-dashboard', {
    title: 'Consent Dashboard - DPDP_Secure',
    description: 'Summary for this module only.',
    breadcrumbs: ['Workspace', 'Consent', 'Dashboard'],
    path: '/consent/dashboard'
  });
});

router.get('/consent/purposes', (req, res) => {
  res.render('consent-purposes', {
    title: 'Consent Purposes - DPDP_Secure',
    description: 'Latest version per purpose group.',
    breadcrumbs: ['Workspace', 'Consent', 'Purposes'],
    path: '/consent/purposes'
  });
});

router.get('/consent/preferences', (req, res) => {
  res.render('consent-preferences', {
    title: 'Preference Library - DPDP_Secure',
    description: 'Create reusable preferences.',
    breadcrumbs: ['Workspace', 'Consent', 'Preference Library'],
    path: '/consent/preferences'
  });
});

router.get('/consent/preference-centers', (req, res) => {
  res.render('consent-preferencecenters', {
    title: 'Preference Centers - DPDP_Secure',
    description: 'Configure which purposes are shown in the privacy portal preference centre.',
    breadcrumbs: ['Workspace', 'Consent', 'Preference Centers'],
    path: '/consent/preference-centers'
  });
});

const consentController = require('../controllers/consentController');

// Consent Views Routes
router.get('/consent/collection-points', consentController.renderCollectionPoints);
router.get('/consent/data-elements', (req, res) => {
  res.render('consent-dataelements', {
    title: 'Data Elements - DPDP_Secure',
    description: 'Define reusable field types for consent collection point forms.',
    breadcrumbs: ['Workspace', 'Consent', 'Data elements'],
    path: '/consent/data-elements'
  });
});
router.get('/consent/ledger', consentController.renderLedger);

router.get('/consent/transactions', (req, res) => {
  res.render('consent-transactions', {
    title: 'Transactions - DPDP_Secure',
    description: 'View all consent capture transactions.',
    breadcrumbs: ['Workspace', 'Consent', 'Transactions'],
    path: '/consent/transactions'
  });
});

router.get('/consent/policies', (req, res) => {
  res.render('consent-policies', {
    title: 'Policies - DPDP_Secure',
    description: 'Legal documents stored in the policy service.',
    breadcrumbs: ['Workspace', 'Consent', 'Policies'],
    path: '/consent/policies'
  });
});

router.get('/consent/portal-settings', (req, res) => {
  res.render('consent-portalsettings', {
    title: 'Portal Settings - DPDP_Secure',
    description: 'Configure privacy portal access and settings.',
    breadcrumbs: ['Workspace', 'Consent', 'Portal Settings'],
    path: '/consent/portal-settings'
  });
});

// Cookie Routes
router.get('/cookies/dashboard', (req, res) => {
  res.render('cookies-dashboard', {
    title: 'Cookie Dashboard - DPDP_Secure',
    description: 'Summary counts for cookie consent modules.',
    breadcrumbs: ['Workspace', 'Cookies', 'Dashboard'],
    path: '/cookies/dashboard'
  });
});

router.get('/cookies/scans', (req, res) => {
  res.render('cookies-scans', {
    title: 'Site scans - DPDP_Secure',
    description: 'Crawl a website to automatically discover cookies and pixels.',
    breadcrumbs: ['Workspace', 'Cookies', 'Site scans'],
    path: '/cookies/scans'
  });
});

router.get('/cookies/scans/:id', (req, res) => {
  res.render('cookies-scans-detail', {
    title: 'Site Scan Detail - DPDP_Secure',
    description: '',
    breadcrumbs: ['Workspace', 'Cookies', 'Site scans', `Scan #${req.params.id}`],
    scanId: req.params.id,
    path: `/cookies/scans/${req.params.id}`
  });
});

router.get('/cookies/logs', (req, res) => {
  res.render('cookies-logs', {
    title: 'Consent logs - DPDP_Secure',
    description: 'One table of consent events.',
    breadcrumbs: ['Workspace', 'Cookies', 'Consent logs'],
    path: '/cookies/logs'
  });
});

router.get('/cookies/banners', (req, res) => {
  res.render('cookies-banners', {
    title: 'Cookie Banners - DPDP_Secure',
    description: 'Design, brand, and publish cookie consent banners for your websites.',
    breadcrumbs: ['Workspace', 'Cookies', 'Banners'],
    path: '/cookies/banners'
  });
});

router.get('/cookies/geo-rules', (req, res) => {
  res.render('cookies-georules', {
    title: 'Geo rules - DPDP_Secure',
    description: 'Regional cookie default rules.',
    breadcrumbs: ['Workspace', 'Cookies', 'Geo rules'],
    path: '/cookies/geo-rules'
  });
});

// Consent API Routes
router.post('/api/consent/notices', consentController.createNotice);
router.get('/api/consent/notices/:id', consentController.getNoticeById);
router.post('/api/consent/record-consent', consentController.recordConsent);
router.post('/api/consent/withdraw-consent', consentController.withdrawConsent);

module.exports = router;
