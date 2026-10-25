# DPDP_Secure: Enterprise Privacy & Compliance Platform
## Comprehensive System Architecture Blueprint & Technical Specification (V2)

---

### Executive Overview & Architectural Mission

**DPDP_Secure** is an enterprise-grade, cloud-native and hybrid-deployable data privacy management platform architected specifically to automate end-to-end statutory compliance under India's **Digital Personal Data Protection Act, 2023 (DPDP Act)**, alongside global privacy regulations including **GDPR** (EU) and **CCPA/CPRA** (California).

The platform bridges the gap between high-level legal mandates and distributed software engineering by establishing a unified control plane for:
1. **Multilingual Affirmative Consent Capture & Lifecycle Tracking**
2. **Immutable Audit Ledgers & Non-repudiable Proof of Consent**
3. **Data Subject / Data Principal Rights Request (DSR/DPRR) Orchestration**
4. **Automated PII Discovery & Classification across Hybrid Data Silos**
5. **Article 30 / DPDP Records of Processing Activities (RoPA) & Data Lineage**
6. **Privacy Impact Assessments (DPIA/PIA) & AI Governance**
7. **Statutory Incident Management & DPBI 72-Hour Breach Intimation**
8. **Automated Website Cookie & Tracker Auditing**

---

## 1. System Context Architecture (C4 Level 1)

The system context diagram establishes the external boundaries of the DPDP_Secure platform, illustrating the human actors, consumer channels, access applications, API gateways, and external integrations.

```mermaid
graph TB
    subgraph ExternalActors [Actors & Interacting Parties]
        TA["Tenant Admin<br/>(DPO, Legal Counsel, IT Admin)"]
        PO["Privacy Officer<br/>(Compliance Reviewer, Auditor)"]
        DP["Data Principal<br/>(Customer, Patient, Website Visitor)"]
        OP["Platform Ops Admin<br/>(Cross-Tenant Infrastructure Ops)"]
        AC["API Clients & Mobile SDKs<br/>(Web Apps, Native iOS/Android)"]
    end

    subgraph PresentationLayer [Presentation Layer - Edge Client Applications]
        FE_APP["Tenant Workspace Web Portal<br/>app.dpdpsecure.in :4000<br/>Next.js 15 SSR / Dark UI"]
        FE_OPS["Platform Operations Portal<br/>ops.dpdpsecure.in :4001<br/>Next.js 15 SSR Administration"]
        FE_PRIV["Self-Service Privacy Portal<br/>privacy.dpdpsecure.in :4003<br/>Public Data Principal Portal"]
    end

    subgraph GatewayLayer [Gateway & Boundary Protection Layer]
        BFF_ADMIN["Admin API Gateway (BFF Service)<br/>api.dpdpsecure.in :9000<br/>JWT RS256 Auth · RBAC · CORS · Proxy"]
        BFF_PORTAL["Portal API Gateway (BFF Portal)<br/>portal-api.dpdpsecure.in :9018<br/>Fernet Tokens · Rate Limiting · Public"]
        API_GW["Developer API Gateway<br/>api.dpdpsecure.in/v1 :9021<br/>X-Api-Key Ingress · Metering"]
    end

    subgraph CorePlatform [DPDP_Secure Core Microservices Engine]
        SVC_CORE["20 Specialized FastAPI Microservices<br/>(Ports 9001 - 9021)"]
        WORKERS["Asynchronous Background Workers<br/>(Playwright Scanner · Sampling Agents)"]
    end

    subgraph DataStorageLayer [Data, Secrets & Event Infrastructure]
        PG[("PostgreSQL 17 Flexible Server<br/>19 Tenant-Isolated Schemas<br/>Envelope Encrypted at Rest")]
        MB[("Event Message Bus<br/>Azure Service Bus / NATS JetStream")]
        KV[("Hardware Secrets Store<br/>Azure Key Vault / HSM<br/>Tenant KEKs & Master Secrets")]
    end

    subgraph ExternalEcosystem [External Services & Target Systems]
        NOTIF["Notification Providers<br/>(Twilio SMS, AWS SES, Webhooks)"]
        SOURCES["Tenant Data Sources<br/>(Postgres, MySQL, S3, Azure Blob, Salesforce)"]
        SITES["Public Target Websites<br/>(Automated Cookie Crawling)"]
    end

    TA & PO -->|HTTPS / MFA| FE_APP
    OP -->|HTTPS / SSO| FE_OPS
    DP -->|HTTPS / Token Auth| FE_PRIV
    AC -->|HTTPS / API Key| API_GW

    FE_APP -->|AJAX / HTTPS| BFF_ADMIN
    FE_OPS -->|AJAX / HTTPS| BFF_ADMIN
    FE_PRIV -->|HTTPS| BFF_PORTAL

    BFF_ADMIN -->|Internal HTTP| SVC_CORE
    BFF_PORTAL -->|Internal HTTP| SVC_CORE
    API_GW -->|Internal HTTP| SVC_CORE

    SVC_CORE -->|Private SQL / psycopg3| PG
    SVC_CORE -->|Publish Domain Events| MB
    MB -->|Consume Events| SVC_CORE
    SVC_CORE -->|Retrieve DEK / KEK| KV
    SVC_CORE -->|Dispatch Alerts| NOTIF

    WORKERS -->|Headless Browser Crawl| SITES
    WORKERS -->|Local PII Classification| SOURCES
    WORKERS -->|Write Telemetry & Findings| SVC_CORE
```

