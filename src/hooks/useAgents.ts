import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type {
  Agent,
  CreateAgentInput,
  DeployAgentInput,
} from '../types';
import type { AgentListParams, PaginatedResponse } from '../api/types';

// ── Query keys ────────────────────────────────────────────────────────────

export const agentKeys = {
  all: ['agents'] as const,
  list: (params?: AgentListParams) => ['agents', 'list', params] as const,
  detail: (id: string) => ['agents', 'detail', id] as const,
};

// ── List agents ───────────────────────────────────────────────────────────

export function useAgents(params: AgentListParams = {}) {
  return useQuery({
    queryKey: agentKeys.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Agent>>('/agents', {
        params,
      });
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

// ── Create agent ──────────────────────────────────────────────────────────

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAgentInput) => {
      const { data } = await apiClient.post<Agent>('/agents', input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: agentKeys.all });
    },
  });
}

// ── Deploy agent ──────────────────────────────────────────────────────────

export function useDeployAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: DeployAgentInput) => {
      const { data } = await apiClient.post<Agent>(
        `/agents/${input.agentId}/deploy`,
        input,
      );
      return data;
    },
    onSuccess: (agent) => {
      qc.invalidateQueries({ queryKey: agentKeys.all });
      qc.setQueryData(agentKeys.detail(agent.id), agent);
    },
  });
}

// ── Pause / resume ───────────────────────────────────────────────────────

export function useToggleAgentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'pause' | 'resume' }) => {
      const { data } = await apiClient.post<Agent>(`/agents/${id}/${action}`);
      return data;
    },
    onSuccess: (agent) => {
      qc.invalidateQueries({ queryKey: agentKeys.all });
      qc.setQueryData(agentKeys.detail(agent.id), agent);
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
