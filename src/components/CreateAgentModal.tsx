import { useState } from 'react';
import clsx from 'clsx';
import { Copy, Loader2, Rocket, X } from 'lucide-react';
import { useCreateAgent } from '../hooks/useAgents';
import type { Agent, AgentAccess } from '../types';

interface CreateAgentModalProps {
  open: boolean;
  onClose: () => void;
}

type Source = 'customer-support' | 'code-reviewer' | 'blank' | 'custom';

/**
 * What an agent can be created from. Template images are built on the
 * production host by agntspark-gateway's deploy/bootstrap.sh; "blank" runs
 * the default runtime image (no `image`) with the user's system prompt.
 */
const SOURCES: { id: Source; label: string; description: string; image?: string; model: string }[] = [
  {
    id: 'customer-support',
    label: 'Customer Support',
    description: 'Answers from a knowledge base, opens tickets',
    image: 'agntspark/template-customer-support:latest',
    model: 'gpt-4o',
  },
  {
    id: 'code-reviewer',
    label: 'Code Reviewer',
    description: 'Reviews GitHub pull requests',
    image: 'agntspark/template-code-reviewer:latest',
    model: 'claude-sonnet-4-5',
  },
  {
    id: 'blank',
    label: 'Blank agent',
    description: 'A general assistant with your own prompt',
    model: 'gpt-4o',
  },
  {
    id: 'custom',
    label: 'Custom image',
    description: 'Any container serving /health and /invoke',
    model: 'gpt-4o',
  },
];

const ACCESS_OPTIONS: { id: AgentAccess; label: string; description: string }[] = [
  { id: 'private', label: 'Private', description: 'Only callers with an access key' },
  { id: 'public', label: 'Public', description: 'Anyone with the URL' },
];

const inputClass =
  'h-10 w-full rounded-lg border border-surface-3 bg-surface-2 px-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500';
const labelClass = 'mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500';
const primaryButton =
  'flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50';

const defaults = {
  name: '',
  source: 'customer-support' as Source,
  image: '',
  model: 'gpt-4o',
  apiKey: '',
  systemPrompt: '',
  access: 'private' as AgentAccess,
  replicas: 1,
  cpu: 1,
  memory: 512,
};

/**
 * Creates an agent and deploys it in one call (POST /v1/agents with a
 * `deploy` block): an official template, a blank agent on the default runtime
 * image, or a custom image. The model API key is sent as `api_key`, which the
 * gateway stores encrypted and injects as the provider's key variable.
 *
 * Private agents come back with their first access key, shown here once
 * before the modal closes.
 */
