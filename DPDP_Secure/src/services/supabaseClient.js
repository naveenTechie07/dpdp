/**
 * DPDP_Secure - Enterprise Supabase Cloud Backend Service
 * Project: HACKATHON (ref: bxiuiopomqpwxmslllhl)
 * Region: ap-south-1 (South Asia - Mumbai)
 * 
 * Provides cloud persistence, real-time sync, and multi-tenant isolation
 * for Indian DPDP Act 2023 compliance operations.
 */

const { createClient } = require('@supabase/supabase-js');
const appConfig = require('../config/appConfig');

let supabaseAdmin = null;
let supabaseAnon = null;
let isConfigured = false;

try {
  const { url, serviceRoleKey, anonKey } = appConfig.supabase;

  if (url && (serviceRoleKey || anonKey)) {
    // Admin client uses service_role key to manage enterprise data securely bypassing RLS
    if (serviceRoleKey) {
      supabaseAdmin = createClient(url, serviceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
    }

    // Public client uses anon key
    if (anonKey) {
      supabaseAnon = createClient(url, anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: true
        }
      });
    }

    isConfigured = true;
    console.log(`[SUPABASE] Cloud Backend initialized: ${url} (Region: ${appConfig.supabase.region})`);
  } else {
    console.warn('[SUPABASE] URL or API keys not provided in environment, running in local-only mode.');
  }
} catch (err) {
  console.error('[SUPABASE] Initialization failed:', err.message);
  isConfigured = false;
}

/**
 * Returns whether Supabase is configured and ready
 */
function isSupabaseAvailable() {
  return isConfigured && !!supabaseAdmin;
}

/**
 * Checks connection status and measures round-trip latency
 */
