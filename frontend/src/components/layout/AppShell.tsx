import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Shield } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Overview', shortLabel: '01' },
  { to: '/encode', label: 'Encode', shortLabel: '02' },
  { to: '/decode', label: 'Decode', shortLabel: '03' },
  { to: '/analysis', label: 'Analysis', shortLabel: '04' },
  { to: '/benchmark', label: 'Benchmark', shortLabel: '05' },
  { to: '/methodology', label: 'Methodology', shortLabel: '06' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--paper)' }}>
      {/* Top header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}
      >
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 h-12 flex items-center justify-between">
          {/* Wordmark */}
          <Link to="/" className="flex items-center gap-2 group" aria-label="DARKROOM home">
            <div
              className="w-5 h-5 flex items-center justify-center border"
              style={{ borderColor: 'var(--ink)', borderRadius: 'var(--radius-sm)' }}
            >
              <Shield size={11} strokeWidth={2} style={{ color: 'var(--ink)' }} />
            </div>
            <span
              className="font-mono text-xs font-medium tracking-widest uppercase"
              style={{ color: 'var(--ink)' }}
            >
              DARKROOM
            </span>
            <span className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>
              /
            </span>
            <span
              className="font-mono text-xs tracking-widest uppercase hidden sm:inline"
              style={{ color: 'var(--ink-soft)' }}
            >
              IMAGE SECURITY LAB
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3 py-1.5 font-sans text-xs font-medium transition-colors"
                  style={{
                    color: active ? 'var(--ink)' : 'var(--ink-soft)',
                    borderBottom: active ? '1px solid var(--ink)' : '1px solid transparent',
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Status line */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>
              LOCAL PROCESSING / SECURE WORKFLOW
            </span>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            style={{ color: 'var(--ink)' }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
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
                    className="flex items-center gap-3 py-3 border-b font-sans text-sm"
                    style={{
                      borderColor: 'var(--line)',
                      color: active ? 'var(--ink)' : 'var(--ink-soft)',
                      fontWeight: active ? 500 : 400,
                    }}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span className="font-mono text-xs" style={{ color: 'var(--ink-soft)', minWidth: '20px' }}>
                      {link.shortLabel}
                    </span>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Main container */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 md:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 h-10 flex items-center justify-between">
          <span className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>
            DARKROOM / Image Security Lab — Capstone Project
          </span>
          <span className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>
            AES-256-GCM · Argon2id · Adaptive LSB
          </span>
        </div>
      </footer>
    </div>
  );
}
