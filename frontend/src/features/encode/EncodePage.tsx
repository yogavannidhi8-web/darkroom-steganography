import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Download, AlertCircle, Info } from 'lucide-react';
import JSZip from 'jszip';
import { ImageDropzone } from '../../components/images/ImageDropzone';
import { MetricCard } from '../../components/metrics/MetricCard';
import { ProcessingSteps } from '../../components/feedback/ProcessingSteps';
import { api } from '../../services/api';
import type { CapacityResponse, EncodeReport, ProcessingStage } from '../../types';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  textPayload: z.string().optional(),
  adaptiveConfigId: z.number().int().min(1).max(3),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const encodeSteps = [
  { id: 'validate', label: 'Validating image' },
  { id: 'analyze', label: 'Analyzing adaptive regions' },
  { id: 'encrypt', label: 'Encrypting payload (AES-256-GCM)' },
  { id: 'embed', label: 'Embedding into carrier' },
  { id: 'metrics', label: 'Computing quality metrics' },
  { id: 'done', label: 'Complete' },
];

export function EncodePage() {
  const [coverFile, setCoverFile] = useState<File | null>(null);
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
    setCapacity(null);
    setError(null);
    setCapacityLoading(true);
    try {
      const cap = await api.getCapacity(file, adaptiveConfigId || 2);
      setCapacity(cap);
    } catch (e: any) {
      setError(`Image validation: ${e.message}`);
    } finally {
      setCapacityLoading(false);
    }
  }, [adaptiveConfigId]);

  const payloadBytes = payloadType === 'text'
    ? (textPayload ? new TextEncoder().encode(textPayload).length : 0)
    : (secretFile ? secretFile.size : 0);

  const payloadBits = payloadBytes * 8 + 512;
  const fits = capacity ? payloadBits <= capacity.usable_capacity_bits : true;

  const onSubmit = async (data: FormData) => {
    if (!coverFile) { setError('Please select a cover image'); return; }
    if (payloadType === 'text' && !data.textPayload) { setError('Please enter a message'); return; }
    if (payloadType === 'file' && !secretFile) { setError('Please select a secret file'); return; }
    if (!fits) { setError('Payload is too large for this image. Use a larger image or smaller payload.'); return; }

    setError(null);
    setStage('encrypting');
    setReport(null);
    if (stegoUrl) URL.revokeObjectURL(stegoUrl);
    setStegoUrl(null);

    const stepDelay = 600;
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
      setError(e.message || 'Encoding failed');
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
    <div className="max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="section-index">02</span>
          <span className="status-stamp status-stamp-neutral">ENCODE</span>
        </div>
        <h1 className="font-display text-3xl mb-2">Hide Secret Payload</h1>
        <p className="font-sans text-sm" style={{ color: 'var(--ink-soft)' }}>
          Encrypt and embed a message or file into a lossless carrier image using adaptive steganography.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="flex flex-col gap-5">
            <div className="work-surface">
              <div className="flex items-center gap-2 mb-4">
                <span className="section-index">A</span>
                <span className="font-sans font-medium text-sm">Carrier Image</span>
              </div>
              <ImageDropzone
                onFile={handleCoverFile}
                label="Upload cover image"
                hint="PNG recommended — lossless format required. JPEG rejected."
                currentFile={coverFile}
                disabled={stage === 'encrypting' || stage === 'embedding'}
              />
              {capacityLoading && (
                <div className="mt-3 font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>
                  Analyzing capacity…
                </div>
              )}
              {capacity && !capacityLoading && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="metric-label">Dimensions</div>
                    <div className="font-mono text-sm">{capacity.width} × {capacity.height}</div>
                  </div>
                  <div>
                    <div className="metric-label">Capacity</div>
                    <div className="font-mono text-sm">{(capacity.usable_capacity_bytes / 1024).toFixed(1)} KB</div>
                  </div>
                  <div>
                    <div className="metric-label">Config</div>
                    <div className="font-mono text-sm">{capacity.adaptive_config_name}</div>
                  </div>
                  <div>
                    <div className="metric-label">Format</div>
                    <div className="font-mono text-sm">{capacity.format}</div>
                  </div>
                  {capacity.warnings.length > 0 && (
                    <div className="col-span-2">
                      {capacity.warnings.map((w, i) => (
                        <div key={i} className="flex items-center gap-1.5 font-sans text-xs" style={{ color: 'var(--warning)' }}>
                          <AlertCircle size={11} />
                          {w}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="work-surface">
              <div className="flex items-center gap-2 mb-4">
                <span className="section-index">B</span>
                <span className="font-sans font-medium text-sm">Secret Payload</span>
              </div>
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setPayloadType('text')}
                  className={payloadType === 'text' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  Text message
                </button>
                <button
                  type="button"
                  onClick={() => setPayloadType('file')}
                  className={payloadType === 'file' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  Secret file
                </button>
              </div>
              {payloadType === 'text' ? (
                <div>
                  <label className="label-field" htmlFor="textPayload">Message</label>
                  <textarea
                    id="textPayload"
                    {...register('textPayload')}
                    className="input-field resize-none"
                    rows={5}
                    placeholder="Enter your secret message here…"
                  />
                  <div className="mt-1 font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>
                    {payloadBytes} bytes
                    {capacity && ` / ${capacity.usable_capacity_bytes} bytes capacity`}
                  </div>
                </div>
              ) : (
                <ImageDropzone
                  onFile={setSecretFile}
                  accept="*"
                  label="Upload secret file"
                  hint="Any file type — maximum 10 MB"
                  currentFile={secretFile}
                />
              )}
              {!fits && capacity && (
                <div className="mt-2 flex items-center gap-1.5 font-sans text-xs" style={{ color: 'var(--signal)' }}>
                  <AlertCircle size={11} />
                  Payload too large. Required: ~{(payloadBits / 8 / 1024).toFixed(1)} KB, Available: {(capacity.usable_capacity_bytes / 1024).toFixed(1)} KB
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-5">
            <div className="work-surface">
              <div className="flex items-center gap-2 mb-4">
                <span className="section-index">C</span>
                <span className="font-sans font-medium text-sm">Protection</span>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="label-field" htmlFor="password">
                    <Lock size={11} style={{ display: 'inline', marginRight: '4px' }} />
                    Passphrase
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className="input-field pr-10"
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{ color: 'var(--ink-soft)' }}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="mt-1 font-sans text-xs" style={{ color: 'var(--signal)' }}>
                      {errors.password.message}
                    </div>
                  )}
                </div>
                <div>
                  <label className="label-field" htmlFor="confirmPassword">Confirm passphrase</label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      className="input-field pr-10"
                      placeholder="Repeat passphrase"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      aria-label={showConfirm ? 'Hide' : 'Show'}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--ink-soft)' }}
                    >
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="mt-1 font-sans text-xs" style={{ color: 'var(--signal)' }}>
                      {errors.confirmPassword.message}
                    </div>
                  )}
                </div>
                <div
                  className="flex items-start gap-2 p-3 font-sans text-xs"
                  style={{ background: 'var(--signal-soft)', borderRadius: 'var(--radius-md)', color: 'var(--ink-soft)' }}
                >
                  <Info size={12} style={{ flexShrink: 0, marginTop: '1px' }} />
                  Losing the passphrase means the hidden payload cannot be recovered. Never store it alongside the stego image.
                </div>
              </div>
            </div>

            <div className="work-surface">
              <div className="flex items-center gap-2 mb-4">
                <span className="section-index">D</span>
                <span className="font-sans font-medium text-sm">Adaptive Preset</span>
              </div>
              <select
                {...register('adaptiveConfigId', { valueAsNumber: true })}
                className="input-field"
                onChange={() => {
                  if (coverFile) handleCoverFile(coverFile);
                }}
              >
                <option value={1}>Conservative (highest imperceptibility)</option>
                <option value={2}>Balanced (recommended)</option>
                <option value={3}>High Capacity (more embedding space)</option>
              </select>
              <div className="mt-2 font-sans text-xs" style={{ color: 'var(--ink-soft)' }}>
                Adaptive LSB (1–2 bits per channel) — prioritizes texture, edges and gradients.
              </div>
            </div>

            <button
              type="submit"
              className="btn-signal w-full justify-center"
              disabled={!coverFile || stage === 'encrypting' || stage === 'embedding' || !fits}
            >
              <Lock size={14} />
              {stage === 'encrypting' || stage === 'embedding' ? 'Encoding…' : 'Encode & Embed'}
            </button>

            {error && (
              <div
                className="flex items-start gap-2 p-3 font-sans text-sm"
                style={{ background: 'var(--signal-soft)', borderRadius: 'var(--radius-md)', color: 'var(--signal)' }}
                role="alert"
              >
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Processing Steps */}
        {(stage === 'encrypting' || stage === 'embedding' || stage === 'completed') && activeStepIdx >= 0 && (
          <div className="mt-6 work-surface">
            <div className="font-sans font-medium text-sm mb-4">Processing</div>
            <ProcessingSteps steps={steps} />
          </div>
        )}

        {/* Results */}
        {stage === 'completed' && report && stegoUrl && (
          <div className="mt-6 flex flex-col gap-5">
            <div className="section-rule" />
            <div className="flex items-center gap-3">
              <span className="section-index">05</span>
              <span className="status-stamp status-stamp-success">AUTHENTICATED</span>
              <h2 className="font-display text-xl">Encoding Complete</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="metric-label mb-2">STEGO IMAGE</div>
                <div className="dark-stage p-4">
                  <div className="image-frame inline-block">
                    <img
                      src={stegoUrl}
                      alt="Generated stego"
                      className="max-w-full max-h-64 object-contain"
                      style={{ display: 'block' }}
                    />
                  </div>
                </div>
              </div>

              {qm && (
                <div className="flex flex-col gap-3">
                  <div className="metric-label">QUALITY METRICS</div>
                  <div className="grid grid-cols-2 gap-2">
                    <MetricCard label="PSNR" value={qm.psnr_display} description="Higher = better" highlight={qm.psnr && qm.psnr > 40 ? 'good' : 'neutral'} />
                    <MetricCard label="SSIM" value={qm.ssim.toFixed(6)} description="1.0 = identical" highlight={qm.ssim > 0.99 ? 'good' : 'neutral'} />
                    <MetricCard label="MSE" value={qm.mse.toFixed(6)} description="Lower = better" />
                    <MetricCard label="Changed Pixels" value={`${(qm.changed_pixels_ratio * 100).toFixed(2)}%`} description={`${qm.changed_pixels.toLocaleString()} pixels`} />
                  </div>
                  <div className="metric-label">Capacity Utilization</div>
                  <div className="relative h-2 bg-line rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${Math.min(qm.capacity_utilization * 100, 100).toFixed(1)}%`,
                        background: 'var(--signal)',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                  <div className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>
                    {(qm.capacity_utilization * 100).toFixed(1)}% — {qm.payload_bytes.toLocaleString()} / {qm.capacity_bytes.toLocaleString()} bytes
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={downloadStego} className="btn-primary">
                <Download size={14} />
                Download stego.png
              </button>
              <button type="button" onClick={downloadReport} className="btn-secondary">
                <Download size={14} />
                Download report.json
              </button>
            </div>

            <div
              className="p-3 font-sans text-xs"
              style={{ background: 'var(--paper-raised)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', color: 'var(--ink-soft)' }}
            >
              The stego PNG is lossless. Use the Decode page with the same passphrase to verify extraction. Keep the passphrase safe.
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
