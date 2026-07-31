import { Suspense } from 'react';
import { CheckInForm } from '@/features/attendance/check-in-form';

export default function CheckInPage() {
  return (
    <Suspense fallback={<p className="text-sm text-text-secondary">กำลังโหลดหน้าเช็คชื่อ…</p>}>
      <CheckInForm />
    </Suspense>
  );
}
