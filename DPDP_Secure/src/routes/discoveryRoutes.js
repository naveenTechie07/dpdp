const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure safe memory upload for parsing
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.txt', '.csv', '.xlsx'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .txt, .csv, and .xlsx files are supported.'));
    }
  }
});

const discoveryController = require('../controllers/discoveryController');

// GET View Routes
router.get('/discovery/connectors', discoveryController.renderConnectors);

router.get('/inventory/assets', (req, res) => {
  res.render('inventory-assets', {
    title: 'Data Assets - DPDP_Secure',
    description: 'Inventory of all informal data systems and repositories.',
    breadcrumbs: ['Workspace', 'Data Mapping', 'Data Assets'],
    path: '/inventory/assets'
  });
});

router.get('/inventory/tags', (req, res) => {
  res.render('inventory-tags', {
    title: 'Classification Tags - DPDP_Secure',
    description: 'Define Indian PII and sensitivity categories.',
    breadcrumbs: ['Workspace', 'Data Mapping', 'Classification'],
    path: '/inventory/tags'
  });
});

router.get('/inventory/ropa', discoveryController.renderRoPA);

router.get('/inventory/lineage', (req, res) => {
  res.render('inventory-lineage', {
    title: 'Data Lineage - DPDP_Secure',
    description: 'Track how data flows between informal systems.',
    breadcrumbs: ['Workspace', 'Data Mapping', 'Lineage'],
    path: '/inventory/lineage'
  });
});

router.get('/inventory/assessment-enrichment', (req, res) => {
  res.render('inventory-assessment-enrichment', {
    title: 'Assessment Enrichment - DPDP_Secure',
    description: 'Map assessment answers to data assets.',
    breadcrumbs: ['Workspace', 'Data Mapping', 'Field Mappings'],
    path: '/inventory/assessment-enrichment'
  });
});

// API Routes
router.post('/api/discovery/scan-sample', discoveryController.scanSampleFiles);
router.post('/api/discovery/upload', upload.single('siloFile'), discoveryController.uploadAndScan);
router.get('/api/discovery/findings', discoveryController.getFindings);

// RoPA Section 8(4) Endpoints
router.get('/api/ropa/export-csv', discoveryController.exportRoPaCsv);
router.get('/api/ropa/data', discoveryController.getRoPaData);
router.post('/api/ropa/generate', discoveryController.generateRoPA);

module.exports = router;
