/**
 * DPDP_Secure - Incident & Breach Management Routes
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Pillar 4: Security Incident Triage, 72-Hour Form DPBI-IR1 Dossier & Regional Citizen Alerts
 * Restricts incident declaration & triage strictly to SME_OWNER and COMPLIANCE_OFFICER.
 */

const express = require('express');
const router = express.Router();
const { requireRole } = require('../middlewares/authMiddleware');
const incidentController = require('../controllers/incidentController');

// Incident & Breach Management Views
router.get('/incidents/dashboard', incidentController.renderDashboardView);
router.get('/incidents/management', requireRole(['SME_OWNER', 'COMPLIANCE_OFFICER']), incidentController.renderManagementView);
router.get('/incidents/dossier/:id', incidentController.renderDossier);
router.get('/api/incidents/dossier/:id', incidentController.getDossierJson);

// Multi-Channel Notification Center View (Queues, Templates & History)
router.get('/notifications/center', incidentController.renderNotificationCenter);

// Incident Action APIs (Restricted via Role-Based Access Control)
router.post('/api/incidents/create', requireRole(['SME_OWNER', 'COMPLIANCE_OFFICER']), incidentController.createIncident);
router.post('/api/incidents/triage', requireRole(['SME_OWNER', 'COMPLIANCE_OFFICER']), incidentController.triageIncident);
router.post('/api/incidents/dispatch-alerts', requireRole(['SME_OWNER', 'COMPLIANCE_OFFICER']), incidentController.dispatchAlerts);

module.exports = router;
