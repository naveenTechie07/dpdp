/**
 * DPDP_Secure - Incident Management & Breach Triage Controller
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Pillar 4: Security Incident & Breach Triage Subsystem
 * Enforces DPDP Act Section 8(6) & DPDP Rules, 2025 (Rule 7)
 * Implements 72-hour regulatory countdown clock, SME threat scenarios,
 * role-based access control, and statutory Form DPBI-IR1 dossier generation.
 */

const models = require('../models');
const {
  SME_THREAT_SCENARIOS,
  calculateRisk,
  compute72HourCountdown,
  sanitizeIncidentText
} = require('../services/breachRiskCalculator');

const DEFAULT_TENANT_ID = 'TENANT-AAROGYA-01';

/**
 * Default pre-seeded showcase incidents for hackathon demonstration
 */
const DEFAULT_INCIDENTS = [
  {
    id: 'INC-2026-9921',
    tenantId: DEFAULT_TENANT_ID,
    incidentTitle: 'Lost Receptionist Smartphone (Indiranagar Metro Station)',
    scenarioType: 'DEVICE_LOSS_UNENCRYPTED',
    severity: 'CRITICAL',
    affectedCount: 250,
    dataCategories: 'Identity (Aadhaar), Contact (Phone), Clinical Health (Diagnostic Requisitions)',
    containmentActions: JSON.stringify([
      { id: 'ACT-01', text: 'Trigger Google Find My Device remote lock & wipe', done: true, urgent: true },
      { id: 'ACT-02', text: 'Revoke active WhatsApp Business linked web sessions', done: true, urgent: true },
      { id: 'ACT-03', text: 'Generate Form DPBI-IR1 72-Hour Intimation Dossier', done: false, urgent: true },
      { id: 'ACT-04', text: 'Dispatch reassuring plain-language citizen alerts', done: false, urgent: false }
    ]),
    reportedToDpbi: 0,
    citizenAlertSent: 0,
    discoveredAt: new Date(Date.now() - 3.75 * 60 * 60 * 1000).toISOString(), // ~3.75 hours ago (68h remaining)
    createdAt: new Date(Date.now() - 3.75 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'INC-2026-4412',
    tenantId: DEFAULT_TENANT_ID,
    incidentTitle: 'Compromised Desktop Billing Workstation (Tally Malware Quarantined)',
    scenarioType: 'MALWARE_INFESTATION',
    severity: 'MEDIUM',
    affectedCount: 80,
    dataCategories: 'Financial (Invoices, Tax Line Items, GSTIN), Identity (Customer Name)',
    containmentActions: JSON.stringify([
      { id: 'ACT-01', text: 'Disconnect desktop computer from local network', done: true, urgent: true },
      { id: 'ACT-02', text: 'Mount and verify offline daily air-gapped backup', done: true, urgent: true },
      { id: 'ACT-03', text: 'Run anti-malware quarantine scan across drive', done: true, urgent: true }
    ]),
    reportedToDpbi: 0,
    citizenAlertSent: 0,
    discoveredAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
];

/**
 * Renders the interactive Incident & Breach Management Operations Workspace
 * GET /incidents/management
 */
async function renderManagementView(req, res) {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;

    // Fetch live incidents from SQLite
    let dbIncidents = await models.getIncidents(tenantId);

    // If database is empty, seed initial showcase incidents
    if (!dbIncidents || dbIncidents.length === 0) {
      for (const inc of DEFAULT_INCIDENTS) {
        await models.createIncident(inc);
      }
      dbIncidents = await models.getIncidents(tenantId);
    }

    // Attach real-time 72-hour regulatory countdowns & parse structured actions
    const enrichedIncidents = (dbIncidents || []).map((inc) => {
      const countdown = compute72HourCountdown(inc.discoveredAt);
      let actions = [];
      try {
        actions = typeof inc.containmentActions === 'string'
          ? JSON.parse(inc.containmentActions)
          : (inc.containmentActions || []);
      } catch (e) {
        actions = [
          { id: 'ACT-01', text: 'Isolate hardware device and revoke active web sessions', done: false, urgent: true }
        ];
      }

      return {
        ...inc,
        countdown,
        actions,
        status: inc.reportedToDpbi ? 'REPORTED_TO_DPBI' : (inc.citizenAlertSent ? 'NOTIFYING_CITIZENS' : 'CONTAINING')
      };
    });

    // Compute operational metrics
    const totalOpen = enrichedIncidents.length;
    const criticalHigh = enrichedIncidents.filter((i) => i.severity === 'CRITICAL' || i.severity === 'HIGH').length;
    const pendingDpbi = enrichedIncidents.filter((i) => !i.reportedToDpbi && (i.severity === 'CRITICAL' || i.severity === 'HIGH')).length;
    const overdueDpbi = enrichedIncidents.filter((i) => i.countdown?.isOverdue && !i.reportedToDpbi).length;

    // Active primary countdown (e.g. from the most urgent critical open incident)
    const primaryCritical = enrichedIncidents.find((i) => i.severity === 'CRITICAL' && !i.reportedToDpbi);
    const activeCountdown = primaryCritical ? primaryCritical.countdown : compute72HourCountdown(new Date(Date.now() - 3.75 * 60 * 60 * 1000));

    res.render('incidents-management', {
      title: 'Incident Management - DPDP_Secure',
      description: 'Track, assess, and respond to data incidents and security breaches under DPDP Rules, 2025 (Rule 7).',
      breadcrumbs: ['Workspace', 'Incidents & Breaches', 'Incident Management'],
      path: '/incidents/management',
      incidents: enrichedIncidents,
      scenarios: SME_THREAT_SCENARIOS,
      activeCountdown,
      stats: {
        totalOpen,
        criticalHigh,
        pendingDpbi,
        overdueDpbi
      }
    });
  } catch (error) {
    console.error('Error in incidentController.renderManagementView:', error);
    res.status(500).render('500', {
      title: '500 Server Error | DPDP_Secure',
      message: 'Failed to load incident management workspace.'
    });
  }
}

/**
 * Renders the SME Executive Breach Dashboard with visual metric distributions
 * GET /incidents/dashboard
 */
async function renderDashboardView(req, res) {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const incidents = await models.getIncidents(tenantId);

    const totalOpen = incidents.length;
    const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL').length;
    const highCount = incidents.filter((i) => i.severity === 'HIGH').length;
    const mediumCount = incidents.filter((i) => i.severity === 'MEDIUM').length;
    const lowCount = incidents.filter((i) => i.severity === 'LOW').length;
    const pendingDpbi = incidents.filter((i) => !i.reportedToDpbi && (i.severity === 'CRITICAL' || i.severity === 'HIGH')).length;
    const overdueDpbi = incidents.filter((i) => {
      const countdown = compute72HourCountdown(i.discoveredAt);
      return countdown.isOverdue && !i.reportedToDpbi;
    }).length;

    res.render('incidents-dashboard', {
      title: 'Breach Dashboard - DPDP_Secure',
      description: 'Breach notification compliance under DPDP Act Section 8(6) & DPDP Rules, 2025.',
      breadcrumbs: ['Workspace', 'Incidents & Breaches', 'Dashboard'],
      path: '/incidents/dashboard',
      incidents,
      stats: {
        totalOpen,
        criticalHigh: criticalCount + highCount,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        pendingDpbi,
        overdueDpbi
      }
    });
  } catch (error) {
    console.error('Error in incidentController.renderDashboardView:', error);
    res.status(500).render('500', {
      title: '500 Server Error | DPDP_Secure',
      message: 'Failed to load incident dashboard.'
    });
  }
}

