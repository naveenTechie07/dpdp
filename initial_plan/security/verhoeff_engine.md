# Indian Aadhaar Verhoeff Checksum & Masking Engine

## Algorithm Specification
The Verhoeff algorithm uses dihedral group D5 multiplication to validate the 12th checksum digit of an Indian Aadhaar number.

```python
# Verhoeff Multiplication Table (d) and Permutation Table (p)
# Ensures 100% detection of all single-digit errors and transposed adjacent digits.
```

## Mandatory Masking Rule
Only the last 4 digits of any Aadhaar number may be displayed or logged (`XXXX-XXXX-1204`).
