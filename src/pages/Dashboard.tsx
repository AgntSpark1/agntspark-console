import { Link } from 'react-router-dom';
import { AlertTriangle, Bot, Layers, Zap } from 'lucide-react';
import { useAgents } from '../hooks/useAgents';
import { useUsage, type AccountUsage } from '../hooks/useAccount';
import { useAgentStore } from '../store/agentStore';
import AgentCard from '../components/AgentCard';
import AgentDetailPanel from '../components/AgentDetailPanel';

function StatCard({
  label,
  value,
  icon: Icon,
  accentColor,
  note,
}: {
  label: string;
  value: string | number;
  icon: typeof Bot;
  accentColor: string;
  note?: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-surface-3 bg-surface-1 p-5">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accentColor}1a` }}
      >
        <Icon className="h-6 w-6" style={{ color: accentColor }} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        {note && <p className="text-[11px] text-slate-500">{note}</p>}
      </div>
    </div>
  );
}

function UsageBar({ label, used, limit, unit = '' }: { label: string; used: number; limit: number; unit?: string }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">
          {used}
          {unit} / {limit}
          {unit}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div
          className={pct >= 90 ? 'h-full bg-rose-500' : pct >= 70 ? 'h-full bg-amber-500' : 'h-full bg-brand-500'}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PlanUsage({ data }: { data: AccountUsage }) {
  const { limits, usage } = data;
  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">
          Plan: <span className="capitalize text-brand-300">{data.plan}</span>
        </h2>
        {data.exempt && <span className="text-[11px] text-slate-500">Admin — limits not enforced</span>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UsageBar label="Agents" used={usage.agents} limit={limits.max_agents} />
        <UsageBar label="Running replicas" used={usage.replicas} limit={limits.max_replicas} />
        <UsageBar label="vCPU" used={usage.vcpu} limit={limits.max_vcpu} />
        <UsageBar label="Memory" used={usage.memory_mb} limit={limits.max_memory_mb} unit=" MB" />
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        Up to {limits.max_replica_cpu} vCPU and {limits.max_replica_memory_mb} MB per replica.
      </p>
    </div>
  );
}

/**
 * Summary computed from GET /v1/agents — the gateway has no separate
 * dashboard/aggregate-metrics endpoint, so every number here is derived
 * from real agent records rather than a fabricated time series.
 */
export default function Dashboard() {
  const agentsQuery = useAgents({ page_size: 100 });
  const usageQuery = useUsage();
  const { selectedAgentId, selectAgent } = useAgentStore();

  const data = agentsQuery.data;
  const agents = data?.agents ?? [];
  const partial = data?.has_next ?? false;

  const running = agents.filter((a) => a.status === 'running').length;
  const unhealthy = agents.filter((a) => a.status === 'failed' || a.status === 'crashed').length;
  const replicas = agents.reduce((sum, a) => sum + a.replicas, 0);
  const partialNote = partial ? `from first ${agents.length} agents` : undefined;

  const show = (v: number) => (agentsQuery.isLoading ? '—' : v);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Agents" value={show(data?.total ?? 0)} icon={Bot} accentColor="#3366ff" />
        <StatCard label="Running" value={show(running)} icon={Zap} accentColor="#22c55e" note={partialNote} />
        <StatCard label="Replicas" value={show(replicas)} icon={Layers} accentColor="#0ea5e9" note={partialNote} />
        <StatCard
          label="Failed / Crashed"
          value={show(unhealthy)}
          icon={AlertTriangle}
          accentColor="#ef4444"
          note={partialNote}
        />
      </div>

      {usageQuery.data && <PlanUsage data={usageQuery.data} />}

      {agentsQuery.isError && (
        <p className="rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
          Couldn't load agents: {(agentsQuery.error as Error).message}
        </p>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Recently updated</h2>
          <Link to="/agents" className="text-sm font-medium text-brand-400 hover:text-brand-300">
            View all →
          </Link>
        </div>
        {agentsQuery.isLoading ? (
          <p className="text-sm text-slate-500">Loading agents…</p>
        ) : agents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-3 p-8 text-center">
            <p className="text-sm text-slate-300">No agents yet.</p>
            <Link to="/agents" className="mt-2 inline-block text-sm text-brand-400 hover:text-brand-300">
              Deploy your first agent →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...agents]
              .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
              .slice(0, 6)
              .map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
          </div>
        )}
      </div>

      <AgentDetailPanel agentId={selectedAgentId} onClose={() => selectAgent(null)} />
    </div>
  );
}
