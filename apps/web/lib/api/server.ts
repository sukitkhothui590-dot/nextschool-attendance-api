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
    const message =
      payload && !payload.success ? payload.error.message : 'The service is unavailable.';
    throw new ApiError(
      message,
      response.status,
      payload && !payload.success ? payload.error.code : undefined,
    );
  }
  return payload;
}
