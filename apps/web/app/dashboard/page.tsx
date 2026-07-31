'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { DatePicker } from '@/features/overview/date-picker';
import { SummaryCards } from '@/features/overview/summary-cards';
import { SummaryChart } from '@/features/overview/summary-chart';
import type { ApiEnvelope, AttendanceSummary } from '@/lib/api/types';

function today() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
}
async function getSummary(date: string) {
  const response = await fetch(`/api/attendance/summary?date=${date}`);
  if (response.status === 401) window.location.assign('/login');
  const payload = (await response.json()) as ApiEnvelope<AttendanceSummary>;
  if (!response.ok || !payload.success)
    throw new Error(
      !payload.success ? payload.error.message : 'Unable to load attendance summary.',
    );
  return payload.data;
}

export default function DashboardPage() {
  const [date, setDate] = useState(today);
  const summary = useQuery({
    queryKey: ['attendance-summary', date],
    queryFn: () => getSummary(date),
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="mt-1 text-sm text-text-secondary">Daily attendance at a glance.</p>
        </div>
        <DatePicker value={date} onChange={setDate} />
      </div>
      {summary.isPending && <p className="text-sm text-text-secondary">Loading attendance…</p>}
      {summary.error && <p className="text-sm text-absent">{summary.error.message}</p>}
      {summary.data && (
        <>
          <SummaryCards summary={summary.data} />
          <div className="grid gap-6 lg:grid-cols-2">
            <SummaryChart summary={summary.data} />
            <section className="rounded-xl border border-border bg-surface p-5">
              <p className="text-sm text-text-secondary">Attendance rate</p>
              <p className="mt-2 text-5xl font-bold text-primary">{summary.data.attendanceRate}%</p>
              <p className="mt-3 text-sm text-text-secondary">
                Present and late students counted for {summary.data.date}.
              </p>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
