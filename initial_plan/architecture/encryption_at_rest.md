# Encryption at Rest
AES-256-GCM with Argon2id / PBKDF2 100k iterations.

Master Key encrypts DEK; DEK encrypts citizen PII fields.

Periodic key rotation re-encrypts DEK envelope.