'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, LayoutDashboard, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/students', label: 'Students', icon: Users },
  { href: '/dashboard/check-in', label: 'Check in', icon: CalendarCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface p-5">
      <Link href="/dashboard" className="mb-10 block">
        <p className="text-lg font-bold text-primary">Attendance Operations</p>
        <p className="mt-1 text-xs text-text-secondary">School Administration Console</p>
      </Link>
      <nav aria-label="Main navigation" className="space-y-1">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-orange-50 hover:text-primary',
              pathname === href && 'bg-orange-50 text-primary',
            )}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
