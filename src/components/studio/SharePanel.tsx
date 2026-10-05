import { useEffect, useState } from 'react';
import { Check, Copy, Download, ExternalLink, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import { useUpdateAssistant } from '../../hooks/useStudio';
import type { Assistant } from '../../types/studio';

export function publicChatUrl(slug: string): string {
  return `${window.location.origin}/c/${slug}`;
}

export default function SharePanel({ assistant }: { assistant: Assistant }) {
  const update = useUpdateAssistant(assistant.id);
  const url = publicChatUrl(assistant.slug);
  const embed = `<iframe src="${url}?embed=1" title="${assistant.name.replace(/"/g, '&quot;')}" style="width:100%;max-width:420px;height:600px;border:0;border-radius:16px"></iframe>`;
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(url, { width: 512, margin: 2 }).then(setQr, () => setQr(null));
  }, [url]);

  return (
    <div className="space-y-4">
      <section className="card flex items-center gap-4 p-4">
        <div className="min-w-0 flex-1">
          <h2 className="font-medium text-white">{assistant.is_public ? 'It’s live' : 'Not published yet'}</h2>
          <p className="mt-0.5 text-sm text-slate-400">
            {assistant.is_public
              ? 'Anyone with the link can chat with it.'
              : 'Publish to get a link people can chat on.'}
          </p>
        </div>
        <button
          type="button"
          disabled={update.isPending}
          onClick={() => update.mutate({ is_public: !assistant.is_public })}
          className={assistant.is_public ? 'btn-secondary' : 'btn-primary'}
        >
          {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {assistant.is_public ? 'Unpublish' : 'Publish'}
        </button>
      </section>

      {assistant.is_public && (
        <>
          <section className="card space-y-3 p-4">
            <h2 className="text-sm font-medium text-slate-300">Link</h2>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg bg-surface-2 px-3 py-2 text-sm text-slate-200">
                {url}
              </code>
              <CopyButton text={url} />
              <a href={url} target="_blank" rel="noreferrer" className="btn-secondary px-3" aria-label="Open">
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </section>

          <section className="card flex flex-col items-center gap-3 p-4 sm:flex-row sm:items-start">
            {qr ? (
              <img src={qr} alt={`QR code for ${url}`} className="h-40 w-40 rounded-lg bg-white" />
            ) : (
              <div className="h-40 w-40 rounded-lg bg-surface-2" />
            )}
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-sm font-medium text-slate-300">QR code</h2>
              <p className="text-sm text-slate-400">Print it on the counter, a menu or a flyer.</p>
              {qr && (
                <a href={qr} download={`${assistant.slug}-qr.png`} className="btn-secondary inline-flex">
                  <Download className="h-4 w-4" /> Download
                </a>
              )}
            </div>
          </section>

          <section className="card space-y-3 p-4">
            <h2 className="text-sm font-medium text-slate-300">Add it to your website</h2>
            <p className="text-sm text-slate-400">Paste this where the chat should appear.</p>
            <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-surface-2 p-3 text-xs text-slate-300">
              {embed}
            </pre>
            <CopyButton text={embed} label="Copy code" />
          </section>
        </>
      )}
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="btn-secondary px-3"
      aria-label={label ?? 'Copy'}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      {label && (copied ? 'Copied' : label)}
    </button>
  );
}
