'use client';

import { AlertTriangle, CheckCircle2, Clock3, Timer } from 'lucide-react';
import { useBangkokClock } from '@/hooks/use-bangkok-clock';
import { phaseCopy, type CheckInPhase } from '@/lib/time/bangkok';
import { cn } from '@/lib/utils';

const phaseStyle: Record<
  CheckInPhase,
  { box: string; badge: string; icon: typeof Clock3 }
> = {
  early: {
    box: 'border-emerald-200 bg-emerald-50 text-present',
    badge: 'bg-emerald-100 text-present',
    icon: CheckCircle2,
  },
  approaching: {
    box: 'border-amber-200 bg-amber-50 text-late',
    badge: 'bg-amber-100 text-late',
    icon: Timer,
  },
  on_time: {
    box: 'border-teal-200 bg-teal-50 text-secondary',
    badge: 'bg-teal-100 text-secondary',
    icon: Clock3,
  },
  late: {
    box: 'border-orange-200 bg-orange-50 text-late',
    badge: 'bg-orange-100 text-late',
    icon: AlertTriangle,
  },
};

export function BusinessClockBanner({ className }: { className?: string }) {
  const clock = useBangkokClock();
  const copy = phaseCopy(clock);
  const style = phaseStyle[clock.phase];
  const Icon = style.icon;

  return (
    <aside
      className={cn(
        'overflow-hidden rounded-xl border px-4 py-3 sm:px-5 sm:py-4',
        style.box,
        className,
      )}
      aria-live="polite"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  style.badge,
                )}
              >
                {copy.badge}
              </span>
              <span className="text-xs opacity-80">โซนเวลา Asia/Bangkok</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-text-primary">{copy.title}</p>
            <p className="mt-1 text-sm text-text-secondary">{copy.hint}</p>
          </div>
        </div>

        <div className="shrink-0 rounded-xl border border-black/5 bg-white/70 px-4 py-2 text-center sm:min-w-[9.5rem]">
          <p className="text-[11px] font-medium tracking-wide text-text-secondary uppercase">
            เวลาปัจจุบัน
          </p>
          <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums tracking-tight text-text-primary">
            {clock.timeLabel}
          </p>
          <p className="text-xs text-text-secondary">ตัดสถานะ {clock.cutoffLabel} น.</p>
        </div>
      </div>

      <p className="mt-3 border-t border-black/5 pt-3 text-xs text-text-secondary">
        กฎธุรกิจ: ไม่เกิน {clock.cutoffLabel}:00 = มาเรียน · หลังจากนี้ = มาสาย ·
        เวลาบันทึกจริงอ้างอิงจากเซิร์ฟเวอร์เท่านั้น นาฬิกานี้ใช้ช่วยดูช่วงเวลา
      </p>
    </aside>
  );
}

/** นาฬิกาแบบกะทัดรัดสำหรับ topbar */
export function TopbarClock() {
  const clock = useBangkokClock();
  const copy = phaseCopy(clock);
  const tone =
    clock.phase === 'late'
      ? 'border-orange-200 bg-orange-50 text-late'
      : clock.phase === 'approaching'
        ? 'border-amber-200 bg-amber-50 text-late'
        : 'border-emerald-200 bg-emerald-50 text-present';

  return (
    <div
      className={cn(
        'hidden items-center gap-2 rounded-xl border px-3 py-1.5 sm:flex',
        tone,
      )}
      title={copy.title}
    >
      <Clock3 size={14} aria-hidden="true" />
      <div className="leading-tight">
        <p className="font-mono text-sm font-bold tabular-nums text-text-primary">
          {clock.timeLabel}
        </p>
        <p className="max-w-[9rem] truncate text-[10px] font-medium">{copy.badge}</p>
      </div>
    </div>
  );
}
