/**
 * DPDP_Secure - Sensitivity Roll-Up & Classification Hierarchy Engine
 * Problem Statement LS-04: Personal Data in Informal Systems
 * Srujana Tech Fest 2026
 *
 * Implements the complete Bottom-Up Sensitivity Pipeline:
 * CUSTOMER DATABASE
 *        ↓
 *    Data Asset
 *        ↓
 *     Container
 *        ↓
 *      Element
 *        ↓
 *  ┌──────────────┐
 *  │ Classification│
 *  └──────┬───────┘
 *         ↓
 *       Tag
 *         ↓
 *  Sensitivity Weight
 *         ↓
 *  LOW / MEDIUM / HIGH
 *         ↓
 *  Element sensitivity
 *         ↓
 *  Container roll-up
 *         ↓
 *  System roll-up
 *         ↓
 *  ┌────────┬─────────┬─────────┐
 *  ↓        ↓         ↓
 * Retention RoPA    Breach
 *                   Severity
 */

const models = require('../models');
const dpdpRetentionService = require('./dpdpRetentionService');
const breachRiskCalculator = require('./breachRiskCalculator');
const connectorCatalog = require('./connectorCatalog');

// Standard Tier Definitions
const SENSITIVITY_TIERS = {
  CRITICAL: {
    min: 85,
    max: 100,
    label: 'CRITICAL',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    description: 'High-harm PII: Verhoeff Aadhaar, biometric, clinical health/diagnostic records'
  },
  HIGH: {
    min: 70,
    max: 84,
    label: 'HIGH',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    description: 'Statutory & Financial PII: PAN, GSTIN, bank accounts, doctor consultation notes'
  },
  MEDIUM: {
    min: 40,
    max: 69,
    label: 'MEDIUM',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    description: 'Direct Contact & Demographic PII: WhatsApp phone, email address, residence'
  },
  LOW: {
    min: 0,
    max: 39,
    label: 'LOW',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    description: 'Basic Operational & Indirect metadata: Customer name, internal tracking ID'
  }
};

/**
 * Returns tier label from numerical sensitivity score (0-100)
 */
function getTierFromWeight(weight) {
  const w = Math.max(0, Math.min(100, parseInt(weight, 10) || 0));
  if (w >= SENSITIVITY_TIERS.CRITICAL.min) return 'CRITICAL';
  if (w >= SENSITIVITY_TIERS.HIGH.min) return 'HIGH';
  if (w >= SENSITIVITY_TIERS.MEDIUM.min) return 'MEDIUM';
  return 'LOW';
}

/**
 * 1. Element Classification & Sensitivity
 * Maps raw field / PII finding to Classification, Tag, Sensitivity Weight, and Element Sensitivity Score.
 */
