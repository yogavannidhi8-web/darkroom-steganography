import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

type Status = 'success' | 'error' | 'warning' | 'pending' | 'neutral';

interface StatusBadgeProps {
  status: Status;
  label: string;
  detail?: string;
}

const statusConfig = {
  success: { icon: CheckCircle, className: 'status-stamp-success' },
  error: { icon: XCircle, className: 'status-stamp-error' },
  warning: { icon: AlertCircle, className: 'status-stamp-warning' },
  pending: { icon: Clock, className: 'status-stamp-neutral' },
  neutral: { icon: Clock, className: 'status-stamp-neutral' },
};

export function StatusBadge({ status, label, detail }: StatusBadgeProps) {
  const { icon: Icon, className } = statusConfig[status];
  return (
    <div className="flex flex-col gap-1">
      <span className={`status-stamp ${className}`}>
        <Icon size={10} strokeWidth={2} />
        {label}
      </span>
      {detail && (
        <span className="font-mono text-xs" style={{ color: 'var(--ink-soft)' }}>
          {detail}
        </span>
      )}
    </div>
  );
}