export default function CreateAgentModal({ open, onClose }: CreateAgentModalProps) {
  const create = useCreateAgent();
  const [form, setForm] = useState(defaults);
  const [created, setCreated] = useState<Agent | null>(null);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const set = <K extends keyof typeof defaults>(key: K, value: (typeof defaults)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const chooseSource = (source: Source) => {
    const model = SOURCES.find((s) => s.id === source)?.model ?? defaults.model;
    setForm((f) => ({ ...f, source, model }));
  };

  const close = () => {
    create.reset();
    setForm(defaults);
    setCreated(null);
    setCopied(false);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const source = SOURCES.find((s) => s.id === form.source);
    const image = form.source === 'custom' ? form.image.trim() : source?.image;
    create.mutate(
      {
        name: form.name.trim(),
        model: form.model.trim() || undefined,
        api_key: form.apiKey.trim() || undefined,
        system_prompt: form.source === 'blank' ? form.systemPrompt.trim() || undefined : undefined,
        access: form.access,
        deploy: {
          ...(image ? { image } : {}),
          replicas: form.replicas,
          resources: { cpu: form.cpu, memory_mb: form.memory },
        },
      },
      { onSuccess: (agent) => (agent.access_key ? setCreated(agent) : close()) },
    );
  };

  const copyKey = async () => {
    if (!created?.access_key) return;
    try {
      await navigator.clipboard.writeText(created.access_key);
      setCopied(true);
    } catch {
      // Clipboard access can be refused; the key stays visible to copy by hand.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Once a key is on screen, only "Done" closes, so it isn't lost to a stray click. */}
      <div className="absolute inset-0 bg-surface-0/80 backdrop-blur-sm" onClick={created ? undefined : close} />

      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-surface-3 bg-surface-1 shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10">
              <Rocket className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{created ? 'Agent created' : 'New Agent'}</h2>
              <p className="text-xs text-slate-500">
                {created ? 'Save its access key before closing' : 'Deploy a template or your own image'}
              </p>
            </div>
          </div>
          {!created && (
            <button
              onClick={close}
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-surface-2 hover:text-slate-300"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {created?.access_key ? (
          <div className="space-y-4 p-6">
            <p className="text-sm text-slate-300">
              <span className="font-medium text-white">{created.name}</span> is private: callers need this access
              key.
            </p>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
              <p className="text-amber-300">Copy this key now. It won't be shown again.</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 break-all rounded bg-surface-0 px-2 py-1 font-mono text-slate-200">
                  {created.access_key}
                </code>
                <button
                  onClick={copyKey}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-surface-3 px-2 py-1 text-slate-300 hover:bg-surface-2"
                >
                  <Copy className="h-3 w-3" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            {created.url && (
              <div>
                <span className={labelClass}>Call it</span>
                <pre className="overflow-x-auto rounded-lg border border-surface-3 bg-surface-0 p-3 font-mono text-[11px] leading-relaxed text-slate-300">
                  {`curl -X POST ${created.url}/invoke \\\n  -H "Authorization: Bearer ${created.access_key}" \\\n  -H 'content-type: application/json' \\\n  -d '{"input": "Hello"}'`}
                </pre>
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              Create more keys, revoke them, or make the agent public from its panel, under Access.
            </p>
            <div className="flex justify-end">
              <button onClick={close} className={primaryButton}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            <div>
              <span className={labelClass}>Start from</span>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Start from">
                {SOURCES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={form.source === s.id}
                    onClick={() => chooseSource(s.id)}
                    className={clsx(
                      'rounded-lg border px-3 py-2 text-left transition-colors',
                      form.source === s.id
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-surface-3 bg-surface-2 hover:border-slate-600',
                    )}
                  >
                    <span className="block text-sm font-medium text-slate-200">{s.label}</span>
                    <span className="block text-[11px] text-slate-500">{s.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="agent-name" className={labelClass}>
                Name
              </label>
              <input
                id="agent-name"
                required
                maxLength={128}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="support-bot"
                className={inputClass}
              />
            </div>

            {form.source === 'custom' && (
              <div>
                <label htmlFor="agent-image" className={labelClass}>
                  Container image
                </label>
                <input
                  id="agent-image"
                  required
                  value={form.image}
                  onChange={(e) => set('image', e.target.value)}
                  placeholder="ghcr.io/your-org/agent:1.0"
                  className={`${inputClass} font-mono`}
                />
              </div>
            )}

            {form.source === 'blank' && (
              <div>
                <label htmlFor="agent-prompt" className={labelClass}>
                  System prompt
                </label>
                <textarea
                  id="agent-prompt"
                  rows={4}
                  maxLength={32000}
                  value={form.systemPrompt}
                  onChange={(e) => set('systemPrompt', e.target.value)}
                  placeholder="You are a helpful assistant for…"
                  className={`${inputClass} h-auto py-2`}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="agent-model" className={labelClass}>
                  Model
                </label>
                <input
                  id="agent-model"
                  value={form.model}
                  onChange={(e) => set('model', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="agent-api-key" className={labelClass}>
                  Model API key
                </label>
                <input
                  id="agent-api-key"
                  type="password"
                  autoComplete="off"
                  value={form.apiKey}
                  onChange={(e) => set('apiKey', e.target.value)}
                  placeholder="sk-…"
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>
            <p className="-mt-3 text-[11px] text-slate-500">
              Your key for the model's provider (OpenAI, Anthropic or Google). It's stored encrypted and only
              given to this agent — without it the agent can't answer.
            </p>

            <div>
              <span className={labelClass}>Access</span>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Access">
                {ACCESS_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={form.access === o.id}
                    onClick={() => set('access', o.id)}
                    className={clsx(
                      'rounded-lg border px-3 py-2 text-left transition-colors',
                      form.access === o.id
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-surface-3 bg-surface-2 hover:border-slate-600',
                    )}
                  >
                    <span className="block text-sm font-medium text-slate-200">{o.label}</span>
                    <span className="block text-[11px] text-slate-500">{o.description}</span>
                  </button>
                ))}
              </div>
              {form.access === 'public' && (
                <p className="mt-2 text-[11px] text-amber-400">
                  Agent URLs are found by scanners within minutes, and every call spends your model credits.
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="agent-replicas" className={labelClass}>
                  Replicas
                </label>
                <input
                  id="agent-replicas"
                  type="number"
                  min={1}
                  max={100}
                  value={form.replicas}
                  onChange={(e) => set('replicas', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="agent-cpu" className={labelClass}>
                  CPU
                </label>
                <input
                  id="agent-cpu"
                  type="number"
                  min={0.1}
                  max={64}
                  step={0.1}
                  value={form.cpu}
                  onChange={(e) => set('cpu', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="agent-memory" className={labelClass}>
                  Memory MB
                </label>
                <input
                  id="agent-memory"
                  type="number"
                  min={128}
                  max={65536}
                  step={128}
                  value={form.memory}
                  onChange={(e) => set('memory', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>

            {create.isError && (
              <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
                {(create.error as Error).message}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={close}
                className="rounded-lg border border-surface-3 bg-surface-2 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-surface-3"
              >
                Cancel
              </button>
              <button type="submit" disabled={create.isPending} className={primaryButton}>
                {create.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Deploying…
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" /> Create &amp; deploy
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
