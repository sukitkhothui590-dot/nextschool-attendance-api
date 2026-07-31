import { NextRequest, NextResponse } from 'next/server';
import { apiFetch, ApiError } from '@/lib/api/server';
import type { Student } from '@/lib/api/types';

export async function GET(request: NextRequest) {
  try {
    const payload = await apiFetch<Student[]>(`/students${request.nextUrl.search}`);
    return NextResponse.json(payload);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error instanceof ApiError ? error.code : undefined,
          message: error instanceof Error ? error.message : 'โหลดรายชื่อนักเรียนไม่สำเร็จ',
        },
      },
      { status },
    );
  }
}
