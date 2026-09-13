import { X } from 'lucide-react';
import clsx from 'clsx';
import StatusBadge from './StatusBadge';
import { useAgent, useAgentLogs, useAgentMetrics } from '../hooks/useAgents';

interface AgentDetailPanelProps {
  agentId: string | null;
  onClose: () => void;
}

const levelColor: Record<string, string> = {
  ERROR: 'text-rose-400',
  WARN: 'text-amber-400',
  INFO: 'text-emerald-400',
  DEBUG: 'text-slate-500',
};

/**
 * Live view of one agent: status, live Docker CPU/memory (the only metrics
 * the gateway measures for real today), and a tail of container logs.
 */
export default function AgentDetailPanel({ agentId, onClose }: AgentDetailPanelProps) {
  const agentQ = useAgent(agentId);
  const metricsQ = useAgentMetrics(agentId && (agentQ.data?.replicas ?? 0) > 0 ? agentId : null);
  const logsQ = useAgentLogs(agentId && (agentQ.data?.replicas ?? 0) > 0 ? agentId : null);

  if (!agentId) return null;
  const agent = agentQ.data;
  const m = metricsQ.data;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-surface-0/60" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-2xl flex-col border-l border-surface-3 bg-surface-1 shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-3 px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-white">{agent?.name ?? 'Loading…'}</h2>
            <p className="truncate font-mono text-xs text-slate-500">{agentId}</p>
          </div>
          <div className="flex items-center gap-3">
            {agent && <StatusBadge status={agent.status} />}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-surface-2 hover:text-slate-300"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 border-b border-surface-3 px-6 py-4">
          <Stat label="Replicas" value={m ? String(m.replicas) : String(agent?.replicas ?? '—')} />
          <Stat label="CPU" value={m ? `${m.cpu_percent.toFixed(1)}%` : '—'} />
          <Stat
            label="Memory"
            value={m ? `${m.memory_mb} MB` : '—'}
            sub={m ? `${m.memory_percent.toFixed(1)}% of limit` : undefined}
          />
        </div>

        <div className="flex items-center justify-between px-6 pb-2 pt-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">Logs</h3>
          <span className="text-[11px] text-slate-600">refreshes every 5s</span>
        </div>
        <div className="mx-6 mb-6 flex-1 overflow-y-auto rounded-lg border border-surface-3 bg-surface-0 p-3 font-mono text-xs leading-relaxed">
          {(agent?.replicas ?? 0) === 0 ? (
            <p className="text-slate-500">No running replicas — nothing to show.</p>
          ) : logsQ.isLoading ? (
            <p className="text-slate-500">Loading logs…</p>
          ) : logsQ.isError ? (
            <p className="text-rose-400">{(logsQ.error as Error).message}</p>
          ) : (logsQ.data ?? []).length === 0 ? (
            <p className="text-slate-500">No log output yet.</p>
          ) : (
            logsQ.data!.map((line, i) => (
              <div key={`${line.replica_id}-${line.timestamp}-${i}`} className="flex gap-2">
                <span className="shrink-0 text-slate-600">{new Date(line.timestamp).toLocaleTimeString()}</span>
                <span className={clsx('shrink-0', levelColor[line.level] ?? 'text-slate-400')}>
                  {line.level.padEnd(5)}
                </span>
                <span className="shrink-0 text-sky-500">{line.replica_id.slice(0, 8)}</span>
                <span className="whitespace-pre-wrap break-all text-slate-300">{line.message}</span>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}
