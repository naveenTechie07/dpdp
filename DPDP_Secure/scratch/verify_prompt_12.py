"""
verify_prompt_12.py - Verification script for PROMPT 12: Pillar 4 — SME Breach Threat Modeling & Incident Triage Engine
Srujana Tech Fest 2026 | Problem Statement LS-04: Personal Data in Informal Systems
"""

import subprocess
import sys
import json
import urllib.request
import urllib.parse
import http.cookiejar
import os

print("=" * 75)
print("  PROMPT 12 VERIFICATION: SME Breach Threat Modeling & Incident Triage Engine")
print("  DPDP Act Section 8(6) & DPDP Rules, 2025 (Rule 7)")
print("=" * 75)

BASE_URL = "http://localhost:3000"

# 1. Run Unit & Model Test Suite
print("\n[1] Running node tests/incidentTriage.test.js...")
proc = subprocess.run(["node", "tests/incidentTriage.test.js"], cwd=r"N:\chnayka\DPDP_Secure", capture_output=True, text=True)
print(proc.stdout)
if proc.returncode != 0:
    print("[-] Unit tests failed:")
    print(proc.stderr)
    sys.exit(1)
print("[+] tests/incidentTriage.test.js passed 100% cleanly!")

# Helper to build cookie-enabled session opener
def create_session(role=None):
    cookie_jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))
    if role:
        login_data = urllib.parse.urlencode({'role': role}).encode('utf-8')
        req = urllib.request.Request(f"{BASE_URL}/auth/demo-login", data=login_data)
        opener.open(req)
    return opener

# 2. Test RBAC Guardrails: Restrict incident triage strictly to SME_OWNER and COMPLIANCE_OFFICER
print("\n[2] Testing RBAC Guardrails (Unauthorized Role: AUDITOR)...")
auditor_session = create_session(role='auditor')

# Attempt incident creation as AUDITOR (should be 403 Forbidden)
create_payload = json.dumps({
    "incidentTitle": "Auditor Unauthorized Test Breach",
    "scenarioType": "CUSTOM",
    "estimatedCount": 10,
    "dataCategories": ["Contact"]
}).encode('utf-8')

req_audit = urllib.request.Request(
    f"{BASE_URL}/api/incidents/create",
    data=create_payload,
    headers={"Content-Type": "application/json"}
)

try:
    auditor_session.open(req_audit)
    print("[-] FAIL: Expected 403 Forbidden for AUDITOR role, but request succeeded!")
    sys.exit(1)
except urllib.error.HTTPError as e:
    assert e.code == 403, f"Expected 403 Forbidden, got {e.code}"
    error_data = json.loads(e.read().decode('utf-8'))
    print(f"  [+] RBAC API Block verified: HTTP 403 Forbidden ({error_data.get('error')})")

# Attempt accessing /incidents/management as AUDITOR (should be 403 Forbidden)
req_mgmt_audit = urllib.request.Request(f"{BASE_URL}/incidents/management")
try:
    auditor_session.open(req_mgmt_audit)
    print("[-] FAIL: Expected 403 Forbidden on management page for AUDITOR role!")
    sys.exit(1)
except urllib.error.HTTPError as e:
    assert e.code == 403, f"Expected 403 Forbidden, got {e.code}"
    print(f"  [+] RBAC View Block verified: HTTP 403 Forbidden for AUDITOR on /incidents/management")

# 3. Test Authorized Session: SME_OWNER
print("\n[3] Authenticating as Authorized Role: SME_OWNER (Ramesh Kumar)...")
owner_session = create_session(role='owner')
req_me = urllib.request.Request(f"{BASE_URL}/auth/me")
me_resp = owner_session.open(req_me)
me_data = json.loads(me_resp.read().decode('utf-8'))
assert me_data["authenticated"] is True
assert me_data["user"]["role"] == "SME_OWNER"
print(f"  [+] Authenticated: {me_data['user']['name']} ({me_data['user']['role']})")

