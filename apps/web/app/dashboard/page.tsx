'use client';

import { RuleBanner } from '@/components/feedback/rule-banner';
import { CardSkeleton } from '@/components/feedback/skeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DatePicker } from '@/features/overview/date-picker';
import { SummaryCards } from '@/features/overview/summary-cards';
import { SummaryChart } from '@/features/overview/summary-chart';
import type { ApiEnvelope, AttendanceSummary } from '@/lib/api/types';
import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

function today() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
}

async function getSummary(date: string) {
  const response = await fetch(`/api/attendance/summary?date=${date}`);
  if (response.status === 401) window.location.assign('/login');
  const payload = (await response.json()) as ApiEnvelope<AttendanceSummary>;
  if (!response.ok || !payload.success) {
    throw new Error(
      !payload.success ? payload.error.message : 'โหลดสรุปการเข้าเรียนไม่สำเร็จ',
    );
  }
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
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-secondary uppercase">
            Daily operations
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary">
            ภาพรวมการเข้าเรียน
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            ตัวเลขทั้งหมดมาจาก API โดยตรง ไม่คำนวณซ้ำฝั่งหน้าเว็บ
          </p>
        </div>
        <DatePicker value={date} onChange={setDate} />
      </div>

      <RuleBanner />

      {summary.isPending && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {summary.error && (
        <Card className="border-red-100 bg-red-50">
          <p className="text-sm text-absent">{summary.error.message}</p>
          <Button className="mt-4" type="button" onClick={() => summary.refetch()}>
            ลองใหม่
          </Button>
        </Card>
      )}

      {summary.data && (
        <>
          <SummaryCards summary={summary.data} />
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <SummaryChart summary={summary.data} />
            <Card className="flex flex-col justify-between">
              <div>
                <p className="text-sm text-text-secondary">อัตราการเข้าเรียน</p>
                <p className="mt-3 text-6xl font-bold tracking-tight text-primary">
                  {summary.data.attendanceRate}
                  <span className="text-3xl">%</span>
                </p>
                <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                  นับจากมาเรียน + มาสาย ของวันที่ {summary.data.date} จากนักเรียน Active ทั้งหมด{' '}
                  {summary.data.totalActiveStudents} คน
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/dashboard/check-in"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
                >
                  ไปหน้าเช็คชื่อ
                </Link>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