### Core External Interaction Patterns

| Actor / Client | Entrypoint | Authentication Mechanism | Primary Responsibilities |
|---|---|---|---|
| **Tenant Administrator** | `app.dpdpsecure.in` | JWT RS256 with HttpOnly Cookies + MFA | Manage enterprise organizational units, assign RBAC permissions, configure collection points, manage encryption keys. |
| **Privacy Officer / DPO** | `app.dpdpsecure.in` | JWT RS256 with HttpOnly Cookies | Conduct DPIA/PIA reviews, supervise DSR/DPRR workflows, monitor statutory SLAs, verify RoPA registers. |
| **Data Principal** | `privacy.dpdpsecure.in` | Fernet Session Tokens (HMAC-SHA256 hashed) | Self-service consent management, exercise rights (access, erasure, correction, nominee nomination), grievance redressal. |
| **Platform Ops Admin** | `ops.dpdpsecure.in` | Enterprise OIDC / OAuth2 + IP Allowlisting | Cross-tenant lifecycle management, SKU catalog configuration, tenant provisioning, system health monitoring. |
| **Consumer Web / Mobile Apps** | `api.dpdpsecure.in` | API Key (`X-Api-Key` with SHA-256 validation) | Programmatic consent event submission via embedded SDKs or backend webhooks. |

---

## 2. Four Functional Capability Domains (C4 Level 2)

The DPDP_Secure platform is organized into four cohesive architectural domains, providing separation of concerns while maintaining seamless event-driven interoperability:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                DPDP_SECURE CAPABILITY MAP                              │
├────────────────────────────┬────────────────────────────┬──────────────────────────────┤
│ 1. CONSENT & PRIVACY       │ 2. DATA RIGHTS & DPRR      │ 3. RISK & GOVERNANCE         │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ • Multi-Channel Collection │ • Rights Request Intake    │ • Privacy Impact Assessments │
│ • Branded Preference Ctrs  │ • Dynamic Workflow Engine  │ • PII Discovery Engine       │
│ • Policy Lifecycle Engine  │ • Statutory SLA Monitoring │ • Data Asset Inventory       │
│ • Immutable Consent Ledger │ • Multi-Stage Tasks & SLAs │ • RoPA Processing Register   │
│ • Cookie & Tracker Audit   │ • Automated Notifications  │ • AI Model Governance        │
│ • Indic Multilingual UI    │ • Regulatory Audit Trails  │ • Retention Schedules        │
│ • Self-Service Portal      │ • Nominee Management       │ • Lineage Mapping            │
├────────────────────────────┴────────────────────────────┴──────────────────────────────┤
│ 4. PLATFORM INTELLIGENCE, SECURITY & INFRASTRUCTURE                                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Hierarchical Tenant RBAC (Org Units) • Envelope Encryption (Tenant-specific DEK)     │
│ • Centralized Audit Trail (Append-Only) • Event-Driven Message Bus (Service Bus/NATS)   │
│ • Real-time Compliance Analytics       • Statutory Breach Reporting (72h Board Notice) │
│ • IndicTrans2 Neural Translation        • Centralized Document Vault (ClamAV scanned)  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Domain 1: Consent & Privacy Operations
* **Consent Collection:** Embeddable vanilla JavaScript widgets and mobile SDK wrappers supporting geo-targeted collection points, multi-language notices, and granular purpose toggles.
* **Branded Preference Centres:** Self-service portals where data subjects review, modify, or withdraw consent preferences at any time, maintaining statutory parity between giving and withdrawing consent (DPDP Act Sec 6(4)).
* **Privacy Policy Lifecycle:** Full authoring, multi-party review, versioning, scheduled publishing, and organizational assignment workflow (DRAFT → REVIEW → PUBLISHED → ARCHIVED).
* **Immutable Consent Ledger:** Regulatory-grade, append-only, timestamped transaction ledger recording every affirmative consent, withdrawal, notice version, and channel.
* **Cookie Compliance:** Automated headless browser scanning, cookie taxonomy categorization, geo-aware consent banners, and tamper-evident cookie consent logging.
* **Indic Multilingual Localization:** On-the-fly Section 5 itemised notices in Eighth Schedule languages (Kannada, Hindi, Tamil, Telugu, Marathi, Bengali, etc.).

### Domain 2: Data Rights (DPRR / DSR) Lifecycle
* **Multi-Channel Intake Forms:** Public intake widgets and portal-embedded forms supporting statutory request types:
  * *Right to Access (Sec 11)*: Summary of personal data processed, identities of third-party processors.
  * *Right to Correction & Updating (Sec 12(1))*: Correction of inaccurate, incomplete, or misleading data.
  * *Right to Erasure (Sec 12(2))*: Deletion of personal data no longer necessary for purpose or upon consent withdrawal.
  * *Right to Grievance Redressal (Sec 13)*: Direct complaint mechanism prior to approaching the Board.
  * *Right to Nominate (Sec 14)*: Nomination of legal representative in event of death or incapacity.
* **Configurable Workflow Engine:** State machine driving requests through verification, fulfillment, legal review, and closure with stage-level assignees, checklists, and statutory SLA counters.
* **Automated Escalation & Alerts:** Pre-configured alarms notifying DPOs when requests reach 50%, 75%, and 90% of statutory deadlines.

