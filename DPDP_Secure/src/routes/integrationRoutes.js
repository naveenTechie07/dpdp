const express = require('express');
const router = express.Router();

router.get('/integrations/dashboard', (req, res) => {
  res.render('integrations-dashboard', {
    title: 'Dashboard - DPDP_Secure',
    description: 'Connect DPDP_Secure to your SME MarTech stack.',
    breadcrumbs: ['Workspace', 'Integrations', 'Dashboard'],
    path: '/integrations/dashboard'
  });
});

router.get('/integrations/hub', (req, res) => {
  res.render('integrations-hub', {
    title: 'Integrations Hub - DPDP_Secure',
    description: 'Connect DPDP_Secure to informal and formal business tools.',
    breadcrumbs: ['Workspace', 'Integrations', 'Integrations Hub'],
    path: '/integrations/hub'
  });
});

router.get('/integrations/api-keys', (req, res) => {
  res.render('integrations-apikeys', {
    title: 'API keys - DPDP_Secure',
    description: 'Generate service keys for web, mobile, and backend integrations.',
    breadcrumbs: ['Workspace', 'API keys'],
    path: '/integrations/api-keys'
  });
});

module.exports = router;
