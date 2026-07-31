import { cn } from '@/lib/utils';

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
    success: 'bg-emerald-50 text-present ring-emerald-100',
    warning: 'bg-amber-50 text-late ring-amber-100',
    danger: 'bg-red-50 text-absent ring-red-100',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        tones[tone],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}
