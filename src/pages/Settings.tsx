import { useState } from 'react';
import { Check, Copy, Key, Loader2, Plus, Trash2, User as UserIcon } from 'lucide-react';
import clsx from 'clsx';
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '../hooks/useApiKeys';
import { useMe } from '../hooks/useAuth';

type Tab = 'api-keys' | 'account';

const tabs: { id: Tab; label: string; icon: typeof Key }[] = [
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'account', label: 'Account', icon: UserIcon },
];

export default function Settings() {
  const [tab, setTab] = useState<Tab>('api-keys');

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
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

      <div className="flex-1">{tab === 'api-keys' ? <ApiKeysTab /> : <AccountTab />}</div>
    </div>
  );
}

function ApiKeysTab() {
  const keysQ = useApiKeys();
  const create = useCreateApiKey();
  const revoke = useRevokeApiKey();

  const [label, setLabel] = useState('');
  const [revealed, setRevealed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      { label: label.trim() },
      {
        onSuccess: (key) => {
          setRevealed(key.key);
          setCopied(false);
          setLabel('');
        },
      },
    );
  };

  const copy = async () => {
    if (!revealed) return;
    await navigator.clipboard.writeText(revealed);
    setCopied(true);
  };

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-6">
      <h2 className="text-base font-semibold text-white">API Keys</h2>
      <p className="mt-1 text-sm text-slate-500">
        Use these with the <code className="text-slate-400">agntspark</code> CLI and Python SDK.
      </p>

      <form onSubmit={handleCreate} className="mt-5 flex gap-2">
        <input
          aria-label="New key label"
          required
          maxLength={128}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label, e.g. ci-deploy"
          className="h-9 flex-1 rounded-lg border border-surface-3 bg-surface-2 px-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={create.isPending}
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
        >
          {create.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Generate key
        </button>
      </form>
      {create.isError && <p className="mt-2 text-xs text-rose-400">{(create.error as Error).message}</p>}

      {revealed && (
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-xs font-medium text-amber-300">
            Copy this key now — it won't be shown again.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 break-all rounded bg-surface-0 px-2 py-1.5 font-mono text-xs text-slate-200">
              {revealed}
            </code>
            <button
              onClick={copy}
              className="flex items-center gap-1 rounded-lg border border-surface-3 bg-surface-2 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-surface-3"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <button onClick={() => setRevealed(null)} className="mt-2 text-xs text-slate-500 hover:text-slate-300">
            Done
          </button>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {keysQ.isLoading ? (
          <p className="text-sm text-slate-500">Loading keys…</p>
        ) : keysQ.isError ? (
          <p className="text-sm text-rose-400">{(keysQ.error as Error).message}</p>
        ) : (keysQ.data ?? []).length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No API keys yet.</p>
        ) : (
          keysQ.data!.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-surface-3 bg-surface-2 p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Key className="h-5 w-5 shrink-0 text-slate-500" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-200">{key.label}</p>
                  <code className="font-mono text-xs text-slate-400">{key.keyPreview}</code>
                  <p className="text-[11px] text-slate-500">
                    Created {new Date(key.createdAt).toLocaleDateString()}
                    {key.lastUsedAt && ` · last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Revoke "${key.label}"? Anything using it will stop working.`)) {
                    revoke.mutate(key.id);
                  }
                }}
                disabled={revoke.isPending}
                aria-label={`Revoke ${key.label}`}
                className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-500/10 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AccountTab() {
  const meQ = useMe();
  const me = meQ.data;

  return (
    <div className="max-w-xl rounded-xl border border-surface-3 bg-surface-1 p-6">
      <h2 className="text-base font-semibold text-white">Account</h2>
      {meQ.isLoading ? (
        <p className="mt-4 text-sm text-slate-500">Loading…</p>
      ) : me ? (
        <dl className="mt-4 space-y-3 text-sm">
          <Row label="Name" value={me.name} />
          <Row label="Email" value={me.email} />
          <Row label="Role" value={me.role} />
          <Row label="User ID" value={me.id} mono />
        </dl>
      ) : (
        <p className="mt-4 text-sm text-rose-400">Couldn't load account.</p>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-surface-3 pb-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className={clsx('text-right text-slate-200', mono && 'font-mono text-xs')}>{value}</dd>
    </div>
  );
}