### Domain 3: Risk, Governance & Data Intelligence
* **Privacy Impact Assessment (DPIA/PIA):** Multi-tenant questionnaire builder with automated risk weighting, vulnerability identification, and mitigation action tracking.
* **Automated PII Discovery Engine:** Dual-mode scanning architecture (Cloud Pool or Customer On-Premise Agent). Connects to external databases and object stores, samples data, runs regex and algorithmic verifiers (e.g. Verhoeff Aadhaar checksum), and **pushes only masked findings back**—zero raw customer PII ever leaves the tenant's perimeter.
* **Record of Processing Activities (RoPA):** Centralized Article 30 / DPDP register capturing data categories, legal grounds, flow stages, third-party disclosures, retention horizons, and automated PDF export.
* **AI Model Registry:** Cataloging internal and third-party AI/ML models, detailing training datasets, algorithmic purposes, automated decision-making risks, and bias mitigation.

### Domain 4: Platform Intelligence & Core Security
* **Hierarchical Multi-Tenancy:** Multi-layered organizational tree (`org_path`, e.g., `/corp/india/south/retail`) enabling inheritance of policies, role assignments, and localized consent policies.
* **Statutory Breach Management:** 5-minute incident classification wizard, timeline logger, and regulatory intimation pack generator compliant with DPDP Section 8(6) and CERT-In 6-hour cybersecurity reporting rules.
* **Tamper-Evident Audit Trail:** Every write, read of sensitive PII, policy update, or permission grant is cryptographically logged with actor IDs, IP provenance, and JSON delta diffs.

---

## 3. Microservices Topology & Inter-Service Architecture (C4 Level 3)

The backend is decomposed into **20 independent FastAPI microservices** and **2 background worker daemons**. Each service operates under strict encapsulation, owning its domain logic and dedicated database schema.

```mermaid
graph TD
    subgraph ClientIngress [Ingress Gateways]
        BFF[BFF Service :9000]
        BFF_P[BFF Portal Service :9018]
        API_G[Developer API Gateway :9021]
    end

    subgraph CorePlatformServices [Core Platform]
        AUTH[auth-service :9001<br/>Schema: auth]
        PLAT[platform-service :9002<br/>Schema: platform]
    end

    subgraph ComplianceServices [Compliance & Consent]
        CONSENT[consent-service :9003<br/>Schema: consent]
        POLICY[policy-service :9004<br/>Schema: policy]
        RIGHTS[privacy-rights-service :9005<br/>Schema: privacy_rights]
        PORTAL[portal-service :9017<br/>Schema: portal]
    end

    subgraph RiskGovernanceServices [Risk, Discovery & Mapping]
        ASSESS[assessment-service :9008<br/>Schema: assessment]
        COOKIE[cookie-service :9009<br/>Schema: cookie]
        GOV[governance-service :9010<br/>Schema: governance]
        DISC[discovery-service :9015<br/>Schema: discovery]
        MAP[mapping-service :9016<br/>Schema: mapping]
        INC[incident-service :9014<br/>Schema: incidents]
    end

    subgraph CrossCuttingServices [Cross-Cutting & Specialized]
        AUDIT[audit-service :9006<br/>Schema: audit]
        ANALYTICS[analytics-service :9007<br/>Schema: analytics]
        NOTIF[notification-service :9013<br/>Schema: notification]
        LOCAL[localization-service :9012<br/>Schema: localization]
        INTEG[integration-service :9011<br/>Schema: integrations]
        TRANS[translation-service :9019<br/>Stateless IndicTrans2]
        DOC[document-service :9020<br/>Schema: document · ClamAV]
    end

    subgraph BackgroundWorkers [Background Daemons]
        W_COOKIE[cookie-scanner-service<br/>Playwright Crawler]
        W_DISC[discovery-agent-service<br/>On-Prem / Cloud PII Scanner]
    end

    subgraph EventMesh [Event Streaming Bus]
        BUS[(Service Bus / NATS JetStream)]
    end

    BFF -->|/proxy/auth/*| AUTH
    BFF -->|/proxy/platform/*| PLAT
    BFF -->|/proxy/consent/*| CONSENT
    BFF -->|/proxy/policy/*| POLICY
    BFF -->|/proxy/rights/*| RIGHTS
    BFF -->|/proxy/assess/*| ASSESS
    BFF -->|/proxy/cookie/*| COOKIE
    BFF -->|/proxy/gov/*| GOV
    BFF -->|/proxy/disc/*| DISC
    BFF -->|/proxy/map/*| MAP
    BFF -->|/proxy/incidents/*| INC
    BFF -->|/proxy/audit/*| AUDIT
    BFF -->|/proxy/analytics/*| ANALYTICS
    BFF -->|/proxy/notif/*| NOTIF
    BFF -->|/proxy/local/*| LOCAL
    BFF -->|/proxy/integ/*| INTEG
    BFF -->|/proxy/doc/*| DOC

    BFF_P -->|Route Data Principal Requests| PORTAL
    API_G -->|Validate Key & Proxy| CONSENT

    PLAT -.->|Sync HTTPX: /internal/users| AUTH
    CONSENT -.->|Sync HTTPX: Translate Notice| TRANS
    PORTAL -->|Publish: consent_intake, dprr_intake| BUS
    RIGHTS -->|Publish: dprr_status_changed| BUS
    BUS -->|Consume: Async Intake| CONSENT
    BUS -->|Consume: Dispatch Webhooks| INTEG
    BUS -->|Consume: Send Notification| NOTIF

    DISC -.->|Job Dispatch via Polling| W_DISC
    COOKIE -.->|Queue Scan Job| BUS
    BUS -.->|Consume: Crawl Target| W_COOKIE
```

