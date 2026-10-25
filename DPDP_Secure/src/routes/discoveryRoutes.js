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

router.get('/inventory/assets', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    const assets = await models.getDataAssets(tenantId);
    res.render('inventory-assets', {
      title: 'Data Assets - DPDP_Secure',
      description: 'Inventory of all informal data systems and repositories.',
      breadcrumbs: ['Workspace', 'Data Mapping', 'Data Assets'],
      path: '/inventory/assets',
      assets: assets || []
    });
  } catch (err) {
    console.error('[DISCOVERY] getAssets error:', err);
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/inventory/assets/create', (req, res) => {
  res.render('inventory-asset-create', {
    title: 'Create New Asset - DPDP_Secure',
    description: 'Register a new data system or container.',
    breadcrumbs: ['Workspace', 'Data Mapping', 'Data Assets', 'New Asset'],
    path: '/inventory/assets/create'
  });
});

router.get('/api/assets', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    const assets = await models.getDataAssets(tenantId);
    res.json({ success: true, data: assets || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
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

    res.status(201).json({ success: true, id, message: 'Asset created successfully' });
  } catch (err) {
    console.error('[DISCOVERY] createAsset error:', err);
    res.status(500).json({ success: false, error: 'Failed to create asset: ' + err.message });
  }
});

router.put('/api/assets/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    await models.updateDataAsset(req.params.id, req.body, tenantId);
    await models.logAuditEvent(tenantId, req.session?.user?.name || 'Admin', 'UPDATE_DATA_ASSET', req.params.id, req.body);
    res.json({ success: true, message: 'Asset updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/assets/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    await models.deleteDataAsset(req.params.id, tenantId);
    await models.logAuditEvent(tenantId, req.session?.user?.name || 'Admin', 'DELETE_DATA_ASSET', req.params.id, {});
    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/inventory/tags', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    const tags = await models.getDataTags(tenantId);
    res.render('inventory-tags', {
      title: 'Classification Tags - DPDP_Secure',
      description: 'Define Indian PII and sensitivity categories.',
      breadcrumbs: ['Workspace', 'Data Mapping', 'Classification'],
      path: '/inventory/tags',
      tags: tags || []
    });
  } catch (err) {
    console.error('[DISCOVERY] getTags error:', err);
    res.status(500).render('500', { title: 'Error', description: err.message, breadcrumbs: ['Error'] });
  }
});

router.get('/inventory/tags/create', (req, res) => {
  res.redirect('/inventory/tags');
});

