import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import ChatPanel from '../../components/studio/ChatPanel';
import { fetchPublicConversation, sendPublicMessage, usePublicAssistant } from '../../hooks/useStudio';
import type { ChatMessage } from '../../types/studio';

// The visitor's conversation id is kept per assistant, so a reload continues it.
function storageKey(slug: string) {
  return `agntspark_chat_${slug}`;
}

export default function PublicChat() {
  const { slug = '' } = useParams();
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
      <div className="flex min-h-[100dvh] items-center justify-center bg-surface-0">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
      </div>
    );
  }
  if (!assistantQ.data) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-surface-0 p-6 text-center text-slate-400">
        This chat isn't available.
      </div>
    );
  }
  const a = assistantQ.data;

  return (
    <div className={clsx('flex h-[100dvh] flex-col bg-surface-0 text-slate-200', embedded && 'rounded-2xl')}>
      <header className="flex items-center gap-3 border-b border-surface-3 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/15 font-semibold text-brand-300">
          {a.name.slice(0, 1).toUpperCase()}
        </div>
        <span className="font-medium text-white">{a.name}</span>
      </header>
      <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <ChatPanel
          className="flex-1"
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
        <p className="pt-2 text-center text-[11px] text-slate-600">
          AI assistant · may make mistakes · powered by AgntSpark
        </p>
      </div>
    </div>
  );
}
