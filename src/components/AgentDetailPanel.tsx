import { useState } from 'react';
import { Copy, ExternalLink, KeyRound, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
import StatusBadge from './StatusBadge';
import {
  useAccessKeys,
  useAgent,
  useAgentLogs,
  useAgentMetrics,
  useCreateAccessKey,
  useDeleteAccessKey,
  useUpdateAgent,
} from '../hooks/useAgents';
import type { Agent } from '../types';

interface AgentDetailPanelProps {
  agentId: string | null;
  onClose: () => void;
}

const levelColor: Record<string, string> = {
  ERROR: 'text-rose-400',
  WARN: 'text-amber-400',
  INFO: 'text-emerald-400',
  DEBUG: 'text-slate-500',
};

/**
 * Live view of one agent: status, live Docker CPU/memory (the only metrics
 * the gateway measures for real today), and a tail of container logs.
 */
export default function AgentDetailPanel({ agentId, onClose }: AgentDetailPanelProps) {
  const agentQ = useAgent(agentId);
  const metricsQ = useAgentMetrics(agentId && (agentQ.data?.replicas ?? 0) > 0 ? agentId : null);
  const logsQ = useAgentLogs(agentId && (agentQ.data?.replicas ?? 0) > 0 ? agentId : null);

  if (!agentId) return null;
  const agent = agentQ.data;
  const m = metricsQ.data;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-surface-0/60" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-2xl flex-col overflow-y-auto border-l border-surface-3 bg-surface-1 shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-3 px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-white">{agent?.name ?? 'Loading…'}</h2>
            <p className="truncate font-mono text-xs text-slate-500">{agentId}</p>
            {agent?.url && (
              <a
                href={agent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center gap-1 truncate text-xs text-brand-300 hover:text-brand-200"
              >
                {agent.url.replace(/^https?:\/\//, '')}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            {agent && <StatusBadge status={agent.status} />}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-surface-2 hover:text-slate-300"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 border-b border-surface-3 px-6 py-4">
          <Stat label="Replicas" value={m ? String(m.replicas) : String(agent?.replicas ?? '—')} />
          <Stat label="CPU" value={m ? `${m.cpu_percent.toFixed(1)}%` : '—'} />
          <Stat
            label="Memory"
            value={m ? `${m.memory_mb} MB` : '—'}
            sub={m ? `${m.memory_percent.toFixed(1)}% of limit` : undefined}
          />
        </div>

        {agent && <AccessSection key={agent.id} agent={agent} />}

        <div className="flex items-center justify-between px-6 pb-2 pt-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">Logs</h3>
          <span className="text-[11px] text-slate-600">refreshes every 5s</span>
        </div>
        <div className="mx-6 mb-6 min-h-48 flex-1 overflow-y-auto rounded-lg border border-surface-3 bg-surface-0 p-3 font-mono text-xs leading-relaxed">
          {(agent?.replicas ?? 0) === 0 ? (
            <p className="text-slate-500">No running replicas — nothing to show.</p>
          ) : logsQ.isLoading ? (
            <p className="text-slate-500">Loading logs…</p>
          ) : logsQ.isError ? (
            <p className="text-rose-400">{(logsQ.error as Error).message}</p>
          ) : (logsQ.data ?? []).length === 0 ? (
            <p className="text-slate-500">No log output yet.</p>
          ) : (
            logsQ.data!.map((line, i) => (
              <div key={`${line.replica_id}-${line.timestamp}-${i}`} className="flex gap-2">
                <span className="shrink-0 text-slate-600">{new Date(line.timestamp).toLocaleTimeString()}</span>
                <span className={clsx('shrink-0', levelColor[line.level] ?? 'text-slate-400')}>
                  {line.level.padEnd(5)}
                </span>
                <span className="shrink-0 text-sky-500">{line.replica_id.slice(0, 8)}</span>
                <span className="whitespace-pre-wrap break-all text-slate-300">{line.message}</span>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

/**
 * Who may call the agent's public URL (public, or only with an access key)
 * and how fast one caller may call it.
 */
function AccessSection({ agent }: { agent: Agent }) {
  const update = useUpdateAgent();
  const keysQ = useAccessKeys(agent.id);
  const createKey = useCreateAccessKey();
  const deleteKey = useDeleteAccessKey();
  const [label, setLabel] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [rpm, setRpm] = useState(agent.rate_limit_rpm?.toString() ?? '');

  const isPrivate = agent.access === 'private';
  const error = (update.error ?? createKey.error ?? deleteKey.error) as Error | null;
  const savedRpm = agent.rate_limit_rpm?.toString() ?? '';
  const rpmValue = rpm.trim() === '' ? null : Number(rpm);
  const rpmValid = rpmValue === null || (Number.isInteger(rpmValue) && rpmValue >= 1 && rpmValue <= 100_000);

  const onCreateKey = async () => {
    const created = await createKey.mutateAsync({ agentId: agent.id, label: label.trim() || 'default' });
    setNewKey(created.key);
    setCopied(false);
    setLabel('');
  };

  const copyKey = async () => {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
    } catch {
      // Clipboard access can be refused; the key stays visible to copy by hand.
    }
  };

  return (
    <div className="space-y-4 border-b border-surface-3 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">Access</h3>
          <p className="mt-1 text-[11px] text-slate-500">
            {isPrivate
              ? 'Only callers sending one of the keys below can use this URL.'
              : 'Anyone with the URL can call this agent.'}
          </p>
        </div>
        <div className="flex shrink-0 rounded-lg border border-surface-3 p-0.5 text-xs">
          {(['public', 'private'] as const).map((mode) => (
            <button
              key={mode}
              disabled={update.isPending || agent.access === mode}
              onClick={() => update.mutate({ id: agent.id, access: mode })}
              className={clsx(
                'rounded-md px-3 py-1 capitalize transition-colors',
                agent.access === mode ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-slate-200',
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <form
        className="flex flex-wrap items-center gap-2 text-xs"
        onSubmit={(e) => {
          e.preventDefault();
          if (rpmValid) update.mutate({ id: agent.id, rate_limit_rpm: rpmValue });
        }}
      >
        <label htmlFor={`rpm-${agent.id}`} className="text-slate-400">
          Requests per minute per caller
        </label>
        <input
          id={`rpm-${agent.id}`}
          type="number"
          min={1}
          max={100000}
          value={rpm}
          onChange={(e) => setRpm(e.target.value)}
          placeholder="120 (default)"
          className="w-32 rounded-lg border border-surface-3 bg-surface-0 px-2 py-1 text-slate-200 placeholder:text-slate-600"
        />
        <button
          type="submit"
          disabled={!rpmValid || rpm === savedRpm || update.isPending}
          className="rounded-lg border border-surface-3 px-3 py-1 text-slate-300 transition-colors hover:bg-surface-2 disabled:opacity-40"
        >
          Save
        </button>
      </form>

      {isPrivate && (
        <div className="space-y-2">
          {newKey && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
              <p className="text-amber-300">Copy this key now. It won't be shown again.</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 break-all rounded bg-surface-0 px-2 py-1 font-mono text-slate-200">
                  {newKey}
                </code>
                <button
                  onClick={copyKey}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-surface-3 px-2 py-1 text-slate-300 hover:bg-surface-2"
                >
                  <Copy className="h-3 w-3" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              {agent.url && (
                <p className="mt-2 break-all font-mono text-[11px] text-slate-400">
                  curl -H "Authorization: Bearer {newKey.slice(0, 12)}…" {agent.url}/invoke
                </p>
              )}
            </div>
          )}

          {(keysQ.data ?? []).length === 0 && !keysQ.isLoading ? (
            <p className="text-xs text-slate-500">No keys yet. This agent refuses every request until you create one.</p>
          ) : (
            <ul className="divide-y divide-surface-3 rounded-lg border border-surface-3 text-xs">
              {(keysQ.data ?? []).map((k) => (
                <li key={k.id} className="flex items-center gap-3 px-3 py-2">
                  <KeyRound className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  <span className="min-w-0 flex-1 truncate text-slate-300">{k.label}</span>
                  <code className="font-mono text-slate-500">{k.key_preview}</code>
                  <span className="text-slate-600">{new Date(k.created_at).toLocaleDateString()}</span>
                  <button
                    onClick={() => deleteKey.mutate({ agentId: agent.id, keyId: k.id })}
                    disabled={deleteKey.isPending}
                    className="rounded p-1 text-slate-500 hover:bg-surface-2 hover:text-rose-400"
                    aria-label={`Revoke ${k.label}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form
            className="flex items-center gap-2 text-xs"
            onSubmit={(e) => {
              e.preventDefault();
              onCreateKey().catch(() => {});
            }}
          >
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={128}
              placeholder="Key label, e.g. website"
              className="min-w-0 flex-1 rounded-lg border border-surface-3 bg-surface-0 px-2 py-1 text-slate-200 placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={createKey.isPending}
              className="rounded-lg bg-brand-500 px-3 py-1 font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
            >
              New key
            </button>
          </form>
        </div>
      )}

      {error && <p className="text-xs text-rose-400">{error.message}</p>}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}
