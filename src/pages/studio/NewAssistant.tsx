import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Headset, Loader2, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { useCreateAssistant, useTemplates } from '../../hooks/useStudio';

const ICONS: Record<string, typeof Headset> = {
  'customer-support': Headset,
  'personal-assistant': Sparkles,
  'knowledge-qa': BookOpen,
};

export default function NewAssistant() {
  const navigate = useNavigate();
  const templatesQ = useTemplates();
  const create = useCreateAssistant();
  const [template, setTemplate] = useState<string | null>(null);
  const [name, setName] = useState('');

  return (
    <div className="space-y-5">
      <Link to="/studio" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div>
        <h1 className="text-xl font-semibold text-white">What should it do?</h1>
        <p className="mt-1 text-sm text-slate-400">Pick a starting point. You can change everything later.</p>
      </div>

      {templatesQ.isLoading && <Loader2 className="h-5 w-5 animate-spin text-slate-500" />}
      <div className="grid gap-3 sm:grid-cols-3">
        {templatesQ.data?.map((t) => {
          const Icon = ICONS[t.key] ?? Sparkles;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTemplate(t.key)}
              className={clsx(
                'card flex flex-col items-start gap-2 p-4 text-left transition-colors',
                template === t.key ? 'border-brand-500 bg-brand-500/10' : 'hover:border-slate-600',
              )}
            >
              <Icon className="h-5 w-5 text-brand-300" />
              <span className="font-medium text-white">{t.name}</span>
              <span className="text-sm text-slate-400">{t.description}</span>
            </button>
          );
        })}
      </div>

      {template && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(
              { template, name: name.trim() },
              { onSuccess: (a) => navigate(`/studio/a/${a.id}`, { replace: true }) },
            );
          }}
          className="card space-y-3 p-4"
        >
          <label htmlFor="assistant-name" className="block text-sm font-medium text-slate-300">
            Give it a name
          </label>
          <input
            id="assistant-name"
            autoFocus
            required
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sunny Bakery Help"
            className="input"
          />
          {create.isError && <p className="text-xs text-rose-400">{(create.error as Error).message}</p>}
          <button type="submit" disabled={!name.trim() || create.isPending} className="btn-primary w-full justify-center">
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create
          </button>
        </form>
      )}
    </div>
  );
}