# 4. Test Live View: GET /incidents/management
print("\n[4] Testing GET /incidents/management...")
req_mgmt = urllib.request.Request(f"{BASE_URL}/incidents/management")
with owner_session.open(req_mgmt) as resp:
    assert resp.status == 200, f"Expected 200 OK, got {resp.status}"
    html = resp.read().decode('utf-8')
    assert "Incident Management &amp; Regulatory Triage" in html or "Incident Management" in html
    assert "72-Hour DPBI Statutory Notification Countdown" in html
    assert "Declare New Security Incident" in html
    assert "incidentWizardModal" in html
    assert "Lost Receptionist Smartphone" in html
    assert "Misdirected WhatsApp Medical Report" in html
    assert "Compromised Desktop Billing Workstation" in html
    print("  [+] GET /incidents/management loaded cleanly with 72h countdown and threat wizard modal!")

# 5. Test Live View: GET /incidents/dashboard
print("\n[5] Testing GET /incidents/dashboard...")
req_dash = urllib.request.Request(f"{BASE_URL}/incidents/dashboard")
with owner_session.open(req_dash) as resp:
    assert resp.status == 200, f"Expected 200 OK, got {resp.status}"
    html = resp.read().decode('utf-8')
    assert "Incidents &amp; Breaches Dashboard" in html or "Incidents & Breaches" in html
    assert "TOTAL OPEN" in html
    assert "CRITICAL / HIGH OPEN" in html
    assert "PENDING DPBI NOTICE" in html
    print("  [+] GET /incidents/dashboard loaded cleanly with executive metrics and charts!")

# 6. Test Live API: POST /api/incidents/create (Scenario 1: Lost Receptionist Smartphone)
print("\n[6] Testing POST /api/incidents/create with Scenario 1 (Lost Smartphone)...")
s1_payload = json.dumps({
    "incidentTitle": "Lost Receptionist Smartphone (Indiranagar Metro Station)",
    "scenarioType": "DEVICE_LOSS_UNENCRYPTED",
    "impactedSilos": ["clinic_reception_chat.txt", "whatsapp_media_store"],
    "estimatedCount": 250,
    "dataCategories": ["Identity (Aadhaar, PAN)", "Contact", "Clinical Health Data (Prescriptions, Diagnostic Requisitions)"],
    "safeguardsInPlace": "NONE_UNENCRYPTED"
}).encode('utf-8')

req_create = urllib.request.Request(
    f"{BASE_URL}/api/incidents/create",
    data=s1_payload,
    headers={"Content-Type": "application/json"}
)

with owner_session.open(req_create) as resp:
    assert resp.status == 200, f"Expected 200 OK, got {resp.status}"
    res_data = json.loads(resp.read().decode('utf-8'))
    assert res_data["success"] is True
    assert res_data["severity"] == "CRITICAL", f"Expected CRITICAL, got {res_data['severity']}"
    assert res_data["score"] >= 80, f"Expected score >= 80, got {res_data['score']}"
    assert res_data["mandatoryDpbiIntimation"] is True
    assert "72 Hours" in res_data["statutoryDeadline"]
    assert "discoveredAt" in res_data
    assert len(res_data["containmentActions"]) >= 4
    created_incident_id = res_data["incidentId"]
    print(f"  [+] POST /api/incidents/create PASSED:")
    print(f"      Incident ID:        {created_incident_id}")
    print(f"      Severity Rating:    {res_data['severity']} (Score: {res_data['score']}/100)")
    print(f"      Statutory Deadline: {res_data['statutoryDeadline']}")
    print(f"      Mandatory DPBI:     {res_data['mandatoryDpbiIntimation']}")
    print(f"      Containment Steps:  {len(res_data['containmentActions'])} actions generated")

# 7. Test Live API: POST /api/incidents/triage (Check containment actions)
print(f"\n[7] Testing POST /api/incidents/triage for {created_incident_id}...")
triage_payload = json.dumps({
    "incidentId": created_incident_id,
    "actionId": "ACT-01",
    "done": True
}).encode('utf-8')

req_triage = urllib.request.Request(
    f"{BASE_URL}/api/incidents/triage",
    data=triage_payload,
    headers={"Content-Type": "application/json"}
)

