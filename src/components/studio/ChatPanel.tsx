import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Loader2, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import type { ChatMessage, ChatResponse } from '../../types/studio';

interface ChatPanelProps {
  greeting: string;
  messages: ChatMessage[];
  conversationId: string | null;
  send: (message: string, conversationId: string | null) => Promise<ChatResponse>;
  onConversation: (conversationId: string, messages: ChatMessage[]) => void;
  onNewChat?: () => void;
  // Shown instead of the input when chatting isn't possible.
  disabledReason?: string;
  className?: string;
}

export default function ChatPanel({
  greeting,
  messages,
  conversationId,
  send,
  onConversation,
  onNewChat,
  disabledReason,
  className,
}: ChatPanelProps) {
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, pending, error]);

  const submit = async (text: string) => {
    const message = text.trim();
    if (!message || pending) return;
    setPending(message);
    setError(null);
    setDraft('');
    try {
      const res = await send(message, conversationId);
      const asked: ChatMessage = { role: 'user', content: message, created_at: new Date().toISOString() };
      onConversation(res.conversation_id, [...messages, asked, res.reply]);
    } catch (e) {
      setError((e as Error).message);
      setDraft(message);
    } finally {
      setPending(null);
    }
  };

  return (
    <div className={clsx('flex min-h-0 flex-col', className)}>
      <div className="flex-1 space-y-3 overflow-y-auto px-1 py-3">
        {greeting && <Bubble role="assistant" content={greeting} />}
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} content={m.content} />
        ))}
        {pending && (
          <>
            <Bubble role="user" content={pending} />
            <div className="flex items-center gap-2 px-1 text-xs text-slate-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
            </div>
          </>
        )}
        {error && (
          <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-400">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {disabledReason ? (
        <p className="rounded-xl border border-surface-3 bg-surface-2 px-4 py-3 text-center text-sm text-slate-400">
          {disabledReason}
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit(draft);
          }}
          className="flex items-end gap-2 rounded-2xl border border-surface-3 bg-surface-2 p-2"
        >
          {onNewChat && messages.length > 0 && (
            <button
              type="button"
              onClick={onNewChat}
              title="New chat"
              aria-label="New chat"
              className="rounded-xl p-2 text-slate-500 hover:bg-surface-3 hover:text-slate-300"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void submit(draft);
              }
            }}
            rows={1}
            maxLength={4000}
            placeholder="Type a message"
            aria-label="Message"
            className="max-h-40 min-h-[2.25rem] flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim() || !!pending}
            aria-label="Send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:opacity-40"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
}

function Bubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  return (
    <div className={clsx('flex', role === 'user' ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed',
          role === 'user'
            ? 'rounded-br-md bg-brand-500 text-white'
            : 'rounded-bl-md bg-surface-2 text-slate-100',
        )}
      >
        {content}
      </div>
    </div>
  );
}
