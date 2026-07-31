import { Inject, Injectable } from '@nestjs/common';
import { StudentStatus } from '@prisma/client';
import {
  AttendanceAlreadyExistsError,
  StudentInactiveError,
  StudentNotFoundError,
} from '../common/errors/app-error';
import { Clock } from '../common/time/clock';
import { formatDateOnly, toDatabaseDateOnly } from '../common/time/bangkok-time';
import { StudentsRepository } from '../students/students.repository';
import { AttendanceDomainService } from './attendance-domain.service';
import { AttendanceRepository } from './attendance.repository';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly studentsRepository: StudentsRepository,
    private readonly domain: AttendanceDomainService,
    @Inject(Clock) private readonly clock: Clock,
  ) {}

  async checkIn(dto: CreateAttendanceDto) {
    const now = this.clock.now();
    const businessDate = this.domain.toBusinessDate(now);
    const attendanceDate = toDatabaseDateOnly(businessDate);
    const status = this.domain.classify(now);

    const student = await this.studentsRepository.findById(dto.studentId);
    if (!student) {
      throw new StudentNotFoundError();
    }
    if (student.status !== StudentStatus.ACTIVE) {
      throw new StudentInactiveError();
    }

    const existing = await this.attendanceRepository.findByStudentAndDate(
      student.id,
      attendanceDate,
    );
    if (existing) {
      throw new AttendanceAlreadyExistsError();
    }

    try {
      const created = await this.attendanceRepository.create({
        studentId: student.id,
        attendanceDate,
        checkedInAt: now,
        status,
      });

      return {
        id: created.id,
        student: {
          id: created.student.id,
          studentCode: created.student.studentCode,
          fullName: `${created.student.firstName} ${created.student.lastName}`,
        },
        attendanceDate: formatDateOnly(created.attendanceDate),
        checkedInAt: created.checkedInAt.toISOString(),
        status: created.status,
      };
    } catch (error) {
      if (this.attendanceRepository.isUniqueConstraintError(error)) {
        throw new AttendanceAlreadyExistsError();
      }
      throw error;
    }
  }

  async getSummary(date?: string) {
    const businessDate = date ?? this.domain.toBusinessDate(this.clock.now());
    const attendanceDate = toDatabaseDateOnly(businessDate);
    const counts = await this.attendanceRepository.getSummaryCounts(attendanceDate);
    return this.domain.buildSummary({
      date: businessDate,
      ...counts,
    });
  }
}
