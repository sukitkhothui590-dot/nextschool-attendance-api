import { PrismaClient, AttendanceStatus, StudentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { DateTime } from 'luxon';

const prisma = new PrismaClient();

const BANGKOK = 'Asia/Bangkok';

const STUDENTS: Array<{
  studentCode: string;
  firstName: string;
  lastName: string;
  status: StudentStatus;
}> = [
  { studentCode: 'NS0001', firstName: 'Somchai', lastName: 'Suksan', status: StudentStatus.ACTIVE },
  { studentCode: 'NS0002', firstName: 'Suda', lastName: 'Chaiyo', status: StudentStatus.ACTIVE },
  { studentCode: 'NS0003', firstName: 'Anan', lastName: 'Wongsa', status: StudentStatus.ACTIVE },
  { studentCode: 'NS0004', firstName: 'Nattapong', lastName: 'Keaw', status: StudentStatus.ACTIVE },
  { studentCode: 'NS0005', firstName: 'Pimchanok', lastName: 'Siri', status: StudentStatus.ACTIVE },
  {
    studentCode: 'NS0006',
    firstName: 'Kittisak',
    lastName: 'Prasert',
    status: StudentStatus.ACTIVE,
  },
  { studentCode: 'NS0007', firstName: 'Emily', lastName: 'Carter', status: StudentStatus.ACTIVE },
  { studentCode: 'NS0008', firstName: 'Daniel', lastName: 'Nguyen', status: StudentStatus.ACTIVE },
  { studentCode: 'NS0009', firstName: 'Aisha', lastName: 'Rahman', status: StudentStatus.ACTIVE },
  { studentCode: 'NS0010', firstName: 'Hiroshi', lastName: 'Tanaka', status: StudentStatus.ACTIVE },
  { studentCode: 'NS0011', firstName: 'Malee', lastName: 'Phan', status: StudentStatus.ACTIVE },
  { studentCode: 'NS0012', firstName: 'Worawut', lastName: 'Dee', status: StudentStatus.ACTIVE },
  {
    studentCode: 'NS0013',
    firstName: 'Chayanit',
    lastName: 'Boonsri',
    status: StudentStatus.ACTIVE,
  },
  { studentCode: 'NS0014', firstName: 'Oliver', lastName: 'Brooks', status: StudentStatus.ACTIVE },
  { studentCode: 'NS0015', firstName: 'Sofia', lastName: 'Martinez', status: StudentStatus.ACTIVE },
  { studentCode: 'NS0016', firstName: 'Thanakorn', lastName: 'Rit', status: StudentStatus.ACTIVE },
  { studentCode: 'NS0017', firstName: 'Nicha', lastName: 'Arun', status: StudentStatus.ACTIVE },
  { studentCode: 'NS0018', firstName: 'James', lastName: 'Patel', status: StudentStatus.ACTIVE },
  { studentCode: 'NS0019', firstName: 'Ratchanok', lastName: 'Lim', status: StudentStatus.ACTIVE },
  { studentCode: 'NS0020', firstName: 'Arthit', lastName: 'Sombat', status: StudentStatus.ACTIVE },
  {
    studentCode: 'NS0021',
    firstName: 'Patcharin',
    lastName: 'Yim',
    status: StudentStatus.INACTIVE,
  },
  {
    studentCode: 'NS0022',
    firstName: 'Lucas',
    lastName: 'Andersen',
    status: StudentStatus.INACTIVE,
  },
  { studentCode: 'NS0023', firstName: 'Mina', lastName: 'Choi', status: StudentStatus.INACTIVE },
  { studentCode: 'NS0024', firstName: 'Surasak', lastName: 'Tong', status: StudentStatus.INACTIVE },
];

/** Deterministic demo attendance for current Bangkok date: NS0001-NS0012 PRESENT, NS0013-NS0015 LATE, NS0016-NS0020 absent. */
const PRESENT_CODES = [
  'NS0001',
  'NS0002',
  'NS0003',
  'NS0004',
  'NS0005',
  'NS0006',
  'NS0007',
  'NS0008',
  'NS0009',
  'NS0010',
  'NS0011',
  'NS0012',
];
const LATE_CODES = ['NS0013', 'NS0014', 'NS0015'];

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@nextschool.local' },
    update: { passwordHash },
    create: {
      email: 'admin@nextschool.local',
      passwordHash,
    },
  });

  for (const student of STUDENTS) {
    await prisma.student.upsert({
      where: { studentCode: student.studentCode },
      update: {
        firstName: student.firstName,
        lastName: student.lastName,
        status: student.status,
      },
      create: student,
    });
  }

  const bangkokToday = DateTime.now().setZone(BANGKOK).toISODate()!;
  const [year, month, day] = bangkokToday.split('-').map(Number);
  const attendanceDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));

  const presentAt = DateTime.fromObject(
    { year, month, day, hour: 7, minute: 45, second: 0 },
    { zone: BANGKOK },
  ).toJSDate();

  const lateAt = DateTime.fromObject(
    { year, month, day, hour: 8, minute: 45, second: 0 },
    { zone: BANGKOK },
  ).toJSDate();

  for (const code of PRESENT_CODES) {
    const student = await prisma.student.findUniqueOrThrow({ where: { studentCode: code } });
    await prisma.attendance.upsert({
      where: {
        studentId_attendanceDate: {
          studentId: student.id,
          attendanceDate,
        },
      },
      update: {
        status: AttendanceStatus.PRESENT,
        checkedInAt: presentAt,
      },
      create: {
        studentId: student.id,
        attendanceDate,
        checkedInAt: presentAt,
        status: AttendanceStatus.PRESENT,
      },
    });
  }

  for (const code of LATE_CODES) {
    const student = await prisma.student.findUniqueOrThrow({ where: { studentCode: code } });
    await prisma.attendance.upsert({
      where: {
        studentId_attendanceDate: {
          studentId: student.id,
          attendanceDate,
        },
      },
      update: {
        status: AttendanceStatus.LATE,
        checkedInAt: lateAt,
      },
      create: {
        studentId: student.id,
        attendanceDate,
        checkedInAt: lateAt,
        status: AttendanceStatus.LATE,
      },
    });
  }

  // Ensure demo absent students have no attendance for today (idempotent cleanup for smoke resets).
  const absentCodes = ['NS0016', 'NS0017', 'NS0018', 'NS0019', 'NS0020'];
  for (const code of absentCodes) {
    const student = await prisma.student.findUniqueOrThrow({ where: { studentCode: code } });
    // Leave as-is except smoke may recreate; seed does not delete historical other dates.
    void student;
  }

  console.log('Seed completed.');
  console.log('Admin: admin@nextschool.local / Password123!');
  console.log('Demo students: check-in NS0020 | duplicate NS0001 | inactive NS0021');
  console.log(`Bangkok business date seeded: ${bangkokToday}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
