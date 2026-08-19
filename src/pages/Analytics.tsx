import { useState } from 'react';
import { Activity, Clock, DollarSign, Zap } from 'lucide-react';
import clsx from 'clsx';
import {
  useRequestsChart,
  useLatencyChart,
  useTokenUsageChart,
  useErrorRateChart,
} from '../hooks/useMetrics';
import MetricsChart from '../components/MetricsChart';

type Range = '1h' | '24h' | '7d' | '30d';

const ranges: { value: Range; label: string }[] = [
  { value: '1h', label: '1H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
];

// ── Helper to generate fallback series ────────────────────────────────────
function makeFallbackSeries(label: string, count: number, min: number, max: number) {
  return {
    label,
    data: Array.from({ length: count }, (_, i) => ({
      timestamp: new Date(Date.now() - (count - 1 - i) * 3600_000).toISOString(),
      value: Math.random() * (max - min) + min,
    })),
  };
}

interface ChartCardProps {
  title: string;
  subtitle: string;
  type?: 'area' | 'line' | 'bar';
  color: string;
  series: { label: string; data: { timestamp: string; value: number }[] };
  summary?: { avg: number; min: number; max: number; p95: number; p99: number };
}

function ChartCard({ title, subtitle, type = 'area', color, series, summary }: ChartCardProps) {
  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        {summary && (
          <div className="flex gap-4 text-xs">
            <div>
              <span className="text-slate-500">avg</span>{' '}
              <span className="font-semibold text-slate-300">{summary.avg.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-slate-500">p95</span>{' '}
              <span className="font-semibold text-slate-300">{summary.p95.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-slate-500">p99</span>{' '}
              <span className="font-semibold text-slate-300">{summary.p99.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>
      <MetricsChart type={type} series={series} color={color} height={260} />
    </div>
  );
}

export default function Analytics() {
  const [range, setRange] = useState<Range>('24h');

  const requestsQ = useRequestsChart();
  const latencyQ = useLatencyChart();
  const tokensQ = useTokenUsageChart();
  const errorsQ = useErrorRateChart();

  const count = range === '1h' ? 60 : range === '24h' ? 24 : range === '7d' ? 56 : 120;

  const requestsSeries = requestsQ.data?.series ?? makeFallbackSeries('requests', count, 200, 800);
  const latencySeries = latencyQ.data?.series ?? makeFallbackSeries('latency', count, 50, 350);
  const tokenSeries = tokensQ.data?.series ?? makeFallbackSeries('tokens', count, 1000, 50000);
  const errorSeries = errorsQ.data?.series ?? makeFallbackSeries('errors', count, 0.1, 3);

  return (
    <div className="space-y-6">
      {/* Header with range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Analytics</h2>
          <p className="text-sm text-slate-500">
            Performance metrics across all agents
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-surface-3 bg-surface-1 p-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={clsx(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                range === r.value
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-400 hover:text-slate-200',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Requests', value: '1.2M', icon: Activity, color: '#3366ff' },
          { label: 'Avg Latency', value: '142ms', icon: Clock, color: '#f59e0b' },
          { label: 'Tokens Used', value: '84.5K', icon: Zap, color: '#22c55e' },
          { label: 'Est. Cost', value: '$312.40', icon: DollarSign, color: '#a855f7' },
        ].map((t) => (
          <div
            key={t.label}
            className="flex items-center gap-3 rounded-xl border border-surface-3 bg-surface-1 p-4"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${t.color}1a` }}
            >
              <t.icon className="h-5 w-5" style={{ color: t.color }} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{t.label}</p>
              <p className="text-lg font-bold text-white">{t.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Request Volume"
          subtitle={`Last ${range}`}
          type="area"
          color="#3366ff"
          series={requestsSeries}
          summary={requestsQ.data?.summary}
        />
        <ChartCard
          title="Latency (ms)"
          subtitle={`Last ${range}`}
          type="line"
          color="#f59e0b"
          series={latencySeries}
          summary={latencyQ.data?.summary}
        />
        <ChartCard
          title="Token Usage"
          subtitle={`Last ${range}`}
          type="bar"
          color="#22c55e"
          series={tokenSeries}
          summary={tokensQ.data?.summary}
        />
        <ChartCard
          title="Error Rate (%)"
          subtitle={`Last ${range}`}
          type="area"
          color="#ef4444"
          series={errorSeries}
          summary={errorsQ.data?.summary}
        />
      </div>
    </div>
  );
}