function classifyElement(element = {}, tagsMap = {}) {
  const name = String(element.name || element.entityName || element.columnName || '').trim();
  const rawPiiType = String(element.piiType || element.category || 'GENERAL').toUpperCase();
  const confidence = typeof element.confidenceScore === 'number' ? element.confidenceScore : 1.0;

  // Resolve matching tag
  let matchedTag = null;
  const piiTypeKey = rawPiiType.toLowerCase();

  if (tagsMap[piiTypeKey]) {
    matchedTag = tagsMap[piiTypeKey];
  } else if (piiTypeKey.includes('aadhaar')) {
    matchedTag = {
      tagName: 'Aadhaar UID',
      category: 'IDENTIFIER',
      subCategory: 'Government Identity',
      sensitivityWeight: 95,
      colorTag: '#ef4444'
    };
  } else if (piiTypeKey.includes('health') || piiTypeKey.includes('diagnostic') || piiTypeKey.includes('biopsy') || piiTypeKey.includes('blood') || piiTypeKey.includes('glucose')) {
    matchedTag = {
      tagName: 'Clinical Diagnostic Panel',
      category: 'HEALTH',
      subCategory: 'Special Category Data',
      sensitivityWeight: 90,
      colorTag: '#ec4899'
    };
  } else if (piiTypeKey.includes('pan') || piiTypeKey.includes('gstin') || piiTypeKey.includes('tax')) {
    matchedTag = {
      tagName: 'PAN / GSTIN',
      category: 'FINANCIAL',
      subCategory: 'Tax Identifier',
      sensitivityWeight: 80,
      colorTag: '#f59e0b'
    };
  } else if (piiTypeKey.includes('financial') || piiTypeKey.includes('invoice') || piiTypeKey.includes('bank') || piiTypeKey.includes('upi')) {
    matchedTag = {
      tagName: 'Bank & Financial Account',
      category: 'FINANCIAL',
      subCategory: 'Payment Instrument',
      sensitivityWeight: 80,
      colorTag: '#f59e0b'
    };
  } else if (piiTypeKey.includes('mobile') || piiTypeKey.includes('phone') || piiTypeKey.includes('whatsapp')) {
    matchedTag = {
      tagName: 'Patient Phone (WhatsApp)',
      category: 'CONTACT',
      subCategory: 'Direct Outreach',
      sensitivityWeight: 60,
      colorTag: '#3b82f6'
    };
  } else if (piiTypeKey.includes('email') || piiTypeKey.includes('address') || piiTypeKey.includes('dob')) {
    matchedTag = {
      tagName: 'Demographic Contact',
      category: 'CONTACT',
      subCategory: 'Personal Coordinates',
      sensitivityWeight: 50,
      colorTag: '#3b82f6'
    };
  } else {
    matchedTag = {
      tagName: 'Customer Metadata',
      category: 'GENERAL',
      subCategory: 'Operational Field',
      sensitivityWeight: 35,
      colorTag: '#10b981'
    };
  }

  // Calculate Element Sensitivity
  const rawWeight = matchedTag.sensitivityWeight;
  const elementSensitivityScore = Math.round(rawWeight * confidence);
  const elementTier = getTierFromWeight(elementSensitivityScore);

  return {
    elementName: name || matchedTag.tagName,
    piiType: rawPiiType,
    confidenceScore: confidence,
    classification: matchedTag.category,
    subCategory: matchedTag.subCategory,
    tag: matchedTag.tagName,
    colorTag: matchedTag.colorTag,
    sensitivityWeight: rawWeight,
    elementSensitivityScore,
    tier: elementTier,
    tierMeta: SENSITIVITY_TIERS[elementTier]
  };
}

/**
 * 2. Container Roll-Up
 * Aggregates all elements belonging to a specific table, file, sheet, or partition.
 */
function calculateContainerRollup(container = {}, tagsMap = {}) {
  const containerId = container.id || container.tableId || 'CONTAINER-DEFAULT';
  const containerName = container.name || container.tableName || container.siloName || 'Untitled Container';
  const containerType = container.type || 'TABLE'; // TABLE | SPREADSHEET | FILE | DOCUMENT | OBJECT_STORE
  const rawElements = Array.isArray(container.elements) ? container.elements : [];

  const classifiedElements = rawElements.map(el => classifyElement(el, tagsMap));

  let maxScore = 0;
  let sumScore = 0;
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  const tagsSet = new Set();
  const categoriesSet = new Set();

  for (const el of classifiedElements) {
    maxScore = Math.max(maxScore, el.elementSensitivityScore);
    sumScore += el.elementSensitivityScore;
    counts[el.tier] = (counts[el.tier] || 0) + 1;
    tagsSet.add(el.tag);
    categoriesSet.add(el.classification);
  }

  const count = classifiedElements.length;
  const avgScore = count > 0 ? Math.round(sumScore / count) : 0;
  // Composite Container Score: 70% Max Element Weight + 30% Avg Elements Weight
  const compositeScore = count > 0 ? Math.round(0.7 * maxScore + 0.3 * avgScore) : 0;
  
  // Container tier is determined by worst-case element present
  let containerTier = 'LOW';
  if (counts.CRITICAL > 0) containerTier = 'CRITICAL';
  else if (counts.HIGH > 0) containerTier = 'HIGH';
  else if (counts.MEDIUM > 0) containerTier = 'MEDIUM';

  return {
    containerId,
    containerName,
    containerType,
    description: container.description || '',
    recordCount: container.recordCount || 0,
    elementCount: count,
    elements: classifiedElements,
    counts,
    maxScore,
    avgScore,
    compositeScore,
    containerTier,
    tierMeta: SENSITIVITY_TIERS[containerTier],
    tags: Array.from(tagsSet),
    categories: Array.from(categoriesSet)
  };
}

