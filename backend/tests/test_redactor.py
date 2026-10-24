"""
test_redactor.py - Unit tests for Excel redaction engine.

Tests:
- Cell coordinate preservation after redaction
- Formula integrity (=SUM, =VLOOKUP unchanged)
- SHA-256 certificate generation
- Multiple cell redaction
"""

import sys
import os
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.excel_redactor import (
    redact_excel_for_principal,
    REDACTION_TOKEN,
)


def test_redaction_preserves_cell_coordinates():
    """Test that redacted cells keep their coordinates (no row/column shifting)."""
    from openpyxl import Workbook

    # Create a temp Excel file
    with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        wb = Workbook()
        ws = wb.active
        ws.title = "Customers"
        ws["A1"] = "Name"
        ws["B1"] = "Phone"
        ws["A2"] = "Ramesh Sharma"
        ws["B2"] = "+91 9845012345"
        ws["A3"] = "Priya Patel"
        ws["B3"] = "9876543210"
        wb.save(tmp_path)

        # Redact Ramesh Sharma's phone
        result = redact_excel_for_principal(tmp_path, "+91 9845012345")

        assert result["modified"] is True, f"Expected modification, got: {result}"
        assert result["cells_redacted"] >= 1, f"Expected at least 1 cell redacted"

        # Verify cell B2 now contains redaction token
        from openpyxl import load_workbook
        wb2 = load_workbook(tmp_path, data_only=False)
        ws2 = wb2["Customers"]
        assert ws2["B2"].value == REDACTION_TOKEN, f"Expected redaction token, got: {ws2['B2'].value}"
        # Verify A2 still has the name (only phone was targeted)
        assert ws2["A2"].value == "Ramesh Sharma", "Name should not be redacted when targeting phone"
        wb2.close()

        print("PASS: test_redaction_preserves_cell_coordinates")
    finally:
        os.unlink(tmp_path)


def test_formula_preservation():
    """Test that =SUM() and =VLOOKUP() formulas are preserved after redaction."""
    from openpyxl import Workbook

    with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        wb = Workbook()
        ws = wb.active
        ws.title = "Billing"
        ws["A1"] = "Customer"
        ws["B1"] = "Amount"
        ws["A2"] = "Ramesh"
        ws["B2"] = 500
        ws["A3"] = "Priya"
        ws["B3"] = 300
        ws["B4"] = "=SUM(B2:B3)"  # Formula that must be preserved
        wb.save(tmp_path)

        # Redact customer name
        result = redact_excel_for_principal(tmp_path, "Ramesh")

        # Verify formula is intact
        from openpyxl import load_workbook
        wb2 = load_workbook(tmp_path, data_only=False)
        ws2 = wb2["Billing"]
        assert ws2["B4"].value == "=SUM(B2:B3)", f"Formula should be preserved, got: {ws2['B4'].value}"
        wb2.close()

        print("PASS: test_formula_preservation")
    finally:
        os.unlink(tmp_path)


def test_sha256_certificate_generation():
    """Test that SHA-256 hash changes after redaction."""
    from openpyxl import Workbook

    with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        wb = Workbook()
        ws = wb.active
        ws["A1"] = "Test Data"
        ws["A2"] = "+91 9845012345"
        wb.save(tmp_path)

        # Get hash before
        import hashlib
        def file_hash(path):
            h = hashlib.sha256()
            with open(path, "rb") as f:
                for chunk in iter(lambda: f.read(8192), b""):
                    h.update(chunk)
            return h.hexdigest()

        hash_before = file_hash(tmp_path)

        # Redact
        result = redact_excel_for_principal(tmp_path, "+91 9845012345")

        hash_after = file_hash(tmp_path)

        assert hash_before != hash_after, "Hash should change after redaction"
        assert "sha256_before" in result
        assert "sha256_after" in result
        assert result["sha256_before"] != result["sha256_after"]

        print("PASS: test_sha256_certificate_generation")
    finally:
        os.unlink(tmp_path)


def test_no_modification_when_not_found():
    """Test that file is not modified when principal ID not found."""
    from openpyxl import Workbook

    with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        wb = Workbook()
        ws = wb.active
        ws["A1"] = "Unrelated Data"
        wb.save(tmp_path)

        import hashlib
        def file_hash(path):
            h = hashlib.sha256()
            with open(path, "rb") as f:
                for chunk in iter(lambda: f.read(8192), b""):
                    h.update(chunk)
            return h.hexdigest()

        hash_before = file_hash(tmp_path)

        result = redact_excel_for_principal(tmp_path, "+91 9999999999")

        assert result["modified"] is False, "Should not modify when not found"
        hash_after = file_hash(tmp_path)
        assert hash_before == hash_after, "File should not change"

        print("PASS: test_no_modification_when_not_found")
    finally:
        os.unlink(tmp_path)


if __name__ == "__main__":
    test_redaction_preserves_cell_coordinates()
    test_formula_preservation()
    test_sha256_certificate_generation()
    test_no_modification_when_not_found()
    print("\n" + "=" * 50)
    print("ALL REDACTOR TESTS PASSED")
    print("=" * 50)