### Complete Microservices Specification Catalog

| Service Name | Port | Database Schema | Primary Role & API Responsibilities | Key Dependencies |
|---|---|---|---|---|
| **bff-service** | 9000 | *None (Proxy)* | Authenticated API Gateway for tenant workspace; JWT verification, cookie-to-Bearer token translation, RBAC permission verification, reverse proxy routing `/proxy/{svc}/*`. | All backend services |
| **auth-service** | 9001 | `auth` | User login, JWT RS256 token issuance and refresh, API key generation, user profile lifecycle, bcrypt password hashing. | Key Vault (RSA Keys) |
| **platform-service** | 9002 | `platform` | Multi-tenant lifecycle, organizational units hierarchy (`org_path`), SKU entitlement enforcement, branding configuration, tenant encryption key management. | `auth-service` |
| **consent-service** | 9003 | `consent` | Consent purpose definitions, collection point configuration, widget configs, preference centers, immutable consent transactions ledger. | Message Bus, `translation-service` |
| **policy-service** | 9004 | `policy` | Privacy policy authoring, markdown/HTML storage, version control, approval workflow, organizational unit assignment. | `audit-service` |
| **privacy-rights-service**| 9005 | `privacy_rights` | DPRR intake forms, privacy request ticket management, configurable stage workflows, task delegation, statutory SLA tracking. | Message Bus, `notification-service` |
| **audit-service** | 9006 | `audit` | Centralized immutable audit trail; records actor ID, tenant ID, action, resource URI, client IP, and before/after JSON diffs. | All write services |
| **analytics-service** | 9007 | `analytics` | Aggregates operational metrics; pre-computes daily consent opt-in rates, DPRR SLA completion percentages, cookie categorization stats. | `consent`, `privacy_rights` |
| **assessment-service** | 9008 | `assessment` | DPIA and PIA questionnaire builder, versioned templates, weighted risk scoring algorithms, mitigation tracking. | `audit-service` |
| **cookie-service** | 9009 | `cookie` | Cookie scan job management, banner design, geo-location display rules, cookie consent log ingestion. | Message Bus, `cookie-scanner` |
| **governance-service** | 9010 | `governance` | Enterprise data asset inventory, classification rules, retention schedule enforcement, AI model registry and model risk cards. | `audit-service` |
| **integration-service** | 9011 | `integrations` | Outbound third-party webhooks, domain event filtering, exponential backoff retries, dead-letter queue (DLQ) processing. | Message Bus |
| **localization-service** | 9012 | `localization` | Per-tenant locale configuration, UI translation dictionaries, custom label overrides and terminology aliases. | `platform-service` |
| **notification-service** | 9013 | `notification` | Multi-channel dispatch engine (Email/SMTP, Twilio SMS, Webhook notifications), template interpolation, delivery logs. | Message Bus |
| **incident-service** | 9014 | `incidents` | Security and privacy incident logging, statutory severity classification, timeline milestone tracking, DPBI breach notification generation. | `notification-service` |
| **discovery-service** | 9015 | `discovery` | External data source connection catalog, scan scheduling, remediation flags, aggregation of findings from scanning agents. | `discovery-agent-service` |
| **mapping-service** | 9016 | `mapping` | Record of Processing Activities (RoPA), system data flow mapping, third-party recipient registries, automated PDF report generation. | `governance-service` |
| **portal-service** | 9017 | `portal` | Data principal self-service backend, public token verification, preference lookup, public DPRR intake, event publishing. | Message Bus |
| **bff-portal-service** | 9018 | *None (Proxy)* | Public gateway for Data Principals; Fernet token lifecycle, rate-limiting per tenant + identifier, routes strictly to `portal-service`. | `portal-service` |
| **translation-service** | 9019 | *None (Stateless)* | High-performance Indic language translation engine utilizing IndicTrans2 neural models; English to 12 scheduled Indian languages. | None (Stateless) |
| **document-service** | 9020 | `document` | Internal secure document repository, ClamAV anti-malware verification, signed URL generation, attachment linking for DPIA and DSRs. | Local / Blob Storage |
| **api-gateway-service** | 9021 | `api_gateway` | Developer-facing reverse proxy; API key validation, request rate limiting, tenant context injection, external call logging. | `consent-service` |

---

## 4. Multi-Tenant Database Architecture & Schema Specification (C4 Level 4)