/**
 * 3. System Roll-Up
 * Aggregates all containers across the Data Asset / System Database.
 */
function calculateSystemRollup(system = {}, tagsMap = {}) {
  const systemId = system.id || system.key || 'SYSTEM-DEFAULT';
  const systemName = system.name || system.siloName || 'Customer Database';
  const rawContainers = Array.isArray(system.containers || system.tables) ? (system.containers || system.tables) : [];

  const rolledContainers = rawContainers.map(c => calculateContainerRollup(c, tagsMap));

  let maxContainerScore = 0;
  let totalElements = 0;
  const containerCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  const elementCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  const allCategories = new Set();
  const allTags = new Set();

  for (const c of rolledContainers) {
    maxContainerScore = Math.max(maxContainerScore, c.compositeScore);
    totalElements += c.elementCount;
    containerCounts[c.containerTier] = (containerCounts[c.containerTier] || 0) + 1;
    
    elementCounts.CRITICAL += c.counts.CRITICAL;
    elementCounts.HIGH += c.counts.HIGH;
    elementCounts.MEDIUM += c.counts.MEDIUM;
    elementCounts.LOW += c.counts.LOW;

    c.categories.forEach(cat => allCategories.add(cat));
    c.tags.forEach(tag => allTags.add(tag));
  }

  let systemTier = 'LOW';
  if (containerCounts.CRITICAL > 0 || elementCounts.CRITICAL > 0) systemTier = 'CRITICAL';
  else if (containerCounts.HIGH > 0 || elementCounts.HIGH > 0) systemTier = 'HIGH';
  else if (containerCounts.MEDIUM > 0 || elementCounts.MEDIUM > 0) systemTier = 'MEDIUM';

  return {
    systemId,
    systemName,
    systemTier,
    tierMeta: SENSITIVITY_TIERS[systemTier],
    systemScore: maxContainerScore,
    containersCount: rolledContainers.length,
    containerCounts,
    totalElements,
    elementCounts,
    categories: Array.from(allCategories),
    tags: Array.from(allTags),
    containers: rolledContainers
  };
}

/**
 * 4. Downstream Pipeline Feeds
 * Computes the statutory impacts for:
 * - Retention (DPDP Section 8(7) & Statutory Schedules)
 * - RoPA (DPDP Section 8(4) & Technical Safeguards)
 * - Breach Severity (DPDP Section 8(6) & Rule 7 Mandate)
 */
