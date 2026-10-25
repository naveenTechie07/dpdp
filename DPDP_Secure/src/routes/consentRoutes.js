const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const models = require('../models');
const consentController = require('../controllers/consentController');

const DEFAULT_TENANT_ID = 'TENANT-AAROGYA-01';

// ==========================================
// CONSENT VIEW ROUTES
// ==========================================

router.get('/consent/dashboard', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const events = await models.getConsentLedger(tenantId);
    const notices = await models.getActiveNotices(tenantId);
    const purposes = await models.getConsentPurposes(tenantId);

    res.render('consent-dashboard', {
      title: 'Consent Dashboard - DPDP_Secure',
      description: 'Summary for this module only.',
      breadcrumbs: ['Workspace', 'Consent', 'Dashboard'],
      path: '/consent/dashboard',
      stats: {
        totalEvents: events ? events.length : 0,
        activeNotices: notices ? notices.length : 0,
        totalPurposes: purposes ? purposes.length : 0
      }
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/consent/purposes', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const purposes = await models.getConsentPurposes(tenantId);
    res.render('consent-purposes', {
      title: 'Consent Purposes - DPDP_Secure',
      description: 'Latest version per purpose group.',
      breadcrumbs: ['Workspace', 'Consent', 'Purposes'],
      path: '/consent/purposes',
      purposes: purposes || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/consent/notices', (req, res) => {
  res.redirect('/consent/purposes');
});

router.get('/consent/preferences', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const preferences = await models.getConsentPreferences(tenantId);
    res.render('consent-preferences', {
      title: 'Preference Library - DPDP_Secure',
      description: 'Create reusable preferences.',
      breadcrumbs: ['Workspace', 'Consent', 'Preference Library'],
      path: '/consent/preferences',
      preferences: preferences || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/consent/preference-centers', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const centers = await models.getConsentPreferenceCenters(tenantId);
    res.render('consent-preferencecenters', {
      title: 'Preference Centers - DPDP_Secure',
      description: 'Configure which purposes are shown in the privacy portal preference centre.',
      breadcrumbs: ['Workspace', 'Consent', 'Preference Centers'],
      path: '/consent/preference-centers',
      centers: centers || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

// Consent Collection Points Studio & WhatsApp Simulator
router.get('/consent/collection-points', consentController.renderCollectionPoints);
router.get('/consent/simulator', consentController.renderSimulator);
router.get('/consent/passbook/:id', consentController.downloadPassbook);

router.get('/consent/data-elements', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const elements = await models.getConsentDataElements(tenantId);
    res.render('consent-dataelements', {
      title: 'Data Elements - DPDP_Secure',
      description: 'Define reusable field types for consent collection point forms.',
      breadcrumbs: ['Workspace', 'Consent', 'Data elements'],
      path: '/consent/data-elements',
      elements: elements || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/consent/ledger', consentController.renderLedger);

router.get('/consent/transactions', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const events = await models.getConsentLedger(tenantId);
    res.render('consent-transactions', {
      title: 'Transactions - DPDP_Secure',
      description: 'View all consent capture transactions.',
      breadcrumbs: ['Workspace', 'Consent', 'Transactions'],
      path: '/consent/transactions',
      transactions: events || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/consent/policies', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const policies = await models.getConsentPolicies(tenantId);
    res.render('consent-policies', {
      title: 'Policies - DPDP_Secure',
      description: 'Legal documents stored in the policy service.',
      breadcrumbs: ['Workspace', 'Consent', 'Policies'],
      path: '/consent/policies',
      policies: policies || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/consent/portal-settings', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const settings = await models.getConsentPortalSettings(tenantId);
    res.render('consent-portalsettings', {
      title: 'Portal Settings - DPDP_Secure',
      description: 'Configure privacy portal access and settings.',
      breadcrumbs: ['Workspace', 'Consent', 'Portal Settings'],
      path: '/consent/portal-settings',
      settings: settings || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

// ==========================================
// COOKIE COMPLIANCE VIEW ROUTES
// ==========================================

router.get('/cookies/dashboard', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const scans = await models.getCookieScans(tenantId);
    const logs = await models.getCookieConsentLogs(tenantId);
    const banners = await models.getCookieBanners(tenantId);
    const rules = await models.getCookieGeoRules(tenantId);

    res.render('cookies-dashboard', {
      title: 'Cookie Dashboard - DPDP_Secure',
      description: 'Summary counts for cookie consent modules.',
      breadcrumbs: ['Workspace', 'Cookies', 'Dashboard'],
      path: '/cookies/dashboard',
      stats: {
        totalScans: scans ? scans.length : 0,
        totalLogs: logs ? logs.length : 0,
        totalBanners: banners ? banners.length : 0,
        totalRules: rules ? rules.length : 0
      }
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/cookies/scans', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const scans = await models.getCookieScans(tenantId);
    res.render('cookies-scans', {
      title: 'Site scans - DPDP_Secure',
      description: 'Crawl a website to automatically discover cookies and pixels.',
      breadcrumbs: ['Workspace', 'Cookies', 'Site scans'],
      path: '/cookies/scans',
      scans: scans || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
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

router.get('/cookies/logs', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const logs = await models.getCookieConsentLogs(tenantId);
    res.render('cookies-logs', {
      title: 'Consent logs - DPDP_Secure',
      description: 'One table of consent events.',
      breadcrumbs: ['Workspace', 'Cookies', 'Consent logs'],
      path: '/cookies/logs',
      logs: logs || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/cookies/banners', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const banners = await models.getCookieBanners(tenantId);
    res.render('cookies-banners', {
      title: 'Cookie Banners - DPDP_Secure',
      description: 'Design, brand, and publish cookie consent banners for your websites.',
      breadcrumbs: ['Workspace', 'Cookies', 'Banners'],
      path: '/cookies/banners',
      banners: banners || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/cookies/geo-rules', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const rules = await models.getCookieGeoRules(tenantId);
    res.render('cookies-georules', {
      title: 'Geo rules - DPDP_Secure',
      description: 'Regional cookie default rules.',
      breadcrumbs: ['Workspace', 'Cookies', 'Geo rules'],
      path: '/cookies/geo-rules',
      rules: rules || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

// ==========================================
// CONSENT & COOKIE CRUD APIS
// ==========================================

// Core Consent APIs
router.post('/api/consent/notices', consentController.createNotice);
router.get('/api/consent/notices/:id', consentController.getNoticeById);
router.post('/api/consent/record-consent', consentController.recordConsent);
router.post('/api/consent/withdraw-consent', consentController.withdrawConsent);
router.get('/api/consent/download-passbook/:id', consentController.downloadPassbook);

// Consent Dashboard API
router.get('/api/consent/dashboard', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const metrics = await models.getConsentDashboardMetrics(tenantId);
    res.json({ success: true, data: metrics });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Purposes CRUD
router.get('/api/consent/purposes', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getConsentPurposes(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/consent/purposes', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createConsentPurpose({ ...req.body, tenantId });
    res.status(201).json({ success: true, purpose: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/consent/purposes/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.updateConsentPurpose(req.params.id, req.body, tenantId);
    res.json({ success: true, message: 'Purpose updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/consent/purposes/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.deleteConsentPurpose(req.params.id, tenantId);
    res.json({ success: true, message: 'Purpose deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Preferences CRUD
router.get('/api/consent/preferences', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getConsentPreferences(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/consent/preferences', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createConsentPreference({ ...req.body, tenantId });
    res.status(201).json({ success: true, preference: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/consent/preferences/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.updateConsentPreference(req.params.id, req.body, tenantId);
    res.json({ success: true, message: 'Preference updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/consent/preferences/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.deleteConsentPreference(req.params.id, tenantId);
    res.json({ success: true, message: 'Preference deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Preference Centers CRUD
router.get('/api/consent/preference-centers', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getConsentPreferenceCenters(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/consent/preference-centers', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createConsentPreferenceCenter({ ...req.body, tenantId });
    res.status(201).json({ success: true, center: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/consent/preference-centers/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.updatePreferenceCenter(req.params.id, req.body, tenantId);
    res.json({ success: true, message: 'Preference center updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/consent/preference-centers/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.deletePreferenceCenter(req.params.id, tenantId);
    res.json({ success: true, message: 'Preference center deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Data Elements CRUD
router.get('/api/consent/data-elements', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getConsentDataElements(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/consent/data-elements', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createConsentDataElement({ ...req.body, tenantId });
    res.status(201).json({ success: true, element: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/consent/data-elements/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.updateDataElement(req.params.id, req.body, tenantId);
    res.json({ success: true, message: 'Data element updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/consent/data-elements/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.deleteDataElement(req.params.id, tenantId);
    res.json({ success: true, message: 'Data element deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Consent Transactions
router.get('/api/consent/transactions', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getConsentTransactions(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/consent/transactions/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getConsentTransactionById(req.params.id, tenantId);
    if (!data) return res.status(404).json({ success: false, error: 'Transaction not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Policies CRUD
router.get('/api/consent/policies', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getConsentPolicies(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/consent/policies', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createConsentPolicy({ ...req.body, tenantId });
    res.status(201).json({ success: true, policy: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/consent/policies/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.updateConsentPolicy(req.params.id, req.body, tenantId);
    res.json({ success: true, message: 'Policy updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/consent/policies/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.deleteConsentPolicy(req.params.id, tenantId);
    res.json({ success: true, message: 'Policy deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Portal Settings
router.get('/api/consent/portal-settings', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getConsentPortalSettings(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/consent/portal-settings', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const { settingKey, settingValue } = req.body;
    await models.upsertConsentPortalSetting(tenantId, settingKey, settingValue);
    res.json({ success: true, message: 'Portal setting saved' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Cookie Scans & Logs CRUD
router.get(['/api/cookies/scans', '/api/cookies/dashboard'], async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getCookieScans(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post(['/api/cookies/scans', '/api/cookies/dashboard'], async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createCookieScan({ ...req.body, tenantId });
    res.status(201).json({ success: true, scan: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/cookies/logs', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getCookieConsentLogs(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/cookies/logs', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createCookieConsentLog({ ...req.body, tenantId });
    res.status(201).json({ success: true, log: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/cookies/banners', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getCookieBanners(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/cookies/banners', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createCookieBanner({ ...req.body, tenantId });
    res.status(201).json({ success: true, banner: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/cookies/banners/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.updateCookieBanner(req.params.id, req.body, tenantId);
    res.json({ success: true, message: 'Banner updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/cookies/banners/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.deleteCookieBanner(req.params.id, tenantId);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/cookies/geo-rules', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getCookieGeoRules(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/cookies/geo-rules', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createCookieGeoRule({ ...req.body, tenantId });
    res.status(201).json({ success: true, rule: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/cookies/geo-rules/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.updateGeoRule(req.params.id, req.body, tenantId);
    res.json({ success: true, message: 'Geo rule updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/cookies/geo-rules/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.deleteGeoRule(req.params.id, tenantId);
    res.json({ success: true, message: 'Geo rule deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
