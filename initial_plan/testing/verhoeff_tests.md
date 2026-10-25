# Verhoeff Algorithm Test Vectors

- Valid: `2984 5184 9205` -> Checksum PASS (0)
- Adjacent Transposition: `2894 5184 9205` -> Checksum FAIL
- Single Digit Error: `2984 5184 9204` -> Checksum FAIL