DPDP_Secure implements a **single-database, multi-schema architecture** on **PostgreSQL 17**, ensuring complete logical separation of domain boundaries while enabling unified transactional integrity and cross-module analytics.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        POSTGRESQL 17: DPDP_SECURE LOGICAL SCHEMAS                      │
├────────────────────┬────────────────────┬────────────────────┬─────────────────────────┤
│ 1. auth            │ 2. platform        │ 3. consent         │ 4. policy               │
│ 5. privacy_rights  │ 6. portal          │ 7. audit           │ 8. analytics            │
│ 9. assessment      │ 10. cookie         │ 11. governance     │ 12. incidents           │
│ 13. discovery      │ 14. mapping        │ 15. integrations   │ 16. localization        │
│ 17. notification   │ 18. document       │ 19. api_gateway    │                         │
└────────────────────┴────────────────────┴────────────────────┴─────────────────────────┘
```

### Detailed Schema & Entity Catalog

#### 1. `auth` Schema (Authentication & Identity)
* **`users`**: `user_id` (PK, UUID), `tenant_id` (FK), `email` (UNIQUE), `password_hash` (bcrypt), `is_platform_admin` (BOOLEAN), `is_active` (BOOLEAN), `created_at`.
* **`refresh_tokens`**: `token_id` (PK), `user_id` (FK), `tenant_id` (FK), `token_hash` (VARCHAR), `expires_at` (TIMESTAMPTZ), `revoked_at`.
* **`api_keys`**: `key_id` (PK), `tenant_id` (FK), `name` (VARCHAR), `key_prefix` (VARCHAR(8)), `key_hash` (VARCHAR(64)), `scopes` (TEXT[]), `created_at`.

#### 2. `platform` Schema (Multi-Tenancy & Authorization)
* **`tenants`**: `tenant_id` (PK, UUID), `name` (VARCHAR), `slug` (VARCHAR, UNIQUE), `plan` (VARCHAR), `status` (ACTIVE/SUSPENDED), `created_at`.
* **`org_units`**: `org_id` (PK), `tenant_id` (FK), `org_code` (VARCHAR), `name` (VARCHAR), `org_path` (VARCHAR, e.g. `/corp/india/south`), `parent_org_id` (FK).
* **`roles`**: `role_code` (PK), `tenant_id` (FK), `name` (VARCHAR), `is_system` (BOOLEAN), `description` (TEXT).
* **`permissions`**: `permission_code` (PK), `product_code` (VARCHAR), `description` (VARCHAR).
* **`role_permissions`**: `role_code` (FK), `permission_code` (FK), PRIMARY KEY (`role_code`, `permission_code`).
* **`user_roles`**: `tenant_id` (FK), `user_id` (FK), `role_code` (FK), PRIMARY KEY (`tenant_id`, `user_id`, `role_code`).
* **`tenant_settings`**: `tenant_id` (PK, FK), `settings_json` (JSONB), `updated_at`.
* **`tenant_encryption_keys`**: `tenant_id` (FK), `key_version` (INT), `wrapped_dek` (BYTEA), `kek_id` (VARCHAR), `status` (ACTIVE/ROTATED), PRIMARY KEY (`tenant_id`, `key_version`).

#### 3. `consent` Schema (Consent Lifecycle & Records)
* **`purposes`**: `purpose_id` (PK), `tenant_id` (FK), `name` (VARCHAR), `code` (VARCHAR), `legal_basis` (CONSENT/LEGITIMATE_USE), `version` (INT), `status`.
* **`collection_points`**: `cp_id` (PK), `tenant_id` (FK), `org_id` (FK), `name` (VARCHAR), `slug` (VARCHAR), `widget_config` (JSONB), `is_active`.
* **`consent_ledger`**: `ledger_id` (PK, UUID), `tenant_id` (FK), `data_principal_identifier` (VARCHAR, hashed/encrypted), `cp_id` (FK), `purpose_id` (FK), `status` (GRANTED/WITHDRAWN), `notice_version` (INT), `channel` (WEB/SDK/OFFLINE), `timestamp` (TIMESTAMPTZ).
* **`preference_centres`**: `pc_id` (PK), `tenant_id` (FK), `name` (VARCHAR), `slug` (VARCHAR), `config_json` (JSONB), `is_active`.

#### 4. `privacy_rights` Schema (DPRR State Machine)
* **`request_forms`**: `form_id` (PK), `tenant_id` (FK), `name` (VARCHAR), `slug` (VARCHAR), `workflow_id` (FK), `field_definitions` (JSONB).
* **`privacy_requests`**: `request_id` (PK, UUID), `tenant_id` (FK), `form_id` (FK), `request_type` (ACCESS/CORRECTION/ERASURE/GRIEVANCE/NOMINATION), `status` (NEW/VERIFYING/IN_PROGRESS/LEGAL_HOLD/COMPLETED/REJECTED), `user_ref` (VARCHAR), `assigned_to` (FK users), `due_date` (TIMESTAMPTZ), `created_at`.
* **`dsr_workflows`**: `workflow_id` (PK), `tenant_id` (FK), `name` (VARCHAR), `stages_json` (JSONB), `is_default`.
* **`dsr_request_tasks`**: `task_id` (PK), `request_id` (FK), `stage_name` (VARCHAR), `title` (VARCHAR), `status` (PENDING/DONE), `assigned_to` (FK).
* **`dsr_request_stage_history`**: `history_id` (PK), `request_id` (FK), `from_stage` (VARCHAR), `to_stage` (VARCHAR), `changed_by` (FK), `comment` (TEXT), `timestamp`.

#### 5. `portal` Schema (Data Principal Self-Service)
* **`access_tokens`**: `token_id` (PK), `token_hash` (VARCHAR(64), UNIQUE, HMAC-SHA256), `tenant_id` (FK), `data_principal_identifier` (VARCHAR), `identifier_type` (EMAIL/PHONE), `scopes` (TEXT[]), `expires_at` (TIMESTAMPTZ), `revoked_at`.
* **`tenant_portal_config`**: `tenant_id` (PK), `portal_enabled` (BOOLEAN), `base_url` (VARCHAR), `token_ttl_days` (INT), `reaccess_cooldown_minutes` (INT).

#### 6. `governance` Schema (Assets, Retention & AI)
* **`data_assets`**: `asset_id` (PK), `tenant_id` (FK), `name` (VARCHAR), `asset_type` (DATABASE/TABLE/FILE/S3), `classification` (PUBLIC/INTERNAL/CONFIDENTIAL/RESTRICTED_PII), `owner` (VARCHAR), `steward` (VARCHAR), `retention_days` (INT).
* **`retention_schedules`**: `schedule_id` (PK), `tenant_id` (FK), `name` (VARCHAR), `statutory_rule` (e.g., `CGST_ACT_SEC_36_6YR`), `retention_months` (INT), `action_on_expiry` (DELETE/ANONYMIZE).
* **`ai_models`**: `model_id` (PK), `tenant_id` (FK), `name` (VARCHAR), `vendor` (VARCHAR), `model_type` (LLM/CLASSIFIER), `risk_level` (LOW/MEDIUM/HIGH), `purpose_description` (TEXT).

#### 7. `discovery` Schema (Data Discovery & PII Scanning)
* **`data_sources`**: `source_id` (PK), `tenant_id` (FK), `name` (VARCHAR), `source_type` (POSTGRES/MYSQL/S3/AZURE_BLOB/SALESFORCE), `config_encrypted` (BYTEA), `status` (ACTIVE/ERROR), `last_scanned_at`.
* **`scan_jobs`**: `job_id` (PK), `source_id` (FK), `tenant_id` (FK), `status` (PENDING/RUNNING/COMPLETED/FAILED), `findings_count` (INT), `started_at`, `completed_at`.
* **`scan_findings`**: `finding_id` (PK), `job_id` (FK), `object_name` (VARCHAR), `field_name` (VARCHAR), `pii_categories` (TEXT[]), `sample_masked` (VARCHAR), `confidence_score` (FLOAT).

#### 8. `mapping` Schema (Record of Processing Activities - RoPA)
* **`processing_activities`**: `activity_id` (PK), `tenant_id` (FK), `name` (VARCHAR), `business_function` (VARCHAR), `legal_basis` (VARCHAR), `dpo_approved` (BOOLEAN).
* **`data_elements`**: `element_id` (PK), `activity_id` (FK), `pii_category` (VARCHAR), `data_subjects` (EMPLOYEES/CUSTOMERS/CHILDREN), `volume_estimate` (VARCHAR).
* **`data_flows`**: `flow_id` (PK), `activity_id` (FK), `flow_stage` (COLLECTION/STORAGE/TRANSFER/DESTRUCTION), `system_name` (VARCHAR), `country` (VARCHAR), `safeguards` (TEXT).

#### 9. `incidents` Schema (Breach Intimation & Timeline)
* **`incidents`**: `incident_id` (PK), `tenant_id` (FK), `title` (VARCHAR), `severity` (LOW/MEDIUM/HIGH/CRITICAL), `status` (DETECTED/CONTAINED/REPORTED/CLOSED), `detected_at` (TIMESTAMPTZ), `affected_principals_est` (INT).
* **`incident_timeline`**: `entry_id` (PK), `incident_id` (FK), `event_type` (DISCOVERY/CONTAINMENT/BOARD_NOTIFIED), `description` (TEXT), `actor_id` (VARCHAR), `logged_at`.
* **`breach_notifications`**: `notification_id` (PK), `incident_id` (FK), `authority` (DPBI/CERT_IN), `statutory_deadline` (TIMESTAMPTZ), `submitted_at` (TIMESTAMPTZ), `report_payload` (JSONB).

#### 10. `audit` Schema (Immutable Regulatory Audit Log)
* **`audit_events`**: `event_id` (PK, UUID), `tenant_id` (FK), `actor_id` (VARCHAR), `actor_role` (VARCHAR), `action` (CREATE/UPDATE/DELETE/READ_PII), `resource_type` (VARCHAR), `resource_id` (VARCHAR), `client_ip` (VARCHAR), `diff_json` (JSONB), `created_at` (TIMESTAMPTZ, DEFAULT CLOCK_TIMESTAMP()).

---

## 5. Security & Cryptographic Architecture

DPDP_Secure applies a Defense-in-Depth, Zero-Trust architectural model across data in transit, data in use, and data at rest.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        TENANT ENVELOPE ENCRYPTION ARCHITECTURE                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [Azure Key Vault / HSM] ───────────► Master Key Encryption Key (KEK)                 │
│                                                │                                       │
│                                                ▼ Unwraps                               │
│  [tenant_encryption_keys] ──────────► Wrapped Data Encryption Key (DEK)               │
│                                                │                                       │
│                                                ▼ Yields in-memory (AES-256-GCM)        │
│  [Microservice Application Memory] ─► Plaintext Tenant DEK (Zero disk persistence)     │
│                                                │                                       │
│                                                ▼ Encrypts / Decrypts                   │
│  [PostgreSQL 17 Storage] ───────────► Sensitive PII Columns (Aadhaar, PAN, Phone)      │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1. Two-Tier Envelope Encryption (DEK / KEK)
* **Master Key Encryption Key (KEK):** Stored inside Azure Key Vault (FIPS 140-2 Level 2 validated HSM). Never leaves the secure boundary.
* **Tenant Data Encryption Key (DEK):** Each tenant is provisioned with a unique AES-256-GCM symmetric key. The DEK is encrypted under the Key Vault KEK and persisted in `platform.tenant_encryption_keys`.
* **Field-Level Protection:** High-sensitivity personal attributes (Aadhaar number, medical records, financial account numbers, passwords) are encrypted using AES-GCM before database insertion.

### 2. Token Security Taxonomy
* **Tenant Admin / Team Users (BFF Gateway):**
  * Asymmetric **JWT RS256** tokens issued by `auth-service`.
  * Public keys distributed via JWKS endpoint; private key held in Key Vault.
  * Tokens transmitted via secure, same-site `HttpOnly` cookies to protect against Cross-Site Scripting (XSS).
* **Data Principals (Privacy Portal Gateway):**
  * Token-based authentication using **Fernet Session Tokens** (symmetric 128-bit AES-CBC with HMAC-SHA256 signature).
  * Only the HMAC-SHA256 hash is persisted in `portal.access_tokens`.
  * Zero long-lived passwords required from citizens; temporary magic-link or OTP access with statutory expiry.
* **Developer API Access:**
  * High-entropy `X-Api-Key` headers (`dpdp_live_...`).
  * Validated via SHA-256 lookup in `auth.api_keys` with strict tenant scope isolation.

---

## 6. Asynchronous Messaging & Domain Event Mesh

Services communicate through a decoupled publish-subscribe event mesh. The platform provides an abstraction layer supporting both cloud and on-premise message brokers via the `MESSAGE_BUS_PROVIDER` configuration.

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Data Principal
    participant Portal as BFF Portal / Portal Service
    participant Bus as Message Bus (Azure Service Bus / NATS)
    participant Consent as consent-service
    participant Rights as privacy-rights-service
    participant Audit as audit-service
    participant Notif as notification-service
    participant Integ as integration-service

    Citizen->>Portal: Submit Consent / DPRR Request
    Portal->>Portal: Validate Session & Rate Limits
    Portal->>Bus: Publish "dpdp.consent.captured" or "dpdp.dprr.intake"
    Portal-->>Citizen: 202 Accepted (Receipt Token)

    par Async Consumption
        Bus->>Consent: Consume "dpdp.consent.captured"
        Consent->>Consent: Commit to Immutable Consent Ledger
        Consent->>Audit: Log Audit Event
    and
        Bus->>Rights: Consume "dpdp.dprr.intake"
        Rights->>Rights: Initialize Dynamic Workflow & Set SLA Timer
        Rights->>Notif: Trigger Intake Confirmation SMS/Email
    and
        Bus->>Integ: Consume Event
        Integ->>Integ: Verify Idempotency (processed_events)
        Integ->>Integ: Dispatch Webhook to Customer CRM / ERP
    end
```

