'use client';

import { LogOut, Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from './sidebar';

function bangkokDateLabel() {
  return new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

const titles: Record<string, string> = {
  '/dashboard': 'ภาพรวมประจำวัน',
  '/dashboard/students': 'รายชื่อนักเรียน',
  '/dashboard/check-in': 'บันทึกเช็คชื่อ',
};

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  async function logout() {
    await fetch('/api/session/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4 md:px-8">
          <button
            type="button"
            aria-label="เปิดเมนูนำทาง"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-surface md:hidden"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary md:text-base">
              {titles[pathname] ?? 'Attendance Operations'}
            </p>
            <p className="truncate text-xs text-text-secondary">
              วันธุรกิจ Bangkok · {bangkokDateLabel()}
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-text-secondary transition hover:border-primary/30 hover:text-primary"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="ปิดเมนูนำทาง"
            className="absolute inset-0 bg-black/35"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-full w-[min(20rem,88vw)] flex-col overflow-hidden bg-surface shadow-2xl">
            <div className="absolute right-3 top-3 z-10">
              <button
                type="button"
                aria-label="ปิดเมนูนำทาง"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface"
              >
                <X size={16} />
              </button>
            </div>
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
