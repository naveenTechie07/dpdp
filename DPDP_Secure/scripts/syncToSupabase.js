/**
 * DPDP_Secure - Supabase Cloud Database Synchronizer & Migration Utility
 * Syncs local Aarogya Diagnostic Center SQLite database records to Supabase Cloud PostgreSQL.
 * Project: HACKATHON (bxiuiopomqpwxmslllhl) | Region: ap-south-1 (Mumbai)
 */

const { all } = require('../src/models/db');
const { supabase, isSupabaseAvailable, pingSupabase } = require('../src/services/supabaseClient');
const appConfig = require('../src/config/appConfig');

async function syncAllToSupabase() {
  console.log('================================================================');
  console.log('  ⚡ DPDP_Secure: Supabase Cloud Database Synchronizer');
  console.log(`  Target Project: ${appConfig.supabase.projectRef} (${appConfig.supabase.region})`);
  console.log('================================================================\n');

  if (!isSupabaseAvailable()) {
    console.error('[-] Supabase is not available or configured. Check .env settings.');
    return { success: false, reason: 'Supabase client not initialized' };
  }

  const ping = await pingSupabase();
  console.log(`[+] Cloud Ping: ${ping.connected ? 'SUCCESS' : 'FAILED'} (${ping.latencyMs}ms)`);
  if (!ping.connected) {
    console.error('[-] Cannot reach Supabase API Gateway.');
    return { success: false, reason: 'Supabase API unreachable' };
  }

  const syncJobs = [
    {
      name: 'Tenants (SME Profile)',
      sqliteQuery: 'SELECT id, businessName as business_name, businessType as business_type, gstNumber as gst_number, address, dpoName as dpo_name, dpoEmail as dpo_email, complianceScore as compliance_score FROM tenants',
      supabaseTable: 'tenants'
    },
    {
      name: 'Data Silos & Connectors',
      sqliteQuery: 'SELECT id, tenantId as tenant_id, siloName as silo_name, siloType as silo_type, filePath as file_path, itemCount as item_count, riskLevel as risk_level, lastScannedAt as last_scanned_at FROM data_silos',
      supabaseTable: 'data_silos'
    },
    {
      name: 'PII Findings (Verhoeff & Clinical)',
      sqliteQuery: 'SELECT id, siloId as silo_id, entityName as entity_name, piiType as pii_type, maskedValue as masked_value, rawSample as raw_sample, lineNumber as line_number, confidenceScore as confidence_score, isRedacted as is_redacted FROM pii_findings',
      supabaseTable: 'pii_findings'
    },
    {
      name: 'Record of Processing Activities (RoPA)',
      sqliteQuery: 'SELECT id, tenantId as tenant_id, activityName as activity_name, dataCategories as data_categories, purpose, legalBasis as legal_basis, retentionPeriod as retention_period, storageLocation as storage_location, securitySafeguards as security_safeguards FROM ropa_records',
      supabaseTable: 'ropa_records'
    },
    {
      name: 'RoPA Silo Mappings (Connector Links)',
      sqliteQuery: 'SELECT id, tenantId as tenant_id, ropaRecordId as ropa_record_id, siloId as silo_id, mappingType as mapping_type FROM ropa_silo_mapping',
      supabaseTable: 'ropa_silo_mapping'
    },
    {
      name: 'Section 5 Consent Notices',
      sqliteQuery: 'SELECT id, tenantId as tenant_id, title, purposeCode as purpose_code, language, noticeText as notice_text, version, isActive as is_active FROM consent_notices',
      supabaseTable: 'consent_notices'
    },
    {
      name: 'Consent Events Ledger (SHA-256 Proofs)',
      sqliteQuery: 'SELECT id, tenantId as tenant_id, dataPrincipalPhone as data_principal_phone, purposeCode as purpose_code, status, channel, timestamp, sha256Proof as sha256_proof FROM consent_events',
      supabaseTable: 'consent_events'
    },
    {
      name: 'Collection Points & Channels',
      sqliteQuery: 'SELECT id, tenantId as tenant_id, channelName as channel_name, channelType as channel_type, purposeCode as purpose_code, supportedLanguages as supported_languages, statutoryBasis as statutory_basis, status FROM consent_collection_points',
      supabaseTable: 'consent_collection_points'
    },
    {
      name: 'Specified Consent Purposes',
      sqliteQuery: 'SELECT id, tenantId as tenant_id, purposeName as purpose_name, purposeCode as purpose_code, description, isActive as is_active FROM consent_purposes',
      supabaseTable: 'consent_purposes'
    },
    {
      name: 'Privacy Requests (DSR Tickets)',
      sqliteQuery: 'SELECT id, tenantId as tenant_id, ticketNumber as ticket_number, principalName as principal_name, principalPhone as principal_phone, principalEmail as principal_email, requestType as request_type, status, statutoryLockReason as statutory_lock_reason, certHash as cert_hash FROM privacy_requests',
      supabaseTable: 'privacy_requests'
    },
    {
      name: 'Data Breach Incidents (DPBI-IR1)',
      sqliteQuery: 'SELECT id, tenantId as tenant_id, incidentTitle as incident_title, scenarioType as scenario_type, severity, affectedCount as affected_count, dataCategories as data_categories, containmentActions as containment_actions, reportedToDpbi as reported_to_dpbi, citizenAlertSent as citizen_alert_sent, discoveredAt as discovered_at FROM incidents',
      supabaseTable: 'incidents'
    },
    {
      name: 'Audit Logs (Cryptographic SHA-256 Chained)',
      sqliteQuery: 'SELECT id, tenantId as tenant_id, actor, action, resource, detailsJson as details_json, timestamp, prevHash as prev_hash, hash FROM audit_logs',
      supabaseTable: 'audit_logs'
    },
    {
      name: 'Data Assets Catalog',
      sqliteQuery: 'SELECT id, tenantId as tenant_id, assetName as asset_name, assetType as asset_type, sourceSystem as source_system, sensitivity, elements, status, description FROM data_assets',
      supabaseTable: 'data_assets'
    },
    {
      name: 'Data Lineage Edges',
      sqliteQuery: 'SELECT id, tenantId as tenant_id, source, target, flowType as flow_type, notes, isStale as is_stale, lastConfirmed as last_confirmed FROM data_lineage_edges',
      supabaseTable: 'data_lineage_edges'
    }
  ];

  let syncedTotal = 0;
  let pendingSchemaCount = 0;
  const syncResults = [];

  for (const job of syncJobs) {
    try {
      const rows = await all(job.sqliteQuery);
      if (!rows || rows.length === 0) {
        console.log(`[ ] ${job.name}: 0 local records to sync`);
        syncResults.push({ table: job.supabaseTable, status: 'EMPTY', count: 0 });
        continue;
      }

      // Convert SQLite 0/1 integers to booleans for PostgreSQL boolean fields
      const formattedRows = rows.map(r => {
        const copy = { ...r };
        ['is_active', 'is_redacted', 'is_stale', 'reported_to_dpbi', 'citizen_alert_sent'].forEach(field => {
          if (copy[field] !== undefined && copy[field] !== null) {
            copy[field] = Boolean(copy[field]);
          }
        });
        return copy;
      });

      const { data, error } = await supabase.from(job.supabaseTable).upsert(formattedRows, { onConflict: 'id' });

      if (error) {
        if (error.code === 'PGRST205') {
          console.warn(`[!] ${job.name} (table '${job.supabaseTable}'): Pending PostgreSQL DDL creation.`);
          pendingSchemaCount++;
          syncResults.push({ table: job.supabaseTable, status: 'PENDING_SCHEMA', count: rows.length });
        } else {
          console.error(`[-] ${job.name} sync error: ${error.message}`);
          syncResults.push({ table: job.supabaseTable, status: 'ERROR', error: error.message });
        }
      } else {
        console.log(`[+] ${job.name}: Successfully synced ${rows.length} records to Supabase`);
        syncedTotal += rows.length;
        syncResults.push({ table: job.supabaseTable, status: 'SYNCED', count: rows.length });
      }
    } catch (err) {
      console.error(`[-] ${job.name} exception: ${err.message}`);
      syncResults.push({ table: job.supabaseTable, status: 'EXCEPTION', error: err.message });
    }
  }

  console.log('\n================================================================');
  console.log(`  Sync Finished: ${syncedTotal} records synced.`);
  if (pendingSchemaCount > 0) {
    console.log(`  Note: ${pendingSchemaCount} tables need 'supabase/schema.sql' run in Supabase SQL Editor.`);
  }
  console.log('================================================================');

  return {
    success: true,
    syncedTotal,
    pendingSchemaCount,
    results: syncResults
  };
}

if (require.main === module) {
  syncAllToSupabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal sync failure:', err);
      process.exit(1);
    });
}

module.exports = { syncAllToSupabase };
