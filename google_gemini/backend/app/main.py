import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .core.config import UPLOAD_DIR, SAMPLE_DATA_DIR, DB_PATH
from .models.inventory import RoPAResponse
from .models.consent import NoticeTemplate, ConsentRecord, CreateConsentRequest
from .models.dsg_request import DSRSearchRequest, DSRAccessReport, DSRErasureRequest, DSRErasureResult
from .models.breach import BreachIncidentInput, BreachDossierResponse
from .services.scanner_engine import scan_directory_or_files, extract_pii_from_string
from .services.excel_redactor import execute_atomic_erasure
from .services.notice_generator import get_notice, get_all_notices
from .services.breach_reporter import generate_breach_dossier
from .data_store.db import init_db, get_all_consents, add_consent

# Initialize Database on Startup
init_db()

app = FastAPI(
    title="DPDPA for Small Business API",
    description="Offline-First Data Protection Compliance Engine for Informal Indian SME Systems (Srujana Tech Fest 2026 - LS-04)",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "DPDPA for Small Business Engine",
        "mode": "100% Offline-First Local Compute",
        "governing_law": "Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023)"
    }

# -------------------------------------------------------------
# Pillar 1: Data Discovery & RoPA (Record of Processing Activities)
# -------------------------------------------------------------
@app.post("/api/scan", response_model=RoPAResponse)
def scan_files():
    """Scans all sample and uploaded files for Indian PII."""
    target_dirs = [SAMPLE_DATA_DIR, UPLOAD_DIR]
    ropa = scan_directory_or_files(target_dirs)
    return ropa

@app.post("/api/upload")
async def upload_file_to_scan(file: UploadFile = File(...)):
    """Uploads a customer spreadsheet, billing CSV, or WhatsApp export to the local scanner."""
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": "File uploaded successfully to local storage", "filename": file.filename}

# -------------------------------------------------------------
# Pillar 2: Multilingual Notice & Consent Ledger
# -------------------------------------------------------------
@app.get("/api/notices", response_model=List[NoticeTemplate])
def list_notices():
    """Returns statutory Section 5 notices in English, Hindi, and Kannada."""
    return get_all_notices()

@app.get("/api/notices/{lang}", response_model=NoticeTemplate)
def get_single_notice(lang: str):
    return get_notice(lang)

@app.get("/api/consents")
def list_consents():
    """Returns the affirmative consent ledger from SQLite."""
    return get_all_consents()

@app.post("/api/consents")
def create_consent(req: CreateConsentRequest):
    """Logs a new affirmative consent record."""
    inserted_id = add_consent(req.dict())
    return {"message": "Consent recorded successfully in SQLite ledger", "id": inserted_id}

# -------------------------------------------------------------
# Pillar 3: Data Principal Rights (DSR - Access & Erasure)
# -------------------------------------------------------------
@app.post("/api/dsr/search", response_model=DSRAccessReport)
def search_data_principal(req: DSRSearchRequest):
    """Executes Section 11 Right to Access search across all informal files."""
    query = req.query.strip()
    target_dirs = [SAMPLE_DATA_DIR, UPLOAD_DIR]
    ropa = scan_directory_or_files(target_dirs)
    
    matched_files = []
    held_categories = set()
    total_records = 0

    for f in ropa.files:
        # Check if query matches any entity or line
        file_path = Path(f.file_path)
        if file_path.exists():
            with open(file_path, "r", encoding="utf-8", errors="ignore") as file_handle:
                content = file_handle.read()
                if query.lower() in content.lower():
                    matched_files.append(f.filename)
                    held_categories.update(f.detected_categories)
                    total_records += 1

    return DSRAccessReport(
        principal_id=query,
        identified_records_count=total_records,
        matched_files=matched_files,
        held_categories=list(held_categories) or ["Contact Number", "Name"],
        third_party_processors_shared=["Local Logistics & Courier Partner", "Accounting Auditor"],
        lawful_basis="Consent (Sec 6) & Medical Service Provision (Sec 7)",
        generated_at=f"{Path().resolve()}"
    )

@app.post("/api/dsr/erasure", response_model=DSRErasureResult)
def execute_erasure(req: DSRErasureRequest):
    """
    Executes Section 12 Atomic Redaction across local Excel/CSV files.
    Automatically resolves the statutory conflict with CGST Act Section 36 (6-year retention).
    """
    all_files = list(SAMPLE_DATA_DIR.glob("*")) + list(UPLOAD_DIR.glob("*"))
    result = execute_atomic_erasure(all_files, req.principal_id)
    return DSRErasureResult(**result)

# -------------------------------------------------------------
# Pillar 4: Breach Preparedness & DPBI Notification
# -------------------------------------------------------------
@app.post("/api/breach/report", response_model=BreachDossierResponse)
def report_breach_incident(req: BreachIncidentInput):
    """Generates Section 8(6) DPBI statutory incident report pack and customer alerts."""
    return generate_breach_dossier(req)

# Mount React production build if available
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
