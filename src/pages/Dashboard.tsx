import { Link } from 'react-router-dom';
import {
  Bot,
  Zap,
  AlertTriangle,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';
import { useDashboardSummary, useRequestsChart, useErrorRateChart } from '../hooks/useMetrics';
import { useAgents } from '../hooks/useAgents';
import MetricsChart from '../components/MetricsChart';
import AgentCard from '../components/AgentCard';

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendDirection,
  accentColor,
}: {
  label: string;
  value: string | number;
  icon: typeof Bot;
  trend?: string;
  trendDirection?: 'up' | 'down';
  accentColor: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-surface-3 bg-surface-1 p-5">
      <div className="flex items-center gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accentColor}1a` }}
        >
          <Icon className="h-6 w-6" style={{ color: accentColor }} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
      {trend && (
        <div
          className={clsx(
            'flex items-center gap-1 text-xs font-medium',
            trendDirection === 'up' ? 'text-emerald-400' : 'text-rose-400',
          )}
        >
          {trendDirection === 'up' ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {trend}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const summaryQuery = useDashboardSummary();
  const requestsQuery = useRequestsChart();
  const errorsQuery = useErrorRateChart();
  const agentsQuery = useAgents({ perPage: 4, sort: 'requests', order: 'desc' });

  const summary = summaryQuery.data;
  const isLoading = summaryQuery.isLoading;

  // Build fallback data when API not available
  const requestsSeries = requestsQuery.data?.series ?? {
    label: 'requests',
    data: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600_000).toISOString(),
      value: Math.floor(Math.random() * 500) + 200,
    })),
  };

  const errorSeries = errorsQuery.data?.series ?? {
    label: 'errors',
    data: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600_000).toISOString(),
      value: Math.random() * 3 + 0.5,
    })),
  };

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Agents"
          value={summary?.totalAgents ?? '—'}
          icon={Bot}
          accentColor="#3366ff"
          trend="+2"
          trendDirection="up"
        />
        <StatCard
          label="Active Agents"
          value={summary?.activeAgents ?? '—'}
          icon={Zap}
          accentColor="#22c55e"
          trend="+1"
          trendDirection="up"
        />
        <StatCard
          label="Avg Latency"
          value={
            summary ? `${summary.avgLatencyMs.toFixed(0)}ms` : '—'
          }
          icon={Clock}
          accentColor="#f59e0b"
          trend="-12%"
          trendDirection="up"
        />
        <StatCard
          label="Error Rate"
          value={
            summary ? `${summary.errorRate.toFixed(2)}%` : '—'
          }
          icon={AlertTriangle}
          accentColor="#ef4444"
          trend="-0.3%"
          trendDirection="up"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Request throughput */}
        <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Request Throughput
              </h3>
              <p className="text-xs text-slate-500">Last 24 hours</p>
            </div>
            <TrendingUp className="h-4 w-4 text-slate-500" />
          </div>
          <MetricsChart type="area" series={requestsSeries} color="#3366ff" />
        </div>

        {/* Error rate */}
        <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Error Rate</h3>
              <p className="text-xs text-slate-500">Last 24 hours</p>
            </div>
            <AlertTriangle className="h-4 w-4 text-slate-500" />
          </div>
          <MetricsChart type="line" series={errorSeries} color="#ef4444" />
        </div>
      </div>

      {/* Cost + Tokens */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Estimated Cost (30d)</p>
              <p className="text-xl font-bold text-white">
                ${summary ? summary.estimatedCost.toFixed(2) : '—'}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10">
              <Zap className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Tokens Used</p>
              <p className="text-xl font-bold text-white">
                {summary
                  ? summary.totalTokens.toLocaleString()
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent agents */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Top Agents</h2>
          <Link
            to="/agents"
            className="text-sm font-medium text-brand-400 hover:text-brand-300"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {agentsQuery.data?.data.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          )) ??
            (isLoading ? (
              <p className="text-sm text-slate-500">Loading agents…</p>
            ) : (
              <p className="text-sm text-slate-500">No agents yet.</p>
            ))}
        </div>
      </div>
    </div>
  );
}
