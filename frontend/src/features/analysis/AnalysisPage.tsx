import { useState } from 'react';
import { ImageDropzone } from '../../components/images/ImageDropzone';
import { MetricCard } from '../../components/metrics/MetricCard';
import { HistogramChart } from '../../components/charts/HistogramChart';
import { api } from '../../services/api';
import type { AnalysisResponse } from '../../types';
import { AlertCircle, Loader2 } from 'lucide-react';

export function AnalysisPage() {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [stegoFile, setStegoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const handleAnalyze = async () => {
    if (!coverFile || !stegoFile) { setError('Please upload both images'); return; }
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
    <div className="max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="section-index">04</span>
          <span className="status-stamp status-stamp-neutral">ANALYSIS</span>
        </div>
        <h1 className="font-display text-3xl mb-2">Image Quality Analysis</h1>
        <p className="font-sans text-sm" style={{ color: 'var(--ink-soft)' }}>
          Compare cover and stego images using real computed metrics: MSE, PSNR, SSIM, entropy, histograms and adaptive score map.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="work-surface">
          <div className="metric-label mb-3">COVER IMAGE</div>
          <ImageDropzone onFile={(f) => { setCoverFile(f); setResult(null); }} label="Upload original cover" currentFile={coverFile} />
        </div>
        <div className="work-surface">
          <div className="metric-label mb-3">STEGO IMAGE</div>
          <ImageDropzone onFile={(f) => { setStegoFile(f); setResult(null); }} label="Upload stego image" currentFile={stegoFile} />
        </div>
      </div>

      <button
        type="button"
        onClick={handleAnalyze}
        className="btn-primary mb-6"
        disabled={!coverFile || !stegoFile || loading}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? 'Analyzing…' : 'Run Analysis'}
      </button>

      {error && (
        <div className="flex items-center gap-2 font-sans text-sm mb-5" style={{ color: 'var(--signal)' }}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-6">
          <div>
            <div className="metric-label mb-3">PRIMARY QUALITY METRICS</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MetricCard label="MSE" value={result.mse.toFixed(6)} description="Mean squared error" highlight={result.mse < 1 ? 'good' : 'neutral'} />
              <MetricCard label="PSNR" value={result.psnr_display} description="Peak signal-to-noise ratio" highlight={result.psnr && result.psnr > 40 ? 'good' : 'neutral'} />
              <MetricCard label="SSIM" value={result.ssim.toFixed(6)} description="Structural similarity" highlight={result.ssim > 0.99 ? 'good' : 'neutral'} />
              <MetricCard label="Changed Pixels" value={`${(result.changed_pixels_ratio * 100).toFixed(2)}%`} description={`${result.changed_pixels.toLocaleString()} of ${result.total_pixels.toLocaleString()}`} />
            </div>
          </div>

          <div>
            <div className="metric-label mb-3">ENTROPY</div>
            <div className="grid grid-cols-3 gap-3">
              <MetricCard label="Cover entropy" value={result.cover_entropy.toFixed(6)} unit="bits" />
              <MetricCard label="Stego entropy" value={result.stego_entropy.toFixed(6)} unit="bits" />
              <MetricCard label="Entropy Δ" value={result.entropy_difference > 0 ? `+${result.entropy_difference.toFixed(6)}` : result.entropy_difference.toFixed(6)} unit="bits" />
            </div>
          </div>

          <div>
            <div className="metric-label mb-3">VISUAL ANALYSIS</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="metric-label mb-2">DIFFERENCE HEATMAP</div>
                <div className="dark-stage p-2">
                  <img src={`data:image/png;base64,${result.difference_heatmap_png_b64}`} alt="Difference heatmap" className="w-full" />
                </div>
              </div>
              <div>
                <div className="metric-label mb-2">ADAPTIVE SCORE MAP</div>
                <div className="dark-stage p-2">
                  <img src={`data:image/png;base64,${result.score_map_png_b64}`} alt="Adaptive score map" className="w-full" />
                </div>
              </div>
              <div>
                <div className="metric-label mb-2">EDGE MAP</div>
                <div className="dark-stage p-2">
                  <img src={`data:image/png;base64,${result.edge_map_png_b64}`} alt="Edge map" className="w-full" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="metric-label mb-3">RGB HISTOGRAMS (Cover vs Stego)</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 work-surface">
              <HistogramChart coverHistograms={result.cover_rgb_histograms} stegoHistograms={result.stego_rgb_histograms} channel="r" title="Red channel" />
              <HistogramChart coverHistograms={result.cover_rgb_histograms} stegoHistograms={result.stego_rgb_histograms} channel="g" title="Green channel" />
              <HistogramChart coverHistograms={result.cover_rgb_histograms} stegoHistograms={result.stego_rgb_histograms} channel="b" title="Blue channel" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
