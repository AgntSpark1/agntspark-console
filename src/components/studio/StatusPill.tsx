import clsx from 'clsx';
import { useI18n } from '../../i18n';

export default function StatusPill({ live, className }: { live: boolean; className?: string }) {
  const { t } = useI18n();
  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
        live ? 'bg-emerald-500/10 text-emerald-300' : 'bg-surface-3 text-slate-400',
        className,
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', live ? 'animate-pulse bg-emerald-400' : 'bg-slate-500')} />
      {live ? t('status.live') : t('status.draft')}
    </span>
  );
}
