// ── Shared domain types ──────────────────────────────────────────────────
//
// These mirror agntspark-gateway's real /v1 response shapes (see
// agntspark_gateway/schemas/agents.py and schemas/auth.py) — not an
// imagined product surface. Fields the gateway doesn't have (multi-
// environment, deployment strategies, cost/token tracking, webhooks,
// pause/resume) are deliberately absent; see agntspark-gateway's README
// "Known follow-ups" for what's genuinely not built yet.

export type AgentStatus =
  | 'pending'
  | 'building'
  | 'starting'
  | 'running'
  | 'scaling'
  | 'stopping'
  | 'stopped'
  | 'failed'
  | 'crashed';

export interface ResourceLimits {
  cpu: number;
  memory_mb: number;
  gpu: number;
  gpu_type?: string | null;
  disk_gb: number;
  ephemeral_storage_gb: number;
}

export interface EnvVar {
  key: string;
  value: string;
  secret: boolean;
}

export interface DeployConfig {
  replicas: number;
  resources: ResourceLimits;
  env: EnvVar[];
  image?: string | null;
  build_path?: string | null;
  command?: string | null;
  args: string[];
  health_check_path?: string | null;
  auto_scale: boolean;
  min_replicas: number;
  max_replicas: number;
  port: number;
}

export interface Agent {
  id: string;
  name: string;
  runtime: string;
  framework: string;
  model: string;
  status: AgentStatus;
  created_at: string;
  updated_at: string;
  url?: string | null;
  deploy?: DeployConfig | null;
  tags: string[];
  metadata: Record<string, string>;
  error?: string | null;
  version: number;
  replicas: number;
}

export interface AgentListResponse {
  agents: Agent[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface AgentMetrics {
  agent_id: string;
  timestamp: string;
  cpu_percent: number;
  memory_mb: number;
  memory_percent: number;
  gpu_percent: number;
  gpu_memory_mb: number;
  request_count: number;
  request_rate: number;
  error_count: number;
  error_rate: number;
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  replicas: number;
}

export interface AgentLog {
  agent_id: string;
  replica_id: string;
  timestamp: string;
  level: string;
  message: string;
  source: string;
  metadata: Record<string, unknown>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  /** Plan key from agntspark-gateway's plans.py, e.g. "free" or "pro". */
  plan?: string;
  avatarUrl?: string | null;
}

export interface ApiKey {
  id: string;
  label: string;
  keyPreview: string;
  createdAt: string;
  lastUsedAt?: string | null;
  scopes: string[];
}

/** Only returned once, at creation — the raw secret is never shown again. */
export interface ApiKeyCreated extends ApiKey {
  key: string;
}