router.get('/api/tags', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    const tags = await models.getDataTags(tenantId);
    res.json({ success: true, data: tags || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post(['/api/tags/create', '/inventory/tags/create'], async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    const { tagName, category, subCategory, sensitivityWeight, colorTag, description } = req.body;

    if (!tagName) {
      return res.status(400).json({ success: false, error: 'Tag name is required' });
    }

    const id = await models.createDataTag({
      tenantId,
      tagName,
      category: category || 'identifier',
      subCategory: subCategory || '',
      sensitivityWeight: sensitivityWeight ? parseInt(sensitivityWeight, 10) : 50,
      colorTag: colorTag || '#8b5cf6',
      description: description || ''
    });

    await models.logAuditEvent(tenantId, req.session?.user?.name || 'Admin', 'CREATE_DATA_TAG', id, req.body);
    res.status(201).json({ success: true, id, message: 'Tag created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/tags/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    await models.updateDataTag(req.params.id, req.body, tenantId);
    await models.logAuditEvent(tenantId, req.session?.user?.name || 'Admin', 'UPDATE_DATA_TAG', req.params.id, req.body);
    res.json({ success: true, message: 'Tag updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/tags/:id', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    await models.deleteDataTag(req.params.id, tenantId);
    await models.logAuditEvent(tenantId, req.session?.user?.name || 'Admin', 'DELETE_DATA_TAG', req.params.id, {});
    res.json({ success: true, message: 'Tag deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
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

// Enterprise Connector Catalog & Schema APIs
router.get('/api/connectors/catalog', discoveryController.getConnectorCatalog);
router.get('/api/connectors/schema/:tableId', discoveryController.getTableSchema);
router.post(['/api/connectors/scan', '/api/connectors/scan/:connectorId'], discoveryController.scanConnector);


// RoPA Section 8(4) Endpoints
router.get('/inventory/ropa/print', discoveryController.renderRoPAPrint);
router.get('/api/ropa/export-csv', discoveryController.exportRoPaCsv);
router.get('/api/ropa/data', discoveryController.getRoPaData);
router.get('/api/ropa/graph', discoveryController.getRoPaGraph);
router.all('/api/ropa/retention-recommendation', discoveryController.getRetentionRecommendation);
router.post('/api/ropa/generate', discoveryController.generateRoPA);

// RoPA CRUD endpoints
router.get('/api/ropa/:id', discoveryController.getRoPARecordById);
router.post('/api/ropa/create', discoveryController.createRoPARecord);
router.put('/api/ropa/:id', discoveryController.updateRoPARecord);
router.delete('/api/ropa/:id', discoveryController.deleteRoPARecord);

// RoPA-Silo Mapping Endpoints
router.get('/api/ropa/:id/silos', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    const silos = await models.getSilosForRopa(req.params.id, tenantId);
    res.json({ success: true, silos: silos || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/ropa/:id/silos', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    const { siloId, mappingType } = req.body;
    if (!siloId) {
      return res.status(400).json({ success: false, error: 'siloId is required' });
    }
    const mapping = await models.createRopaSiloMapping(req.params.id, siloId, tenantId, mappingType || 'primary');
    res.status(201).json({ success: true, mapping });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/api/ropa/:id/silos', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    const { siloIds } = req.body;
    const ids = Array.isArray(siloIds) ? siloIds : [];
    await models.setRopaSiloMappings(req.params.id, ids, tenantId);
    const updatedSilos = await models.getSilosForRopa(req.params.id, tenantId);
    await models.logAuditEvent(
      tenantId,
      req.session?.user?.name || 'Admin',
      'MAP_ROPA_SILOS_BATCH',
      req.params.id,
      JSON.stringify({ details: `Updated mapped silos for RoPA activity ${req.params.id}`, siloCount: ids.length, siloIds: ids })
    );
    res.json({ success: true, message: 'Silo mappings updated successfully', silos: updatedSilos });
  } catch (err) {
    console.error('[ROPA] update mappings error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/ropa/:id/silos', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    await models.deleteAllRopaSiloMappings(req.params.id, tenantId);
    await models.logAuditEvent(
      tenantId,
      req.session?.user?.name || 'Admin',
      'CLEAR_ROPA_SILOS',
      req.params.id,
      JSON.stringify({ details: `Cleared all mapped silos for RoPA activity ${req.params.id}` })
    );
    res.json({ success: true, message: 'All silo mappings cleared successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/api/ropa/:id/silos/:siloId', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    await models.deleteRopaSiloMapping(req.params.id, req.params.siloId, tenantId);
    res.json({ success: true, message: 'Mapping deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/connectors/create', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    const { name, siloName, siloType, uri, filePath, riskLevel } = req.body;
    const finalName = name || siloName;
    if (!finalName) {
      return res.status(400).json({ success: false, error: 'Connector name is required' });
    }
    const id = `SILO-${Date.now().toString(36).toUpperCase()}`;
    await models.saveSilo({
      id,
      tenantId,
      siloName: finalName,
      siloType: siloType || 'ENTERPRISE_RDBMS',
      filePath: filePath || uri || 'local://connection',
      itemCount: 0,
      riskLevel: riskLevel || 'MEDIUM'
    });
    await models.logAuditEvent(
      tenantId,
      req.session?.user?.name || 'Admin',
      'CREATE_CONNECTOR',
      id,
      JSON.stringify({ details: `Added new connector: ${finalName} (${siloType || 'ENTERPRISE_RDBMS'})` })
    );
    res.status(201).json({ success: true, id, message: `Connector '${finalName}' registered successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/api/silos/:id/ropa', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    const records = await models.getRopaForSilo(req.params.id, tenantId);
    res.json({ success: true, records: records || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Silo list endpoint for mapping UI
router.get('/api/silos', async (req, res) => {
  try {
    const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
    const silos = await models.getSilos(tenantId);
    res.json({ success: true, data: silos || [] });
  } catch (err) {
    console.error('[DISCOVERY] getSilos error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
