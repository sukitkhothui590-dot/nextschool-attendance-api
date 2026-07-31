import { Student, StudentStatus } from '@prisma/client';

export interface StudentResponse {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: StudentStatus;
  createdAt: string;
}

export function mapStudent(student: Student): StudentResponse {
  return {
    id: student.id,
    studentCode: student.studentCode,
    firstName: student.firstName,
    lastName: student.lastName,
    fullName: `${student.firstName} ${student.lastName}`,
    status: student.status,
    createdAt: student.createdAt.toISOString(),
  };
}
