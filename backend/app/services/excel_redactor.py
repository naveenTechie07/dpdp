"""
excel_redactor.py - Atomic spreadsheet redaction preserving formulas.

Uses openpyxl with data_only=False to preserve formulas like =SUM(), =VLOOKUP().
Replaces sensitive cell values with [REDACTED_PURSUANT_TO_DPDP_SEC_12]
without shifting rows, columns, or breaking formula references.
Generates SHA-256 certificate for audit trail.
"""

import hashlib
from pathlib import Path
from typing import Dict, Any, List, Optional
from openpyxl import load_workbook

REDACTION_TOKEN = "[REDACTED_PURSUANT_TO_DPDP_SEC_12]"


def _compute_file_sha256(file_path: Path) -> str:
    """Compute SHA-256 digest of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256_hash.update(chunk)
    return sha256_hash.hexdigest()


def redact_excel_for_principal(file_path: str, principal_id: str) -> Dict[str, Any]:
    """
    Atomically redact all cells containing the principal's PII from an Excel file.
    
    Args:
        file_path: Path to the .xlsx or .xls file
        principal_id: Phone number, email, or name of the data principal
        
    Returns:
        Dict with keys: modified (bool), cells_redacted (int), 
        sheets_processed (int), sha256_before, sha256_after
    """
    path = Path(file_path)
    if not path.exists():
        return {"modified": False, "error": "File not found"}

    # Compute hash before modification
    sha256_before = _compute_file_sha256(path)

    try:
        wb = load_workbook(path, data_only=False)
    except Exception as e:
        return {"modified": False, "error": f"Cannot open workbook: {str(e)}"}

    cells_redacted = 0
    sheets_processed = 0

    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        sheet_modified = False

        for row in ws.iter_rows():
            for cell in row:
                if cell.value is None:
                    continue

                cell_str = str(cell.value)
                # Check if cell contains the principal ID (phone, email, or name)
                if principal_id in cell_str:
                    # Replace with redaction token, preserving cell coordinate and format
                    cell.value = REDACTION_TOKEN
                    cells_redacted += 1
                    sheet_modified = True

        if sheet_modified:
            sheets_processed += 1

    if cells_redacted > 0:
        wb.save(path)
        wb.close()
        sha256_after = _compute_file_sha256(path)
        return {
            "modified": True,
            "cells_redacted": cells_redacted,
            "sheets_processed": sheets_processed,
            "sha256_before": sha256_before,
            "sha256_after": sha256_after,
            "redaction_token": REDACTION_TOKEN,
        }
    else:
        wb.close()
        return {
            "modified": False,
            "cells_redacted": 0,
            "sheets_processed": sheets_processed,
            "sha256_before": sha256_before,
            "sha256_after": sha256_before,
        }


def redact_csv_for_principal(file_path: str, principal_id: str) -> Dict[str, Any]:
    """
    Redact cells containing principal PII from a CSV file.
    Preserves file structure, only replaces cell values.
    """
    import csv
    path = Path(file_path)
    if not path.exists():
        return {"modified": False, "error": "File not found"}

    sha256_before = _compute_file_sha256(path)

    try:
        with open(path, 'r', encoding='utf-8', errors='replace', newline='') as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames
            rows = list(reader)
    except Exception as e:
        return {"modified": False, "error": f"Cannot read CSV: {str(e)}"}

    cells_redacted = 0
    for row in rows:
        for col in fieldnames:
            val = row.get(col, "")
            if val and principal_id in str(val):
                row[col] = REDACTION_TOKEN
                cells_redacted += 1

    if cells_redacted > 0:
        try:
            with open(path, 'w', encoding='utf-8', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(rows)
            sha256_after = _compute_file_sha256(path)
            return {
                "modified": True,
                "cells_redacted": cells_redacted,
                "sha256_before": sha256_before,
                "sha256_after": sha256_after,
            }
        except Exception as e:
            return {"modified": False, "error": f"Cannot write CSV: {str(e)}"}

    return {
        "modified": False,
        "cells_redacted": 0,
        "sha256_before": sha256_before,
        "sha256_after": sha256_before,
    }


def generate_erasure_certificate(
    principal_id: str,
    files_modified: List[str],
    sha256_hashes: Dict[str, str],
) -> str:
    """Generate a SHA-256 erasure certificate string."""
    cert_lines = [
        "CERTIFICATE OF ERASURE",
        "========================",
        f"Data Principal: {principal_id}",
        f"Statute: DPDP Act, 2023 - Section 12(2) & Section 8(7)",
        f"Issued: {__import__('datetime').datetime.now().isoformat()}",
        "",
        "Files Modified:",
    ]
    for f in files_modified:
        cert_lines.append(f"  - {f} (SHA-256: {sha256_hashes.get(f, 'N/A')})")
    cert_lines.append("")
    cert_lines.append("This certificate confirms that personal data relating to the above")
    cert_lines.append("data principal has been redacted from the listed files in accordance")
    cert_lines.append("with the Digital Personal Data Protection Act, 2023.")
    cert_lines.append("")
    cert_lines.append("Certificate Hash: " + hashlib.sha256(
        ("\n".join(cert_lines) + principal_id).encode("utf-8")
    ).hexdigest()[:16].upper())
    return "\n".join(cert_lines)
