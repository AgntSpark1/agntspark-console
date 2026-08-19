import { useMemo } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useAgents } from '../hooks/useAgents';
import { useAgentStore } from '../store/agentStore';
import AgentCard from '../components/AgentCard';
import DeployModal from '../components/DeployModal';
import type { AgentStatus } from '../types';

const statusFilters: { value: AgentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'deploying', label: 'Deploying' },
  { value: 'error', label: 'Error' },
  { value: 'idle', label: 'Idle' },
];

export default function Agents() {
  const { filters, setSearch, setStatusFilter, setEnvironmentFilter, resetFilters } =
    useAgentStore();
  const agentsQuery = useAgents({
    perPage: 100,
    status: filters.status === 'all' ? undefined : filters.status,
    sort: 'name',
    order: 'asc',
  });

  const agents = agentsQuery.data?.data ?? [];

  // Client-side search filtering
  const filtered = useMemo(() => {
    let result = agents;
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.model.toLowerCase().includes(q),
      );
    }
    if (filters.environment !== 'all') {
      result = result.filter((a) => a.environment === filters.environment);
    }
    return result;
  }, [agents, filters.search, filters.environment]);

  const deployAgent = filtered.find((a) => a.id === useAgentStore.getState().selectedAgentId) ?? null;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search agents by name, model, description..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-surface-3 bg-surface-1 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1.5">
          {statusFilters.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={clsx(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                filters.status === s.value
                  ? 'bg-brand-500/10 text-brand-300 ring-1 ring-brand-500/30'
                  : 'text-slate-400 hover:bg-surface-2 hover:text-slate-200',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Environment filter */}
        <select
          value={filters.environment}
          onChange={(e) => setEnvironmentFilter(e.target.value as 'all' | 'staging' | 'production')}
          className="h-10 rounded-lg border border-surface-3 bg-surface-1 px-3 text-sm text-slate-300 focus:border-brand-500 focus:outline-none"
        >
          <option value="all">All Environments</option>
          <option value="staging">Staging</option>
          <option value="production">Production</option>
        </select>

        {/* Reset */}
        {(filters.search || filters.status !== 'all' || filters.environment !== 'all') && (
          <button
            onClick={resetFilters}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Clear filters
          </button>
        )}

        {/* New agent */}
        <button
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" /> New Agent
        </button>
      </div>

      {/* Count */}
      <p className="text-sm text-slate-500">
        {filtered.length} agent{filtered.length === 1 ? '' : 's'}
        {agentsQuery.isLoading && ' · loading…'}
      </p>

      {/* Grid */}
      {agentsQuery.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2">
            <Plus className="h-8 w-8 text-slate-500" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-300">No agents found</p>
          <p className="mt-1 text-xs text-slate-500">
            Create your first agent or adjust filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {/* Deploy modal */}
      <DeployModal
        agent={deployAgent}
        open={useAgentStore.getState().deployModalOpen}
        onClose={() => useAgentStore.getState().closeDeployModal()}
      />
    </div>
  );
}
