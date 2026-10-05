import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import ChatPanel from '../../components/studio/ChatPanel';
import ConversationsPanel from '../../components/studio/ConversationsPanel';
import KnowledgePanel from '../../components/studio/KnowledgePanel';
import SharePanel from '../../components/studio/SharePanel';
import {
  sendTestMessage,
  useAssistant,
  useDeleteAssistant,
  useStudioUsage,
  useTemplates,
  useUpdateAssistant,
} from '../../hooks/useStudio';
import type { Assistant, ChatMessage } from '../../types/studio';

const TABS = [
  { key: 'setup', label: 'Set up' },
  { key: 'test', label: 'Try it' },
  { key: 'share', label: 'Share' },
  { key: 'chats', label: 'Chats' },
] as const;
type Tab = (typeof TABS)[number]['key'];

export default function AssistantEditor() {
  const { id = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((t) => t.key === params.get('tab'))?.key ?? 'setup') as Tab;
  const assistantQ = useAssistant(id);
  const a = assistantQ.data;

  if (assistantQ.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
      </div>
    );
  }
  if (!a) {
    return (
      <div className="space-y-3 py-12 text-center">
        <p className="text-slate-300">This assistant doesn't exist anymore.</p>
        <Link to="/studio" className="text-sm text-brand-300 hover:underline">
          Back to your assistants
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link to="/studio" aria-label="Back" className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-2">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="truncate text-lg font-semibold text-white">{a.name}</h1>
        <span className={clsx('ml-auto text-xs', a.is_public ? 'text-emerald-400' : 'text-slate-500')}>
          {a.is_public ? 'Live' : 'Draft'}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1 rounded-xl bg-surface-1 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setParams({ tab: t.key }, { replace: true })}
            className={clsx(
              'rounded-lg py-2 text-sm font-medium transition-colors',
              tab === t.key ? 'bg-surface-3 text-white' : 'text-slate-400 hover:text-slate-200',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'setup' && <SetupTab assistant={a} />}
      {tab === 'test' && <TestTab assistant={a} />}
      {tab === 'share' && <SharePanel assistant={a} />}
      {tab === 'chats' && <ConversationsPanel assistant={a} />}
    </div>
  );
}

function SetupTab({ assistant }: { assistant: Assistant }) {
  const navigate = useNavigate();
  const update = useUpdateAssistant(assistant.id);
  const remove = useDeleteAssistant();
  const templatesQ = useTemplates();
  const hint = templatesQ.data?.find((t) => t.key === assistant.template)?.instructions_hint;

  const [name, setName] = useState(assistant.name);
  const [instructions, setInstructions] = useState(assistant.instructions);
  const [greeting, setGreeting] = useState(assistant.greeting);
  useEffect(() => {
    setName(assistant.name);
    setInstructions(assistant.instructions);
    setGreeting(assistant.greeting);
    // Reset the form only when switching to another assistant, not on every save.
  }, [assistant.id]);

  const dirty =
    name !== assistant.name || instructions !== assistant.instructions || greeting !== assistant.greeting;

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate({ name: name.trim() || assistant.name, instructions, greeting });
        }}
        className="card space-y-4 p-4"
      >
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">
            Name
          </label>
          <input id="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </div>
        <div>
          <label htmlFor="instructions" className="mb-1.5 block text-sm font-medium text-slate-300">
            What should it know and how should it talk?
          </label>
          <textarea
            id="instructions"
            rows={5}
            maxLength={8000}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder={hint}
            className="input h-auto py-2 leading-relaxed"
          />
        </div>
        <div>
          <label htmlFor="greeting" className="mb-1.5 block text-sm font-medium text-slate-300">
            First message people see
          </label>
          <input
            id="greeting"
            maxLength={500}
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            className="input"
          />
        </div>
        {update.isError && <p className="text-xs text-rose-400">{(update.error as Error).message}</p>}
        <button type="submit" disabled={!dirty || update.isPending} className="btn-primary">
          {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {dirty ? 'Save changes' : 'Saved'}
        </button>
      </form>

      <KnowledgePanel assistant={assistant} />

      <button
        type="button"
        onClick={() => {
          if (window.confirm(`Delete "${assistant.name}" and all its chats? This can't be undone.`)) {
            remove.mutate(assistant.id, { onSuccess: () => navigate('/studio', { replace: true }) });
          }
        }}
        className="w-full rounded-lg py-2 text-sm text-rose-400 hover:bg-rose-500/10"
      >
        Delete assistant
      </button>
    </div>
  );
}

function TestTab({ assistant }: { assistant: Assistant }) {
  const usageQ = useStudioUsage();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const usage = usageQ.data;
  const disabledReason = !usage
    ? undefined
    : !usage.chat_available
      ? "Chat isn't switched on for this server yet."
      : usage.messages_used >= usage.messages_limit
        ? "You've used this month's replies."
        : undefined;

  return (
    <div className="flex min-h-[60dvh] flex-1 flex-col">
      <p className="text-xs text-slate-500">Test chats count toward your monthly replies and show up under Chats.</p>
      <ChatPanel
        className="flex-1"
        greeting={assistant.greeting}
        messages={messages}
        conversationId={conversationId}
        send={(m, cid) => sendTestMessage(assistant.id, m, cid)}
        onConversation={(cid, all) => {
          setConversationId(cid);
          setMessages(all);
          void usageQ.refetch();
        }}
        onNewChat={() => {
          setConversationId(null);
          setMessages([]);
        }}
        disabledReason={disabledReason}
      />
    </div>
  );
}
