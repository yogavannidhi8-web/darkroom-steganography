import { useState } from 'react';
import { Eye, EyeOff, Download, AlertCircle, CheckCircle, XCircle, Copy, Check, ShieldCheck } from 'lucide-react';
import JSZip from 'jszip';
import { ImageDropzone } from '../../components/images/ImageDropzone';
import { ProcessingSteps } from '../../components/feedback/ProcessingSteps';
import { api } from '../../services/api';
import type { VerificationReport, ProcessingStage } from '../../types';

const decodeSteps = [
  { id: 'header', label: 'Extract & parse 64-byte bootstrap header' },
  { id: 'crc', label: 'Validate header CRC32 & dimension consistency' },
  { id: 'kdf', label: 'Derive master & position subkeys via Argon2id' },
  { id: 'map', label: 'Reconstruct identical upper 6-bit adaptive map' },
  { id: 'extract', label: 'Extract encrypted bitstream using keyed permutation' },
  { id: 'auth', label: 'Verify AES-256-GCM tag (AAD bound) & decrypt' },
  { id: 'digest', label: 'Constant-time verification of SHA-256 payload digest' },
  { id: 'release', label: 'Authenticated payload released' },
];

function VerificationCheckRow({ ok, label, desc }: { ok: boolean; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-line last:border-b-0 font-mono text-xs">
      <div className="mt-0.5">
        {ok ? (
          <CheckCircle size={14} className="text-success" />
        ) : (
          <XCircle size={14} className="text-signal" />
        )}
      </div>
      <div className="flex-1">
        <div className={`font-semibold ${ok ? 'text-ink' : 'text-signal'}`}>{label}</div>
        <div className="text-[11px] text-ink-muted">{desc}</div>
      </div>
      <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase ${
        ok ? 'border-success text-success bg-[var(--success-soft)]' : 'border-signal text-signal bg-signal-soft'
      }`}>
        {ok ? 'PASSED' : 'FAILED'}
      </span>
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
  const [copied, setCopied] = useState(false);

  const handleDecode = async () => {
    if (!stegoFile) { setError('Please upload a stego carrier PNG'); return; }
    if (!password) { setError('Please enter the secret passphrase'); return; }

    setError(null);
    setVerification(null);
    setRecoveredText(null);
    setRecoveredBlob(null);
    setStage('extracting');
    setActiveStepIdx(0);

    const stepDelay = 450;
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
      setError(e.message || 'Extraction or authentication failed');
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
      {/* Editorial Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="section-index">03 / EXTRACT</span>
          <span className="status-stamp status-stamp-neutral">AUTHENTICATED DECODER</span>
        </div>
        <h1 className="font-display text-4xl mb-3 text-ink font-normal">
          Decode &amp; Verify
        </h1>
        <p className="font-sans text-sm sm:text-base max-w-2xl text-ink-soft leading-relaxed">
          Upload an encoded stego image and provide the secret passphrase. The system reconstructs the
          upper 6-bit candidate map, decrypts with AES-256-GCM, and releases the payload only after SHA-256 verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload & Passphrase (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="work-surface">
            <div className="flex items-center gap-2 mb-4">
              <span className="section-index">A</span>
              <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">Stego Carrier Artifact</span>
            </div>
            <ImageDropzone
              onFile={(f) => { setStegoFile(f); setError(null); setStage('idle'); }}
              label="Select or drop encoded stego PNG"
              hint="Requires lossless PNG containing the embedded bootstrap header"
              currentFile={stegoFile}
              disabled={stage === 'extracting'}
            />
          </div>

          <div className="work-surface">
            <div className="flex items-center gap-2 mb-4">
              <span className="section-index">B</span>
              <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">Passphrase Authentication</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-field" htmlFor="password">
                  Secret Passphrase
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    className="input-field pr-10 font-mono text-xs"
                    placeholder="Enter the passphrase used during encoding"
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
                className="btn-primary w-full py-3 text-sm shadow-md"
                disabled={!stegoFile || !password || stage === 'extracting'}
              >
                <Eye size={15} />
                <span>{stage === 'extracting' ? 'Extracting & Verifying...' : 'Authenticate & Recover Payload'}</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-signal-soft border border-signal rounded text-xs font-sans text-signal space-y-2" role="alert">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle size={15} />
                <span>Verification Rejection</span>
              </div>
              <p className="leading-relaxed">{error}</p>
              <div className="pt-2 border-t border-signal/30 text-[11px] font-mono text-ink-soft">
                Security Policy: If the passphrase is wrong or any pixel was modified in transit,
                AES-GCM tag authentication fails atomically. Zero partial plaintext is released.
              </div>
            </div>
          )}

          {/* Stepper Progress */}
          {(stage === 'extracting' || stage === 'completed' || stage === 'failed') && (
            <div className="work-surface border-l-4 border-l-signal">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">Verification Pipeline</span>
                <span className="status-stamp status-stamp-neutral">
                  {stage === 'completed' ? 'ALL CHECKS PASSED' : stage === 'failed' ? 'VERIFICATION FAILED' : 'AUDITING'}
                </span>
              </div>
              <ProcessingSteps steps={steps} />
            </div>
          )}
        </div>

        {/* Right Column: Verification Manifest & Recovered Payload (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {stage === 'completed' && verification && (
            <>
              {/* Authenticated Verification Manifest */}
              <div className="work-surface border-l-4 border-l-success">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-success" />
                    <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">Security Verification</span>
                  </div>
                  <span className="status-stamp status-stamp-success">AUTHENTICATED</span>
                </div>

                <div className="space-y-1 mb-4">
                  <VerificationCheckRow
                    ok={verification.header_valid}
                    label="Bootstrap Header Structure"
                    desc="Magic bytes b'DRKRM\x01\x00\x00' recognized"
                  />
                  <VerificationCheckRow
                    ok={verification.header_crc_ok}
                    label="Header CRC32 Checksum"
                    desc="Zero corruption detected in metadata"
                  />
                  <VerificationCheckRow
                    ok={verification.dimension_match}
                    label="Carrier Geometry"
                    desc="Stored dimensions match decoded pixel array"
                  />
                  <VerificationCheckRow
                    ok={verification.gcm_authenticated}
                    label="AES-256-GCM AEAD Tag"
                    desc="Payload ciphertext &amp; AAD header authenticated"
                  />
                  <VerificationCheckRow
                    ok={verification.sha256_digest_verified}
                    label="SHA-256 Payload Digest"
                    desc="Exact bit-for-bit payload integrity verified"
                  />
                </div>

                <div className="p-3 bg-paper border border-line rounded font-mono text-[11px] space-y-1">
                  <div className="text-[10px] text-ink-muted uppercase">SHA-256 DIGEST:</div>
                  <div className="text-ink break-all font-semibold">
                    {verification.sha256_digest_hex}
                  </div>
                  <div className="text-[10px] text-ink-muted pt-1 flex justify-between">
                    <span>Decrypted in {verification.decode_time_seconds.toFixed(3)}s</span>
                    <span>{verification.payload_bytes.toLocaleString()} bytes</span>
                  </div>
                </div>
              </div>

              {/* Recovered Message Panel */}
              {verification.payload_type === 'text' && recoveredText !== null && (
                <div className="work-surface">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs uppercase tracking-wider text-ink font-semibold">
                      Recovered Plaintext Message
                    </span>
                    <button
                      type="button"
                      onClick={copyText}
                      className="btn-secondary text-[10px] py-1 px-2.5 flex items-center gap-1"
                    >
                      {copied ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-4 bg-paper border border-line rounded font-mono text-xs text-ink whitespace-pre-wrap break-words max-h-64 overflow-y-auto leading-relaxed">
                    {recoveredText}
                  </div>
                  <div className="mt-2 text-[11px] font-mono text-ink-muted flex justify-between">
                    <span>Characters: {recoveredText.length}</span>
                    <span>UTF-8 Encoded</span>
                  </div>
                </div>
              )}

              {/* Recovered File Panel */}
              {verification.payload_type === 'file' && recoveredBlob && (
                <div className="work-surface">
                  <div className="metric-label mb-3">RECOVERED FILE ARTIFACT</div>
                  <div className="p-4 bg-paper border border-line rounded flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded border border-line bg-paper-raised flex items-center justify-center font-mono text-xs font-semibold text-ink">
                        FILE
                      </div>
                      <div>
                        <div className="font-mono text-xs font-semibold text-ink">{recoveredBlob.filename}</div>
                        <div className="font-mono text-[11px] text-ink-muted">
                          {(recoveredBlob.blob.size / 1024).toFixed(1)} KB ({recoveredBlob.blob.size.toLocaleString()} bytes)
                        </div>
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={downloadRecovered} className="btn-primary w-full">
                    <Download size={14} />
                    <span>Download {recoveredBlob.filename}</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* Idle Explanatory Panel */}
          {stage !== 'completed' && (
            <div className="work-surface">
              <span className="status-stamp status-stamp-neutral mb-3">INTEGRITY GUARANTEE</span>
              <h3 className="font-display text-lg mb-2 text-ink">Two-Layer Cryptographic Shield</h3>
              <p className="font-sans text-xs text-ink-soft leading-relaxed mb-4">
                This steganography system operates under zero-trust assumptions. Even if an adversary modifies
                a single carrier pixel or modifies the bootstrap header bytes, extraction halts before releasing any plaintext.
              </p>
              <div className="space-y-2 font-mono text-[11px] text-ink-muted">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal" />
                  <span>Layer 1: AES-256-GCM Galois MAC (AAD Header)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal" />
                  <span>Layer 2: SHA-256 Constant-Time Payload Digest</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
