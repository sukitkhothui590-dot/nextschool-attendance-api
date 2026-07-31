import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { apiFetch, ApiError } from '@/lib/api/server';
import type { AttendanceRecord } from '@/lib/api/types';

const schema = z.object({ studentId: z.string().uuid() });

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json(
      { success: false, error: { message: 'Select a valid student.' } },
      { status: 400 },
    );
  try {
    const payload = await apiFetch<AttendanceRecord>('/attendance', {
      method: 'POST',
      body: JSON.stringify({ studentId: parsed.data.studentId }),
    });
    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    return NextResponse.json(
      {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Unable to check in student.' },
      },
      { status },
    );
  }
}
