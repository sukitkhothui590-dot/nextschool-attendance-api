import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'min-h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm outline-none',
          'placeholder:text-text-secondary/80 focus:border-primary focus:ring-2 focus:ring-primary/15',
          className,
        )}
        {...props}
      />
    );
  },
);
