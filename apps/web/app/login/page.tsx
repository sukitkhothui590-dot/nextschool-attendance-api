import { redirect } from 'next/navigation';
import { LoginForm } from '@/features/auth/login-form';
import { getSessionToken } from '@/lib/auth/session';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  if (await getSessionToken()) redirect('/dashboard');
  const params = await searchParams;
  const notice =
    params.message === 'signed-out'
      ? 'ออกจากระบบเรียบร้อยแล้ว'
      : params.message === 'expired'
        ? 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'
        : null;

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
            ระบบบริหาร
            <span className="text-orange-400"> การเข้าเรียน</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-300">
            คอนโซลสำหรับผู้ดูแลโรงเรียน ใช้ดูสรุปประจำวัน ค้นหานักเรียน และบันทึกเช็คชื่อ
            โดยอ้างอิงข้อมูลจาก REST API โดยตรง
          </p>
        </div>
        <ol className="relative grid gap-3 text-sm text-stone-300">
          <li className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            1) เข้าสู่ระบบด้วยบัญชีผู้ดูแล
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            2) ดูภาพรวมวันนี้ แล้วเลือกนักเรียนที่ยังไม่เช็คชื่อ
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            3) บันทึกเช็คชื่อ — หลัง 08:30 น. ตามเวลา กรุงเทพฯ = มาสาย
          </li>
        </ol>
      </section>

      <section className="grid place-items-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-xs font-semibold tracking-[0.16em] text-secondary uppercase">
              NextSchool
            </p>
            <p className="mt-2 text-2xl font-bold text-text-primary">
              ระบบบริหาร <span className="text-primary">การเข้าเรียน</span>
            </p>
          </div>
          <div className="surface-card p-7 md:p-8">
            <h2 className="text-2xl font-bold text-text-primary">เข้าสู่ระบบ</h2>
            <p className="mt-2 text-sm text-text-secondary">
              เริ่มจากภาพรวม แล้วไปเช็คชื่อได้ในไม่กี่ขั้นตอน
            </p>
            {notice && (
              <p className="mt-4 rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm text-text-secondary">
                {notice}
              </p>
            )}
            <div className="mt-7">
              <LoginForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
