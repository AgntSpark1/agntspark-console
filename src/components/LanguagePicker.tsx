import { Globe } from 'lucide-react';
import clsx from 'clsx';
import { LANGUAGES, useI18n, type Locale } from '../i18n';

// A native <select> styled as a small pill: on phones it opens the system
// picker, which is easier to use than a custom menu.
export default function LanguagePicker({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <label
      className={clsx(
        'relative flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-400 transition-colors hover:bg-surface-2 hover:text-slate-200',
        className,
      )}
    >
      <Globe className="h-4 w-4" />
      <span className="hidden sm:inline">{LANGUAGES.find((l) => l.code === locale)?.label}</span>
      <select
        aria-label={t('language')}
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
