import { UserCheck, Clock3, UserX, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { AttendanceSummary } from '@/lib/api/types';

export function SummaryCards({ summary }: { summary: AttendanceSummary }) {
  const items = [
    {
      label: 'นักเรียน Active',
      value: summary.totalActiveStudents,
      icon: Users,
      tone: 'text-secondary',
      accent: 'bg-secondary',
      hint: 'ใช้คำนวณสรุปวันนี้',
    },
    {
      label: 'มาเรียน',
      value: summary.present,
      icon: UserCheck,
      tone: 'text-present',
      accent: 'bg-present',
      hint: 'PRESENT',
    },
    {
      label: 'มาสาย',
      value: summary.late,
      icon: Clock3,
      tone: 'text-late',
      accent: 'bg-late',
      hint: 'LATE',
    },
    {
      label: 'ขาด',
      value: summary.absent,
      icon: UserX,
      tone: 'text-absent',
      accent: 'bg-absent',
      hint: 'คำนวณจาก Active',
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="relative overflow-hidden">
          <div className={`absolute inset-y-0 left-0 w-1 ${item.accent}`} />
          <div className="flex items-start justify-between gap-3 pl-1">
            <div>
              <p className="text-sm text-text-secondary">{item.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-text-primary">
                {item.value}
              </p>
              <p className="mt-2 text-xs text-text-secondary">{item.hint}</p>
            </div>
            <span
              className={`grid h-10 w-10 place-items-center rounded-xl bg-surface-muted ${item.tone}`}
            >
              <item.icon size={18} aria-hidden="true" />
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
