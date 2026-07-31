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
    <label className="flex flex-col gap-1.5 text-sm font-medium text-text-secondary sm:flex-row sm:items-center sm:gap-2">
      วันที่สรุป
      <Input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full sm:w-auto"
      />
    </label>
  );
}