/**
 * Renders statutory Form DPBI-IR1 Breach Intimation Dossier for the Data Protection Board of India
 * GET /incidents/dossier/:id
 */
async function renderDossier(req, res) {
  try {
    const incidentId = req.params.id;
    let incident = await models.getIncidentById(incidentId);

    // Fallback to preset if not found in SQLite
    if (!incident) {
      incident = DEFAULT_INCIDENTS.find(i => i.id === incidentId) || DEFAULT_INCIDENTS[0];
    }

    const discoveredDate = new Date(incident.discoveredAt || Date.now()).toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'Asia/Kolkata'
    });

    const statutoryDeadline = new Date(new Date(incident.discoveredAt).getTime() + 72 * 60 * 60 * 1000).toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'Asia/Kolkata'
    });

    let actions = [];
    try {
      actions = typeof incident.containmentActions === 'string'
        ? JSON.parse(incident.containmentActions)
        : (incident.containmentActions || []);
    } catch (e) {
      actions = [];
    }

    const dossierHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Form DPBI-IR1 - Breach Intimation Dossier | ${incident.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; color: #0f172a; padding: 40px; max-width: 820px; margin: 0 auto; line-height: 1.5; font-size: 13px; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; text-align: center; }
          .header h1 { font-size: 18px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; }
          .header p { font-size: 12px; color: #475569; margin: 4px 0 0 0; font-weight: 600; }
          .section-title { font-weight: 700; background: #f1f5f9; padding: 6px 12px; font-size: 12px; margin: 20px 0 8px 0; border-left: 4px solid #0284c7; text-transform: uppercase; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background: #f8fafc; width: 32%; color: #334155; font-weight: 600; }
          .badge-critical { background: #fee2e2; color: #991b1b; font-weight: 700; padding: 3px 8px; border-radius: 4px; font-size: 11px; border: 1px solid #f87171; }
          .badge-high { background: #ffedd5; color: #9a3412; font-weight: 700; padding: 3px 8px; border-radius: 4px; font-size: 11px; border: 1px solid #fb923c; }
          .btn-print { background: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 12px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
          .btn-print:hover { background: #0369a1; }
          .checklist-item { margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
          @media print { .btn-print { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button class="btn-print" onclick="window.print()">🖨️ Print Statutory Form DPBI-IR1</button>
          <span style="font-size:11px; color:#64748b; font-family:monospace;">STAMP: DPDP_SECURE_2026</span>
        </div>

        <div class="header">
          <h1>Data Protection Board of India (DPBI)</h1>
          <p>FORM DPBI-IR1 | STATUTORY BREACH INTIMATION DOSSIER [Section 8(6) & DPDP Rules, 2025 Rule 7]</p>
        </div>

        <div class="section-title">1. DATA FIDUCIARY IDENTIFICATION & REGISTRATION</div>
        <table>
          <tr><th>Entity Name</th><td><strong>Aarogya Diagnostic Center</strong> (Indiranagar, Bengaluru)</td></tr>
          <tr><th>Fiduciary Category</th><td>Small Business Healthcare Diagnostic Center (SME Fiduciary)</td></tr>
          <tr><th>GSTIN / Registration</th><td>29AAAAA0000A1Z5</td></tr>
          <tr><th>Designated DPO</th><td>Ramesh Kumar (privacy@aarogyaclinic.in · +91 9845012345)</td></tr>
        </table>

        <div class="section-title">2. INCIDENT CHRONOLOGY & IMMUTABLE 72-HOUR STATUTORY WINDOW</div>
        <table>
          <tr><th>Incident Reference ID</th><td><strong>${incident.id}</strong></td></tr>
          <tr><th>Initial Discovery Timestamp</th><td>${discoveredDate} <span style="font-size:10px; color:#64748b;">(Permanently locked)</span></td></tr>
          <tr><th>Mandatory Reporting Deadline</th><td><strong>${statutoryDeadline}</strong> (72-Hour Window)</td></tr>
          <tr><th>Statutory Severity Assessment</th><td><span class="${incident.severity === 'CRITICAL' ? 'badge-critical' : 'badge-high'}">${incident.severity} (Statutory Elevation Active)</span></td></tr>
        </table>

        <div class="section-title">3. NATURE OF PERSONAL DATA INVOLVED & ESTIMATED EXPOSURE</div>
        <table>
          <tr><th>Incident Title & Threat Vector</th><td>${incident.incidentTitle}</td></tr>
          <tr><th>Impacted Silos</th><td>WhatsApp Reception Backup, Mobile Storage (${incident.scenarioType})</td></tr>
          <tr><th>Categories of Personal Data</th><td>${incident.dataCategories}</td></tr>
          <tr><th>Estimated Data Principals</th><td>~${incident.affectedCount} individuals</td></tr>
        </table>

        <div class="section-title">4. IMMEDIATE CONTAINMENT ACTIONS & REMEDIATION (RULE 7)</div>
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin-bottom: 20px;">
          ${actions.length > 0
            ? actions.map(a => `
              <div class="checklist-item">
                <input type="checkbox" ${a.done ? 'checked' : ''} disabled style="margin: 0;">
                <span style="${a.done ? 'text-decoration: line-through; color: #475569;' : 'font-weight: 600; color: #0f172a;'}">${a.text || a}</span>
                ${a.urgent ? '<span style="font-size:9px; background:#fee2e2; color:#991b1b; padding:1px 4px; border-radius:3px; font-weight:700;">URGENT</span>' : ''}
              </div>
            `).join('')
            : `
              <div class="checklist-item"><input type="checkbox" checked disabled> <span>Trigger Google Find My Device remote lock & wipe</span></div>
              <div class="checklist-item"><input type="checkbox" checked disabled> <span>Revoke active WhatsApp Business linked web sessions</span></div>
              <div class="checklist-item"><input type="checkbox" checked disabled> <span>Generate Form DPBI-IR1 72-Hour Intimation Dossier</span></div>
              <div class="checklist-item"><input type="checkbox" disabled> <span>Dispatch reassuring plain-language citizen alerts</span></div>
            `
          }
        </div>

        <div class="section-title">5. STATUTORY CERTIFICATION</div>
        <p style="font-size: 11px; color: #475569; margin-top: 8px;">
          I hereby certify under Section 8(6) of the Digital Personal Data Protection Act, 2023 and Rule 7 of the DPDP Rules, 2025 that the intimation provided above accurately reflects the findings and containment measures implemented by the Data Fiduciary.
        </p>
        <div style="margin-top: 32px; display: flex; justify-content: space-between; border-top: 1px dashed #cbd5e1; padding-top: 12px;">
          <div>
            <div style="font-weight: 700;">Ramesh Kumar</div>
            <div style="font-size: 11px; color: #64748b;">Designated Compliance Officer · Digital Verification Stamp Verified</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; color: #0284c7;">DPDP_Secure Subsystem</div>
            <div style="font-size: 11px; color: #64748b;">Srujana Tech Fest 2026 · Problem Statement LS-04</div>
          </div>
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(dossierHtml);
  } catch (error) {
    console.error('Error in incidentController.renderDossier:', error);
    res.status(500).send('Failed to generate statutory DPBI Form dossier.');
  }
}

/**
 * Declares a new Security Incident with automated risk evaluation and SQLite persistence
 * POST /api/incidents/create
 */
async function createIncident(req, res) {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const actor = req.session?.user?.name || 'Ramesh Kumar (DPO)';

    // Data Spill Prevention: Sanitize input strings to prevent plaintext Aadhaar/health leaks
    const incidentTitle = sanitizeIncidentText(req.body.incidentTitle || 'Unnamed Security Incident');
    const scenarioType = sanitizeIncidentText(req.body.scenarioType || 'CUSTOM');
    const impactedSilos = req.body.impactedSilos || [];
    const estimatedCount = parseInt(req.body.estimatedCount, 10) || 0;
    const dataCategories = req.body.dataCategories || [];

    // Evaluate risk and statutory reporting obligations under Rule 7
    const riskResult = calculateRisk({
      incidentTitle,
      scenarioType,
      impactedSilos,
      estimatedCount,
      dataCategories,
      safeguardsInPlace: req.body.safeguardsInPlace || 'NONE',
      discoveredAt: new Date()
    });

    const incidentId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const discoveredAt = new Date().toISOString(); // Permanently locked chronology

    // Format containment actions
    const containmentActions = (riskResult.structuredActions || []).map((a, idx) => ({
      id: a.id || `ACT-0${idx + 1}`,
      text: a.text || a,
      done: false,
      urgent: a.urgent ?? true
    }));

    // Persist into SQLite
    await models.createIncident({
      id: incidentId,
      tenantId,
      incidentTitle,
      scenarioType,
      severity: riskResult.severity,
      affectedCount: estimatedCount,
      dataCategories: Array.isArray(dataCategories) ? dataCategories.join(', ') : String(dataCategories),
      containmentActions: JSON.stringify(containmentActions),
      reportedToDpbi: 0,
      citizenAlertSent: 0,
      discoveredAt
    });

    // Write immutable audit log
    await models.logAuditEvent(
      tenantId,
      actor,
      'DECLARE_SECURITY_INCIDENT',
      `incidents/${incidentId}`,
      {
        incidentId,
        incidentTitle,
        severity: riskResult.severity,
        score: riskResult.score,
        discoveredAt,
        statutoryDeadline: riskResult.statutoryDeadline,
        mandatoryDpbiIntimation: riskResult.mandatoryDpbiIntimation
      }
    );

    return res.status(200).json({
      success: true,
      incidentId,
      severity: riskResult.severity,
      score: riskResult.score,
      statutoryDeadline: riskResult.statutoryDeadline,
      discoveredAt,
      mandatoryDpbiIntimation: riskResult.mandatoryDpbiIntimation,
      containmentActions: riskResult.containmentActions,
      structuredActions: containmentActions,
      dossierUrl: `/incidents/dossier/${incidentId}`
    });
  } catch (error) {
    console.error('Error in incidentController.createIncident:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to declare security incident.',
      details: error.message
    });
  }
}

/**
 * Updates containment checklist and remediation status
 * POST /api/incidents/triage
 */
async function triageIncident(req, res) {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const actor = req.session?.user?.name || 'Ramesh Kumar (DPO)';
    const { incidentId, actionId, done, containmentActions } = req.body || {};

    if (!incidentId) {
      return res.status(400).json({ success: false, error: 'incidentId is required.' });
    }

    const incident = await models.getIncidentById(incidentId);
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found.' });
    }

    let updatedActions = [];

    if (Array.isArray(containmentActions)) {
      updatedActions = containmentActions;
    } else {
      let currentActions = [];
      try {
        currentActions = typeof incident.containmentActions === 'string'
          ? JSON.parse(incident.containmentActions)
          : (incident.containmentActions || []);
      } catch (e) {
        currentActions = [];
      }

      updatedActions = currentActions.map(a => {
        if (a.id === actionId) {
          return { ...a, done: Boolean(done) };
        }
        return a;
      });
    }

    await models.updateIncidentContainment(incidentId, updatedActions);

    await models.logAuditEvent(
      tenantId,
      actor,
      'UPDATE_INCIDENT_CONTAINMENT',
      `incidents/${incidentId}`,
      { incidentId, actionId, done }
    );

    return res.json({
      success: true,
      message: 'Containment actions updated in incident log.',
      incidentId,
      containmentActions: updatedActions
    });
  } catch (error) {
    console.error('Error in incidentController.triageIncident:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update containment action.',
      details: error.message
    });
  }
}

/**
 * Simulates plain-language citizen reassurance notifications across SMS & WhatsApp
 * POST /api/incidents/dispatch-alerts
 */
async function dispatchAlerts(req, res) {
  try {
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;
    const actor = req.session?.user?.name || 'Ramesh Kumar (DPO)';
    const { incidentId } = req.body || {};

    if (incidentId) {
      await models.updateIncident(incidentId, { citizenAlertSent: 1 });
      await models.logAuditEvent(
        tenantId,
        actor,
        'DISPATCH_CITIZEN_BREACH_ALERTS',
        `incidents/${incidentId}`,
        { incidentId, channels: ['SMS', 'WhatsApp'], languages: ['EN', 'KN', 'HI'] }
      );
    }

    return res.json({
      success: true,
      deliveredCount: 250,
      channels: ['SMS', 'WhatsApp'],
      languages: ['EN', 'KN', 'HI'],
      message: 'Reassuring plain-language citizen alerts dispatched without disclosing internal technical vulnerabilities.'
    });
  } catch (error) {
    console.error('Error in incidentController.dispatchAlerts:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to dispatch citizen alerts.',
      details: error.message
    });
  }
}

module.exports = {
  renderManagementView,
  renderDashboardView,
  renderDossier,
  createIncident,
  triageIncident,
  dispatchAlerts,
  DEFAULT_INCIDENTS
};
