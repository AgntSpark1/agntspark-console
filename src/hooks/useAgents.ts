import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { AgentListParams, CreateAgentPayload, ScaleAgentPayload } from '../api/types';
import type {
  Agent,
  AgentAccess,
  AgentAccessKey,
  AgentAccessKeyCreated,
  AgentListResponse,
  AgentLog,
  AgentMetrics,
} from '../types';

// ── Query keys ────────────────────────────────────────────────────────────

export const agentKeys = {
  all: ['agents'] as const,
  list: (params?: AgentListParams) => ['agents', 'list', params] as const,
  detail: (id: string) => ['agents', 'detail', id] as const,
  logs: (id: string) => ['agents', 'logs', id] as const,
  metrics: (id: string) => ['agents', 'metrics', id] as const,
  accessKeys: (id: string) => ['agents', 'access-keys', id] as const,
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

// ── Access settings (PATCH /agents/:id) ───────────────────────────────────

export function useUpdateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      access?: AgentAccess;
      /** null restores the platform default. */
      rate_limit_rpm?: number | null;
    }) => {
      const { data } = await apiClient.patch<Agent>(`/agents/${id}`, body);
      return data;
    },
    onSuccess: (agent) => {
      qc.setQueryData(agentKeys.detail(agent.id), agent);
      qc.invalidateQueries({ queryKey: ['agents', 'list'] });
    },
  });
}

// ── Access keys for private agents ────────────────────────────────────────

export function useAccessKeys(agentId: string | null) {
  return useQuery({
    queryKey: agentId ? agentKeys.accessKeys(agentId) : ['agents', 'access-keys', 'idle'],
    queryFn: async () => {
      const { data } = await apiClient.get<AgentAccessKey[]>(`/agents/${agentId}/access-keys`);
      return data;
    },
    enabled: !!agentId,
  });
}

export function useCreateAccessKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, label }: { agentId: string; label: string }) => {
      const { data } = await apiClient.post<AgentAccessKeyCreated>(`/agents/${agentId}/access-keys`, {
        label,
      });
      return data;
    },
    onSuccess: (_data, { agentId }) => {
      qc.invalidateQueries({ queryKey: agentKeys.accessKeys(agentId) });
    },
  });
}

export function useDeleteAccessKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, keyId }: { agentId: string; keyId: string }) => {
      await apiClient.delete(`/agents/${agentId}/access-keys/${keyId}`);
    },
    onSuccess: (_data, { agentId }) => {
      qc.invalidateQueries({ queryKey: agentKeys.accessKeys(agentId) });
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
