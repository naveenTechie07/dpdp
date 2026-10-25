const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Homepage / Executive Dashboard
router.get('/', dashboardController.renderDashboard);

// Dashboard live metrics API
router.get('/api/dashboard/metrics', dashboardController.getMetricsJson);

// Profile
router.get('/profile', dashboardController.renderProfile);

// About
router.get('/about', dashboardController.renderAbout);

module.exports = router;
