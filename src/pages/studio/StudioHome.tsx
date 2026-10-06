import { Link } from 'react-router-dom';
import { ChevronRight, Loader2, Plus, Sparkles, Zap } from 'lucide-react';
import clsx from 'clsx';
import Avatar from '../../components/studio/Avatar';
import StatusPill from '../../components/studio/StatusPill';
import { TEMPLATE_ICONS, TEMPLATE_TINTS, templateText } from '../../components/studio/templateText';
import { useAssistants, useStudioUsage, useTemplates } from '../../hooks/useStudio';
import { useI18n } from '../../i18n';

function nextMonth(periodStart: string): Date {
  const d = new Date(periodStart);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
}

export default function StudioHome() {
  const { t, tn, formatNumber, formatDate } = useI18n();
  const assistantsQ = useAssistants();
  const usageQ = useStudioUsage();
  const templatesQ = useTemplates();
  const usage = usageQ.data;
  const templateName = (key: string) =>
    templateText(t, key, 'name', templatesQ.data?.find((x) => x.key === key)?.name ?? key);
  const atLimit = !!usage && usage.assistants >= usage.assistants_limit;
  const outOfReplies = !!usage && usage.messages_used >= usage.messages_limit;
  const usedPct = usage ? Math.min(100, (usage.messages_used / Math.max(1, usage.messages_limit)) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">{t('home.title')}</h1>
          <p className="mt-1 text-sm text-slate-400">{t('home.subtitle')}</p>
        </div>
        <Link
          to="/studio/new"
          aria-disabled={atLimit}
          className={clsx('btn-primary shrink-0 shadow-lg shadow-brand-500/20', atLimit && 'pointer-events-none opacity-50')}
        >
          <Plus className="h-4 w-4" /> {t('home.new')}
        </Link>
      </div>

      {usage && (
        <div className="card relative overflow-hidden p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 text-brand-300">
              <Zap className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-400">{t('home.replies')}</p>
              <p className="text-lg font-semibold tabular-nums text-white">
                {formatNumber(usage.messages_used)}
                <span className="text-sm font-normal text-slate-500"> / {formatNumber(usage.messages_limit)}</span>
              </p>
            </div>
            <span
              className={clsx(
                'rounded-full px-2.5 py-1 text-xs font-medium',
                usage.plan === 'free' ? 'bg-surface-3 text-slate-300' : 'bg-brand-500/15 text-brand-200',
              )}
            >
              {usage.plan === 'free' ? t('home.planFree') : t('home.planPro')}
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div
              className={clsx(
                'h-full rounded-full transition-[width] duration-500',
                outOfReplies ? 'bg-rose-500' : usedPct > 80 ? 'bg-amber-400' : 'bg-gradient-to-r from-brand-400 to-brand-600',
              )}
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>
              {outOfReplies ? t('home.outOfReplies') : t('home.resets', { date: formatDate(nextMonth(usage.period_start)) })}
            </span>
            <span className="flex items-center gap-3">
              <span>{t('home.assistantsUsed', { used: usage.assistants, limit: usage.assistants_limit })}</span>
              {usage.plan === 'free' && (
                <Link to="/upgrade" className="font-medium text-brand-300 hover:underline">
                  {t('home.upgrade')}
                </Link>
              )}
            </span>
          </div>
        </div>
      )}

      {assistantsQ.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
        </div>
      ) : assistantsQ.data && assistantsQ.data.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {assistantsQ.data.map((a) => {
            const Icon = TEMPLATE_ICONS[a.template] ?? Sparkles;
            return (
              <li key={a.id}>
                <Link
                  to={`/studio/a/${a.id}`}
                  className="card group flex h-full items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-lg hover:shadow-black/30"
                >
                  <Avatar name={a.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{a.name}</p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                      <span className={clsx('flex h-4 w-4 items-center justify-center rounded', TEMPLATE_TINTS[a.template] ?? 'bg-surface-3 text-slate-300')}>
                        <Icon className="h-2.5 w-2.5" />
                      </span>
                      {templateName(a.template)} · {tn('home.documents', a.documents)}
                    </p>
                  </div>
                  <StatusPill live={a.is_public} />
                  <ChevronRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-600 shadow-lg shadow-brand-500/30">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <p className="mt-2 text-lg font-semibold text-white">{t('home.emptyTitle')}</p>
          <p className="max-w-xs text-sm text-slate-400">{t('home.emptyBody')}</p>
          <Link to="/studio/new" className="btn-primary mt-2 shadow-lg shadow-brand-500/20">
            <Plus className="h-4 w-4" /> {t('home.emptyCta')}
          </Link>
        </div>
      )}
      {atLimit && (
        <p className="text-center text-xs text-slate-500">{t('home.atLimit', { limit: usage?.assistants_limit ?? 0 })}</p>
      )}
    </div>
  );
}