function calculateDownstreamFeeds(rolledSystemOrContainer) {
  const categories = rolledSystemOrContainer.categories || [];
  const tags = rolledSystemOrContainer.tags || [];
  const tier = rolledSystemOrContainer.systemTier || rolledSystemOrContainer.containerTier || 'MEDIUM';
  const score = rolledSystemOrContainer.systemScore || rolledSystemOrContainer.compositeScore || 50;

  // 4A. Retention Statutory Engine
  const retentionGuideline = dpdpRetentionService.calculateDpdpRetention(
    categories.concat(tags),
    'Healthcare Diagnostics & Claims',
    'Clinical record keeping, diagnostic pathology, statutory taxation'
  );

  // 4B. RoPA Governance Requirements
  const ropaRequirements = {
    activityClassification: tier,
    lawfulBasisRecommended: (tier === 'CRITICAL' || categories.includes('HEALTH'))
      ? 'Explicit Medical Consent (Section 6) + Statutory Healthcare Mandate'
      : (categories.includes('FINANCIAL') ? 'Legal Obligation (CGST Act 2017 Sec 36)' : 'Consent (Section 6)'),
    mandatorySafeguards: tier === 'CRITICAL'
      ? ['AES-256-GCM Envelope Encryption', 'Verhoeff Algorithmic Tokenization', 'Role-Based Air-Gapped Vault', 'Cryptographic SHA-256 Audit Trail']
      : (tier === 'HIGH' ? ['TLS 1.3 Encryption In-Transit', 'Database Column-Level Masking', 'Statutory Retention Lock'] : ['Restricted Staff Access', 'Session Expiry']),
    crossBorderTransferPermitted: tier !== 'CRITICAL',
    dpiaRequired: tier === 'CRITICAL' || tier === 'HIGH',
    dpoOversight: 'Mandatory Review by DPO before production deployment'
  };

  // 4C. Breach Severity Assessment
  const breachAssessment = breachRiskCalculator.calculateRisk({
    scenarioType: tier === 'CRITICAL' ? 'DEVICE_LOSS_UNENCRYPTED' : 'UNAUTHORIZED_DISCLOSURE',
    incidentTitle: `Potential breach of ${rolledSystemOrContainer.systemName || rolledSystemOrContainer.containerName || 'System'}`,
    dataCategories: categories.concat(tags),
    estimatedCount: 150,
    safeguardsInPlace: tier === 'CRITICAL' ? 'NONE_UNENCRYPTED' : 'STANDARD_MESSAGING'
  });

  return {
    retention: {
      retentionPeriodMonths: retentionGuideline.retentionPeriodMonths,
      retentionPeriodDays: retentionGuideline.retentionPeriodDays,
      retentionPeriodDisplay: `${retentionGuideline.retentionPeriodMonths} Months (${Math.round(retentionGuideline.retentionPeriodMonths / 12 * 10) / 10} Years)`,
      triggerEvent: retentionGuideline.triggerEvent,
      statutoryCitation: retentionGuideline.statutoryReference,
      applicableRule: retentionGuideline.applicableRule,
      legalNotes: retentionGuideline.legalNotes
    },
    ropa: ropaRequirements,
    breachSeverity: {
      breachTier: breachAssessment.severity || tier,
      breachScore: breachAssessment.score || score,
      mandatoryDpbiIntimation: breachAssessment.mandatoryDpbiIntimation ?? (tier === 'CRITICAL' || tier === 'HIGH'),
      countdownHours: 72,
      statutoryForm: 'Form DPBI-IR1',
      regulatoryMandate: 'DPDP Act, 2023 Section 8(6) & DPDP Rules, 2025 (Rule 7)',
      immediateContainmentActions: breachAssessment.containmentActions || [
        { id: 'ACT-01', text: 'Air-gap compromised container from local network', done: false, urgent: true },
        { id: 'ACT-02', text: 'Prepare Form DPBI-IR1 72-Hour Dossier', done: false, urgent: true },
        { id: 'ACT-03', text: 'Issue plain-language citizen intimation notice', done: false, urgent: false }
      ]
    }
  };
}

/**
 * 5. Full Hierarchy Builder
 * Assembles the live database assets, containers, elements, and tags into the unified tree.
 */
