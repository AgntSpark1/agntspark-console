import { Link } from 'react-router-dom';
import { MoreVertical, Pause, Play, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import StatusBadge from './StatusBadge';
import { useToggleAgentStatus, useDeleteAgent } from '../hooks/useAgents';
import type { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const toggleStatus = useToggleAgentStatus();
  const deleteAgent = useDeleteAgent();

  const isPaused = agent.status === 'paused';

  const handleToggle = () => {
    toggleStatus.mutate({
      id: agent.id,
      action: isPaused ? 'resume' : 'pause',
    });
  };

  const handleDelete = () => {
    if (confirm(`Delete agent "${agent.name}"? This cannot be undone.`)) {
      deleteAgent.mutate(agent.id);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-xl border border-surface-3 bg-surface-1 p-5 transition-colors hover:border-brand-500/40">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 text-sm font-bold text-brand-400">
            {agent.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <Link
              to={`/agents?id=${agent.id}`}
              className="text-sm font-semibold text-white hover:text-brand-300"
            >
              {agent.name}
            </Link>
            <p className="text-xs text-slate-500">{agent.model}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* Description */}
      <p className="mt-3 line-clamp-2 text-sm text-slate-400">
        {agent.description}
      </p>

      {/* Metrics row */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-surface-3 pt-4">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">
            Requests
          </span>
          <span className="text-sm font-semibold text-slate-200">
            {agent.requestsPerMin.toLocaleString()}
            <span className="ml-1 text-[11px] font-normal text-slate-500">/min</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">
            Latency
          </span>
          <span className="text-sm font-semibold text-slate-200">
            {agent.avgLatencyMs.toFixed(0)}
            <span className="ml-1 text-[11px] font-normal text-slate-500">ms</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wide text-slate-500">
            Errors
          </span>
          <span
            className={clsx(
              'text-sm font-semibold',
              agent.errorRate > 5
                ? 'text-rose-400'
                : agent.errorRate > 1
                  ? 'text-amber-400'
                  : 'text-emerald-400',
            )}
          >
            {agent.errorRate.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handleToggle}
          disabled={toggleStatus.isPending}
          className="flex items-center gap-1.5 rounded-lg border border-surface-3 bg-surface-2 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-surface-3 disabled:opacity-50"
        >
          {isPaused ? (
            <>
              <Play className="h-3.5 w-3.5" /> Resume
            </>
          ) : (
            <>
              <Pause className="h-3.5 w-3.5" /> Pause
            </>
          )}
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteAgent.isPending}
          className="flex items-center gap-1.5 rounded-lg border border-surface-3 bg-surface-2 px-3 py-1.5 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/10 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
        <button
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-surface-3 hover:text-slate-300"
          aria-label="More options"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
