import { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageDropzoneProps {
  onFile: (file: File) => void;
  accept?: string;
  label?: string;
  hint?: string;
  disabled?: boolean;
  currentFile?: File | null;
}

export function ImageDropzone({
  onFile,
  accept = '.png,.bmp,.tiff',
  label = 'Upload cover image',
  hint = 'PNG, BMP or TIFF — lossless formats only',
  disabled = false,
  currentFile,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (file.size > 20 * 1024 * 1024) {
      setError('File exceeds 20 MB limit');
      return;
    }
    onFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="relative flex flex-col items-center justify-center gap-3 py-10 px-6 border-2 border-dashed transition-colors"
        style={{
          borderColor: dragging ? 'var(--signal)' : error ? 'var(--signal)' : 'var(--line)',
          background: dragging ? 'var(--signal-soft)' : 'var(--paper-raised)',
          borderRadius: 'var(--radius-md)',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <div className="image-frame">
          <div
            className="w-10 h-10 flex items-center justify-center border"
            style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--paper)' }}
          >
            {currentFile ? (
              <ImageIcon size={18} style={{ color: 'var(--ink)' }} />
            ) : (
              <Upload size={18} style={{ color: 'var(--ink-soft)' }} />
            )}
          </div>
        </div>
        <div className="text-center">
          {currentFile ? (
            <div className="flex flex-col gap-1">
              <span className="font-sans font-medium text-sm" style={{ color: 'var(--ink)' }}>
                {currentFile.name}
              </span>
              <span className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>
                {(currentFile.size / 1024).toFixed(1)} KB — click to replace
              </span>
            </div>
          ) : (
            <>
              <span className="font-sans font-medium text-sm" style={{ color: 'var(--ink)' }}>
                {label}
              </span>
              <br />
              <span className="font-sans text-xs" style={{ color: 'var(--ink-soft)' }}>
                {hint}
              </span>
            </>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="sr-only"
          aria-hidden="true"
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 font-sans text-xs" style={{ color: 'var(--signal)' }}>
          <AlertCircle size={12} />
          {error}
        </div>
      )}
    </div>
  );
}
