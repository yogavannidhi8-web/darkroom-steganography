import { useState } from 'react';
import { ImageDropzone } from '../../components/images/ImageDropzone';
import { MetricCard } from '../../components/metrics/MetricCard';
import { HistogramChart } from '../../components/charts/HistogramChart';
import { api } from '../../services/api';
import type { AnalysisResponse } from '../../types';
import { AlertCircle, Loader2, Sliders, Sparkles, Eye } from 'lucide-react';

export function AnalysisPage() {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [stegoFile, setStegoFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [stegoUrl, setStegoUrl] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [comparisonMode, setComparisonMode] = useState<'slider' | 'side-by-side'>('slider');
  const [advancedTab, setAdvancedTab] = useState<'heatmap' | 'score' | 'edges' | 'histograms' | 'entropy'>('heatmap');
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Quick Demo Sample Pair Loader
  const loadDemoPair = async () => {
    setLoading(true);
    setError(null);
    try {
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

      const canvasStego = document.createElement('canvas');
      canvasStego.width = 384;
      canvasStego.height = 384;
      const ctxS = canvasStego.getContext('2d')!;
      ctxS.drawImage(canvasCover, 0, 0);
      const imgData = ctxS.getImageData(0, 0, 384, 384);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] > 100) {
          d[i] ^= 1;
          d[i + 1] ^= 1;
        }
      }
      ctxS.putImageData(imgData, 0, 0);

      const coverBlob: Blob = await new Promise(r => canvasCover.toBlob(b => r(b!), 'image/png'));
      const stegoBlob: Blob = await new Promise(r => canvasStego.toBlob(b => r(b!), 'image/png'));

      const cFile = new File([coverBlob], 'sample_original.png', { type: 'image/png' });
      const sFile = new File([stegoBlob], 'sample_protected.png', { type: 'image/png' });

      handleCover(cFile);
      handleStego(sFile);

      const r = await api.analyze(cFile, sFile);
      setResult(r);
    } catch (e: any) {
      setError(`Failed to load demo pair: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!coverFile || !stegoFile) { setError('Please upload both the original and protected images'); return; }
    setError(null);
    setLoading(true);
    try {
      const r = await api.analyze(coverFile, stegoFile);
      setResult(r);
    } catch (e: any) {
      setError(e.message || 'Analysis failed. Make sure both images have identical dimensions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl mb-2 text-ink font-normal">
            Image Quality &amp; Fidelity
          </h1>
          <p className="font-sans text-sm text-ink-soft leading-relaxed">
            Compare original and protected images to verify that modifications are imperceptible to human vision.
          </p>
        </div>
        <button
          type="button"
          onClick={loadDemoPair}
          className="btn-secondary text-xs py-2 px-3 self-start sm:self-auto flex items-center gap-1.5"
          disabled={loading}
        >
          <Sparkles size={13} className="text-signal" />
          <span>Load Sample Pair</span>
        </button>
      </div>

      {/* Image Upload Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="work-surface">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-xs font-semibold text-ink">Original Image</span>
            <span className="font-mono text-[10px] text-ink-muted">COVER</span>
          </div>
          <ImageDropzone onFile={handleCover} label="Upload original image" currentFile={coverFile} />
        </div>

        <div className="work-surface">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-xs font-semibold text-ink">Protected Image</span>
            <span className="font-mono text-[10px] text-ink-muted">STEGO</span>
          </div>
          <ImageDropzone onFile={handleStego} label="Upload protected image" currentFile={stegoFile} />
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          type="button"
          onClick={handleAnalyze}
          className="btn-signal py-2.5 px-6 text-xs flex items-center gap-2"
          disabled={!coverFile || !stegoFile || loading}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sliders size={14} />}
          <span>{loading ? 'Evaluating...' : 'Run Quality Analysis'}</span>
        </button>

        {coverUrl && stegoUrl && (
          <div className="flex border border-line rounded p-0.5 bg-paper font-sans text-xs">
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
        <div className="p-3.5 bg-signal-soft border border-signal rounded text-xs font-sans text-signal flex items-center gap-2 mb-8" role="alert">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty State when no images loaded */}
      {!coverUrl && !stegoUrl && (
        <div className="work-surface text-center py-12 mb-8">
          <Eye size={24} className="mx-auto text-ink-muted mb-3" />
          <h3 className="font-sans text-sm font-semibold text-ink mb-1">No images selected</h3>
          <p className="font-sans text-xs text-ink-soft max-w-sm mx-auto mb-4">
            Upload both an original and a protected image above, or click below to load a demonstration pair.
          </p>
          <button
            type="button"
            onClick={loadDemoPair}
            className="btn-secondary text-xs py-1.5 px-3"
            disabled={loading}
          >
            Load Sample Pair
          </button>
        </div>
      )}

      {/* PRIMARY: Visual Comparator */}
      {coverUrl && stegoUrl && (
        <div className="work-surface mb-8">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-sans font-semibold text-ink">Visual Comparison</span>
            <span className="font-mono text-[11px] text-ink-muted">
              {comparisonMode === 'slider' ? `Divider: ${sliderPos}% (Drag slider to inspect)` : 'Dual View'}
            </span>
          </div>

          <div className="dark-stage flex items-center justify-center p-3">
            {comparisonMode === 'slider' ? (
              <div className="relative inline-block max-w-full max-h-[420px] select-none overflow-hidden rounded-sm">
                <img src={stegoUrl} alt="Protected" className="max-h-[400px] object-contain block" />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img src={coverUrl} alt="Original" className="max-h-[400px] object-contain block" />
                </div>
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-paper shadow-md pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-ink text-paper flex items-center justify-center text-[9px] font-mono border border-paper shadow">
                    ◀▶
                  </div>
                </div>
                <div className="absolute top-2 left-2 bg-ink/80 text-paper px-2 py-0.5 rounded text-[10px] font-sans">
                  Original (Left)
                </div>
                <div className="absolute top-2 right-2 bg-ink/80 text-paper px-2 py-0.5 rounded text-[10px] font-sans">
                  Protected (Right)
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                <div className="text-center">
                  <div className="text-[11px] font-sans text-ink-soft mb-1">Original</div>
                  <img src={coverUrl} alt="Original" className="max-h-[260px] mx-auto object-contain rounded-sm" />
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-sans text-ink-soft mb-1">Protected</div>
                  <img src={stegoUrl} alt="Protected" className="max-h-[260px] mx-auto object-contain rounded-sm" />
                </div>
              </div>
            )}
          </div>

          {comparisonMode === 'slider' && (
            <div className="mt-3 px-2">
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="w-full accent-ink cursor-pointer"
                aria-label="Comparison slider position"
              />
            </div>
          )}
        </div>
      )}

      {/* SECONDARY: Quality Metrics */}
      {result && (
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-2xl text-ink mb-4">Quality Metrics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard
                label="FIDELITY (PSNR)"
                value={result.psnr_display}
                description="Imperceptible (&gt; 40 dB target)"
                highlight={result.psnr && result.psnr > 40 ? 'good' : 'neutral'}
              />
              <MetricCard
                label="SIMILARITY (SSIM)"
                value={result.ssim.toFixed(5)}
                description="1.0 = identical structure"
                highlight={result.ssim > 0.999 ? 'good' : 'neutral'}
              />
              <MetricCard
                label="AVERAGE ERROR (MSE)"
                value={result.mse.toFixed(5)}
                description="Negligible deviation"
                highlight={result.mse < 0.1 ? 'good' : 'neutral'}
              />
              <MetricCard
                label="CHANGED PIXELS"
                value={`${(result.changed_pixels_ratio * 100).toFixed(2)}%`}
                description={`${result.changed_pixels.toLocaleString()} pixels`}
              />
            </div>
          </div>

          {/* TERTIARY: Advanced Visualizations & Diagnostics */}
          <div className="work-surface">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-line gap-2 mb-4">
              <div>
                <h3 className="font-sans font-semibold text-sm text-ink">Advanced Forensic Visualizations</h3>
                <p className="font-sans text-xs text-ink-muted">In-depth spatial and statistical analysis artifacts</p>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-1 font-sans text-xs">
                {[
                  { id: 'heatmap', label: 'Difference Heatmap' },
                  { id: 'score', label: 'Suitability Map' },
                  { id: 'edges', label: 'Edge Map' },
                  { id: 'histograms', label: 'RGB Histograms' },
                  { id: 'entropy', label: 'Entropy' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAdvancedTab(t.id as any)}
                    className={`px-2.5 py-1 rounded transition-colors text-xs ${
                      advancedTab === t.id ? 'bg-ink text-paper font-medium' : 'text-ink-soft hover:text-ink bg-paper'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab 1: Heatmap */}
            {advancedTab === 'heatmap' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-xs text-ink font-medium">Difference Heatmap (20× Amplified)</span>
                  <span className="font-mono text-[10px] text-ink-muted">Warm colors indicate modified pixels</span>
                </div>
                <div className="dark-stage p-2">
                  <img
                    src={`data:image/png;base64,${result.difference_heatmap_png_b64}`}
                    alt="Difference heatmap"
                    className="max-h-72 mx-auto object-contain rounded-sm"
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Suitability Map */}
            {advancedTab === 'score' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-xs text-ink font-medium">Adaptive Suitability Score Map</span>
                  <span className="font-mono text-[10px] text-ink-muted">Brighter areas = high capacity edges/textures</span>
                </div>
                <div className="dark-stage p-2">
                  <img
                    src={`data:image/png;base64,${result.score_map_png_b64}`}
                    alt="Adaptive suitability score map"
                    className="max-h-72 mx-auto object-contain rounded-sm"
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Edge Map */}
            {advancedTab === 'edges' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-xs text-ink font-medium">Edge Contour Map</span>
                  <span className="font-mono text-[10px] text-ink-muted">High-frequency boundary regions</span>
                </div>
                <div className="dark-stage p-2">
                  <img
                    src={`data:image/png;base64,${result.edge_map_png_b64}`}
                    alt="Edge contour map"
                    className="max-h-72 mx-auto object-contain rounded-sm"
                  />
                </div>
              </div>
            )}

            {/* Tab 4: RGB Histograms */}
            {advancedTab === 'histograms' && (
              <div className="space-y-4">
                <HistogramChart
                  coverHistograms={result.cover_rgb_histograms}
                  stegoHistograms={result.stego_rgb_histograms}
                  channel="r"
                  title="Red Channel Distribution (Cover vs Stego)"
                />
                <HistogramChart
                  coverHistograms={result.cover_rgb_histograms}
                  stegoHistograms={result.stego_rgb_histograms}
                  channel="g"
                  title="Green Channel Distribution (Cover vs Stego)"
                />
                <HistogramChart
                  coverHistograms={result.cover_rgb_histograms}
                  stegoHistograms={result.stego_rgb_histograms}
                  channel="b"
                  title="Blue Channel Distribution (Cover vs Stego)"
                />
              </div>
            )}

            {/* Tab 5: Entropy */}
            {advancedTab === 'entropy' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
                <div className="p-3 border border-line bg-paper rounded">
                  <div className="text-ink-muted mb-1">ORIGINAL ENTROPY</div>
                  <div className="font-mono text-lg font-semibold text-ink">{result.cover_entropy.toFixed(4)} bits</div>
                </div>
                <div className="p-3 border border-line bg-paper rounded">
                  <div className="text-ink-muted mb-1">PROTECTED ENTROPY</div>
                  <div className="font-mono text-lg font-semibold text-ink">{result.stego_entropy.toFixed(4)} bits</div>
                </div>
                <div className="p-3 border border-line bg-paper rounded">
                  <div className="text-ink-muted mb-1">ENTROPY DELTA (ΔH)</div>
                  <div className="font-mono text-lg font-semibold text-signal">
                    {result.entropy_difference >= 0 ? `+${result.entropy_difference.toFixed(4)}` : result.entropy_difference.toFixed(4)} bits
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
