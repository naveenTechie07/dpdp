const express = require('express');
const router = express.Router();
const models = require('../models');

const DEFAULT_TENANT_ID = 'TENANT-AAROGYA-01';

// ==========================================
// GOVERNANCE VIEW ROUTES (WITH LIVE SQLITE DATA)
// ==========================================

router.get('/governance/processors', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const processors = await models.getDataProcessors(tenantId);
    res.render('governance-processors', {
      title: 'Data Processors - DPDP_Secure',
      description: 'Vendor register — data processors, sub-processors, DPA status, and risk assessments.',
      breadcrumbs: ['Workspace', 'Governance', 'Processors'],
      path: '/governance/processors',
      processors: processors || []
    });
  } catch (err) {
    console.error('Error rendering processors view:', err);
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/governance/retention', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const policies = await models.getRetentionPolicies(tenantId);
    res.render('governance-retention', {
      title: 'Retention - DPDP_Secure',
      description: 'Retention policies under DPDP Act & Statutory Laws.',
      breadcrumbs: ['Workspace', 'Governance', 'Retention'],
      path: '/governance/retention',
      policies: policies || []
    });
  } catch (err) {
    console.error('Error rendering retention view:', err);
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/governance/cross-border', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const transfers = await models.getCrossBorderTransfers(tenantId);
    res.render('governance-cross-border', {
      title: 'Cross-Border Transfers - DPDP_Secure',
      description: 'Track international data transfers.',
      breadcrumbs: ['Workspace', 'Governance', 'Cross Border'],
      path: '/governance/cross-border',
      transfers: transfers || []
    });
  } catch (err) {
    console.error('Error rendering cross-border view:', err);
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/governance/evidence', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const evidence = await models.getComplianceEvidence(tenantId);
    res.render('governance-evidence', {
      title: 'Compliance Evidence - DPDP_Secure',
      description: 'Store and manage compliance documents.',
      breadcrumbs: ['Workspace', 'Governance', 'Evidence'],
      path: '/governance/evidence',
      evidence: evidence || []
    });
  } catch (err) {
    console.error('Error rendering evidence view:', err);
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/governance/security-controls', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const controls = await models.getSecurityControls(tenantId);
    res.render('governance-security', {
      title: 'Security Controls - DPDP_Secure',
      description: 'Track security safeguards for informal SME data systems.',
      breadcrumbs: ['Workspace', 'Governance', 'Security'],
      path: '/governance/security-controls',
      controls: controls || []
    });
  } catch (err) {
    console.error('Error rendering security controls view:', err);
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

// ==========================================
// ASSESSMENT AUTOMATION VIEW ROUTES
// ==========================================

router.get('/assessment/dashboard', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const assessments = await models.getAssessments(tenantId);
    res.render('assessment-dashboard', {
      title: 'Assessment Automation - DPDP_Secure',
      description: 'Overview of PIA & DPIA assessments.',
      breadcrumbs: ['Workspace', 'Assessment Automation', 'Dashboard'],
      path: '/assessment/dashboard',
      assessments: assessments || []
    });
  } catch (err) {
    console.error('Error rendering assessment dashboard:', err);
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/assessment/templates', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const templates = await models.getAssessmentTemplates(tenantId);
    res.render('assessment-templates', {
      title: 'Assessment Templates - DPDP_Secure',
      description: 'Define question sets and automation rules.',
      breadcrumbs: ['Workspace', 'Assessment Automation', 'Templates'],
      path: '/assessment/templates',
      templates: templates || []
    });
  } catch (err) {
    console.error('Error rendering assessment templates:', err);
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/assessment/pia-dpia', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const piaDpiaList = await models.getPiaDpiaAssessments(tenantId);
    res.render('assessment-piadpia', {
      title: 'PIA & DPIA - DPDP_Secure',
      description: 'PIA and DPIA intake, workflows, and monitoring.',
      breadcrumbs: ['Workspace', 'Assessments'],
      path: '/assessment/pia-dpia',
      piaDpiaList: piaDpiaList || []
    });
  } catch (err) {
    console.error('Error rendering pia-dpia view:', err);
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/assessment/settings', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const settings = await models.getAssessmentSettings(tenantId);
    res.render('assessment-settings', {
      title: 'Assessment Settings - DPDP_Secure',
      description: 'Configure assessment module settings.',
      breadcrumbs: ['Workspace', 'Assessments', 'Settings'],
      path: '/assessment/settings',
      settings: settings || []
    });
  } catch (err) {
    console.error('Error rendering assessment settings:', err);
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

// ==========================================
// GOVERNANCE CRUD API ENDPOINTS
// ==========================================

// 1. Data Processors
router.get('/api/governance/processors', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getDataProcessors(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/governance/processors', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createDataProcessor({ ...req.body, tenantId });
    await models.logAuditEvent(tenantId, req.session?.user?.name || 'Admin', 'CREATE_PROCESSOR', created.id, req.body);
    res.status(201).json({ success: true, processor: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/governance/processors/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.deleteDataProcessor(req.params.id, tenantId);
    await models.logAuditEvent(tenantId, req.session?.user?.name || 'Admin', 'DELETE_PROCESSOR', req.params.id, {});
    res.json({ success: true, message: 'Processor deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Retention Policies
router.get('/api/governance/retention', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getRetentionPolicies(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/governance/retention', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createRetentionPolicy({ ...req.body, tenantId });
    await models.logAuditEvent(tenantId, req.session?.user?.name || 'Admin', 'CREATE_RETENTION_POLICY', created.id, req.body);
    res.status(201).json({ success: true, policy: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/governance/retention/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.deleteRetentionPolicy(req.params.id, tenantId);
    res.json({ success: true, message: 'Retention policy deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Cross-Border Transfers
router.get('/api/governance/cross-border', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getCrossBorderTransfers(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/governance/cross-border', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createCrossBorderTransfer({ ...req.body, tenantId });
    res.status(201).json({ success: true, transfer: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/governance/cross-border/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.deleteCrossBorderTransfer(req.params.id, tenantId);
    res.json({ success: true, message: 'Cross-border transfer deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Compliance Evidence
router.get('/api/governance/evidence', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getComplianceEvidence(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/governance/evidence', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createComplianceEvidence({ ...req.body, tenantId });
    res.status(201).json({ success: true, evidence: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/governance/evidence/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.deleteComplianceEvidence(req.params.id, tenantId);
    res.json({ success: true, message: 'Evidence deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Security Controls
router.get('/api/governance/security-controls', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getSecurityControls(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/governance/security-controls', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createSecurityControl({ ...req.body, tenantId });
    res.status(201).json({ success: true, control: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/governance/security-controls/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.deleteSecurityControl(req.params.id, tenantId);
    res.json({ success: true, message: 'Security control deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ASSESSMENT AUTOMATION CRUD API ENDPOINTS
// ==========================================

router.get('/api/assessment/assessments', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getAssessments(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/assessment/assessments', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createAssessment({ ...req.body, tenantId });
    res.status(201).json({ success: true, assessment: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/assessment/assessments/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    await models.deleteAssessment(req.params.id, tenantId);
    res.json({ success: true, message: 'Assessment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/assessment/templates', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getAssessmentTemplates(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/assessment/templates', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createAssessmentTemplate({ ...req.body, tenantId });
    res.status(201).json({ success: true, template: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/assessment/pia-dpia', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getPiaDpiaAssessments(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/assessment/pia-dpia', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const created = await models.createPiaDpiaAssessment({ ...req.body, tenantId });
    res.status(201).json({ success: true, assessment: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/assessment/settings', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const data = await models.getAssessmentSettings(tenantId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/assessment/settings', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const { settingKey, settingValue } = req.body;
    await models.upsertAssessmentSetting(tenantId, settingKey, settingValue);
    res.json({ success: true, message: 'Setting saved' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
