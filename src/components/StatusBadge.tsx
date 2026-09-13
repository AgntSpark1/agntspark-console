import clsx from 'clsx';
import type { AgentStatus } from '../types';

interface StatusBadgeProps {
  status: AgentStatus;
  className?: string;
}

const config: Record<AgentStatus, { label: string; dot: string; badge: string; pulse?: boolean }> =
  {
    pending: {
      label: 'Pending',
      dot: 'bg-slate-400',
      badge: 'bg-slate-500/10 text-slate-300 ring-1 ring-slate-500/30',
    },
    building: {
      label: 'Building',
      dot: 'bg-brand-400',
      badge: 'bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/30',
      pulse: true,
    },
    starting: {
      label: 'Starting',
      dot: 'bg-brand-400',
      badge: 'bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/30',
      pulse: true,
    },
    running: {
      label: 'Running',
      dot: 'bg-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30',
    },
    scaling: {
      label: 'Scaling',
      dot: 'bg-sky-400',
      badge: 'bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/30',
      pulse: true,
    },
    stopping: {
      label: 'Stopping',
      dot: 'bg-amber-400',
      badge: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30',
      pulse: true,
    },
    stopped: {
      label: 'Stopped',
      dot: 'bg-slate-500',
      badge: 'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/30',
    },
    failed: {
      label: 'Failed',
      dot: 'bg-rose-500',
      badge: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30',
    },
    crashed: {
      label: 'Crashed',
      dot: 'bg-rose-500',
      badge: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30',
    },
  };

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const c = config[status] ?? config.pending;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        c.badge,
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {c.pulse && (
          <span className={clsx('absolute h-1.5 w-1.5 animate-ping rounded-full', c.dot)} />
        )}
        <span className={clsx('relative h-1.5 w-1.5 rounded-full', c.dot)} />
      </span>
      {c.label}
    </span>
  );
}
