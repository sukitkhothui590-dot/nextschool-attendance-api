import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceStatus, PrismaClient, StudentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { execSync } from 'child_process';
import { json } from 'express';
import { DateTime } from 'luxon';
import { join } from 'path';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter';
import { ResponseEnvelopeInterceptor } from '../../src/common/interceptors/response-envelope.interceptor';
import { Clock } from '../../src/common/time/clock';
import { FixedClock } from '../../src/common/time/fixed-clock';
import { toDatabaseDateOnly } from '../../src/common/time/bangkok-time';

jest.setTimeout(120_000);

let migrated = false;

function requireTestDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error('TEST_DATABASE_URL is required for e2e tests. Refusing to use DATABASE_URL.');
  }
  return url;
}

export async function resetTestDatabase(): Promise<PrismaClient> {
  const testUrl = requireTestDatabaseUrl();
  process.env.DATABASE_URL = testUrl;
  process.env.NODE_ENV = 'test';
  process.env.PORT = process.env.PORT ?? '3001';
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-only-secret-at-least-32-characters-long';
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
  process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
  process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? 'error';

  const apiRoot = join(__dirname, '..', '..');
  if (!migrated) {
    execSync('npx prisma migrate deploy', {
      cwd: apiRoot,
      env: { ...process.env, DATABASE_URL: testUrl },
      stdio: 'pipe',
    });
    migrated = true;
  }

  const prisma = new PrismaClient({ datasources: { db: { url: testUrl } } });
  await prisma.$connect();
  await prisma.attendance.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  return prisma;
}

export async function seedMinimalFixtures(prisma: PrismaClient): Promise<{
  adminEmail: string;
  adminPassword: string;
  activeStudentId: string;
  activeStudentCode: string;
  inactiveStudentId: string;
  inactiveStudentCode: string;
  presentStudentId: string;
}> {
  const passwordHash = await bcrypt.hash('Password123!', 10);
  await prisma.user.create({
    data: { email: 'admin@nextschool.local', passwordHash },
  });

  const active = await prisma.student.create({
    data: {
      studentCode: '6990000001',
      firstName: 'Active',
      lastName: 'Student',
      status: StudentStatus.ACTIVE,
    },
  });

  const inactive = await prisma.student.create({
    data: {
      studentCode: '6990000002',
      firstName: 'Inactive',
      lastName: 'Student',
      status: StudentStatus.INACTIVE,
    },
  });

  const present = await prisma.student.create({
    data: {
      studentCode: '6990000003',
      firstName: 'Present',
      lastName: 'Already',
      status: StudentStatus.ACTIVE,
    },
  });

  for (let i = 4; i <= 10; i += 1) {
    await prisma.student.create({
      data: {
        studentCode: `699000000${i}`,
        firstName: `Student${i}`,
        lastName: 'Demo',
        status: StudentStatus.ACTIVE,
      },
    });
  }

  const bangkokDate = '2026-07-31';
  await prisma.attendance.create({
    data: {
      studentId: present.id,
      attendanceDate: toDatabaseDateOnly(bangkokDate),
      checkedInAt: DateTime.fromISO('2026-07-31T07:45:00', {
        zone: 'Asia/Bangkok',
      }).toJSDate(),
      status: AttendanceStatus.PRESENT,
    },
  });

  return {
    adminEmail: 'admin@nextschool.local',
    adminPassword: 'Password123!',
    activeStudentId: active.id,
    activeStudentCode: active.studentCode,
    inactiveStudentId: inactive.id,
    inactiveStudentCode: inactive.studentCode,
    presentStudentId: present.id,
  };
}

export async function createTestApp(fixedNow?: Date): Promise<{
  app: INestApplication;
  prisma: PrismaClient;
  http: App;
}> {
  const prisma = await resetTestDatabase();

  const moduleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  if (fixedNow) {
    moduleBuilder.overrideProvider(Clock).useValue(new FixedClock(fixedNow));
  }

  const moduleFixture: TestingModule = await moduleBuilder.compile();
  const app = moduleFixture.createNestApplication();
  app.use(json({ limit: '32kb' }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
  await app.init();

  return { app, prisma, http: app.getHttpServer() as App };
}

export async function login(
  http: App,
  email = 'admin@nextschool.local',
  password = 'Password123!',
): Promise<string> {
  const response = await request(http).post('/login').send({ email, password }).expect(200);
  return response.body.data.access_token as string;
}