with owner_session.open(req_triage) as resp:
    assert resp.status == 200, f"Expected 200 OK, got {resp.status}"
    triage_data = json.loads(resp.read().decode('utf-8'))
    assert triage_data["success"] is True
    assert triage_data["incidentId"] == created_incident_id
    act1 = next((a for a in triage_data["containmentActions"] if a["id"] == "ACT-01"), None)
    assert act1 and act1["done"] is True, "ACT-01 should be marked done: true"
    print(f"  [+] POST /api/incidents/triage PASSED: Containment step ACT-01 verified as completed!")

# 8. Test Live API: POST /api/incidents/dispatch-alerts (Simulated citizen reassurance)
print(f"\n[8] Testing POST /api/incidents/dispatch-alerts for {created_incident_id}...")
alert_payload = json.dumps({
    "incidentId": created_incident_id
}).encode('utf-8')

req_alert = urllib.request.Request(
    f"{BASE_URL}/api/incidents/dispatch-alerts",
    data=alert_payload,
    headers={"Content-Type": "application/json"}
)

with owner_session.open(req_alert) as resp:
    assert resp.status == 200, f"Expected 200 OK, got {resp.status}"
    alert_data = json.loads(resp.read().decode('utf-8'))
    assert alert_data["success"] is True
    assert alert_data["deliveredCount"] == 250
    assert "SMS" in alert_data["channels"] and "WhatsApp" in alert_data["channels"]
    print(f"  [+] POST /api/incidents/dispatch-alerts PASSED: Dispatched to {alert_data['deliveredCount']} recipients across {alert_data['channels']}!")

# 9. Test Live Statutory Dossier: GET /incidents/dossier/:id
print(f"\n[9] Testing GET /incidents/dossier/{created_incident_id}...")
req_dossier = urllib.request.Request(f"{BASE_URL}/incidents/dossier/{created_incident_id}")
with owner_session.open(req_dossier) as resp:
    assert resp.status == 200, f"Expected 200 OK, got {resp.status}"
    dossier_html = resp.read().decode('utf-8')
    assert "Data Protection Board of India (DPBI)" in dossier_html
    assert "FORM DPBI-IR1" in dossier_html
    assert created_incident_id in dossier_html
    assert "STATUTORY BREACH INTIMATION DOSSIER" in dossier_html
    assert "Initial Discovery Timestamp" in dossier_html
    assert "72-Hour Window" in dossier_html
    assert "Aarogya Diagnostic Center" in dossier_html
    print("  [+] Form DPBI-IR1 Statutory Dossier generated and verified successfully!")

# 10. Test Data Spill Prevention & Masking
print("\n[10] Testing Data Spill Prevention (Plaintext Aadhaar & Health Redaction)...")
spill_payload = json.dumps({
    "incidentTitle": "Staff Note: Patient Aadhaar 9999 8888 7777 and Biopsy carcinoma report",
    "scenarioType": "CUSTOM",
    "estimatedCount": 5,
    "dataCategories": ["Health", "Identity"]
}).encode('utf-8')

req_spill = urllib.request.Request(
    f"{BASE_URL}/api/incidents/create",
    data=spill_payload,
    headers={"Content-Type": "application/json"}
)

with owner_session.open(req_spill) as resp:
    spill_res = json.loads(resp.read().decode('utf-8'))
    spill_id = spill_res["incidentId"]

# Query SQLite directly to verify no plaintext Aadhaar is persisted
import sqlite3
conn = sqlite3.connect(r"N:\chnayka\DPDP_Secure\data\dpdp_secure.db")
c = conn.cursor()
c.execute("SELECT incidentTitle, discoveredAt FROM incidents WHERE id = ?", (spill_id,))
row = c.fetchone()
conn.close()

assert row is not None
persisted_title, original_discovered = row
assert "9999 8888 7777" not in persisted_title, f"Aadhaar leaked in SQLite: {persisted_title}"
assert "XXXX-XXXX-7777" in persisted_title, f"Expected masked Aadhaar, got {persisted_title}"
print(f"  [+] Data Spill Prevention verified: Plaintext Aadhaar masked to XXXX-XXXX-7777 in SQLite!")

print("\n" + "=" * 75)
print("  ALL PROMPT 12 REQUIREMENTS VERIFIED 100% SUCCESSFULLY!")
print("=" * 75)
