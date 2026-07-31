'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ApiEnvelope, AttendanceRecord, Student } from '@/lib/api/types';

type FormValues = { studentId: string };

async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (response.status === 401) window.location.assign('/login');
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success)
    throw new Error(!payload.success ? payload.error.message : 'Request failed.');
  return payload.data;
}

export function CheckInForm() {
  const form = useForm<FormValues>();
  const students = useQuery({
    queryKey: ['active-students'],
    queryFn: () => request<Student[]>('/api/students?limit=100&status=ACTIVE'),
  });
  const checkIn = useMutation({
    mutationFn: (studentId: string) =>
      request<AttendanceRecord>('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      }),
    onSuccess: (record) => {
      toast.success(`${record.student.fullName} checked in as ${record.status.toLowerCase()}.`);
      form.reset();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Card className="max-w-xl">
      <h1 className="text-2xl font-bold">Student check-in</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Record attendance for the current Bangkok business date.
      </p>
      <form
        className="mt-6 space-y-5"
        onSubmit={form.handleSubmit(({ studentId }) => checkIn.mutate(studentId))}
      >
        <label className="block text-sm font-medium">
          Student
          <select
            aria-label="Student"
            className="mt-2 min-h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm"
            {...form.register('studentId', { required: true })}
            defaultValue=""
          >
            <option value="" disabled>
              {students.isPending ? 'Loading students…' : 'Select an active student'}
            </option>
            {students.data?.map((student) => (
              <option key={student.id} value={student.id}>
                {student.studentCode} — {student.fullName}
              </option>
            ))}
          </select>
        </label>
        {students.error && <p className="text-sm text-absent">{students.error.message}</p>}
        <Button type="submit" disabled={checkIn.isPending || students.isPending}>
          {checkIn.isPending ? 'Checking in…' : 'Check in student'}
        </Button>
      </form>
    </Card>
  );
}
