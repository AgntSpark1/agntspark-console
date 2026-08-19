import clsx from 'clsx';
import type { AgentStatus } from '../types';

interface StatusBadgeProps {
  status: AgentStatus;
  className?: string;
}

const config: Record<
  AgentStatus,
  { label: string; dot: string; badge: string }
> = {
  active: {
    label: 'Active',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30',
  },
  paused: {
    label: 'Paused',
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30',
  },
  deploying: {
    label: 'Deploying',
    dot: 'bg-brand-400',
    badge: 'bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/30',
  },
  error: {
    label: 'Error',
    dot: 'bg-rose-500',
    badge: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30',
  },
  idle: {
    label: 'Idle',
    dot: 'bg-slate-500',
    badge: 'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/30',
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const c = config[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        c.badge,
        className,
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', c.dot)}>
        {status === 'deploying' && (
          <span className="absolute h-1.5 w-1.5 animate-ping rounded-full bg-brand-400" />
        )}
      </span>
      {c.label}
    </span>
  );
}
