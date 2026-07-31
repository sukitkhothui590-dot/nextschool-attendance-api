import 'server-only';

import { cookies } from 'next/headers';
import { env } from '@/lib/env';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60,
};

export async function getSessionToken() {
  return (await cookies()).get(env.sessionCookieName)?.value;
}

export async function setSessionToken(token: string) {
  (await cookies()).set(env.sessionCookieName, token, cookieOptions);
}

export async function clearSession() {
  (await cookies()).set(env.sessionCookieName, '', {
    ...cookieOptions,
    maxAge: 0,
  });
}
