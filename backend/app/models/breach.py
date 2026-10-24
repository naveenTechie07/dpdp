"""Pydantic models for Section 8(6) breach incident reporting."""

from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime


class BreachIncident(BaseModel):
    """A personal data breach incident report."""
    incident_type: Literal[
        "lost_device", "leaked_link", "accidental_email", "unauthorized_access", "other"
    ] = Field(..., description="Type of breach incident")
    discovered_at: str = Field(..., description="ISO timestamp when breach was discovered")
    pii_categories: List[str] = Field(..., description="Categories of PII exposed")
    affected_count: int = Field(..., description="Estimated number of affected Data Principals")
    description: Optional[str] = Field(None, description="Description of the incident")
    contact_officer: str = Field(..., description="Grievance Officer contact details")


class BreachReport(BaseModel):
    """Section 8(6) DPBI statutory breach report."""
    incident_id: str = Field(..., description="Unique incident identifier")
    incident_type: str
    discovered_at: str
    pii_categories: List[str]
    affected_count: int
    description: Optional[str]
    contact_officer: str
    dpbi_notification_dossier: str = Field(..., description="Formatted DPBI filing text")
    customer_alert: str = Field(..., description="Customer-facing alert message")
    containment_checklist: List[str] = Field(..., description="Immediate containment actions")
    statutory_reference: str = Field(default="Section 8(6), DPDP Act 2023")
    sha256_hash: str = Field(..., description="SHA-256 hash of the report")
    generated_at: str
