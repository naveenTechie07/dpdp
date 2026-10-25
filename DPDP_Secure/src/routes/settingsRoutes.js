const express = require('express');
const router = express.Router();
const models = require('../models');
const auditLogger = require('../models/auditLogger');
const demoController = require('../controllers/demoController');

const DEFAULT_TENANT_ID = 'TENANT-AAROGYA-01';

// ==========================================
// SETTINGS VIEW ROUTES (WITH LIVE SQLITE DATA)
// ==========================================

router.get('/settings/general', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const settings = await models.getTenantSettings(tenantId);
    res.render('settings-general', {
      title: 'General Settings - DPDP_Secure',
      description: 'Platform-level settings for this tenant.',
      breadcrumbs: ['Workspace', 'Settings', 'General'],
      path: '/settings/general',
      settings: settings || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/settings/sso', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const sso = await models.getSsoSettings(tenantId);
    res.render('settings-sso', {
      title: 'Single Sign-On - DPDP_Secure',
      description: "Connect your organization's identity provider and activate SSO after a successful real login test.",
      breadcrumbs: ['Workspace', 'Settings', 'Sso'],
      path: '/settings/sso',
      sso: sso || {}
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/settings/branding', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const branding = await models.getBrandingSettings(tenantId);
    res.render('settings-branding', {
      title: 'Branding & Theme - DPDP_Secure',
      description: 'Customize logo and tenant theme colors for all portal pages.',
      breadcrumbs: ['Workspace', 'Settings', 'Branding'],
      path: '/settings/branding',
      branding: branding || {}
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

// Alias redirect for /branding -> /settings/branding
router.get('/branding', (req, res) => {
  res.redirect('/settings/branding');
});

router.get('/settings/organization', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const org = await models.getOrganizationSettings(tenantId);
    res.render('settings-organization', {
      title: 'Organization Hierarchy - DPDP_Secure',
      description: 'Define tenant org trees, child-org locale overrides, and inherited settings.',
      breadcrumbs: ['Workspace', 'Settings', 'Organization'],
      path: '/settings/organization',
      org: org || {}
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/settings/roles', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const roles = await models.getRolePermissions(tenantId);
    res.render('settings-roles', {
      title: 'Roles & Permissions - DPDP_Secure',
      description: 'Manage tenant roles, permissions, users, and role assignments.',
      breadcrumbs: ['Workspace', 'Settings', 'Roles'],
      path: '/settings/roles',
      roles: roles || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/settings/audit-log', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const chainStatus = await auditLogger.verifyAuditChain(tenantId);
    const logs = await auditLogger.getAuditLogs(tenantId, { limit: 100 });

    res.render('settings-audit-log', {
      title: 'Audit Log - DPDP_Secure',
      description: 'Review tamper-evident security and configuration changes with cryptographic SHA-256 hash chaining.',
      breadcrumbs: ['Workspace', 'Settings', 'Audit Log'],
      path: '/settings/audit-log',
      logs,
      chainStatus
    });
  } catch (error) {
    console.error('Error rendering audit log:', error);
    res.render('settings-audit-log', {
      title: 'Audit Log - DPDP_Secure',
      description: 'Review tamper-evident security and configuration changes with cryptographic SHA-256 hash chaining.',
      breadcrumbs: ['Workspace', 'Settings', 'Audit Log'],
      path: '/settings/audit-log',
      logs: [],
      chainStatus: { verified: false, message: error.message }
    });
  }
});

router.get('/settings/localization', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const locales = await models.getLocalizationSettings(tenantId);
    res.render('settings-localization', {
      title: 'Localization & Labels - DPDP_Secure',
      description: 'Manage tenant language defaults (English, Kannada, Hindi) across the platform.',
      breadcrumbs: ['Workspace', 'Settings', 'Localization'],
      path: '/settings/localization',
      locales: locales || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

// ==========================================
// SETTINGS CRUD APIS
// ==========================================

router.get('/api/settings/general', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getTenantSettings(tenantId);
    res.json({ success: true, settings: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/settings/general', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const key = req.body?.settingKey || req.body?.key || 'general_setting';
    const val = req.body?.settingValue !== undefined ? req.body.settingValue : (req.body?.value || 'enabled');
    await models.upsertTenantSetting(tenantId, key, val);
    await models.logAuditEvent(tenantId, req.session?.user?.name || 'Admin', 'UPDATE_SETTING', key, { settingValue: val });
    res.json({ success: true, message: 'Setting saved' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/settings/sso', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getSsoSettings(tenantId);
    res.json({ success: true, sso: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/settings/sso', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.upsertSsoSettings(tenantId, req.body);
    res.json({ success: true, message: 'SSO configuration updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/settings/branding', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getBrandingSettings(tenantId);
    res.json({ success: true, branding: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/settings/branding', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.upsertBrandingSettings(tenantId, req.body);
    res.json({ success: true, message: 'Branding updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/settings/organization', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getOrganizationSettings(tenantId);
    res.json({ success: true, org: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/settings/organization', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.upsertOrganizationSettings(tenantId, req.body);
    res.json({ success: true, message: 'Organization settings updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/settings/roles', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getRolePermissions(tenantId);
    res.json({ success: true, roles: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/settings/roles', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createRolePermission({ ...req.body, tenantId });
    res.status(201).json({ success: true, role: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/settings/roles/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.updateRole(req.params.id, req.body, tenantId);
    res.json({ success: true, message: 'Role updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/settings/roles/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.deleteRole(req.params.id, tenantId);
    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/settings/localization', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getLocalizationSettings(tenantId);
    res.json({ success: true, locales: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/settings/localization', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.upsertLocalizationSettings(tenantId, req.body);
    res.json({ success: true, message: 'Localization settings saved' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Demo Seeder Reset API
router.post('/api/demo/reset', demoController.resetDemoEnvironment);

// Supabase Cloud System Status & Sync APIs
const { pingSupabase, isSupabaseAvailable } = require('../services/supabaseClient');
const { syncAllToSupabase } = require('../../scripts/syncToSupabase');

router.get('/api/system/supabase-status', async (req, res) => {
  try {
    const status = await pingSupabase();
    res.json({ success: true, supabase: status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/system/supabase-sync', async (req, res) => {
  try {
    const result = await syncAllToSupabase();
    res.json({ success: true, message: 'Supabase cloud synchronization completed', details: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/system/backend-telemetry', async (req, res) => {
  try {
    const { all, dbPath } = require('../models/db');
    const status = await pingSupabase();

    const tables = await all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    const tableCounts = {};
    let totalRows = 0;
    for (const t of tables) {
      try {
        const countRes = await all(`SELECT COUNT(*) as c FROM "${t.name}"`);
        const c = countRes[0]?.c || 0;
        tableCounts[t.name] = c;
        totalRows += c;
      } catch (e) {
        tableCounts[t.name] = 0;
      }
    }

    res.json({
      success: true,
      architecture: 'Dual-Engine (100% Offline SQLite + Enterprise Supabase Cloud PostgreSQL)',
      offlineEngine: {
        status: 'ACTIVE_100_PERCENT',
        dbPath,
        tablesCount: tables.length,
        totalRecords: totalRows,
        tableCounts
      },
      cloudEngine: status,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

