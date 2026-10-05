import { useEffect, useRef, useState } from 'react';
import { ArrowUp, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import Avatar from './Avatar';
import { useI18n } from '../../i18n';
import type { ChatMessage, ChatResponse } from '../../types/studio';

interface ChatPanelProps {
  assistantName: string;
  greeting: string;
  messages: ChatMessage[];
  conversationId: string | null;
  send: (message: string, conversationId: string | null) => Promise<ChatResponse>;
  onConversation: (conversationId: string, messages: ChatMessage[]) => void;
  onNewChat?: () => void;
  // Example questions offered as one-tap chips before the first message.
  suggestions?: string[];
  suggestionsLabel?: string;
  // Shown instead of the input when chatting isn't possible.
  disabledReason?: string;
  className?: string;
}

export default function ChatPanel({
  assistantName,
  greeting,
  messages,
  conversationId,
  send,
  onConversation,
  onNewChat,
  suggestions = [],
  suggestionsLabel,
  disabledReason,
  className,
}: ChatPanelProps) {
  const { t } = useI18n();
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, pending, error]);

  // Grow the box with what's typed, up to its max height.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [draft]);

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

  const showSuggestions = !disabledReason && suggestions.length > 0 && messages.length === 0 && !pending;

  return (
    <div className={clsx('flex min-h-0 flex-col', className)}>
      <div className="flex-1 space-y-3 overflow-y-auto px-1 py-3">
        {greeting && <Bubble role="assistant" name={assistantName} content={greeting} />}
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} name={assistantName} content={m.content} />
        ))}
        {pending && (
          <>
            <Bubble role="user" name={assistantName} content={pending} />
            <div className="fade-in flex items-end gap-2">
              <Avatar name={assistantName} size="sm" />
              <div
                role="status"
                aria-label={t('chat.typing')}
                className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-surface-2 px-4 py-3"
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="typing-dot h-1.5 w-1.5 rounded-full bg-slate-400"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </>
        )}
        {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-400">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {showSuggestions && (
        <div className="pb-2">
          {suggestionsLabel && <p className="px-1 pb-1.5 text-[11px] font-medium text-slate-500">{suggestionsLabel}</p>}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void submit(s)}
                className="rounded-full border border-brand-500/30 bg-brand-500/5 px-3 py-1.5 text-left text-sm text-brand-200 transition-colors hover:bg-brand-500/15"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {disabledReason ? (
        <p className="rounded-2xl border border-surface-3 bg-surface-2 px-4 py-3 text-center text-sm text-slate-400">
          {disabledReason}
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit(draft);
          }}
          className="flex items-end gap-2 rounded-2xl border border-surface-3 bg-surface-2 p-2 shadow-lg shadow-black/20 transition-colors focus-within:border-brand-500/60"
        >
          {onNewChat && messages.length > 0 && (
            <button
              type="button"
              onClick={onNewChat}
              title={t('chat.newChat')}
              aria-label={t('chat.newChat')}
              className="rounded-xl p-2 text-slate-500 hover:bg-surface-3 hover:text-slate-300"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
          <textarea
            ref={inputRef}
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
            placeholder={t('chat.placeholder')}
            aria-label={t('chat.message')}
            className="max-h-40 min-h-[2.25rem] flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim() || !!pending}
            aria-label={t('chat.send')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition-all hover:bg-brand-600 disabled:bg-surface-3 disabled:text-slate-500"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
}

function Bubble({ role, name, content }: { role: 'user' | 'assistant'; name: string; content: string }) {
  if (role === 'user') {
    return (
      <div className="fade-in flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-gradient-to-br from-brand-500 to-brand-600 px-3.5 py-2 text-[15px] leading-relaxed text-white shadow-sm shadow-brand-900/40">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="fade-in flex items-end gap-2">
      <Avatar name={name} size="sm" />
      <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-bl-md bg-surface-2 px-3.5 py-2 text-[15px] leading-relaxed text-slate-100">
        {content}
      </div>
    </div>
  );
}
