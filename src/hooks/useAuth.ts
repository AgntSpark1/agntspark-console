import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient, { TOKEN_STORAGE_KEY } from '../api/client';
import type { User } from '../types';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export function hasStoredToken(): boolean {
  return !!localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const { data } = await apiClient.get<User>('/auth/me');
      return data;
    },
    enabled: hasStoredToken(),
    retry: false,
  });
}

function useStoreSession() {
  const qc = useQueryClient();
  return (res: TokenResponse) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, res.access_token);
    qc.setQueryData(authKeys.me, res.user);
  };
}

export function useLogin() {
  const storeSession = useStoreSession();
  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { data } = await apiClient.post<TokenResponse>('/auth/login', input);
      return data;
    },
    onSuccess: storeSession,
  });
}

export function useRegister() {
  const storeSession = useStoreSession();
  return useMutation({
    mutationFn: async (input: { email: string; password: string; name: string }) => {
      const { data } = await apiClient.post<TokenResponse>('/auth/register', input);
      return data;
    },
    onSuccess: storeSession,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    qc.clear();
  };
}
