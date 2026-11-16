import { Link } from 'react-router-dom';
import { Lock, ArrowRight, Eye, Sliders, CheckCircle2, ChevronRight } from 'lucide-react';

const corePillars = [
  {
    icon: Lock,
    title: 'Secure',
    description: 'Confidential data is strongly encrypted and authenticated with your passphrase before embedding, ensuring only intended recipients can access it.',
  },
  {
    icon: Sliders,
    title: 'Adaptive',
    description: 'The embedding algorithm intelligently steers data into complex textures and edges while avoiding smooth, uniform areas where noise would be noticeable.',
  },
  {
    icon: CheckCircle2,
    title: 'Verified',
    description: 'During extraction, multi-stage cryptographic checks guarantee that any alteration or tampering with the image immediately flags verification failure.',
  },
  {
    icon: Eye,
    title: 'Analyzed',
    description: 'Objective image quality metrics (PSNR, SSIM, and difference heatmaps) confirm that modifications remain imperceptible to human observers.',
  },
];

const highLevelFlow = [
  { step: '01', title: 'Carrier Image', desc: 'Select a standard lossless image (PNG, BMP, TIFF) to act as the carrier.' },
  { step: '02', title: 'Secure Content', desc: 'Encrypt secret text or binary files under a passphrase with authenticated encryption.' },
  { step: '03', title: 'Adaptive Embed', desc: 'Conceal encrypted bits into image textures and edges with minimal visual distortion.' },
  { step: '04', title: 'Recover & Verify', desc: 'Extract payload and verify that data is authentic and intact with the correct passphrase.' },
];

export function OverviewPage() {
  return (
    <div className="max-w-5xl">
      {/* Hero Section */}
      <div className="mb-14 pb-8 border-b border-line">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl mb-4 leading-tight text-ink font-normal">
          Conceal data inside images<br />
          <span className="italic">without visual trace</span>
        </h1>
        <p className="font-sans text-base sm:text-lg max-w-2xl text-ink-soft leading-relaxed mb-8">
          A secure image steganography system that combines content-aware adaptive embedding
          with authenticated encryption and precision quality analysis.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link to="/encode" className="btn-signal py-3 px-6 text-sm flex items-center gap-2">
            <span>Protect an Image</span>
            <ArrowRight size={15} />
          </Link>
          <Link to="/decode" className="btn-secondary py-3 px-6 text-sm flex items-center gap-2">
            <span>Recover Content</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Primary Actions Grid */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-ink">Primary Workflows</h2>
          <span className="font-mono text-xs text-ink-muted uppercase">Core Capabilities</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/encode"
            className="work-surface group flex flex-col justify-between hover:border-ink transition-all"
            style={{ textDecoration: 'none' }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-ink-muted uppercase tracking-wider">Encode</span>
                <div className="w-8 h-8 rounded-full border border-line flex items-center justify-center group-hover:bg-ink group-hover:text-paper transition-colors">
                  <ArrowRight size={13} />
                </div>
              </div>
              <h3 className="font-display text-xl mb-2 text-ink">Protect &amp; Conceal</h3>
              <p className="font-sans text-xs text-ink-soft leading-relaxed">
                Add secret messages or files into an image with passphrase protection. The system embeds data where it is least perceptible.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-line font-sans text-xs text-ink flex items-center gap-1 font-medium">
              <span>Start encoding</span>
              <ChevronRight size={13} />
            </div>
          </Link>

          <Link
            to="/decode"
            className="work-surface group flex flex-col justify-between hover:border-ink transition-all"
            style={{ textDecoration: 'none' }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-ink-muted uppercase tracking-wider">Decode</span>
                <div className="w-8 h-8 rounded-full border border-line flex items-center justify-center group-hover:bg-ink group-hover:text-paper transition-colors">
                  <ArrowRight size={13} />
                </div>
              </div>
              <h3 className="font-display text-xl mb-2 text-ink">Verify &amp; Recover</h3>
              <p className="font-sans text-xs text-ink-soft leading-relaxed">
                Upload a protected image and provide your passphrase to verify integrity and retrieve the hidden message or file.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-line font-sans text-xs text-ink flex items-center gap-1 font-medium">
              <span>Start decoding</span>
              <ChevronRight size={13} />
            </div>
          </Link>

          <Link
            to="/analysis"
            className="work-surface group flex flex-col justify-between hover:border-ink transition-all"
            style={{ textDecoration: 'none' }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-ink-muted uppercase tracking-wider">Analysis</span>
                <div className="w-8 h-8 rounded-full border border-line flex items-center justify-center group-hover:bg-ink group-hover:text-paper transition-colors">
                  <ArrowRight size={13} />
                </div>
              </div>
              <h3 className="font-display text-xl mb-2 text-ink">Compare &amp; Analyze</h3>
              <p className="font-sans text-xs text-ink-soft leading-relaxed">
                Compare original and protected images side-by-side using wipe sliders, amplified difference heatmaps, and fidelity scores.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-line font-sans text-xs text-ink flex items-center gap-1 font-medium">
              <span>Inspect quality</span>
              <ChevronRight size={13} />
            </div>
          </Link>
        </div>
      </div>

      {/* Conceptual Pillars */}
      <div className="mb-16">
        <h2 className="font-display text-2xl text-ink mb-6">Designed for Security &amp; Imperceptibility</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {corePillars.map((pillar) => (
            <div key={pillar.title} className="work-surface">
              <div className="w-8 h-8 rounded border border-line flex items-center justify-center mb-3 bg-paper">
                <pillar.icon size={16} className="text-ink" />
              </div>
              <h3 className="font-sans font-semibold text-sm text-ink mb-1.5">{pillar.title}</h3>
              <p className="font-sans text-xs text-ink-soft leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works at a High Level */}
      <div className="mb-16">
        <h2 className="font-display text-2xl text-ink mb-6">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {highLevelFlow.map((flow) => (
            <div key={flow.step} className="p-4 border border-line bg-paper-raised">
              <div className="font-mono text-xs text-signal font-semibold mb-2">{flow.step}</div>
              <h4 className="font-sans font-semibold text-xs text-ink mb-1">{flow.title}</h4>
              <p className="font-sans text-xs text-ink-soft leading-relaxed">{flow.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benchmark Quality Highlights & Secondary Methodology Link */}
      <div className="p-6 border border-line bg-paper-raised flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="font-mono text-xs text-ink-muted uppercase mb-1">Empirically Verified Performance</div>
          <div className="font-display text-xl text-ink mb-1">High Image Fidelity &amp; Tamper Detection</div>
          <p className="font-sans text-xs text-ink-soft max-w-xl">
            Tested across 72 trials on diverse image types, achieving average PSNR &gt; 65 dB, SSIM &gt; 0.999, and 100% round-trip extraction accuracy.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/benchmark" className="btn-secondary text-xs py-2 px-3">
            View Benchmarks
          </Link>
          <Link to="/methodology" className="btn-secondary text-xs py-2 px-3">
            Technical Details
          </Link>
        </div>
      </div>
    </div>
  );
}
