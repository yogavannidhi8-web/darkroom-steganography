# Viva Preparation & Academic Defense Guide

## Core Questions and Model Answers

### Q1: What is the fundamental difference between cryptography and steganography?
**Answer:**
Cryptography conceals the *meaning* of a message by converting plaintext into ciphertext, but the transmission itself is obvious and may attract suspicion. Steganography conceals the *existence* of the communication by embedding the message within innocuous carrier data (e.g., an image). This capstone integrates both: payload data is encrypted first (AES-256-GCM), then embedded adaptively, ensuring confidentiality even if steganography is detected.

### Q2: Why is Argon2id chosen over PBKDF2 or standard SHA-256 for key derivation?
**Answer:**
PBKDF2 and simple hashing functions are compute-bound and can be parallelized cost-effectively on modern GPUs and custom ASIC rigs. Argon2id (RFC 9106) is a memory-hard function that requires significant RAM (configured for 64 MiB/19 MiB) alongside compute time. This makes hardware-accelerated dictionary attacks economically and computationally infeasible.

### Q3: Why is AES-256-GCM preferred over AES-CBC or AES-CTR?
**Answer:**
AES-GCM is an Authenticated Encryption with Associated Data (AEAD) mode. It simultaneously provides confidentiality and integrity verification through an authenticated Galois MAC tag. Modes like CBC or CTR require an independent HMAC construction (Encrypt-then-MAC); failing to implement this properly can leave the system vulnerable to padding-oracle attacks or bit-flipping tampering.

### Q4: How is the adaptive feature map made reproducible during extraction without storing it?
**Answer:**
This is the central innovation of our spatial design: both sender and receiver compute the feature map from the upper 6 bits of the RGB channels:
$$\mathbf{I}_{\text{analysis}} = \mathbf{I} \ \& \ \text{0xFC}$$
Because our embedding algorithm alters only the lowest 1 or 2 bits, the upper 6 bits remain completely unchanged between the original cover and the resulting stego image. Consequently, both parties deterministically compute the exact same Sobel gradients, local variance, Canny edges, and slot sequence.

### Q5: What information is stored in the 64-byte bootstrap header? Does it leak secrets?
**Answer:**
The bootstrap header contains public protocol metadata: format version, KDF ID, embedding algorithm ID, 16-byte random salt, 12-byte random nonce, encrypted package byte length, image dimensions, and a CRC32 checksum. It contains **no plaintext secrets, no passphrases, and no keys**. Furthermore, the entire header is included as Associated Authenticated Data (AAD) in the AES-GCM cipher, so tampering with any header field causes authentication failure.

### Q6: What does PSNR measure, and why is SSIM also necessary?
**Answer:**
PSNR measures pixel-level logarithmic signal-to-noise ratio derived from Mean Squared Error (MSE). While higher PSNR indicates lower numerical pixel distortion, it does not account for human visual perception (HVS). SSIM measures structural similarity, luminance, and contrast preservation. An image could have moderate PSNR in textured regions where the human eye detects no distortion at all; SSIM accurately reflects this perceptual preservation.

### Q7: Why does the system reject JPEG images as carriers?
**Answer:**
JPEG uses lossy discrete cosine transform (DCT) compression with quantization. Saving to JPEG rounds spatial pixel values, destroying the low-order bits where the bootstrap header and payload are stored. Our system enforces lossless carriers (PNG, BMP, TIFF) to guarantee mathematical bit fidelity.
