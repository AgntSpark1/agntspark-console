import type { LucideIcon } from 'lucide-react';

export default function SectionTitle({
  icon: Icon,
  title,
  help,
}: {
  icon: LucideIcon;
  title: string;
  help?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-slate-300">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {help && <p className="mt-0.5 text-xs text-slate-500">{help}</p>}
      </div>
    </div>
  );
}
