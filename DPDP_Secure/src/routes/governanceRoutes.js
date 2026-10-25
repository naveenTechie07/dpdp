const express = require('express');
const router = express.Router();

// Governance Routes
router.get('/governance/processors', (req, res) => {
  res.render('governance-processors', {
    title: 'Data Processors - DPDP_Secure',
    description: 'Vendor register.',
    breadcrumbs: ['Workspace', 'Governance', 'Processors'],
    path: '/governance/processors'
  });
});

router.get('/governance/retention', (req, res) => {
  res.render('governance-retention', {
    title: 'Retention - DPDP_Secure',
    description: 'Retention policies under DPDP Act & Statutory Laws.',
    breadcrumbs: ['Workspace', 'Governance', 'Retention'],
    path: '/governance/retention'
  });
});

router.get('/governance/cross-border', (req, res) => {
  res.render('governance-cross-border', {
    title: 'Cross-Border Transfers - DPDP_Secure',
    description: 'Track international data transfers.',
    breadcrumbs: ['Workspace', 'Governance', 'Cross Border'],
    path: '/governance/cross-border'
  });
});

router.get('/governance/evidence', (req, res) => {
  res.render('governance-evidence', {
    title: 'Compliance Evidence - DPDP_Secure',
    description: 'Store and manage compliance documents.',
    breadcrumbs: ['Workspace', 'Governance', 'Evidence'],
    path: '/governance/evidence'
  });
});

router.get('/governance/security-controls', (req, res) => {
  res.render('governance-security', {
    title: 'Security Controls - DPDP_Secure',
    description: 'Track security safeguards for informal SME data systems.',
    breadcrumbs: ['Workspace', 'Governance', 'Security'],
    path: '/governance/security-controls'
  });
});

// Assessment Automation Routes
router.get('/assessment/dashboard', (req, res) => {
  res.render('assessment-dashboard', {
    title: 'Assessment Automation - DPDP_Secure',
    description: 'Overview of PIA & DPIA assessments.',
    breadcrumbs: ['Workspace', 'Assessment Automation', 'Dashboard'],
    path: '/assessment/dashboard'
  });
});

router.get('/assessment/templates', (req, res) => {
  res.render('assessment-templates', {
    title: 'Assessment Templates - DPDP_Secure',
    description: 'Define question sets and automation rules.',
    breadcrumbs: ['Workspace', 'Assessment Automation', 'Templates'],
    path: '/assessment/templates'
  });
});

router.get('/assessment/pia-dpia', (req, res) => {
  res.render('assessment-piadpia', {
    title: 'PIA & DPIA - DPDP_Secure',
    description: 'PIA and DPIA intake, workflows, and monitoring.',
    breadcrumbs: ['Workspace', 'Assessments'],
    path: '/assessment/pia-dpia'
  });
});

router.get('/assessment/settings', (req, res) => {
  res.render('assessment-settings', {
    title: 'Assessment Settings - DPDP_Secure',
    description: 'Configure assessment module settings.',
    breadcrumbs: ['Workspace', 'Assessments', 'Settings'],
    path: '/assessment/settings'
  });
});

module.exports = router;
