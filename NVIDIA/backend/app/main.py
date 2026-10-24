"""Main FastAPI application for DPDPA for Small Business.

Endpoints:
- POST /api/scan          - Scan uploaded files for PII, return RoPA
- GET  /api/notices       - List available languages
- POST /api/notices       - Generate Section 5 notice
- POST /api/consent       - Log consent record
- GET  /api/consent       - List all consent records
- POST /api/dsr/access    - Section 11 access report
- POST /api/dsr/erasure   - Section 12 erasure with tax conflict check
- POST /api/breach/report - Section 8(6) breach dossier
- GET  /api/health        - Health check
"""

import os
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import (
    UPLOAD_DIR, DATA_DIR, SUPPORTED_EXTENSIONS,
    SUPPORTED_LANGUAGES, LANGUAGE_NAMES, CGST_RETENTION_YEARS,
)
from app.core.security import compute_file_sha256, generate_audit_receipt
from app.data_store import db
from app.models.inventory import PIIFinding, DataAsset, RoPAResponse
from app.models.consent import NoticeRequest, NoticeResponse, ConsentRecord, ConsentLedgerResponse
from app.models.dsg_request import RightsRequest, AccessResponse, ErasureRequest, ErasureResponse
from app.models.breach import BreachIncident, BreachReport

from app.services.scanner_engine import scan_file, scan_directory
from app.services.whatsapp_parser import parse_whatsapp_chat
from app.services.excel_redactor import redact_excel_for_principal
from app.services.statutory_resolver import evaluate_erasure_request
from app.services.notice_generator import generate_notice
from app.services.breach_reporter import generate_breach_report

db.init_db()

