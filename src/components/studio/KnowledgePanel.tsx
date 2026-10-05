import { useRef, useState } from 'react';
import { BookOpen, FileText, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { useAddDocument, useDeleteDocument, useDocuments } from '../../hooks/useStudio';
import { useI18n } from '../../i18n';
import SectionTitle from './SectionTitle';
import type { Assistant } from '../../types/studio';

const MAX_CHARS = 200_000;

export default function KnowledgePanel({ assistant }: { assistant: Assistant }) {
  const { t, tn } = useI18n();
  const docsQ = useDocuments(assistant.id);
  const add = useAddDocument(assistant.id);
  const remove = useDeleteDocument(assistant.id);
  const fileInput = useRef<HTMLInputElement>(null);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);

  const reset = () => {
    setAdding(false);
    setTitle('');
    setContent('');
  };

  const onFile = async (file: File) => {
    setFileError(null);
    const text = await file.text();
    if (!text.trim()) {
      setFileError(t('knowledge.unreadable', { file: file.name }));
      return;
    }
    setTitle(file.name.replace(/\.[^.]+$/, '').slice(0, 200));
    setContent(text.slice(0, MAX_CHARS));
    setAdding(true);
  };

  return (
    <section className="card space-y-4 p-5">
      <SectionTitle icon={BookOpen} title={t('knowledge.title')} help={t('knowledge.help')} />

      {docsQ.data?.length === 0 && !adding && (
        <p className="rounded-xl border border-dashed border-surface-3 py-4 text-center text-xs text-slate-500">
          {t('knowledge.empty')}
        </p>
      )}
      {docsQ.data && docsQ.data.length > 0 && (
        <ul className="divide-y divide-surface-3 overflow-hidden rounded-xl border border-surface-3 bg-surface-0/40">
          {docsQ.data.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-3 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-300">
                <FileText className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{d.title}</span>
              <span className="text-xs text-slate-500">{tn('knowledge.chars', d.chars)}</span>
              <button
                type="button"
                aria-label={t('knowledge.remove', { title: d.title })}
                onClick={() => remove.mutate(d.id)}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add.mutate({ title: title.trim(), content }, { onSuccess: reset });
          }}
          className="space-y-2"
        >
          <input
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('knowledge.titlePlaceholder')}
            className="input"
          />
          <textarea
            required
            rows={8}
            maxLength={MAX_CHARS}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('knowledge.contentPlaceholder')}
            className="input h-auto py-2 leading-relaxed"
          />
          {add.isError && <p className="text-xs text-rose-400">{(add.error as Error).message}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={add.isPending || !content.trim()} className="btn-primary">
              {add.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('knowledge.add')}
            </button>
            <button type="button" onClick={reset} className="btn-secondary">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setAdding(true)} className="btn-secondary">
            <Plus className="h-4 w-4" /> {t('knowledge.paste')}
          </button>
          <button type="button" onClick={() => fileInput.current?.click()} className="btn-secondary">
            <Upload className="h-4 w-4" /> {t('knowledge.upload')}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".txt,.md,.csv,text/plain,text/markdown,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onFile(file);
              e.target.value = '';
            }}
          />
        </div>
      )}
      {fileError && <p className="text-xs text-rose-400">{fileError}</p>}
    </section>
  );
}
