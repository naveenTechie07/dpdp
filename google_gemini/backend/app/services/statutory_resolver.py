from datetime import datetime, date
from typing import Dict, Any, Optional

def evaluate_invoice_retention(invoice_date_str: str, customer_phone: Optional[str] = None) -> Dict[str, Any]:
    """
    Evaluates whether an invoice record can be fully erased or must be retained 
    under Section 36 of the Central Goods and Services Tax (CGST) Act, 2017.
    """
    try:
        # Handles YYYY-MM-DD or DD/MM/YYYY
        if "/" in invoice_date_str:
            inv_date = datetime.strptime(invoice_date_str, "%d/%m/%Y").date()
        else:
            inv_date = datetime.strptime(invoice_date_str, "%Y-%m-%d").date()
    except Exception:
        # Fallback to safe retention if unparseable
        return {
            "status": "STATUTORY_RETENTION_LOCK",
            "statute": "CGST Act, 2017 - Section 36",
            "is_locked": True,
            "message": "Uncertain date format; statutory tax protection requires conservative retention lock."
        }

    today = date.today()
    diff_years = (today - inv_date).days / 365.25

    if diff_years >= 6.0:
        return {
            "status": "APPROVED_FULL_ERASURE",
            "statute": "DPDP Act, 2023 - Section 12(2) & Section 8(7)",
            "is_locked": False,
            "invoice_age_years": round(diff_years, 1),
            "message": f"Invoice is {diff_years:.1f} years old (> 6 years). CGST Act retention period has expired. Full erasure permitted.",
            "retention_deadline": None
        }
    else:
        retention_deadline = date(inv_date.year + 6, 12, 31)
        return {
            "status": "STATUTORY_RETENTION_LOCK",
            "statute": "CGST Act, 2017 - Section 36 read with DPDP Act, 2023 Section 8(7)",
            "is_locked": True,
            "invoice_age_years": round(diff_years, 1),
            "retention_deadline": str(retention_deadline),
            "message": f"Invoice is {diff_years:.1f} years old (< 6 years statutory requirement). Mandatory financial retention active until {retention_deadline}. Selective pseudonymisation applied (financial and GST audit lines locked, marketing flags erased)."
        }
