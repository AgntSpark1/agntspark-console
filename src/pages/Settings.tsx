import { useState } from 'react';
import { Key, Webhook, Users, Save, Plus, Trash2, Copy } from 'lucide-react';
import clsx from 'clsx';
import type { ApiKey, Webhook as WebhookType, User } from '../types';

// ── Mock data (would come from API in production) ──────────────────────────
const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    label: 'Production API Key',
    keyPreview: 'agnt_••••••••••••Xf9k',
    createdAt: '2026-01-15T10:00:00Z',
    lastUsedAt: '2026-08-19T14:22:00Z',
    scopes: ['agents:read', 'agents:write', 'metrics:read'],
  },
  {
    id: '2',
    label: 'CI/CD Key',
    keyPreview: 'agnt_••••••••••••m2Lp',
    createdAt: '2026-03-01T08:00:00Z',
    lastUsedAt: '2026-08-20T01:00:00Z',
    scopes: ['agents:write', 'deploy:write'],
  },
];

const mockWebhooks: WebhookType[] = [
  {
    id: '1',
    url: 'https://hooks.slack.com/services/T0/B0/xxx',
    events: ['agent.deployed', 'agent.failed'],
    active: true,
    createdAt: '2026-02-10T00:00:00Z',
  },
];

const mockTeam: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    email: 'alex@agntspark.io',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya@agntspark.io',
    role: 'developer',
  },
  {
    id: '3',
    name: 'Diego Ruiz',
    email: 'diego@agntspark.io',
    role: 'viewer',
  },
];

type Tab = 'api-keys' | 'webhooks' | 'team' | 'general';

const tabs: { id: Tab; label: string; icon: typeof Key }[] = [
  { id: 'general', label: 'General', icon: Save },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  { id: 'team', label: 'Team', icon: Users },
];

export default function Settings() {
  const [tab, setTab] = useState<Tab>('general');
  const [apiKeys] = useState<ApiKey[]>(mockApiKeys);
  const [webhooks] = useState<WebhookType[]>(mockWebhooks);
  const [team] = useState<User[]>(mockTeam);

  const [orgName, setOrgName] = useState('AgntSpark LLC');
  const [defaultModel, setDefaultModel] = useState('gpt-4o');
  const [defaultTemp, setDefaultTemp] = useState(0.7);
  const [maxRetries, setMaxRetries] = useState(3);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Tab sidebar */}
      <div className="w-full shrink-0 lg:w-52">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={clsx(
                'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                tab === id
                  ? 'bg-brand-500/10 text-brand-300'
                  : 'text-slate-400 hover:bg-surface-2 hover:text-slate-200',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="flex-1">
        {/* General */}
        {tab === 'general' && (
          <div className="max-w-xl space-y-5 rounded-xl border border-surface-3 bg-surface-1 p-6">
            <h2 className="text-base font-semibold text-white">General Settings</h2>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Organization Name
              </label>
              <input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="h-10 w-full rounded-lg border border-surface-3 bg-surface-2 px-3 text-sm text-slate-200 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Default Model
              </label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="h-10 w-full rounded-lg border border-surface-3 bg-surface-2 px-3 text-sm text-slate-200 focus:border-brand-500 focus:outline-none"
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                <option value="llama-3.1-70b">Llama 3.1 70B</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Default Temperature: {defaultTemp}
              </label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={defaultTemp}
                onChange={(e) => setDefaultTemp(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Max Retries
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                className="h-10 w-full rounded-lg border border-surface-3 bg-surface-2 px-3 text-sm text-slate-200 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <button className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600">
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        )}

        {/* API Keys */}
        {tab === 'api-keys' && (
          <div className="rounded-xl border border-surface-3 bg-surface-1 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">API Keys</h2>
              <button className="flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600">
                <Plus className="h-3.5 w-3.5" /> Generate Key
              </button>
            </div>

            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between rounded-lg border border-surface-3 bg-surface-2 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {key.label}
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs text-slate-400">
                          {key.keyPreview}
                        </code>
                        <button className="text-slate-500 hover:text-slate-300">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-1 flex gap-1.5">
                        {key.scopes.map((s) => (
                          <span
                            key={s}
                            className="rounded bg-surface-3 px-1.5 py-0.5 text-[10px] font-medium text-slate-400"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-500/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Webhooks */}
        {tab === 'webhooks' && (
          <div className="rounded-xl border border-surface-3 bg-surface-1 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Webhooks</h2>
              <button className="flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600">
                <Plus className="h-3.5 w-3.5" /> Add Webhook
              </button>
            </div>

            <div className="space-y-3">
              {webhooks.map((wh) => (
                <div
                  key={wh.id}
                  className="rounded-lg border border-surface-3 bg-surface-2 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Webhook className="h-5 w-5 text-slate-500" />
                      <code className="font-mono text-xs text-slate-300">
                        {wh.url}
                      </code>
                    </div>
                    <span
                      className={clsx(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        wh.active
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-slate-500/10 text-slate-400',
                      )}
                    >
                      {wh.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    {wh.events.map((e) => (
                      <span
                        key={e}
                        className="rounded bg-surface-3 px-1.5 py-0.5 text-[10px] font-medium text-slate-400"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {webhooks.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">
                  No webhooks configured.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Team */}
        {tab === 'team' && (
          <div className="rounded-xl border border-surface-3 bg-surface-1 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Team Members</h2>
              <button className="flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-600">
                <Plus className="h-3.5 w-3.5" /> Invite
              </button>
            </div>

            <div className="space-y-2">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-surface-3 bg-surface-2 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-semibold text-white">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {member.name}
                      </p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                  </div>
                  <span
                    className={clsx(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      member.role === 'admin'
                        ? 'bg-brand-500/10 text-brand-300'
                        : member.role === 'developer'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-slate-500/10 text-slate-400',
                    )}
                  >
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
