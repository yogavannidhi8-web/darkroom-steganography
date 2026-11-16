import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Shield } from 'lucide-react';
import { api } from '../../services/api';

const navLinks = [
  { to: '/', label: 'Overview' },
  { to: '/encode', label: 'Encode' },
  { to: '/decode', label: 'Decode' },
  { to: '/analysis', label: 'Analysis' },
  { to: '/benchmark', label: 'Benchmark' },
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
    const interval = setInterval(checkHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--paper)' }}>
      {/* Calm Status Bar */}
      <div
        className="border-b text-[11px] font-sans px-4 md:px-8 py-1.5 flex items-center justify-between"
        style={{ borderColor: 'var(--line)', background: 'var(--paper-raised)', color: 'var(--ink-muted)' }}
      >
        <div className="font-sans text-xs tracking-normal text-ink-soft">
          Secure Adaptive Image Steganography
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{
              background: backendOnline === true ? 'var(--success)' : backendOnline === false ? 'var(--signal)' : 'var(--warning)',
            }}
          />
          <span className="font-mono text-[10px]" style={{ color: backendOnline === true ? 'var(--ink-soft)' : 'var(--signal)' }}>
            {backendOnline === true ? 'Ready' : backendOnline === false ? 'Offline' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-sm"
        style={{ borderColor: 'var(--line)', background: 'rgba(242, 240, 232, 0.96)' }}
      >
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          {/* Identity */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="DARKROOM home">
            <div
              className="w-7 h-7 flex items-center justify-center border transition-colors group-hover:border-signal"
              style={{ borderColor: 'var(--ink)', borderRadius: 'var(--radius-xs)', background: 'var(--paper-raised)' }}
            >
              <Shield size={13} strokeWidth={2} style={{ color: 'var(--ink)' }} />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs font-semibold tracking-wider uppercase text-ink">
                DARKROOM
              </span>
              <span className="text-[10px] font-sans text-ink-muted">
                Image Steganography Workstation
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
                  className="px-4 py-2 font-sans text-xs tracking-wide transition-colors relative"
                  style={{
                    color: active ? 'var(--ink)' : 'var(--ink-soft)',
                    fontWeight: active ? 600 : 400,
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  <span>{link.label}</span>
                  {active && (
                    <span
                      className="absolute bottom-[-11px] left-4 right-4 h-[2px]"
                      style={{ background: 'var(--ink)' }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

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
                  </Link>
                );
              })}
              <Link
                to="/methodology"
                onClick={() => setMobileOpen(false)}
                className="py-3 font-sans text-sm text-ink-muted"
              >
                Technical Methodology
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Main Work Surface */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 md:px-8 py-8 md:py-10">
        {children}
      </main>

      {/* Quiet, Professional Footer */}
      <footer className="border-t mt-auto" style={{ borderColor: 'var(--line)', background: 'var(--paper-raised)' }}>
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans text-ink-soft">
          <div>
            Secure Adaptive Image Steganography System
          </div>
          <div className="flex items-center gap-4 text-xs font-sans">
            <Link to="/" className="text-ink-soft hover:text-ink">Overview</Link>
            <span>·</span>
            <Link to="/encode" className="text-ink-soft hover:text-ink">Encode</Link>
            <span>·</span>
            <Link to="/decode" className="text-ink-soft hover:text-ink">Decode</Link>
            <span>·</span>
            <Link to="/analysis" className="text-ink-soft hover:text-ink">Analysis</Link>
            <span>·</span>
            <Link to="/benchmark" className="text-ink-soft hover:text-ink">Benchmark</Link>
            <span>·</span>
            <Link to="/methodology" className="text-ink-soft hover:text-ink">Methodology</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
