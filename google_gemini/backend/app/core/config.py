import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "app" / "data_store"
SAMPLE_DATA_DIR = DATA_DIR / "sample_data"
UPLOAD_DIR = BASE_DIR / "app" / "data_store" / "uploads"
CERT_DIR = BASE_DIR / "app" / "data_store" / "certificates"
DB_PATH = DATA_DIR / "dpdpa_audit.db"

# Ensure directories exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
CERT_DIR.mkdir(parents=True, exist_ok=True)
SAMPLE_DATA_DIR.mkdir(parents=True, exist_ok=True)

SUPPORTED_EXTENSIONS = [".xlsx", ".xls", ".csv", ".txt"]
MAX_SCAN_ROWS = 50000

# DPDP Act Statutory Retentions (Months)
CGST_RETENTION_MONTHS = 72  # 6 Years under Section 36 of CGST Act, 2017
