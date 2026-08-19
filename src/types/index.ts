// ── Shared domain types ──────────────────────────────────────────────────

export type AgentStatus =
  | 'active'
  | 'paused'
  | 'deploying'
  | 'error'
  | 'idle';

export type Environment = 'staging' | 'production';

export type DeployStrategy = 'rolling' | 'blue-green' | 'recreate';

export interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  status: AgentStatus;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
  version: string;
  environment: Environment;
  replicas: number;
  requestsPerMin: number;
  totalRequests: number;
  errorRate: number;
  avgLatencyMs: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentSummary {
  id: string;
  name: string;
  status: AgentStatus;
  model: string;
  requestsPerMin: number;
  errorRate: number;
  environment: Environment;
}

export interface MetricPoint {
  timestamp: string;
  value: number;
}

export interface MetricSeries {
  label: string;
  data: MetricPoint[];
  color?: string;
}

export interface DashboardSummary {
  totalAgents: number;
  activeAgents: number;
  totalRequests: number;
  errorRate: number;
  avgLatencyMs: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  avatarUrl?: string;
}

export interface CreateAgentInput {
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
}

export interface DeployAgentInput {
  agentId: string;
  environment: Environment;
  replicas: number;
  cpu: number;
  memory: number;
  strategy: DeployStrategy;
}

export interface ApiKey {
  id: string;
  label: string;
  keyPreview: string;
  createdAt: string;
  lastUsedAt?: string;
  scopes: string[];
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
  granularity: '1m' | '5m' | '1h' | '1d';
}
