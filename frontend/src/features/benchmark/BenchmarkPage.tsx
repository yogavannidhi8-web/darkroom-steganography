import { useState } from 'react';
import { ImageDropzone } from '../../components/images/ImageDropzone';
import { api } from '../../services/api';
import type { BenchmarkResult } from '../../types';
import { Loader2, Download } from 'lucide-react';

const PAYLOAD_SIZES = [128, 512, 1024, 2048, 5120];
const METHODS = ['adaptive', 'sequential', 'permuted'];

export function BenchmarkPage() {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([128, 512, 1024]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['adaptive']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BenchmarkResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSize = (size: number) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleMethod = (method: string) => {
    setSelectedMethods(prev => prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]);
  };

  const runBenchmark = async () => {
    if (!coverFile) { setError('Select a cover image'); return; }
    if (selectedSizes.length === 0) { setError('Select at least one payload size'); return; }
    if (selectedMethods.length === 0) { setError('Select at least one method'); return; }

    setError(null);
    setLoading(true);
    try {
      const r = await api.benchmark({ coverFile, payloadSizes: selectedSizes, methods: selectedMethods });
      setResults(r.results);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!results) return;
    const headers = ['method','payload_bytes','width','height','capacity_bits','mse','psnr','ssim','changed_pixels_ratio','encode_time','decode_time','round_trip_ok','status'];
    const rows = results.map(r => headers.map(h => (r as any)[h] ?? '').join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'benchmark_results.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'benchmark_results.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="section-index">05</span>
          <span className="status-stamp status-stamp-neutral">BENCHMARK</span>
        </div>
        <h1 className="font-display text-3xl mb-2">Method Comparison</h1>
        <p className="font-sans text-sm" style={{ color: 'var(--ink-soft)' }}>
          Compare embedding methods across payload sizes with real metrics. Results are computed from actual encode/decode runs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="work-surface md:col-span-1">
          <div className="metric-label mb-3">CARRIER IMAGE</div>
          <ImageDropzone onFile={(f) => { setCoverFile(f); setResults(null); }} label="Upload carrier" currentFile={coverFile} />
        </div>

        <div className="work-surface">
          <div className="metric-label mb-3">PAYLOAD SIZES (bytes)</div>
          <div className="flex flex-wrap gap-2">
            {PAYLOAD_SIZES.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={selectedSizes.includes(size) ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '4px 10px', fontSize: '11px' }}
              >
                {size >= 1024 ? `${size/1024}KB` : `${size}B`}
              </button>
            ))}
          </div>
        </div>

        <div className="work-surface">
          <div className="metric-label mb-3">METHODS</div>
          <div className="flex flex-col gap-2">
            {METHODS.map(method => (
              <button
                key={method}
                type="button"
                onClick={() => toggleMethod(method)}
                className={`${selectedMethods.includes(method) ? 'btn-primary' : 'btn-secondary'} justify-start`}
                style={{ padding: '6px 12px', fontSize: '12px', textTransform: 'capitalize' }}
              >
                {method === 'adaptive' ? 'Adaptive (proposed)' : method === 'sequential' ? 'Sequential 1-LSB' : 'Key-Permuted 1-LSB'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button type="button" onClick={runBenchmark} className="btn-signal mb-6" disabled={!coverFile || loading}>
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? 'Running benchmark…' : 'Run Benchmark'}
      </button>

      {error && <div className="font-sans text-sm mb-5" style={{ color: 'var(--signal)' }}>{error}</div>}

      {results && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="font-sans font-medium text-sm">{results.length} results</div>
            <div className="flex gap-2">
              <button type="button" onClick={exportCSV} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                <Download size={11} /> CSV
              </button>
              <button type="button" onClick={exportJSON} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                <Download size={11} /> JSON
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'IBM Plex Mono', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  {['Method','Payload','MSE','PSNR','SSIM','Δ Entropy','Changed%','Encode(s)','Decode(s)','Round-trip','Status'].map(h => (
                    <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--ink-soft)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--line)', background: i % 2 === 0 ? 'var(--paper)' : 'var(--paper-raised)' }}>
                    <td style={{ padding: '6px 8px', color: 'var(--ink)' }}>{r.method}</td>
                    <td style={{ padding: '6px 8px', color: 'var(--ink)' }}>{r.payload_bytes}B</td>
                    <td style={{ padding: '6px 8px' }}>{r.mse != null ? r.mse.toFixed(4) : '—'}</td>
                    <td style={{ padding: '6px 8px' }}>{r.psnr != null ? r.psnr.toFixed(2) : '∞'}</td>
                    <td style={{ padding: '6px 8px' }}>{r.ssim != null ? r.ssim.toFixed(5) : '—'}</td>
                    <td style={{ padding: '6px 8px' }}>{r.entropy_difference != null ? r.entropy_difference.toFixed(5) : '—'}</td>
                    <td style={{ padding: '6px 8px' }}>{r.changed_pixels_ratio != null ? (r.changed_pixels_ratio * 100).toFixed(2) + '%' : '—'}</td>
                    <td style={{ padding: '6px 8px' }}>{r.encode_time != null ? r.encode_time.toFixed(3) : '—'}</td>
                    <td style={{ padding: '6px 8px' }}>{r.decode_time != null ? r.decode_time.toFixed(3) : '—'}</td>
                    <td style={{ padding: '6px 8px', color: r.round_trip_ok ? 'var(--success)' : 'var(--signal)' }}>
                      {r.round_trip_ok === undefined ? '—' : r.round_trip_ok ? '✓' : '✗'}
                    </td>
                    <td style={{ padding: '6px 8px', color: r.status === 'success' ? 'var(--success)' : 'var(--signal)' }}>
                      {r.status}
                      {r.error && <div style={{ color: 'var(--signal)', fontSize: '9px' }}>{r.error.slice(0, 50)}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
