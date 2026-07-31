import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="surface-card max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold">ไม่พบหน้านี้</h1>
        <p className="mt-3 text-sm text-text-secondary">
          หน้าที่คุณเปิดไม่มีในระบบบริหารการเข้าเรียน
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white"
        >
          กลับไปภาพรวม
        </Link>
      </div>
    </main>
  );
}
