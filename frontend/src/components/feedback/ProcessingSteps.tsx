import { CheckCircle, Circle, Loader2, XCircle } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}

export function ProcessingSteps({ steps }: { steps: Step[] }) {
  return (
    <div className="flex flex-col gap-2">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {step.status === 'done' && <CheckCircle size={16} style={{ color: 'var(--success)' }} />}
            {step.status === 'active' && (
              <Loader2 size={16} style={{ color: 'var(--signal)' }} className="animate-spin" />
            )}
            {step.status === 'error' && <XCircle size={16} style={{ color: 'var(--signal)' }} />}
            {step.status === 'pending' && <Circle size={16} style={{ color: 'var(--line)' }} />}
          </div>
          <span
            className="font-sans text-sm"
            style={{
              color: step.status === 'active'
                ? 'var(--ink)'
                : step.status === 'done'
                ? 'var(--ink-soft)'
                : step.status === 'error'
                ? 'var(--signal)'
                : 'var(--line)',
              fontWeight: step.status === 'active' ? 500 : 400,
            }}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
