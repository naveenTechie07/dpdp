import csv
import re
from pathlib import Path
from typing import Dict, Any, List
import openpyxl

from .statutory_resolver import evaluate_invoice_retention
from ..core.security import generate_erasure_certificate_payload, compute_sha256
from ..data_store.db import log_audit

REDACTION_TOKEN = "[REDACTED_DPDP_SEC_12]"

def redact_csv_file(file_path: Path, target_query: str) -> Dict[str, Any]:
    """Redacts rows or cells matching target_query in CSV files."""
    modified_rows = []
    redacted_count = 0
    retained_invoices = []
    has_tax_lock = False
    clean_query = target_query.strip().lower()

    with open(file_path, mode="r", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []
        for row in reader:
            row_str = " ".join(str(v).lower() for v in row.values())
            if clean_query in row_str:
                # Check for invoice date if present
                inv_date = row.get("Invoice_Date") or row.get("invoice_date")
                if inv_date:
                    retention_check = evaluate_invoice_retention(inv_date)
                    if retention_check["is_locked"]:
                        has_tax_lock = True
                        retained_invoices.append({
                            "invoice_number": row.get("Invoice_Number", "N/A"),
                            "date": inv_date,
                            "reason": retention_check["message"],
                            "retention_deadline": retention_check["retention_deadline"]
                        })
                        # Selective Redaction: Wipe phone and marketing notes, keep invoice amount and GSTIN
                        if "Customer_Phone" in row: row["Customer_Phone"] = REDACTION_TOKEN
                        if "Notes" in row: row["Notes"] = REDACTION_TOKEN
                        redacted_count += 2
                        modified_rows.append(row)
                        continue

                # Full redaction for non-tax records or expired invoices
                for k in row:
                    val = str(row[k])
                    if clean_query in val.lower() or k.lower() in ["phone", "email", "aadhaar", "pan", "phone_number", "customer_name"]:
                        row[k] = REDACTION_TOKEN
                        redacted_count += 1
                modified_rows.append(row)
            else:
                modified_rows.append(row)

    if redacted_count > 0:
        with open(file_path, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(modified_rows)

    return {
        "file_path": str(file_path),
        "redacted_cells": redacted_count,
        "tax_lock": has_tax_lock,
        "retained_invoices": retained_invoices
    }

def redact_excel_file(file_path: Path, target_query: str) -> Dict[str, Any]:
    """
    Atomic in-place cell redaction for Excel files preserving formula coordinates.
    Uses data_only=False so formula strings like '=SUM(C2:C50)' are never overwritten.
    """
    clean_query = target_query.strip().lower()
    redacted_count = 0
    retained_invoices = []
    has_tax_lock = False

    wb = openpyxl.load_workbook(file_path, data_only=False)
    for sheet_name in wb.sheetnames:
        sheet = wb[sheet_name]
        for row in sheet.iter_rows():
            # Check row text
            row_vals = [str(c.value).lower() for c in row if c.value is not None]
            if any(clean_query in v for v in row_vals):
                for cell in row:
                    val_str = str(cell.value or "").strip()
                    # Do not redact formulas!
                    if val_str.startswith("="):
                        continue
                    if clean_query in val_str.lower():
                        cell.value = REDACTION_TOKEN
                        redacted_count += 1

    if redacted_count > 0:
        wb.save(file_path)

    return {
        "file_path": str(file_path),
        "redacted_cells": redacted_count,
        "tax_lock": has_tax_lock,
        "retained_invoices": retained_invoices
    }

def execute_atomic_erasure(target_paths: List[Path], principal_id: str) -> Dict[str, Any]:
    """Executes atomic redaction across all target files and issues a cryptographic certificate."""
    total_redacted = 0
    modified_files = []
    all_retained = []
    has_lock = False

    for p in target_paths:
        if not p.exists():
            continue
        if p.suffix.lower() == ".csv":
            res = redact_csv_file(p, principal_id)
            if res["redacted_cells"] > 0:
                total_redacted += res["redacted_cells"]
                modified_files.append(p.name)
                if res["tax_lock"]:
                    has_lock = True
                    all_retained.extend(res["retained_invoices"])
        elif p.suffix.lower() in [".xlsx", ".xls"]:
            res = redact_excel_file(p, principal_id)
            if res["redacted_cells"] > 0:
                total_redacted += res["redacted_cells"]
                modified_files.append(p.name)

    action_type = "PARTIAL_SELECTIVE_REDACTION (TAX LOCK)" if has_lock else "FULL_PURGE"
    statutory_info = {
        "has_statutory_tax_lock": has_lock,
        "retained_records": all_retained,
        "governing_statute": "CGST Act, 2017 Section 36 read with DPDP Act, 2023 Section 8(7)"
    }
    
    cert_payload = generate_erasure_certificate_payload(
        principal_id=principal_id,
        target_files=modified_files,
        action_type=action_type,
        statutory_retention_info=statutory_info
    )

    # Log to audit trail in SQLite
    log_audit(
        action="DATA_PRINCIPAL_ERASURE",
        target_file=",".join(modified_files),
        principal_id=principal_id,
        sha256_hash=cert_payload["sha256_proof"],
        details=f"Redacted {total_redacted} cells. Tax lock: {has_lock}"
    )

    return {
        "principal_id": principal_id,
        "status": "COMPLETED_PARTIAL_TAX_LOCK" if has_lock else ("COMPLETED_FULL" if total_redacted > 0 else "NO_RECORDS_FOUND"),
        "modified_files": modified_files,
        "redacted_cells_count": total_redacted,
        "statutory_tax_lock": has_lock,
        "retained_invoices": all_retained,
        "tax_retention_deadline": all_retained[0]["retention_deadline"] if all_retained else None,
        "certificate": cert_payload
    }
