/**
 * DPDP_Secure - Data Discovery & Informal Silo Controller
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * 100% Offline-First | Zero Cloud Egress | Parameterized SQLite
 */

const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const models = require('../models');
const {
  parseWhatsAppChat,
  parseCsvOrExcel,
  parseTallyXml,
  scanPreloadedSamples,
  sanitizeFilename
} = require('../services/fileParsers');
const { scanTextForPii, maskPii, anonymizeText } = require('../services/indianPiiEngine');

const discoveryController = {
  /**
   * Renders the Data Discovery Connectors view with SQLite data
   */
  renderConnectors: async (req, res) => {
    try {
      const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
      const silos = await models.getSilos(tenantId);
      const findings = await models.getAllFindings(tenantId);

      const totalItems = silos.reduce((sum, s) => sum + (s.itemCount || 0), 0);

      res.render('discovery-connectors', {
        title: 'Data Discovery - DPDP_Secure',
        description: 'Connect informal data sources, run scans, and review PII findings.',
        breadcrumbs: ['Workspace', 'Data Discovery'],
        path: '/discovery/connectors',
        silos,
        findings,
        stats: {
          connectorsCount: silos.length,
          activeCount: silos.length,
          totalPiiCount: totalItems,
          pendingFindingsCount: findings.length
        }
      });
    } catch (err) {
      console.error('[DISCOVERY] renderConnectors error:', err);
      res.status(500).render('500', {
        title: 'Discovery Error - DPDP_Secure',
        description: 'Failed to load discovery connectors: ' + err.message,
        breadcrumbs: ['Workspace', 'Error']
      });
    }
  },

  /**
   * Scans the 3 pre-staged sample data files in data/sample_data/
   * Triggered by POST /api/discovery/scan-sample
   */
  scanSampleFiles: async (req, res) => {
    try {
      const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
      const result = await scanPreloadedSamples(tenantId);
      res.json(result);
    } catch (err) {
      console.error('[DISCOVERY] scanSampleFiles error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to scan preloaded sample files: ' + err.message
      });
    }
  },

  /**
   * Handles user-uploaded informal silo files (.txt, .csv, .xlsx)
   * Triggered by POST /api/discovery/upload
   */
  uploadAndScan: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded or file rejected by security filter.'
        });
      }

      const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
      const safeFilename = sanitizeFilename(req.file.originalname);
      const ext = path.extname(safeFilename).toLowerCase();
      const content = req.file.buffer || (req.file.path ? fs.readFileSync(req.file.path) : '');

      let parsed;
      let siloType;
      let riskLevel = 'HIGH';

      if (ext === '.txt') {
        siloType = 'WHATSAPP_CHAT';
        riskLevel = 'CRITICAL';
        parsed = parseWhatsAppChat(content, safeFilename);
      } else if (ext === '.csv' || ext === '.xlsx') {
        siloType = ext === '.xlsx' ? 'SPREADSHEET_XLSX' : 'SPREADSHEET_CSV';
        riskLevel = 'HIGH';
        parsed = parseCsvOrExcel(content, safeFilename);
      } else if (ext === '.xml') {
        siloType = 'TALLY_ERP_XML';
        riskLevel = 'HIGH';
        parsed = parseTallyXml(content, safeFilename);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Unsupported file format. Only .txt (WhatsApp), .csv, .xlsx, and .xml (Tally ERP) are supported.'
        });
      }

      // Ephemeral storage guardrail: Unlink temporary file from disk immediately if present
      if (req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.warn('[SECURITY] Could not unlink temp file:', e.message);
        }
      }

      // Persist Silo Metadata
      const siloId = `SILO-${uuidv4().slice(0, 8).toUpperCase()}`;
      await models.saveSilo({
        id: siloId,
        tenantId,
        siloName: safeFilename,
        siloType,
        filePath: `uploads/${safeFilename}`,
        itemCount: parsed.findings.length,
        riskLevel
      });

      // Persist Findings to SQLite
      const dbFindings = parsed.findings.map((f) => ({
        id: `FIND-${uuidv4().slice(0, 8)}`,
        siloId,
        entityName: f.entityName || 'Extracted Entity',
        piiType: f.type,
        maskedValue: f.maskedValue,
        rawSample: f.rawSample || f.rawValue,
        lineNumber: f.lineNumber || 1,
        confidenceScore: f.confidenceScore || 1.0,
        isRedacted: 0
      }));

      if (dbFindings.length > 0) {
        await models.savePiiFindings(dbFindings);
      }

      // Log to audit trail
      await models.logAuditEvent(
        tenantId,
        req.session?.user?.name || 'Reception Staff',
        'UPLOAD_SCAN',
        safeFilename,
        JSON.stringify({
          details: `Ingested and scanned informal file ${safeFilename} (${siloType}); identified ${dbFindings.length} PII items`,
          findingsCount: dbFindings.length,
          riskLevel
        })
      );

      res.json({
        success: true,
        filename: safeFilename,
        siloId,
        findingsCount: dbFindings.length,
        stats: parsed.stats,
        sampleFindings: dbFindings.slice(0, 10)
      });
    } catch (err) {
      console.error('[DISCOVERY] uploadAndScan error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to process and scan uploaded file: ' + err.message
      });
    }
  },

  /**
   * Returns stored findings from SQLite, with optional category filtering
   * Triggered by GET /api/discovery/findings
   */
  getFindings: async (req, res) => {
    try {
      const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
      const category = (req.query.category || 'ALL').toUpperCase();
      const allFindings = await models.getAllFindings(tenantId);

      let filtered = allFindings;
      if (category === 'AADHAAR') {
        filtered = allFindings.filter((f) => f.piiType === 'AADHAAR');
      } else if (category === 'PAN') {
        filtered = allFindings.filter((f) => f.piiType && f.piiType.includes('PAN'));
      } else if (category === 'HEALTH') {
        filtered = allFindings.filter(
          (f) => f.piiType === 'HEALTH' || (f.piiType && f.piiType.includes('CLINICAL'))
        );
      } else if (category === 'PHONE') {
        filtered = allFindings.filter((f) => f.piiType === 'PHONE');
      } else if (category === 'UPI') {
        filtered = allFindings.filter((f) => f.piiType === 'UPI');
      }

      res.json({
        success: true,
        count: filtered.length,
        category,
        findings: filtered
      });
    } catch (err) {
      console.error('[DISCOVERY] getFindings error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch findings: ' + err.message
      });
    }
  },

  /**
   * Renders the Record of Processing Activities (RoPA) view under Section 8(4)
   * Triggered by GET /inventory/ropa
   */
  renderRoPA: async (req, res) => {
    try {
      const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
      let ropaRecords = await models.getRoPARecords(tenantId);

      // Auto-synthesize standard baseline if empty
      if (!ropaRecords || ropaRecords.length === 0) {
        const { synthesizeRoPA } = require('../services/ropaService');
        const syn = await synthesizeRoPA(tenantId);
        ropaRecords = syn.records;
      }

      res.render('inventory-ropa', {
        title: 'Processing Activities (RoPA) - DPDP_Secure',
        description: 'Statutory Record of Processing Activities under DPDP Act Section 8(4).',
        breadcrumbs: ['Workspace', 'Data Mapping', 'RoPA'],
        path: '/inventory/ropa',
        ropaRecords
      });
    } catch (err) {
      console.error('[DISCOVERY] renderRoPA error:', err);
      res.status(500).render('500', {
        title: 'RoPA Error - DPDP_Secure',
        description: 'Failed to load RoPA records: ' + err.message,
        breadcrumbs: ['Workspace', 'Error']
      });
    }
  },

  /**
   * Streams a sanitized CSV file of the RoPA with formula injection defense
   * Triggered by GET /api/ropa/export-csv
   */
  exportRoPaCsv: async (req, res) => {
    try {
      const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
      const { generateRoPaCsv } = require('../services/ropaService');
      const csvContent = await generateRoPaCsv(tenantId);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="DPDP_Secure_RoPA_Register.csv"');
      res.status(200).send(csvContent);
    } catch (err) {
      console.error('[DISCOVERY] exportRoPaCsv error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to export RoPA CSV: ' + err.message
      });
    }
  },

  /**
   * Returns RoPA records in JSON format
   * Triggered by GET /api/ropa/data
   */
  getRoPaData: async (req, res) => {
    try {
      const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
      let records = await models.getRoPARecords(tenantId);
      if (!records || records.length === 0) {
        const { synthesizeRoPA } = require('../services/ropaService');
        const syn = await synthesizeRoPA(tenantId);
        records = syn.records;
      }

      res.json({
        success: true,
        count: records.length,
        records
      });
    } catch (err) {
      console.error('[DISCOVERY] getRoPaData error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch RoPA data: ' + err.message
      });
    }
  },

  /**
   * Triggers automated RoPA re-synthesis from current pii_findings
   * Triggered by POST /api/ropa/generate
   */
  generateRoPA: async (req, res) => {
    try {
      const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
      const { synthesizeRoPA } = require('../services/ropaService');
      const result = await synthesizeRoPA(tenantId);
      res.json(result);
    } catch (err) {
      console.error('[DISCOVERY] generateRoPA error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to synthesize RoPA: ' + err.message
      });
    }
  },

  /**
   * Get single RoPA record by ID
   * Triggered by GET /api/ropa/:id
   */
  getRoPARecordById: async (req, res) => {
    try {
      const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
      const record = await models.getRoPARecordById(req.params.id, tenantId);
      if (!record) {
        return res.status(404).json({ success: false, error: 'RoPA record not found' });
      }
      res.json({ success: true, data: record });
    } catch (err) {
      console.error('[DISCOVERY] getRoPARecordById error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * Create a new RoPA record
   * Triggered by POST /api/ropa/create
   */
  createRoPARecord: async (req, res) => {
    try {
      const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
      const {
        activityName, dataCategories, purpose, legalBasis,
        retentionPeriod, storageLocation, securitySafeguards
      } = req.body;

      if (!activityName || !purpose) {
        return res.status(400).json({ success: false, error: 'Activity name and purpose are required' });
      }

      const id = await models.createRoPARecord({
        tenantId,
        activityName,
        dataCategories: dataCategories || '',
        purpose,
        legalBasis: legalBasis || 'Section 6 - Consent',
        retentionPeriod: retentionPeriod || '3 Years',
        storageLocation: storageLocation || 'Local Storage',
        securitySafeguards: securitySafeguards || 'Local Storage'
      });

      await models.logAuditEvent(
        tenantId,
        req.session?.user?.name || 'Admin',
        'CREATE_ROPA_RECORD',
        id,
        JSON.stringify({
          details: `Created new RoPA record: ${activityName}`,
          activityName,
          legalBasis
        })
      );

      res.status(201).json({ success: true, id, message: 'RoPA record created successfully' });
    } catch (err) {
      console.error('[DISCOVERY] createRoPARecord error:', err);
      res.status(500).json({ success: false, error: 'Failed to create RoPA record: ' + err.message });
    }
  },

  /**
   * Update an existing RoPA record
   * Triggered by PUT /api/ropa/:id
   */
  updateRoPARecord: async (req, res) => {
    try {
      const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
      const {
        activityName, dataCategories, purpose, legalBasis,
        retentionPeriod, storageLocation, securitySafeguards
      } = req.body;

      if (!activityName || !purpose) {
        return res.status(400).json({ success: false, error: 'Activity name and purpose are required' });
      }

      await models.updateRoPARecord(req.params.id, {
        activityName,
        dataCategories: dataCategories || '',
        purpose,
        legalBasis: legalBasis || 'Section 6 - Consent',
        retentionPeriod: retentionPeriod || '3 Years',
        storageLocation: storageLocation || 'Local Storage',
        securitySafeguards: securitySafeguards || 'Local Storage'
      }, tenantId);

      await models.logAuditEvent(
        tenantId,
        req.session?.user?.name || 'Admin',
        'UPDATE_ROPA_RECORD',
        req.params.id,
        JSON.stringify({ details: `Updated RoPA record: ${activityName}` })
      );

      res.json({ success: true, message: 'RoPA record updated successfully' });
    } catch (err) {
      console.error('[DISCOVERY] updateRoPARecord error:', err);
      res.status(500).json({ success: false, error: 'Failed to update RoPA record: ' + err.message });
    }
  },

  /**
   * Delete a RoPA record
   * Triggered by DELETE /api/ropa/:id
   */
  deleteRoPARecord: async (req, res) => {
    try {
      const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
      await models.deleteRoPARecord(req.params.id, tenantId);
      await models.logAuditEvent(
        tenantId,
        req.session?.user?.name || 'Admin',
        'DELETE_ROPA_RECORD',
        req.params.id,
        {}
      );
      res.json({ success: true, message: 'RoPA record deleted successfully' });
    } catch (err) {
      console.error('[DISCOVERY] deleteRoPARecord error:', err);
      res.status(500).json({ success: false, error: 'Failed to delete RoPA record: ' + err.message });
    }
  },

  /**
   * Renders the SME PII Sanitizer & Masking Playground
   * Triggered by GET /discovery/sanitizer
   */
  renderSanitizer: (req, res) => {
    res.render('discovery-sanitizer', {
      title: 'PII Sanitizer & Masking Playground - DPDP_Secure',
      description: 'Zero-friction live text masking and Indian PII redaction sandbox for clinic staff.',
      breadcrumbs: ['Workspace', 'Data Discovery', 'PII Sanitizer'],
      path: '/discovery/sanitizer'
    });
  },

  /**
   * Sanitizes unstructured text, detects Indian PII entities with Verhoeff/PAN validation,
   * and returns masked output with entity metrics.
   * Triggered by POST /api/discovery/sanitize-text
   */
  sanitizeText: (req, res) => {
    try {
      const { text } = req.body || {};
      const rawText = String(text || '');

      if (!rawText.trim()) {
        return res.json({
          success: true,
          maskedText: '',
          findings: [],
          counts: {
            total: 0,
            aadhaar: 0,
            pan: 0,
            phone: 0,
            upi: 0,
            email: 0,
            health: 0
          }
        });
      }

      const findings = scanTextForPii(rawText);
      const maskedText = anonymizeText(rawText);

      const counts = {
        total: findings.length,
        aadhaar: findings.filter(f => f.type === 'AADHAAR').length,
        pan: findings.filter(f => f.type === 'INDIVIDUAL_PAN' || f.type === 'CORPORATE_PAN' || f.type === 'PAN').length,
        phone: findings.filter(f => f.type === 'PHONE').length,
        upi: findings.filter(f => f.type === 'UPI_ID').length,
        email: findings.filter(f => f.type === 'EMAIL').length,
        health: findings.filter(f => f.type === 'CLINICAL_HEALTH').length
      };

      return res.json({
        success: true,
        maskedText,
        findings,
        counts,
        originalLength: rawText.length,
        maskedLength: maskedText.length
      });
    } catch (err) {
      console.error('[DISCOVERY] sanitizeText error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to sanitize text: ' + err.message
      });
    }
  },

  /**
   * Renders the Section 8(4) Statutory RoPA Printable Register view
   * Triggered by GET /inventory/ropa/print
   */
  renderRoPAPrint: async (req, res) => {
    try {
      const tenantId = req.session?.user?.tenantId || 'TENANT-AAROGYA-01';
      let records = await models.getRoPARecords(tenantId);
      if (!records || records.length === 0) {
        const { synthesizeRoPA } = require('../services/ropaService');
        const syn = await synthesizeRoPA(tenantId);
        records = syn.records;
      }

      res.render('inventory-ropa-print', {
        title: 'Statutory RoPA Register - Form 8(4) Print View',
        records: records || [],
        tenantId,
        generatedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      });
    } catch (err) {
      console.error('[DISCOVERY] renderRoPAPrint error:', err);
      res.status(500).render('500', {
        title: 'Error - DPDP_Secure',
        description: 'Failed to load printable RoPA register: ' + err.message
      });
    }
  }
};

module.exports = discoveryController;
