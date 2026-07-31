import { redirect } from 'next/navigation';
import { LoginForm } from '@/features/auth/login-form';
import { getSessionToken } from '@/lib/auth/session';

export default async function LoginPage() {
  if (await getSessionToken()) redirect('/dashboard');
  return (
    <main className="grid min-h-screen place-items-center p-5">
      <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 shadow-sm">
        <p className="text-xl font-bold text-primary">Attendance Operations</p>
        <p className="mt-1 text-sm text-text-secondary">School Administration Console</p>
        <h1 className="mt-8 text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to manage daily attendance.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
