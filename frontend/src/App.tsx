import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { OverviewPage } from './features/overview/OverviewPage';
import { EncodePage } from './features/encode/EncodePage';
import { DecodePage } from './features/decode/DecodePage';
import { AnalysisPage } from './features/analysis/AnalysisPage';
import { BenchmarkPage } from './features/benchmark/BenchmarkPage';
import { MethodologyPage } from './features/methodology/MethodologyPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/encode" element={<EncodePage />} />
          <Route path="/decode" element={<DecodePage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/benchmark" element={<BenchmarkPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="*" element={<div className="font-display text-2xl mt-16 text-center" style={{ color: 'var(--ink-soft)' }}>Page not found</div>} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
