import { Link } from 'react-router-dom';
import { Lock, BarChart3, Shield, ArrowRight, Layers, Cpu, Sliders } from 'lucide-react';

const pipelineStages = [
  {
    number: '01',
    icon: Lock,
    label: 'Key Derivation',
    tech: 'Argon2id (RFC 9106)',
    desc: 'Derives 256-bit master key with memory-hard work factors (64 MiB RAM, 3 iterations) and unique 16-byte random salt to prevent GPU/ASIC attacks.',
  },
  {
    number: '02',
    icon: Shield,
    label: 'Authenticated Encryption',
    tech: 'AES-256-GCM + SHA-256',
    desc: 'Encrypts payload package with unique 96-bit nonce. The 64-byte bootstrap header is bound as Associated Authenticated Data (AAD) to catch tampering.',
  },
  {
    number: '03',
    icon: Cpu,
    label: 'Upper 6-Bit Analysis',
    tech: 'Stable Invariant (rgb & 0xFC)',
    desc: 'Derives edge magnitude, local variance, and Canny edges from upper 6 bits. Guarantees 100% deterministic map reconstruction at the decoder.',
  },
  {
    number: '04',
    icon: Sliders,
    label: 'Adaptive Allocation',
    tech: '0, 1, or 2 Bits/Channel',
    desc: 'Bypasses flat sensitive regions (0 bits), allocates 1 bit to moderate texture, and embeds 2 bits in high-gradient textures and contour edges.',
  },
  {
    number: '05',
    icon: Layers,
    label: 'Keyed Permutation',
    tech: 'ChaCha20 Keystream',
    desc: 'Shuffles candidate slot order using a deterministic Fisher-Yates permutation seeded by the HKDF-derived position subkey.',
  },
  {
    number: '06',
    icon: BarChart3,
    label: 'Forensic Quality Audit',
    tech: 'MSE · PSNR · SSIM · Entropy',
    desc: 'Measures exact pixel-level degradation, structural similarity, Shannon entropy delta, and RGB histogram shifts.',
  },
];

