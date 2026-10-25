from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class PIIEntity(BaseModel):
    category: str        # e.g., "phone", "aadhaar", "pan", "email", "upi", "clinical"
    value: str           # Masked or raw match
    raw_value: str
    is_valid_checksum: bool = True
    context: Optional[str] = None

class CellLocation(BaseModel):
    sheet_name: Optional[str] = None
    row_index: int
    column_name: Optional[str] = None
    cell_coordinate: Optional[str] = None
    pii_types: List[str]

class FileScanResult(BaseModel):
    filename: str
    file_path: str
    file_type: str       # "excel", "csv", "whatsapp", "text"
    total_records: int
    pii_count: int
    risk_level: str      # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    detected_categories: List[str]
    sample_entities: List[PIIEntity]
    locations: List[CellLocation]
    unencrypted: bool = True

class RoPAResponse(BaseModel):
    total_files_scanned: int
    total_records_analyzed: int
    total_pii_detected: int
    critical_files_count: int
    files: List[FileScanResult]
    category_breakdown: Dict[str, int]
    scan_timestamp: str
