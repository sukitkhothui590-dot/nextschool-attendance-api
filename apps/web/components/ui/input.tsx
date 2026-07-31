import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'min-h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none placeholder:text-text-secondary focus:border-secondary focus:ring-2 focus:ring-secondary/15',
        className,
      )}
      {...props}
    />
  );
}
