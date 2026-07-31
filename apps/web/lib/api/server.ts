import 'server-only';

import { clearSession, getSessionToken } from '@/lib/auth/session';
import { env } from '@/lib/env';
import type { ApiEnvelope } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const token = await getSessionToken();
  const response = await fetch(`${env.internalApiUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (response.status === 401) await clearSession();
  if (!response.ok || !payload) {
    const code = payload && !payload.success ? payload.error.code : undefined;
    const raw =
      payload && !payload.success ? payload.error.message : 'The service is unavailable.';
    const message =
      ({
        VALIDATION_ERROR: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
        INVALID_CREDENTIALS: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        UNAUTHORIZED: 'กรุณาเข้าสู่ระบบใหม่',
        TOKEN_EXPIRED: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
        STUDENT_NOT_FOUND: 'ไม่พบนักเรียนที่ระบุ',
        STUDENT_INACTIVE: 'เช็คชื่อได้เฉพาะนักเรียนที่ใช้งานอยู่',
        ATTENDANCE_ALREADY_EXISTS: 'นักเรียนคนนี้เช็คชื่อวันนี้แล้ว',
        ROUTE_NOT_FOUND: 'ไม่พบเส้นทางที่ร้องขอ',
        RATE_LIMIT_EXCEEDED: 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง',
        SUMMARY_INVARIANT_VIOLATION: 'ข้อมูลสรุปไม่สอดคล้อง กรุณาติดต่อผู้ดูแลระบบ',
        INTERNAL_SERVER_ERROR: 'เกิดข้อผิดพลาดภายในระบบ',
      } as Record<string, string>)[code ?? ''] ??
      (raw === 'The service is unavailable.' ? 'บริการไม่พร้อมใช้งานชั่วคราว' : raw);
    throw new ApiError(message, response.status, code);
  }
  return payload;
}
