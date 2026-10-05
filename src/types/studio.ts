// Mirrors agntspark-gateway's /v1/studio and /v1/public/assistants shapes
// (agntspark_gateway/schemas/studio.py).

export interface StudioTemplate {
  key: string;
  name: string;
  description: string;
  default_greeting: string;
  instructions_hint: string;
}

export interface Assistant {
  id: string;
  slug: string;
  name: string;
  template: string;
  instructions: string;
  greeting: string;
  is_public: boolean;
  documents: number;
  knowledge_chars: number;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  chars: number;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatResponse {
  conversation_id: string;
  reply: ChatMessage;
}

export interface ConversationSummary {
  id: string;
  source: 'test' | 'public';
  messages: number;
  preview: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  source: 'test' | 'public';
  messages: ChatMessage[];
}

export interface StudioUsage {
  plan: string;
  period_start: string;
  messages_used: number;
  messages_limit: number;
  assistants: number;
  assistants_limit: number;
  knowledge_chars: number;
  knowledge_chars_limit: number;
  chat_available: boolean;
}

export interface PublicAssistant {
  name: string;
  greeting: string;
}
