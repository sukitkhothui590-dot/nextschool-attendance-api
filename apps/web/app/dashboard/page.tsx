'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { RuleBanner } from '@/components/feedback/rule-banner';
import { CardSkeleton } from '@/components/feedback/skeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DatePicker } from '@/features/overview/date-picker';
import { SummaryCards } from '@/features/overview/summary-cards';
import { SummaryChart } from '@/features/overview/summary-chart';
import { statusLabel, toThaiError } from '@/lib/i18n/th';
import type { ApiEnvelope, AttendanceSummary } from '@/lib/api/types';

function today() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
}

async function getSummary(date: string) {
  const response = await fetch(`/api/attendance/summary?date=${date}`);
  if (response.status === 401) {
    window.location.assign('/login?message=expired');
    throw new Error('เซสชันหมดอายุ');
  }
  const payload = (await response.json()) as ApiEnvelope<AttendanceSummary>;
  if (!response.ok || !payload.success) {
    throw new Error(toThaiError(!payload.success ? payload.error : null, 'โหลดสรุปไม่สำเร็จ'));
  }
  return payload.data;
}

function OverviewContent() {
  const searchParams = useSearchParams();
  const checkedIn = searchParams.get('checkedIn');
  const status = searchParams.get('status');
  const [date, setDate] = useState(today);
  const summary = useQuery({
    queryKey: ['attendance-summary', date],
    queryFn: () => getSummary(date),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-secondary">ขั้นตอนที่ 1</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary">
            ภาพรวมการเข้าเรียน
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            ดูสถานะวันนี้ก่อน แล้วไปที่รายชื่อนักเรียนหรือหน้าเช็คชื่อต่อได้ทันที
          </p>
        </div>
        <DatePicker value={date} onChange={setDate} />
      </div>

      {checkedIn && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-present">
          บันทึกเช็คชื่อของ <strong>{checkedIn}</strong> สำเร็จ
          {status ? ` · สถานะ${statusLabel(status)}` : ''} · สรุปด้านล่างอัปเดตแล้ว
        </div>
      )}

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
                  นับจาก “มาเรียน + มาสาย” ของวันที่ {summary.data.date} จากนักเรียนที่ใช้งานอยู่{' '}
                  {summary.data.totalActiveStudents} คน · ขาด {summary.data.absent} คน
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard/students?status=ACTIVE"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-text-primary transition hover:bg-surface-muted"
                >
                  ดูนักเรียนที่ใช้งานอยู่
                </Link>
                <Link
                  href="/dashboard/check-in"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover"
                >
                  ไปเช็คชื่อเลย
                </Link>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="text-sm text-text-secondary">กำลังโหลดภาพรวม…</p>}>
      <OverviewContent />
    </Suspense>
  );
}
