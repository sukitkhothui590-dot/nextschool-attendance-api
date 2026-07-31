import { redirect } from 'next/navigation';
import { LoginForm } from '@/features/auth/login-form';
import { getSessionToken } from '@/lib/auth/session';

export default async function LoginPage() {
  if (await getSessionToken()) redirect('/dashboard');

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#1c1917] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(232,93,4,0.45), transparent 35%), radial-gradient(circle at 80% 70%, rgba(15,118,110,0.35), transparent 40%)',
          }}
        />
        <div className="relative">
          <p className="text-xs font-semibold tracking-[0.18em] text-orange-300 uppercase">
            NextSchool
          </p>
          <h1 className="mt-6 max-w-md text-4xl font-bold leading-tight">
            Attendance
            <span className="text-orange-400"> Operations</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-300">
            คอนโซลบริหารการเข้าเรียนสำหรับผู้ดูแลโรงเรียน ใช้ REST API เป็นแหล่งความจริง
            และแสดงผลเพื่อสาธิต workflow หลักอย่างชัดเจน
          </p>
        </div>
        <div className="relative grid gap-3 text-sm text-stone-300">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            เช็คชื่อหลัง 08:30 น. ตามเวลา Bangkok จะถูกบันทึกเป็น <strong>มาสาย</strong>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            API ทดสอบได้โดยตรงผ่าน Swagger ที่พอร์ต 3001 โดยไม่ต้องพึ่งแดชบอร์ด
          </div>
        </div>
      </section>

      <section className="grid place-items-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-xs font-semibold tracking-[0.16em] text-secondary uppercase">
              NextSchool
            </p>
            <p className="mt-2 text-2xl font-bold text-text-primary">
              Attendance <span className="text-primary">Operations</span>
            </p>
          </div>
          <div className="surface-card p-7 md:p-8">
            <h2 className="text-2xl font-bold text-text-primary">เข้าสู่ระบบ</h2>
            <p className="mt-2 text-sm text-text-secondary">
              จัดการสรุปการเข้าเรียนและบันทึกเช็คชื่อประจำวัน
            </p>
            <div className="mt-7">
              <LoginForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
