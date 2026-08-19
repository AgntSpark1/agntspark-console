// ── API request/response types ──────────────────────────────────────────

export interface AgentListParams {
  page?: number;
  perPage?: number;
  status?: 'active' | 'paused' | 'deploying' | 'error' | 'idle';
  sort?: 'name' | 'created' | 'requests';
  order?: 'asc' | 'desc';
}

export interface CreateAgentPayload {
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
}

export interface DeployAgentPayload {
  agentId: string;
  environment: 'staging' | 'production';
  replicas: number;
  cpu: number;
  memory: number;
  strategy: 'rolling' | 'blue-green' | 'recreate';
}

export interface MetricsQueryParams {
  agentId?: string;
  start: string; // ISO 8601
  end: string; // ISO 8601
  granularity?: '1m' | '5m' | '1h' | '1d';
}

// ── API response wrappers ────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface MetricsResponse {
  series: {
    timestamp: string;
    value: number;
  }[];
  summary: {
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  };
}