### Canonical Domain Event Catalog

| Event Name | Publisher Service | Primary Consumers | Business Function |
|---|---|---|---|
| `dpdp.consent.captured` | `portal-service`, `api-gateway` | `consent-service`, `audit-service` | Ingests affirmative consent into immutable ledger. |
| `dpdp.consent.withdrawn` | `portal-service`, `consent-service` | `consent-service`, `integration-service` | Triggers downstream sync and marks consent revoked. |
| `dpdp.dprr.intake` | `portal-service`, `rights-service` | `privacy-rights-service`, `notification-service` | Generates statutory request ticket and assigns tasks. |
| `dpdp.dprr.stage_changed` | `privacy-rights-service` | `notification-service`, `audit-service` | Alerts applicant of status change (Verification, Complete). |
| `dpdp.cookie.scan_queued` | `cookie-service` | `cookie-scanner-service (worker)` | Dispatches Playwright automated crawl job. |
| `dpdp.discovery.completed`| `discovery-agent-service` | `discovery-service`, `governance-service` | Updates PII inventory with newly discovered sensitive fields. |
| `dpdp.incident.raised` | `incident-service` | `notification-service` | Sends emergency alerts to DPO and triggers 72h countdown. |

---

## 7. Statutory Grounding in India's DPDP Act, 2023

