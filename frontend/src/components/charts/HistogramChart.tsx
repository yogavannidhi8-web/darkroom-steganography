import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface HistogramChartProps {
  coverHistograms: { r: number[]; g: number[]; b: number[] };
  stegoHistograms?: { r: number[]; g: number[]; b: number[] };
  channel: 'r' | 'g' | 'b';
  title: string;
}

export function HistogramChart({ coverHistograms, stegoHistograms, channel, title }: HistogramChartProps) {
  const channelColors = { r: '#C45A3D', g: '#526D4C', b: '#3D6A8A' };
  const color = channelColors[channel];
  
  // Sample every 4 values for smooth rendering
  const data = Array.from({ length: 64 }, (_, i) => {
    const idx = i * 4;
    const coverVal = coverHistograms[channel].slice(idx, idx + 4).reduce((a, b) => a + b, 0);
    const stegoVal = stegoHistograms
      ? stegoHistograms[channel].slice(idx, idx + 4).reduce((a, b) => a + b, 0)
      : undefined;
    return { pixel: idx, cover: coverVal, stego: stegoVal };
  });

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--ink-soft)' }}>
        {title}
      </span>
      <div style={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 2, right: 2, left: -20, bottom: 2 }}>
            <XAxis dataKey="pixel" tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono' }} interval={15} />
            <YAxis tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono' }} />
            <Tooltip
              contentStyle={{
                background: 'var(--paper-raised)',
                border: '1px solid var(--line)',
                fontFamily: 'IBM Plex Mono',
                fontSize: 10,
              }}
            />
            <Bar dataKey="cover" fill={color} opacity={0.7} name="Cover" />
            {stegoHistograms && (
              <Bar dataKey="stego" fill={color} opacity={0.4} name="Stego" />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
