# STRIDE Threat Model for Offline SME Privacy Endpoints

## Threat Categories Analyzed
1. **Spoofing**: Impersonation of Data Principal during DSR request submission.
2. **Tampering**: Direct manipulation of local SQLite records by unauthorized staff.
3. **Repudiation**: Fiduciary denying consent revocation receipt issuance.
4. **Information Disclosure**: Memory scraping of decrypted customer PII on POS kiosks.
5. **Denial of Service**: Disk exhaustion via malformed audit event floods.
6. **Elevation of Privilege**: Cashier account accessing DPO breach declaration console.


## Tampering & Spoofing Safeguards
- All SQLite rows are cryptographically bound via SHA-256 forward-chaining.
- Direct row edits invalidate all subsequent `prev_block_hash` checks.
- Two-Factor OTP challenge for any modification or erasure of personal records.
