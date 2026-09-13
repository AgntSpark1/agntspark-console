import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { AgentListParams, CreateAgentPayload, ScaleAgentPayload } from '../api/types';
import type { Agent, AgentListResponse, AgentLog, AgentMetrics } from '../types';

// ── Query keys ────────────────────────────────────────────────────────────

export const agentKeys = {
  all: ['agents'] as const,
  list: (params?: AgentListParams) => ['agents', 'list', params] as const,
  detail: (id: string) => ['agents', 'detail', id] as const,
  logs: (id: string) => ['agents', 'logs', id] as const,
  metrics: (id: string) => ['agents', 'metrics', id] as const,
};

// ── List agents ───────────────────────────────────────────────────────────

export function useAgents(params: AgentListParams = {}) {
  return useQuery({
    queryKey: agentKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<AgentListResponse>('/agents', { params });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

// ── Single agent ──────────────────────────────────────────────────────────

export function useAgent(id: string | null) {
  return useQuery({
    queryKey: id ? agentKeys.detail(id) : ['agents', 'detail', 'idle'],
    queryFn: async () => {
      const { data } = await apiClient.get<Agent>(`/agents/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// ── Create (+ optionally deploy) agent ──────────────────────────────────────

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAgentPayload) => {
      const { data } = await apiClient.post<Agent>('/agents', input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: agentKeys.all });
    },
  });
}

// ── Scale ─────────────────────────────────────────────────────────────────

export function useScaleAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & ScaleAgentPayload) => {
      const { data } = await apiClient.post(`/agents/${id}/scale`, payload);
      return data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: agentKeys.all });
      qc.invalidateQueries({ queryKey: agentKeys.detail(id) });
    },
  });
}

// ── Delete agent ──────────────────────────────────────────────────────────

export function useDeleteAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/agents/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: agentKeys.all });
    },
  });
}

// ── Logs (tail-based, not a live stream — see agntspark-gateway README) ────

export function useAgentLogs(id: string | null) {
  return useQuery({
    queryKey: id ? agentKeys.logs(id) : ['agents', 'logs', 'idle'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ logs: AgentLog[] }>(`/agents/${id}/logs`, {
        params: { limit: 200 },
      });
      return data.logs;
    },
    enabled: !!id,
    refetchInterval: 5_000,
  });
}

// ── Metrics (live Docker snapshot — see agntspark-gateway README for what's real) ──

export function useAgentMetrics(id: string | null) {
  return useQuery({
    queryKey: id ? agentKeys.metrics(id) : ['agents', 'metrics', 'idle'],
    queryFn: async () => {
      const { data } = await apiClient.get<AgentMetrics>(`/agents/${id}/metrics`);
      return data;
    },
    enabled: !!id,
    refetchInterval: 10_000,
  });
}
