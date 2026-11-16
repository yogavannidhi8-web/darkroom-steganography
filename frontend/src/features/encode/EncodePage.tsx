import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Download, AlertCircle, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
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
  adaptiveConfigId: z.number().default(2),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passphrases do not match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const encodeSteps = [
  { id: 'prepare', label: 'Preparing carrier image' },
  { id: 'secure', label: 'Securing payload with passphrase' },
  { id: 'embed', label: 'Adaptively embedding into image textures' },
  { id: 'verify', label: 'Verifying image fidelity and integrity' },
  { id: 'done', label: 'Ready to download' },
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
    setCapacityLoading(true);
    setError(null);

    try {
      const cap = await api.getCapacity(file, adaptiveConfigId);
      setCapacity(cap);
    } catch (e: any) {
      setError(e.message || 'Failed to inspect carrier capacity');
    } finally {
      setCapacityLoading(false);
    }
  }, [adaptiveConfigId, coverPreviewUrl]);

  // Synthetic carrier generator for instant preview/testing
  const loadSyntheticCarrier = (type: 'smooth' | 'texture') => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (type === 'smooth') {
        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, '#EAE8DE');
        grad.addColorStop(0.5, '#D5D2C4');
        grad.addColorStop(1, '#B8B4A4');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
      } else {
        const imgData = ctx.createImageData(512, 512);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const v = Math.floor(Math.random() * 200 + 30);
          data[i] = v;
          data[i + 1] = (v * 1.05) % 256;
          data[i + 2] = (v * 0.95) % 256;
          data[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const f = new File([blob], `sample_${type}_512x512.png`, { type: 'image/png' });
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

  const estimatedEncryptedBytes = payloadBytes > 0 ? payloadBytes + 58 : 0;
  const estimatedPayloadBits = estimatedEncryptedBytes * 8;
  const fits = capacity ? estimatedPayloadBits <= capacity.usable_capacity_bits : true;
  const utilizationPercent = capacity && capacity.usable_capacity_bits > 0
    ? Math.min((estimatedPayloadBits / capacity.usable_capacity_bits) * 100, 100)
    : 0;

  const onSubmit = async (data: FormData) => {
    if (!coverFile) { setError('Please select an image first'); return; }
    if (payloadType === 'text' && !data.textPayload) { setError('Please enter a secret message to embed'); return; }
    if (payloadType === 'file' && !secretFile) { setError('Please select a secret file to embed'); return; }
    if (!fits) { setError('Payload exceeds available capacity. Use a larger image or reduce payload size.'); return; }

    setError(null);
    setStage('encrypting');
    setReport(null);
    if (stegoUrl) URL.revokeObjectURL(stegoUrl);
    setStegoUrl(null);

    const stepDelay = 400;
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
      setError(e.message || 'Encoding failed. Please check your inputs.');
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
    a.download = 'security_report.json';
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
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl mb-2 text-ink font-normal">
          Protect &amp; Conceal
        </h1>
        <p className="font-sans text-sm text-ink-soft leading-relaxed">
          Hide confidential text or files inside an image with passphrase protection.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-6">
          {/* Step 1: Choose Image */}
          <div className="work-surface">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-paper border border-line flex items-center justify-center font-mono text-[10px] text-ink font-semibold">1</span>
                <span className="font-sans text-sm font-semibold text-ink">Choose Carrier Image</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-ink-muted hidden sm:inline">Quick samples:</span>
                <button
                  type="button"
                  onClick={() => loadSyntheticCarrier('smooth')}
                  className="font-sans text-[11px] text-ink-soft hover:text-ink underline"
                >
                  Gradient
                </button>
                <span className="text-line">·</span>
                <button
                  type="button"
                  onClick={() => loadSyntheticCarrier('texture')}
                  className="font-sans text-[11px] text-ink-soft hover:text-ink underline"
                >
                  Texture
                </button>
              </div>
            </div>

            <ImageDropzone
              onFile={handleCoverFile}
              label="Drop carrier image here, or browse"
              hint="Lossless PNG, BMP, or TIFF format"
              currentFile={coverFile}
            />

            {capacityLoading && (
              <div className="mt-3 text-xs font-sans text-ink-soft">
                Inspecting image capacity...
              </div>
            )}

            {capacity && (
              <div className="mt-4 pt-4 border-t border-line">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="metric-label">DIMENSIONS</div>
                    <div className="font-mono font-medium text-ink mt-0.5">{capacity.width} × {capacity.height} px</div>
                  </div>
                  <div>
                    <div className="metric-label">AVAILABLE CAPACITY</div>
                    <div className="font-mono font-semibold text-signal mt-0.5">{(capacity.usable_capacity_bytes / 1024).toFixed(1)} KB</div>
                  </div>
                  <div>
                    <div className="metric-label">STATUS</div>
                    <div className="font-mono font-semibold mt-0.5" style={{ color: fits ? 'var(--success)' : 'var(--signal)' }}>
                      {fits ? 'Ready' : 'Exceeds Capacity'}
                    </div>
                  </div>
                </div>

                {/* Progressive Disclosure: Technical Capacity Details */}
                <details className="mt-3 text-xs text-ink-soft">
                  <summary className="font-sans text-[11px] text-ink-muted hover:text-ink cursor-pointer">
                    View allocation details
                  </summary>
                  <div className="mt-2 p-3 bg-paper border border-line rounded text-[11px] font-mono grid grid-cols-3 gap-2">
                    <div>Smooth regions: <span className="font-semibold text-ink">{capacity.zero_bit_pixels.toLocaleString()} px</span></div>
                    <div>Medium texture: <span className="font-semibold text-ink">{capacity.one_bit_pixels.toLocaleString()} px</span></div>
                    <div>High detail edges: <span className="font-semibold text-ink">{capacity.two_bit_pixels.toLocaleString()} px</span></div>
                  </div>
                </details>
              </div>
            )}
          </div>

          {/* Step 2: Secret Payload */}
          <div className="work-surface">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-paper border border-line flex items-center justify-center font-mono text-[10px] text-ink font-semibold">2</span>
                <span className="font-sans text-sm font-semibold text-ink">Add Secret Content</span>
              </div>
              <div className="flex border border-line rounded p-0.5 bg-paper">
                <button
                  type="button"
                  onClick={() => setPayloadType('text')}
                  className={`px-3 py-1 font-sans text-xs transition-colors rounded ${
                    payloadType === 'text' ? 'bg-ink text-paper font-medium' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Text Message
                </button>
                <button
                  type="button"
                  onClick={() => setPayloadType('file')}
                  className={`px-3 py-1 font-sans text-xs transition-colors rounded ${
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
                  className="input-field resize-none font-sans text-xs"
                  rows={4}
                  placeholder="Enter confidential message to hide inside the image..."
                />
                <div className="mt-2 flex items-center justify-between font-sans text-xs text-ink-muted">
                  <span>Size: {payloadBytes} bytes</span>
                  {capacity && (
                    <span style={{ color: fits ? 'var(--ink-soft)' : 'var(--signal)' }}>
                      Available: {(capacity.usable_capacity_bytes).toLocaleString()} bytes
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <ImageDropzone
                onFile={setSecretFile}
                accept="*"
                label="Choose secret file to embed"
                hint="Any document, PDF, or binary file up to 10 MB"
                currentFile={secretFile}
              />
            )}

            {/* Capacity Gauge */}
            {capacity && payloadBytes > 0 && (
              <div className="mt-4 pt-3 border-t border-line">
                <div className="flex items-center justify-between font-sans text-xs mb-1.5">
                  <span className="text-ink-soft">Capacity used:</span>
                  <span className="font-medium" style={{ color: fits ? 'var(--ink)' : 'var(--signal)' }}>
                    {utilizationPercent.toFixed(1)}%
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
              </div>
            )}
          </div>

          {/* Step 3: Passphrase Protection */}
          <div className="work-surface">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-paper border border-line flex items-center justify-center font-mono text-[10px] text-ink font-semibold">3</span>
              <span className="font-sans text-sm font-semibold text-ink">Set Passphrase</span>
            </div>

            <p className="font-sans text-xs text-ink-soft mb-4">
              Use a strong passphrase. You will need this exact passphrase to recover the protected content later.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-field" htmlFor="password">
                  Passphrase
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="input-field pr-10 font-mono text-xs"
                    placeholder="At least 8 characters"
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
                    placeholder="Repeat passphrase"
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
            </div>

            {/* Policy Selector as an unobtrusive option */}
            <div className="mt-4 pt-3 border-t border-line">
              <label className="label-field" htmlFor="adaptiveConfigId">
                Embedding Mode
              </label>
              <select
                id="adaptiveConfigId"
                {...register('adaptiveConfigId', { valueAsNumber: true })}
                className="input-field font-sans text-xs"
                onChange={() => {
                  if (coverFile) handleCoverFile(coverFile);
                }}
              >
                <option value={2}>Balanced (Recommended Default)</option>
                <option value={1}>Conservative (Maximum Quality)</option>
                <option value={3}>High Capacity (Maximum Space)</option>
              </select>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="btn-signal w-full py-3 text-sm shadow-md flex items-center justify-center gap-2"
            disabled={!coverFile || stage === 'encrypting' || stage === 'embedding' || !fits}
          >
            <Lock size={15} />
            <span>
              {stage === 'encrypting' || stage === 'embedding' ? 'Securing & Embedding...' : 'Protect Image'}
            </span>
          </button>

          {error && (
            <div className="p-3.5 bg-signal-soft border border-signal rounded text-xs font-sans text-signal flex items-start gap-2.5" role="alert">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}
        </div>

        {/* Processing Stepper */}
        {(stage === 'encrypting' || stage === 'embedding' || stage === 'completed') && activeStepIdx >= 0 && (
          <div className="mt-8 work-surface border-l-4 border-l-signal">
            <div className="flex items-center justify-between mb-4">
              <span className="font-sans text-xs uppercase tracking-wider text-ink font-semibold">Progress</span>
              <span className="font-mono text-xs text-ink-muted">
                {stage === 'completed' ? 'Complete' : 'Working...'}
              </span>
            </div>
            <ProcessingSteps steps={steps} />
          </div>
        )}

        {/* Generated Stego Inspection & Results */}
        {stage === 'completed' && report && stegoUrl && (
          <div className="mt-8 work-surface space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-success" />
                <h2 className="font-display text-2xl text-ink">Image Protected Successfully</h2>
              </div>
              <Link to="/decode" className="btn-secondary text-xs py-1.5 px-3">
                <span>Test in Decoder</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Stego Image Inspection Frame (5 cols) */}
              <div className="md:col-span-5">
                <div className="metric-label mb-2">PROTECTED IMAGE</div>
                <div className="dark-stage flex items-center justify-center p-3">
                  <div className="image-frame">
                    <img
                      src={stegoUrl}
                      alt="Generated Protected Image"
                      className="max-h-64 object-contain rounded-sm"
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs font-sans text-ink-muted">
                  <span>PNG Lossless</span>
                  <span>{report.carrier_dimensions.width} × {report.carrier_dimensions.height} px</span>
                </div>
              </div>

              {/* Quality Metric Grid (7 cols) */}
              {qm && (
                <div className="md:col-span-7 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard
                      label="FIDELITY (PSNR)"
                      value={qm.psnr_display}
                      description="Imperceptible (&gt; 40 dB target)"
                      highlight={qm.psnr && qm.psnr > 40 ? 'good' : 'neutral'}
                    />
                    <MetricCard
                      label="SIMILARITY (SSIM)"
                      value={qm.ssim.toFixed(5)}
                      description="1.0 = identical to human eye"
                      highlight={qm.ssim > 0.999 ? 'good' : 'neutral'}
                    />
                    <MetricCard
                      label="MSE ERROR"
                      value={qm.mse.toFixed(5)}
                      description="Negligible deviation"
                    />
                    <MetricCard
                      label="ALTERED PIXELS"
                      value={`${(qm.changed_pixels_ratio * 100).toFixed(2)}%`}
                      description={`${qm.changed_pixels.toLocaleString()} pixels`}
                    />
                  </div>

                  {/* Progressive Disclosure: Technical Security Details */}
                  <details className="text-xs text-ink-soft">
                    <summary className="font-sans text-[11px] text-ink-muted hover:text-ink cursor-pointer">
                      View security details
                    </summary>
                    <div className="mt-2 p-3 bg-paper border border-line rounded text-[11px] font-mono space-y-1">
                      <div className="flex justify-between">
                        <span>Encryption:</span>
                        <span className="font-semibold text-ink">{report.cipher}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Key derivation:</span>
                        <span className="font-semibold text-ink">{report.kdf}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Encrypted package size:</span>
                        <span className="font-semibold text-ink">{report.encrypted_package_bytes} bytes</span>
                      </div>
                    </div>
                  </details>

                  {/* Downloads & Links */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button type="button" onClick={downloadStego} className="btn-signal text-xs py-2 px-4 flex items-center gap-1.5">
                      <Download size={13} />
                      <span>Download Protected Image</span>
                    </button>
                    <button type="button" onClick={downloadReport} className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5">
                      <FileText size={13} />
                      <span>Download Security Report</span>
                    </button>
                    <Link to="/analysis" className="text-xs font-sans text-ink-soft hover:text-ink underline ml-1">
                      Inspect in Quality Analysis →
                    </Link>
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
