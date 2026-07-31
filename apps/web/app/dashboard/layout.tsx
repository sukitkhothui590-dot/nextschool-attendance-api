import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getSessionToken } from '@/lib/auth/session';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!(await getSessionToken())) redirect('/login');
  return <DashboardShell>{children}</DashboardShell>;
}
