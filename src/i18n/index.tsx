import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en, type MessageKey, type Messages } from './messages/en';
import { de } from './messages/de';
import { es } from './messages/es';
import { fr } from './messages/fr';
import { ja } from './messages/ja';
import { ko } from './messages/ko';
import { pt } from './messages/pt';
import { zhCN } from './messages/zh-CN';
import { zhTW } from './messages/zh-TW';

// The languages the builder app and the visitor chat page speak. English is
// the source; every other dictionary must have every key (type-checked).
export const LANGUAGES = [
  { code: 'en', label: 'English', messages: en },
  { code: 'es', label: 'Español', messages: es },
  { code: 'pt', label: 'Português', messages: pt },
  { code: 'fr', label: 'Français', messages: fr },
  { code: 'de', label: 'Deutsch', messages: de },
  { code: 'ja', label: '日本語', messages: ja },
  { code: 'ko', label: '한국어', messages: ko },
  { code: 'zh-CN', label: '简体中文', messages: zhCN },
  { code: 'zh-TW', label: '繁體中文', messages: zhTW },
] as const satisfies readonly { code: string; label: string; messages: Messages }[];

export type Locale = (typeof LANGUAGES)[number]['code'];
export type { MessageKey };
type Vars = Record<string, string | number>;

const STORAGE_KEY = 'agntspark_locale';

function isLocale(v: string | null | undefined): v is Locale {
  return !!v && LANGUAGES.some((l) => l.code === v);
}

// "zh-HK" and "zh-Hant-TW" read Traditional, other "zh-*" Simplified, and any
// other "xx-YY" falls back to its base language when we have it.
export function matchLocale(tag: string): Locale | null {
  const lower = tag.toLowerCase();
  if (lower.startsWith('zh')) {
    return /hant|-tw|-hk|-mo/.test(lower) ? 'zh-TW' : 'zh-CN';
  }
  const base = lower.split('-')[0];
  return isLocale(base) ? base : null;
}

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    // Storage blocked (private mode, embedded iframe): use the browser's language.
  }
  for (const tag of navigator.languages ?? [navigator.language]) {
    const match = matchLocale(tag);
    if (match) return match;
  }
  return 'en';
}

function format(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}

interface I18n {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Vars) => string;
  // Picks `<key>_one` or `<key>_other` for the count, and passes {count}.
  tn: (key: PluralBase, count: number, vars?: Vars) => string;
  formatNumber: (n: number) => string;
  formatDate: (date: Date) => string;
  formatDateTime: (iso: string) => string;
}

type PluralBase = MessageKey extends infer K
  ? K extends `${infer B}_one`
    ? B
    : never
  : never;

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not saved; the choice still applies until the page reloads.
    }
  }, []);

  const value = useMemo<I18n>(() => {
    const messages: Messages = LANGUAGES.find((l) => l.code === locale)?.messages ?? en;
    const plural = new Intl.PluralRules(locale);
    const t = (key: MessageKey, vars?: Vars) => format(messages[key] ?? en[key], vars);
    return {
      locale,
      setLocale,
      t,
      tn: (key, count, vars) => {
        const form = plural.select(count) === 'one' ? 'one' : 'other';
        return t(`${key}_${form}` as MessageKey, { count: count.toLocaleString(locale), ...vars });
      },
      formatNumber: (n) => n.toLocaleString(locale),
      formatDate: (date) => date.toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
      formatDateTime: (iso) =>
        new Date(iso).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
