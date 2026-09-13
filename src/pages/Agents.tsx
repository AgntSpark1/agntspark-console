import { useMemo } from 'react';
import { Loader2, Plus, Search } from 'lucide-react';
import clsx from 'clsx';
import { useAgents } from '../hooks/useAgents';
import { useAgentStore } from '../store/agentStore';
import AgentCard from '../components/AgentCard';
import AgentDetailPanel from '../components/AgentDetailPanel';
import CreateAgentModal from '../components/CreateAgentModal';
import type { AgentStatus } from '../types';

const statusFilters: { value: AgentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'running', label: 'Running' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'crashed', label: 'Crashed' },
  { value: 'stopped', label: 'Stopped' },
];

export default function Agents() {
  const {
    filters,
    setSearch,
    setStatusFilter,
    resetFilters,
    selectedAgentId,
    selectAgent,
    createModalOpen,
    openCreateModal,
    closeCreateModal,
  } = useAgentStore();

  const agentsQuery = useAgents({
    page_size: 100,
    status: filters.status === 'all' ? undefined : filters.status,
  });

  const agents = useMemo(() => agentsQuery.data?.agents ?? [], [agentsQuery.data]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.model.toLowerCase().includes(q) ||
        (a.deploy?.image ?? '').toLowerCase().includes(q),
    );
  }, [agents, filters.search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            aria-label="Search agents"
            placeholder="Search by name, ID, model, or image…"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-surface-3 bg-surface-1 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
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

        {(filters.search || filters.status !== 'all') && (
          <button onClick={resetFilters} className="text-xs text-slate-500 hover:text-slate-300">
            Clear filters
          </button>
        )}

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" /> New Agent
        </button>
      </div>

      <p className="text-sm text-slate-500">
        {filtered.length} agent{filtered.length === 1 ? '' : 's'}
        {agentsQuery.data?.has_next && ` (showing first ${agents.length} of ${agentsQuery.data.total})`}
        {agentsQuery.isFetching && !agentsQuery.isLoading && ' · refreshing…'}
      </p>

      {agentsQuery.isError ? (
        <p className="rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          Couldn't load agents: {(agentsQuery.error as Error).message}
        </p>
      ) : agentsQuery.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-sm font-medium text-slate-300">
            {agents.length === 0 ? 'No agents yet' : 'No agents match these filters'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {agents.length === 0
              ? 'Deploy your first agent from a container image.'
              : 'Try clearing the search or status filter.'}
          </p>
          {agents.length === 0 && (
            <button
              onClick={openCreateModal}
              className="mt-4 flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              <Plus className="h-4 w-4" /> New Agent
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      <CreateAgentModal open={createModalOpen} onClose={closeCreateModal} />
      <AgentDetailPanel agentId={selectedAgentId} onClose={() => selectAgent(null)} />
    </div>
  );
}
