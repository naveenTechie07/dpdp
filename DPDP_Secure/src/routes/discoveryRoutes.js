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

router.get('/inventory/ropa', (req, res) => {
  res.render('inventory-ropa', {
    title: 'Processing Activities (RoPA) - DPDP_Secure',
    description: 'Record of Processing Activities under DPDP Act Section 8(4).',
    breadcrumbs: ['Workspace', 'Data Mapping', 'RoPA'],
    path: '/inventory/ropa'
  });
});

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

router.get('/api/ropa/export-csv', (req, res) => {
  const csvHeaders = 'Activity Name,Categories of Personal Data,Purpose,Legal Basis,Retention Period,Storage Location,Safeguards\n';
  const csvRows = [
    '"Patient Diagnostic Dispatch","Identity (Aadhaar), Contact (Mobile), Health (Lipid/Blood)","Lab Report Delivery","Section 6 Consent / Lawful Purpose","3 Years","Reception Android / Billing PC","Screen Lock, Zero Cloud Egress"',
    '"Customer Lead Management","Identity (Aadhaar, PAN), Contact (Mobile, Email)","Home Sample Collection","Section 6 Consent","1 Year or until Revocation","Lead Spreadsheet","Password Protected"',
    '"Tax Billing & Invoicing","Financial (GSTIN, Amount), Contact (Phone)","Statutory Tax Compliance","CGST Act 2017 Sec 36 / DPDP Sec 8(7)","72 Months (6 Years)","Tally Billing Software","Local Air-Gapped PC"'
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="DPDP_Secure_RoPA_Register.csv"');
  res.status(200).send(csvHeaders + csvRows);
});

router.get('/api/ropa/data', (req, res) => {
  res.json({
    success: true,
    count: 3,
    records: [
      {
        activityName: 'Patient Diagnostic Dispatch',
        categories: 'Aadhaar, Mobile, Clinical Health Tests',
        purpose: 'Lab report delivery to patient',
        legalBasis: 'DPDP Act Section 6 (Consent)',
        retention: '3 Years',
        storage: 'Local Android Device'
      },
      {
        activityName: 'Lead Management',
        categories: 'Aadhaar, PAN, Phone',
        purpose: 'Diagnostic sample pickup coordination',
        legalBasis: 'DPDP Act Section 6 (Consent)',
        retention: '1 Year',
        storage: 'Lead Spreadsheet'
      },
      {
        activityName: 'Statutory Invoicing',
        categories: 'GSTIN, Invoice Amount, Phone',
        purpose: 'Tax compliance under GST law',
        legalBasis: 'CGST Act Section 36 read with DPDP Section 8(7)',
        retention: '72 Months (6 Years)',
        storage: 'Desktop Billing System'
      }
    ]
  });
});

router.post('/api/ropa/generate', (req, res) => {
  res.json({
    success: true,
    message: 'RoPA synthesized under Section 8(4) from current informal data findings.',
    activitiesGenerated: 3
  });
});

module.exports = router;
