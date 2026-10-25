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

// Anti-DDoS Rate Limiting on Public Portal: Max 5 requests per 15 minutes per IP
const dsrPublicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
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
router.get('/privacy/workflows', (req, res) => {
  res.render('privacy-workflows', {
    title: 'Workflows - DPDP_Secure',
    description: 'Configurable stage-based workflows for Data Principal Rights requests.',
    breadcrumbs: ['Workspace', 'Privacy', 'Workflows'],
    path: '/privacy/workflows'
  });
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
