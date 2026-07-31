'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { RuleBanner } from '@/components/feedback/rule-banner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ApiEnvelope, AttendanceRecord, Student } from '@/lib/api/types';

type FormValues = { studentId: string };

async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (response.status === 401) window.location.assign('/login');
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success) {
    throw new Error(!payload.success ? payload.error.message : 'คำขอล้มเหลว');
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

export function CheckInForm() {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({ defaultValues: { studentId: '' } });
  const selectedId = form.watch('studentId');

  const students = useQuery({
    queryKey: ['active-students'],
    queryFn: () => request<Student[]>('/api/students?limit=100&status=ACTIVE'),
  });

  const selectedStudent = useMemo(
    () => students.data?.find((student) => student.id === selectedId) ?? null,
    [students.data, selectedId],
  );

  const checkIn = useMutation({
    mutationFn: (studentId: string) =>
      request<AttendanceRecord>('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      }),
    onSuccess: async (record) => {
      toast.success(
        `${record.student.fullName} เช็คชื่อสำเร็จ เป็นสถานะ ${record.status === 'PRESENT' ? 'มาเรียน' : 'มาสาย'}`,
      );
      form.reset({ studentId: '' });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['attendance-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['students'] }),
        queryClient.invalidateQueries({ queryKey: ['active-students'] }),
      ]);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.14em] text-secondary uppercase">
          Check-in workflow
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">บันทึกเช็คชื่อ</h1>
        <p className="mt-2 text-sm text-text-secondary">
          ส่งเฉพาะ <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">studentId</code>{' '}
          — เวลา สถานะ และวันที่ธุรกิจถูกกำหนดที่เซิร์ฟเวอร์
        </p>
      </div>

      <RuleBanner />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(({ studentId }) => {
              if (!studentId) return;
              checkIn.mutate(studentId);
            })}
          >
            <label className="block text-sm font-medium">
              เลือกนักเรียน (Active)
              <select
                aria-label="นักเรียน"
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm"
                {...form.register('studentId', { required: true })}
              >
                <option value="" disabled>
                  {students.isPending ? 'กำลังโหลดรายชื่อ…' : 'เลือกนักเรียนที่ต้องการเช็คชื่อ'}
                </option>
                {students.data?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.studentCode} — {student.fullName}
                  </option>
                ))}
              </select>
            </label>

            {students.error && <p className="text-sm text-absent">{students.error.message}</p>}

            <Button type="submit" disabled={checkIn.isPending || !selectedId || students.isPending}>
              {checkIn.isPending ? 'กำลังบันทึก…' : 'ยืนยันเช็คชื่อ'}
            </Button>
          </form>
        </Card>

        <Card className="bg-surface-muted/60">
          <h2 className="font-semibold">การ์ดยืนยันก่อนบันทึก</h2>
          {selectedStudent ? (
            <div className="mt-4 space-y-3">
              <p className="text-2xl font-bold">{selectedStudent.fullName}</p>
              <p className="text-sm text-text-secondary">{selectedStudent.studentCode}</p>
              <Badge tone="success">ใช้งานอยู่</Badge>
              <p className="text-sm leading-relaxed text-text-secondary">
                ระบบจะใช้เวลาปัจจุบันของเซิร์ฟเวอร์ตามโซน Bangkok เพื่อกำหนดวันธุรกิจและสถานะ
                มาเรียน/มาสาย โดยอัตโนมัติ
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-text-secondary">
              เลือกนักเรียนทางซ้ายเพื่อตรวจรายละเอียดก่อนยืนยัน
            </p>
          )}

          {checkIn.data && (
            <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-sm">
              <p className="font-semibold text-text-primary">ผลลัพธ์ล่าสุด</p>
              <p className="mt-2">
                สถานะ:{' '}
                <span className="font-semibold">
                  {checkIn.data.status === 'PRESENT' ? 'มาเรียน' : 'มาสาย'}
                </span>
              </p>
              <p className="mt-1">วันที่ธุรกิจ: {checkIn.data.attendanceDate}</p>
              <p className="mt-1">เวลาเซิร์ฟเวอร์: {formatBangkokTime(checkIn.data.checkedInAt)}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
