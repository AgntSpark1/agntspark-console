import clsx from 'clsx';

// Each assistant gets a steady colour from its name, so a list of them is
// easy to tell apart at a glance.
const GRADIENTS = [
  'from-brand-400 to-indigo-600',
  'from-violet-400 to-fuchsia-600',
  'from-emerald-400 to-teal-600',
  'from-amber-300 to-orange-500',
  'from-rose-400 to-pink-600',
  'from-sky-400 to-cyan-600',
];

function hash(text: string): number {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return h;
}

const SIZES = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
};

export default function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  // First character, not first UTF-16 unit, so emoji and CJK names work.
  const initial = Array.from(name.trim())[0]?.toUpperCase() ?? '?';
  return (
    <div
      aria-hidden
      className={clsx(
        'flex shrink-0 select-none items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shadow-sm shadow-black/30',
        GRADIENTS[hash(name) % GRADIENTS.length],
        SIZES[size],
        className,
      )}
    >
      {initial}
    </div>
  );
}
