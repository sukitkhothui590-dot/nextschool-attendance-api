export type ApiSuccess<T> = { success: true; data: T; meta?: PaginationMeta };
export type ApiFailure = {
  success: false;
  error: { code: string; message: string; details?: unknown; requestId?: string };
};
export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Student = {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
};

export type AttendanceSummary = {
  date: string;
  totalActiveStudents: number;
  present: number;
  late: number;
  absent: number;
  attendanceRate: number;
};

export type AttendanceRecord = {
  id: string;
  student: Pick<Student, 'id' | 'studentCode' | 'fullName'>;
  attendanceDate: string;
  checkedInAt: string;
  status: 'PRESENT' | 'LATE';
};
