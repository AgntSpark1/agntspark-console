import { useState } from 'react';
import { X, Rocket, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useDeployAgent } from '../hooks/useAgents';
import type { Agent, DeployStrategy, Environment } from '../types';

interface DeployModalProps {
  agent: Agent | null;
  open: boolean;
  onClose: () => void;
}

const strategies: { value: DeployStrategy; label: string; description: string }[] = [
  { value: 'rolling', label: 'Rolling', description: 'Update pods one at a time' },
  { value: 'blue-green', label: 'Blue-Green', description: 'Instant switch to new version' },
  { value: 'recreate', label: 'Recreate', description: 'Tear down all, then deploy' },
];

export default function DeployModal({ agent, open, onClose }: DeployModalProps) {
  const deploy = useDeployAgent();

  const [environment, setEnvironment] = useState<Environment>('staging');
  const [replicas, setReplicas] = useState(2);
  const [cpu, setCpu] = useState(1);
  const [memory, setMemory] = useState(512);
  const [strategy, setStrategy] = useState<DeployStrategy>('rolling');

  if (!open || !agent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    deploy.mutate(
      {
        agentId: agent.id,
        environment,
        replicas,
        cpu,
        memory,
        strategy,
      },
      {
        onSuccess: () => {
          onClose();
          // reset form
          setEnvironment('staging');
          setReplicas(2);
          setCpu(1);
          setMemory(512);
          setStrategy('rolling');
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-0/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-surface-3 bg-surface-1 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10">
              <Rocket className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Deploy Agent
              </h2>
              <p className="text-xs text-slate-500">
                {agent.name} · v{agent.version}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-surface-2 hover:text-slate-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Environment */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Environment
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['staging', 'production'] as Environment[]).map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setEnvironment(env)}
                  className={clsx(
                    'rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
                    environment === env
                      ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                      : 'border-surface-3 bg-surface-2 text-slate-400 hover:text-slate-200',
                  )}
                >
                  {env === 'production' ? 'Production' : 'Staging'}
                </button>
              ))}
            </div>
          </div>

          {/* Replicas */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Replicas
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={replicas}
              onChange={(e) => setReplicas(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-surface-3 bg-surface-2 px-3 text-sm text-slate-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Resources */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                CPU (cores)
              </label>
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={cpu}
                onChange={(e) => setCpu(Number(e.target.value))}
                className="h-10 w-full rounded-lg border border-surface-3 bg-surface-2 px-3 text-sm text-slate-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Memory (MB)
              </label>
              <input
                type="number"
                min={128}
                step={128}
                value={memory}
                onChange={(e) => setMemory(Number(e.target.value))}
                className="h-10 w-full rounded-lg border border-surface-3 bg-surface-2 px-3 text-sm text-slate-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Strategy */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Deployment Strategy
            </label>
            <div className="space-y-2">
              {strategies.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStrategy(s.value)}
                  className={clsx(
                    'flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left transition-colors',
                    strategy === s.value
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-surface-3 bg-surface-2 hover:border-surface-3',
                  )}
                >
                  <div>
                    <p className={clsx(
                      'text-sm font-medium',
                      strategy === s.value ? 'text-brand-300' : 'text-slate-300',
                    )}>
                      {s.label}
                    </p>
                    <p className="text-xs text-slate-500">{s.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {deploy.isError && (
            <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-400">
              {(deploy.error as Error)?.message ?? 'Deployment failed'}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-surface-3 bg-surface-2 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-surface-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deploy.isPending}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
            >
              {deploy.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Deploying...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" /> Deploy
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
