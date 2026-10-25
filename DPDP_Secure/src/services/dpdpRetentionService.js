/**
 * DPDP Act 2023 - Statutory Data Retention Guidelines Engine
 * Section 8(7) Compliance
 * DPDP_Secure - Enterprise Edition
 *
 * Section 8(7) mandates:
 * "A Data Fiduciary shall, unless retention is necessary for compliance with any law for the
 *  time being in force, erase personal data, upon the Data Principal withdrawing her consent
 *  or as soon as it is reasonable to assume that the specified purpose is no longer being served,
 *  whichever is earlier."
 */

const models = require('../models');

const DPDP_RETENTION_RULES = [
  {
    key: 'FINANCIAL_TAX',
    categoryPattern: /(financial|bank|account|salary|pan|gst|tax|payment|invoice|credit|debit)/i,
    functionPattern: /(finance|billing|accounts|payroll|tax|invoicing|payment)/i,
    retentionPeriodMonths: 84, // 7 years
    triggerEvent: 'STATUTORY_TAX_AUDIT_COMPLETION',
    statutoryReference: 'Income Tax Act 1961 Sec 44AA / Companies Act 2013 Sec 128 r/w DPDP Sec 8(7)',
    description: 'Statutory mandate to retain financial books of accounts for 7-8 financial years.'
  },
  {
    key: 'KYC_AML',
    categoryPattern: /(aadhaar|passport|voter|driving|identity|kyc|national_id)/i,
    functionPattern: /(kyc|compliance|verification|onboarding|legal)/i,
    retentionPeriodMonths: 60, // 5 years
    triggerEvent: 'ACCOUNT_CLOSURE_OR_CESSATION_OF_RELATIONSHIP',
    statutoryReference: 'PMLA 2002 Sec 12 r/w RBI Master Directions on KYC & DPDP Sec 8(7)',
    description: 'Mandatory 5-year retention post account closure under Prevention of Money Laundering Act.'
  },
  {
    key: 'HEALTH_DIAGNOSTICS',
    categoryPattern: /(health|medical|biometric|blood|genetic|diagnosis|prescription|patient|clinical)/i,
    functionPattern: /(diagnostic|medical|clinical|healthcare|hospital|pathology|consultation)/i,
    retentionPeriodMonths: 36, // 3 years
    triggerEvent: 'PURPOSE_COMPLETION_OR_STATUTORY_CLINICAL_PERIOD',
    statutoryReference: 'National Medical Commission (NMC) Regulations r/w DPDP Act Sec 8(7)',
    description: 'Clinical consultations, lab diagnostics, and patient history retained for 3 years from treatment.'
  },
  {
    key: 'EMPLOYMENT_HR',
    categoryPattern: /(employee|resume|appraisal|performance|offer|contract|provident)/i,
    functionPattern: /(hr|human resources|people|recruitment|talent)/i,
    retentionPeriodMonths: 36, // 3 years
    triggerEvent: 'EMPLOYMENT_TERMINATION',
    statutoryReference: 'Payment of Gratuity Act / EPF Act r/w DPDP Act Sec 8(7)',
    description: 'Personnel records retained for 3 years after employment cessation for dispute resolution.'
  },
  {
    key: 'MARKETING_PROMOTIONS',
    categoryPattern: /(email|phone|mobile|interest|device|cookie|tracking|advertising)/i,
    functionPattern: /(marketing|growth|outreach|crm|newsletter|promotions|campaign)/i,
    retentionPeriodMonths: 12, // 1 year
    triggerEvent: 'CONSENT_WITHDRAWAL_OR_PURPOSE_FULFILLMENT',
    statutoryReference: 'DPDP Act 2023 Sec 8(7) Purpose Limitation & Prompt Erasure',
    description: 'Marketing personal data must be erased immediately upon consent withdrawal or after 12 months of inactivity.'
  },
  {
    key: 'GENERAL_CUSTOMER_SERVICE',
    categoryPattern: /.*/,
    functionPattern: /.*/,
    retentionPeriodMonths: 24, // 2 years default
    triggerEvent: 'TICKET_RESOLUTION_OR_CONSENT_WITHDRAWAL',
    statutoryReference: 'DPDP Act 2023 Sec 8(7) Reasonable Purpose Period',
    description: 'General business interaction data retained for up to 24 months unless consent is withdrawn earlier.'
  }
];

/**
 * Computes recommended DPDP data retention duration based on discovered PII categories,
 * business function, and activity purpose.
 */
function calculateDpdpRetention(piiCategories = [], businessFunction = '', purpose = '') {
  const combinedContext = `${businessFunction || ''} ${purpose || ''}`.toLowerCase();
  const joinedPii = (Array.isArray(piiCategories) ? piiCategories.join(' ') : String(piiCategories)).toLowerCase();

  for (const rule of DPDP_RETENTION_RULES) {
    if (rule.key === 'GENERAL_CUSTOMER_SERVICE') continue;

    const matchesPii = piiCategories && piiCategories.length > 0 && rule.categoryPattern.test(joinedPii);
    const matchesFunction = rule.functionPattern.test(combinedContext);

    if (matchesPii || matchesFunction) {
      return {
        retentionPeriodMonths: rule.retentionPeriodMonths,
        retentionDays: rule.retentionPeriodMonths * 30,
        triggerEvent: rule.triggerEvent,
        statutoryReference: rule.statutoryReference,
        matchedRule: rule.key,
        description: rule.description
      };
    }
  }

  const defaultRule = DPDP_RETENTION_RULES.find((r) => r.key === 'GENERAL_CUSTOMER_SERVICE');
  return {
    retentionPeriodMonths: defaultRule.retentionPeriodMonths,
    retentionDays: defaultRule.retentionPeriodMonths * 30,
    triggerEvent: defaultRule.triggerEvent,
    statutoryReference: defaultRule.statutoryReference,
    matchedRule: defaultRule.key,
    description: defaultRule.description
  };
}

/**
 * Recommends statutory DPDP retention duration by inspecting linked source scan findings
 * or direct PII categories and business purpose.
 */
async function getRetentionRecommendation(tenantId = 'TENANT-AAROGYA-01', input = {}) {
  const piiCategoriesSet = new Set(input.piiCategories || []);

  if (input.sourceId) {
    // Look up findings for this silo
    const findings = await models.getFindingsBySilo(input.sourceId);
    if (findings && findings.length > 0) {
      for (const finding of findings) {
        if (finding.piiType) {
          piiCategoriesSet.add(finding.piiType);
        }
      }
    }
  }

  const piiCategories = Array.from(piiCategoriesSet);
  const recommendation = calculateDpdpRetention(
    piiCategories,
    input.businessFunction || '',
    input.purpose || ''
  );

  return {
    ...recommendation,
    detectedPiiCategories: piiCategories
  };
}

module.exports = {
  DPDP_RETENTION_RULES,
  calculateDpdpRetention,
  getRetentionRecommendation
};