Every subsystem within the DPDP_Secure architecture directly enforces statutory obligations under the Digital Personal Data Protection Act, 2023:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        STATUTORY COMPLIANCE MAPPING (DPDP ACT 2023)                    │
├────────────────────┬──────────────────────────────────┬────────────────────────────────┤
│ DPDP SECTION       │ STATUTORY LEGAL REQUIREMENT      │ DPDP_SECURE ENFORCING MODULE   │
├────────────────────┼──────────────────────────────────┼────────────────────────────────┤
│ Section 5(1) & (3) │ Itemised Multilingual Notice     │ consent-service + translation  │
│ Section 6(1) & (4) │ Free, Specific, Affirmative      │ consent-service (Ledger)       │
│ Section 8(5)       │ Reasonable Security Safeguards   │ Envelope Encryption + KeyVault │
│ Section 8(6)       │ Mandatory Breach Intimation      │ incident-service (DPBI Wizard) │
│ Section 8(7)       │ Storage Limitation & Erasure     │ governance-service (Retention) │
│ Section 9          │ Processing of Children's Data    │ consent-service (Age Gate)     │
│ Section 11         │ Right to Access Information      │ privacy-rights-service + RoPA  │
│ Section 12(1)      │ Right to Correction & Updating   │ privacy-rights-service (DPRR)  │
│ Section 12(2)      │ Right to Erasure                 │ privacy-rights-service + Redact│
│ Section 13         │ Right to Grievance Redressal     │ privacy-rights-service (Portal)│
│ Section 14         │ Right to Nominate Representative │ portal-service (Nominee Module)│
│ Section 33         │ Penalty Prevention (₹250 Crore)  │ audit-service (Defense Trail)  │
└────────────────────┴──────────────────────────────────┴────────────────────────────────┘
```

---

## 8. Cloud & Production Deployment Architecture (Azure)

In production environments, DPDP_Secure deploys across **Microsoft Azure** utilizing containerized serverless infrastructure, private virtual networking, and enterprise identity federation.

```mermaid
graph TB
    subgraph InternetIngress [Public Ingress Network]
        DNS[Azure Front Door / Cloudflare DNS]
        INGRESS[Azure Container Apps Managed Ingress<br/>TLS 1.3 Termination · Custom Domains]
    end

    subgraph VNet [Azure Virtual Network (10.0.0.0/16)]
        subgraph FrontendSubnet [Frontend Subnet (10.0.1.0/24)]
            ACA_APP[app.dpdpsecure.in<br/>Next.js 15 Workspace]
            ACA_OPS[ops.dpdpsecure.in<br/>Next.js 15 Ops]
            ACA_PRIV[privacy.dpdpsecure.in<br/>Next.js 15 Privacy Portal]
        end

        subgraph GatewaySubnet [Gateway Subnet (10.0.2.0/24)]
            ACA_BFF[api.dpdpsecure.in<br/>BFF Admin Gateway]
            ACA_BFF_P[portal-api.dpdpsecure.in<br/>BFF Portal Gateway]
        end

        subgraph BackendSubnet [Microservices Subnet - Private (10.0.3.0/24)]
            MS_CORE[20 Microservice Containers<br/>Internal HTTP Ingress Only]
            MS_WORKERS[Background Workers<br/>KEDA Scaled to Queue Depth]
        end

        subgraph DataSubnet [Data & Secrets Subnet - Private Endpoints (10.0.4.0/24)]
            AZ_PG[(Azure Database for PostgreSQL<br/>Flexible Server · PostgreSQL 17)]
            AZ_SB[(Azure Service Bus Standard<br/>Topics & Subscriptions)]
            AZ_REDIS[(Azure Managed Redis<br/>Session & Token Cache)]
            AZ_KV[(Azure Key Vault<br/>Secrets & Tenant KEKs)]
            AZ_STORAGE[(Azure Blob Storage<br/>Encrypted Documents & Scans)]
        end
    end

    DNS --> INGRESS
    INGRESS --> ACA_APP & ACA_OPS & ACA_PRIV
    INGRESS --> ACA_BFF & ACA_BFF_P

    ACA_APP & ACA_OPS --> ACA_BFF
    ACA_PRIV --> ACA_BFF_P

    ACA_BFF & ACA_BFF_P --> MS_CORE
    MS_CORE --> MS_WORKERS

    MS_CORE -->|Private Endpoint| AZ_PG
    MS_CORE -->|Private Endpoint| AZ_SB
    MS_CORE -->|Private Endpoint| AZ_REDIS
    MS_CORE -->|Managed Identity| AZ_KV
    MS_CORE -->|Private Endpoint| AZ_STORAGE