app = FastAPI(
    title="DPDPA for Small Business",
    description="Offline-first DPDP Act 2023 compliance tool for Indian SMEs",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": "dpppa-small-business", "version": "1.0.0"}


@app.get("/api/notices/languages")
async def list_languages():
    """List supported notice languages."""
    return {
        "languages": [
            {"code": code, "name": LANGUAGE_NAMES[code]}
            for code in SUPPORTED_LANGUAGES
        ]
    }


@app.post("/api/scan", response_model=RoPAResponse)
async def scan_files(files: List[UploadFile] = File(...)):
    """Scan uploaded files for PII and return RoPA inventory."""
    scan_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().isoformat()
    data_assets = []
    total_findings = 0
    high_risk_count = 0

    for upload_file in files:
        ext = Path(upload_file.filename).suffix.lower()
        if ext not in SUPPORTED_EXTENSIONS:
            continue

        file_path = UPLOAD_DIR / f"{scan_id}_{upload_file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)

        findings = scan_file(str(file_path))

        if findings:
            pii_types = list(set(f.pii_type for f in findings))
            risk_level = "high" if any(t in ("aadhaar", "pan") for t in pii_types) else "medium"
            if risk_level == "high":
                high_risk_count += 1

            asset = DataAsset(
                file_path=str(file_path),
                file_name=upload_file.filename,
                sheet_name=None,
                column_name=None,
                pii_types=pii_types,
                record_count=len(findings),
                risk_level=risk_level,
                purpose="business_operations",
                consent_required=True,
            )
            data_assets.append(asset)
            total_findings += len(findings)

    compliance_score = max(0, 100 - (high_risk_count * 20) - (total_findings * 0.5))

    return RoPAResponse(
        scan_id=scan_id,
        timestamp=timestamp,
        files_scanned=len(files),
        total_pii_findings=total_findings,
        data_assets=data_assets,
        high_risk_files=high_risk_count,
        compliance_score=round(compliance_score, 1),
    )


@app.post("/api/notices", response_model=NoticeResponse)
async def create_notice(request: NoticeRequest):
    """Generate a Section 5 notice in the requested language."""
    notice_text = generate_notice(
        principal_name=request.principal_name,
        purpose=request.purpose,
        data_items=request.data_items,
        language=request.language,
        grievance_contact=request.grievance_contact,
        business_name=request.business_name,
    )
    return NoticeResponse(
        notice_text=notice_text,
        language=request.language,
        generated_at=datetime.now().isoformat(),
    )


@app.post("/api/consent")
async def log_consent(principal_id: str, purpose: str, language: str = "en", channel: str = "web"):
    """Log a consent record in the SQLite ledger."""
    record_id = db.log_consent(
        principal_id=principal_id,
        notice_version="v1.0",
        language=language,
        purpose=purpose,
        timestamp=datetime.now().isoformat(),
        channel=channel,
        status="active",
    )
    receipt = generate_audit_receipt("CONSENT_LOGGED", "consent_ledger", str(record_id), "", "system")
    db.log_audit_entry(
        action="CONSENT_LOGGED",
        target_file="consent_ledger",
        record_id=str(record_id),
        sha256_hash=receipt["receipt_hash"],
        operator="system",
    )
    return {"status": "success", "consent_id": record_id}


@app.get("/api/consent", response_model=ConsentLedgerResponse)
async def list_consents():
    """List all consent records."""
    records = db.get_all_consents()
    consent_records = [
        ConsentRecord(
            id=r["id"],
            principal_id=r["principal_id"],
            notice_version=r["notice_version"],
            language=r["language"],
            purpose=r["purpose"],
            timestamp=r["timestamp"],
            channel=r["channel"],
            status=r["status"],
            created_at=r["created_at"],
        )
        for r in records
    ]
    total_active = sum(1 for r in consent_records if r.status == "active")
    total_withdrawn = sum(1 for r in consent_records if r.status == "withdrawn")
    return ConsentLedgerResponse(
        records=consent_records,
        total_active=total_active,
        total_withdrawn=total_withdrawn,
    )


@app.post("/api/consent/withdraw/{principal_id}")
async def withdraw_consent_endpoint(principal_id: str):
    """Withdraw consent for a principal."""
    success = db.withdraw_consent(principal_id)
    if not success:
        raise HTTPException(status_code=404, detail="No active consent found for principal")
    return {"status": "withdrawn", "principal_id": principal_id}


@app.post("/api/dsr/access", response_model=AccessResponse)
async def dsr_access(request: RightsRequest):
    """Section 11: Generate access summary for a data principal."""
    data_points = []
    processors = []
    upload_dir = Path(UPLOAD_DIR)
    if upload_dir.exists():
        for file_path in upload_dir.iterdir():
            findings = scan_file(str(file_path))
            for f in findings:
                if request.principal_id in f.value:
                    data_points.append(DataPoint(
                        file_path=str(file_path),
                        field_name=f.field_name,
                        value=f.value,
                        pii_type=f.pii_type,
                    ))

    for file_path in upload_dir.iterdir() if upload_dir.exists() else []:
        fname = file_path.name.lower()
        if "billing" in fname or "invoice" in fname:
            processors.append("Billing Software")
        if "courier" in fname or "delivery" in fname:
            processors.append("Logistics Partner")
        if "google" in fname or "form" in fname:
            processors.append("Google Workspace")

    if not processors:
        processors = ["Internal Systems"]

    return AccessResponse(
        principal_id=request.principal_id,
        total_data_points=len(data_points),
        data_points=data_points,
        processors=list(set(processors)),
        consent_id=None,
        generated_at=datetime.now().isoformat(),
    )


@app.post("/api/dsr/erasure", response_model=ErasureResponse)
async def dsr_erasure(request: ErasureRequest):
    """Section 12: Execute erasure with CGST 6-year retention conflict check."""
    files_modified = []
    financial_retained = False
    sha256_cert = None
    retention_until = None
    messages = []

    for inv_date_str in request.invoice_dates:
        eval_result = evaluate_erasure_request(request.principal_id, inv_date_str)
        if eval_result["status"] == "STATUTORY_RETENTION_LOCK":
            financial_retained = True
            retention_until = eval_result.get("retention_until")
            messages.append(eval_result["message"])
        else:
            messages.append(eval_result["message"])

    upload_dir = Path(UPLOAD_DIR)
    if upload_dir.exists():
        for file_path in upload_dir.iterdir():
            if file_path.suffix.lower() in (".xlsx", ".xls", ".csv"):
                try:
                    result = redact_excel_for_principal(str(file_path), request.principal_id)
                    if result.get("modified"):
                        files_modified.append(str(file_path))
                        sha256_cert = compute_file_sha256(file_path)
                except Exception:
                    continue

    if financial_retained:
        status = "STATUTORY_RETENTION_LOCK"
        statute = "DPDP Act Sec 8(7) read with CGST Act Sec 36"
        message = "; ".join(messages)
    elif files_modified:
        status = "APPROVED_FULL_ERASURE"
        statute = "DPDP Act, 2023 - Section 12(2) & Section 8(7)"
        message = "Full erasure completed. All personal data redacted."
        sha256_cert = compute_file_sha256(Path(files_modified[0])) if files_modified else None
    else:
        status = "PARTIAL_ERASURE"
        statute = "DPDP Act, 2023 - Section 12(2)"
        message = "No matching files found for erasure."

    receipt = generate_audit_receipt(
        action="ERASURE_EXECUTED",
        target_file=",".join(files_modified) if files_modified else "none",
        record_id=request.principal_id,
        sha256_hash=sha256_cert or "",
        operator="system",
    )
    db.log_audit_entry(
        action="ERASURE_EXECUTED",
        target_file=",".join(files_modified) if files_modified else "none",
        record_id=request.principal_id,
        sha256_hash=receipt["receipt_hash"],
        operator="system",
    )

    return ErasureResponse(
        principal_id=request.principal_id,
        status=status,
        statute=statute,
        message=message,
        retention_until=retention_until,
        sha256_certificate=sha256_cert,
        files_modified=files_modified,
        financial_records_retained=financial_retained,
    )


@app.post("/api/breach/report", response_model=BreachReport)
async def breach_report(incident: BreachIncident):
    """Section 8(6): Generate DPBI breach notification dossier."""
    report = generate_breach_report(incident)
    return report
