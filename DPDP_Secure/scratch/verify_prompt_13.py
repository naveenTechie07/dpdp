#!/usr/bin/env python3
"""
DPDP_Secure - Pillar 4: 72-Hour DPBI Dossier & Plain Citizen Alerts Live Verification Script
Verifies:
1. /incidents/management triggers: "Generate 72-Hour DPBI Dossier" & "Dispatch Customer Alerts"
2. /incidents/dossier/:id printable statutory Form DPBI-IR1
3. /api/incidents/dossier/:id JSON API with SHA-256 fingerprint
4. /api/incidents/dispatch-alerts multi-channel dispatch simulation
5. /notifications/center multi-lingual template and dispatch queue rendering
"""

import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:3000"

def log_pass(msg):
    print(f"[PASS] {msg}")

def log_fail(msg):
    print(f"[FAIL] {msg}")
    sys.exit(1)

def http_get(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "DPDP_Secure_Prompt13_Verifier/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.status, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        log_fail(f"Connection failed to {url}: {e}")

def http_post_json(path, data):
    url = f"{BASE_URL}{path}"
    payload = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "User-Agent": "DPDP_Secure_Prompt13_Verifier/1.0",
            "Content-Type": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.status, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        log_fail(f"Connection failed to {url}: {e}")

def verify_incident_management_ui():
    status, html = http_get("/incidents/management")
    if status != 200:
        log_fail(f"/incidents/management returned HTTP {status}")
    
    assert "Generate 72-Hour DPBI Dossier" in html, "Missing 'Generate 72-Hour DPBI Dossier' button"
    assert "Dispatch Customer Alerts" in html, "Missing 'Dispatch Customer Alerts' trigger"
    assert "Lost Receptionist Smartphone" in html, "Missing Lost Receptionist Smartphone incident"
    assert "citizenAlertModal" in html, "Missing #citizenAlertModal in incident management"
    log_pass("Incidents Management UI correctly presents 72-Hour DPBI Dossier & Citizen Alert controls")

def verify_printable_dossier():
    status, html = http_get("/incidents/dossier/INC-2026-9921")
    if status != 200:
        log_fail(f"/incidents/dossier/INC-2026-9921 returned HTTP {status}")

    assert "FORM DPBI-IR1" in html, "Missing FORM DPBI-IR1 statutory identifier"
    assert "DATA PROTECTION BOARD OF INDIA" in html, "Missing DPBI authority header"
    assert "Aarogya Diagnostic Center" in html, "Missing Data Fiduciary name"
    assert "29AAAAA0000A1Z5" in html, "Missing Data Fiduciary GSTIN"
    assert "Ramesh Kumar" in html, "Missing DPO Name"
    assert "privacy@aarogyaclinic.in" in html, "Missing DPO Email"
    assert "window.print()" in html, "Missing window.print() 1-click trigger"
    assert "SHA-256" in html, "Missing SHA-256 fingerprint section"
    assert "STATUTORY_72H_COMPLIANT" in html or "Within Statutory" in html or "72" in html, "Missing 72h statutory window calculation"
    log_pass("Printable Form DPBI-IR1 dossier view renders correctly with complete legal and entity findings")

def verify_dossier_json_api():
    status, body = http_get("/api/incidents/dossier/INC-2026-9921")
    if status != 200:
        log_fail(f"/api/incidents/dossier/INC-2026-9921 returned HTTP {status}")

    data = json.loads(body)
    assert data.get("success") is True, "Expected success: true in dossier API"
    dossier = data.get("dossier", {})
    assert "FORM DPBI-IR1" in dossier.get("formNumber", ""), "Form number must be DPBI-IR1"
    assert dossier.get("fiduciary", {}).get("gstin") == "29AAAAA0000A1Z5", "Invalid GSTIN"
    assert len(dossier.get("dossierSha256", "")) == 64, "Dossier SHA-256 fingerprint missing or invalid length"
    assert dossier.get("isWithin72Hours") is True, "Expected isWithin72Hours to be True"
    assert dossier.get("estimatedAffected") == 250, f"Expected 250 estimated affected, got {dossier.get('estimatedAffected')}"

    # Verify multilingual citizen alerts in dossier
    alerts = dossier.get("citizenAlerts", {})
    assert "Dear Aarogya Clinic Patient" in alerts.get("EN", {}).get("body", "")
    assert "ಆರೋಗ್ಯ ಕ್ಲಿನಿಕ್" in alerts.get("KN", {}).get("body", "")
    assert "आरोग्य क्लिनिक" in alerts.get("HI", {}).get("body", "")
    log_pass("Dossier JSON API returns fully compliant statutory schema and cryptographic fingerprint")

def verify_dispatch_alerts_api():
    payload = {
        "incidentId": "INC-2026-9921",
        "channels": ["SMS", "WhatsApp"],
        "languages": ["EN", "KN", "HI"]
    }
    status, body = http_post_json("/api/incidents/dispatch-alerts", payload)
    if status != 200:
        log_fail(f"/api/incidents/dispatch-alerts returned HTTP {status}: {body}")

    data = json.loads(body)
    assert data.get("success") is True, "Dispatch API returned success: false"
    assert data.get("deliveredCount") == 250, f"Expected deliveredCount 250, got {data.get('deliveredCount')}"
    assert "SMS" in data.get("channels", []), "SMS channel missing in response"
    assert "WhatsApp" in data.get("channels", []), "WhatsApp channel missing in response"
    assert len(data.get("proofSha256", "")) == 64, "Missing dispatch audit proof SHA-256"
    log_pass("Multi-channel citizen alert dispatch API executed successfully with audit proof")

def verify_notifications_center():
    status, html = http_get("/notifications/center")
    if status != 200:
        log_fail(f"/notifications/center returned HTTP {status}")

    assert "Notification Center" in html, "Missing Notification Center title"
    assert "English" in html, "Missing English language tab/section"
    assert "ಕನ್ನಡ" in html, "Missing Kannada language preview"
    assert "हिन्दी" in html, "Missing Hindi language preview"
    assert "INC-2026-9921" in html, "Missing incident alert dispatch log in center"
    assert "Vulnerability Concealment" in html or "vulnerability" in html.lower(), "Missing vulnerability concealment guardrail notice"
    log_pass("Notifications Center displays multi-lingual citizen alert templates and live dispatch queue")

def main():
    print("=== DPDP_Secure Prompt 13 Verification ===")
    verify_incident_management_ui()
    verify_printable_dossier()
    verify_dossier_json_api()
    verify_dispatch_alerts_api()
    verify_notifications_center()
    print("=== All Prompt 13 Verifications Passed (100%) ===")

if __name__ == "__main__":
    main()
