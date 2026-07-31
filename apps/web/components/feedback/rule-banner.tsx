import { Clock3 } from 'lucide-react';

export function RuleBanner() {
  return (
    <aside className="flex items-start gap-3 rounded-xl border border-[#d7ebe8] bg-[#f2fbfa] px-4 py-3 text-sm text-secondary">
      <Clock3 className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
      <p>
        <span className="font-semibold">กฎเวลาธุรกิจ Bangkok:</span> เช็คชื่อไม่เกิน
        08:30:00 นับว่า <span className="font-semibold">มาเรียน</span> — หลังเวลานี้ถือว่า{' '}
        <span className="font-semibold">มาสาย</span> เวลาถูกกำหนดโดยเซิร์ฟเวอร์เท่านั้น
      </p>
    </aside>
  );
}
