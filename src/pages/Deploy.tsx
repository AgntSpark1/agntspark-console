import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Rocket,
  Server,
  Settings2,
  Check,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { useAgents } from '../hooks/useAgents';
import { useDeployAgent } from '../hooks/useAgents';
import type { Agent, DeployStrategy, Environment } from '../types';

const steps = [
  { id: 1, label: 'Select Agent', icon: Server },
  { id: 2, label: 'Configure', icon: Settings2 },
  { id: 3, label: 'Deploy', icon: Rocket },
];

export default function Deploy() {
  const [step, setStep] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [environment, setEnvironment] = useState<Environment>('staging');
  const [replicas, setReplicas] = useState(2);
  const [cpu, setCpu] = useState(1);
  const [memory, setMemory] = useState(512);
  const [strategy, setStrategy] = useState<DeployStrategy>('rolling');

  const agentsQuery = useAgents({ perPage: 50, status: 'idle' });
  const deployMutation = useDeployAgent();

  const agents = agentsQuery.data?.data ?? [];

  const handleDeploy = () => {
    if (!selectedAgent) return;
    deployMutation.mutate(
      {
        agentId: selectedAgent.id,
        environment,
        replicas,
        cpu,
        memory,
        strategy,
      },
      {
        onSuccess: () => {
          setStep(3);
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Stepper */}
      <div className="mb-8 flex items-center justify-center">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div
              className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                step >= s.id
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-surface-3 bg-surface-1 text-slate-500',
              )}
            >
              {step > s.id ? (
                <Check className="h-5 w-5" />
              ) : (
                <s.icon className="h-5 w-5" />
              )}
            </div>
            <span
              className={clsx(
                'ml-2 text-sm font-medium',
                step >= s.id ? 'text-white' : 'text-slate-500',
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={clsx(
                  'mx-4 h-0.5 w-16',
                  step > s.id ? 'bg-brand-500' : 'bg-surface-3',
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select agent */}
      {step === 1 && (
        <div className="rounded-xl border border-surface-3 bg-surface-1 p-6">
          <h2 className="mb-1 text-base font-semibold text-white">
            Select an Agent
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Choose which agent to deploy
          </p>

          {agents.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-500">No agents available.</p>
              <Link
                to="/agents"
                className="mt-2 inline-block text-sm text-brand-400 hover:text-brand-300"
              >
                Create an agent →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={clsx(
                    'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors',
                    selectedAgent?.id === agent.id
                      ? 'border-brand-500 bg-brand-500/10'
                      : 'border-surface-3 bg-surface-2 hover:border-surface-3',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-3 text-xs font-bold text-brand-400">
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {agent.name}
                      </p>
                      <p className="text-xs text-slate-500">{agent.model}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">v{agent.version}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              disabled={!selectedAgent}
              onClick={() => setStep(2)}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 2 && selectedAgent && (
        <div className="rounded-xl border border-surface-3 bg-surface-1 p-6">
          <h2 className="mb-1 text-base font-semibold text-white">
            Configuration
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Configure deployment for {selectedAgent.name}
          </p>

          {/* Environment */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Environment
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['staging', 'production'] as Environment[]).map((env) => (
                <button
                  key={env}
                  onClick={() => setEnvironment(env)}
                  className={clsx(
                    'rounded-lg border px-4 py-2.5 text-sm font-medium capitalize transition-colors',
                    environment === env
                      ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                      : 'border-surface-3 bg-surface-2 text-slate-400 hover:text-slate-200',
                  )}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          {/* Replicas */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Replicas
            </label>
            <input
              type="range"
              min={1}
              max={20}
              value={replicas}
              onChange={(e) => setReplicas(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
            <p className="mt-1 text-sm text-slate-300">{replicas} replicas</p>
          </div>

          {/* Resources */}
          <div className="mb-5 grid grid-cols-2 gap-4">
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
                className="h-10 w-full rounded-lg border border-surface-3 bg-surface-2 px-3 text-sm text-slate-200 focus:border-brand-500 focus:outline-none"
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
                className="h-10 w-full rounded-lg border border-surface-3 bg-surface-2 px-3 text-sm text-slate-200 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Strategy */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Deployment Strategy
            </label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as DeployStrategy)}
              className="h-10 w-full rounded-lg border border-surface-3 bg-surface-2 px-3 text-sm text-slate-200 focus:border-brand-500 focus:outline-none"
            >
              <option value="rolling">Rolling — Update pods one at a time</option>
              <option value="blue-green">Blue-Green — Instant switch</option>
              <option value="recreate">Recreate — Tear down & rebuild</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded-lg border border-surface-3 bg-surface-2 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-surface-3"
            >
              Back
            </button>
            <button
              onClick={handleDeploy}
              disabled={deployMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
            >
              {deployMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Deploying…
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" /> Deploy Now
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && selectedAgent && (
        <div className="rounded-xl border border-surface-3 bg-surface-1 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <Check className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">
            Deployment Started
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {selectedAgent.name} is being deployed to {environment} with{' '}
            {replicas} replica{replicas === 1 ? '' : 's'}.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/agents"
              className="rounded-lg border border-surface-3 bg-surface-2 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-surface-3"
            >
              View Agents
            </Link>
            <Link
              to="/analytics"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              View Analytics
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
