'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="surface-card max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold">เกิดข้อผิดพลาด</h1>
        <p className="mt-3 text-sm text-text-secondary">
          หน้านี้โหลดไม่สำเร็จ คุณสามารถลองใหม่อีกครั้งได้
        </p>
        <Button className="mt-6" type="button" onClick={reset}>
          ลองใหม่
        </Button>
      </div>
    </main>
  );
}
