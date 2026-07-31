'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import type { AttendanceSummary } from '@/lib/api/types';

export function SummaryChart({ summary }: { summary: AttendanceSummary }) {
  const data = [
    { name: 'มาเรียน', value: summary.present, color: '#15803d' },
    { name: 'มาสาย', value: summary.late, color: '#b45309' },
    { name: 'ขาด', value: summary.absent, color: '#b91c1c' },
  ];

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-text-primary">สัดส่วนสถานะ</h2>
          <p className="mt-1 text-sm text-text-secondary">ค่าตัวเลขอ่านได้โดยไม่พึ่งสีอย่างเดียว</p>
        </div>
      </div>

      <div className="mt-2 grid gap-4 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={84}
                paddingAngle={3}
              >
                {data.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-3">
          {data.map((item) => (
            <li
              key={item.name}
              className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2.5 text-sm"
            >
              <span className="inline-flex items-center gap-2 font-medium">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                {item.name}
              </span>
              <span className="font-semibold tabular-nums">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
