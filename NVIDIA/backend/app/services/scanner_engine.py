"""
scanner_engine.py - PII scanning engine with Indian identifier patterns.
"""

import re
import csv
from pathlib import Path
from typing import List, Optional
from openpyxl import load_workbook

from app.models.inventory import PIIFinding, DataAsset


PHONE_PATTERN = re.compile(r'(?:\+91[\-\s]?)?[6-9]\d{9}\b')
PAN_PATTERN = re.compile(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b')
AADHAAR_PATTERN = re.compile(r'\b[2-9]\d{3}[\s\-]?[0-9]{4}[\s\-]?[0-9]{4}\b')
EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
UPI_PATTERN = re.compile(r'\b[\w\.\-_]+@(okhdfcbank|oksbi|okaxis|okicici|paytm|ybl|apl|upi)\b', re.IGNORECASE)

CLINICAL_KEYWORDS = [
    'prescription', 'diagnosis', 'blood test', 'tsh', 'fasting sugar',
    'lipid profile', 'treatment', 'patient', 'clinic', 'hospital',
    'medical', 'health', 'symptom', 'report', 'test result'
]
CLINICAL_PATTERN = re.compile('|'.join(CLINICAL_KEYWORDS), re.IGNORECASE)

VERHOEFF_D = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
]
VERHOEFF_P = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
]


def check_verhoeff(digits_str: str) -> bool:
    """Validate Aadhaar number using Verhoeff algorithm checksum."""
    clean = re.sub(r'[\s\-]', '', digits_str)
    if not clean.isdigit() or len(clean) != 12:
        return False
    c = 0
    for i, digit in enumerate(reversed(clean)):
        c = VERHOEFF_D[c][VERHOEFF_P[i % 8][int(digit)]]
    return c == 0


def _mask_value(value: str, pii_type: str) -> str:
    """Mask PII value for safe display."""
    if pii_type == "phone":
        return f"***{value[-4:]}" if len(value) >= 4 else "***"
    if pii_type == "aadhaar":
        clean = re.sub(r'[\s\-]', '', value)
        return f"****-****-{clean[-4:]}" if len(clean) >= 4 else "****"
    if pii_type == "pan":
        return f"*****{value[-1:]}" if len(value) >= 1 else "*****"
    if pii_type == "email":
        parts = value.split('@')
        return f"{parts[0][:2]}***@{parts[1]}" if len(parts) == 2 else "***@***"
    if pii_type == "upi":
        return f"***@{value.split('@')[-1]}" if '@' in value else "***"
    return value[:2] + "***" if len(value) > 2 else "***"


def scan_text(text: str, line_number: Optional[int] = None) -> List[PIIFinding]:
    """Scan a block of text for PII patterns."""
    findings = []

    for m in PHONE_PATTERN.finditer(text):
        findings.append(PIIFinding(
            field_name="text_content",
            pii_type="phone",
            value=_mask_value(m.group(), "phone"),
            cell_coordinate=None,
            line_number=line_number,
            confidence=0.95,
        ))

    for m in PAN_PATTERN.finditer(text):
        pan_val = m.group()
        findings.append(PIIFinding(
            field_name="text_content",
            pii_type="pan",
            value=_mask_value(pan_val, "pan"),
            cell_coordinate=None,
            line_number=line_number,
            confidence=0.90,
        ))

    for m in AADHAAR_PATTERN.finditer(text):
        aadhaar_val = m.group()
        if check_verhoeff(aadhaar_val):
            findings.append(PIIFinding(
                field_name="text_content",
                pii_type="aadhaar",
                value=_mask_value(aadhaar_val, "aadhaar"),
                cell_coordinate=None,
                line_number=line_number,
                confidence=0.98,
            ))

    for m in EMAIL_PATTERN.finditer(text):
        findings.append(PIIFinding(
            field_name="text_content",
            pii_type="email",
            value=_mask_value(m.group(), "email"),
            cell_coordinate=None,
            line_number=line_number,
            confidence=0.92,
        ))

    for m in UPI_PATTERN.finditer(text):
        findings.append(PIIFinding(
            field_name="text_content",
            pii_type="upi",
            value=_mask_value(m.group(), "upi"),
            cell_coordinate=None,
            line_number=line_number,
            confidence=0.90,
        ))

    for m in CLINICAL_PATTERN.finditer(text):
        findings.append(PIIFinding(
            field_name="text_content",
            pii_type="clinical",
            value=m.group().lower(),
            cell_coordinate=None,
            line_number=line_number,
            confidence=0.70,
        ))

    return findings


def scan_whatsapp_chat(file_path: str) -> List[PIIFinding]:
    """Parse and scan a WhatsApp chat export (.txt) file."""
    findings = []
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            for idx, line in enumerate(f, 1):
                line_findings = scan_text(line, line_number=idx)
                findings.extend(line_findings)
    except Exception:
        pass
    return findings


def scan_csv_file(file_path: str) -> List[PIIFinding]:
    """Scan a CSV file for PII in all cells."""
    findings = []
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace', newline='') as f:
            reader = csv.DictReader(f)
            for row_idx, row in enumerate(reader, 2):
                for col_name, val in row.items():
                    if val is None:
                        continue
                    cell_findings = scan_text(str(val), line_number=row_idx)
                    for cf in cell_findings:
                        cf.field_name = col_name
                        cf.cell_coordinate = f"{col_name}{row_idx}"
                        findings.append(cf)
    except Exception:
        pass
    return findings


def scan_excel_file(file_path: str) -> List[PIIFinding]:
    """Scan an Excel file (.xlsx/.xls) for PII in all cells."""
    findings = []
    try:
        wb = load_workbook(file_path, data_only=False, read_only=True)
        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            for row in ws.iter_rows():
                for cell in row:
                    if cell.value is None:
                        continue
                    cell_findings = scan_text(str(cell.value), line_number=cell.row)
                    for cf in cell_findings:
                        cf.field_name = cell.coordinate
                        cf.cell_coordinate = f"{sheet_name}!{cell.coordinate}"
                        findings.append(cf)
        wb.close()
    except Exception:
        pass
    return findings


def scan_file(file_path: str) -> List[PIIFinding]:
    """Scan a single file based on its extension."""
    path = Path(file_path)
    ext = path.suffix.lower()

    if ext == '.txt':
        return scan_whatsapp_chat(file_path)
    elif ext == '.csv':
        return scan_csv_file(file_path)
    elif ext in ('.xlsx', '.xls'):
        return scan_excel_file(file_path)
    else:
        return []


def scan_directory(directory: str) -> List[DataAsset]:
    """Scan all supported files in a directory and return DataAsset list."""
    assets = []
    dir_path = Path(directory)
    if not dir_path.exists():
        return assets

    for file_path in dir_path.iterdir():
        if not file_path.is_file():
            continue
        ext = file_path.suffix.lower()
        if ext not in {'.xlsx', '.xls', '.csv', '.txt'}:
            continue

        findings = scan_file(str(file_path))
        if findings:
            pii_types = list(set(f.pii_type for f in findings))
            high_risk_types = {'aadhaar', 'pan'}
            risk_level = "high" if pii_types & high_risk_types else "medium"

            asset = DataAsset(
                file_path=str(file_path),
                file_name=file_path.name,
                sheet_name=None,
                column_name=None,
                pii_types=pii_types,
                record_count=len(findings),
                risk_level=risk_level,
                purpose="business_operations",
                consent_required=True,
            )
            assets.append(asset)

    return assets
