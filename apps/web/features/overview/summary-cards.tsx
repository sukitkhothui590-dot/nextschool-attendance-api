import { UserCheck, Clock3, UserX, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { AttendanceSummary } from '@/lib/api/types';

export function SummaryCards({ summary }: { summary: AttendanceSummary }) {
  const items = [
    ['Active students', summary.totalActiveStudents, Users, 'text-secondary'],
    ['Present', summary.present, UserCheck, 'text-present'],
    ['Late', summary.late, Clock3, 'text-late'],
    ['Absent', summary.absent, UserX, 'text-absent'],
  ] as const;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, value, Icon, color]) => (
        <Card key={label}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">{label}</p>
              <p className="mt-2 text-3xl font-bold text-text-primary">{value}</p>
            </div>
            <Icon className={color} size={22} />
          </div>
        </Card>
      ))}
    </div>
  );
}
