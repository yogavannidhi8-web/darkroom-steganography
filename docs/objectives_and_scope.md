# Objectives and Project Scope

## Primary Objectives
1. **Develop an End-to-End Steganography System:** Implement a full-stack, reproducible system allowing users to securely conceal arbitrary plaintext messages or binary files into lossless carrier images (PNG).
2. **Implement Defense-in-Depth Security:** Combine modern memory-hard password-based key derivation (Argon2id) with authenticated symmetric encryption (AES-256-GCM) and cryptographic payload hashing (SHA-256).
3. **Achieve Deterministic Adaptive Embedding:** Design and validate an adaptive spatial feature extraction algorithm that guarantees identical embedding candidate maps between original cover images and modified stego images.
4. **Implement Key-Dependent Permutation:** Disperse payload bits across the carrier in a pseudorandom order derived deterministically from the user's passphrase.
5. **Real-Time Image Quality Analysis:** Measure and visualize objective degradation metrics (MSE, PSNR, SSIM, Shannon entropy delta, changed pixel ratio) without fabrication or simulated metrics.
6. **Empirical Benchmarking:** Provide automated benchmarking tools comparing the proposed adaptive scheme against baseline configurations across diverse carrier images and payload sizes.

## Scope and Boundaries
### In Scope
- Single-frame lossless carriers (PNG, 24-bit RGB).
- Payloads up to carrier capacity (text messages and general binary files).
- Spatial-domain adaptive LSB (0, 1, or 2 bits per channel).
- 64-byte deterministic bootstrap header stored in the first 512 RGB channel LSBs.
- Stateless REST API backend built in Python (FastAPI, NumPy, OpenCV, scikit-image, Pillow, cryptography).
- Production-grade editorial React/TypeScript frontend (Vite, Tailwind CSS, Recharts).
- Automated unit, integration, and round-trip verification tests.

### Out of Scope / Explicit Limitations
- Lossy carriers (e.g., JPEG): Lossy compression alters pixel values non-deterministically during quantization and DCT encoding, destroying LSB data.
- Geometric transformations: Resizing, cropping, rotation, or warping disrupts spatial pixel coordinate mapping.
- Transform-domain embedding (DCT, DWT): Reserved for future iterations.
- Multi-user accounts, persistent cloud databases, or tracking telemetry (the application is intentionally stateless and privacy-preserving).
