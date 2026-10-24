"""
test_redactor.py - Unit tests for Excel redaction engine.
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
    from openpyxl import Workbook

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

        result = redact_excel_for_principal(tmp_path, "+91 9845012345")

        assert result["modified"] is True
        assert result["cells_redacted"] >= 1

        from openpyxl import load_workbook
        wb2 = load_workbook(tmp_path, data_only=False)
        ws2 = wb2["Customers"]
        assert ws2["B2"].value == REDACTION_TOKEN
        assert ws2["A2"].value == "Ramesh Sharma"
        wb2.close()

        print("PASS: test_redaction_preserves_cell_coordinates")
    finally:
        os.unlink(tmp_path)


def test_formula_preservation():
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
        ws["B4"] = "=SUM(B2:B3)"
        wb.save(tmp_path)

        result = redact_excel_for_principal(tmp_path, "Ramesh")

        from openpyxl import load_workbook
        wb2 = load_workbook(tmp_path, data_only=False)
        ws2 = wb2["Billing"]
        assert ws2["B4"].value == "=SUM(B2:B3)"
        wb2.close()

        print("PASS: test_formula_preservation")
    finally:
        os.unlink(tmp_path)


def test_sha256_certificate_generation():
    from openpyxl import Workbook
    import hashlib

    with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        wb = Workbook()
        ws = wb.active
        ws["A1"] = "Test Data"
        ws["A2"] = "+91 9845012345"
        wb.save(tmp_path)

        def file_hash(path):
            h = hashlib.sha256()
            with open(path, "rb") as f:
                for chunk in iter(lambda: f.read(8192), b""):
                    h.update(chunk)
            return h.hexdigest()

        hash_before = file_hash(tmp_path)

        result = redact_excel_for_principal(tmp_path, "+91 9845012345")

        hash_after = file_hash(tmp_path)

        assert hash_before != hash_after
        assert "sha256_before" in result
        assert "sha256_after" in result
        assert result["sha256_before"] != result["sha256_after"]

        print("PASS: test_sha256_certificate_generation")
    finally:
        os.unlink(tmp_path)


def test_no_modification_when_not_found():
    from openpyxl import Workbook
    import hashlib

    with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        wb = Workbook()
        ws = wb.active
        ws["A1"] = "Unrelated Data"
        wb.save(tmp_path)

        def file_hash(path):
            h = hashlib.sha256()
            with open(path, "rb") as f:
                for chunk in iter(lambda: f.read(8192), b""):
                    h.update(chunk)
            return h.hexdigest()

        hash_before = file_hash(tmp_path)

        result = redact_excel_for_principal(tmp_path, "+91 9999999999")

        assert result["modified"] is False
        hash_after = file_hash(tmp_path)
        assert hash_before == hash_after

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
