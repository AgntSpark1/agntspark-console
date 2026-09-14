import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

/** agntspark-gateway /v1/admin/invites (admin only). */
export interface Invite {
  id: string;
  code_prefix: string;
  note: string;
  max_uses: number;
  use_count: number;
  status: 'active' | 'used' | 'expired' | 'revoked';
  expires_at: string | null;
  created_at: string;
}

export interface InviteCreated extends Invite {
  /** The raw invite code — returned only once, at creation. */
  code: string;
}

export const inviteKeys = {
  all: ['admin', 'invites'] as const,
};

export function useInvites(enabled: boolean) {
  return useQuery({
    queryKey: inviteKeys.all,
    queryFn: async () => {
      const { data } = await apiClient.get<Invite[]>('/admin/invites');
      return data;
    },
    enabled,
  });
}

export function useCreateInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { note: string; max_uses: number; expires_in_days: number | null }) => {
      const { data } = await apiClient.post<InviteCreated>('/admin/invites', input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inviteKeys.all });
    },
  });
}

export function useRevokeInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/invites/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inviteKeys.all });
    },
  });
}
