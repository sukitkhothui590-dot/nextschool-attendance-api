'use client';

import { Input } from '@/components/ui/input';

export function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
      Date{' '}
      <Input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-auto"
      />
    </label>
  );
}
