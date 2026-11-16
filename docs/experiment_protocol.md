# Experiment Protocol and Empirical Findings

## Test Dataset
Six diverse synthetic carriers ($512 \times 512$ pixels, 24-bit RGB) were generated using `scripts/generate_samples.py` to represent distinct photographic and structural domains:
1. `carrier_01_smooth_studio.png`: Smooth studio background with subtle gradient (low-texture stress test).
2. `carrier_02_geometric_arch.png`: Architectural geometric structures with high-contrast sharp edges.
3. `carrier_03_natural_texture.png`: Foliage-like Perlin noise natural texture (high-frequency noise).
4. `carrier_04_smooth_gradient.png`: Multi-axis continuous color gradient.
5. `carrier_05_portrait_subject.png`: Composite subject combining smooth skin tones with high-texture hair strokes.
6. `carrier_06_dense_pattern.png`: High-frequency checkerboard and concentric circular patterns.

---

## Experimental Matrix
- **Payload Sizes:** 128 Bytes, 512 Bytes, 1,024 Bytes, 2,048 Bytes.
- **Configurations:**
  - *Conservative Preset:* $T_{\text{low}}=0.30, T_{\text{high}}=0.60$
  - *Balanced Preset:* $T_{\text{low}}=0.25, T_{\text{high}}=0.55$
  - *High Capacity Preset:* $T_{\text{low}}=0.15, T_{\text{high}}=0.40$
- **Total Experimental Trials:** $6 \times 4 \times 3 = 72$ complete encode/decode round-trips.

---

## Key Experimental Findings
1. **Outstanding Imperceptibility:**
   - Across all 72 trials, PSNR consistently exceeded **62.8 dB** (far exceeding the standard 40 dB imperceptibility threshold).
   - Minimum measured PSNR was $62.84\text{ dB}$ (2048-byte payload on smooth studio background).
   - Maximum measured PSNR reached **$75.50\text{ dB}$** (128-byte payload on natural texture).
2. **Structural Similarity (SSIM):**
   - SSIM remained strictly **$\ge 0.9994$** across all carriers, with textured and architectural scenes maintaining SSIM $\ge 0.9999$.
3. **Round-Trip Integrity Rate:**
   - **$100\%$ success rate ($72/72$)** for AES-GCM authentication and SHA-256 payload digest verification.
4. **Capacity vs Distortion Trade-off:**
   - Increasing the payload from 128 B to 2048 B reduced PSNR by approximately $9\text{--}10\text{ dB}$, while remaining firmly within imperceptible bounds.
   - The *Conservative* configuration concentrated changes into fewer pixels with smaller channel distortion, whereas *High Capacity* accepted broader regional embedding.
