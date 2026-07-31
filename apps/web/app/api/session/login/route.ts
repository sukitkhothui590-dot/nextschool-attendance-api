import { NextResponse } from 'next/server';
import { z } from 'zod';
import { setSessionToken } from '@/lib/auth/session';
import { env } from '@/lib/env';
import { toThaiError } from '@/lib/i18n/th';

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'กรุณากรอกอีเมลและรหัสผ่านให้ถูกต้อง' },
      },
      { status: 400 },
    );
  }

  const response = await fetch(`${env.internalApiUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(parsed.data),
    cache: 'no-store',
  });
  const payload = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: { access_token?: string };
    error?: { code?: string; message?: string };
  } | null;
  const token = payload?.data?.access_token;
  if (!response.ok || !token) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: payload?.error?.code,
          message: toThaiError(payload?.error, 'เข้าสู่ระบบไม่สำเร็จ'),
        },
      },
      { status: response.status || 500 },
    );
  }
  await setSessionToken(token);
  return NextResponse.json({ success: true, user: { email: parsed.data.email } });
}
