"""Application configuration for DPDPA for Small Business backend."""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data" / "sample_data"
UPLOAD_DIR = BASE_DIR / "data" / "uploads"
DB_PATH = BASE_DIR / "data" / "dpppa_local.db"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

SUPPORTED_EXTENSIONS = {".xlsx", ".xls", ".csv", ".txt", ".json"}

DPDP_ACT_YEAR = 2023
CGST_RETENTION_YEARS = 6
INCOME_TAX_RETENTION_YEARS = 8

SUPPORTED_LANGUAGES = ["en", "hi", "kn"]
LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi (हिन्दी)",
    "kn": "Kannada (ಕನ್ನಡ)",
}

HOST = "127.0.0.1"
PORT = 8000
DEBUG = True
