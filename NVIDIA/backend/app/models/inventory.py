"""Pydantic models for RoPA (Record of Processing Activities) and PII findings."""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class PIIFinding(BaseModel):
    """A single PII match found in a file."""
    field_name: str = Field(..., description="Column name or field identifier")
    pii_type: Literal[
        "phone", "pan", "aadhaar", "email", "upi", "name", "address", "clinical"
    ] = Field(..., description="Type of PII detected")
    value: str = Field(..., description="The detected PII value (masked in logs)")
    cell_coordinate: Optional[str] = Field(None, description="Excel cell coordinate (e.g., 'C14')")
    line_number: Optional[int] = Field(None, description="Line number in text files")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Detection confidence")


class DataAsset(BaseModel):
    """A data asset (file/sheet) containing personal data."""
    file_path: str = Field(..., description="Path to the file")
    file_name: str = Field(..., description="Basename of the file")
    sheet_name: Optional[str] = Field(None, description="Sheet name for Excel files")
    column_name: Optional[str] = Field(None, description="Column name for tabular data")
    pii_types: List[str] = Field(..., description="Types of PII found in this asset")
    record_count: int = Field(..., description="Number of records containing PII")
    risk_level: Literal["low", "medium", "high"] = Field(..., description="Risk rating")
    purpose: Optional[str] = Field(None, description="Inferred purpose of data collection")
    consent_required: bool = Field(default=True, description="Whether consent is required")


class RoPAResponse(BaseModel):
    """Response for a complete scan operation."""
    scan_id: str = Field(..., description="Unique scan identifier")
    timestamp: str = Field(..., description="Scan completion timestamp")
    files_scanned: int = Field(..., description="Number of files scanned")
    total_pii_findings: int = Field(..., description="Total PII matches found")
    data_assets: List[DataAsset] = Field(..., description="List of data assets with PII")
    high_risk_files: int = Field(..., description="Count of high-risk files")
    compliance_score: float = Field(..., description="Estimated compliance score (0-100)")
