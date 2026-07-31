'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(1, 'Password is required.'),
});
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues:
      process.env.NODE_ENV !== 'production'
        ? { email: 'admin@nextschool.local', password: 'Password123!' }
        : undefined,
  });
  async function submit(values: Values) {
    const response = await fetch('/api/session/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const payload = (await response.json()) as { success: boolean; error?: { message: string } };
    if (!response.ok || !payload.success)
      return setError('root', { message: payload.error?.message ?? 'Unable to sign in.' });
    router.replace('/dashboard');
    router.refresh();
  }
  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <label className="block text-sm font-medium">
        Email
        <Input autoComplete="email" className="mt-2" {...register('email')} />
      </label>
      {errors.email && <p className="text-sm text-absent">{errors.email.message}</p>}
      <label className="block text-sm font-medium">
        Password
        <Input
          type="password"
          autoComplete="current-password"
          className="mt-2"
          {...register('password')}
        />
      </label>
      {errors.password && <p className="text-sm text-absent">{errors.password.message}</p>}
      {errors.root && (
        <p role="alert" className="text-sm text-absent">
          {errors.root.message}
        </p>
      )}
      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
      {process.env.NODE_ENV !== 'production' && (
        <p className="rounded-lg bg-orange-50 p-3 text-xs text-text-secondary">
          Demo: admin@nextschool.local / Password123!
        </p>
      )}
    </form>
  );
}
