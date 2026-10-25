from pydantic import BaseModel
from typing import List, Optional

class BreachIncidentInput(BaseModel):
    incident_type: str        # e.g., "lost_device", "leaked_link", "accidental_email", "unauthorized_access"
    date_discovered: str
    time_discovered: str
    affected_device_or_service: str
    estimated_principals_affected: int
    categories_compromised: List[str]
    description: str
    containment_actions_taken: List[str]

class BreachDossierResponse(BaseModel):
    incident_id: str
    dpbi_formal_notification: str
    customer_alert_sms: str
    customer_alert_whatsapp: str
    containment_checklist: List[str]
    statutory_citations: List[str]
    max_statutory_penalty_risk: str
    generated_timestamp: str
