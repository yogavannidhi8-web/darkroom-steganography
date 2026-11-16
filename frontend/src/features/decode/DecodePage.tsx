import { useState } from 'react';
import { Eye, EyeOff, Download, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import JSZip from 'jszip';
import { ImageDropzone } from '../../components/images/ImageDropzone';
import { ProcessingSteps } from '../../components/feedback/ProcessingSteps';
import { api } from '../../services/api';
import type { VerificationReport, ProcessingStage } from '../../types';

const decodeSteps = [
  { id: 'header', label: 'Read & validate bootstrap header' },
  { id: 'map', label: 'Reconstruct adaptive embedding map' },
  { id: 'extract', label: 'Extract encrypted package' },
  { id: 'auth', label: 'AES-GCM authentication & decryption' },
  { id: 'digest', label: 'Verify SHA-256 payload digest' },
  { id: 'done', label: 'Payload released' },
];

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {ok ? <CheckCircle size={14} style={{ color: 'var(--success)' }} /> : <XCircle size={14} style={{ color: 'var(--signal)' }} />}
      <span className="font-sans text-sm" style={{ color: ok ? 'var(--success)' : 'var(--signal)' }}>{label}</span>
    </div>
  );
}

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

  const handleDecode = async () => {
    if (!stegoFile) { setError('Please upload a stego image'); return; }
    if (!password) { setError('Please enter the passphrase'); return; }

    setError(null);
    setVerification(null);
    setRecoveredText(null);
    setRecoveredBlob(null);
    setStage('extracting');
    setActiveStepIdx(0);

    const animateSteps = async () => {
      for (let i = 0; i < decodeSteps.length - 1; i++) {
        setActiveStepIdx(i);
        await new Promise(r => setTimeout(r, 600));
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
      setError(e.message || 'Decoding failed');
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
    <div className="max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="section-index">03</span>
          <span className="status-stamp status-stamp-neutral">DECODE & VERIFY</span>
        </div>
        <h1 className="font-display text-3xl mb-2">Recover Hidden Payload</h1>
        <p className="font-sans text-sm" style={{ color: 'var(--ink-soft)' }}>
          Upload a stego PNG and enter the passphrase to authenticate and extract the hidden payload.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="work-surface">
          <div className="flex items-center gap-2 mb-4">
            <span className="section-index">A</span>
            <span className="font-sans font-medium text-sm">Stego Image</span>
          </div>
          <ImageDropzone
            onFile={(f) => { setStegoFile(f); setError(null); setStage('idle'); }}
            label="Upload stego PNG"
            hint="The PNG file generated by the Encode step"
            currentFile={stegoFile}
            disabled={stage === 'extracting'}
          />
        </div>

        <div className="work-surface">
          <div className="flex items-center gap-2 mb-4">
            <span className="section-index">B</span>
            <span className="font-sans font-medium text-sm">Passphrase</span>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              className="input-field pr-10"
              placeholder="Enter the passphrase used during encoding"
              autoComplete="current-password"
              onKeyDown={(e) => e.key === 'Enter' && handleDecode()}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              aria-label={showPassword ? 'Hide' : 'Show'}
              style={{ color: 'var(--ink-soft)' }}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDecode}
          className="btn-primary w-full justify-center"
          disabled={!stegoFile || !password || stage === 'extracting'}
        >
          <Eye size={14} />
          {stage === 'extracting' ? 'Decoding…' : 'Decode & Verify'}
        </button>

        {error && (
          <div
            className="flex items-start gap-2 p-3 font-sans text-sm"
            style={{ background: 'var(--signal-soft)', borderRadius: 'var(--radius-md)', color: 'var(--signal)' }}
            role="alert"
          >
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div className="font-medium mb-1">Decoding Failed</div>
              <div>{error}</div>
              {error.toLowerCase().includes('authentication') && (
                <div className="mt-1 text-xs" style={{ color: 'var(--ink-soft)' }}>
                  This means either the passphrase is incorrect, or the stego image has been modified since encoding.
                </div>
              )}
            </div>
          </div>
        )}

        {(stage === 'extracting' || stage === 'completed' || stage === 'failed') && (
          <div className="work-surface">
            <div className="font-sans font-medium text-sm mb-4">Verification Steps</div>
            <ProcessingSteps steps={steps} />
          </div>
        )}

        {verification && stage === 'completed' && (
          <div className="work-surface">
            <div className="flex items-center gap-2 mb-4">
              <span className="status-stamp status-stamp-success">AUTHENTICATED</span>
              <span className="font-sans font-medium text-sm">Verification Report</span>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              <Check ok={verification.header_valid} label="Bootstrap header valid" />
              <Check ok={verification.header_crc_ok} label="Header CRC32 intact" />
              <Check ok={verification.dimension_match} label="Image dimensions match" />
              <Check ok={verification.gcm_authenticated} label="AES-GCM authentication passed" />
              <Check ok={verification.sha256_digest_verified} label="SHA-256 payload digest verified" />
            </div>
            <div className="section-rule" />
            <div className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>
              SHA-256: {verification.sha256_digest_hex.match(/.{1,8}/g)?.join(' ')}
            </div>
            <div className="mt-2 font-sans text-xs" style={{ color: 'var(--ink-soft)' }}>
              {verification.payload_bytes.toLocaleString()} bytes recovered · {verification.decode_time_seconds.toFixed(3)}s · {verification.cipher}
            </div>
          </div>
        )}

        {stage === 'completed' && verification?.payload_type === 'text' && recoveredText !== null && (
          <div className="work-surface">
            <div className="metric-label mb-3">RECOVERED MESSAGE</div>
            <div
              className="font-sans text-sm p-4 whitespace-pre-wrap break-words"
              style={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--ink)',
                maxHeight: '240px',
                overflowY: 'auto',
              }}
            >
              {recoveredText}
            </div>
          </div>
        )}

        {stage === 'completed' && verification?.payload_type === 'file' && recoveredBlob && (
          <div className="work-surface">
            <div className="metric-label mb-3">RECOVERED FILE</div>
            <div className="flex items-center justify-between">
              <div className="font-sans text-sm">{recoveredBlob.filename}</div>
              <button type="button" onClick={downloadRecovered} className="btn-primary">
                <Download size={14} />
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
