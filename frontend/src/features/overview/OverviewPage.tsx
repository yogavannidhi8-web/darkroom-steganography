import { Link } from 'react-router-dom';
import { Lock, Eye, BarChart3, Shield, ArrowRight, Layers } from 'lucide-react';

const stages = [
  { number: '01', icon: Lock, label: 'Encryption', desc: 'AES-256-GCM with Argon2id key derivation protects payload contents.' },
  { number: '02', icon: Layers, label: 'Steganography', desc: 'Encrypted payload is concealed inside a lossless PNG image.' },
  { number: '03', icon: Eye, label: 'Adaptive Embedding', desc: 'Embedding locations adapt to image texture, edges and gradients.' },
  { number: '04', icon: Shield, label: 'Integrity', desc: 'AES-GCM authentication + SHA-256 digest reject any tampering.' },
  { number: '05', icon: BarChart3, label: 'Quality Analysis', desc: 'MSE, PSNR, SSIM and histogram comparison measure visual impact.' },
];

export function OverviewPage() {
  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="section-index">00</span>
          <span className="status-stamp status-stamp-neutral">CAPSTONE PROJECT</span>
        </div>
        <h1 className="font-display text-4xl mb-3" style={{ color: 'var(--ink)' }}>
          Secure Adaptive<br />Image Steganography
        </h1>
        <p className="font-sans text-base max-w-xl" style={{ color: 'var(--ink-soft)', lineHeight: 1.7 }}>
          A research system combining content-aware spatial embedding, password-derived
          authenticated encryption, integrity verification and quantitative image-quality
          evaluation.
        </p>
      </div>

      {/* Process stages */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <span className="section-index">01</span>
          <h2 className="font-display text-xl" style={{ color: 'var(--ink)' }}>Five Security Stages</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stages.map((stage) => (
            <div key={stage.number} className="work-surface">
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
                  {stage.number}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <stage.icon size={14} strokeWidth={1.5} style={{ color: 'var(--ink)' }} />
                    <span className="font-sans font-medium text-sm" style={{ color: 'var(--ink)' }}>
                      {stage.label}
                    </span>
                  </div>
                  <p className="font-sans text-xs" style={{ color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                    {stage.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <span className="section-index">02</span>
          <h2 className="font-display text-xl" style={{ color: 'var(--ink)' }}>Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/encode" className="work-surface group flex flex-col gap-3 hover:border-ink transition-colors" style={{ textDecoration: 'none' }}>
            <div className="flex items-center justify-between">
              <Lock size={16} strokeWidth={1.5} style={{ color: 'var(--signal)' }} />
              <ArrowRight size={14} strokeWidth={1.5} style={{ color: 'var(--ink-soft)' }} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div>
              <div className="font-sans font-medium text-sm mb-1" style={{ color: 'var(--ink)' }}>Encode</div>
              <div className="font-sans text-xs" style={{ color: 'var(--ink-soft)' }}>
                Hide an encrypted message or file inside a cover image.
              </div>
            </div>
          </Link>
          <Link to="/decode" className="work-surface group flex flex-col gap-3 hover:border-ink transition-colors" style={{ textDecoration: 'none' }}>
            <div className="flex items-center justify-between">
              <Eye size={16} strokeWidth={1.5} style={{ color: 'var(--success)' }} />
              <ArrowRight size={14} strokeWidth={1.5} style={{ color: 'var(--ink-soft)' }} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div>
              <div className="font-sans font-medium text-sm mb-1" style={{ color: 'var(--ink)' }}>Decode</div>
              <div className="font-sans text-xs" style={{ color: 'var(--ink-soft)' }}>
                Recover and verify the hidden payload with the correct password.
              </div>
            </div>
          </Link>
          <Link to="/analysis" className="work-surface group flex flex-col gap-3 hover:border-ink transition-colors" style={{ textDecoration: 'none' }}>
            <div className="flex items-center justify-between">
              <BarChart3 size={16} strokeWidth={1.5} style={{ color: 'var(--warning)' }} />
              <ArrowRight size={14} strokeWidth={1.5} style={{ color: 'var(--ink-soft)' }} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div>
              <div className="font-sans font-medium text-sm mb-1" style={{ color: 'var(--ink)' }}>Analyze</div>
              <div className="font-sans text-xs" style={{ color: 'var(--ink-soft)' }}>
                Compare cover and stego image with real quality metrics.
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <span className="section-index">03</span>
          <h2 className="font-display text-xl" style={{ color: 'var(--ink)' }}>How It Works</h2>
        </div>
        <div className="work-surface">
          <div className="flex flex-wrap gap-2 items-center font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>
            {['Payload', '→ Encrypt (AES-256-GCM)', '→ Analyze Upper 6 Bits', '→ Adaptive Map', '→ Key Permute', '→ Embed LSBs', '→ Stego PNG'].map((step, i) => (
              <span key={i} style={{ color: i % 2 === 0 ? 'var(--ink)' : 'var(--ink-soft)' }}>
                {step}
              </span>
            ))}
          </div>
          <div className="section-rule" />
          <p className="font-sans text-sm" style={{ color: 'var(--ink-soft)', lineHeight: 1.7 }}>
            The adaptive map is computed from the upper 6 bits of each RGB channel, making it
            identical whether applied to the original cover or the resulting stego image.
            This ensures the extraction algorithm can always reconstruct the same embedding locations.
          </p>
        </div>
      </div>
    </div>
  );
}
