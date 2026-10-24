# Indian National PII Tokenization Regex Catalog

- **PAN**: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$` (Masked: `XXXXX1234X`)
- **Aadhaar**: `^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$` (Masked: `XXXX-XXXX-1204`)
- **Voter ID (EPIC)**: `^[A-Z]{3}[0-9]{7}$` (Masked: `XXX1234567`)
- **Indian Passport**: `^[A-PR-WYa-pr-wy][1-9]\d\s?\d{4}[1-9]$`
- **Mobile Number**: `^(?:\+91|91|0)?[6-9]\d{9}$` (Masked: `+91-98****1204`)
