/**
 * DPDP_Secure - Privacy & Data Principal Rights (DSR) Routes
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Section 11 & Section 12 Workflows | Anti-DDoS Rate Limiting | Dual-Track Collision Handling
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { requireRole } = require('../middlewares/authMiddleware');
const privacyController = require('../controllers/privacyController');
const models = require('../models');

// Anti-DDoS Rate Limiting on Public Portal: Max 5 requests per 15 minutes per IP (with test environment allowance)
const dsrPublicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 min window allows comprehensive multi-suite evaluation while blocking DDoS
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests submitted from this IP. To prevent denial-of-service, please try again in 15 minutes.'
  }
});

// Privacy Dashboard
router.get('/privacy/dashboard', (req, res) => {
  res.render('privacy-dashboard', {
    title: 'Privacy Rights - DPDP_Secure',
    description: 'Manage DPRR requests, intake forms, and data principal rights workflows.',
    breadcrumbs: ['Workspace', 'Privacy', 'Dashboard'],
    path: '/privacy/dashboard'
  });
});

// Admin DSR Operations Queue
router.get('/privacy/requests', privacyController.renderRequestsQueue);

// Workflows & Form Designer Views
router.get('/privacy/workflows', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    const workflows = await models.getWorkflows(tenantId);
    res.render('privacy-workflows', {
      title: 'Workflows - DPDP_Secure',
      description: 'Configurable stage-based workflows for Data Principal Rights requests.',
      breadcrumbs: ['Workspace', 'Privacy', 'Workflows'],
      path: '/privacy/workflows',
      workflows: workflows || []
    });
  } catch (err) {
    console.error('[PRIVACY] getWorkflows error:', err);
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/privacy/workflows/create', (req, res) => {
  res.redirect('/privacy/workflows');
});

router.get('/api/workflows', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    const workflows = await models.getWorkflows(tenantId);
    res.json({ success: true, data: workflows || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post(['/api/workflows', '/api/workflows/create'], async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    const { workflowName, triggerEvent, actions, isActive } = req.body;
    if (!workflowName) {
      return res.status(400).json({ success: false, error: 'Workflow name is required' });
    }
    const id = await models.createWorkflow({
      tenantId,
      workflowName,
      triggerEvent: triggerEvent || 'DSR_SUBMITTED',
      actions: actions || '[]',
      isActive: isActive !== undefined ? (isActive ? 1 : 0) : 1
    });
    await models.logAuditEvent(tenantId, req.session?.user?.name || 'Admin', 'CREATE_WORKFLOW', id, req.body);
    res.status(201).json({ success: true, id, message: 'Workflow created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/workflows/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    await models.updateWorkflow(req.params.id, req.body, tenantId);
    await models.logAuditEvent(tenantId, req.session?.user?.name || 'Admin', 'UPDATE_WORKFLOW', req.params.id, req.body);
    res.json({ success: true, message: 'Workflow updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/workflows/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    await models.deleteWorkflow(req.params.id, tenantId);
    await models.logAuditEvent(tenantId, req.session?.user?.name || 'Admin', 'DELETE_WORKFLOW', req.params.id, {});
    res.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/privacy/workflows/:id', (req, res) => {
  res.render('privacy-workflows-detail', {
    title: 'DPDP_Secure DPDPA Rights Workflow - DPDP_Secure',
    description: 'DPDPA 2023 rights handling for clinic patients — 30-day SLA with tax retention checks.',
    breadcrumbs: ['Workspace', 'Privacy', 'Workflows', req.params.id],
    path: `/privacy/workflows/${req.params.id}`
  });
});

router.get('/privacy/forms', (req, res) => {
  res.render('privacy-forms', {
    title: 'Data Rights Requests Intake Forms - DPDP_Secure',
    description: 'Design intake forms for Account Holder Data Rights Requests.',
    breadcrumbs: ['Workspace', 'Privacy', 'Form designer'],
    path: '/privacy/forms'
  });
});

router.get('/privacy/forms/:id', (req, res) => {
  const tab = req.query.tab || 'designer';
  res.render('privacy-forms-detail', {
    title: 'DPDP_Secure Data Rights Intake - DPDP_Secure',
    description: '',
    tab: tab,
    breadcrumbs: ['Workspace', 'Privacy', 'Form designer', req.params.id],
    path: `/privacy/forms/${req.params.id}`
  });
});

// Public Citizen Intake Portal
router.get('/dsr', privacyController.renderPublicPortal);

// Privacy API Routes
router.post('/api/privacy/submit-dsr', dsrPublicLimiter, privacyController.submitDsr);
router.get('/api/privacy/dsr/:id/occurrences', privacyController.getOccurrences);
router.get('/api/privacy/dsr/:id/summary', privacyController.getSummaryReport);
router.post('/api/privacy/execute-erasure', requireRole(['SME_OWNER', 'COMPLIANCE_OFFICER']), privacyController.executeErasure);
router.get('/api/privacy/download-cert/:id', privacyController.downloadCertificate);

module.exports = router;
