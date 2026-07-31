import { DateTime } from 'luxon';
import { AttendanceStatus } from '@prisma/client';

export const BANGKOK_ZONE = 'Asia/Bangkok';
export const ATTENDANCE_CUTOFF_HOUR = 8;
export const ATTENDANCE_CUTOFF_MINUTE = 30;

export type DateOnlyString = string;

export function toBangkokDateTime(instant: Date): DateTime {
  return DateTime.fromJSDate(instant, { zone: 'utc' }).setZone(BANGKOK_ZONE);
}

/** Returns Bangkok calendar date as YYYY-MM-DD. */
export function toBangkokDate(instant: Date): DateOnlyString {
  const bangkok = toBangkokDateTime(instant);
  return bangkok.toISODate()!;
}

/**
 * Convert a Bangkok business date string to a Date suitable for Prisma @db.Date.
 * Uses UTC noon to avoid host-timezone midnight edge cases when drivers coerce dates.
 */
export function toDatabaseDateOnly(dateOnly: DateOnlyString): Date {
  if (!isValidDateOnly(dateOnly)) {
    throw new Error(`Invalid date-only value: ${dateOnly}`);
  }
  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
}

export function formatDateOnly(date: Date): DateOnlyString {
  // Prisma DATE values are typically midnight UTC representing the calendar date.
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = DateTime.fromISO(value, { zone: BANGKOK_ZONE });
  return parsed.isValid && parsed.toISODate() === value;
}

/**
 * PRESENT at or before 08:30:00.000 Bangkok (inclusive).
 * LATE after 08:30:00.000 Bangkok.
 */
export function classifyAttendanceStatus(instant: Date): AttendanceStatus {
  const bangkok = toBangkokDateTime(instant);
  const cutoff = bangkok.set({
    hour: ATTENDANCE_CUTOFF_HOUR,
    minute: ATTENDANCE_CUTOFF_MINUTE,
    second: 0,
    millisecond: 0,
  });

  if (bangkok.toMillis() <= cutoff.toMillis()) {
    return AttendanceStatus.PRESENT;
  }
  return AttendanceStatus.LATE;
}

export function calculateAbsent(
  totalActiveStudents: number,
  present: number,
  late: number,
): number {
  return totalActiveStudents - present - late;
}

export function assertSummaryInvariant(input: {
  totalActiveStudents: number;
  present: number;
  late: number;
  absent: number;
}): void {
  const sum = input.present + input.late + input.absent;
  if (sum !== input.totalActiveStudents || input.absent < 0) {
    throw new Error('SUMMARY_INVARIANT_VIOLATION');
  }
}

export function calculateAttendanceRate(
  totalActiveStudents: number,
  present: number,
  late: number,
): number {
  if (totalActiveStudents === 0) {
    return 0;
  }
  return Math.round(((present + late) / totalActiveStudents) * 100);
}
