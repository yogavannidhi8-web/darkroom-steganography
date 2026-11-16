# Limitations and Future Work

## Current Limitations

1. **Lossless Carrier Dependency:**
   The algorithm relies on exact spatial pixel reconstruction. Lossy compression algorithms (such as JPEG or lossy WebP) discard high-frequency spatial components through Discrete Cosine Transform (DCT) quantization, destroying the LSBs and corrupting both the bootstrap header and payload bits.

2. **Geometric Transformations:**
   Geometric operations (cropping, scaling, horizontal/vertical flipping, or rotation) displace spatial pixel coordinates. Because candidate slot reconstruction depends on the exact 2D pixel grid coordinates, such transformations prevent extraction.

3. **Steganalysis Resistance:**
   While content-adaptive embedding significantly reduces detectability compared to sequential LSB, modern machine-learning-based steganalysers (e.g., spatial rich models and deep neural network steganalysers like XuNet or SRNet) may detect subtle statistical anomalies if embedding rates exceed 0.2 bits per pixel.

---

## Future Enhancements

1. **Transform-Domain Embedding (DWT / DCT):**
   Embedding within the mid-frequency Discrete Wavelet Transform (DWT) or Discrete Cosine Transform (DCT) coefficients to achieve robustness against JPEG recompression.

2. **Syndrome-Trellis Codes (STCs):**
   Integrating STCs to minimize additive distortion metrics (e.g., HILL or S-UNIWARD cost functions) instead of discrete multi-bit slot allocation.

3. **Error-Correcting Codes (ECC):**
   Incorporating Reed-Solomon or LDPC codes to recover payloads despite minor channel noise or single-pixel transmission glitches.

4. **Multi-Carrier Dispersion:**
   Sharding large payloads across multiple carrier images in an album, using Shamir's Secret Sharing scheme for threshold-based recovery.
