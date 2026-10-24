"""
statutory_resolver.py - DPDP Act Section 8(7) vs CGST Act Section 36 conflict resolver.

Resolves the statutory conflict between:
- DPDP Act Section 8(7) & 12(2): Mandatory erasure upon consent withdrawal/purpose completion
- CGST Act Section 36: Mandatory invoice retention for 72 months (6 years)
- Income Tax Act Section 44: Books of account retention for 6-8 years

Logic:
- Invoice >= 6 years old: APPROVED_FULL_ERASURE (tax retention period lapsed)
- Invoice < 6 years old: STATUTORY_RETENTION_LOCK (preserve financial data, purge marketing tags)
"""

from datetime import date, datetime
from typing import Dict, Any, List


def evaluate_erasure_request(principal_id: str, invoice_date_str: str) -> Dict[str, Any]:
    """
    Evaluate whether an invoice can be erased or must be retained under CGST Section 36.
    
    Args:
        principal_id: The data principal's identifier (phone/email)
        invoice_date_str: Invoice date in YYYY-MM-DD format
        
    Returns:
        Dict with status, statute, message, and optionally retention_until
    """
    try:
        inv_date = datetime.strptime(invoice_date_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return {
            "status": "ERROR",
            "statute": "N/A",
            "message": f"Invalid invoice date format: {invoice_date_str}. Expected YYYY-MM-DD.",
        }

    today = date.today()
    diff_days = (today - inv_date).days
    diff_years = diff_days / 365.25

    # CGST Act Section 36: 72 months (6 years) from due date of annual return
    # Approximating as 6 years from invoice date for this prototype
    if diff_years >= 6.0:
        return {
            "status": "APPROVED_FULL_ERASURE",
            "statute": "DPDP Act, 2023 - Section 12(2) & Section 8(7)",
            "message": (
                f"Invoice is {diff_years:.1f} years old. Retention period under "
                f"CGST Act Section 36 has lapsed. Eligible for 100% full erasure."
            ),
            "retention_until": None,
            "financial_retained": False,
        }
    else:
        retention_expiry = date(inv_date.year + 6, 12, 31)
        return {
            "status": "STATUTORY_RETENTION_LOCK",
            "statute": "CGST Act, 2017 - Section 36 read with DPDP Act, 2023 Section 8(7)",
            "message": (
                f"Invoice is {diff_years:.1f} years old (< 6 yrs). Mandatory retention applies "
                f"until {retention_expiry}. Selective pseudonymisation applied: financial data "
                f"preserved for tax audit, marketing tags erased."
            ),
            "retention_until": str(retention_expiry),
            "financial_retained": True,
        }


def evaluate_batch_erasure(
    principal_id: str, invoice_dates: List[str]
) -> Dict[str, Any]:
    """
    Evaluate multiple invoices for a single erasure request.
    
    Returns consolidated result:
    - If ALL invoices >= 6 years: APPROVED_FULL_ERASURE
    - If ANY invoice < 6 years: STATUTORY_RETENTION_LOCK with earliest retention date
    """
    if not invoice_dates:
        return {
            "status": "NO_INVOICES",
            "statute": "DPDP Act, 2023 - Section 12(2)",
            "message": "No invoice dates provided. Proceeding with standard erasure.",
            "retention_until": None,
            "financial_retained": False,
            "details": [],
        }

    results = [evaluate_erasure_request(principal_id, d) for d in invoice_dates]

    any_lock = any(r["status"] == "STATUTORY_RETENTION_LOCK" for r in results)
    all_erasure = all(r["status"] == "APPROVED_FULL_ERASURE" for r in results)

    if any_lock:
        # Find the latest retention date
        retention_dates = [
            r["retention_until"] for r in results if r.get("retention_until")
        ]
        latest_retention = max(retention_dates) if retention_dates else None
        return {
            "status": "STATUTORY_RETENTION_LOCK",
            "statute": "CGST Act, 2017 - Section 36 read with DPDP Act, 2023 Section 8(7)",
            "message": (
                "Some invoices are under 6 years old and require mandatory tax retention. "
                "Financial records preserved; secondary data erased."
            ),
            "retention_until": latest_retention,
            "financial_retained": True,
            "details": results,
        }
    elif all_erasure:
        return {
            "status": "APPROVED_FULL_ERASURE",
            "statute": "DPDP Act, 2023 - Section 12(2) & Section 8(7)",
            "message": "All invoices have passed the 6-year retention period. Full erasure approved.",
            "retention_until": None,
            "financial_retained": False,
            "details": results,
        }
    else:
        return {
            "status": "MIXED",
            "statute": "Mixed statutory evaluation",
            "message": "Mixed results across invoices. Review individual details.",
            "retention_until": None,
            "financial_retained": False,
            "details": results,
        }