```

### Production Infrastructure Components

1. **Azure Container Apps (ACA):**
   * Consumption and dedicated workload profiles.
   * Auto-scaling from 1 to 10 instances based on HTTP request concurrency.
   * Background workers scale 0 to N via **KEDA** (Kubernetes Event-driven Autoscaling) monitoring queue backlog.
2. **Azure Database for PostgreSQL (Flexible Server):**
   * PostgreSQL version 17 with private VNet integration.
   * High availability with zone-redundant standby replica.
   * Automated point-in-time recovery (PITR) with 35-day backup retention.
3. **Azure Key Vault:**
   * Hardware-backed storage for asymmetric JWT RSA signing keys, database connection strings, and master KEKs.
   * Microservices authenticate using **Azure User-Assigned Managed Identity**—zero plaintext passwords in codebase or environment configs.
4. **Zero-Trust Network Boundary:**
   * All backend microservices, Redis caches, message buses, and databases reside in private subnets with no public IP allocation.
   * Strict Network Security Group (NSG) rules prohibiting cross-subnet ingress except through designated gateway ports.

---

## 9. Local & Offline-First SME Architecture

In addition to enterprise multi-tenant cloud deployment, DPDP_Secure features a **100% offline-first local compute mode** designed for micro-enterprises and medical clinics (e.g., diagnostic centers, retail distributors):

* **Local Compute Engine:** FastAPI + SQLite running locally on the owner's desktop (`localhost:8000`).
* **Zero Cloud Leakage:** Plaintext WhatsApp exports and unencrypted customer spreadsheets are parsed entirely in local RAM.
* **OpenPyXL Atomic Formula Redaction:** Erases requested customer rows without breaking `=SUM()` or `=VLOOKUP()` formulas.
* **CGST Act Tax Lock:** Automatically identifies financial invoices under 6 years old, applying a statutory retention lock while purging non-essential marketing tags.
* **Defensive Proof Certificates:** Produces cryptographic SHA-256 erasure certificates providing immediate evidence of compliance to visiting regulatory inspectors.

---

### Architectural Verification Checklist

* [x] **20 Microservices & 2 Background Workers** defined with port mappings, schemas, and API responsibilities.
* [x] **19 PostgreSQL 17 Schemas** cataloged with entity attributes, keys, and relational constraints.
* [x] **C4 Model Diagrams** provided for System Context, Microservices Topology, Event Mesh, and Cloud VNet.
* [x] **Dual Authentication Framework** documented (JWT RS256 for staff, Fernet for citizens, API Keys for machines).
* [x] **Two-Tier Envelope Encryption** model detailed with Azure Key Vault HSM grounding.
* [x] **Statutory DPDP Act 2023 Provisions** mapped directly to enforcing technical components.
* [x] **Strict Naming Compliance:** 100% branded as **DPDP_Secure** with zero legacy references.
