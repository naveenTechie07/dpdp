const express = require('express');
const router = express.Router();
const { requireRole } = require('../middlewares/authMiddleware');

// Incident Views
router.get('/incidents/dashboard', (req, res) => {
  res.render('incidents-dashboard', {
    title: 'Breach Dashboard - DPDP_Secure',
    description: 'Breach notification compliance under DPDP Act Section 8(6).',
    breadcrumbs: ['Workspace', 'Incidents & Breaches', 'Dashboard'],
    path: '/incidents/dashboard'
  });
});

router.get('/incidents/management', (req, res) => {
  res.render('incidents-management', {
    title: 'Incident Management - DPDP_Secure',
    description: 'Track, assess, and respond to data incidents and security breaches under DPDP Rules, 2025 (Rule 7).',
    breadcrumbs: ['Workspace', 'Incidents & Breaches', 'Incident Management'],
    path: '/incidents/management'
  });
});

router.get('/incidents/dossier/:id', (req, res) => {
  const dossierHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Form DPBI-IR1 - Data Protection Board of India Intimation Dossier</title>
      <style>
        body { font-family: "Segoe UI", Arial, sans-serif; background: #fff; color: #111; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.5; }
        .header { border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 24px; text-align: center; }
        .header h1 { font-size: 18px; margin: 0; text-transform: uppercase; }
        .header p { font-size: 12px; color: #555; margin: 4px 0 0 0; }
        .section-title { font-weight: bold; background: #f1f5f9; padding: 6px 10px; font-size: 13px; margin: 16px 0 8px 0; border-left: 4px solid #0284c7; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
        th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
        th { background: #f8fafc; width: 35%; }
        .badge { background: #fee2e2; color: #b91c1c; font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
        .btn-print { background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold; margin-bottom: 20px; }
        @media print { .btn-print { display: none; } body { padding: 0; } }
      </style>
    </head>
    <body>
      <button class="btn-print" onclick="window.print()">Print Statutory Form DPBI-IR1</button>
      <div class="header">
        <h1>Data Protection Board of India (DPBI)</h1>
        <p>FORM DPBI-IR1 | STATUTORY BREACH INTIMATION DOSSIER [Section 8(6) & Rule 7]</p>
      </div>

      <div class="section-title">1. DATA FIDUCIARY IDENTIFICATION</div>
      <table>
        <tr><th>Name of Entity</th><td>Aarogya Diagnostic Center (Indiranagar, Bengaluru)</td></tr>
        <tr><th>Registration / GSTIN</th><td>29AAAAA0000A1Z5</td></tr>
        <tr><th>Data Protection Officer</th><td>Ramesh Kumar (privacy@aarogyaclinic.in)</td></tr>
      </table>

      <div class="section-title">2. INCIDENT CHRONOLOGY & 72-HOUR STATUTORY WINDOW</div>
      <table>
        <tr><th>Incident Reference ID</th><td>${req.params.id}</td></tr>
        <tr><th>Discovered Timestamp</th><td>2026-09-16 08:30 IST</td></tr>
        <tr><th>Intimation Timestamp</th><td>Within 72-Hour Statutory Mandate</td></tr>
        <tr><th>Assessed Severity</th><td><span class="badge">CRITICAL (Score: 88/100)</span></td></tr>
      </table>

      <div class="section-title">3. NATURE OF PERSONAL DATA BREACH</div>
      <table>
        <tr><th>Silo / Vector Impacted</th><td>Lost Receptionist Android Smartphone (WhatsApp chats + test results)</td></tr>
        <tr><th>Categories Impacted</th><td>Identity (Aadhaar), Contact (Phone), Clinical Health Data (Biopsy, Blood panels)</td></tr>
        <tr><th>Estimated Headcount</th><td>~250 Patients</td></tr>
        <tr><th>Containment Status</th><td>Remote lock triggered via Google Find My Device. WhatsApp web sessions revoked.</td></tr>
      </table>
    </body>
    </html>
  `;
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(dossierHtml);
});

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

// Incident API Routes
router.post('/api/incidents/create', requireRole(['SME_OWNER', 'COMPLIANCE_OFFICER']), (req, res) => {
  const { incidentTitle, scenarioType, impactedSilos, estimatedCount, dataCategories } = req.body || {};
  const incidentId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  res.json({
    success: true,
    incidentId,
    severity: 'CRITICAL',
    score: 88,
    statutoryDeadline: '72 Hours from discovery',
    mandatoryDpbiIntimation: true,
    containmentActions: [
      'Trigger remote lock and wipe on lost device',
      'Revoke active WhatsApp Business web sessions',
      'Generate printable Form DPBI-IR1 dossier',
      'Dispatch plain-language reassurance notices to affected patients'
    ]
  });
});

router.post('/api/incidents/triage', requireRole(['SME_OWNER', 'COMPLIANCE_OFFICER']), (req, res) => {
  res.json({
    success: true,
    message: 'Containment actions updated in incident log.'
  });
});

router.post('/api/incidents/dispatch-alerts', requireRole(['SME_OWNER', 'COMPLIANCE_OFFICER']), (req, res) => {
  res.json({
    success: true,
    deliveredCount: 250,
    channels: ['SMS', 'WhatsApp'],
    languages: ['EN', 'KN', 'HI'],
    message: 'Reassuring plain-language citizen alerts dispatched without leaking internal technical vulnerabilities.'
  });
});

module.exports = router;
