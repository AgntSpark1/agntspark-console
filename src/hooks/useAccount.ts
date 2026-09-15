import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { User } from '../types';
import { authKeys } from './useAuth';

/** agntspark-gateway GET /v1/account/usage. */
export interface AccountUsage {
  plan: string;
  /** Admins aren't held to plan limits. */
  exempt: boolean;
  limits: {
    max_agents: number;
    max_replicas: number;
    max_vcpu: number;
    max_memory_mb: number;
    max_replica_cpu: number;
    max_replica_memory_mb: number;
    /** Requests per minute one agent's URL serves, across all callers. */
    max_agent_rpm: number;
  };
  usage: {
    agents: number;
    replicas: number;
    vcpu: number;
    memory_mb: number;
  };
  /** Metered usage since the first of the month (UTC). */
  period: {
    start: string;
    replica_hours: number;
    vcpu_hours: number;
    memory_gb_hours: number;
    requests: number;
  };
}

/** agntspark-gateway GET /v1/admin/users (admin only). */
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: User['role'];
  plan: string;
  is_active: boolean;
  agents: number;
  created_at: string;
}

export const accountKeys = {
  usage: ['account', 'usage'] as const,
  adminUsers: ['admin', 'users'] as const,
};

export function useUsage() {
  return useQuery({
    queryKey: accountKeys.usage,
    queryFn: async () => {
      const { data } = await apiClient.get<AccountUsage>('/account/usage');
      return data;
    },
    refetchInterval: 30_000,
  });
}

export function useAdminUsers(enabled: boolean) {
  return useQuery({
    queryKey: accountKeys.adminUsers,
    queryFn: async () => {
      const { data } = await apiClient.get<AdminUser[]>('/admin/users');
      return data;
    },
    enabled,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      role?: User['role'];
      plan?: string;
      is_active?: boolean;
    }) => {
      const { id, ...body } = input;
      const { data } = await apiClient.patch<AdminUser>(`/admin/users/${id}`, body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountKeys.adminUsers });
      qc.invalidateQueries({ queryKey: accountKeys.usage });
      qc.invalidateQueries({ queryKey: authKeys.me });
    },
  });
}
