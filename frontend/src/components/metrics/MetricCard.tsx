interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  description?: string;
  highlight?: 'good' | 'warning' | 'neutral';
}

export function MetricCard({ label, value, unit, description, highlight = 'neutral' }: MetricCardProps) {
  const highlightColors = {
    good: 'var(--success)',
    warning: 'var(--warning)',
    neutral: 'var(--ink)',
  };

  return (
    <div
      className="flex flex-col gap-1 p-4"
      style={{
        background: 'var(--paper-raised)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <span className="metric-label">{label}</span>
      <div className="flex items-baseline gap-1">
        <span
          className="font-mono text-xl font-medium tabular-nums"
          style={{ color: highlightColors[highlight] }}
        >
          {typeof value === 'number' ? value.toFixed(4) : value}
        </span>
        {unit && (
          <span className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>
            {unit}
          </span>
        )}
      </div>
      {description && (
        <span className="font-sans text-xs" style={{ color: 'var(--ink-soft)' }}>
          {description}
        </span>
      )}
    </div>
  );
}
