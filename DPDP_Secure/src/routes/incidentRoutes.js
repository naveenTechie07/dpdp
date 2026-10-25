/**
 * DPDP_Secure - Incident & Breach Management Routes
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Pillar 4: Security Incident Triage & 72-Hour Statutory Intimation
 * Restricts incident declaration & triage strictly to SME_OWNER and COMPLIANCE_OFFICER.
 */

const express = require('express');
const router = express.Router();
const { requireRole } = require('../middlewares/authMiddleware');
const incidentController = require('../controllers/incidentController');

// Incident Views
router.get('/incidents/dashboard', incidentController.renderDashboardView);
router.get('/incidents/management', requireRole(['SME_OWNER', 'COMPLIANCE_OFFICER']), incidentController.renderManagementView);
router.get('/incidents/dossier/:id', incidentController.renderDossier);

// Notification Center View
router.get('/notifications/center', (req, res) => {
  const tab = req.query.tab || 'providers';
  res.render('notifications-center', {
    title: 'Notification Center - DPDP_Secure',
    description: 'Configure providers, message templates, and test sends for email, SMS, WhatsApp, and in-app channels.',
    breadcrumbs: ['Workspace', 'Notifications'],
    activeTab: tab,
    path: '/notifications/center'
  });
});

// Incident Action APIs (Restricted via Role-Based Access Control)
router.post('/api/incidents/create', requireRole(['SME_OWNER', 'COMPLIANCE_OFFICER']), incidentController.createIncident);
router.post('/api/incidents/triage', requireRole(['SME_OWNER', 'COMPLIANCE_OFFICER']), incidentController.triageIncident);
router.post('/api/incidents/dispatch-alerts', requireRole(['SME_OWNER', 'COMPLIANCE_OFFICER']), incidentController.dispatchAlerts);

module.exports = router;
