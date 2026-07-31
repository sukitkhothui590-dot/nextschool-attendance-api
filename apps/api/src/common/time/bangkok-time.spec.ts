import {
  assertSummaryInvariant,
  calculateAbsent,
  classifyAttendanceStatus,
  formatDateOnly,
  isValidDateOnly,
  toBangkokDate,
  toDatabaseDateOnly,
} from './bangkok-time';
import { AttendanceStatus } from '@prisma/client';
import { DateTime } from 'luxon';

describe('bangkok-time', () => {
  it('classifies 08:29:59.999 Bangkok as PRESENT', () => {
    const instant = DateTime.fromISO('2026-07-31T08:29:59.999', {
      zone: 'Asia/Bangkok',
    }).toJSDate();
    expect(classifyAttendanceStatus(instant)).toBe(AttendanceStatus.PRESENT);
  });

  it('classifies 08:30:00.000 Bangkok as PRESENT', () => {
    const instant = DateTime.fromISO('2026-07-31T08:30:00.000', {
      zone: 'Asia/Bangkok',
    }).toJSDate();
    expect(classifyAttendanceStatus(instant)).toBe(AttendanceStatus.PRESENT);
  });

  it('classifies 08:30:00.001 Bangkok as LATE', () => {
    const instant = DateTime.fromISO('2026-07-31T08:30:00.001', {
      zone: 'Asia/Bangkok',
    }).toJSDate();
    expect(classifyAttendanceStatus(instant)).toBe(AttendanceStatus.LATE);
  });

  it('uses Bangkok calendar date when UTC day differs', () => {
    // 2026-07-31 00:30 Bangkok == 2026-07-30 17:30 UTC
    const instant = DateTime.fromISO('2026-07-31T00:30:00', {
      zone: 'Asia/Bangkok',
    }).toJSDate();
    expect(toBangkokDate(instant)).toBe('2026-07-31');
    expect(instant.toISOString().startsWith('2026-07-30')).toBe(true);
  });

  it('handles Bangkok midnight rollover', () => {
    const before = DateTime.fromISO('2026-07-31T23:59:59', {
      zone: 'Asia/Bangkok',
    }).toJSDate();
    const after = DateTime.fromISO('2026-08-01T00:00:00', {
      zone: 'Asia/Bangkok',
    }).toJSDate();
    expect(toBangkokDate(before)).toBe('2026-07-31');
    expect(toBangkokDate(after)).toBe('2026-08-01');
  });

  it('accepts leap-year date and rejects impossible dates', () => {
    expect(isValidDateOnly('2024-02-29')).toBe(true);
    expect(isValidDateOnly('2025-02-29')).toBe(false);
    expect(isValidDateOnly('2026-13-01')).toBe(false);
    expect(isValidDateOnly('2026-07-32')).toBe(false);
  });

  it('converts date-only to stable database DATE representation', () => {
    const dbDate = toDatabaseDateOnly('2026-07-31');
    expect(formatDateOnly(dbDate)).toBe('2026-07-31');
  });

  it('calculates absent and enforces summary invariant', () => {
    expect(calculateAbsent(20, 12, 3)).toBe(5);
    expect(() =>
      assertSummaryInvariant({
        totalActiveStudents: 20,
        present: 12,
        late: 3,
        absent: 5,
      }),
    ).not.toThrow();
    expect(() =>
      assertSummaryInvariant({
        totalActiveStudents: 20,
        present: 12,
        late: 3,
        absent: 4,
      }),
    ).toThrow('SUMMARY_INVARIANT_VIOLATION');
  });
});
