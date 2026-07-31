import { StudentsTable } from '@/features/students/students-table';

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.14em] text-secondary uppercase">
          Student directory
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">รายชื่อนักเรียน</h1>
        <p className="mt-2 text-sm text-text-secondary">
          ค้นหา กรองสถานะ และเปิดไปหน้าเช็คชื่อสำหรับนักเรียนที่ใช้งานอยู่
        </p>
      </div>
      <StudentsTable />
    </div>
  );
}
