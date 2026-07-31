import { Injectable } from '@nestjs/common';
import { AttendanceStatus } from '@prisma/client';
import {
  assertSummaryInvariant,
  calculateAbsent,
  calculateAttendanceRate,
  classifyAttendanceStatus,
  toBangkokDate,
} from '../common/time/bangkok-time';
import { SummaryInvariantViolationError } from '../common/errors/app-error';

@Injectable()
export class AttendanceDomainService {
  classify(instant: Date): AttendanceStatus {
    return classifyAttendanceStatus(instant);
  }

  toBusinessDate(instant: Date): string {
    return toBangkokDate(instant);
  }

  buildSummary(input: {
    date: string;
    totalActiveStudents: number;
    present: number;
    late: number;
  }) {
    const absent = calculateAbsent(input.totalActiveStudents, input.present, input.late);

    try {
      assertSummaryInvariant({
        totalActiveStudents: input.totalActiveStudents,
        present: input.present,
        late: input.late,
        absent,
      });
    } catch {
      throw new SummaryInvariantViolationError();
    }

    return {
      date: input.date,
      totalActiveStudents: input.totalActiveStudents,
      present: input.present,
      late: input.late,
      absent,
      attendanceRate: calculateAttendanceRate(input.totalActiveStudents, input.present, input.late),
    };
  }
}
