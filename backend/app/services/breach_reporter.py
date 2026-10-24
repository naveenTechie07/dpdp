"""
breach_reporter.py - Section 8(6) breach incident reporting.

Generates:
1. DPBI statutory notification dossier (formatted for Data Protection Board of India)
2. Customer alert messages (SMS/WhatsApp)
3. Immediate containment checklist
4. SHA-256 hash of the report for tamper-evidence
"""

from datetime import datetime
from typing import List, Dict, Any
import hashlib

from app.models.breach import BreachIncident, BreachReport


def _generate_dpbi_dossier(incident: BreachIncident) -> str:
    """Generate the official DPBI notification dossier text."""
    lines = [
        "=" * 60,
        "DATA PROTECTION BOARD OF INDIA (DPBI)",
        "SECTION 8(6) - PERSONAL DATA BREACH NOTIFICATION",
        "DPDP Act, 2023",
        "=" * 60,
        "",
        f"Incident ID: {incident.incident_type.upper()}-{datetime.now().strftime('%Y%m%d%H%M')}",
        f"Date Discovered: {incident.discovered_at}",
        f"Incident Type: {incident.incident_type.replace('_', ' ').title()}",
        f"Reported By: {incident.contact_officer}",
        "",
        "-" * 60,
        "1. INCIDENT SUMMARY",
        "-" * 60,
        incident.description or "No detailed description provided.",
        "",
        "-" * 60,
        "2. CATEGORIES OF PERSONAL DATA INVOLVED",
        "-" * 60,
    ]
    for cat in incident.pii_categories:
        lines.append(f"  - {cat}")
    lines.extend([
        "",
        "-" * 60,
        "3. NUMBER OF AFFECTED DATA PRINCIPALS",
        "-" * 60,
        f"  Estimated count: {incident.affected_count}",
        "",
        "-" * 60,
        "4. IMMEDIATE CONTAINMENT MEASURES",
        "-" * 60,
        "  - Isolate affected systems",
        "  - Revoke compromised access credentials",
        "  - Notify Data Protection Board of India",
        "  - Inform affected data principals",
        "",
        "-" * 60,
        "5. DESIGNATED GRIEVANCE OFFICER",
        "-" * 60,
        f"  Contact: {incident.contact_officer}",
        "",
        "=" * 60,
        "This dossier is auto-generated for Srujana Tech Fest 2026 hackathon prototype.",
        "Not formal legal filing. Consult legal counsel for production use.",
        "=" * 60,
    ])
    return "\n".join(lines)


def _generate_customer_alert(incident: BreachIncident) -> str:
    """Generate a calm, transparent customer alert message."""
    categories_str = ", ".join(incident.pii_categories)
    return (
        f"Important Notice from {incident.contact_officer.split(' - ')[0] if ' - ' in incident.contact_officer else 'Your Service Provider'}:\n\n"
        f"We are writing to inform you that on {incident.discovered_at}, a data security incident occurred "
        f"affecting our records. The following categories of personal data may have been involved: {categories_str}.\n\n"
        f"No passwords, banking credentials, or financial data were compromised.\n\n"
        f"We have secured our systems and notified the Data Protection Board of India as required under "
        f"Section 8(6) of the DPDP Act, 2023.\n\n"
        f"Recommended actions:\n"
        f"  1. Monitor your accounts for unusual activity\n"
        f"  2. Change your passwords if you reused them elsewhere\n"
        f"  3. Contact our Grievance Officer at: {incident.contact_officer}\n\n"
        f"We apologize for any concern this may cause and are taking steps to prevent recurrence.\n"
    )


def _generate_containment_checklist(incident: BreachIncident) -> List[str]:
    """Generate immediate containment actions based on incident type."""
    base_checklist = [
        "Isolate affected systems from the network",
        "Preserve all logs and evidence for investigation",
        "Change all administrative passwords",
        "Review access permissions for all staff",
    ]

    incident_specific = {
        "lost_device": [
            "Remote wipe the lost device if possible",
            "Revoke all sessions from the lost device",
            "Notify mobile carrier to disable the SIM",
        ],
        "leaked_link": [
            "Revoke the public sharing link immediately",
            "Check access logs to see who accessed the link",
            "Re-share files with restricted permissions only",
        ],
        "accidental_email": [
            "Request recall of the email if possible",
            "Ask recipient to delete and confirm deletion",
            "Send correction email to affected parties",
        ],
        "unauthorized_access": [
            "Disable compromised user accounts",
            "Force password reset for all users",
            "Review audit logs for unauthorized data access",
        ],
    }

    return base_checklist + incident_specific.get(incident.incident_type, [])


def _compute_report_hash(report_text: str) -> str:
    """Compute SHA-256 hash of the breach report."""
    return hashlib.sha256(report_text.encode("utf-8")).hexdigest()


def generate_breach_report(incident: BreachIncident) -> BreachReport:
    """
    Generate a complete Section 8(6) breach report.
    
    Returns a BreachReport with DPBI dossier, customer alert, and containment checklist.
    """
    incident_id = f"BR-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    dpbi_dossier = _generate_dpbi_dossier(incident)
    customer_alert = _generate_customer_alert(incident)
    containment = _generate_containment_checklist(incident)

    # Compute hash for tamper evidence
    full_report = dpbi_dossier + "\n" + customer_alert + "\n" + "\n".join(containment)
    sha256_hash = _compute_report_hash(full_report)

    return BreachReport(
        incident_id=incident_id,
        incident_type=incident.incident_type,
        discovered_at=incident.discovered_at,
        pii_categories=incident.pii_categories,
        affected_count=incident.affected_count,
        description=incident.description,
        contact_officer=incident.contact_officer,
        dpbi_notification_dossier=dpbi_dossier,
        customer_alert=customer_alert,
        containment_checklist=containment,
        sha256_hash=sha256_hash,
        generated_at=datetime.now().isoformat(),
    )
