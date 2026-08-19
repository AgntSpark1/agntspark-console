import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { DashboardSummary, MetricSeries } from '../types';
import type { MetricsQueryParams, MetricsResponse } from '../api/types';

// ── Query keys ────────────────────────────────────────────────────────────

export const metricsKeys = {
  dashboard: ['metrics', 'dashboard'] as const,
  series: (params: MetricsQueryParams & { metric: string }) =>
    ['metrics', 'series', params] as const,
};

// ── Dashboard summary ──────────────────────────────────────────────────────

export function useDashboardSummary() {
  return useQuery({
    queryKey: metricsKeys.dashboard,
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardSummary>('/metrics/dashboard');
      return data;
    },
    refetchInterval: 30_000, // refresh every 30s
  });
}

// ── Time-series metrics ────────────────────────────────────────────────────

export function useMetricSeries(
  metric: string,
  params: Omit<MetricsQueryParams, 'metric'>,
) {
  return useQuery({
    queryKey: metricsKeys.series({ ...params, metric }),
    queryFn: async () => {
      const { data } = await apiClient.get<MetricsResponse>(
        `/metrics/${metric}`,
        { params },
      );
      // transform API response → chart-friendly MetricSeries
      const series: MetricSeries = {
        label: metric,
        data: data.series.map((p) => ({
          timestamp: p.timestamp,
          value: p.value,
        })),
      };
      return { series, summary: data.summary };
    },
    refetchInterval: 60_000,
  });
}

// ── Convenience hooks for common dashboard charts ────────────────────────

export function useRequestsChart(agentId?: string) {
  const now = new Date();
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000); // last 24h
  return useMetricSeries('requests', {
    agentId,
    start: start.toISOString(),
    end: now.toISOString(),
    granularity: '1h',
  });
}

export function useLatencyChart(agentId?: string) {
  const now = new Date();
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return useMetricSeries('latency', {
    agentId,
    start: start.toISOString(),
    end: now.toISOString(),
    granularity: '1h',
  });
}

export function useTokenUsageChart(agentId?: string) {
  const now = new Date();
  const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // last 7d
  return useMetricSeries('tokens', {
    agentId,
    start: start.toISOString(),
    end: now.toISOString(),
    granularity: '1h',
  });
}

export function useErrorRateChart(agentId?: string) {
  const now = new Date();
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return useMetricSeries('errors', {
    agentId,
    start: start.toISOString(),
    end: now.toISOString(),
    granularity: '1h',
  });
}
