import { useState } from 'react';
import { ArrowLeft, ChevronRight, Inbox, Loader2, UserRound } from 'lucide-react';
import clsx from 'clsx';
import Avatar from './Avatar';
import { useConversation, useConversations } from '../../hooks/useStudio';
import { useI18n } from '../../i18n';
import type { Assistant } from '../../types/studio';

export default function ConversationsPanel({ assistant }: { assistant: Assistant }) {
  const { t, tn, formatDateTime } = useI18n();
  const listQ = useConversations(assistant.id);
  const [open, setOpen] = useState<string | null>(null);
  const convoQ = useConversation(assistant.id, open);

  if (open) {
    return (
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setOpen(null)}
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" /> {t('chats.all')}
        </button>
        {convoQ.isLoading && <Loader2 className="h-5 w-5 animate-spin text-slate-500" />}
        <div className="card space-y-3 p-4">
          {convoQ.data?.messages.map((m, i) => (
            <div key={i} className={clsx('flex items-end gap-2', m.role === 'assistant' && 'flex-row-reverse')}>
              {m.role === 'user' ? (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-3 text-slate-400">
                  <UserRound className="h-3.5 w-3.5" />
                </span>
              ) : (
                <Avatar name={assistant.name} size="sm" />
              )}
              <div
                className={clsx(
                  'max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[15px]',
                  m.role === 'user' ? 'rounded-bl-md bg-surface-2 text-slate-100' : 'rounded-br-md bg-brand-500/20 text-slate-100',
                )}
              >
                <p className="mb-0.5 text-[11px] text-slate-500">
                  {m.role === 'user' ? t('chats.visitor') : assistant.name} · {formatDateTime(m.created_at)}
                </p>
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (listQ.isLoading) return <Loader2 className="h-5 w-5 animate-spin text-slate-500" />;
  if (!listQ.data?.length) {
    return (
      <div className="card flex flex-col items-center gap-3 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-3 text-slate-400">
          <Inbox className="h-5 w-5" />
        </span>
        <p className="max-w-xs text-sm text-slate-400">{t('chats.empty')}</p>
      </div>
    );
  }
  return (
    <ul className="card divide-y divide-surface-3 overflow-hidden p-0">
      {listQ.data.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => setOpen(c.id)}
            className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2"
          >
            <span
              className={clsx(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                c.source === 'public' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-surface-3 text-slate-400',
              )}
            >
              <UserRound className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-slate-200">{c.preview || t('chats.emptyPreview')}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {formatDateTime(c.updated_at)} · {tn('chats.messages', c.messages)}
              </p>
            </div>
            <span
              className={clsx(
                'rounded-full px-2 py-0.5 text-[11px] font-medium',
                c.source === 'public' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-surface-3 text-slate-400',
              )}
            >
              {c.source === 'public' ? t('chats.visitor') : t('chats.test')}
            </span>
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </button>
        </li>
      ))}
    </ul>
  );
}
