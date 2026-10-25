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
    if (['.txt', '.csv', '.xlsx', '.xml'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .txt, .csv, .xlsx, and .xml files are supported.'));
    }
  }
});

const discoveryController = require('../controllers/discoveryController');
const models = require('../models');

// GET View Routes
router.get('/discovery/connectors', discoveryController.renderConnectors);
router.get('/discovery/sanitizer', discoveryController.renderSanitizer);

router.get('/inventory/assets', (req, res) => {
  res.render('inventory-assets', {
    title: 'Data Assets - DPDP_Secure',
    description: 'Inventory of all informal data systems and repositories.',
    breadcrumbs: ['Workspace', 'Data Mapping', 'Data Assets'],
    path: '/inventory/assets'
  });
});

router.get('/inventory/assets/create', (req, res) => {
  res.render('inventory-asset-create', {
    title: 'Create New Asset - DPDP_Secure',
    description: 'Register a new data system or container.',
    breadcrumbs: ['Workspace', 'Data Mapping', 'Data Assets', 'New Asset'],
    path: '/inventory/assets/create'
  });
});

router.post('/api/assets/create', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    const { assetName, assetType, sourceSystem, sensitivity, elements, status, description } = req.body;

    if (!assetName) {
      return res.status(400).json({ success: false, error: 'Asset name is required' });
    }

    const id = await models.createDataAsset({
      tenantId,
      assetName,
      assetType,
      sourceSystem,
      sensitivity,
      elements: elements || '0',
      status: status || 'active',
      description
    });

    await models.logAuditEvent(
      tenantId,
      req.session?.user?.name || 'Reception Staff',
      'CREATE_DATA_ASSET',
      id,
      JSON.stringify({
        details: `Created new data asset: ${assetName} (${assetType})`,
        assetName,
        assetType,
        sourceSystem,
        sensitivity
      })
    );

    res.json({ success: true, id, message: 'Asset created successfully' });
  } catch (err) {
    console.error('[DISCOVERY] createAsset error:', err);
    res.status(500).json({ success: false, error: 'Failed to create asset: ' + err.message });
  }
});

router.get('/inventory/tags', (req, res) => {
  res.render('inventory-tags', {
    title: 'Classification Tags - DPDP_Secure',
    description: 'Define Indian PII and sensitivity categories.',
    breadcrumbs: ['Workspace', 'Data Mapping', 'Classification'],
    path: '/inventory/tags'
  });
});

router.get('/inventory/tags/create', (req, res) => {
  res.redirect('/inventory/tags');
});

router.post('/inventory/tags/create', (req, res) => {
  res.json({ success: true, message: 'Tag created successfully' });
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
router.post('/api/discovery/sanitize-text', discoveryController.sanitizeText);

// RoPA Section 8(4) Endpoints
router.get('/inventory/ropa/print', discoveryController.renderRoPAPrint);
router.get('/api/ropa/export-csv', discoveryController.exportRoPaCsv);
router.get('/api/ropa/data', discoveryController.getRoPaData);
router.post('/api/ropa/generate', discoveryController.generateRoPA);

module.exports = router;