async function pingSupabase() {
  if (!isSupabaseAvailable()) {
    return {
      connected: false,
      message: 'Supabase client not configured or disabled',
      region: appConfig.supabase.region,
      projectRef: appConfig.supabase.projectRef
    };
  }

  const start = Date.now();
  try {
    const { data, error } = await supabaseAdmin.from('tenants').select('id').limit(1);
    const latencyMs = Date.now() - start;

    const isApiReachable = !error || error.code === 'PGRST205' || !error.message.includes('fetch failed');

    return {
      connected: isApiReachable,
      latencyMs,
      region: appConfig.supabase.region,
      projectRef: appConfig.supabase.projectRef,
      url: appConfig.supabase.url,
      schemaReady: !error || error.code !== 'PGRST205',
      note: error && error.code === 'PGRST205' ? 'Tables pending DDL migration' : 'PostgreSQL Schema Active',
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
      latencyMs: Date.now() - start,
      region: appConfig.supabase.region,
      projectRef: appConfig.supabase.projectRef,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Generic Upsert / Sync helper for syncing rows to Supabase
 */
async function syncEntity(table, data, onConflict = 'id') {
  if (!isSupabaseAvailable() || !data) return { success: false, reason: 'Supabase not available' };

  try {
    const payload = Array.isArray(data) ? data : [data];
    if (payload.length === 0) return { success: true, count: 0 };

    const { data: result, error } = await supabaseAdmin
      .from(table)
      .upsert(payload, { onConflict, ignoreDuplicates: false });

    if (error) {
      if (error.code === 'PGRST205') {
        return { success: false, pendingSchema: true, error: error.message };
      }
      console.warn(`[SUPABASE SYNC] Upsert error on ${table}:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true, count: payload.length };
  } catch (err) {
    console.warn(`[SUPABASE SYNC] Exception during sync on ${table}:`, err.message);
    return { success: false, error: err.message };
  }
}

// 1. Tenants
async function syncTenant(tenant) {
  if (!tenant) return { success: false };
  return syncEntity('tenants', {
    id: tenant.id || appConfig.tenantDefaults.id,
    business_name: tenant.businessName || tenant.business_name || 'Aarogya Diagnostic Center',
    business_type: tenant.businessType || tenant.business_type || 'Healthcare SME',
    gst_number: tenant.gstNumber || tenant.gst_number || '29AAAAA0000A1Z5',
    address: tenant.address || 'Indiranagar, Bengaluru, Karnataka 560038',
    dpo_name: tenant.dpoName || tenant.dpo_name || 'Ramesh Kumar',
    dpo_email: tenant.dpoEmail || tenant.dpo_email || 'dpo@aarogyaclinic.in',
    compliance_score: tenant.complianceScore ?? tenant.compliance_score ?? 84
  });
}

// 2. Data Silos & Connectors
async function syncDataSilo(silo) {
  if (!silo) return { success: false };
  return syncEntity('data_silos', {
    id: silo.id,
    tenant_id: silo.tenantId || silo.tenant_id || appConfig.tenantDefaults.id,
    silo_name: silo.siloName || silo.silo_name || silo.name || 'Unnamed Silo',
    silo_type: silo.siloType || silo.silo_type || 'ENTERPRISE_RDBMS',
    file_path: silo.filePath || silo.file_path || silo.uri || '',
    item_count: silo.itemCount ?? silo.item_count ?? 0,
    risk_level: silo.riskLevel || silo.risk_level || 'MEDIUM',
    last_scanned_at: silo.lastScannedAt || silo.last_scanned_at || new Date().toISOString()
  });
}

// 3. PII Findings
async function syncPiiFindings(findings) {
  if (!findings) return { success: false };
  const arr = Array.isArray(findings) ? findings : [findings];
  if (arr.length === 0) return { success: true, count: 0 };
  const mapped = arr.map(f => ({
    id: f.id,
    silo_id: f.siloId || f.silo_id,
    entity_name: f.entityName || f.entity_name || 'Data Principal',
    pii_type: f.piiType || f.pii_type || 'PII_GENERAL',
    masked_value: f.maskedValue || f.masked_value || '****',
    raw_sample: f.rawSample || f.raw_sample || '',
    line_number: f.lineNumber || f.line_number || 1,
    confidence_score: f.confidenceScore ?? f.confidence_score ?? 1.0,
    is_redacted: Boolean(f.isRedacted ?? f.is_redacted)
  }));
  return syncEntity('pii_findings', mapped);
}

// 4. RoPA Records
async function syncRopaRecord(record) {
  if (!record) return { success: false };
  const arr = Array.isArray(record) ? record : [record];
  if (arr.length === 0) return { success: true, count: 0 };
  const mapped = arr.map(r => ({
    id: r.id,
    tenant_id: r.tenantId || r.tenant_id || appConfig.tenantDefaults.id,
    activity_name: r.activityName || r.activity_name || 'Processing Activity',
    data_categories: r.dataCategories || r.data_categories || '',
    purpose: r.purpose || 'Statutory Compliance',
    legal_basis: r.legalBasis || r.legal_basis || 'Section 6(1) Explicit Consent',
    retention_period: r.retentionPeriod || r.retention_period || '3 Years',
    storage_location: r.storageLocation || r.storage_location || 'Air-gapped Local Storage',
    security_safeguards: r.securitySafeguards || r.security_safeguards || 'AES-256 Encryption at Rest'
  }));
  return syncEntity('ropa_records', mapped);
}

// 5. Consent Notices
async function syncConsentNotice(notice) {
  if (!notice) return { success: false };
  return syncEntity('consent_notices', {
    id: notice.id,
    tenant_id: notice.tenantId || notice.tenant_id || appConfig.tenantDefaults.id,
    title: notice.title || 'Notice',
    purpose_code: notice.purposeCode || notice.purpose_code || 'PURP-DEFAULT',
    language: notice.language || 'English',
    notice_text: notice.noticeText || notice.notice_text || notice.body || '',
    version: notice.version || '1.0',
    is_active: notice.isActive !== false && notice.is_active !== false
  });
}

// 6. Consent Events
async function syncConsentEvent(event) {
  if (!event) return { success: false };
  return syncEntity('consent_events', {
    id: event.id || event.eventId,
    tenant_id: event.tenantId || event.tenant_id || appConfig.tenantDefaults.id,
    data_principal_phone: event.dataPrincipalPhone || event.data_principal_phone || event.phone || '',
    purpose_code: event.purposeCode || event.purpose_code || 'PURP-DIAGNOSTIC-REPORTING',
    status: event.status || 'ACTIVE',
    channel: event.channel || 'WHATSAPP',
    timestamp: event.timestamp || new Date().toISOString(),
    sha256_proof: event.sha256Proof || event.sha256_proof || ''
  });
}

// 7. Privacy Requests (DSR)
async function syncPrivacyRequest(request) {
  if (!request) return { success: false };
  return syncEntity('privacy_requests', {
    id: request.id,
    tenant_id: request.tenantId || request.tenant_id || appConfig.tenantDefaults.id,
    ticket_number: request.ticketNumber || request.ticket_number || 'DSR-UNKNOWN',
    principal_name: request.principalName || request.principal_name || request.citizenName || 'Data Principal',
    principal_phone: request.principalPhone || request.principal_phone || request.phoneMasked || '',
    principal_email: request.principalEmail || request.principal_email || '',
    request_type: request.requestType || request.request_type || 'ERASURE_SEC_12',
    status: request.status || 'PENDING',
    statutory_lock_reason: request.statutoryLockReason || request.statutory_lock_reason || null,
    cert_hash: request.certHash || request.cert_hash || null
  });
}
const syncDsrTicket = syncPrivacyRequest;

// 8. Incidents
async function syncIncident(incident) {
  if (!incident) return { success: false };
  return syncEntity('incidents', {
    id: incident.id,
    tenant_id: incident.tenantId || incident.tenant_id || appConfig.tenantDefaults.id,
    incident_title: incident.incidentTitle || incident.incident_title || 'Security Incident',
    scenario_type: incident.scenarioType || incident.scenario_type || 'DATA_LEAK',
    severity: incident.severity || 'HIGH',
    affected_count: incident.affectedCount ?? incident.affected_count ?? 0,
    data_categories: incident.dataCategories || incident.data_categories || '',
    containment_actions: typeof incident.containmentActions === 'object' ? JSON.stringify(incident.containmentActions) : (incident.containmentActions || incident.containment_actions || ''),
    reported_to_dpbi: Boolean(incident.reportedToDpbi ?? incident.reported_to_dpbi),
    citizen_alert_sent: Boolean(incident.citizenAlertSent ?? incident.citizen_alert_sent),
    discovered_at: incident.discoveredAt || incident.discovered_at || new Date().toISOString()
  });
}

// 9. Audit Logs
async function syncAuditLog(audit) {
  if (!audit) return { success: false };
  return syncEntity('audit_logs', {
    id: audit.id,
    tenant_id: audit.tenantId || audit.tenant_id || appConfig.tenantDefaults.id,
    actor: audit.actor || audit.actorId || 'SYSTEM',
    action: audit.action || audit.eventType || 'SYSTEM_EVENT',
    resource: audit.resource || audit.entityId || 'system',
    details_json: typeof audit.detailsJson === 'object' ? JSON.stringify(audit.detailsJson) : (audit.detailsJson || audit.details_json || (typeof audit.details === 'object' ? JSON.stringify(audit.details) : String(audit.details || ''))),
    timestamp: audit.timestamp || new Date().toISOString(),
    prev_hash: audit.prevHash || audit.prev_hash || audit.previousHash || '',
    hash: audit.hash || audit.currentHash || ''
  });
}
const syncAuditRecord = syncAuditLog;

// 10. Data Assets
async function syncDataAsset(asset) {
  if (!asset) return { success: false };
  return syncEntity('data_assets', {
    id: asset.id,
    tenant_id: asset.tenantId || asset.tenant_id || appConfig.tenantDefaults.id,
    asset_name: asset.assetName || asset.asset_name || 'Data Asset',
    asset_type: asset.assetType || asset.asset_type || 'DATABASE',
    source_system: asset.sourceSystem || asset.source_system || 'Local',
    sensitivity: asset.sensitivity || 'HIGH',
    elements: String(asset.elements || '0'),
    status: asset.status || 'active',
    description: asset.description || ''
  });
}

// 11. Data Lineage Edges
async function syncDataLineage(edge) {
  if (!edge) return { success: false };
  return syncEntity('data_lineage_edges', {
    id: edge.id,
    tenant_id: edge.tenantId || edge.tenant_id || appConfig.tenantDefaults.id,
    source: edge.source || edge.sourceAssetId || 'Source Asset',
    target: edge.target || edge.targetAssetId || 'Target Asset',
    flow_type: edge.flowType || edge.flow_type || edge.transformationType || 'etl',
    notes: edge.notes || '',
    is_stale: Boolean(edge.isStale ?? edge.is_stale),
    last_confirmed: edge.lastConfirmed || edge.last_confirmed || new Date().toLocaleDateString()
  });
}

// 12. Collection Points
async function syncCollectionPoint(point) {
  if (!point) return { success: false };
  return syncEntity('consent_collection_points', {
    id: point.id,
    tenant_id: point.tenantId || point.tenant_id || appConfig.tenantDefaults.id,
    channel_name: point.channelName || point.channel_name || 'Channel',
    channel_type: point.channelType || point.channel_type || 'WHATSAPP',
    purpose_code: point.purposeCode || point.purpose_code || 'PURP-DEFAULT',
    supported_languages: point.supportedLanguages || point.supported_languages || 'English, Kannada, Hindi',
    statutory_basis: point.statutoryBasis || point.statutory_basis || 'Section 6(1) Explicit Consent',
    status: point.status || 'ENABLED'
  });
}

// 13. Specified Purposes
async function syncConsentPurpose(purpose) {
  if (!purpose) return { success: false };
  return syncEntity('consent_purposes', {
    id: purpose.id,
    tenant_id: purpose.tenantId || purpose.tenant_id || appConfig.tenantDefaults.id,
    purpose_name: purpose.purposeName || purpose.purpose_name || 'Purpose',
    purpose_code: purpose.purposeCode || purpose.purpose_code || 'PURP-CODE',
    description: purpose.description || '',
    is_active: purpose.isActive !== false && purpose.is_active !== false
  });
}

module.exports = {
  supabase: supabaseAdmin,
  supabaseAnon,
  isSupabaseAvailable,
  pingSupabase,
  syncEntity,
  syncTenant,
  syncDataSilo,
  syncPiiFindings,
  syncRopaRecord,
  syncConsentNotice,
  syncConsentEvent,
  syncPrivacyRequest,
  syncDsrTicket,
  syncIncident,
  syncAuditLog,
  syncAuditRecord,
  syncDataAsset,
  syncDataLineage,
  syncCollectionPoint,
  syncConsentPurpose
};
