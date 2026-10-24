import hashlib
from datetime import datetime

def compute_sha256(content: str | bytes) -> str:
    """Computes SHA-256 hexadecimal hash for tamper-evident audit receipts."""
    if isinstance(content, str):
        content = content.encode("utf-8")
    return hashlib.sha256(content).hexdigest()

def generate_erasure_certificate_payload(
    principal_id: str,
    target_files: list[str],
    action_type: str,
    statutory_retention_info: dict
) -> dict:
    """Constructs a cryptographically grounded certificate of erasure."""
    timestamp = datetime.utcnow().isoformat() + "Z"
    raw_payload = f"{principal_id}|{','.join(target_files)}|{action_type}|{timestamp}"
    cert_hash = compute_sha256(raw_payload)
    
    return {
        "certificate_id": f"DPDP-CERT-{cert_hash[:12].upper()}",
        "principal_id": principal_id,
        "action_type": action_type,
        "timestamp_utc": timestamp,
        "target_files": target_files,
        "sha256_proof": cert_hash,
        "statutory_retention": statutory_retention_info,
        "governing_law": "Digital Personal Data Protection Act, 2023 (Sec 12 read with Sec 8(7))",
        "jurisdiction": "Republic of India"
    }
