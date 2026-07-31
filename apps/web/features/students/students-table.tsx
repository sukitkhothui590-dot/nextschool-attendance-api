'use client';

import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { ApiEnvelope, Student } from '@/lib/api/types';

async function loadStudents(query: string) {
  const response = await fetch(`/api/students?${query}`);
  if (response.status === 401) window.location.assign('/login');
  const payload = (await response.json()) as ApiEnvelope<Student[]>;
  if (!response.ok || !payload.success)
    throw new Error(!payload.success ? payload.error.message : 'Unable to load students.');
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
  const { data, isPending, error } = useQuery({
    queryKey: ['students', query],
    queryFn: () => loadStudents(query),
  });
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    router.push(`${pathname}?${next}`);
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search students</span>
          <Search className="absolute left-3 top-3 text-text-secondary" size={16} />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
            placeholder="Search name or student code"
          />
        </label>
        <label>
          <span className="sr-only">Filter by student status</span>
          <select
            value={status}
            onChange={(event) => update('status', event.target.value)}
            className="min-h-10 rounded-lg border border-border bg-surface px-3 text-sm"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
      </div>
      {error ? (
        <p className="p-5 text-sm text-absent">{error.message}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-text-secondary">
              <tr>
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isPending ? (
                <tr>
                  <td colSpan={3} className="p-5 text-text-secondary">
                    Loading students…
                  </td>
                </tr>
              ) : (
                data?.data.map((student) => (
                  <tr key={student.id} className="border-t border-border">
                    <td className="px-5 py-4 font-medium">{student.fullName}</td>
                    <td className="px-5 py-4 text-text-secondary">{student.studentCode}</td>
                    <td className="px-5 py-4">
                      <Badge tone={student.status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {student.status.toLowerCase()}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {data?.meta && (
        <div className="flex items-center justify-between border-t border-border p-4 text-sm text-text-secondary">
          <span>{data.meta.total} students</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => update('page', String(page - 1))}>
              Previous
            </button>
            <span>
              Page {page} of {data.meta.totalPages}
            </span>
            <button
              disabled={page >= data.meta.totalPages}
              onClick={() => update('page', String(page + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
