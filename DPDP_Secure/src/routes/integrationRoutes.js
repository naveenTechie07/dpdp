const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const models = require('../models');

const DEFAULT_TENANT_ID = 'TENANT-AAROGYA-01';

// View Routes
router.get('/integrations/dashboard', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const integrations = await models.getIntegrations(tenantId);
    res.render('integrations-dashboard', {
      title: 'Dashboard - DPDP_Secure',
      description: 'Connect DPDP_Secure to your SME MarTech stack.',
      breadcrumbs: ['Workspace', 'Integrations', 'Dashboard'],
      path: '/integrations/dashboard',
      integrations: integrations || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/integrations/hub', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const hub = await models.getIntegrationHub(tenantId);
    res.render('integrations-hub', {
      title: 'Integrations Hub - DPDP_Secure',
      description: 'Connect DPDP_Secure to informal and formal business tools.',
      breadcrumbs: ['Workspace', 'Integrations', 'Integrations Hub'],
      path: '/integrations/hub',
      connectors: hub || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/integrations/api-keys', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const keys = await models.getApiKeys(tenantId);
    res.render('integrations-apikeys', {
      title: 'API keys - DPDP_Secure',
      description: 'Generate service keys for web, mobile, and backend integrations.',
      breadcrumbs: ['Workspace', 'API keys'],
      path: '/integrations/api-keys',
      keys: keys || []
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

// ==========================================
// INTEGRATIONS & API KEY CRUD APIS
// ==========================================

router.get('/api/integrations', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getIntegrations(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/integrations', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createIntegration({ ...req.body, tenantId });
    res.status(201).json({ success: true, integration: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/integrations/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.deleteIntegration(req.params.id, tenantId);
    res.json({ success: true, message: 'Integration disconnected' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/integrations/hub', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getIntegrationHub(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/integrations/hub', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createIntegrationHubItem({ ...req.body, tenantId });
    res.status(201).json({ success: true, connector: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/integrations/api-keys', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getApiKeys(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/integrations/api-keys', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const { keyName, scopes } = req.body || {};
    
    // Generate secure random key
    const rawSecret = `dpdp_live_${crypto.randomBytes(24).toString('hex')}`;
    const keyPrefix = rawSecret.slice(0, 14) + '...';
    const keyHash = crypto.createHash('sha256').update(rawSecret).digest('hex');

    const created = await models.createApiKey({
      tenantId,
      keyName: keyName || 'Production Clinic Integration Key',
      keyPrefix,
      keyHash,
      scopes: scopes || 'read:pii,write:consent'
    });

    await models.logAuditEvent(tenantId, req.session?.user?.name || 'Admin', 'GENERATE_API_KEY', created.id, {
      keyName: created.keyName,
      keyPrefix
    });

    // Return rawSecret once only upon creation
    res.status(201).json({
      success: true,
      apiKey: created,
      secretKey: rawSecret,
      warning: 'Store this key safely; it will never be displayed in plain text again.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/integrations/api-keys/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.deleteApiKey(req.params.id, tenantId);
    await models.logAuditEvent(tenantId, req.session?.user?.name || 'Admin', 'REVOKE_API_KEY', req.params.id, {});
    res.json({ success: true, message: 'API key revoked' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
