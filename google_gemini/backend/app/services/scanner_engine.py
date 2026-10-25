import os
import re
import csv
from pathlib import Path
from typing import List, Dict, Any, Tuple
import openpyxl

from ..models.inventory import PIIEntity, CellLocation, FileScanResult, RoPAResponse

# -------------------------------------------------------------
# Indian PII Regular Expression Library
# -------------------------------------------------------------
PATTERNS = {
    "phone": re.compile(r'(?:\+91[\-\s]?)?[6-9]\d{9}\b'),
    "pan": re.compile(r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b'),
    "aadhaar_format": re.compile(r'\b[2-9]\d{3}[\s\-]?[0-9]{4}[\s\-]?[0-9]{4}\b'),
    "email": re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
    "upi": re.compile(r'\b[\w\.\-_]+@(okhdfcbank|oksbi|okaxis|okicici|paytm|ybl|apl|upi)\b', re.IGNORECASE),
    "clinical": re.compile(r'\b(prescription|blood\s*sugar|tsh|lipid|hba1c|thyroid|biopsy|ultrasound|diabetic|diagnosis|treatment)\b', re.IGNORECASE)
}

# Verhoeff tables for 12-digit Aadhaar checksum validation
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

def check_verhoeff(num_str: str) -> bool:
    clean = re.sub(r'[\s\-]', '', num_str)
    if not clean.isdigit() or len(clean) != 12:
        return False
    c = 0
    for i, digit in enumerate(reversed(clean)):
        c = VERHOEFF_D[c][VERHOEFF_P[i % 8][int(digit)]]
    return c == 0

def mask_pii(category: str, value: str) -> str:
    clean = value.strip()
    if category == "phone":
        return clean[-10:][:2] + "******" + clean[-10:][8:]
    elif category == "aadhaar":
        return "XXXX-XXXX-" + clean[-4:]
    elif category == "pan":
        return clean[:2] + "*****" + clean[-1:]
    elif category == "email":
        parts = clean.split("@")
        return parts[0][:2] + "***@" + parts[1] if len(parts) == 2 else clean
    return clean

def extract_pii_from_string(text: str) -> List[PIIEntity]:
    findings = []
    for cat, pattern in PATTERNS.items():
        matches = pattern.findall(text)
        for m in matches:
            val = m if isinstance(m, str) else m[0]
            if cat == "aadhaar_format":
                is_valid = check_verhoeff(val)
                findings.append(PIIEntity(
                    category="aadhaar",
                    value=mask_pii("aadhaar", val),
                    raw_value=val,
                    is_valid_checksum=is_valid,
                    context="12-digit Indian national identity number"
                ))
            elif cat == "pan":
                # 4th character validation: P=Individual, C=Company, F=Firm
                entity_type = "Individual (Person)" if val[3] == 'P' else "Corporate/Entity"
                findings.append(PIIEntity(
                    category="pan",
                    value=mask_pii("pan", val),
                    raw_value=val,
                    is_valid_checksum=True,
                    context=f"Income Tax PAN ({entity_type})"
                ))
            else:
                findings.append(PIIEntity(
                    category=cat,
                    value=mask_pii(cat, val),
                    raw_value=val,
                    is_valid_checksum=True,
                    context=f"Identified {cat}"
                ))
    return findings

def calculate_risk_level(pii_count: int, categories: List[str]) -> str:
    if "aadhaar" in categories or "clinical" in categories:
        return "CRITICAL"
    elif "pan" in categories or pii_count > 20:
        return "HIGH"
    elif pii_count > 0:
        return "MEDIUM"
    return "LOW"

# -------------------------------------------------------------
# File Scanners
# -------------------------------------------------------------
def scan_csv(file_path: Path) -> FileScanResult:
    total_records = 0
    pii_entities: List[PIIEntity] = []
    locations: List[CellLocation] = []
    categories = set()

    with open(file_path, mode="r", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        for row_idx, row in enumerate(reader, 1):
            total_records += 1
            for col_name, val in row.items():
                if not val:
                    continue
                found = extract_pii_from_string(str(val))
                if found:
                    for entity in found:
                        pii_entities.append(entity)
                        categories.add(entity.category)
                    locations.append(CellLocation(
                        row_index=row_idx,
                        column_name=col_name,
                        cell_coordinate=f"{col_name}:{row_idx}",
                        pii_types=[e.category for e in found]
                    ))

    return FileScanResult(
        filename=file_path.name,
        file_path=str(file_path.resolve()),
        file_type="csv",
        total_records=total_records,
        pii_count=len(pii_entities),
        risk_level=calculate_risk_level(len(pii_entities), list(categories)),
        detected_categories=list(categories),
        sample_entities=pii_entities[:15],
        locations=locations[:100],
        unencrypted=True
    )

def scan_excel(file_path: Path) -> FileScanResult:
    total_records = 0
    pii_entities: List[PIIEntity] = []
    locations: List[CellLocation] = []
    categories = set()

    wb = openpyxl.load_workbook(file_path, data_only=True)
    for sheet_name in wb.sheetnames:
        sheet = wb[sheet_name]
        for row_idx, row in enumerate(sheet.iter_rows(values_only=True), 1):
            if row_idx == 1:
                continue  # skip header
            total_records += 1
            for col_idx, val in enumerate(row, 1):
                if val is None:
                    continue
                found = extract_pii_from_string(str(val))
                if found:
                    for entity in found:
                        pii_entities.append(entity)
                        categories.add(entity.category)
                    col_letter = openpyxl.utils.get_column_letter(col_idx)
                    locations.append(CellLocation(
                        sheet_name=sheet_name,
                        row_index=row_idx,
                        column_name=f"Col {col_letter}",
                        cell_coordinate=f"{sheet_name}!{col_letter}{row_idx}",
                        pii_types=[e.category for e in found]
                    ))

    return FileScanResult(
        filename=file_path.name,
        file_path=str(file_path.resolve()),
        file_type="excel",
        total_records=total_records,
        pii_count=len(pii_entities),
        risk_level=calculate_risk_level(len(pii_entities), list(categories)),
        detected_categories=list(categories),
        sample_entities=pii_entities[:15],
        locations=locations[:100],
        unencrypted=True
    )

def scan_text(file_path: Path) -> FileScanResult:
    total_records = 0
    pii_entities: List[PIIEntity] = []
    locations: List[CellLocation] = []
    categories = set()

    with open(file_path, mode="r", encoding="utf-8", errors="ignore") as f:
        for line_idx, line in enumerate(f, 1):
            total_records += 1
            found = extract_pii_from_string(line)
            if found:
                for entity in found:
                    pii_entities.append(entity)
                    categories.add(entity.category)
                locations.append(CellLocation(
                    row_index=line_idx,
                    column_name="Chat Line",
                    cell_coordinate=f"Line:{line_idx}",
                    pii_types=[e.category for e in found]
                ))

    return FileScanResult(
        filename=file_path.name,
        file_path=str(file_path.resolve()),
        file_type="whatsapp" if "chat" in file_path.name.lower() else "text",
        total_records=total_records,
        pii_count=len(pii_entities),
        risk_level=calculate_risk_level(len(pii_entities), list(categories)),
        detected_categories=list(categories),
        sample_entities=pii_entities[:15],
        locations=locations[:100],
        unencrypted=True
    )

def scan_directory_or_files(target_paths: List[Path]) -> RoPAResponse:
    from datetime import datetime
    file_results: List[FileScanResult] = []
    cat_counts: Dict[str, int] = {}

    for path in target_paths:
        if not path.exists():
            continue
        if path.is_dir():
            for child in path.glob("*"):
                if child.suffix.lower() in [".xlsx", ".xls", ".csv", ".txt"]:
                    res = scan_single_file(child)
                    if res:
                        file_results.append(res)
        else:
            res = scan_single_file(path)
            if res:
                file_results.append(res)

    total_records = sum(f.total_records for f in file_results)
    total_pii = sum(f.pii_count for f in file_results)
    critical_count = sum(1 for f in file_results if f.risk_level == "CRITICAL")

    for f in file_results:
        for cat in f.detected_categories:
            cat_counts[cat] = cat_counts.get(cat, 0) + 1

    return RoPAResponse(
        total_files_scanned=len(file_results),
        total_records_analyzed=total_records,
        total_pii_detected=total_pii,
        critical_files_count=critical_count,
        files=file_results,
        category_breakdown=cat_counts,
        scan_timestamp=datetime.utcnow().isoformat() + "Z"
    )

def scan_single_file(file_path: Path) -> FileScanResult:
    ext = file_path.suffix.lower()
    if ext == ".csv":
        return scan_csv(file_path)
    elif ext in [".xlsx", ".xls"]:
        return scan_excel(file_path)
    elif ext in [".txt", ".log"]:
        return scan_text(file_path)
    return None
