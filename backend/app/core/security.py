"""Security utilities: SHA-256 hashing, certificate generation, tamper-evident receipts."""

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path


def compute_file_sha256(file_path: Path) -> str:
    """Compute SHA-256 digest of a file for audit/tamper-evidence."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256_hash.update(chunk)
    return sha256_hash.hexdigest()


def compute_string_sha256(data: str) -> str:
    """Compute SHA-256 digest of a string."""
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def generate_certificate_id() -> str:
    """Generate a unique certificate ID using timestamp + hash."""
    timestamp = datetime.now(timezone.utc).isoformat()
    return compute_string_sha256(timestamp)[:16].upper()


def generate_audit_receipt(
    action: str,
    target_file: str,
    record_id: str,
    sha256_hash: str,
    operator: str = "system",
) -> dict:
    """Generate a tamper-evident audit receipt."""
    receipt = {
        "certificate_id": generate_certificate_id(),
        "action": action,
        "target_file": target_file,
        "record_id": record_id,
        "sha256_hash": sha256_hash,
        "operator": operator,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "algorithm": "SHA-256",
    }
    receipt["receipt_hash"] = compute_string_sha256(json.dumps(receipt, sort_keys=True))
    return receipt


def verify_receipt_integrity(receipt: dict) -> bool:
    """Verify that a receipt's hash matches its contents."""
    receipt_copy = dict(receipt)
    stored_hash = receipt_copy.pop("receipt_hash", None)
    if not stored_hash:
        return False
    computed = compute_string_sha256(json.dumps(receipt_copy, sort_keys=True))
    return computed == stored_hash
