import pytest
import openpyxl
from pathlib import Path
from app.services.excel_redactor import redact_excel_file, REDACTION_TOKEN

def test_excel_atomic_redaction_preserves_formulas(tmp_path):
    # Create test workbook with numbers and a SUM formula
    test_file = tmp_path / "formula_test.xlsx"
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Billing"
    
    # Row 1 Header
    ws["A1"] = "Customer_Name"
    ws["B1"] = "Invoice_Amount"
    
    # Row 2 & 3 Data
    ws["A2"] = "Priya Sharma"
    ws["B2"] = 1500
    ws["A3"] = "Ramesh Kumar"
    ws["B3"] = 2500
    
    # Row 4 Formula
    ws["A4"] = "TOTAL"
    ws["B4"] = "=SUM(B2:B3)"
    
    wb.save(test_file)

    # Execute atomic redaction for "Priya Sharma"
    result = redact_excel_file(test_file, "Priya Sharma")
    assert result["redacted_cells"] == 1

    # Reload workbook with data_only=False to verify formula string
    wb_reloaded = openpyxl.load_workbook(test_file, data_only=False)
    ws_reloaded = wb_reloaded["Billing"]

    # Verify Priya Sharma was redacted
    assert ws_reloaded["A2"].value == REDACTION_TOKEN
    # Verify Ramesh Kumar was untouched
    assert ws_reloaded["A3"].value == "Ramesh Kumar"
    # CRITICAL CHECK: Verify =SUM(B2:B3) formula was NOT overwritten or corrupted!
    assert ws_reloaded["B4"].value == "=SUM(B2:B3)"
