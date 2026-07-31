import { NextResponse } from 'next/server';
import { getSessionToken } from '@/lib/auth/session';
import { apiFetch, ApiError } from '@/lib/api/server';
import type { Student } from '@/lib/api/types';

export async function GET() {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ success: false }, { status: 401 });
  try {
    await apiFetch<Student[]>('/students?limit=1');
    return NextResponse.json({ success: true, user: { email: 'Administrator' } });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    return NextResponse.json({ success: false }, { status });
  }
}
