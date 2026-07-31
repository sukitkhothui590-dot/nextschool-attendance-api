import { redirect } from 'next/navigation';
import { getSessionToken } from '@/lib/auth/session';

export default async function Home() {
  redirect((await getSessionToken()) ? '/dashboard' : '/login');
}
