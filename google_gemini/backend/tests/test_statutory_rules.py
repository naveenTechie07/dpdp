import pytest
from datetime import date
from app.services.statutory_resolver import evaluate_invoice_retention

def test_invoice_older_than_6_years_eligible_for_full_erasure():
    # Invoice from 2017 (> 6 years old)
    res = evaluate_invoice_retention("2017-04-12")
    assert res["status"] == "APPROVED_FULL_ERASURE"
    assert res["is_locked"] is False
    assert "Full erasure permitted" in res["message"]

def test_invoice_younger_than_6_years_statutory_tax_lock():
    # Invoice from 2024 (< 6 years old)
    res = evaluate_invoice_retention("2024-02-14")
    assert res["status"] == "STATUTORY_RETENTION_LOCK"
    assert res["is_locked"] is True
    assert "Mandatory financial retention active" in res["message"]
    assert res["retention_deadline"] == "2030-12-31"

def test_invoice_date_with_slash_format():
    res = evaluate_invoice_retention("14/02/2024")
    assert res["status"] == "STATUTORY_RETENTION_LOCK"
    assert res["is_locked"] is True
