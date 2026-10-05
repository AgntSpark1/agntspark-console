import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import Avatar from '../../components/studio/Avatar';
import { TEMPLATE_ICONS, TEMPLATE_TINTS, isKnownTemplate, templateText } from '../../components/studio/templateText';
import { useCreateAssistant, useTemplates } from '../../hooks/useStudio';
import { useI18n } from '../../i18n';

export default function NewAssistant() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const templatesQ = useTemplates();
  const create = useCreateAssistant();
  const [template, setTemplate] = useState<string | null>(null);
  const [name, setName] = useState('');

  return (
    <div className="space-y-6">
      <Link to="/studio" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> {t('common.back')}
      </Link>

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-300">{t('new.step', { step: 1 })}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">{t('new.title')}</h1>
        <p className="mt-1 text-sm text-slate-400">{t('new.subtitle')}</p>
      </div>

      {templatesQ.isLoading && <Loader2 className="h-5 w-5 animate-spin text-slate-500" />}
      <div className="grid gap-3 sm:grid-cols-3">
        {templatesQ.data?.map((tpl) => {
          const Icon = TEMPLATE_ICONS[tpl.key] ?? Sparkles;
          const selected = template === tpl.key;
          return (
            <button
              key={tpl.key}
              type="button"
              aria-pressed={selected}
              onClick={() => setTemplate(tpl.key)}
              className={clsx(
                'card relative flex flex-col items-start gap-2 p-4 text-left transition-all',
                selected
                  ? 'border-brand-500 bg-brand-500/10 ring-1 ring-brand-500'
                  : 'hover:-translate-y-0.5 hover:border-slate-600',
              )}
            >
              {selected && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500">
                  <Check className="h-3 w-3 text-white" />
                </span>
              )}
              <span className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', TEMPLATE_TINTS[tpl.key] ?? 'bg-brand-500/15 text-brand-300')}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-1 font-medium text-white">{templateText(t, tpl.key, 'name', tpl.name)}</span>
              <span className="text-sm leading-snug text-slate-400">
                {templateText(t, tpl.key, 'description', tpl.description)}
              </span>
              {isKnownTemplate(tpl.key) && (
                <span className="mt-auto pt-1 text-xs text-slate-500">{templateText(t, tpl.key, 'goodFor')}</span>
              )}
            </button>
          );
        })}
      </div>

      {template && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(
              {
                template,
                name: name.trim(),
                // Greet visitors in the language the owner is using; they can edit it later.
                greeting: isKnownTemplate(template) ? templateText(t, template, 'greeting') : undefined,
              },
              { onSuccess: (a) => navigate(`/studio/a/${a.id}`, { replace: true }) },
            );
          }}
          className="card fade-in space-y-4 p-5"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-300">{t('new.step', { step: 2 })}</p>
            <label htmlFor="assistant-name" className="mt-1 block text-base font-semibold text-white">
              {t('new.nameTitle')}
            </label>
            <p className="mt-0.5 text-sm text-slate-400">{t('new.nameHelp')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Avatar name={name || '?'} />
            <input
              id="assistant-name"
              autoFocus
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('new.namePlaceholder')}
              className="input"
            />
          </div>
          {create.isError && <p className="text-xs text-rose-400">{(create.error as Error).message}</p>}
          <button type="submit" disabled={!name.trim() || create.isPending} className="btn-primary h-11 w-full justify-center">
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('new.create')}
          </button>
        </form>
      )}
    </div>
  );
}
