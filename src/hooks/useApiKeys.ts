import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { ApiKey, ApiKeyCreated } from '../types';

export const apiKeyKeys = {
  all: ['api-keys'] as const,
};

export function useApiKeys() {
  return useQuery({
    queryKey: apiKeyKeys.all,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiKey[]>('/api-keys');
      return data;
    },
  });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { label: string; scopes?: string[] }) => {
      const { data } = await apiClient.post<ApiKeyCreated>('/api-keys', {
        label: input.label,
        scopes: input.scopes ?? [],
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: apiKeyKeys.all });
    },
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api-keys/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: apiKeyKeys.all });
    },
  });
}
