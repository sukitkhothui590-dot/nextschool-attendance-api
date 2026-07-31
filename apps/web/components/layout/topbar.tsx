'use client';

import { LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  async function logout() {
    await fetch('/api/session/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }
  const links = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/students', label: 'Students' },
    { href: '/dashboard/check-in', label: 'Check in' },
  ];
  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-5 md:px-8">
        <button
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
          className="mr-3 md:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="md:hidden text-sm font-bold text-primary">Attendance Operations</div>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm text-text-secondary sm:block">
            School Administration Console
          </span>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <nav className="relative h-full w-72 bg-surface p-5 shadow-xl">
            <button
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="ml-auto block"
            >
              <X size={20} />
            </button>
            <p className="mt-6 text-lg font-bold text-primary">Attendance Operations</p>
            <div className="mt-7 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${pathname === link.href ? 'bg-orange-50 text-primary' : 'text-text-secondary'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
