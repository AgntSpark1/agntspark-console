import { BookOpen, Headset, Sparkles, type LucideIcon } from 'lucide-react';
import type { MessageKey } from '../../i18n';

// Templates come from the gateway in English; the app shows its own
// translation for the ones it knows and the server's text for any other.
export const TEMPLATE_KEYS = ['customer-support', 'personal-assistant', 'knowledge-qa'] as const;
type KnownTemplate = (typeof TEMPLATE_KEYS)[number];

export function isKnownTemplate(key: string): key is KnownTemplate {
  return (TEMPLATE_KEYS as readonly string[]).includes(key);
}

type Field = 'name' | 'description' | 'goodFor' | 'greeting' | 'hint' | 'try1' | 'try2' | 'try3';

export function templateKey(template: KnownTemplate, field: Field): MessageKey {
  return `template.${template}.${field}`;
}

export const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  'customer-support': Headset,
  'personal-assistant': Sparkles,
  'knowledge-qa': BookOpen,
};

export const TEMPLATE_TINTS: Record<string, string> = {
  'customer-support': 'bg-emerald-500/15 text-emerald-300',
  'personal-assistant': 'bg-violet-500/15 text-violet-300',
  'knowledge-qa': 'bg-amber-500/15 text-amber-300',
};

// The translated text for a template field, or `fallback` (the server's
// English) for a template this app doesn't know yet.
export function templateText(
  t: (key: MessageKey) => string,
  template: string,
  field: Field,
  fallback = '',
): string {
  return isKnownTemplate(template) ? t(templateKey(template, field)) : fallback;
}
