import sqlite3
from typing import List, Dict, Any, Optional
from datetime import datetime
from ..core.config import DB_PATH

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Consent Ledger table (Section 6 DPDP Act)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS consent_ledger (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        principal_id TEXT NOT NULL,
        principal_name TEXT,
        purpose TEXT NOT NULL,
        notice_version TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        timestamp TEXT NOT NULL,
        channel TEXT NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        expiry_date TEXT
    )
    """)
    
    # 2. Audit Trail (Section 8(5) & Section 12)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        target_file TEXT,
        principal_id TEXT,
        sha256_hash TEXT NOT NULL,
        details TEXT,
        timestamp TEXT NOT NULL
    )
    """)
    
    # 3. Insert default initial demo consent records if empty
    cursor.execute("SELECT COUNT(*) FROM consent_ledger")
    if cursor.fetchone()[0] == 0:
        now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
        INSERT INTO consent_ledger (principal_id, principal_name, purpose, notice_version, language, timestamp, channel, status, expiry_date)
        VALUES 
        ('9845112233', 'Ananya Rao', 'Diagnostic Test Appointment & Report Delivery', 'v1.0', 'en', ?, 'whatsapp_keyword', 'ACTIVE', '2025-10-24'),
        ('9741223344', 'Vikram Malhotra', 'Home Sample Collection & Billing', 'v1.0', 'kn', ?, 'web_form', 'ACTIVE', '2025-11-15'),
        ('9988776655', 'Deepa Nair', 'Marketing Broadcast & Health Packages', 'v1.0', 'en', ?, 'counter_slip', 'WITHDRAWN', '2024-09-10')
        """, (now, now, now))
        
    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def add_consent(record: dict) -> int:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO consent_ledger (principal_id, principal_name, purpose, notice_version, language, timestamp, channel, status, expiry_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        record.get("principal_id"),
        record.get("principal_name"),
        record.get("purpose"),
        record.get("notice_version", "v1.0"),
        record.get("language", "en"),
        record.get("timestamp", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")),
        record.get("channel", "whatsapp_keyword"),
        record.get("status", "ACTIVE"),
        record.get("expiry_date")
    ))
    conn.commit()
    inserted_id = cursor.lastrowid
    conn.close()
    return inserted_id

def log_audit(action: str, target_file: str, principal_id: str, sha256_hash: str, details: str = ""):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO audit_log (action, target_file, principal_id, sha256_hash, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (action, target_file, principal_id, sha256_hash, details, datetime.utcnow().isoformat() + "Z"))
    conn.commit()
    conn.close()

def get_all_consents() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM consent_ledger ORDER BY id DESC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows
