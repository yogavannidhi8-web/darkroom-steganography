import { useState } from 'react';
import { ImageDropzone } from '../../components/images/ImageDropzone';
import { MetricCard } from '../../components/metrics/MetricCard';
import { HistogramChart } from '../../components/charts/HistogramChart';
import { api } from '../../services/api';
import type { AnalysisResponse } from '../../types';
import { AlertCircle, Loader2, Sliders, Sparkles } from 'lucide-react';

export function AnalysisPage() {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [stegoFile, setStegoFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [stegoUrl, setStegoUrl] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [comparisonMode, setComparisonMode] = useState<'slider' | 'side-by-side'>('slider');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const handleCover = (file: File) => {
    setCoverFile(file);
    if (coverUrl) URL.revokeObjectURL(coverUrl);
    setCoverUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const handleStego = (file: File) => {
    setStegoFile(file);
    if (stegoUrl) URL.revokeObjectURL(stegoUrl);
    setStegoUrl(URL.createObjectURL(file));
    setResult(null);
  };

  // Demo Sample Pair Loader
  const loadDemoPair = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Generate Cover
      const canvasCover = document.createElement('canvas');
      canvasCover.width = 384;
      canvasCover.height = 384;
      const ctxC = canvasCover.getContext('2d')!;
      ctxC.fillStyle = '#EAE8DE';
      ctxC.fillRect(0, 0, 384, 384);
      ctxC.fillStyle = '#2A2D2B';
      ctxC.fillRect(40, 40, 160, 240);
      ctxC.fillStyle = '#C45A3D';
      ctxC.beginPath();
      ctxC.arc(260, 180, 70, 0, Math.PI * 2);
      ctxC.fill();

      // 2. Generate Stego with subtle LSB alterations in the circle
      const canvasStego = document.createElement('canvas');
      canvasStego.width = 384;
      canvasStego.height = 384;
      const ctxS = canvasStego.getContext('2d')!;
      ctxS.drawImage(canvasCover, 0, 0);
      const imgData = ctxS.getImageData(0, 0, 384, 384);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] > 100) {
          d[i] ^= 1;     // Flip 1 LSB
          d[i + 1] ^= 1;
        }
      }
      ctxS.putImageData(imgData, 0, 0);

      const coverBlob: Blob = await new Promise(r => canvasCover.toBlob(b => r(b!), 'image/png'));
      const stegoBlob: Blob = await new Promise(r => canvasStego.toBlob(b => r(b!), 'image/png'));

      const cFile = new File([coverBlob], 'demo_cover.png', { type: 'image/png' });
      const sFile = new File([stegoBlob], 'demo_stego.png', { type: 'image/png' });

      handleCover(cFile);
      handleStego(sFile);

      // Immediately run analysis on this pair
      const r = await api.analyze(cFile, sFile);
      setResult(r);
    } catch (e: any) {
      setError(`Failed to load demo pair: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!coverFile || !stegoFile) { setError('Please upload both cover and stego carrier images'); return; }
    setError(null);
    setLoading(true);
    try {
      const r = await api.analyze(coverFile, stegoFile);
      setResult(r);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl">
      {/* Editorial Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="section-index">04 / FORENSICS</span>
              <span className="status-stamp status-stamp-neutral">IMAGE QUALITY LABORATORY</span>
            </div>
            <h1 className="font-display text-4xl mb-3 text-ink font-normal">
              Quality &amp; Distortion Analysis
            </h1>
            <p className="font-sans text-sm sm:text-base max-w-2xl text-ink-soft leading-relaxed">
              Compare cover and stego carriers side-by-side. Calculate exact MSE, PSNR, SSIM,
              Shannon entropy shifts, amplified difference heatmaps, and RGB channel distributions.
            </p>
          </div>
          {/* Quick Demo Button */}
          <button
            type="button"
            onClick={loadDemoPair}
            className="btn-secondary text-[11px] py-1.5 px-3 hidden sm:flex items-center gap-1.5"
            disabled={loading}
          >
            <Sparkles size={12} className="text-signal" />
            <span>Load Demo Sample Pair</span>
          </button>
        </div>
      </div>

      {/* Upload Dual Frame (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="work-surface">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">Original Cover Image</span>
            <span className="status-stamp status-stamp-neutral">BASELINE</span>
          </div>
          <ImageDropzone onFile={handleCover} label="Upload original cover image" currentFile={coverFile} />
        </div>

        <div className="work-surface">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">Stego Carrier Image</span>
            <span className="status-stamp status-stamp-neutral">MODIFIED</span>
          </div>
          <ImageDropzone onFile={handleStego} label="Upload generated stego image" currentFile={stegoFile} />
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          type="button"
          onClick={handleAnalyze}
          className="btn-signal py-3 px-6 text-sm shadow-md"
          disabled={!coverFile || !stegoFile || loading}
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Sliders size={15} />}
          <span>{loading ? 'Evaluating Spatial Matrices...' : 'Execute Comprehensive Analysis'}</span>
        </button>

        {coverUrl && stegoUrl && (
          <div className="flex border border-line rounded p-0.5 bg-paper font-mono text-[11px] uppercase">
            <button
              type="button"
              onClick={() => setComparisonMode('slider')}
              className={`px-3 py-1 rounded transition-colors ${comparisonMode === 'slider' ? 'bg-ink text-paper font-medium' : 'text-ink-soft'}`}
            >
              Wipe Slider
            </button>
            <button
              type="button"
              onClick={() => setComparisonMode('side-by-side')}
              className={`px-3 py-1 rounded transition-colors ${comparisonMode === 'side-by-side' ? 'bg-ink text-paper font-medium' : 'text-ink-soft'}`}
            >
              Side-by-Side
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-signal-soft border border-signal rounded text-xs font-sans text-signal flex items-center gap-2 mb-8" role="alert">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Interactive Wipe Comparison Stage */}
      {coverUrl && stegoUrl && (
        <div className="work-surface mb-8">
          <div className="flex items-center justify-between mb-3 font-mono text-xs">
            <span className="text-ink font-semibold uppercase tracking-wider">Perceptual Image Comparator</span>
            <span className="text-ink-muted">
              {comparisonMode === 'slider' ? `Split Point: ${sliderPos}% (Drag slider to inspect)` : 'Dual Synchronized View'}
            </span>
          </div>

          <div className="dark-stage flex items-center justify-center p-4">
            {comparisonMode === 'slider' ? (
              <div className="relative inline-block max-w-full max-h-[440px] select-none overflow-hidden rounded-sm">
                {/* Stego Underneath */}
                <img src={stegoUrl} alt="Stego carrier" className="max-h-[420px] object-contain block" />
                
                {/* Cover Clipped On Top */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img src={coverUrl} alt="Cover image" className="max-h-[420px] object-contain block" />
                </div>

                {/* Vertical Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-paper shadow-md pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-ink text-paper flex items-center justify-center text-[9px] font-mono border border-paper shadow-lg">
                    ⇄
                  </div>
                </div>

                {/* Overlaid Badges */}
                <div className="absolute top-3 left-3 px-2 py-0.5 bg-ink/80 text-paper font-mono text-[10px] rounded backdrop-blur-sm pointer-events-none">
                  COVER (ORIGINAL)
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-signal/90 text-paper font-mono text-[10px] rounded backdrop-blur-sm pointer-events-none">
                  STEGO (CONCEALED)
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="text-center">
                  <div className="font-mono text-[10px] text-paper-raised mb-1.5 uppercase tracking-wider">Cover Image</div>
                  <img src={coverUrl} alt="Cover" className="max-h-72 object-contain mx-auto rounded-sm border border-line/20" />
                </div>
                <div className="text-center">
                  <div className="font-mono text-[10px] text-signal mb-1.5 uppercase tracking-wider">Stego Image</div>
                  <img src={stegoUrl} alt="Stego" className="max-h-72 object-contain mx-auto rounded-sm border border-line/20" />
                </div>
              </div>
            )}
          </div>

          {comparisonMode === 'slider' && (
            <div className="mt-4 px-2">
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="w-full accent-ink cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

      {/* Forensic Report Results */}
      {result && (
        <div className="space-y-8">
          {/* Primary Quality Matrix */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="section-index">M1 / METRICS</span>
              <h2 className="font-display text-2xl text-ink">Objective Distortion Audit</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard
                label="PSNR (PEAK SNR)"
                value={result.psnr_display}
                description="Target &gt; 40 dB (Humanly Imperceptible)"
                highlight={result.psnr && result.psnr > 40 ? 'good' : 'neutral'}
              />
              <MetricCard
                label="SSIM INDEX"
                value={result.ssim.toFixed(6)}
                description="Structural similarity (1.0 = identical)"
                highlight={result.ssim > 0.999 ? 'good' : 'neutral'}
              />
              <MetricCard
                label="MEAN SQUARED ERROR"
                value={result.mse.toFixed(6)}
                description="Average squared difference per channel"
                highlight={result.mse < 0.1 ? 'good' : 'neutral'}
              />
              <MetricCard
                label="CHANGED PIXELS"
                value={`${(result.changed_pixels_ratio * 100).toFixed(2)}%`}
                description={`${result.changed_pixels.toLocaleString()} altered pixels`}
              />
            </div>
          </div>

          {/* Entropy & Channel Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="work-surface">
              <div className="metric-label mb-1">COVER SHANNON ENTROPY</div>
              <div className="font-mono text-xl font-medium text-ink">{result.cover_entropy.toFixed(5)} bits</div>
              <div className="text-[11px] font-sans text-ink-muted mt-1">Information content of original carrier</div>
            </div>
            <div className="work-surface">
              <div className="metric-label mb-1">STEGO SHANNON ENTROPY</div>
              <div className="font-mono text-xl font-medium text-ink">{result.stego_entropy.toFixed(5)} bits</div>
              <div className="text-[11px] font-sans text-ink-muted mt-1">Information content after adaptive embedding</div>
            </div>
            <div className="work-surface">
              <div className="metric-label mb-1">ENTROPY DELTA (ΔH)</div>
              <div className="font-mono text-xl font-medium text-signal">
                {result.entropy_difference >= 0 ? `+${result.entropy_difference.toFixed(5)}` : result.entropy_difference.toFixed(5)} bits
              </div>
              <div className="text-[11px] font-sans text-ink-muted mt-1">Near-zero shift preserves carrier statistics</div>
            </div>
          </div>

          {/* Visual Analysis Heatmaps */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="section-index">M2 / MAPS</span>
              <h2 className="font-display text-2xl text-ink">Spatial Feature Visualizations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Difference Heatmap */}
              <div className="work-surface">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">Difference Heatmap</span>
                  <span className="text-[10px] font-mono text-signal">20× Amplified</span>
                </div>
                <div className="dark-stage p-2">
                  <img
                    src={`data:image/png;base64,${result.difference_heatmap_png_b64}`}
                    alt="Pixel difference heatmap"
                    className="w-full object-contain rounded-sm"
                  />
                </div>
                <p className="font-sans text-[11px] text-ink-muted mt-2 leading-relaxed">
                  Color-mapped absolute pixel divergence. Hotter regions indicate where adaptive embedding altered 1 or 2 LSBs.
                </p>
              </div>

              {/* Adaptive Score Map */}
              <div className="work-surface">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">Adaptive Score Map</span>
                  <span className="text-[10px] font-mono text-ink-muted">Viridis</span>
                </div>
                <div className="dark-stage p-2">
                  <img
                    src={`data:image/png;base64,${result.score_map_png_b64}`}
                    alt="Adaptive score map"
                    className="w-full object-contain rounded-sm"
                  />
                </div>
                <p className="font-sans text-[11px] text-ink-muted mt-2 leading-relaxed">
                  Composite suitability scores (0 to 1). Brighter areas correspond to high-texture candidate embedding regions.
                </p>
              </div>

              {/* Canny Edge Map */}
              <div className="work-surface">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">Canny Edge Mask</span>
                  <span className="text-[10px] font-mono text-ink-muted">Binary</span>
                </div>
                <div className="dark-stage p-2">
                  <img
                    src={`data:image/png;base64,${result.edge_map_png_b64}`}
                    alt="Canny edge map"
                    className="w-full object-contain rounded-sm"
                  />
                </div>
                <p className="font-sans text-[11px] text-ink-muted mt-2 leading-relaxed">
                  Detected high-frequency edge contours. Payload bits are embedded along these contours to maximize imperceptibility.
                </p>
              </div>
            </div>
          </div>

          {/* Channel Histograms */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="section-index">M3 / HISTOGRAMS</span>
              <h2 className="font-display text-2xl text-ink">RGB Channel Distribution Overlays</h2>
            </div>
            <div className="work-surface">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <HistogramChart
                  coverHistograms={result.cover_rgb_histograms}
                  stegoHistograms={result.stego_rgb_histograms}
                  channel="r"
                  title="Red Channel Spectrum"
                />
                <HistogramChart
                  coverHistograms={result.cover_rgb_histograms}
                  stegoHistograms={result.stego_rgb_histograms}
                  channel="g"
                  title="Green Channel Spectrum"
                />
                <HistogramChart
                  coverHistograms={result.cover_rgb_histograms}
                  stegoHistograms={result.stego_rgb_histograms}
                  channel="b"
                  title="Blue Channel Spectrum"
                />
              </div>
              <div className="mt-4 pt-4 border-t border-line text-[11px] font-mono text-ink-muted flex items-center justify-between">
                <span>Solid Bar: Original Cover Distribution</span>
                <span>Transparent Bar: Stego Distribution</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
