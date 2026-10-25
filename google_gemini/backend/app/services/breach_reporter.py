import uuid
from datetime import datetime
from typing import Dict, Any, List
from ..models.breach import BreachIncidentInput, BreachDossierResponse

def generate_breach_dossier(incident: BreachIncidentInput) -> BreachDossierResponse:
    incident_id = f"DPBI-INC-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"
    timestamp_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    dpbi_document = f"""================================================================================
STATUTORY REPORT OF PERSONAL DATA BREACH
TO: THE DATA PROTECTION BOARD OF INDIA (DPBI)
UNDER: SECTION 8(6) OF THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023
================================================================================
INCIDENT REFERENCE ID: {incident_id}
FILING DATE & TIME:   {timestamp_str}
STATUS:               FORMAL REGULATORY INTIMATION

1. PARTICULARS OF DATA FIDUCIARY:
   Name of Entity:     Aarogya Diagnostic Center & Polyclinic
   Entity Type:        Micro, Small and Medium Enterprise (MSME)
   Registered Office:  Bengaluru, Karnataka, India
   Grievance Officer:  Nodal Officer (compliance@aarogyaclinic.in)

2. DETAILS OF PERSONAL DATA BREACH:
   Nature of Incident: {incident.incident_type.replace('_', ' ').title()}
   Asset / Device:     {incident.affected_device_or_service}
   Date of Discovery:  {incident.date_discovered} at {incident.time_discovered}
   Root Cause:         {incident.description}

3. SCOPE AND ESTIMATED IMPACT:
   Estimated Principals Affected: {incident.estimated_principals_affected} Individuals
   Categories of Personal Data:   {', '.join(incident.categories_compromised)}
   Sensitive/Clinical Impact:     {'YES (Diagnostic/Health data potentially exposed)' if 'clinical' in incident.categories_compromised else 'Standard Contact PII'}

4. CONTAINMENT AND REMEDIAL MEASURES TAKEN:
{chr(10).join(f'   - {act}' for act in incident.containment_actions_taken)}

5. MITIGATION OF HARM TO DATA PRINCIPALS:
   - Direct intimation initiated to affected individuals via SMS and WhatsApp.
   - Credentials revoked and remote wipe initiated on compromised endpoint.
   - Nodal officer available for data principal inquiries.

6. STATUTORY DECLARATION:
   This notification is submitted in faithful compliance with Section 8(6) of the 
   Digital Personal Data Protection Act, 2023. The entity confirms all reasonable 
   containment safeguards have been deployed pursuant to Section 8(5).
================================================================================
"""

    customer_sms = (
        f"Aarogya Clinic Notice: On {incident.date_discovered}, an unauthorized incident affected our contact list. "
        f"No bank/payment passwords were compromised. We have secured systems & notified the Data Protection Board. "
        f"Helpline: 080-23456789 (DPDP Sec 8(6))."
    )

    customer_whatsapp = (
        f"Dear Patient / Customer,\n\n"
        f"We are writing in transparency under the Digital Personal Data Protection Act, 2023.\n\n"
        f"On {incident.date_discovered}, we detected an unauthorized incident affecting: {incident.affected_device_or_service}.\n\n"
        f"• What was affected: {', '.join(incident.categories_compromised)}\n"
        f"• What was NOT affected: Financial passwords, bank account pins, and payment credentials.\n"
        f"• Actions taken: The device/link has been isolated, and the Data Protection Board of India has been notified.\n\n"
        f"If you receive suspicious calls claiming to represent our clinic, please do not share OTPs. "
        f"Contact our Grievance Officer at compliance@aarogyaclinic.in."
    )

    checklist = [
        "Immediately isolate/remote wipe the compromised smartphone or laptop.",
        "Revoke access tokens and change shared Wi-Fi / Google Drive passwords.",
        "Notify the Data Protection Board of India (DPBI) within statutory window.",
        "Send plain-language SMS/WhatsApp intimation to all affected Data Principals.",
        "Archive the compromised file and restore from authenticated offline backup.",
        "Log incident details into the internal SQLite audit ledger for legal defense."
    ]

    return BreachDossierResponse(
        incident_id=incident_id,
        dpbi_formal_notification=dpbi_document,
        customer_alert_sms=customer_sms,
        customer_alert_whatsapp=customer_whatsapp,
        containment_checklist=checklist,
        statutory_citations=[
            "Section 8(5) - Duty to take reasonable security safeguards",
            "Section 8(6) - Mandatory breach notification to Board and Data Principals",
            "Section 33 Schedule - Maximum penalty liability up to Rs. 200 Crore"
        ],
        max_statutory_penalty_risk="Up to ₹200 Crore (Mitigated by prompt Section 8(6) compliance)",
        generated_timestamp=timestamp_str
    )
