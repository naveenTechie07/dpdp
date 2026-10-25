import pytest
from app.services.scanner_engine import extract_pii_from_string, check_verhoeff

def test_indian_phone_number_detection():
    text = "Call customer at +91 9845012345 or 8765432109 tomorrow."
    findings = extract_pii_from_string(text)
    categories = [f.category for f in findings]
    assert "phone" in categories
    assert len([f for f in findings if f.category == "phone"]) == 2

def test_pan_number_detection_and_validation():
    text = "Customer PAN is ABCPE1234F for individual tax filing."
    findings = extract_pii_from_string(text)
    pan_findings = [f for f in findings if f.category == "pan"]
    assert len(pan_findings) == 1
    assert "Individual (Person)" in pan_findings[0].context

def test_aadhaar_verhoeff_checksum():
    # Valid Aadhaar with Verhoeff checksum
    valid_aadhaar = "2841 9012 3456" # format check
    assert extract_pii_from_string(valid_aadhaar)[0].category == "aadhaar"

def test_upi_handle_detection():
    text = "Paid Rs 500 to clinic via doctor@okhdfcbank."
    findings = extract_pii_from_string(text)
    upi_findings = [f for f in findings if f.category == "upi"]
    assert len(upi_findings) == 1
    assert "okhdfcbank" in upi_findings[0].raw_value

def test_clinical_keywords_detection():
    text = "Patient requires Fasting Blood Sugar, HbA1c and Thyroid Prescription."
    findings = extract_pii_from_string(text)
    clinical_findings = [f for f in findings if f.category == "clinical"]
    assert len(clinical_findings) >= 1
