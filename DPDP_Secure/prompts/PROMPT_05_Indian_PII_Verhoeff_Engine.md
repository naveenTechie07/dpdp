# PROMPT 05: Pillar 1 Backend — Deterministic Indian PII Engine & Verhoeff Aadhaar Validator
## Problem Statement LS-04: Personal Data in Informal Systems (Data Protection for Small Businesses)
### Application: DPDP_Secure | Srujana Tech Fest 2026

> **HOW TO USE:** Copy the entire code block below and paste directly into your terminal or chat as a `/goal` command. It is 100% self-contained, pre-configured for the existing `DPDP_Secure` codebase, and includes all necessary cybersecurity guardrails.

---

### DIRECT COPY-PASTE PROMPT:

```markdown
/goal
Build a deterministic, zero-hallucination Indian PII detection and validation engine in Node.js for `DPDP_Secure`. The engine must implement the mathematical Verhoeff Dihedral Group $D_5$ algorithm to eliminate false positives from random 12-digit barcodes, validate entity-aware PAN numbers, match Indian mobile and UPI handles, and flag clinical health data.

### Context & Existing Workspace:
- Workspace root: `N:\chnayka\DPDP_Secure`
- Target files: `src/services/verhoeffAlgorithm.js`, `src/services/indianPiiEngine.js`, `tests/piiEngine.test.js`.
- Brand Protection: Strictly use `DPDP_Secure`. Never use any deprecated or legacy brand names.

### Mandatory Requirements:

1. Cybersecurity & Algorithmic Guardrails:
   - **ReDoS Prevention:** All regular expressions must be bounded and atomic (`\b`, bounded quantifiers `{9}`, non-catastrophic backtracking) with input length bounds (`str.length <= 500`) to prevent Regular Expression Denial of Service on large informal text exports.
   - **Mandatory PII Masking:** All extracted values must have an automated masked equivalent (e.g. `XXXX-XXXX-2345`) to prevent accidental plaintext exposure in UI tables, logs, or API responses.
   - **Zero Cloud Dependence:** All regex matching and cryptographic checksum calculations must execute 100% locally in the Node.js process without calling external verification APIs.

2. Verhoeff Dihedral Group $D_5$ Algorithm (`src/services/verhoeffAlgorithm.js`):
   Implement the exact mathematical tables for the dihedral group $D_5$:
   ```javascript
   const d = [
     [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
     [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
     [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
     [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
     [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
     [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
     [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
     [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
     [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
     [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
   ];
   const p = [
     [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
     [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
     [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
     [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
     [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
     [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
     [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
     [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
   ];
   const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];
   ```
   - Function: `validateVerhoeff(str)`:
     - Normalizes input by stripping spaces and hyphens.
     - Rejects any input that is not purely digits or does not equal 12 characters.
     - Iterates through the reversed digits: `c = d[c][p[i % 8][digit]]`.
     - Returns `true` if final `c === 0`.

3. Indian PII Detection Rules (`src/services/indianPiiEngine.js`):
   Implement `scanTextForPii(text, contextMetadata = {})` returning an array of `{ type, rawValue, maskedValue, lineNumber, confidenceScore, sensitivity, legalBasis }`:
   1. **Aadhaar Number:**
      - Pattern: `\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b`
      - Exclude numbers starting with `0` or `1`.
      - **Condition:** Must strictly satisfy `validateVerhoeff(aadhaar)`. If it fails the checksum, discard it as a non-Aadhaar 12-digit number (barcode / order ID).
      - Sensitivity: `CRITICAL`.
   2. **Permanent Account Number (PAN):**
      - Pattern: `\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b`
      - **Entity-Type Condition:** Inspect the 4th character:
        - If `'P'`: Flag as `INDIVIDUAL_PAN` (Personal Data, Sensitivity: `HIGH`).
        - If `'C'`, `'F'`, `'H'`, `'T'`, `'A'`, `'B'`, `'L'`, `'J'`, `'G'`: Flag as `ENTITY_PAN` (Corporate / Non-Personal Data, Sensitivity: `LOW`).
   3. **Indian Mobile Series:**
      - Pattern: `\b(?:\+91[-\s]?|0)?[6-9]\d{9}\b`
      - Sensitivity: `MEDIUM`.
   4. **UPI Virtual Payment Addresses (VPA):**
      - Pattern: `\b[a-zA-Z0-9.\-_]{2,64}@(okhdfcbank|oksbi|okicici|okaxis|paytm|ybl|upi|axisbank|ibl|icici)\b`
      - Sensitivity: `HIGH`.
   5. **Clinical Health Lexicon:**
      - Pattern: `\b(Prescription|Diagnosis|Blood Sugar|Lipid Profile|HbA1c|Biopsy|Thyroid|TSH|Ultrasound|ECG|HIV|Chemotherapy|Oncology|Pathology|Urine Culture|Serum Creatinine|Hemoglobin)\b`
      - Sensitivity: `CRITICAL` (Sensitive health data under Section 2(t)).

4. Masking Utility:
   Implement `maskPii(value, type)`:
   - Aadhaar: `XXXX-XXXX-` + last 4 digits
   - PAN: `XXXXX` + middle digits masked + last digit (e.g. `XXXXX1234F`)
   - Phone: `+91 98XXXXXX` + last 2 digits
   - UPI: First 2 chars + `***@bank`

5. Comprehensive Automated Test Suite (`tests/piiEngine.test.js`):
   Write tests asserting:
   - Valid Aadhaar `3421 8901 2345` -> Passes Verhoeff, confidence `1.0`.
   - Invalid 12-digit barcode `1234 5678 9012` -> Fails Verhoeff, discarded.
   - Individual PAN `ABCDE1234F` -> Categorized as `INDIVIDUAL_PAN`.
   - Corporate PAN `ABCDE1234C` -> Categorized as `ENTITY_PAN`.
   - Mixed text line containing phone, Aadhaar, and health diagnosis -> All correctly extracted and masked.

6. Verification Steps:
   - Run `node tests/piiEngine.test.js`.
   - Verify all test assertions pass with zero failures.
```

---

## Technical Reference & File Mapping

| File Path | Purpose |
|---|---|
| `src/services/verhoeffAlgorithm.js` | Dihedral group $D_5$ multiplication, permutation, and inverse tables. |
| `src/services/indianPiiEngine.js` | Indian PII extractors, entity PAN classifier, health lexicon, and masking logic. |
| `tests/piiEngine.test.js` | Unit tests for Verhoeff math, PAN types, and Indian PII patterns. |
