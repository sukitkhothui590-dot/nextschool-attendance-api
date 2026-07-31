import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <div className="hidden md:sticky md:top-0 md:block md:h-screen">
        <Sidebar />
      </div>
      <div className="min-w-0 flex-1">
        <Topbar />
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
