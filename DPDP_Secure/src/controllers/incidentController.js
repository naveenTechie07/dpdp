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

const crypto = require('crypto');
const models = require('../models');
const {
  SME_THREAT_SCENARIOS,
  calculateRisk,
  compute72HourCountdown,
  sanitizeIncidentText
} = require('../services/breachRiskCalculator');

const {
  generateDpbiDossier,
  generateCitizenAlerts,
  computeDossierFingerprint,
  DEFAULT_FIDUCIARY
} = require('../services/dossierGenerator');

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
    dataCategories: 'Identity (Aadhaar, PAN), Contact (Phone), Clinical Health (Diagnostic Requisitions, Biopsy)',
    containmentActions: JSON.stringify([
      { id: 'ACT-01', text: 'Trigger Google Find My Device remote lock & wipe', done: true, urgent: true },
      { id: 'ACT-02', text: 'Revoke active WhatsApp Business linked web sessions across all endpoints', done: true, urgent: true },
      { id: 'ACT-03', text: 'Rotate clinic reception WhatsApp OTP & SIM card via telecom provider', done: false, urgent: false },
      { id: 'ACT-04', text: 'Generate statutory Form DPBI-IR1 72-Hour Intimation Dossier', done: true, urgent: true },
      { id: 'ACT-05', text: 'Dispatch reassuring plain-language citizen alerts without technical details', done: false, urgent: false }
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
 * In-memory simulated citizen alert dispatch log for the Notification Center queue
 */
const RECENT_ALERT_DISPATCHES = [
  {
    id: 'DISP-2026-901',
    incidentId: 'INC-2026-9921',
    incidentTitle: 'Lost Receptionist Smartphone (Indiranagar Metro Station)',
    channels: ['SMS', 'WhatsApp'],
    languages: ['EN', 'KN', 'HI'],
    deliveredCount: 250,
    status: 'DELIVERED',
    dispatchedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    vulnerabilityConcealed: true,
    sha256Proof: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
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

    // Sample alert text preview for modal
    const sampleIncident = enrichedIncidents[0] || DEFAULT_INCIDENTS[0];
    const alertPreviews = generateCitizenAlerts(sampleIncident);

    res.render('incidents-management', {
      title: 'Incident Management - DPDP_Secure',
      description: 'Track, assess, and respond to data incidents and security breaches under DPDP Rules, 2025 (Rule 7).',
      breadcrumbs: ['Workspace', 'Incidents & Breaches', 'Incident Management'],
      path: '/incidents/management',
      incidents: enrichedIncidents,
      scenarios: SME_THREAT_SCENARIOS,
      activeCountdown,
      alertPreviews,
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
    const dossier = await generateDpbiDossier(incidentId);

    res.render('dpbi-dossier-print', {
      title: `Form DPBI-IR1 - ${dossier.incidentId} | DPDP_Secure`,
      description: 'Statutory Personal Data Breach Intimation Dossier under Section 8(6) & Rule 7.',
      path: `/incidents/dossier/${dossier.incidentId}`,
      breadcrumbs: ['Workspace', 'Incidents', 'Form DPBI-IR1 Dossier'],
      dossier
    });
  } catch (error) {
    console.error('Error in incidentController.renderDossier:', error);
    res.status(500).send('Failed to generate statutory DPBI Form dossier.');
  }
}

/**
 * Returns canonical JSON of the statutory Form DPBI-IR1 Dossier with SHA-256 fingerprint
 * GET /api/incidents/dossier/:id
 */
async function getDossierJson(req, res) {
  try {
    const incidentId = req.params.id;
    const dossier = await generateDpbiDossier(incidentId);

    return res.json({
      success: true,
      incidentId: dossier.incidentId,
      dossier
    });
  } catch (error) {
    console.error('Error in incidentController.getDossierJson:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate dossier JSON',
      details: error.message
    });
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
    const { incidentId, channels, languages } = req.body || {};

    let targetIncident = null;
    if (incidentId) {
      targetIncident = await models.getIncidentById(incidentId);
    }
    if (!targetIncident) {
      targetIncident = DEFAULT_INCIDENTS[0];
    }

    // Generate multi-lingual alerts (English, Kannada, Hindi)
    const alertPackage = generateCitizenAlerts(targetIncident);
    const selectedChannels = channels || ['SMS', 'WhatsApp'];
    const selectedLanguages = languages || ['EN', 'KN', 'HI'];
    const deliveredCount = targetIncident.affectedCount || 250;
    const dispatchedAt = new Date().toISOString();

    // Mark incident as citizen alerts dispatched
    await models.updateIncident(targetIncident.id, { citizenAlertSent: 1 });

    // Compute cryptographic hash of dispatch event
    const sha256Proof = crypto.createHash('sha256')
      .update(targetIncident.id + dispatchedAt + JSON.stringify(selectedChannels))
      .digest('hex');

    // Record into simulated notification queue
    const dispatchRecord = {
      id: `DISP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      incidentId: targetIncident.id,
      incidentTitle: targetIncident.incidentTitle,
      channels: selectedChannels,
      languages: selectedLanguages,
      deliveredCount,
      status: 'DELIVERED',
      dispatchedAt,
      vulnerabilityConcealed: true,
      sha256Proof,
      alerts: alertPackage.languages
    };
    RECENT_ALERT_DISPATCHES.unshift(dispatchRecord);

    // Write audit log entry with SHA-256 hash chaining
    await models.logAuditEvent(
      tenantId,
      actor,
      'DISPATCH_CITIZEN_BREACH_ALERTS',
      `incidents/${targetIncident.id}`,
      {
        incidentId: targetIncident.id,
        channels: selectedChannels,
        languages: selectedLanguages,
        deliveredCount,
        sha256Proof,
        vulnerabilityConcealed: true
      }
    );

    return res.json({
      success: true,
      incidentId: targetIncident.id,
      deliveredCount,
      channels: selectedChannels,
      languages: selectedLanguages,
      dispatchedAt,
      sha256Proof,
      proofSha256: sha256Proof,
      alerts: alertPackage.languages,
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

/**
 * Renders the multi-channel Notification Center with citizen alert dispatch queue & regional templates
 * GET /notifications/center
 */
async function renderNotificationCenter(req, res) {
  try {
    const tab = req.query.tab || 'breach_alerts';
    const tenantId = req.session?.user?.tenantId || DEFAULT_TENANT_ID;

    // Fetch live incidents
    const incidents = await models.getIncidents(tenantId);
    const sampleIncident = (incidents && incidents.length > 0) ? incidents[0] : DEFAULT_INCIDENTS[0];
    const regionalAlerts = generateCitizenAlerts(sampleIncident);

    res.render('notifications-center', {
      title: 'Notification Center - DPDP_Secure',
      description: 'Configure providers, breach notification queues, and regional citizen advisories under DPDP Act Section 8(6).',
      breadcrumbs: ['Workspace', 'Notifications'],
      activeTab: tab,
      path: '/notifications/center',
      dispatches: RECENT_ALERT_DISPATCHES,
      regionalAlerts,
      sampleIncident
    });
  } catch (error) {
    console.error('Error in incidentController.renderNotificationCenter:', error);
    res.status(500).render('500', {
      title: '500 Server Error | DPDP_Secure',
      message: 'Failed to load Notification Center.'
    });
  }
}

module.exports = {
  renderManagementView,
  renderDashboardView,
  renderDossier,
  getDossierJson,
  createIncident,
  triageIncident,
  dispatchAlerts,
  renderNotificationCenter,
  DEFAULT_INCIDENTS,
  RECENT_ALERT_DISPATCHES
};
