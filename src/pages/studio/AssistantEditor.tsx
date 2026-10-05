import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Inbox, Loader2, MessageCircle, Send, SlidersHorizontal, Trash2, UserRound } from 'lucide-react';
import clsx from 'clsx';
import Avatar from '../../components/studio/Avatar';
import ChatPanel from '../../components/studio/ChatPanel';
import ConversationsPanel from '../../components/studio/ConversationsPanel';
import KnowledgePanel from '../../components/studio/KnowledgePanel';
import SharePanel from '../../components/studio/SharePanel';
import SectionTitle from '../../components/studio/SectionTitle';
import StatusPill from '../../components/studio/StatusPill';
import { isKnownTemplate, templateText } from '../../components/studio/templateText';
import {
  sendTestMessage,
  useAssistant,
  useDeleteAssistant,
  useStudioUsage,
  useTemplates,
  useUpdateAssistant,
} from '../../hooks/useStudio';
import { useI18n, type MessageKey } from '../../i18n';
import type { Assistant, ChatMessage } from '../../types/studio';

const TABS = [
  { key: 'setup', label: 'tab.setup', icon: SlidersHorizontal },
  { key: 'test', label: 'tab.test', icon: MessageCircle },
  { key: 'share', label: 'tab.share', icon: Send },
  { key: 'chats', label: 'tab.chats', icon: Inbox },
] as const satisfies readonly { key: string; label: MessageKey; icon: unknown }[];
type Tab = (typeof TABS)[number]['key'];

export default function AssistantEditor() {
  const { id = '' } = useParams();
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((x) => x.key === params.get('tab'))?.key ?? 'setup') as Tab;
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
        <p className="text-slate-300">{t('editor.missing')}</p>
        <Link to="/studio" className="text-sm text-brand-300 hover:underline">
          {t('editor.backToList')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          to="/studio"
          aria-label={t('common.back')}
          className="-ml-1.5 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-surface-2 hover:text-slate-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Avatar name={a.name} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight text-white">{a.name}</h1>
          <StatusPill live={a.is_public} className="mt-0.5" />
        </div>
      </div>

      <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 -mx-4 bg-surface-0/80 px-4 py-2 backdrop-blur-xl">
        <div role="tablist" className="grid grid-cols-4 gap-1 rounded-xl border border-white/5 bg-surface-1 p-1">
          {TABS.map((x) => {
            const Icon = x.icon;
            return (
              <button
                key={x.key}
                role="tab"
                aria-selected={tab === x.key}
                type="button"
                onClick={() => setParams({ tab: x.key }, { replace: true })}
                className={clsx(
                  'flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-xs font-medium transition-colors sm:flex-row sm:justify-center sm:gap-1.5 sm:py-2 sm:text-sm',
                  tab === x.key ? 'bg-surface-3 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200',
                )}
              >
                <Icon className="h-4 w-4" />
                {t(x.label)}
              </button>
            );
          })}
        </div>
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
  const { t } = useI18n();
  const update = useUpdateAssistant(assistant.id);
  const remove = useDeleteAssistant();
  const templatesQ = useTemplates();
  const hint = templateText(
    t,
    assistant.template,
    'hint',
    templatesQ.data?.find((x) => x.key === assistant.template)?.instructions_hint,
  );

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
        className="card space-y-4 p-5"
      >
        <SectionTitle icon={UserRound} title={t('setup.basics')} help={t('setup.basicsHelp')} />
        <div>
          <label htmlFor="name" className="label">
            {t('setup.name')}
          </label>
          <input id="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </div>
        <div>
          <label htmlFor="instructions" className="label">
            {t('setup.instructions')}
          </label>
          <textarea
            id="instructions"
            rows={6}
            maxLength={8000}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder={hint}
            className="input h-auto py-2.5 leading-relaxed"
          />
          <p className="mt-1 text-right text-[11px] tabular-nums text-slate-600">{instructions.length} / 8000</p>
        </div>
        <div>
          <label htmlFor="greeting" className="label">
            {t('setup.greeting')}
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
        <div className="flex justify-end">
          <button type="submit" disabled={!dirty || update.isPending} className="btn-primary">
            {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {dirty ? t('setup.save') : t('setup.saved')}
          </button>
        </div>
      </form>

      <KnowledgePanel assistant={assistant} />

      <button
        type="button"
        onClick={() => {
          if (window.confirm(t('setup.deleteConfirm', { name: assistant.name }))) {
            remove.mutate(assistant.id, { onSuccess: () => navigate('/studio', { replace: true }) });
          }
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm text-rose-400 transition-colors hover:bg-rose-500/10"
      >
        <Trash2 className="h-4 w-4" /> {t('setup.delete')}
      </button>
    </div>
  );
}

function TestTab({ assistant }: { assistant: Assistant }) {
  const { t } = useI18n();
  const usageQ = useStudioUsage();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const usage = usageQ.data;
  const disabledReason = !usage
    ? undefined
    : !usage.chat_available
      ? t('test.unavailable')
      : usage.messages_used >= usage.messages_limit
        ? t('test.outOfReplies')
        : undefined;
  const suggestions = isKnownTemplate(assistant.template)
    ? (['try1', 'try2', 'try3'] as const).map((f) => templateText(t, assistant.template, f))
    : [];

  return (
    <div className="card flex min-h-[65dvh] flex-1 flex-col p-3">
      <p className="px-1 pb-1 text-xs text-slate-500">{t('test.note')}</p>
      <ChatPanel
        className="flex-1"
        assistantName={assistant.name}
        greeting={assistant.greeting}
        suggestions={suggestions}
        suggestionsLabel={t('test.tryAsking')}
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
