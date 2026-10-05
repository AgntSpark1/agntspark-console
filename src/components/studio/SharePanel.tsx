import { useEffect, useState } from 'react';
import { Check, Code2, Copy, Download, ExternalLink, Link2, Loader2, QrCode, Rocket } from 'lucide-react';
import clsx from 'clsx';
import QRCode from 'qrcode';
import SectionTitle from './SectionTitle';
import { useUpdateAssistant } from '../../hooks/useStudio';
import { useI18n } from '../../i18n';
import type { Assistant } from '../../types/studio';

export function publicChatUrl(slug: string): string {
  return `${window.location.origin}/c/${slug}`;
}

export default function SharePanel({ assistant }: { assistant: Assistant }) {
  const { t } = useI18n();
  const update = useUpdateAssistant(assistant.id);
  const url = publicChatUrl(assistant.slug);
  const embed = `<iframe src="${url}?embed=1" title="${assistant.name.replace(/"/g, '&quot;')}" style="width:100%;max-width:420px;height:600px;border:0;border-radius:16px"></iframe>`;
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(url, { width: 512, margin: 2 }).then(setQr, () => setQr(null));
  }, [url]);

  return (
    <div className="space-y-4">
      <section
        className={clsx(
          'card flex items-center gap-4 p-5',
          assistant.is_public && 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent',
        )}
      >
        <span
          className={clsx(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            assistant.is_public ? 'bg-emerald-500/15 text-emerald-300' : 'bg-surface-3 text-slate-300',
          )}
        >
          <Rocket className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-white">{assistant.is_public ? t('share.liveTitle') : t('share.draftTitle')}</h2>
          <p className="mt-0.5 text-sm text-slate-400">
            {assistant.is_public ? t('share.liveBody') : t('share.draftBody')}
          </p>
        </div>
        <button
          type="button"
          disabled={update.isPending}
          onClick={() => update.mutate({ is_public: !assistant.is_public })}
          className={clsx('shrink-0', assistant.is_public ? 'btn-secondary' : 'btn-primary shadow-lg shadow-brand-500/20')}
        >
          {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {assistant.is_public ? t('share.unpublish') : t('share.publish')}
        </button>
      </section>

      {assistant.is_public && (
        <>
          <section className="card space-y-3 p-5">
            <SectionTitle icon={Link2} title={t('share.link')} />
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg bg-surface-2 px-3 py-2 text-sm text-slate-200">
                {url}
              </code>
              <CopyButton text={url} />
              <a href={url} target="_blank" rel="noreferrer" className="btn-secondary px-3" aria-label={t('share.open')}>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </section>

          <section className="card flex flex-col items-center gap-4 p-5 sm:flex-row sm:items-start">
            {qr ? (
              <img
                src={qr}
                alt={t('share.qrAlt', { url })}
                className="h-40 w-40 rounded-xl bg-white p-1 shadow-lg shadow-black/30"
              />
            ) : (
              <div className="h-40 w-40 rounded-xl bg-surface-2" />
            )}
            <div className="space-y-3 text-center sm:text-left">
              <SectionTitle icon={QrCode} title={t('share.qrTitle')} help={t('share.qrBody')} />
              {qr && (
                <a href={qr} download={`${assistant.slug}-qr.png`} className="btn-secondary inline-flex">
                  <Download className="h-4 w-4" /> {t('share.download')}
                </a>
              )}
            </div>
          </section>

          <section className="card space-y-3 p-5">
            <SectionTitle icon={Code2} title={t('share.embedTitle')} help={t('share.embedBody')} />
            <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-surface-0/60 p-3 font-mono text-xs text-slate-300">
              {embed}
            </pre>
            <CopyButton text={embed} label={t('share.copyCode')} />
          </section>
        </>
      )}
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const { t } = useI18n();
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
      aria-label={label ?? t('common.copy')}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      {label && (copied ? t('common.copied') : label)}
    </button>
  );
}
