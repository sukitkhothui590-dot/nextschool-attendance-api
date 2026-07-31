'use client';

import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { statusLabel, toThaiError } from '@/lib/i18n/th';
import type { ApiEnvelope, Student } from '@/lib/api/types';

async function loadStudents(query: string) {
  const response = await fetch(`/api/students?${query}`);
  if (response.status === 401) {
    window.location.assign('/login?message=expired');
    throw new Error('เซสชันหมดอายุ');
  }
  const payload = (await response.json()) as ApiEnvelope<Student[]>;
  if (!response.ok || !payload.success) {
    throw new Error(toThaiError(!payload.success ? payload.error : null, 'โหลดรายชื่อไม่สำเร็จ'));
  }
  return payload;
}

export function StudentsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get('search') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const status = params.get('status') ?? '';
  const page = Number(params.get('page') ?? '1');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const current = params.get('search') ?? '';
    if (current === debouncedSearch) return;
    const next = new URLSearchParams(params.toString());
    if (debouncedSearch) next.set('search', debouncedSearch);
    else next.delete('search');
    next.set('page', '1');
    router.replace(`${pathname}?${next}`);
  }, [debouncedSearch, pathname, router, params]);

  const query = new URLSearchParams({
    page: String(page),
    limit: '20',
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(status ? { status } : {}),
  }).toString();

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['students', query],
    queryFn: () => loadStudents(query),
  });

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    router.push(`${pathname}?${next}`);
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-border bg-surface-muted/50 p-5 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">ค้นหานักเรียน</span>
          <Search className="absolute top-3.5 left-3 text-text-secondary" size={16} />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="bg-surface pl-9"
            placeholder="ค้นหาชื่อ หรือรหัส เช่น 6900000020"
          />
        </label>
        <label>
          <span className="sr-only">กรองสถานะ</span>
          <select
            value={status}
            onChange={(event) => update('status', event.target.value)}
            className="min-h-11 rounded-xl border border-border bg-surface px-3 text-sm"
          >
            <option value="">ทุกสถานะ</option>
            <option value="ACTIVE">ใช้งานอยู่</option>
            <option value="INACTIVE">ไม่ใช้งาน</option>
          </select>
        </label>
      </div>

      {error ? (
        <div className="space-y-3 p-5">
          <p className="text-sm text-absent">{error.message}</p>
          <button type="button" onClick={() => refetch()} className="text-sm font-semibold text-primary">
            ลองใหม่
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-surface-muted text-text-secondary">
              <tr>
                <th className="px-5 py-3 font-medium">นักเรียน</th>
                <th className="px-5 py-3 font-medium">รหัส</th>
                <th className="px-5 py-3 font-medium">สถานะ</th>
                <th className="px-5 py-3 font-medium">ขั้นตอนถัดไป</th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <tr>
                  <td colSpan={4} className="p-5 text-text-secondary">
                    กำลังโหลดรายชื่อ…
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-5 text-text-secondary">
                    ไม่พบนักเรียนตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                data?.data.map((student) => (
                  <tr key={student.id} className="border-t border-border hover:bg-surface-muted/40">
                    <td className="px-5 py-4 font-medium">{student.fullName}</td>
                    <td className="px-5 py-4 text-text-secondary">{student.studentCode}</td>
                    <td className="px-5 py-4">
                      <Badge tone={student.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {statusLabel(student.status)}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      {student.status === 'ACTIVE' ? (
                        <Link
                          href={`/dashboard/check-in?studentId=${student.id}`}
                          className="inline-flex min-h-9 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover"
                        >
                          เช็คชื่อคนนี้
                        </Link>
                      ) : (
                        <span className="text-xs text-text-secondary">เช็คชื่อไม่ได้</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {data?.meta && (
        <div className="flex flex-col gap-3 border-t border-border p-4 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
          <span>ทั้งหมด {data.meta.total} คน</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => update('page', String(page - 1))}
            >
              ก่อนหน้า
            </button>
            <span>
              หน้า {page} / {Math.max(data.meta.totalPages, 1)}
            </span>
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
              disabled={page >= data.meta.totalPages}
              onClick={() => update('page', String(page + 1))}
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