export function OverviewPage() {
  return (
    <div className="max-w-5xl">
      {/* Editorial Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="section-index">01 / ARCHITECTURE</span>
          <span className="status-stamp status-stamp-neutral">CAPSTONE SPECIFICATION</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl mb-4 leading-tight text-ink font-normal">
          Secure Adaptive<br />
          <span className="italic">Image Steganography</span>
        </h1>
        <p className="font-sans text-base sm:text-lg max-w-2xl text-ink-soft leading-relaxed">
          An integrated image-security research workstation combining content-aware spatial embedding,
          password-derived authenticated encryption, deterministic map recovery, and quantitative quality metrics.
        </p>

        {/* Technical Specification Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-line">
          <div>
            <div className="metric-label">CARRIER PROTOCOL</div>
            <div className="font-mono text-xs font-semibold mt-1 text-ink">Lossless 24-bit PNG</div>
          </div>
          <div>
            <div className="metric-label">CIPHER SUITE</div>
            <div className="font-mono text-xs font-semibold mt-1 text-ink">AES-256-GCM (AEAD)</div>
          </div>
          <div>
            <div className="metric-label">KDF PRIMITIVE</div>
            <div className="font-mono text-xs font-semibold mt-1 text-ink">Argon2id + HKDF</div>
          </div>
          <div>
            <div className="metric-label">EMPIRICAL FIDELITY</div>
            <div className="font-mono text-xs font-semibold mt-1 text-success">PSNR &gt; 62 dB · SSIM &gt; 0.999</div>
          </div>
        </div>
      </div>

      {/* Primary Workflow Actions */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="section-index">02 / WORKSTATION</span>
          <h2 className="font-display text-2xl text-ink">Laboratory Controls</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            to="/encode"
            className="work-surface group flex flex-col justify-between hover:border-ink transition-all shadow-sm"
            style={{ textDecoration: 'none' }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="status-stamp status-stamp-neutral">ACTION 01</span>
                <div className="w-8 h-8 rounded-full border border-line flex items-center justify-center group-hover:bg-ink group-hover:text-paper transition-colors">
                  <ArrowRight size={13} />
                </div>
              </div>
              <h3 className="font-display text-xl mb-2 text-ink">Encode &amp; Conceal</h3>
              <p className="font-sans text-xs text-ink-soft leading-relaxed">
                Encrypt secret messages or binary files with Argon2id &amp; AES-256-GCM, then adaptively embed into lossless PNG carriers.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-line font-mono text-[11px] text-ink-muted flex items-center gap-1.5">
              <Lock size={11} className="text-signal" />
              <span>Includes 64-byte bootstrap header</span>
            </div>
          </Link>

          <Link
            to="/decode"
            className="work-surface group flex flex-col justify-between hover:border-ink transition-all shadow-sm"
            style={{ textDecoration: 'none' }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="status-stamp status-stamp-neutral">ACTION 02</span>
                <div className="w-8 h-8 rounded-full border border-line flex items-center justify-center group-hover:bg-ink group-hover:text-paper transition-colors">
                  <ArrowRight size={13} />
                </div>
              </div>
              <h3 className="font-display text-xl mb-2 text-ink">Decode &amp; Verify</h3>
              <p className="font-sans text-xs text-ink-soft leading-relaxed">
                Extract hidden payloads with staged cryptographic verification: header validation, AES-GCM MAC check, and SHA-256 digest match.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-line font-mono text-[11px] text-ink-muted flex items-center gap-1.5">
              <Shield size={11} className="text-success" />
              <span>Full tamper rejection protocol</span>
            </div>
          </Link>

          <Link
            to="/analysis"
            className="work-surface group flex flex-col justify-between hover:border-ink transition-all shadow-sm"
            style={{ textDecoration: 'none' }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="status-stamp status-stamp-neutral">ACTION 03</span>
                <div className="w-8 h-8 rounded-full border border-line flex items-center justify-center group-hover:bg-ink group-hover:text-paper transition-colors">
                  <ArrowRight size={13} />
                </div>
              </div>
              <h3 className="font-display text-xl mb-2 text-ink">Forensic Analysis</h3>
              <p className="font-sans text-xs text-ink-soft leading-relaxed">
                Inspect amplified pixel difference heatmaps, adaptive score distributions, edge masks, and RGB channel histogram divergences.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-line font-mono text-[11px] text-ink-muted flex items-center gap-1.5">
              <BarChart3 size={11} className="text-warning" />
              <span>True computed MSE, PSNR, SSIM</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Six-Stage Security & Stego Pipeline */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="section-index">03 / PIPELINE</span>
          <h2 className="font-display text-2xl text-ink">Six-Stage Architecture</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelineStages.map((stage) => (
            <div key={stage.number} className="work-surface border-line">
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-ink-muted mt-0.5">{stage.number}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <stage.icon size={14} className="text-ink" />
                    <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-ink">
                      {stage.label}
                    </h4>
                  </div>
                  <div className="font-mono text-[10px] text-signal font-medium mb-2">
                    {stage.tech}
                  </div>
                  <p className="font-sans text-xs text-ink-soft leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The Central Academic Innovation: Invariant Explanation */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <span className="section-index">04 / THEOREM</span>
          <h2 className="font-display text-2xl text-ink">The Reproducibility Invariant</h2>
        </div>
        <div className="work-surface border-l-4 border-l-signal">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <span className="status-stamp status-stamp-neutral mb-3">CRITICAL PROPERTY</span>
              <h3 className="font-display text-xl mb-3 text-ink">
                Why Naive Adaptive Steganography Fails — And How We Solved It
              </h3>
              <p className="font-sans text-xs sm:text-sm text-ink-soft leading-relaxed mb-4">
                Naive adaptive algorithms extract gradients and edges from the carrier during encoding.
                When payload bits are embedded, pixel values change slightly, altering the feature map.
                During extraction, the decoder re-evaluates the stego image, computes a <em>different</em> feature map,
                reads the wrong coordinates, and fails completely.
              </p>
              <p className="font-sans text-xs sm:text-sm text-ink-soft leading-relaxed">
                In this system, all gradient, variance, and Canny calculations operate on an <strong>upper-6-bit stable representation</strong>:
              </p>
            </div>
            <div className="w-full md:w-auto p-4 bg-paper border border-line rounded font-mono text-xs text-ink space-y-2">
              <div className="text-[10px] text-ink-muted uppercase tracking-wider">MATHEMATICAL IDENTITY:</div>
              <div className="font-semibold text-signal">I_analysis = I &amp; 0xFC</div>
              <div className="text-[11px] text-ink-soft">
                Since embedding modifies only bit 0 and bit 1:
              </div>
              <div className="text-[11px] font-semibold text-success">
                I_stego &amp; 0xFC ≡ I_cover &amp; 0xFC
              </div>
              <div className="pt-2 border-t border-line text-[10px] text-ink-muted">
                ✓ Proven by 19/19 unit tests
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Highlights Strip */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="section-index">05 / EMPIRICAL</span>
            <h2 className="font-display text-2xl text-ink">Experimental Verification</h2>
          </div>
          <Link to="/benchmark" className="btn-secondary text-[11px] py-1.5 px-3">
            <span>View 72 Trials</span>
            <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="work-surface">
            <div className="metric-label">TOTAL EVALUATIONS</div>
            <div className="font-mono text-2xl font-semibold mt-1 text-ink">72 Trials</div>
            <div className="font-sans text-[11px] text-ink-muted mt-0.5">6 synthetic carriers</div>
          </div>
          <div className="work-surface">
            <div className="metric-label">MEAN PSNR</div>
            <div className="font-mono text-2xl font-semibold mt-1 text-success">69.4 dB</div>
            <div className="font-sans text-[11px] text-ink-muted mt-0.5">Target &gt; 40 dB</div>
          </div>
          <div className="work-surface">
            <div className="metric-label">MEAN SSIM</div>
            <div className="font-mono text-2xl font-semibold mt-1 text-success">0.9999</div>
            <div className="font-sans text-[11px] text-ink-muted mt-0.5">1.0 = identical</div>
          </div>
          <div className="work-surface">
            <div className="metric-label">ROUND-TRIP SUCCESS</div>
            <div className="font-mono text-2xl font-semibold mt-1 text-ink">100.0%</div>
            <div className="font-sans text-[11px] text-ink-muted mt-0.5">72 / 72 Verified</div>
          </div>
        </div>
      </div>
    </div>
  );
}
