"""Pydantic models for Section 5 notices and consent ledger (Section 6)."""

from pydantic import BaseModel, Field
from typing import Literal, Optional, List
from datetime import datetime


class NoticeRequest(BaseModel):
    """Request to generate a Section 5 notice."""
    principal_name: str = Field(..., description="Name of the data principal")
    purpose: str = Field(..., description="Purpose of data collection")
    data_items: List[str] = Field(..., description="List of personal data items collected")
    language: str = Field(default="en", description="Language code: en, hi, kn")
    grievance_contact: str = Field(..., description="Grievance officer contact details")
    business_name: str = Field(..., description="Name of the business")


class NoticeResponse(BaseModel):
    """Generated notice response."""
    notice_text: str = Field(..., description="The generated notice text")
    language: str = Field(..., description="Language of the notice")
    section_reference: str = Field(default="Section 5(1) & 5(3), DPDP Act 2023")
    generated_at: str = Field(..., description="Generation timestamp")


class ConsentRecord(BaseModel):
    """A consent record in the ledger (Section 6 of DPDP Act)."""
    id: Optional[int] = None
    principal_id: str = Field(..., description="Unique identifier for the data principal")
    notice_version: str = Field(..., description="Version of the notice shown")
    language: str = Field(default="en", description="Language of the notice")
    purpose: str = Field(..., description="Purpose for which consent was given")
    timestamp: str = Field(..., description="When consent was given")
    channel: str = Field(..., description="How consent was captured (whatsapp, web, paper)")
    status: Literal["active", "withdrawn", "expired"] = Field(default="active")
    created_at: Optional[str] = None


class ConsentLedgerResponse(BaseModel):
    """Response containing all consent records."""
    records: List[ConsentRecord]
    total_active: int
    total_withdrawn: int
