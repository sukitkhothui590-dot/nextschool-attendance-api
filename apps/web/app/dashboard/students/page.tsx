import { Suspense } from 'react';
import { StudentsTable } from '@/features/students/students-table';

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.08em] text-secondary">ขั้นตอนที่ 2</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">รายชื่อนักเรียน</h1>
        <p className="mt-2 text-sm text-text-secondary">
          ค้นหาหรือกรองสถานะ แล้วกด “เช็คชื่อคนนี้” เพื่อไปหน้าบันทึกพร้อมเลือกนักเรียนให้แล้ว
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-text-secondary">กำลังโหลดตาราง…</p>}>
        <StudentsTable />
      </Suspense>
    </div>
  );
}
