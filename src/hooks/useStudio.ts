import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type {
  Assistant,
  ChatResponse,
  Conversation,
  ConversationSummary,
  KnowledgeDocument,
  PublicAssistant,
  StudioTemplate,
  StudioUsage,
} from '../types/studio';

// A reply waits on the model, which can take longer than the client's default.
export const CHAT_TIMEOUT_MS = 90_000;

export const studioKeys = {
  templates: ['studio', 'templates'] as const,
  usage: ['studio', 'usage'] as const,
  assistants: ['studio', 'assistants'] as const,
  assistant: (id: string) => ['studio', 'assistants', id] as const,
  documents: (id: string) => ['studio', 'assistants', id, 'documents'] as const,
  conversations: (id: string) => ['studio', 'assistants', id, 'conversations'] as const,
  conversation: (id: string, cid: string) => ['studio', 'assistants', id, 'conversations', cid] as const,
};

export function useTemplates() {
  return useQuery({
    queryKey: studioKeys.templates,
    queryFn: async () => (await apiClient.get<StudioTemplate[]>('/studio/templates')).data,
    staleTime: 60 * 60_000,
  });
}

export function useStudioUsage() {
  return useQuery({
    queryKey: studioKeys.usage,
    queryFn: async () => (await apiClient.get<StudioUsage>('/studio/usage')).data,
  });
}

export function useAssistants() {
  return useQuery({
    queryKey: studioKeys.assistants,
    queryFn: async () => (await apiClient.get<Assistant[]>('/studio/assistants')).data,
  });
}

export function useAssistant(id: string) {
  return useQuery({
    queryKey: studioKeys.assistant(id),
    queryFn: async () => (await apiClient.get<Assistant>(`/studio/assistants/${id}`)).data,
  });
}

export function useCreateAssistant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { template: string; name: string; greeting?: string }) =>
      (await apiClient.post<Assistant>('/studio/assistants', input)).data,
    onSuccess: (a) => {
      qc.setQueryData(studioKeys.assistant(a.id), a);
      qc.invalidateQueries({ queryKey: studioKeys.assistants, exact: true });
      qc.invalidateQueries({ queryKey: studioKeys.usage });
    },
  });
}

export function useUpdateAssistant(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: Partial<Pick<Assistant, 'name' | 'instructions' | 'greeting' | 'is_public'>>,
    ) => (await apiClient.patch<Assistant>(`/studio/assistants/${id}`, input)).data,
    onSuccess: (a) => {
      qc.setQueryData(studioKeys.assistant(id), a);
      qc.invalidateQueries({ queryKey: studioKeys.assistants, exact: true });
    },
  });
}

export function useDeleteAssistant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/studio/assistants/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studioKeys.assistants, exact: true });
      qc.invalidateQueries({ queryKey: studioKeys.usage });
    },
  });
}

export function useDocuments(id: string) {
  return useQuery({
    queryKey: studioKeys.documents(id),
    queryFn: async () =>
      (await apiClient.get<KnowledgeDocument[]>(`/studio/assistants/${id}/documents`)).data,
  });
}

function useInvalidateKnowledge(id: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: studioKeys.documents(id) });
    qc.invalidateQueries({ queryKey: studioKeys.assistant(id), exact: true });
    qc.invalidateQueries({ queryKey: studioKeys.usage });
  };
}

export function useAddDocument(id: string) {
  const invalidate = useInvalidateKnowledge(id);
  return useMutation({
    mutationFn: async (input: { title: string; content: string }) =>
      (await apiClient.post<KnowledgeDocument>(`/studio/assistants/${id}/documents`, input)).data,
    onSuccess: invalidate,
  });
}

export function useDeleteDocument(id: string) {
  const invalidate = useInvalidateKnowledge(id);
  return useMutation({
    mutationFn: async (documentId: string) => {
      await apiClient.delete(`/studio/assistants/${id}/documents/${documentId}`);
    },
    onSuccess: invalidate,
  });
}

export async function sendTestMessage(
  id: string,
  message: string,
  conversationId: string | null,
): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>(
    `/studio/assistants/${id}/chat`,
    { message, conversation_id: conversationId },
    { timeout: CHAT_TIMEOUT_MS },
  );
  return data;
}

export function useConversations(id: string) {
  return useQuery({
    queryKey: studioKeys.conversations(id),
    queryFn: async () =>
      (await apiClient.get<ConversationSummary[]>(`/studio/assistants/${id}/conversations`)).data,
    staleTime: 0,
  });
}

export function useConversation(id: string, cid: string | null) {
  return useQuery({
    queryKey: studioKeys.conversation(id, cid ?? ''),
    queryFn: async () =>
      (await apiClient.get<Conversation>(`/studio/assistants/${id}/conversations/${cid}`)).data,
    enabled: !!cid,
  });
}

// ── Public chat page (no login) ───────────────────────────────────────────

export function usePublicAssistant(slug: string) {
  return useQuery({
    queryKey: ['public', slug],
    queryFn: async () => (await apiClient.get<PublicAssistant>(`/public/assistants/${slug}`)).data,
    retry: false,
  });
}

export async function sendPublicMessage(
  slug: string,
  message: string,
  conversationId: string | null,
): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>(
    `/public/assistants/${slug}/chat`,
    { message, conversation_id: conversationId },
    { timeout: CHAT_TIMEOUT_MS },
  );
  return data;
}

export async function fetchPublicConversation(slug: string, conversationId: string) {
  const { data } = await apiClient.get<{ id: string; messages: Conversation['messages'] }>(
    `/public/assistants/${slug}/conversations/${conversationId}`,
  );
  return data;
}
