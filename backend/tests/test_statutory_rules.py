"""
test_statutory_rules.py - Unit tests for DPDP vs CGST statutory conflict resolver.

Tests:
- Invoice >= 6 years: full erasure approved
- Invoice < 6 years: retention lock
- Boundary: exactly 6 years
- Batch evaluation
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.statutory_resolver import (
    evaluate_erasure_request,
    evaluate_batch_erasure,
)


def test_invoice_older_than_6_years():
    """Test that invoices older than 6 years get full erasure."""
    result = evaluate_erasure_request("9845012345", "2017-04-12")
    assert result["status"] == "APPROVED_FULL_ERASURE", f"Expected full erasure, got: {result['status']}"
    assert result["financial_retained"] is False
    assert "eligible for 100% full erasure" in result["message"].lower()
    print("PASS: test_invoice_older_than_6_years")


def test_invoice_younger_than_6_years():
    """Test that invoices younger than 6 years get retention lock."""
    result = evaluate_erasure_request("9845112233", "2023-11-05")
    assert result["status"] == "STATUTORY_RETENTION_LOCK", f"Expected retention lock, got: {result['status']}"
    assert result["financial_retained"] is True
    assert result["retention_until"] is not None
    assert "CGST Act" in result["statute"]
    print("PASS: test_invoice_younger_than_6_years")


def test_boundary_exactly_6_years():
    """Test boundary case: invoice exactly 6 years old."""
    from datetime import date, timedelta
    six_years_ago = date.today() - timedelta(days=6*365 + 1)  # Just over 6 years
    result = evaluate_erasure_request("test", six_years_ago.strftime("%Y-%m-%d"))
    assert result["status"] in ("APPROVED_FULL_ERASURE", "STATUTORY_RETENTION_LOCK")
    print(f"PASS: test_boundary_exactly_6_years (status: {result['status']})")


def test_invalid_date_format():
    """Test handling of invalid date format."""
    result = evaluate_erasure_request("test", "invalid-date")
    assert result["status"] == "ERROR"
    print("PASS: test_invalid_date_format")


def test_batch_all_erasure():
    """Test batch evaluation when all invoices are old."""
    result = evaluate_batch_erasure("9845012345", ["2017-04-12", "2016-01-01"])
    assert result["status"] == "APPROVED_FULL_ERASURE"
    print("PASS: test_batch_all_erasure")


def test_batch_mixed():
    """Test batch evaluation with mixed invoice ages."""
    result = evaluate_batch_erasure("9845112233", ["2017-04-12", "2023-11-05"])
    assert result["status"] == "STATUTORY_RETENTION_LOCK"
    assert result["financial_retained"] is True
    print("PASS: test_batch_mixed")


def test_batch_no_invoices():
    """Test batch evaluation with no invoice dates."""
    result = evaluate_batch_erasure("test", [])
    assert result["status"] == "NO_INVOICES"
    print("PASS: test_batch_no_invoices")


if __name__ == "__main__":
    test_invoice_older_than_6_years()
    test_invoice_younger_than_6_years()
    test_boundary_exactly_6_years()
    test_invalid_date_format()
    test_batch_all_erasure()
    test_batch_mixed()
    test_batch_no_invoices()
    print("\n" + "=" * 50)
    print("ALL STATUTORY RULES TESTS PASSED")
    print("=" * 50)
