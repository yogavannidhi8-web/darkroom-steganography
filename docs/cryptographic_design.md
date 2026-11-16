# Cryptographic Design

## Threat Model and Security Goals
1. **Confidentiality:** Even if a steganalyst recovers the exact raw bitstream from the carrier, they cannot decipher the secret payload without knowing the passphrase.
2. **Integrity and Authentication:** Any modification to the stego image (tampering with carrier pixels or modifying the bootstrap header) must cause authenticated decryption to fail completely.
3. **No Partial Plaintext Leakage:** In accordance with the principles of authenticated encryption, decryption fails as an atomic operation—no partial plaintext is ever returned or written to disk if authentication fails.
4. **Protection Against Brute-Force Attacks:** Off-line dictionary and brute-force attacks against the user passphrase are mitigated via memory-hard Argon2id key derivation.

---

## 1. Key Derivation: Argon2id (RFC 9106)
- **Algorithm:** Argon2id (hybrid data-independent and data-dependent memory-hard function).
- **Salt:** 16 bytes generated with cryptographically secure system random (`os.urandom(16)`).
- **Memory Cost:** 65,536 KiB (64 MiB) for standard profile; 19,456 KiB (19 MiB) for demo profile.
- **Time Cost:** 3 passes (2 passes for demo).
- **Parallelism:** 2 threads (1 for demo).
- **Output:** 32 bytes (256-bit master key).

```python
master_key = hash_secret_raw(
    secret=password.encode("utf-8"),
    salt=salt,
    time_cost=time_cost,
    memory_cost=memory_cost,
    parallelism=parallelism,
    hash_len=32,
    type=Type.ID
)
```

---

## 2. Key Separation via HKDF-SHA256 (RFC 5869)
To prevent cross-protocol key reuse, the 32-byte master key is expanded into two distinct cryptographic keys using HKDF-Expand with separate domain-separation `info` strings:

$$\mathbf{K}_{\text{enc}} = \text{HKDF-Expand}(\mathbf{K}_{\text{master}}, \text{"darkroom-steganography-encryption-v1"}, 32)$$
$$\mathbf{K}_{\text{pos}} = \text{HKDF-Expand}(\mathbf{K}_{\text{master}}, \text{"darkroom-steganography-position-v1"}, 32)$$

- $\mathbf{K}_{\text{enc}}$: 256-bit AES-GCM encryption key.
- $\mathbf{K}_{\text{pos}}$: 256-bit ChaCha20 key for deterministic slot permutation.

---

## 3. Authenticated Encryption: AES-256-GCM (NIST SP 800-38D)
- **Key Length:** 256 bits.
- **Nonce (IV):** 96 bits (12 bytes) cryptographically random, never reused under the same key.
- **Associated Authenticated Data (AAD):** The complete 64-byte binary bootstrap header.
- **Authentication Tag:** 128-bit (16-byte) Galois MAC tag appended to ciphertext.

Because the header is bound as AAD:
- An attacker cannot alter dimensions, KDF parameters, or payload length without triggering an `InvalidTag` exception.
- Wrong passwords derive an incorrect $\mathbf{K}_{\text{enc}}$, failing tag verification without revealing any plaintext.

---

## 4. End-to-End Payload Integrity: SHA-256 Digest
Before encryption, the sender computes:
$$\mathbf{D} = \text{SHA-256}(\text{original\_payload\_bytes})$$

This 32-byte digest is embedded inside the encrypted inner package. After successful AES-GCM decryption, the receiver recomputes the SHA-256 digest over the decrypted bytes and performs constant-time comparison (`hmac.compare_digest`).

Data is released to the user **only if both**:
1. AES-GCM authentication succeeds, **and**
2. The SHA-256 digest matches.
