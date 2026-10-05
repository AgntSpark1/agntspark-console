import { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useConversation, useConversations } from '../../hooks/useStudio';
import type { Assistant } from '../../types/studio';

function when(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function ConversationsPanel({ assistant }: { assistant: Assistant }) {
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
          <ArrowLeft className="h-4 w-4" /> All chats
        </button>
        {convoQ.isLoading && <Loader2 className="h-5 w-5 animate-spin text-slate-500" />}
        <div className="space-y-3">
          {convoQ.data?.messages.map((m, i) => (
            <div key={i} className={clsx('flex', m.role === 'user' ? 'justify-start' : 'justify-end')}>
              <div
                className={clsx(
                  'max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[15px]',
                  m.role === 'user' ? 'bg-surface-2 text-slate-100' : 'bg-brand-500/20 text-slate-100',
                )}
              >
                <p className="mb-0.5 text-[11px] text-slate-500">
                  {m.role === 'user' ? 'Visitor' : assistant.name} · {when(m.created_at)}
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
      <p className="card py-10 text-center text-sm text-slate-400">
        No chats yet. They show up here as soon as someone writes.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-surface-3 overflow-hidden rounded-xl border border-surface-3 bg-surface-1">
      {listQ.data.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => setOpen(c.id)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-slate-200">{c.preview || '(empty)'}</p>
              <p className="text-xs text-slate-500">
                {when(c.updated_at)} · {c.messages} messages
              </p>
            </div>
            <span
              className={clsx(
                'rounded-full px-2 py-0.5 text-[11px]',
                c.source === 'public' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-surface-3 text-slate-400',
              )}
            >
              {c.source === 'public' ? 'Visitor' : 'Test'}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
