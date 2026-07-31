import 'server-only';

export const env = {
  internalApiUrl: process.env.INTERNAL_API_URL ?? 'http://localhost:3001',
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? 'ns_session',
};
