import { CalendarCheck, ExternalLink, LayoutDashboard, Users } from 'lucide-react';

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/dashboard/students', label: 'นักเรียน', icon: Users },
  { href: '/dashboard/check-in', label: 'เช็คชื่อ', icon: CalendarCheck },
] as const;

export const DOCS_LINK = {
  href: 'http://localhost:3001/docs',
  label: 'เอกสาร API',
  icon: ExternalLink,
};
