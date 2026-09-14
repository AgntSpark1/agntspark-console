import { useState } from 'react';
import { Check, Copy, Key, Loader2, Mail, Plus, Trash2, User as UserIcon } from 'lucide-react';
import clsx from 'clsx';
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from '../hooks/useApiKeys';
import { useMe } from '../hooks/useAuth';
import { useCreateInvite, useInvites, useRevokeInvite, type Invite } from '../hooks/useInvites';

type Tab = 'api-keys' | 'invites' | 'account';

const allTabs: { id: Tab; label: string; icon: typeof Key; adminOnly?: boolean }[] = [
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'invites', label: 'Invites', icon: Mail, adminOnly: true },
  { id: 'account', label: 'Account', icon: UserIcon },
];

export default function Settings() {
  const [tab, setTab] = useState<Tab>('api-keys');
  const isAdmin = useMe().data?.role === 'admin';
  const tabs = allTabs.filter((t) => !t.adminOnly || isAdmin);

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

      <div className="flex-1">
        {tab === 'api-keys' && <ApiKeysTab />}
        {tab === 'invites' && isAdmin && <InvitesTab />}
        {tab === 'account' && <AccountTab />}
      </div>
    </div>
  );
}

function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
      }}
      className="flex shrink-0 items-center gap-1 rounded-lg border border-surface-3 bg-surface-2 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-surface-3"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

function ApiKeysTab() {
  const keysQ = useApiKeys();
  const create = useCreateApiKey();
  const revoke = useRevokeApiKey();

  const [label, setLabel] = useState('');
  const [revealed, setRevealed] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      { label: label.trim() },
      {
        onSuccess: (key) => {
          setRevealed(key.key);
          setLabel('');
        },
      },
    );
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
          <p className="text-xs font-medium text-amber-300">Copy this key now — it won't be shown again.</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 break-all rounded bg-surface-0 px-2 py-1.5 font-mono text-xs text-slate-200">
              {revealed}
            </code>
            <CopyButton value={revealed} />
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

const inviteStatusClass: Record<Invite['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-400',
  used: 'bg-slate-500/10 text-slate-400',
  expired: 'bg-amber-500/10 text-amber-400',
  revoked: 'bg-rose-500/10 text-rose-400',
};

function InvitesTab() {
  const invitesQ = useInvites(true);
  const create = useCreateInvite();
  const revoke = useRevokeInvite();

  const [note, setNote] = useState('');
  const [maxUses, setMaxUses] = useState(1);
  const [expiresInDays, setExpiresInDays] = useState(14);
  const [created, setCreated] = useState<string | null>(null);

  const inviteLink = created ? `${window.location.origin}/login?invite=${encodeURIComponent(created)}` : '';

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      { note: note.trim(), max_uses: maxUses, expires_in_days: expiresInDays || null },
      {
        onSuccess: (invite) => {
          setCreated(invite.code);
          setNote('');
        },
      },
    );
  };

  const fieldClass =
    'h-9 w-full rounded-lg border border-surface-3 bg-surface-2 px-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none';

  return (
    <div className="rounded-xl border border-surface-3 bg-surface-1 p-6">
      <h2 className="text-base font-semibold text-white">Invites</h2>
      <p className="mt-1 text-sm text-slate-500">
        Registration is invite-only. Each code can create a limited number of accounts.
      </p>

      <form onSubmit={handleCreate} className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_6rem_7rem_auto] sm:items-end">
        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Note</span>
          <input
            maxLength={255}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Who it's for"
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Uses</span>
          <input
            type="number"
            min={1}
            max={1000}
            value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value))}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] uppercase tracking-wide text-slate-500">Expires (days)</span>
          <input
            type="number"
            min={1}
            max={365}
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(Number(e.target.value))}
            className={fieldClass}
          />
        </label>
        <button
          type="submit"
          disabled={create.isPending}
          className="flex h-9 items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
        >
          {create.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Create invite
        </button>
      </form>
      {create.isError && <p className="mt-2 text-xs text-rose-400">{(create.error as Error).message}</p>}

      {created && (
        <div className="mt-4 space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-xs font-medium text-amber-300">Share this now — the code won't be shown again.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded bg-surface-0 px-2 py-1.5 font-mono text-xs text-slate-200">
              {inviteLink}
            </code>
            <CopyButton value={inviteLink} label="Copy link" />
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded bg-surface-0 px-2 py-1.5 font-mono text-xs text-slate-400">
              {created}
            </code>
            <CopyButton value={created} label="Copy code" />
          </div>
          <button onClick={() => setCreated(null)} className="text-xs text-slate-500 hover:text-slate-300">
            Done
          </button>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {invitesQ.isLoading ? (
          <p className="text-sm text-slate-500">Loading invites…</p>
        ) : invitesQ.isError ? (
          <p className="text-sm text-rose-400">{(invitesQ.error as Error).message}</p>
        ) : (invitesQ.data ?? []).length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No invites yet.</p>
        ) : (
          invitesQ.data!.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-surface-3 bg-surface-2 p-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs text-slate-300">{invite.code_prefix}…</code>
                  <span className={clsx('rounded px-1.5 py-0.5 text-[10px] font-medium', inviteStatusClass[invite.status])}>
                    {invite.status}
                  </span>
                </div>
                {invite.note && <p className="mt-1 truncate text-sm text-slate-200">{invite.note}</p>}
                <p className="text-[11px] text-slate-500">
                  {invite.use_count}/{invite.max_uses} used · created {new Date(invite.created_at).toLocaleDateString()}
                  {invite.expires_at && ` · expires ${new Date(invite.expires_at).toLocaleDateString()}`}
                </p>
              </div>
              {invite.status === 'active' && (
                <button
                  onClick={() => {
                    if (confirm('Revoke this invite? Nobody else will be able to sign up with it.')) {
                      revoke.mutate(invite.id);
                    }
                  }}
                  disabled={revoke.isPending}
                  aria-label="Revoke invite"
                  className="rounded-lg p-2 text-rose-400 transition-colors hover:bg-rose-500/10 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
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
