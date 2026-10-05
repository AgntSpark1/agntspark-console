import { Link } from 'react-router-dom';
import { ChevronRight, Globe, Loader2, Lock, Plus } from 'lucide-react';
import { useAssistants, useStudioUsage, useTemplates } from '../../hooks/useStudio';

export default function StudioHome() {
  const assistantsQ = useAssistants();
  const usageQ = useStudioUsage();
  const templatesQ = useTemplates();
  const usage = usageQ.data;
  const templateName = (key: string) => templatesQ.data?.find((t) => t.key === key)?.name ?? key;
  const atLimit = !!usage && usage.assistants >= usage.assistants_limit;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-white">Your assistants</h1>
        <Link
          to="/studio/new"
          aria-disabled={atLimit}
          className={atLimit ? 'btn-primary pointer-events-none opacity-50' : 'btn-primary'}
        >
          <Plus className="h-4 w-4" /> New
        </Link>
      </div>

      {usage && (
        <div className="card space-y-2 p-4">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-slate-400">Replies this month</span>
            <span className="font-medium text-slate-200">
              {usage.messages_used.toLocaleString()} / {usage.messages_limit.toLocaleString()}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${Math.min(100, (usage.messages_used / usage.messages_limit) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {usage.plan === 'free' ? 'Free plan. ' : 'Pro plan. '}
            {usage.messages_used >= usage.messages_limit
              ? 'Your assistants stop replying until next month. '
              : ''}
            {usage.plan === 'free' && (
              <Link to="/settings" className="text-brand-300 hover:underline">
                Upgrade for more replies
              </Link>
            )}
          </p>
        </div>
      )}

      {assistantsQ.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
        </div>
      ) : assistantsQ.data && assistantsQ.data.length > 0 ? (
        <ul className="space-y-2">
          {assistantsQ.data.map((a) => (
            <li key={a.id}>
              <Link
                to={`/studio/a/${a.id}`}
                className="card flex items-center gap-3 p-4 transition-colors hover:border-brand-500/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-base font-semibold text-brand-300">
                  {a.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{a.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {templateName(a.template)} · {a.documents} document{a.documents === 1 ? '' : 's'}
                  </p>
                </div>
                <span
                  className={
                    a.is_public
                      ? 'flex items-center gap-1 text-xs text-emerald-400'
                      : 'flex items-center gap-1 text-xs text-slate-500'
                  }
                >
                  {a.is_public ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  {a.is_public ? 'Live' : 'Draft'}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-base font-medium text-white">Make your first assistant</p>
          <p className="max-w-xs text-sm text-slate-400">
            Pick a template, tell it about your business, and share a link. No code needed.
          </p>
          <Link to="/studio/new" className="btn-primary mt-2">
            <Plus className="h-4 w-4" /> Create an assistant
          </Link>
        </div>
      )}
      {atLimit && (
        <p className="text-center text-xs text-slate-500">
          You've reached the {usage?.assistants_limit} assistants your plan includes.
        </p>
      )}
    </div>
  );
}
