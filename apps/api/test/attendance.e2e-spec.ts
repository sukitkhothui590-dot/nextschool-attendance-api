import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';
import { App } from 'supertest/types';
import { createTestApp, login, seedMinimalFixtures } from './helpers/test-app';
import { toDatabaseDateOnly } from '../src/common/time/bangkok-time';

describe('Attendance (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let http: App;
  let token: string;
  let fixtures: Awaited<ReturnType<typeof seedMinimalFixtures>>;

  const fixedPresent = DateTime.fromISO('2026-07-31T08:29:59.999', {
    zone: 'Asia/Bangkok',
  }).toJSDate();

  beforeAll(async () => {
    ({ app, prisma, http } = await createTestApp(fixedPresent));
    fixtures = await seedMinimalFixtures(prisma);
    token = await login(http);
  });

  afterAll(async () => {
    if (app) await app.close();
    if (prisma) await prisma.$disconnect();
  });

  it('checks in an active student as PRESENT before cutoff', async () => {
    const res = await request(http)
      .post('/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: fixtures.activeStudentId })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PRESENT');
    expect(res.body.data.attendanceDate).toBe('2026-07-31');
  });

  it('rejects inactive and unknown students without creating rows', async () => {
    const before = await prisma.attendance.count();

    const inactive = await request(http)
      .post('/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: fixtures.inactiveStudentId })
      .expect(422);
    expect(inactive.body.error.code).toBe('STUDENT_INACTIVE');

    const unknown = await request(http)
      .post('/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: '00000000-0000-4000-8000-000000000099' })
      .expect(404);
    expect(unknown.body.error.code).toBe('STUDENT_NOT_FOUND');

    expect(await prisma.attendance.count()).toBe(before);
  });

  it('rejects invalid UUID, empty body, and client-supplied checkedInAt', async () => {
    await request(http)
      .post('/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: 'not-a-uuid' })
      .expect(400);

    await request(http)
      .post('/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);

    await request(http)
      .post('/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({
        studentId: fixtures.activeStudentId,
        checkedInAt: '2026-07-31T01:00:00.000Z',
      })
      .expect(400);
  });

  it('returns 409 for duplicate check-in', async () => {
    const res = await request(http)
      .post('/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: fixtures.presentStudentId })
      .expect(409);
    expect(res.body.error.code).toBe('ATTENDANCE_ALREADY_EXISTS');
  });

  it('allows exactly one winner under concurrent check-ins', async () => {
    const student = await prisma.student.create({
      data: {
        studentCode: '6999000001',
        firstName: 'Concurrent',
        lastName: 'Test',
        status: 'ACTIVE',
      },
    });

    const [first, second] = await Promise.all([
      request(http)
        .post('/attendance')
        .set('Authorization', `Bearer ${token}`)
        .send({ studentId: student.id }),
      request(http)
        .post('/attendance')
        .set('Authorization', `Bearer ${token}`)
        .send({ studentId: student.id }),
    ]);

    const statuses = [first.status, second.status].sort((a, b) => a - b);
    expect(statuses).toEqual([201, 409]);

    const rows = await prisma.attendance.findMany({
      where: {
        studentId: student.id,
        attendanceDate: toDatabaseDateOnly('2026-07-31'),
      },
    });
    expect(rows).toHaveLength(1);
  });

  it('classifies 08:30:00.000 as PRESENT and 08:30:00.001 as LATE', async () => {
    await app.close();
    await prisma.$disconnect();

    const presentInstant = DateTime.fromISO('2026-07-31T08:30:00.000', {
      zone: 'Asia/Bangkok',
    }).toJSDate();
    ({ app, prisma, http } = await createTestApp(presentInstant));
    fixtures = await seedMinimalFixtures(prisma);
    token = await login(http);

    const presentStudent = await prisma.student.create({
      data: {
        studentCode: '6890000001',
        firstName: 'Boundary',
        lastName: 'Present',
        status: 'ACTIVE',
      },
    });

    const presentRes = await request(http)
      .post('/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: presentStudent.id })
      .expect(201);
    expect(presentRes.body.data.status).toBe('PRESENT');

    await app.close();
    await prisma.$disconnect();

    const lateInstant = DateTime.fromISO('2026-07-31T08:30:00.001', {
      zone: 'Asia/Bangkok',
    }).toJSDate();
    ({ app, prisma, http } = await createTestApp(lateInstant));
    fixtures = await seedMinimalFixtures(prisma);
    token = await login(http);

    const lateStudent = await prisma.student.create({
      data: {
        studentCode: '6890000002',
        firstName: 'Boundary',
        lastName: 'Late',
        status: 'ACTIVE',
      },
    });

    const lateRes = await request(http)
      .post('/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: lateStudent.id })
      .expect(201);
    expect(lateRes.body.data.status).toBe('LATE');
  });

  it('uses Bangkok date when UTC day differs', async () => {
    await app.close();
    await prisma.$disconnect();

    const instant = DateTime.fromISO('2026-07-31T00:15:00', {
      zone: 'Asia/Bangkok',
    }).toJSDate();
    ({ app, prisma, http } = await createTestApp(instant));
    fixtures = await seedMinimalFixtures(prisma);
    token = await login(http);

    const res = await request(http)
      .post('/attendance')
      .set('Authorization', `Bearer ${token}`)
      .send({ studentId: fixtures.activeStudentId })
      .expect(201);

    expect(res.body.data.attendanceDate).toBe('2026-07-31');
  });
});

describe('Attendance summary (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let http: App;
  let token: string;

  beforeAll(async () => {
    const fixed = DateTime.fromISO('2026-07-31T10:00:00', {
      zone: 'Asia/Bangkok',
    }).toJSDate();
    ({ app, prisma, http } = await createTestApp(fixed));
    await seedMinimalFixtures(prisma);
    token = await login(http);
  });

  afterAll(async () => {
    if (app) await app.close();
    if (prisma) await prisma.$disconnect();
  });

  it('returns summary with invariant and rejects invalid dates', async () => {
    const res = await request(http)
      .get('/attendance/summary?date=2026-07-31')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const data = res.body.data;
    expect(data.present + data.late + data.absent).toBe(data.totalActiveStudents);
    expect(data.date).toBe('2026-07-31');

    await request(http)
      .get('/attendance/summary?date=2026-02-30')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    await request(http)
      .get('/attendance/summary?date=2024-02-29')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('defaults omitted date to current Bangkok date from clock', async () => {
    const res = await request(http)
      .get('/attendance/summary')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.data.date).toBe('2026-07-31');
  });
});
