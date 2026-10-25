"""Application configuration for DPDPA for Small Business backend."""

import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data" / "sample_data"
UPLOAD_DIR = BASE_DIR / "data" / "uploads"
DB_PATH = BASE_DIR / "data" / "dpppa_local.db"

# Ensure directories exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Supported file extensions for scanning
SUPPORTED_EXTENSIONS = {".xlsx", ".xls", ".csv", ".txt", ".json"}

# Statutory constants
DPDP_ACT_YEAR = 2023
CGST_RETENTION_YEARS = 6
INCOME_TAX_RETENTION_YEARS = 8

# Supported notice languages (DPDP Act Section 5(3) - Eighth Schedule languages)
SUPPORTED_LANGUAGES = ["en", "hi", "kn"]
LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi (हिन्दी)",
    "kn": "Kannada (ಕನ್ನಡ)",
}

# Server settings
HOST = "127.0.0.1"
PORT = 8000
DEBUG = True