async function getFullSensitivityHierarchy(tenantId = 'TENANT-AAROGYA-01') {
  // A. Load Data Tags
  const tagsRows = await models.getDataTags(tenantId);
  const tagsMap = {};
  for (const t of (tagsRows || [])) {
    tagsMap[t.tagName.toLowerCase()] = t;
    tagsMap[t.category.toLowerCase()] = t;
    if (t.subCategory) tagsMap[t.subCategory.toLowerCase()] = t;
  }

  // B. Load Silos and Findings
  const silos = await models.getSilos(tenantId);
  const findings = await models.getAllFindings(tenantId);

  // Group findings by silo
  const findingsBySilo = {};
  for (const f of findings) {
    if (!findingsBySilo[f.siloId]) findingsBySilo[f.siloId] = [];
    findingsBySilo[f.siloId].push({
      id: f.id,
      name: f.entityName || f.maskedValue || f.piiType,
      piiType: f.piiType,
      confidenceScore: f.confidenceScore || 1.0,
      maskedValue: f.maskedValue
    });
  }

  // C. Ingest Enterprise Connectors from catalog
  const catalogConnectors = (connectorCatalog.CONNECTOR_CATALOG && connectorCatalog.CONNECTOR_CATALOG.connectors) 
    ? connectorCatalog.CONNECTOR_CATALOG.connectors 
    : [];

  const systems = [];

  // 1. Primary Customer Database (Aggregated from Claims DB, Policy Admin DB, and Clinical Store)
  const customerDbContainers = [];

  for (const conn of catalogConnectors) {
    for (const tbl of (conn.tables || [])) {
      const elements = (tbl.columns || []).map(col => ({
        name: col.name,
        piiType: col.piiType || (col.isPii ? 'PERSONAL_DATA' : 'METADATA'),
        confidenceScore: col.isPii ? 0.99 : 0.5
      }));

      customerDbContainers.push({
        id: tbl.id,
        name: tbl.fullName || tbl.name,
        type: tbl.type || 'TABLE',
        description: tbl.description,
        recordCount: tbl.recordCount || 500,
        elements
      });
    }
  }

  // 2. Informal Silos as Containers (WhatsApp, Excel, Leads, Invoices)
  for (const s of silos) {
    const siloElements = findingsBySilo[s.id] || [];
    customerDbContainers.push({
      id: s.id,
      name: s.siloName,
      type: s.siloType || 'INFORMAL_SILO',
      description: `Discovered informal SME silo at ${s.filePath || 'local'}`,
      recordCount: s.itemCount || siloElements.length || 100,
      elements: siloElements.length > 0 ? siloElements : [
        { name: 'Patient Record Sample', piiType: 'HEALTH_DIAGNOSTIC', confidenceScore: 0.95 },
        { name: 'WhatsApp Mobile Contact', piiType: 'MOBILE', confidenceScore: 1.0 }
      ]
    });
  }

  // D. Build Master System Roll-Up
  const masterSystem = {
    id: 'SYS-AAROGYA-CUSTOMER-DB',
    name: 'CUSTOMER DATABASE (Aarogya Central System)',
    containers: customerDbContainers
  };

  const systemRollup = calculateSystemRollup(masterSystem, tagsMap);
  const downstreamFeeds = calculateDownstreamFeeds(systemRollup);

  // E. Load Cataloged Data Assets
  const assets = await models.getDataAssets(tenantId);

  return {
    databaseName: 'CUSTOMER DATABASE',
    tenantId,
    tenantName: 'Aarogya Diagnostic Center, Indiranagar',
    gstin: '29AAAAA0000A1Z5',
    hierarchy: {
      database: 'CUSTOMER DATABASE',
      dataAssetsCount: assets.length,
      containersCount: systemRollup.containersCount,
      elementsCount: systemRollup.totalElements,
      classificationTiers: SENSITIVITY_TIERS
    },
    systemRollup,
    dataAssets: assets,
    tagsList: tagsRows,
    downstream: downstreamFeeds
  };
}

module.exports = {
  SENSITIVITY_TIERS,
  getTierFromWeight,
  classifyElement,
  calculateContainerRollup,
  calculateSystemRollup,
  calculateDownstreamFeeds,
  getFullSensitivityHierarchy
};
