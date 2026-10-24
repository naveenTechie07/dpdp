"""SQLite data store: consent ledger, audit log, schema initialization."""

import sqlite3
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.core.config import DB_PATH
from app.core.security import generate_audit_receipt


def get_connection() -> sqlite3.Connection:
    """Get a SQLite connection with row factory."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initialize SQLite schema for consent ledger and audit log."""
    conn = get_connection()
    cursor = conn.cursor()

    # Consent ledger table (Section 6 of DPDP Act)
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS consent_ledger (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            principal_id TEXT NOT NULL,
            notice_version TEXT NOT NULL,
            language TEXT NOT NULL DEFAULT 'en',
            purpose TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            channel TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT NOT NULL
        )
        """
    )

    # Audit log table for tamper-evident trail
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action TEXT NOT NULL,
            target_file TEXT NOT NULL,
            record_id TEXT NOT NULL,
            sha256_hash TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            operator TEXT NOT NULL DEFAULT 'system',
            receipt_hash TEXT NOT NULL
        )
        """
    )

    conn.commit()
    conn.close()


def log_consent(
    principal_id: str,
    notice_version: str,
    language: str,
    purpose: str,
    timestamp: str,
    channel: str,
    status: str = "active",
) -> int:
    """Insert a consent record into the ledger."""
    conn = get_connection()
    cursor = conn.cursor()
    now = __import__("datetime").datetime.now().isoformat()
    cursor.execute(
        """
        INSERT INTO consent_ledger
        (principal_id, notice_version, language, purpose, timestamp, channel, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (principal_id, notice_version, language, purpose, timestamp, channel, status, now),
    )
    conn.commit()
    record_id = cursor.lastrowid
    conn.close()
    return record_id


def get_all_consents() -> List[Dict[str, Any]]:
    """Retrieve all consent records."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM consent_ledger ORDER BY created_at DESC"
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def withdraw_consent(principal_id: str) -> bool:
    """Mark a consent record as withdrawn."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE consent_ledger SET status = 'withdrawn' WHERE principal_id = ? AND status = 'active'",
        (principal_id,),
    )
    conn.commit()
    changed = cursor.rowcount > 0
    conn.close()
    return changed


def log_audit_entry(
    action: str,
    target_file: str,
    record_id: str,
    sha256_hash: str,
    operator: str = "system",
) -> int:
    """Log an audit entry with tamper-evident receipt."""
    receipt = generate_audit_receipt(action, target_file, record_id, sha256_hash, operator)
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO audit_log (action, target_file, record_id, sha256_hash, timestamp, operator, receipt_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            receipt["action"],
            receipt["target_file"],
            receipt["record_id"],
            receipt["sha256_hash"],
            receipt["timestamp_utc"],
            receipt["operator"],
            receipt["receipt_hash"],
        ),
    )
    conn.commit()
    record_id_db = cursor.lastrowid
    conn.close()
    return record_id_db


def get_audit_log() -> List[Dict[str, Any]]:
    """Retrieve all audit log entries."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_log ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
