import { useRef, useState } from 'react';
import { FileText, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { useAddDocument, useDeleteDocument, useDocuments } from '../../hooks/useStudio';
import type { Assistant } from '../../types/studio';

const MAX_CHARS = 200_000;

export default function KnowledgePanel({ assistant }: { assistant: Assistant }) {
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
      setFileError(`${file.name} has no text we can read. Use a .txt, .md or .csv file.`);
      return;
    }
    setTitle(file.name.replace(/\.[^.]+$/, '').slice(0, 200));
    setContent(text.slice(0, MAX_CHARS));
    setAdding(true);
  };

  return (
    <section className="card space-y-3 p-4">
      <div>
        <h2 className="text-sm font-medium text-slate-300">Knowledge</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Paste your FAQ, prices, opening hours or notes. It answers from these.
        </p>
      </div>

      {docsQ.data && docsQ.data.length > 0 && (
        <ul className="divide-y divide-surface-3 rounded-lg border border-surface-3">
          {docsQ.data.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-3 py-2.5">
              <FileText className="h-4 w-4 shrink-0 text-slate-500" />
              <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{d.title}</span>
              <span className="text-xs text-slate-500">{d.chars.toLocaleString()} chars</span>
              <button
                type="button"
                aria-label={`Remove ${d.title}`}
                onClick={() => remove.mutate(d.id)}
                className="rounded p-1 text-slate-500 hover:text-rose-400"
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
            placeholder="Title, e.g. Delivery and returns"
            className="input"
          />
          <textarea
            required
            rows={8}
            maxLength={MAX_CHARS}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste text here"
            className="input h-auto py-2 leading-relaxed"
          />
          {add.isError && <p className="text-xs text-rose-400">{(add.error as Error).message}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={add.isPending || !content.trim()} className="btn-primary">
              {add.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add
            </button>
            <button type="button" onClick={reset} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setAdding(true)} className="btn-secondary">
            <Plus className="h-4 w-4" /> Paste text
          </button>
          <button type="button" onClick={() => fileInput.current?.click()} className="btn-secondary">
            <Upload className="h-4 w-4" /> Upload a file
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
