import { ArrowDown, ArrowUp, FileText, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useDeleteAgent, useScaleAgent } from '../hooks/useAgents';
import { useAgentStore } from '../store/agentStore';
import type { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const scale = useScaleAgent();
  const deleteAgent = useDeleteAgent();
  const selectAgent = useAgentStore((s) => s.selectAgent);

  const deployed = agent.replicas > 0;
  const busy = scale.isPending || deleteAgent.isPending;

  const handleScale = (direction: 'up' | 'down') => {
    scale.mutate({ id: agent.id, direction, count: 1 });
  };

  const handleDelete = () => {
    if (confirm(`Permanently delete agent "${agent.name}" and its containers?`)) {
      deleteAgent.mutate(agent.id);
    }
  };

  const resources = agent.deploy?.resources;

  return (
    <div className="group relative flex flex-col rounded-xl border border-surface-3 bg-surface-1 p-5 transition-colors hover:border-brand-500/40">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-sm font-bold text-brand-400">
            {agent.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <button
              onClick={() => selectAgent(agent.id)}
              className="block truncate text-left text-sm font-semibold text-white hover:text-brand-300"
            >
              {agent.name}
            </button>
            <p className="truncate font-mono text-[11px] text-slate-500">{agent.id}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* Image */}
      <p className="mt-3 truncate font-mono text-xs text-slate-400" title={agent.deploy?.image ?? ''}>
        {agent.deploy?.image ?? 'Not deployed'}
      </p>

      {agent.error && (
        <p className="mt-2 line-clamp-2 rounded-md bg-rose-500/10 px-2 py-1 text-xs text-rose-400">
          {agent.error}
        </p>
      )}

      {/* Facts row — only fields the gateway actually returns */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-surface-3 pt-4">
        <Fact label="Replicas" value={String(agent.replicas)} />
        <Fact label="CPU" value={resources ? `${resources.cpu}` : '—'} unit={resources ? 'cores' : undefined} />
        <Fact label="Memory" value={resources ? `${resources.memory_mb}` : '—'} unit={resources ? 'MB' : undefined} />
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => handleScale('up')}
          disabled={!deployed || busy}
          title="Add a replica"
          className="flex items-center gap-1 rounded-lg border border-surface-3 bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-surface-3 disabled:opacity-40"
        >
          <ArrowUp className="h-3.5 w-3.5" /> Scale
        </button>
        <button
          onClick={() => handleScale('down')}
          disabled={agent.replicas <= 1 || busy}
          title="Remove a replica"
          className="flex items-center gap-1 rounded-lg border border-surface-3 bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-surface-3 disabled:opacity-40"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => selectAgent(agent.id)}
          className="flex items-center gap-1 rounded-lg border border-surface-3 bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-surface-3"
        >
          <FileText className="h-3.5 w-3.5" /> Logs
        </button>
        <button
          onClick={handleDelete}
          disabled={busy}
          aria-label={`Delete ${agent.name}`}
          className="ml-auto flex items-center gap-1 rounded-lg border border-surface-3 bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/10 disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {scale.isError && (
        <p className="mt-2 text-xs text-rose-400">{(scale.error as Error).message}</p>
      )}
      {deleteAgent.isError && (
        <p className="mt-2 text-xs text-rose-400">{(deleteAgent.error as Error).message}</p>
      )}
    </div>
  );
}

function Fact({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-200">
        {value}
        {unit && <span className="ml-1 text-[11px] font-normal text-slate-500">{unit}</span>}
      </span>
    </div>
  );
}
