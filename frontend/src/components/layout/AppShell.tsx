import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Shield, Activity } from 'lucide-react';
import { api } from '../../services/api';

const navLinks = [
  { to: '/', label: 'Overview', code: '01' },
  { to: '/encode', label: 'Encode', code: '02' },
  { to: '/decode', label: 'Decode & Verify', code: '03' },
  { to: '/analysis', label: 'Analysis', code: '04' },
  { to: '/benchmark', label: 'Benchmark', code: '05' },
  { to: '/methodology', label: 'Methodology', code: '06' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      try {
        await api.health();
        if (mounted) setBackendOnline(true);
      } catch {
        if (mounted) setBackendOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--paper)' }}>
      {/* Precision Top Bar */}
      <div
        className="border-b text-[10px] font-mono tracking-widest uppercase px-4 md:px-6 py-1 flex items-center justify-between"
        style={{ borderColor: 'var(--line)', background: 'var(--paper-raised)', color: 'var(--ink-muted)' }}
      >
        <div className="flex items-center gap-4">
          <span>SYS: DARKROOM / LAB 1.0</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">ALGO: ADAPTIVE 6-BIT SPATIAL</span>
          <span className="hidden md:inline">·</span>
          <span className="hidden md:inline">CRYPTO: AES-256-GCM / ARGON2ID</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{
              background: backendOnline === true ? 'var(--success)' : backendOnline === false ? 'var(--signal)' : 'var(--warning)',
            }}
          />
          <span style={{ color: backendOnline === true ? 'var(--success)' : 'var(--ink-muted)' }}>
            {backendOnline === true ? 'ENGINE ONLINE' : backendOnline === false ? 'ENGINE OFFLINE' : 'CONNECTING...'}
          </span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-sm"
        style={{ borderColor: 'var(--line)', background: 'rgba(242, 240, 232, 0.95)' }}
      >
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          {/* Identity */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="DARKROOM home">
            <div
              className="w-6 h-6 flex items-center justify-center border transition-colors group-hover:border-signal"
              style={{ borderColor: 'var(--ink)', borderRadius: 'var(--radius-xs)', background: 'var(--paper-raised)' }}
            >
              <Shield size={12} strokeWidth={2} style={{ color: 'var(--ink)' }} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-mono text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--ink)' }}>
                  DARKROOM
                </span>
                <span className="font-mono text-xs text-ink-muted">/</span>
                <span className="font-mono text-xs tracking-wider uppercase text-ink-soft hidden sm:inline">
                  IMAGE SECURITY LAB
                </span>
              </div>
              <span className="text-[9px] font-mono tracking-wider text-ink-muted uppercase mt-0.5">
                Adaptive Steganography Workstation
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3.5 py-1.5 font-sans text-xs tracking-wide transition-all relative flex items-center gap-1.5"
                  style={{
                    color: active ? 'var(--ink)' : 'var(--ink-soft)',
                    fontWeight: active ? 600 : 400,
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="font-mono text-[10px] text-ink-muted">{link.code}</span>
                  <span>{link.label}</span>
                  {active && (
                    <span
                      className="absolute bottom-[-13px] left-3.5 right-3.5 h-[2px]"
                      style={{ background: 'var(--ink)' }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action indicator */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 border text-xs font-mono" style={{ borderColor: 'var(--line)', background: 'var(--paper-raised)', borderRadius: 'var(--radius-xs)' }}>
              <Activity size={11} style={{ color: 'var(--signal)' }} />
              <span className="text-[10px] text-ink-soft uppercase tracking-wider">PORT 8000 · REST</span>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-ink hover:text-signal transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <nav
            className="md:hidden border-t"
            style={{ borderColor: 'var(--line)', background: 'var(--paper-raised)' }}
            aria-label="Mobile navigation"
          >
            <div className="max-w-screen-xl mx-auto px-4 py-2 flex flex-col">
              {navLinks.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-3 border-b font-sans text-sm"
                    style={{
                      borderColor: 'var(--line)',
                      color: active ? 'var(--ink)' : 'var(--ink-soft)',
                      fontWeight: active ? 600 : 400,
                    }}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span>{link.label}</span>
                    <span className="font-mono text-xs text-ink-muted">{link.code}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Main Work Surface */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 md:px-6 py-8 md:py-10">
        {children}
      </main>

      {/* Technical Footer */}
      <footer className="border-t mt-auto" style={{ borderColor: 'var(--line)', background: 'var(--paper-raised)' }}>
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono" style={{ color: 'var(--ink-muted)' }}>
          <div>
            DARKROOM / Image Security Lab · Academic Capstone Specification
          </div>
          <div className="flex items-center gap-4">
            <span>SHA-256 INTEGRITY</span>
            <span>·</span>
            <span>CHACHA20 SHUFFLE</span>
            <span>·</span>
            <span>SSIM &gt; 0.999</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
