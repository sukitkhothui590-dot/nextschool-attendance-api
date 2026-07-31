import { cn } from '@/lib/utils';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border border-border bg-surface p-5 shadow-sm', className)}>
      {children}
    </section>
  );
}
