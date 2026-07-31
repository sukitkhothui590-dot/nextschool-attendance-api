import { PrismaClient, AttendanceStatus, StudentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { DateTime } from 'luxon';

const prisma = new PrismaClient();

const BANGKOK = 'Asia/Bangkok';

/**
 * รหัสนักเรียน 10 หลัก: YYNNNN#####
 * - YY = ปี พ.ศ. 2 หลักท้าย (เช่น 2569 → 69)
 * - ######## = ลำดับรันนิ่ง 8 หลัก
 */
function studentCode(beYearShort: number, running: number): string {
  if (beYearShort < 0 || beYearShort > 99) {
    throw new Error(`Invalid BE year short: ${beYearShort}`);
  }
  if (running < 1 || running > 99_999_999) {
    throw new Error(`Invalid running number: ${running}`);
  }
  return `${String(beYearShort).padStart(2, '0')}${String(running).padStart(8, '0')}`;
}

type SeedStudent = {
  studentCode: string;
  firstName: string;
  lastName: string;
  status: StudentStatus;
};

function cohort(
  beYearShort: number,
  rows: Array<{ running: number; firstName: string; lastName: string; status?: StudentStatus }>,
): SeedStudent[] {
  return rows.map((row) => ({
    studentCode: studentCode(beYearShort, row.running),
    firstName: row.firstName,
    lastName: row.lastName,
    status: row.status ?? StudentStatus.ACTIVE,
  }));
}

/** ปีการศึกษาปัจจุบัน พ.ศ. 2569 และรุ่นก่อนหน้า เพื่อสาธิตค้นหาหลายปี */
const STUDENTS: SeedStudent[] = [
  // —— ปี 69 (พ.ศ. 2569) ——
  ...cohort(69, [
    { running: 1, firstName: 'Somchai', lastName: 'Suksan' },
    { running: 2, firstName: 'Suda', lastName: 'Chaiyo' },
    { running: 3, firstName: 'Anan', lastName: 'Wongsa' },
    { running: 4, firstName: 'Nattapong', lastName: 'Keaw' },
    { running: 5, firstName: 'Pimchanok', lastName: 'Siri' },
    { running: 6, firstName: 'Kittisak', lastName: 'Prasert' },
    { running: 7, firstName: 'Emily', lastName: 'Carter' },
    { running: 8, firstName: 'Daniel', lastName: 'Nguyen' },
    { running: 9, firstName: 'Aisha', lastName: 'Rahman' },
    { running: 10, firstName: 'Hiroshi', lastName: 'Tanaka' },
    { running: 11, firstName: 'Malee', lastName: 'Phan' },
    { running: 12, firstName: 'Worawut', lastName: 'Dee' },
    { running: 13, firstName: 'Chayanit', lastName: 'Boonsri' },
    { running: 14, firstName: 'Oliver', lastName: 'Brooks' },
    { running: 15, firstName: 'Sofia', lastName: 'Martinez' },
    { running: 16, firstName: 'Thanakorn', lastName: 'Rit' },
    { running: 17, firstName: 'Nicha', lastName: 'Arun' },
    { running: 18, firstName: 'James', lastName: 'Patel' },
    { running: 19, firstName: 'Ratchanok', lastName: 'Lim' },
    { running: 20, firstName: 'Arthit', lastName: 'Sombat' },
    { running: 21, firstName: 'Patcharin', lastName: 'Yim', status: StudentStatus.INACTIVE },
    { running: 22, firstName: 'Lucas', lastName: 'Andersen', status: StudentStatus.INACTIVE },
  ]),
  // —— ปี 68 (พ.ศ. 2568) ——
  ...cohort(68, [
    { running: 1, firstName: 'Kanokwan', lastName: 'Saetang' },
    { running: 2, firstName: 'Peerapat', lastName: 'Chai' },
    { running: 3, firstName: 'Sirilak', lastName: 'Wong' },
    { running: 4, firstName: 'Thanawat', lastName: 'Inthira' },
    { running: 5, firstName: 'Busaba', lastName: 'Nil' },
    { running: 6, firstName: 'Noppadol', lastName: 'Kaew' },
    { running: 7, firstName: 'Jirawan', lastName: 'Petch' },
    { running: 8, firstName: 'Methee', lastName: 'Sook', status: StudentStatus.INACTIVE },
  ]),
  // —— ปี 67 (พ.ศ. 2567) ——
  ...cohort(67, [
    { running: 1, firstName: 'Apinya', lastName: 'Roj' },
    { running: 2, firstName: 'Chatchai', lastName: 'Bun' },
    { running: 3, firstName: 'Darunee', lastName: 'Thong' },
    { running: 4, firstName: 'Ekkachai', lastName: 'Manee' },
    { running: 5, firstName: 'Fahsai', lastName: 'Orn', status: StudentStatus.INACTIVE },
  ]),
];

/** Demo: ปี 69 ลำดับ 1–12 มาเรียน, 13–15 มาสาย, 16–20 ยังไม่เช็คชื่อ */
const PRESENT_CODES = Array.from({ length: 12 }, (_, i) => studentCode(69, i + 1));
const LATE_CODES = [13, 14, 15].map((n) => studentCode(69, n));
const ABSENT_DEMO_CODES = [16, 17, 18, 19, 20].map((n) => studentCode(69, n));

const DEMO_CHECK_IN = studentCode(69, 20);
const DEMO_DUPLICATE = studentCode(69, 1);
const DEMO_INACTIVE = studentCode(69, 21);

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

  // เคลียร์ข้อมูลนักเรียนเก่า (เช่น NS00xx) แล้วใส่รหัสรูปแบบใหม่ทั้งชุด
  await prisma.attendance.deleteMany();
  await prisma.student.deleteMany();

  for (const student of STUDENTS) {
    await prisma.student.create({ data: student });
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
    await prisma.attendance.create({
      data: {
        studentId: student.id,
        attendanceDate,
        checkedInAt: presentAt,
        status: AttendanceStatus.PRESENT,
      },
    });
  }

  for (const code of LATE_CODES) {
    const student = await prisma.student.findUniqueOrThrow({ where: { studentCode: code } });
    await prisma.attendance.create({
      data: {
        studentId: student.id,
        attendanceDate,
        checkedInAt: lateAt,
        status: AttendanceStatus.LATE,
      },
    });
  }

  // Ensure absent demo students have no row today (already true after deleteMany).
  void ABSENT_DEMO_CODES;

  console.log('Seed completed.');
  console.log('Admin: admin@nextschool.local / Password123!');
  console.log(
    `Student code format: YY######## (10 digits, BE year + running). Demo years: 69 / 68 / 67`,
  );
  console.log(
    `Demo students: check-in ${DEMO_CHECK_IN} | duplicate ${DEMO_DUPLICATE} | inactive ${DEMO_INACTIVE}`,
  );
  console.log(`Bangkok business date seeded: ${bangkokToday}`);
  console.log(`Total students: ${STUDENTS.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
