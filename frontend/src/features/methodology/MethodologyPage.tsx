export function MethodologyPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="section-index">06</span>
          <span className="status-stamp status-stamp-neutral">METHODOLOGY</span>
        </div>
        <h1 className="font-display text-3xl mb-2">System Architecture &amp; Algorithm</h1>
        <p className="font-sans text-sm mb-4" style={{ color: 'var(--ink-soft)' }}>
          <strong>Academic project title:</strong> A Secure Adaptive Image Steganography System with
          Encryption, Integrity Verification and Image Quality Analysis
        </p>
        <div className="status-stamp status-stamp-neutral inline-flex">B.Tech Capstone Project</div>
      </div>

      {[
        {
          num: '01', title: 'Problem Statement',
          body: `Digital communication frequently requires private data transmission. While encryption protects
content, it creates visually detectable ciphertext that attracts suspicion. Steganography conceals
the existence of communication by hiding data within ordinary carrier files. This project integrates both:
content is encrypted before embedding, so an adversary who suspects steganography still
cannot access the payload without the correct passphrase.`
        },
        {
          num: '02', title: 'Cryptographic Design',
          body: `Key derivation uses Argon2id — a memory-hard function resistant to GPU/ASIC attacks.
A fresh 16-byte random salt is generated per encode operation. The 32-byte master key is split
into an encryption subkey and a position subkey using HKDF-SHA256 with distinct domain separation strings.

Payload encryption uses AES-256-GCM. The 96-bit nonce is fresh per operation. The serialized
bootstrap header serves as associated authenticated data (AAD), cryptographically binding the ciphertext
to the header. Any modification to the header or ciphertext causes immediate authentication failure.

A SHA-256 digest of the original payload bytes is stored inside the encrypted inner package.
After successful decryption, the digest is recomputed and compared using a constant-time
function. Only when both AES-GCM authentication and SHA-256 verification pass is the
recovered payload released.`
        },
        {
          num: '03', title: 'Adaptive Embedding Algorithm',
          body: `The adaptive feature map is derived from an upper-6-bit stable representation of the image:
  analysis_rgb = rgb & 0xFC

This clears the two LSBs of each channel. Since embedding modifies only 1 or 2 LSBs, the
same stable representation is obtained from the original cover image and from the stego image.
This is the key reproducibility invariant that makes extraction 100% deterministic and reliable.

The feature map combines:
  score = 0.50 × Sobel gradient + 0.30 × local variance + 0.20 × Canny edge indicator

Three bands of bit allocation are applied:
  score < 0.25 → 0 bits (skip — smooth, uniform regions where distortion is noticeable)
  0.25–0.55   → 1 LSB per RGB channel (medium texture)
  ≥ 0.55      → 2 LSBs per RGB channel (high texture and edge-rich regions)

The candidate slots are placed in a key-derived pseudo-random order using a ChaCha20 keystream
and Fisher-Yates shuffle. The permutation provides an additional extraction barrier.`
        },
        {
          num: '04', title: 'Bootstrap Header Format',
          body: `A fixed 64-byte header is embedded into the first 512 RGB channel LSBs (1 bit per channel).
It contains: magic identifier, format version, KDF ID, algorithm ID, 16-byte Argon2id salt,
12-byte AES-GCM nonce, encrypted package length, carrier dimensions, and a CRC32 for early
corruption detection. The header contains no plaintext secrets. It is included as AAD in
AES-GCM encryption, so any modification causes authentication failure.`
        },
        {
          num: '05', title: 'Image Quality Metrics',
          body: `MSE (Mean Squared Error): Average squared per-pixel difference. Lower = less distortion.

PSNR (Peak Signal-to-Noise Ratio): 10 × log₁₀(255² / MSE). Higher = less distortion.
Steganography systems typically target > 40 dB.

SSIM (Structural Similarity Index): Measures luminance, contrast and structure similarity.
Ranges from -1 to 1; 1.0 = identical. Complements MSE/PSNR by modelling human visual perception.

Additional metrics: Shannon entropy, RGB histogram comparison, changed-pixel count/ratio,
edge density, and capacity utilization.`
        },
        {
          num: '06', title: 'Limitations',
          body: `This is a spatial-domain lossless-carrier implementation. Extraction fails after:
• JPEG compression (lossy — modifies pixel values)
• Image resizing or cropping
• Color-space conversion
• Screenshot re-encoding

The adaptive map improves imperceptibility in tested conditions but does not guarantee
resistance to dedicated steganalysis tools. The system is a capstone research prototype,
not a certified military/government communication product.`
        },
        {
          num: '07', title: 'Contribution Statement',
          body: `This project implements an integrated adaptive image steganography framework combining
content-aware spatial embedding, password-derived authenticated encryption, integrity
verification and quantitative image-quality evaluation, with experimental comparison
against simpler LSB baselines.`
        },
      ].map(section => (
        <div key={section.num} className="mb-8">
          <div className="flex items-start gap-3 mb-3">
            <span className="section-index mt-1">{section.num}</span>
            <h2 className="font-display text-xl">{section.title}</h2>
          </div>
          <div className="work-surface">
            <pre className="font-sans text-sm whitespace-pre-wrap break-words" style={{ color: 'var(--ink-soft)', lineHeight: 1.7, fontFamily: 'inherit' }}>
              {section.body}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}
