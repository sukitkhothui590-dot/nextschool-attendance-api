'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import type { AttendanceSummary } from '@/lib/api/types';

export function SummaryChart({ summary }: { summary: AttendanceSummary }) {
  const data = [
    { name: 'Present', value: summary.present, color: '#1F9D68' },
    { name: 'Late', value: summary.late, color: '#D88A12' },
    { name: 'Absent', value: summary.absent, color: '#D14343' },
  ];
  return (
    <Card className="h-80">
      <h2 className="font-semibold">Attendance distribution</h2>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={86}
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
    </Card>
  );
}
