# Testing and Validation

## Automated Test Suites

The test suite covers:
1. **Cryptographic Primitives:** Argon2id stability, salt uniqueness, nonce uniqueness, AES-256-GCM authenticated encryption round-trip, wrong password rejection, tampered ciphertext rejection, wrong AAD rejection, and constant-time comparison.
2. **Steganographic Core:** End-to-end text round-trip, binary file round-trip, wrong passphrase rejection, tampered pixel detection, stable analysis image identity test, capacity exhaustion check, and baseline quality metrics.

### Test Execution Command
```powershell
cd f:\crypto\backend
.\.venv\Scripts\python.exe -m pytest tests/ -v
```

### Test Results
```text
tests/test_crypto.py::test_derive_master_key_stable PASSED               [  5%]
tests/test_crypto.py::test_derive_master_key_different_salts PASSED      [ 10%]
tests/test_crypto.py::test_derive_master_key_different_passwords PASSED  [ 15%]
tests/test_crypto.py::test_derive_subkeys_different PASSED               [ 21%]
tests/test_crypto.py::test_aes_gcm_roundtrip PASSED                      [ 26%]
tests/test_crypto.py::test_aes_gcm_wrong_key PASSED                      [ 31%]
tests/test_crypto.py::test_aes_gcm_tampered_ciphertext PASSED            [ 36%]
tests/test_crypto.py::test_aes_gcm_wrong_aad PASSED                      [ 42%]
tests/test_crypto.py::test_nonce_uniqueness PASSED                       [ 47%]
tests/test_crypto.py::test_salt_uniqueness PASSED                        [ 52%]
tests/test_crypto.py::test_sha256 PASSED                                 [ 57%]
tests/test_crypto.py::test_constant_time_compare PASSED                  [ 63%]
tests/test_steganography.py::test_text_roundtrip PASSED                  [ 68%]
tests/test_steganography.py::test_file_roundtrip PASSED                  [ 73%]
tests/test_steganography.py::test_wrong_password_rejected PASSED         [ 78%]
tests/test_steganography.py::test_tampered_image_rejected PASSED         [ 84%]
tests/test_steganography.py::test_stable_analysis_map PASSED             [ 89%]
tests/test_steganography.py::test_insufficient_capacity_rejected PASSED  [ 94%]
tests/test_steganography.py::test_quality_metrics_identical_images PASSED [100%]

============================= 19 passed in 6.51s ==============================
```

## Security Validation Checks
| Security Check | Expected Behavior | Observed Result | Status |
|---|---|---|:---:|
| Correct Password | Full decryption & verification | Exact byte equality | PASS |
| Wrong Password | GCM authentication failure | Zero plaintext released | PASS |
| Modified Pixel | GCM authentication failure | Zero plaintext released | PASS |
| Modified Header | CRC32 / AAD failure | Reject before KDF/decryption | PASS |
| Corrupt Digest | SHA-256 integrity failure | Payload withheld | PASS |
| Oversized Payload | Reject before embedding | `INSUFFICIENT_CAPACITY` error | PASS |
| Lossy JPEG Carrier | Reject carrier | Clear lossless explanation | PASS |
