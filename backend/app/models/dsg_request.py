"""Pydantic models for Data Subject Rights requests (Sections 11 & 12)."""

from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime


class RightsRequest(BaseModel):
    """Data Principal rights request."""
    principal_id: str = Field(..., description="Phone number or email of the principal")
    request_type: Literal["access", "erasure", "correction"] = Field(
        ..., description="Type of rights request"
    )
    contact_method: str = Field(default="whatsapp", description="How the request was received")


class DataPoint(BaseModel):
    """A single data point found about a principal."""
    file_path: str
    field_name: str
    value: str
    pii_type: str


class AccessResponse(BaseModel):
    """Section 11 Right to Access response."""
    principal_id: str
    total_data_points: int
    data_points: List[DataPoint]
    processors: List[str] = Field(..., description="Third-party processors data was shared with")
    consent_id: Optional[str] = None
    generated_at: str


class ErasureRequest(BaseModel):
    """Section 12 Right to Erasure request."""
    principal_id: str = Field(..., description="Phone number or email of the principal")
    invoice_dates: List[str] = Field(
        default=[], description="Invoice dates associated with this principal (for tax check)"
    )


class ErasureResponse(BaseModel):
    """Section 12 erasure response with statutory conflict resolution."""
    principal_id: str
    status: Literal["APPROVED_FULL_ERASURE", "STATUTORY_RETENTION_LOCK", "PARTIAL_ERASURE"]
    statute: str
    message: str
    retention_until: Optional[str] = None
    sha256_certificate: Optional[str] = None
    files_modified: List[str] = Field(default=[], description="Files that were redacted")
    financial_records_retained: bool = Field(default=False)
