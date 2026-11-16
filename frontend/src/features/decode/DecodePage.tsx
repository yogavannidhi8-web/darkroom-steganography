import { useState } from 'react';
import { Eye, EyeOff, Download, AlertCircle, Copy, Check, ShieldCheck, Lock } from 'lucide-react';
import JSZip from 'jszip';
import { ImageDropzone } from '../../components/images/ImageDropzone';
import { ProcessingSteps } from '../../components/feedback/ProcessingSteps';
import { api } from '../../services/api';
import type { VerificationReport, ProcessingStage } from '../../types';

const decodeSteps = [
  { id: 'recognize', label: 'Recognizing image format & structure' },
  { id: 'verify', label: 'Verifying passphrase & authentication' },
  { id: 'recover', label: 'Recovering secret content' },
];

export function DecodePage() {
  const [stegoFile, setStegoFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [activeStepIdx, setActiveStepIdx] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [verification, setVerification] = useState<VerificationReport | null>(null);
  const [recoveredText, setRecoveredText] = useState<string | null>(null);
  const [recoveredBlob, setRecoveredBlob] = useState<{ blob: Blob; filename: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDecode = async () => {
    if (!stegoFile) { setError('Please select a protected image first'); return; }
    if (!password) { setError('Please enter the passphrase'); return; }

    setError(null);
    setVerification(null);
    setRecoveredText(null);
    setRecoveredBlob(null);
    setStage('extracting');
    setActiveStepIdx(0);

    const stepDelay = 400;
    const animateSteps = async () => {
      for (let i = 0; i < decodeSteps.length - 1; i++) {
        setActiveStepIdx(i);
        await new Promise(r => setTimeout(r, stepDelay));
      }
    };
    const stepPromise = animateSteps();

    try {
      const zipBlob = await api.decode(stegoFile, password);
      await stepPromise;
      setActiveStepIdx(decodeSteps.length - 1);

      const zip = await JSZip.loadAsync(zipBlob);
      const verificationFile = zip.file('verification.json');
      
      if (verificationFile) {
        const verJson = await verificationFile.async('string');
        const ver = JSON.parse(verJson) as VerificationReport;
        setVerification(ver);

        const files = Object.keys(zip.files).filter(n => n !== 'verification.json');
        if (files.length > 0) {
          const fname = files[0];
          const fblob = await zip.file(fname)!.async('blob');
          
          if (ver.payload_type === 'text') {
            const text = await fblob.text();
            setRecoveredText(text);
          } else {
            setRecoveredBlob({ blob: fblob, filename: fname });
          }
        }
      }

      setStage('completed');
    } catch (e: any) {
      await stepPromise;
      setActiveStepIdx(-1);
      setStage('failed');
      const rawMsg = e.message || '';
      if (rawMsg.toLowerCase().includes('tag') || rawMsg.toLowerCase().includes('argon') || rawMsg.toLowerCase().includes('corrupt') || rawMsg.toLowerCase().includes('hash')) {
        setError('Incorrect passphrase or the protected image has been modified in transit.');
      } else {
        setError(rawMsg || 'Verification failed. The passphrase may be incorrect or the image is not a valid carrier.');
      }
    }
  };

  const copyText = () => {
    if (recoveredText) {
      navigator.clipboard.writeText(recoveredText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadRecovered = () => {
    if (!recoveredBlob) return;
    const url = URL.createObjectURL(recoveredBlob.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = recoveredBlob.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const steps = decodeSteps.map((s, i) => ({
    ...s,
    status: stage === 'failed' && i === activeStepIdx ? ('error' as const)
      : i < activeStepIdx ? ('done' as const)
      : i === activeStepIdx ? ('active' as const)
      : ('pending' as const),
  }));

  return (
    <div className="max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl mb-2 text-ink font-normal">
          Verify &amp; Recover
        </h1>
        <p className="font-sans text-sm text-ink-soft leading-relaxed">
          Upload a protected image and enter the passphrase to retrieve the hidden message or file.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Choose Image */}
        <div className="work-surface">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-full bg-paper border border-line flex items-center justify-center font-mono text-[10px] text-ink font-semibold">1</span>
            <span className="font-sans text-sm font-semibold text-ink">Select Protected Image</span>
          </div>
          <ImageDropzone
            onFile={(f) => { setStegoFile(f); setError(null); setStage('idle'); setVerification(null); }}
            label="Drop protected image here, or browse"
            hint="Lossless PNG containing embedded content"
            currentFile={stegoFile}
            disabled={stage === 'extracting'}
          />
        </div>

        {/* Step 2: Passphrase */}
        <div className="work-surface">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-full bg-paper border border-line flex items-center justify-center font-mono text-[10px] text-ink font-semibold">2</span>
            <span className="font-sans text-sm font-semibold text-ink">Enter Passphrase</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  className="input-field pr-10 font-mono text-xs"
                  placeholder="Enter the passphrase used when protecting this image"
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === 'Enter' && handleDecode()}
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
            </div>

            <button
              type="button"
              onClick={handleDecode}
              className="btn-signal w-full py-3 text-sm shadow-md flex items-center justify-center gap-2"
              disabled={!stegoFile || !password || stage === 'extracting'}
            >
              <Lock size={15} />
              <span>{stage === 'extracting' ? 'Verifying & Recovering...' : 'Recover Content'}</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-signal-soft border border-signal rounded text-xs font-sans text-signal space-y-1" role="alert">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle size={15} />
              <span>Verification Failed</span>
            </div>
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {/* Stepper Progress */}
        {(stage === 'extracting' || stage === 'completed' || stage === 'failed') && (
          <div className="work-surface border-l-4 border-l-signal">
            <div className="flex items-center justify-between mb-4">
              <span className="font-sans text-xs uppercase tracking-wider text-ink font-semibold">Status</span>
              <span className="font-mono text-xs" style={{ color: stage === 'completed' ? 'var(--success)' : stage === 'failed' ? 'var(--signal)' : 'var(--ink-soft)' }}>
                {stage === 'completed' ? 'VERIFIED' : stage === 'failed' ? 'VERIFICATION FAILED' : 'WORKING...'}
              </span>
            </div>
            <ProcessingSteps steps={steps} />
          </div>
        )}

        {/* Recovered Content Display */}
        {stage === 'completed' && verification && (
          <div className="work-surface space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-line text-success">
              <ShieldCheck size={20} />
              <h2 className="font-display text-2xl text-ink">Content Verified &amp; Recovered</h2>
            </div>

            {recoveredText !== null && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-semibold text-ink">Recovered Text Message</span>
                  <button
                    type="button"
                    onClick={copyText}
                    className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5"
                  >
                    {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
                <div className="p-4 bg-paper border border-line rounded font-sans text-xs leading-relaxed text-ink whitespace-pre-wrap break-words">
                  {recoveredText}
                </div>
              </div>
            )}

            {recoveredBlob && (
              <div className="p-4 bg-paper border border-line rounded flex items-center justify-between">
                <div>
                  <div className="font-sans text-xs font-semibold text-ink mb-0.5">Recovered File: {recoveredBlob.filename}</div>
                  <div className="font-mono text-[11px] text-ink-muted">Size: {(recoveredBlob.blob.size / 1024).toFixed(1)} KB</div>
                </div>
                <button
                  type="button"
                  onClick={downloadRecovered}
                  className="btn-signal text-xs py-2 px-3 flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Download File</span>
                </button>
              </div>
            )}

            {/* Progressive Disclosure: Technical Verification Details */}
            <details className="text-xs text-ink-soft">
              <summary className="font-sans text-[11px] text-ink-muted hover:text-ink cursor-pointer">
                View technical verification details
              </summary>
              <div className="mt-3 p-3 bg-paper border border-line rounded space-y-2 font-mono text-[11px]">
                <div className="flex items-center justify-between text-success">
                  <span>Header Format &amp; CRC32:</span>
                  <span>PASSED</span>
                </div>
                <div className="flex items-center justify-between text-success">
                  <span>Cryptographic Authentication:</span>
                  <span>PASSED</span>
                </div>
                <div className="flex items-center justify-between text-success">
                  <span>Payload Integrity Hash:</span>
                  <span>PASSED</span>
                </div>
                <div className="pt-2 border-t border-line text-[10px] text-ink-muted">
                  SHA-256 digest: {verification.sha256_digest_hex ? verification.sha256_digest_hex.slice(0, 32) + '...' : 'Verified'}
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
