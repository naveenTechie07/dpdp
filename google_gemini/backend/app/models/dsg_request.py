from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DSRSearchRequest(BaseModel):
    query: str  # Phone number, email, or Aadhaar fragment

class DSRAccessReport(BaseModel):
    principal_id: str
    identified_records_count: int
    matched_files: List[str]
    held_categories: List[str]
    third_party_processors_shared: List[str]
    lawful_basis: str
    generated_at: str
    statutory_citation: str = "Digital Personal Data Protection Act, 2023 - Section 11"

class DSRErasureRequest(BaseModel):
    principal_id: str
    reason: str = "Consent Withdrawn / Purpose Fulfilled"
    simulate_only: bool = False

class DSRErasureResult(BaseModel):
    principal_id: str
    status: str                       # "COMPLETED_FULL", "COMPLETED_PARTIAL_TAX_LOCK", "NO_RECORDS_FOUND"
    modified_files: List[str]
    redacted_cells_count: int
    statutory_tax_lock: bool
    retained_invoices: List[Dict[str, Any]]
    tax_retention_deadline: Optional[str] = None
    certificate: Dict[str, Any]
