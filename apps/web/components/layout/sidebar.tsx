'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { DOCS_LINK, NAV_ITEMS } from './nav-items';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[17.5rem] shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-5 py-6">
        <Link href="/dashboard" onClick={onNavigate} className="block">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-secondary uppercase">
            NextSchool
          </p>
          <p className="mt-2 text-lg font-bold leading-tight text-text-primary">
            Attendance
            <span className="text-primary"> Operations</span>
          </p>
          <p className="mt-1 text-xs text-text-secondary">คอนโซลบริหารการเข้าเรียน</p>
        </Link>
      </div>

      <nav aria-label="เมนูหลัก" className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-text-secondary transition',
                'hover:bg-surface-muted hover:text-text-primary',
                active && 'border-border bg-surface-muted text-text-primary shadow-sm',
              )}
            >
              <span
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-lg bg-surface-muted text-text-secondary',
                  active && 'bg-orange-50 text-primary',
                )}
              >
                <Icon size={16} aria-hidden="true" />
              </span>
              <span className="flex-1">{label}</span>
              {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <a
          href={DOCS_LINK.href}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-muted hover:text-primary"
        >
          <DOCS_LINK.icon size={16} aria-hidden="true" />
          {DOCS_LINK.label}
        </a>
        <p className="mt-3 px-3 text-[11px] leading-relaxed text-text-secondary">
          API เป็นแหล่งความจริงหลัก แดชบอร์ดนี้เป็น reference client สำหรับสาธิตเท่านั้น
        </p>
      </div>
    </aside>
  );
}
