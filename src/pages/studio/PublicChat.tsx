import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Loader2, MessageSquareOff } from 'lucide-react';
import clsx from 'clsx';
import LanguagePicker from '../../components/LanguagePicker';
import Avatar from '../../components/studio/Avatar';
import ChatPanel from '../../components/studio/ChatPanel';
import { fetchPublicConversation, sendPublicMessage, usePublicAssistant } from '../../hooks/useStudio';
import { useI18n } from '../../i18n';
import type { ChatMessage } from '../../types/studio';

// The visitor's conversation id is kept per assistant, so a reload continues it.
function storageKey(slug: string) {
  return `agntspark_chat_${slug}`;
}

export default function PublicChat() {
  const { slug = '' } = useParams();
  const { t } = useI18n();
  const [params] = useSearchParams();
  const embedded = params.get('embed') === '1';
  const assistantQ = usePublicAssistant(slug);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey(slug));
    if (!saved) return;
    fetchPublicConversation(slug, saved).then(
      (c) => {
        setConversationId(c.id);
        setMessages(c.messages);
      },
      () => localStorage.removeItem(storageKey(slug)),
    );
  }, [slug]);

  useEffect(() => {
    if (assistantQ.data) document.title = assistantQ.data.name;
  }, [assistantQ.data]);

  if (assistantQ.isLoading) {
    return (
      <div className="studio-bg flex min-h-[100dvh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
      </div>
    );
  }
  if (!assistantQ.data) {
    return (
      <div className="studio-bg flex min-h-[100dvh] flex-col items-center justify-center gap-3 p-6 text-center text-slate-400">
        <MessageSquareOff className="h-6 w-6 text-slate-500" />
        {t('public.unavailable')}
      </div>
    );
  }
  const a = assistantQ.data;

  return (
    <div className={clsx('studio-bg flex h-[100dvh] flex-col text-slate-200', embedded && 'rounded-2xl')}>
      <header className="border-b border-white/5 bg-surface-0/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <div className="relative">
            <Avatar name={a.name} />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface-0 bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-white">{a.name}</p>
            <p className="text-xs text-slate-500">{t('public.subtitle')}</p>
          </div>
          <LanguagePicker />
        </div>
      </header>
      <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <ChatPanel
          className="flex-1"
          assistantName={a.name}
          greeting={a.greeting}
          messages={messages}
          conversationId={conversationId}
          send={(m, cid) => sendPublicMessage(slug, m, cid)}
          onConversation={(cid, all) => {
            setConversationId(cid);
            setMessages(all);
            localStorage.setItem(storageKey(slug), cid);
          }}
          onNewChat={() => {
            setConversationId(null);
            setMessages([]);
            localStorage.removeItem(storageKey(slug));
          }}
        />
        <p className="pt-2 text-center text-[11px] text-slate-600">{t('public.footer')}</p>
      </div>
    </div>
  );
}
