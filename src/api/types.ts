// ── API request types ────────────────────────────────────────────────────
//
// Matches agntspark-gateway's real query params (agntspark_gateway/routers/
// agents.py) — no generic PaginatedResponse<T> wrapper, since the gateway's
// list response is agent-specific ({agents, total, page, page_size,
// has_next}, not {data, total, page, perPage}).

import type { AgentAccess, AgentStatus } from '../types';

export interface AgentListParams {
  page?: number;
  page_size?: number;
  status?: AgentStatus;
  tag?: string;
}

export interface DeployAgentPayload {
  /** Omit to run the platform's default runtime image (agntspark/agent-runtime). */
  image?: string;
  replicas: number;
  resources?: {
    cpu?: number;
    memory_mb?: number;
  };
}

export interface CreateAgentPayload {
  name: string;
  model?: string;
  framework?: string;
  system_prompt?: string;
  /** Bring-your-own key for the model's provider; stored encrypted by the gateway. */
  api_key?: string;
  /** Defaults to private; a private agent's response carries its first access key. */
  access?: AgentAccess;
  tags?: string[];
  deploy?: DeployAgentPayload;
}

export interface ScaleAgentPayload {
  direction: 'up' | 'down';
  count?: number;
  reason?: string;
}
