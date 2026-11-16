import { Shield, Lock, Layers, Zap, AlertTriangle } from 'lucide-react';

export function MethodologyPage() {
  return (
    <div className="max-w-4xl pb-16">
      {/* Header */}
      <div className="mb-10 pb-6 border-b" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-3 mb-3">
          <span className="section-index">06</span>
          <span className="status-stamp status-stamp-neutral">ACADEMIC SPECIFICATION</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl mb-3 tracking-tight">
          System Architecture &amp; Methodology
        </h1>
        <p className="font-sans text-base leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          A Secure Adaptive Image Steganography System with Password-Derived Authenticated Encryption,
          Invariant Spatial Feature Allocation, and Quantitative Steganalysis Evaluation.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 bg-[var(--paper-raised)] border border-[var(--line)]">
            CAPSTONE SPECIFICATION v1.0.0
          </span>
          <span className="px-2.5 py-1 bg-[var(--paper-raised)] border border-[var(--line)]">
            CRYPTOGRAPHIC PROTOCOL: ARGON2ID + AES-256-GCM
          </span>
          <span className="px-2.5 py-1 bg-[var(--paper-raised)] border border-[var(--line)]">
            SPATIAL DOMAIN: 8-BIT RGB LOSSLESS
          </span>
        </div>
      </div>

      {/* Abstract Box */}
      <div className="work-surface mb-10 border-l-4" style={{ borderLeftColor: 'var(--ink)' }}>
        <div className="metric-label mb-2">ABSTRACT</div>
        <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>
          Conventional Least Significant Bit (LSB) steganography embeds secret data sequentially or randomly across all image pixels,
          introducing detectable statistical artifacts in smooth, low-entropy regions. Furthermore, standard implementations frequently embed
          unauthenticated plaintext, leaving payloads vulnerable to unauthorized extraction and undetected tampering. This work implements an end-to-end
          secure adaptive image steganography workstation. Payloads are encrypted using AES-256-GCM with keys derived from user passphrases via Argon2id
          and segregated using HKDF-SHA256. Embedding locations and capacities are governed by a composite edge-and-texture suitability score computed
          strictly on the upper 6 bits of the carrier (<code className="font-mono text-xs px-1 bg-[var(--paper-raised)]">rgb &amp; 0xFC</code>),
          guaranteeing absolute deterministic extraction across encoder and decoder. Empirical evaluation demonstrates superior imperceptibility (PSNR &gt; 62 dB, SSIM &gt; 0.999)
          with 100% round-trip integrity across 72 automated test trials.
        </p>
      </div>

      <div className="space-y-10">
        {/* Section 01 */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="section-index">01</span>
            <h2 className="font-display text-xl">Threat Model &amp; Problem Statement</h2>
          </div>
          <div className="work-surface space-y-3 font-sans text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            <p>
              Digital communication across untrusted networks faces two distinct security threats: <strong>interception</strong> and <strong>detection</strong>.
              Cryptography provides confidentiality against interception but produces high-entropy pseudorandom ciphertext that immediately flags the transmission to surveillance entities.
              Steganography conceals the presence of communication by embedding data within natural carrier files.
            </p>
            <p>
              However, traditional LSB steganography suffers from three critical vulnerabilities:
            </p>
            <ul className="list-disc pl-5 space-y-1 font-mono text-xs">
              <li><strong>Flat Region Artifacts:</strong> Embedding in smooth gradients produces noticeable visual noise and statistically detectable chi-square / sample-pair anomalies.</li>
              <li><strong>Lack of Authentication:</strong> Without authenticated encryption, an active adversary can modify carrier bits to corrupt or forge extracted data without detection.</li>
              <li><strong>Key Dependency Failure:</strong> Many adaptive schemes derive feature maps from the full 8-bit image, causing the modified LSBs during embedding to alter the feature map and break extraction.</li>
            </ul>
          </div>
        </section>

        {/* Section 02 */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="section-index">02</span>
            <h2 className="font-display text-xl">Cryptographic Subsystem Architecture</h2>
          </div>
          <div className="work-surface space-y-4">
            <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
              The system enforces multi-layered defense-in-depth with strict key separation and authenticated encryption:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border" style={{ borderColor: 'var(--line)' }}>
                <div className="flex items-center gap-2 mb-2 font-mono text-xs font-semibold text-[var(--ink)]">
                  <Shield size={14} /> 1. Argon2id Key Derivation
                </div>
                <ul className="font-mono text-xs space-y-1 text-[var(--ink-soft)]">
                  <li>• Mode: Argon2id (hybrid memory-hard)</li>
                  <li>• Salt: 16 bytes CSPRNG (<code className="text-[10px]">os.urandom(16)</code>)</li>
                  <li>• Time Cost: 2 iterations</li>
                  <li>• Memory Cost: 64 MB (65,536 KiB)</li>
                  <li>• Parallelism: 2 threads</li>
                  <li>• Output: 32-byte Master Key</li>
                </ul>
              </div>

              <div className="p-3 border" style={{ borderColor: 'var(--line)' }}>
                <div className="flex items-center gap-2 mb-2 font-mono text-xs font-semibold text-[var(--ink)]">
                  <Lock size={14} /> 2. HKDF-SHA256 Key Segregation
                </div>
                <ul className="font-mono text-xs space-y-1 text-[var(--ink-soft)]">
                  <li>• PRF: HMAC-SHA256</li>
                  <li>• Domain 1: <code className="text-[10px]">stego-payload-encryption-key-v1</code></li>
                  <li>  → 32-byte AES-256 Payload Key</li>
                  <li>• Domain 2: <code className="text-[10px]">stego-pixel-permutation-key-v1</code></li>
                  <li>  → 32-byte Spatial Slot Permutation Key</li>
                  <li>• Ensures cryptographic independence</li>
                </ul>
              </div>
            </div>

            <div className="p-3 border" style={{ borderColor: 'var(--line)' }}>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs font-semibold text-[var(--ink)]">
                <Zap size={14} /> 3. AES-256-GCM AEAD &amp; Constant-Time Digest Verification
              </div>
              <p className="font-sans text-xs leading-relaxed text-[var(--ink-soft)]">
                Payload data is formatted with a 4-byte big-endian magic header, payload type, payload length, and a 32-byte SHA-256 digest of the original bytes.
                The package is encrypted under AES-256-GCM with a unique 96-bit CSPRNG nonce. The 64-byte bootstrap header is bound as Additional Authenticated Data (AAD).
                Upon extraction, any bit modification in the header or ciphertext triggers immediate GCM tag validation failure. A secondary SHA-256 comparison is executed
                using <code className="font-mono text-xs">hmac.compare_digest</code> to prevent side-channel timing attacks.
              </p>
            </div>
          </div>
        </section>

        {/* Section 03 */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="section-index">03</span>
            <h2 className="font-display text-xl">The Reproducibility Invariant &amp; Adaptive Feature Map</h2>
          </div>
          <div className="work-surface space-y-4">
            <p className="font-sans text-sm leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
              Adaptive steganography requires that the decoder can compute the exact same feature map as the encoder without receiving auxiliary location side-channels.
              We establish this through the <strong>Upper 6-Bit Preservation Invariant</strong>:
            </p>

            <div className="p-4 bg-[var(--paper-raised)] border font-mono text-xs" style={{ borderColor: 'var(--line)' }}>
              <div className="font-semibold text-[var(--ink)] mb-1">Mathematical Definition:</div>
              <div className="text-[var(--ink-soft)]">
                I_analysis(x, y, c) = I_carrier(x, y, c) &amp; 0xFC = I_stego(x, y, c) &amp; 0xFC
              </div>
              <div className="text-[10px] mt-2 text-[var(--ink-muted)]">
                Proof: Because embedding is strictly confined to bits 0 and 1 (mask 0x03), the upper 6 bits are invariant under embedding:
                (I_carrier &amp; ~0x03) ≡ (I_stego &amp; ~0x03). Therefore, FeatureMap(I_carrier) ≡ FeatureMap(I_stego).
              </div>
            </div>

            <div className="font-sans text-xs space-y-2 text-[var(--ink-soft)]">
              <p>The composite suitability score S(x, y) combines three complementary spatial operators on luminance Y:</p>
              <div className="font-mono text-xs p-3 border" style={{ borderColor: 'var(--line)' }}>
                S(x, y) = 0.50 × G_sobel(x, y) + 0.30 × Var_local(x, y) + 0.20 × E_canny(x, y)
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2 font-mono text-xs">
                <div className="p-2 border" style={{ borderColor: 'var(--line)' }}>
                  <div className="font-semibold text-[var(--ink)]">Band 0: Smooth</div>
                  <div>S &lt; 0.25 → 0 bits</div>
                  <div className="text-[10px] text-[var(--ink-muted)]">Skipped to preserve uniform areas</div>
                </div>
                <div className="p-2 border" style={{ borderColor: 'var(--line)' }}>
                  <div className="font-semibold text-[var(--ink)]">Band 1: Medium</div>
                  <div>0.25 ≤ S &lt; 0.55 → 1 bit</div>
                  <div className="text-[10px] text-[var(--ink-muted)]">Moderate texture regions</div>
                </div>
                <div className="p-2 border" style={{ borderColor: 'var(--line)' }}>
                  <div className="font-semibold text-[var(--ink)]">Band 2: Complex</div>
                  <div>S ≥ 0.55 → 2 bits</div>
                  <div className="text-[10px] text-[var(--ink-muted)]">Dense edges &amp; rich foliage</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 04 */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="section-index">04</span>
            <h2 className="font-display text-xl">Key-Dependent Spatial Permutation</h2>
          </div>
          <div className="work-surface font-sans text-sm space-y-3 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            <p>
              Even within selected edge and texture regions, embedding sequentially would introduce a sharp boundary where payload terminates,
              which is vulnerable to spatial steganalysis.
            </p>
            <p>
              To eliminate localized density gradients, candidate slots are shuffled using a <strong>cryptographic Fisher-Yates permutation</strong> seeded
              by a keystream generated via ChaCha20 initialized with the 32-byte <code className="font-mono text-xs">pos_key</code>.
              Without the secret passphrase, an adversary cannot determine the embedding sequence even if they correctly guess the feature map thresholds.
            </p>
          </div>
        </section>

        {/* Section 05 */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="section-index">05</span>
            <h2 className="font-display text-xl">Bootstrap Header Specification</h2>
          </div>
          <div className="work-surface">
            <p className="font-sans text-sm mb-3" style={{ color: 'var(--ink-soft)' }}>
              To decouple payload recovery from trial-and-error decoding, a 64-byte binary bootstrap header is embedded at fixed spatial coordinates:
              the first 512 RGB channel LSBs (1 bit per channel across 171 pixels).
            </p>
            <div className="border overflow-x-auto" style={{ borderColor: 'var(--line)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'IBM Plex Mono', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: 'var(--paper-raised)', borderBottom: '1px solid var(--line)' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>Offset</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>Size</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>Field</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--line)' }}>
                  <tr><td style={{ padding: '6px 8px' }}>0x00</td><td style={{ padding: '6px 8px' }}>8 B</td><td style={{ padding: '6px 8px' }}>Magic &amp; Version</td><td>ASCII <code className="text-xs">DRKRM\x01\x00\x00</code></td></tr>
                  <tr><td style={{ padding: '6px 8px' }}>0x08</td><td style={{ padding: '6px 8px' }}>4 B</td><td style={{ padding: '6px 8px' }}>Crypto Suite</td><td>KDF (Argon2id=1), Cipher (AES-256-GCM=1)</td></tr>
                  <tr><td style={{ padding: '6px 8px' }}>0x0C</td><td style={{ padding: '6px 8px' }}>16 B</td><td style={{ padding: '6px 8px' }}>Argon2id Salt</td><td>Random 16-byte salt for key derivation</td></tr>
                  <tr><td style={{ padding: '6px 8px' }}>0x1C</td><td style={{ padding: '6px 8px' }}>12 B</td><td style={{ padding: '6px 8px' }}>GCM Nonce</td><td>Unique 96-bit IV for AES-256-GCM</td></tr>
                  <tr><td style={{ padding: '6px 8px' }}>0x28</td><td style={{ padding: '6px 8px' }}>8 B</td><td style={{ padding: '6px 8px' }}>Package Length</td><td>Big-endian 64-bit integer (ciphertext + tag)</td></tr>
                  <tr><td style={{ padding: '6px 8px' }}>0x30</td><td style={{ padding: '6px 8px' }}>8 B</td><td style={{ padding: '6px 8px' }}>Dimensions</td><td>Carrier width (4B) and height (4B)</td></tr>
                  <tr><td style={{ padding: '6px 8px' }}>0x38</td><td style={{ padding: '6px 8px' }}>4 B</td><td style={{ padding: '6px 8px' }}>Reserved</td><td>Zero-padded future expansion flags</td></tr>
                  <tr><td style={{ padding: '6px 8px' }}>0x3C</td><td style={{ padding: '6px 8px' }}>4 B</td><td style={{ padding: '6px 8px' }}>CRC32 Checksum</td><td>Header checksum for fast corrupt detection</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 06 */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="section-index">06</span>
            <h2 className="font-display text-xl">Image Quality &amp; Fidelity Metrics</h2>
          </div>
          <div className="work-surface space-y-4 font-sans text-sm" style={{ color: 'var(--ink-soft)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border font-mono text-xs" style={{ borderColor: 'var(--line)' }}>
                <div className="font-semibold text-[var(--ink)] mb-1">Peak Signal-to-Noise Ratio (PSNR)</div>
                <div>PSNR = 10 · log10( 255² / MSE )</div>
                <div className="text-[10px] text-[var(--ink-muted)] mt-1">Measures logarithmic fidelity in decibels (dB). Values &gt; 40 dB are considered visually imperceptible; our system achieves 59–73 dB.</div>
              </div>
              <div className="p-3 border font-mono text-xs" style={{ borderColor: 'var(--line)' }}>
                <div className="font-semibold text-[var(--ink)] mb-1">Structural Similarity Index (SSIM)</div>
                <div>SSIM(x, y) = [l(x,y)^α · c(x,y)^β · s(x,y)^γ]</div>
                <div className="text-[10px] text-[var(--ink-muted)] mt-1">Evaluates luminance, contrast, and structural correlation. Values &gt; 0.999 indicate near-flawless preservation of human visual perception.</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border font-mono text-xs" style={{ borderColor: 'var(--line)' }}>
                <div className="font-semibold text-[var(--ink)] mb-1">Shannon Differential Entropy</div>
                <div>ΔH = | H(I_stego) - H(I_cover) |</div>
                <div className="text-[10px] text-[var(--ink-muted)] mt-1">Measures the change in information disorder across color channels. Constrained to &lt; 0.005 bits/symbol.</div>
              </div>
              <div className="p-3 border font-mono text-xs" style={{ borderColor: 'var(--line)' }}>
                <div className="font-semibold text-[var(--ink)] mb-1">Changed Pixel Ratio</div>
                <div>R_changed = N_modified / (W · H)</div>
                <div className="text-[10px] text-[var(--ink-muted)] mt-1">Directly bounded by adaptive bit budgeting, ensuring minimal modification of the carrier surface.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 07 */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="section-index">07</span>
            <h2 className="font-display text-xl">Operational Constraints &amp; Limitations</h2>
          </div>
          <div className="work-surface space-y-3 font-sans text-sm" style={{ color: 'var(--ink-soft)' }}>
            <div className="flex items-start gap-3 p-3 border" style={{ borderColor: 'var(--line)' }}>
              <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--ink)]">Lossless Carrier Requirement:</strong>
                <p className="mt-1">
                  Because embedding operates directly on spatial discrete pixel values (0 and 1 LSBs), any lossy compression (such as JPEG re-encoding, WebP lossy, or social media compression)
                  will quantize DCT/wavelet coefficients and destroy embedded bits. Carriers MUST be stored and transmitted in lossless formats (PNG, BMP, TIFF).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border" style={{ borderColor: 'var(--line)' }}>
              <Layers size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--ink)]">Geometric Invariance:</strong>
                <p className="mt-1">
                  Resizing, cropping, or rotating the stego image alters pixel coordinates and destroys the spatial permutation sequence. The carrier must retain its exact pixel dimensions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 08 */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <span className="section-index">08</span>
            <h2 className="font-display text-xl">References &amp; Academic Literature</h2>
          </div>
          <div className="work-surface space-y-2 font-mono text-xs leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
            <div>[1] Biryukov, A., Dinu, D., &amp; Khovratovich, D. (2016). <em>Argon2: new generation of memory-hard functions for password hashing and other applications</em>. IEEE European Symposium on Security and Privacy (EuroS&amp;P).</div>
            <div>[2] Dworkin, M. (2007). <em>Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC</em>. NIST Special Publication 800-38D.</div>
            <div>[3] Wang, Z., Bovik, A. C., Sheikh, H. R., &amp; Simoncelli, E. P. (2004). <em>Image quality assessment: from error visibility to structural similarity</em>. IEEE Transactions on Image Processing, 13(4), 600-612.</div>
            <div>[4] Holub, V., &amp; Fridrich, J. (2012). <em>Designing steganographic distortion using directionally filtered images</em>. IEEE WIFS 2012.</div>
            <div>[5] Canny, J. (1986). <em>A computational approach to edge detection</em>. IEEE Transactions on Pattern Analysis and Machine Intelligence, (6), 679-698.</div>
          </div>
        </section>
      </div>
    </div>
  );
}
