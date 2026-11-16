import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Download, AlertCircle, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import { ImageDropzone } from '../../components/images/ImageDropzone';
import { MetricCard } from '../../components/metrics/MetricCard';
import { ProcessingSteps } from '../../components/feedback/ProcessingSteps';
import { api } from '../../services/api';
import type { CapacityResponse, EncodeReport, ProcessingStage } from '../../types';

const schema = z.object({
  password: z.string().min(8, 'Passphrase must be at least 8 characters'),
  confirmPassword: z.string(),
  textPayload: z.string().optional(),
  adaptiveConfigId: z.number().int().min(1).max(3),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passphrases do not match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const encodeSteps = [
  { id: 'validate', label: 'Validating lossless carrier signature' },
  { id: 'analyze', label: 'Deriving upper 6-bit feature analysis map' },
  { id: 'kdf', label: 'Deriving master & subkeys with Argon2id + HKDF' },
  { id: 'encrypt', label: 'Encrypting payload via AES-256-GCM (AAD bound)' },
  { id: 'embed', label: 'Embedding into permuted adaptive slots' },
  { id: 'metrics', label: 'Measuring exact MSE, PSNR & SSIM metrics' },
  { id: 'done', label: 'Steganographic carrier generation complete' },
];

export function EncodePage() {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [payloadType, setPayloadType] = useState<'text' | 'file'>('text');
  const [secretFile, setSecretFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [capacity, setCapacity] = useState<CapacityResponse | null>(null);
  const [capacityLoading, setCapacityLoading] = useState(false);
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [activeStepIdx, setActiveStepIdx] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<EncodeReport | null>(null);
  const [stegoUrl, setStegoUrl] = useState<string | null>(null);
  const [reportBlob, setReportBlob] = useState<Blob | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { adaptiveConfigId: 2 },
  });

  const textPayload = watch('textPayload');
  const adaptiveConfigId = watch('adaptiveConfigId');

  const handleCoverFile = useCallback(async (file: File) => {
    setCoverFile(file);
    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    setCoverPreviewUrl(URL.createObjectURL(file));
    setCapacity(null);
    setError(null);
    setCapacityLoading(true);
    try {
      const cap = await api.getCapacity(file, adaptiveConfigId || 2);
      setCapacity(cap);
    } catch (e: any) {
      setError(`Carrier validation error: ${e.message}`);
    } finally {
      setCapacityLoading(false);
    }
  }, [adaptiveConfigId, coverPreviewUrl]);

  // Synthetic Test Pattern Generator for Quick Demonstration
  const loadSyntheticCarrier = async (name: string, type: 'texture' | 'arch' | 'studio') => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      
      if (type === 'studio') {
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0, '#A09D94');
        grad.addColorStop(1, '#828078');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
      } else if (type === 'arch') {
        ctx.fillStyle = '#EAE8DE';
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = '#2A2D2B';
        ctx.fillRect(60, 60, 200, 320);
        ctx.fillStyle = '#C45A3D';
        ctx.beginPath();
        ctx.moveTo(300, 80);
        ctx.lineTo(440, 200);
        ctx.lineTo(300, 320);
        ctx.fill();
        ctx.fillStyle = '#526D4C';
        ctx.beginPath();
        ctx.arc(260, 360, 90, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // High texture noise pattern
        const imgData = ctx.createImageData(512, 512);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const v = Math.floor(Math.random() * 256);
          data[i] = v;
          data[i + 1] = (v * 1.1) % 256;
          data[i + 2] = (v * 0.9) % 256;
          data[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const f = new File([blob], `${name}.png`, { type: 'image/png' });
          handleCoverFile(f);
        }
      }, 'image/png');
    } catch (e: any) {
      setError(`Failed to generate sample: ${e.message}`);
    }
  };

  const payloadBytes = payloadType === 'text'
    ? (textPayload ? new TextEncoder().encode(textPayload).length : 0)
    : (secretFile ? secretFile.size : 0);

  // Payload + inner package metadata overhead (~42 bytes) + AES-GCM tag (16 bytes)
  const estimatedEncryptedBytes = payloadBytes > 0 ? payloadBytes + 42 + 16 : 0;
  const estimatedPayloadBits = estimatedEncryptedBytes * 8;
  const fits = capacity ? estimatedPayloadBits <= capacity.usable_capacity_bits : true;
  const utilizationPercent = capacity && capacity.usable_capacity_bits > 0
    ? Math.min((estimatedPayloadBits / capacity.usable_capacity_bits) * 100, 100)
    : 0;

  const onSubmit = async (data: FormData) => {
    if (!coverFile) { setError('Please select a lossless carrier image'); return; }
    if (payloadType === 'text' && !data.textPayload) { setError('Please enter a secret message to embed'); return; }
    if (payloadType === 'file' && !secretFile) { setError('Please select a secret file to embed'); return; }
    if (!fits) { setError('Payload exceeds available adaptive capacity. Select a larger carrier or reduce payload size.'); return; }

    setError(null);
    setStage('encrypting');
    setReport(null);
    if (stegoUrl) URL.revokeObjectURL(stegoUrl);
    setStegoUrl(null);

    const stepDelay = 500;
    const animateSteps = async () => {
      for (let i = 0; i < encodeSteps.length - 1; i++) {
        setActiveStepIdx(i);
        await new Promise(r => setTimeout(r, stepDelay));
      }
    };
    const stepPromise = animateSteps();

    try {
      const zipBlob = await api.encode({
        coverFile,
        payloadType,
        textPayload: data.textPayload,
        filePayload: secretFile ?? undefined,
        password: data.password,
        adaptiveConfigId: data.adaptiveConfigId,
      });

      await stepPromise;
      setActiveStepIdx(encodeSteps.length - 1);

      const zip = await JSZip.loadAsync(zipBlob);
      const pngFile = zip.file('stego.png');
      const reportFile = zip.file('report.json');

      if (pngFile) {
        const pngBlob = await pngFile.async('blob');
        const url = URL.createObjectURL(pngBlob);
        setStegoUrl(url);
      }

      if (reportFile) {
        const reportJson = await reportFile.async('string');
        const reportData = JSON.parse(reportJson) as EncodeReport;
        setReport(reportData);
        setReportBlob(new Blob([reportJson], { type: 'application/json' }));
      }

      setStage('completed');
    } catch (e: any) {
      setActiveStepIdx(-1);
      setStage('failed');
      setError(e.message || 'Encoding pipeline encountered an error');
    }
  };

  const downloadStego = () => {
    if (!stegoUrl) return;
    const a = document.createElement('a');
    a.href = stegoUrl;
    a.download = 'stego.png';
    a.click();
  };

  const downloadReport = () => {
    if (!reportBlob) return;
    const url = URL.createObjectURL(reportBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'encode_report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const steps = encodeSteps.map((s, i) => ({
    ...s,
    status: i < activeStepIdx ? ('done' as const)
      : i === activeStepIdx ? ('active' as const)
      : ('pending' as const),
  }));

  const qm = report?.quality_metrics;

  return (
    <div className="max-w-5xl">
      {/* Editorial Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="section-index">02 / EMBED</span>
          <span className="status-stamp status-stamp-neutral">SPATIAL ADAPTIVE ENCODER</span>
        </div>
        <h1 className="font-display text-4xl mb-3 text-ink font-normal">
          Conceal Payload
        </h1>
        <p className="font-sans text-sm sm:text-base max-w-2xl text-ink-soft leading-relaxed">
          Encrypt your secret data with memory-hard Argon2id and authenticated AES-256-GCM,
          then adaptively embed into textured regions of a lossless PNG carrier.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Carrier and Payload (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Section A: Carrier Image */}
            <div className="work-surface">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="section-index">A</span>
                  <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">Carrier Image</span>
                </div>
                {/* Instant Sample Loader */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-ink-muted uppercase hidden sm:inline">Samples:</span>
                  <button
                    type="button"
                    onClick={() => loadSyntheticCarrier('carrier_geometric', 'arch')}
                    className="px-2 py-0.5 text-[10px] font-mono border border-line rounded hover:border-ink transition-colors"
                  >
                    Geometric
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSyntheticCarrier('carrier_texture', 'texture')}
                    className="px-2 py-0.5 text-[10px] font-mono border border-line rounded hover:border-ink transition-colors"
                  >
                    Texture
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSyntheticCarrier('carrier_studio', 'studio')}
                    className="px-2 py-0.5 text-[10px] font-mono border border-line rounded hover:border-ink transition-colors"
                  >
                    Studio
                  </button>
                </div>
              </div>

              <ImageDropzone
                onFile={handleCoverFile}
                label="Select or drop lossless carrier image"
                hint="PNG format required (lossless). JPEG carriers will be rejected."
                currentFile={coverFile}
                disabled={stage === 'encrypting' || stage === 'embedding'}
              />

              {capacityLoading && (
                <div className="mt-4 p-3 bg-paper border border-line rounded text-xs font-mono text-ink-soft flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-signal animate-ping" />
                  <span>Computing upper 6-bit gradient &amp; variance map...</span>
                </div>
              )}

              {capacity && !capacityLoading && (
                <div className="mt-4 pt-4 border-t border-line">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                    <div>
                      <div className="metric-label">DIMENSIONS</div>
                      <div className="font-mono font-medium text-ink mt-0.5">{capacity.width} × {capacity.height}</div>
                    </div>
                    <div>
                      <div className="metric-label">USABLE CAPACITY</div>
                      <div className="font-mono font-semibold text-signal mt-0.5">{(capacity.usable_capacity_bytes / 1024).toFixed(1)} KB</div>
                    </div>
                    <div>
                      <div className="metric-label">TOTAL PIXELS</div>
                      <div className="font-mono font-medium text-ink mt-0.5">{capacity.total_pixels.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="metric-label">HEADER CHANNELS</div>
                      <div className="font-mono font-medium text-ink mt-0.5">512 LSBs (Rsvd)</div>
                    </div>
                  </div>

                  {/* Adaptive Allocation Distribution */}
                  <div className="p-3 bg-paper border border-line rounded text-[11px] font-mono">
                    <div className="text-ink-muted mb-1.5 uppercase text-[10px]">Pixel Allocation Breakdown:</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-ink-soft">0-Bit (Smooth):</span>{' '}
                        <span className="font-semibold text-ink">{capacity.zero_bit_pixels.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-ink-soft">1-Bit (Mid):</span>{' '}
                        <span className="font-semibold text-ink">{capacity.one_bit_pixels.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-ink-soft">2-Bit (Edge):</span>{' '}
                        <span className="font-semibold text-ink">{capacity.two_bit_pixels.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section B: Secret Payload */}
            <div className="work-surface">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="section-index">B</span>
                  <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">Secret Payload</span>
                </div>
                <div className="flex border border-line rounded p-0.5 bg-paper">
                  <button
                    type="button"
                    onClick={() => setPayloadType('text')}
                    className={`px-3 py-1 font-mono text-[11px] uppercase transition-colors rounded ${
                      payloadType === 'text' ? 'bg-ink text-paper font-medium' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    Text Message
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayloadType('file')}
                    className={`px-3 py-1 font-mono text-[11px] uppercase transition-colors rounded ${
                      payloadType === 'file' ? 'bg-ink text-paper font-medium' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    Secret File
                  </button>
                </div>
              </div>

              {payloadType === 'text' ? (
                <div>
                  <textarea
                    id="textPayload"
                    {...register('textPayload')}
                    className="input-field resize-none font-mono text-xs"
                    rows={6}
                    placeholder="Type or paste confidential payload message here..."
                  />
                  <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-ink-muted">
                    <span>Length: {payloadBytes} bytes (UTF-8)</span>
                    {capacity && (
                      <span style={{ color: fits ? 'var(--ink-soft)' : 'var(--signal)' }}>
                        Capacity: {(capacity.usable_capacity_bytes).toLocaleString()} bytes
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <ImageDropzone
                  onFile={setSecretFile}
                  accept="*"
                  label="Select confidential payload file"
                  hint="Any arbitrary file format (PDF, DOCX, ZIP, BIN) — Max 10 MB"
                  currentFile={secretFile}
                />
              )}

              {/* Live Capacity Gauge */}
              {capacity && payloadBytes > 0 && (
                <div className="mt-4 pt-4 border-t border-line">
                  <div className="flex items-center justify-between font-mono text-[11px] mb-1.5">
                    <span className="text-ink-soft uppercase text-[10px]">Estimated Carrier Utilization:</span>
                    <span className="font-semibold" style={{ color: fits ? 'var(--ink)' : 'var(--signal)' }}>
                      {utilizationPercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-paper border border-line rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${utilizationPercent}%`,
                        background: utilizationPercent > 90 ? 'var(--signal)' : utilizationPercent > 60 ? 'var(--warning)' : 'var(--success)',
                      }}
                    />
                  </div>
                  {!fits && (
                    <div className="mt-2 text-xs font-sans text-signal flex items-center gap-1.5">
                      <AlertCircle size={12} />
                      Payload ({payloadBytes} bytes) exceeds carrier capacity ({capacity.usable_capacity_bytes} bytes).
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Cryptography & Configuration (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Section C: Cryptographic Passphrase */}
            <div className="work-surface">
              <div className="flex items-center gap-2 mb-4">
                <span className="section-index">C</span>
                <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">Passphrase Protection</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label-field" htmlFor="password">
                    Master Passphrase
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className="input-field pr-10 font-mono text-xs"
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                      aria-label={showPassword ? 'Hide passphrase' : 'Show passphrase'}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="mt-1 font-sans text-xs text-signal">
                      {errors.password.message}
                    </div>
                  )}
                </div>

                <div>
                  <label className="label-field" htmlFor="confirmPassword">
                    Confirm Passphrase
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      className="input-field pr-10 font-mono text-xs"
                      placeholder="Re-enter passphrase"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                      aria-label={showConfirm ? 'Hide passphrase' : 'Show passphrase'}
                    >
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="mt-1 font-sans text-xs text-signal">
                      {errors.confirmPassword.message}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-paper border border-line rounded text-[11px] font-sans text-ink-soft space-y-1">
                  <div className="font-mono text-[10px] text-signal font-semibold uppercase">CRYPTOGRAPHIC NOTICE:</div>
                  <div>
                    Keys are derived per request via Argon2id. No keys, passwords, or plaintext payloads are ever persisted.
                    Losing this passphrase renders payload recovery impossible.
                  </div>
                </div>
              </div>
            </div>

            {/* Section D: Adaptive Preset */}
            <div className="work-surface">
              <div className="flex items-center gap-2 mb-4">
                <span className="section-index">D</span>
                <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">Adaptive Policy</span>
              </div>
              <div className="space-y-3">
                <select
                  {...register('adaptiveConfigId', { valueAsNumber: true })}
                  className="input-field font-mono text-xs"
                  onChange={() => {
                    if (coverFile) handleCoverFile(coverFile);
                  }}
                >
                  <option value={1}>01: Conservative (T_low=0.30, T_high=0.60) — Maximum Imperceptibility</option>
                  <option value={2}>02: Balanced (T_low=0.25, T_high=0.55) — Recommended Default</option>
                  <option value={3}>03: High Capacity (T_low=0.15, T_high=0.40) — Maximum Throughput</option>
                </select>
                <p className="font-sans text-xs text-ink-muted leading-relaxed">
                  The selected preset determines edge and variance thresholds for 0, 1, and 2-bit channel slot allocation.
                  The choice is recorded in the bootstrap header.
                </p>
              </div>
            </div>

            {/* Execution Button */}
            <button
              type="submit"
              className="btn-signal w-full py-3 text-sm shadow-md"
              disabled={!coverFile || stage === 'encrypting' || stage === 'embedding' || !fits}
            >
              <Lock size={15} />
              <span>
                {stage === 'encrypting' || stage === 'embedding' ? 'Executing Pipeline...' : 'Encode & Generate Stego Carrier'}
              </span>
            </button>

            {error && (
              <div className="p-3.5 bg-signal-soft border border-signal rounded text-xs font-sans text-signal flex items-start gap-2.5" role="alert">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">{error}</div>
              </div>
            )}
          </div>
        </div>

        {/* Processing Stepper */}
        {(stage === 'encrypting' || stage === 'embedding' || stage === 'completed') && activeStepIdx >= 0 && (
          <div className="mt-8 work-surface border-l-4 border-l-signal">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">Pipeline Execution Progress</span>
              <span className="status-stamp status-stamp-neutral">
                {stage === 'completed' ? 'EXECUTION COMPLETE' : 'PROCESSING'}
              </span>
            </div>
            <ProcessingSteps steps={steps} />
          </div>
        )}

        {/* Generated Stego Inspection & Results */}
        {stage === 'completed' && report && stegoUrl && (
          <div className="mt-8 space-y-6">
            <div className="section-rule" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="section-index">05 / ARTIFACT</span>
                <span className="status-stamp status-stamp-success">STEGO GENERATED</span>
                <h2 className="font-display text-2xl text-ink">Stego Carrier Artifact</h2>
              </div>
              <Link to="/decode" className="btn-secondary text-[11px] py-1.5 px-3">
                <span>Test in Decoder</span>
                <ArrowRight size={11} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Stego Image Inspection Frame (5 cols) */}
              <div className="md:col-span-5 work-surface">
                <div className="metric-label mb-2">STEGO PNG PREVIEW</div>
                <div className="dark-stage flex items-center justify-center p-3">
                  <div className="image-frame">
                    <img
                      src={stegoUrl}
                      alt="Generated Stego Carrier"
                      className="max-h-72 object-contain rounded-sm"
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-ink-muted">
                  <span>PNG 24-bit Lossless</span>
                  <span>{report.carrier_dimensions.width} × {report.carrier_dimensions.height}</span>
                </div>
              </div>

              {/* Forensic Metric Grid (7 cols) */}
              {qm && (
                <div className="md:col-span-7 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard
                      label="PSNR (PEAK SNR)"
                      value={qm.psnr_display}
                      description="Logarithmic fidelity (Target &gt; 40 dB)"
                      highlight={qm.psnr && qm.psnr > 40 ? 'good' : 'neutral'}
                    />
                    <MetricCard
                      label="SSIM (STRUCTURAL)"
                      value={qm.ssim.toFixed(6)}
                      description="Human visual perception (1.0 = identical)"
                      highlight={qm.ssim > 0.999 ? 'good' : 'neutral'}
                    />
                    <MetricCard
                      label="MSE (MEAN SQ ERROR)"
                      value={qm.mse.toFixed(6)}
                      description="Average squared channel deviation"
                    />
                    <MetricCard
                      label="CHANGED PIXELS"
                      value={`${(qm.changed_pixels_ratio * 100).toFixed(2)}%`}
                      description={`${qm.changed_pixels.toLocaleString()} / ${qm.total_pixels.toLocaleString()} pixels`}
                    />
                  </div>

                  {/* Cryptographic Manifest Card */}
                  <div className="p-4 bg-paper border border-line rounded text-xs font-mono space-y-1.5">
                    <div className="text-[10px] text-ink-muted uppercase tracking-wider mb-1">Authenticated Package Manifest:</div>
                    <div className="flex justify-between">
                      <span className="text-ink-soft">Cipher:</span>
                      <span className="font-semibold text-ink">{report.cipher} (AAD Header Bound)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-soft">Key Derivation:</span>
                      <span className="font-semibold text-ink">{report.kdf} (Salt: 16 Bytes)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-soft">Payload Encrypted Length:</span>
                      <span className="font-semibold text-ink">{report.encrypted_package_bytes} bytes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-soft">Capacity Utilization:</span>
                      <span className="font-semibold text-signal">{(qm.capacity_utilization * 100).toFixed(2)}%</span>
                    </div>
                  </div>

                  {/* Downloads & Verification CTA */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button type="button" onClick={downloadStego} className="btn-primary">
                      <Download size={13} />
                      <span>Download Stego.png</span>
                    </button>
                    <button type="button" onClick={downloadReport} className="btn-secondary">
                      <FileText size={13} />
                      <span>Download Report.json</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
