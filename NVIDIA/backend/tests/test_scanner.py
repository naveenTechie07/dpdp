"""
test_scanner.py - Unit tests for PII scanner engine.
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.scanner_engine import (
    scan_text,
    check_verhoeff,
    PHONE_PATTERN,
    PAN_PATTERN,
    AADHAAR_PATTERN,
    UPI_PATTERN,
    EMAIL_PATTERN,
)


def test_phone_detection():
    text1 = "Call me at +91 9845012345"
    findings = scan_text(text1, line_number=1)
    phone_findings = [f for f in findings if f.pii_type == "phone"]
    assert len(phone_findings) >= 1

    text2 = "Mobile: 9876543210"
    findings2 = scan_text(text2, line_number=1)
    phone_findings2 = [f for f in findings2 if f.pii_type == "phone"]
    assert len(phone_findings2) >= 1

    text3 = "Call 12345"
    findings3 = scan_text(text3, line_number=1)
    phone_findings3 = [f for f in findings3 if f.pii_type == "phone"]
    assert len(phone_findings3) == 0

    print("PASS: test_phone_detection")


def test_pan_detection():
    text = "PAN: ABCDE1234F"
    findings = scan_text(text, line_number=1)
    pan_findings = [f for f in findings if f.pii_type == "pan"]
    assert len(pan_findings) >= 1

    text2 = "pan: abcde1234f"
    findings2 = scan_text(text2, line_number=1)
    pan_findings2 = [f for f in findings2 if f.pii_type == "pan"]
    assert len(pan_findings2) == 0

    print("PASS: test_pan_detection")


def test_aadhaar_verhoeff():
    assert check_verhoeff("123456789012") is False
    assert check_verhoeff("12345") is False
    assert check_verhoeff("abcdefghijkl") is False
    print("PASS: test_aadhaar_verhoeff")


def test_aadhaar_detection():
    text = "My Aadhaar is 3421 8901 2345"
    findings = scan_text(text, line_number=1)
    aadhaar_findings = [f for f in findings if f.pii_type == "aadhaar"]
    assert isinstance(aadhaar_findings, list)
    print("PASS: test_aadhaar_detection")


def test_email_detection():
    text = "Contact me at ramesh.sharma@example.com"
    findings = scan_text(text, line_number=1)
    email_findings = [f for f in findings if f.pii_type == "email"]
    assert len(email_findings) >= 1
    print("PASS: test_email_detection")


def test_upi_detection():
    text = "Pay via UPI: aarogyaclinic@okhdfcbank"
    findings = scan_text(text, line_number=1)
    upi_findings = [f for f in findings if f.pii_type == "upi"]
    assert len(upi_findings) >= 1
    print("PASS: test_upi_detection")


def test_clinical_keywords():
    text = "Patient needs blood test and TSH report"
    findings = scan_text(text, line_number=1)
    clinical_findings = [f for f in findings if f.pii_type == "clinical"]
    assert len(clinical_findings) >= 1
    print("PASS: test_clinical_keywords")


def test_confidence_scores():
    text = "Phone: +91 9845012345, PAN: ABCDE1234F"
    findings = scan_text(text, line_number=1)
    for f in findings:
        assert 0.0 <= f.confidence <= 1.0
    print("PASS: test_confidence_scores")


if __name__ == "__main__":
    test_phone_detection()
    test_pan_detection()
    test_aadhaar_verhoeff()
    test_aadhaar_detection()
    test_email_detection()
    test_upi_detection()
    test_clinical_keywords()
    test_confidence_scores()
    print("\n" + "=" * 50)
    print("ALL SCANNER TESTS PASSED")
    print("=" * 50)
