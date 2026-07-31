import { Injectable } from '@nestjs/common';
import { Attendance, AttendanceStatus, Prisma, Student, StudentStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: {
    studentId: string;
    attendanceDate: Date;
    checkedInAt: Date;
    status: AttendanceStatus;
  }): Promise<Attendance & { student: Student }> {
    return this.prisma.attendance.create({
      data: input,
      include: { student: true },
    });
  }

  findByStudentAndDate(studentId: string, attendanceDate: Date): Promise<Attendance | null> {
    return this.prisma.attendance.findUnique({
      where: {
        studentId_attendanceDate: {
          studentId,
          attendanceDate,
        },
      },
    });
  }

  async getSummaryCounts(attendanceDate: Date): Promise<{
    totalActiveStudents: number;
    present: number;
    late: number;
  }> {
    const [totalActiveStudents, present, late] = await this.prisma.$transaction([
      this.prisma.student.count({ where: { status: StudentStatus.ACTIVE } }),
      this.prisma.attendance.count({
        where: {
          attendanceDate,
          status: AttendanceStatus.PRESENT,
          student: { status: StudentStatus.ACTIVE },
        },
      }),
      this.prisma.attendance.count({
        where: {
          attendanceDate,
          status: AttendanceStatus.LATE,
          student: { status: StudentStatus.ACTIVE },
        },
      }),
    ]);

    return { totalActiveStudents, present, late };
  }

  isUniqueConstraintError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
  }
}
