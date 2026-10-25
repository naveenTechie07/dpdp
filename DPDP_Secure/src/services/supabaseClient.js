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
    // Ping Supabase using a lightweight query
    const { data, error } = await supabaseAdmin.from('tenants').select('id').limit(1);
    const latencyMs = Date.now() - start;

    // Even if the table does not exist yet (PGRST205), the API gateway responded successfully
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
 * Generic Upsert / Sync helper for syncing SQLite rows to Supabase
 */
async function syncEntity(table, data, onConflict = 'id') {
  if (!isSupabaseAvailable() || !data) return { success: false, reason: 'Supabase not available' };

  try {
    const payload = Array.isArray(data) ? data : [data];
    const { data: result, error } = await supabaseAdmin
      .from(table)
      .upsert(payload, { onConflict, ignoreDuplicates: false });

    if (error) {
      // Table may not yet be created in PostgreSQL schema; gracefully log without breaking local flow
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

/**
 * Synchronize a Consent Event to Supabase
 */
async function syncConsentEvent(event) {
  return syncEntity('consent_events', {
    id: event.id || event.eventId,
    tenant_id: event.tenantId || appConfig.tenantDefaults.id,
    data_principal_id: event.dataPrincipalId || event.phone || event.principalId,
    phone: event.phone || null,
    purpose_code: event.purposeCode || event.purpose,
    status: event.status || 'ACTIVE',
    channel: event.channel || 'WHATSAPP',
    notice_id: event.noticeId || null,
    sha256_proof: event.sha256Proof || event.proof,
    created_at: event.timestamp || new Date().toISOString()
  });
}

/**
 * Synchronize a Section 5 Notice to Supabase
 */
async function syncConsentNotice(notice) {
  return syncEntity('consent_notices', {
    id: notice.id,
    tenant_id: notice.tenantId || appConfig.tenantDefaults.id,
    title: notice.title,
    purpose_code: notice.purposeCode,
    language: notice.language || 'en',
    notice_body: notice.body || notice.noticeBody || '',
    version: notice.version || '1.0',
    is_active: notice.isActive !== false,
    created_at: notice.createdAt || new Date().toISOString()
  });
}

/**
 * Synchronize a Collection Point / Channel to Supabase
 */
async function syncCollectionPoint(point) {
  return syncEntity('consent_collection_points', {
    id: point.id,
    tenant_id: point.tenantId || appConfig.tenantDefaults.id,
    channel_name: point.channelName,
    channel_type: point.channelType,
    purpose_code: point.purposeCode,
    supported_languages: point.supportedLanguages,
    statutory_basis: point.statutoryBasis,
    status: point.status || 'ENABLED',
    created_at: point.createdAt || new Date().toISOString()
  });
}

/**
 * Synchronize a DSR Ticket to Supabase
 */
async function syncDsrTicket(ticket) {
  return syncEntity('dsr_tickets', {
    id: ticket.id,
    ticket_number: ticket.ticketNumber,
    tenant_id: ticket.tenantId || appConfig.tenantDefaults.id,
    citizen_name: ticket.citizenName,
    phone_masked: ticket.phoneMasked || ticket.phone,
    request_type: ticket.requestType,
    status: ticket.status,
    priority: ticket.priority || 'MEDIUM',
    sla_deadline: ticket.slaDeadline,
    created_at: ticket.createdAt || new Date().toISOString()
  });
}

/**
 * Synchronize an Immutable Audit Ledger Record to Supabase
 */
async function syncAuditRecord(audit) {
  return syncEntity('audit_ledger', {
    id: audit.id,
    tenant_id: audit.tenantId || appConfig.tenantDefaults.id,
    event_type: audit.eventType,
    entity_id: audit.entityId,
    actor_id: audit.actorId || 'SYSTEM',
    details: typeof audit.details === 'object' ? JSON.stringify(audit.details) : audit.details,
    previous_hash: audit.previousHash,
    current_hash: audit.currentHash,
    timestamp: audit.timestamp || new Date().toISOString()
  });
}

/**
 * Synchronize a Data Asset to Supabase
 */
async function syncDataAsset(asset) {
  return syncEntity('data_assets', {
    id: asset.id,
    tenant_id: asset.tenantId || appConfig.tenantDefaults.id,
    asset_name: asset.assetName,
    asset_type: asset.assetType,
    storage_type: asset.storageType || 'DATABASE',
    retention_period_months: asset.retentionPeriodMonths || 36,
    sensitivity_level: asset.sensitivityLevel || 'HIGH',
    created_at: asset.createdAt || new Date().toISOString()
  });
}

/**
 * Synchronize a Data Lineage Edge to Supabase
 */
async function syncDataLineage(edge) {
  return syncEntity('data_lineage_edges', {
    id: edge.id,
    tenant_id: edge.tenantId || appConfig.tenantDefaults.id,
    source_asset_id: edge.sourceAssetId,
    target_asset_id: edge.targetAssetId,
    transformation_type: edge.transformationType || 'DIRECT_TRANSFER',
    consent_purpose_code: edge.consentPurposeCode || 'PURP-DEFAULT',
    status: edge.status || 'ACTIVE',
    created_at: edge.createdAt || new Date().toISOString()
  });
}

module.exports = {
  supabase: supabaseAdmin,
  supabaseAnon,
  isSupabaseAvailable,
  pingSupabase,
  syncEntity,
  syncConsentEvent,
  syncConsentNotice,
  syncCollectionPoint,
  syncDsrTicket,
  syncAuditRecord,
  syncDataAsset,
  syncDataLineage
};
