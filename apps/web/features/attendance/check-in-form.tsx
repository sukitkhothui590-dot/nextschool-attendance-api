'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Clock3, Search, UserRound, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useBangkokClock } from '@/hooks/use-bangkok-clock';
import { phaseCopy } from '@/lib/time/bangkok';
import { statusLabel, toThaiError } from '@/lib/i18n/th';
import { cn } from '@/lib/utils';
import type { ApiEnvelope, AttendanceRecord, Student } from '@/lib/api/types';

async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (response.status === 401) {
    window.location.assign('/login?message=expired');
    throw new Error('เซสชันหมดอายุ');
  }
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success) {
    throw new Error(toThaiError(!payload.success ? payload.error : null));
  }
  return payload.data;
}

function formatBangkokTime(iso: string) {
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(iso));
}

type SuccessState = {
  record: AttendanceRecord;
};

export function CheckInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetId = searchParams.get('studentId') ?? '';
  const queryClient = useQueryClient();
  const clock = useBangkokClock();
  const copy = phaseCopy(clock);
  const predictedStatus = clock.phase === 'late' ? 'LATE' : 'PRESENT';
  const searchRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(presetId);
  const [success, setSuccess] = useState<SuccessState | null>(null);

  const students = useQuery({
    queryKey: ['active-students'],
    queryFn: () => request<Student[]>('/api/students?limit=100&status=ACTIVE&sortBy=studentCode'),
  });

  useEffect(() => {
    if (presetId) setSelectedId(presetId);
  }, [presetId]);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const selectedStudent = useMemo(
    () => students.data?.find((student) => student.id === selectedId) ?? null,
    [students.data, selectedId],
  );

  const filtered = useMemo(() => {
    const list = students.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return list.slice(0, 12);
    return list
      .filter((student) => {
        const hay = `${student.studentCode} ${student.fullName} ${student.firstName} ${student.lastName}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 20);
  }, [students.data, query]);

  function clearSelection(focusSearch = true) {
    setSelectedId('');
    setQuery('');
    setSuccess(null);
    if (presetId) router.replace('/dashboard/check-in');
    if (focusSearch) {
      window.setTimeout(() => searchRef.current?.focus(), 50);
    }
  }

  const checkIn = useMutation({
    mutationFn: (studentId: string) =>
      request<AttendanceRecord>('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      }),
    onSuccess: async (record) => {
      setSuccess({ record });
      toast.success(`${record.student.fullName} · ${statusLabel(record.status)}`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['attendance-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['students'] }),
        queryClient.invalidateQueries({ queryKey: ['active-students'] }),
      ]);
    },
    onError: (error) => toast.error(error.message),
  });

  const lateTone = predictedStatus === 'LATE';

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">เช็คชื่อ</h1>
          <p className="mt-1 text-sm text-text-secondary">
            พิมพ์รหัสหรือชื่อ → เลือกคน → กดยืนยัน แล้วเช็คคนถัดไปได้เลย
          </p>
        </div>
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm',
            lateTone
              ? 'border-orange-200 bg-orange-50 text-late'
              : 'border-emerald-200 bg-emerald-50 text-present',
          )}
        >
          <Clock3 size={16} aria-hidden="true" />
          <span className="font-mono font-bold tabular-nums text-text-primary">{clock.timeLabel}</span>
          <span className="text-xs font-medium">· {copy.badge}</span>
        </div>
      </div>

      {success ? (
        <Card className="border-emerald-200 bg-emerald-50/80">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-present text-white">
                <Check size={22} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-present">เช็คชื่อสำเร็จ</p>
                <p className="mt-1 text-xl font-bold text-text-primary">
                  {success.record.student.fullName}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {success.record.student.studentCode} · {statusLabel(success.record.status)} ·{' '}
                  {formatBangkokTime(success.record.checkedInAt)}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={() => clearSelection(true)}>
                เช็คคนถัดไป
              </Button>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold"
                onClick={() => router.push('/dashboard')}
              >
                ดูภาพรวม
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <Card className="space-y-4 p-4 sm:p-5">
            <label className="block">
              <span className="text-sm font-medium">ค้นหารหัส หรือชื่อ</span>
              <div className="relative mt-2">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-secondary"
                  size={18}
                  aria-hidden="true"
                />
                <Input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSelectedId('');
                  }}
                  placeholder="เช่น 6900000020 หรือ Arthit"
                  className="h-12 bg-surface pl-10 pr-10 text-base"
                  autoComplete="off"
                  inputMode="search"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="ล้างคำค้น"
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                    onClick={() => {
                      setQuery('');
                      searchRef.current?.focus();
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </label>

            {students.isPending && (
              <p className="text-sm text-text-secondary">กำลังโหลดรายชื่อ…</p>
            )}
            {students.error && <p className="text-sm text-absent">{students.error.message}</p>}

            {!students.isPending && !students.error && (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="border-b border-border bg-surface-muted px-3 py-2 text-xs text-text-secondary">
                  {query.trim()
                    ? `ผลค้นหา ${filtered.length} คน`
                    : 'นักเรียนที่ใช้งานอยู่ (แสดงบางส่วน — พิมพ์เพื่อค้นหา)'}
                </div>
                <ul className="max-h-[16rem] divide-y divide-border overflow-y-auto" role="listbox">
                  {filtered.length === 0 ? (
                    <li className="px-4 py-6 text-center text-sm text-text-secondary">
                      ไม่พบนักเรียนที่ตรงกับ “{query}”
                    </li>
                  ) : (
                    filtered.map((student) => {
                      const active = student.id === selectedId;
                      return (
                        <li key={student.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={active}
                            className={cn(
                              'flex w-full items-center gap-3 px-4 py-3 text-left transition',
                              active ? 'bg-orange-50' : 'hover:bg-surface-muted/80',
                            )}
                            onClick={() => setSelectedId(student.id)}
                          >
                            <span
                              className={cn(
                                'grid h-9 w-9 shrink-0 place-items-center rounded-full',
                                active
                                  ? 'bg-primary text-white'
                                  : 'bg-surface-muted text-text-secondary',
                              )}
                            >
                              <UserRound size={16} aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-semibold text-text-primary">
                                {student.fullName}
                              </span>
                              <span className="block font-mono text-xs text-text-secondary">
                                {student.studentCode}
                              </span>
                            </span>
                            {active && (
                              <Check className="shrink-0 text-primary" size={18} aria-hidden="true" />
                            )}
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            )}
          </Card>

          <Card
            className={cn(
              'sticky bottom-4 z-10 border-2 shadow-lg sm:static sm:shadow-none',
              selectedStudent ? 'border-primary/30' : 'border-border',
            )}
          >
            {selectedStudent ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-secondary uppercase">
                      พร้อมเช็คชื่อ
                    </p>
                    <p className="mt-1 text-2xl font-bold">{selectedStudent.fullName}</p>
                    <p className="mt-1 font-mono text-sm text-text-secondary">
                      {selectedStudent.studentCode}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone={lateTone ? 'warning' : 'success'}>
                        จะได้ · {statusLabel(predictedStatus)}
                      </Badge>
                      <Badge tone="neutral">ตัดเวลา {clock.cutoffLabel} น.</Badge>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="self-start text-sm font-medium text-text-secondary hover:text-text-primary"
                    onClick={() => clearSelection(true)}
                  >
                    ยกเลิกการเลือก
                  </button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    className="min-h-12 flex-1 text-base"
                    disabled={checkIn.isPending}
                    onClick={() => checkIn.mutate(selectedStudent.id)}
                  >
                    {checkIn.isPending ? 'กำลังบันทึก…' : 'ยืนยันเช็คชื่อ'}
                  </Button>
                  <button
                    type="button"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold"
                    onClick={() => router.push('/dashboard/students?status=ACTIVE')}
                  >
                    ไปหน้ารายชื่อ
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                ยังไม่ได้เลือกนักเรียน — พิมพ์รหัสปี เช่น <span className="font-mono">69</span> หรือชื่อ
                แล้วแตะรายชื่อด้านบน
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
