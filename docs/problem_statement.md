# Problem Statement

## Context and Background
Modern digital communication routinely involves the exchange of sensitive information across untrusted and adversarial networks. While conventional cryptography provides mathematical confidentiality by transforming intelligible plaintext into pseudorandom ciphertext, the transmission of ciphertext itself is inherently conspicuous. In surveillance environments or under automated packet inspection, the presence of encrypted data flags the communicants as subjects of interest.

Steganography addresses this vulnerability by concealing the very existence of the communication. By embedding secret data into ubiquitous digital media—such as digital images—steganography aims to achieve imperceptibility, preventing an eavesdropper from detecting anomalous artifacts.

## The Core Challenge: Naive LSB Weaknesses
Simple Least Significant Bit (LSB) substitution suffers from three critical vulnerabilities:

1. **Spatial Uniformity:** Naive LSB modifies bits uniformly across smooth regions (e.g., clear skies, flat walls) and textured regions alike. Human visual perception (HVS) and statistical steganalysis tools (such as RS analysis and Chi-square attacks) readily detect alterations in low-variance flat regions.
2. **Absence of Cryptographic Confidentiality:** If steganography is applied to plaintext, any party who discovers or suspects the embedding technique immediately gains unauthorized access to the payload.
3. **Absence of Integrity and Tamper Detection:** Standard steganographic techniques lack message authentication. If a carrier image is corrupted in transit or maliciously tampered with, decoding either crashes silently or outputs corrupted data without warning.
4. **Adaptive Map Inconsistency:** Adaptive steganographic schemes that compute image edge/gradient features from the cover image often fail upon extraction because embedding payload bits alters the pixel values, thereby altering the feature map computed at the receiver.

## Proposed Resolution
This capstone system integrates:
- **Argon2id password-based key derivation** with a unique 16-byte random salt.
- **AES-256-GCM authenticated encryption** providing confidentiality and cryptographic tamper detection.
- An **upper-6-bit stable analysis representation (`rgb & 0xFC`)** ensuring 100% deterministic feature map reconstruction between cover and stego images.
- An **adaptive spatial embedding mechanism** steering bits into high-variance, high-gradient, and edge-rich candidate slots (1 or 2 bits/channel) while completely bypassing smooth regions (0 bits).
- A **key-dependent Fisher-Yates slot permutation** using a ChaCha20 deterministic keystream.
- An **inner payload SHA-256 digest** providing end-to-end payload integrity verification.
- **Quantitative image quality assessment** evaluating MSE, PSNR, SSIM, Shannon entropy, and RGB histogram divergence.
