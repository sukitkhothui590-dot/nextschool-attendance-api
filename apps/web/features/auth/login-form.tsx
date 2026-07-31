'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
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
    if (!response.ok || !payload.success) {
      return setError('root', {
        message: payload.error?.message ?? 'เข้าสู่ระบบไม่สำเร็จ',
      });
    }
    router.replace('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <label className="block text-sm font-medium">
        อีเมล
        <Input autoComplete="email" className="mt-2" {...register('email')} />
      </label>
      {errors.email && <p className="text-sm text-absent">{errors.email.message}</p>}

      <label className="block text-sm font-medium">
        รหัสผ่าน
        <div className="relative mt-2">
          <Input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="pr-11"
            {...register('password')}
          />
          <button
            type="button"
            aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            onClick={() => setShowPassword((value) => !value)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-text-secondary"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </label>
      {errors.password && <p className="text-sm text-absent">{errors.password.message}</p>}
      {errors.root && (
        <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-absent">
          {errors.root.message}
        </p>
      )}

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
      </Button>

      {process.env.NODE_ENV !== 'production' && (
        <p className="rounded-xl border border-border bg-surface-muted px-3 py-3 text-xs text-text-secondary">
          บัญชีทดสอบ: <span className="font-medium text-text-primary">admin@nextschool.local</span> /{' '}
          <span className="font-medium text-text-primary">Password123!</span>
        </p>
      )}
    </form>
  );
}
