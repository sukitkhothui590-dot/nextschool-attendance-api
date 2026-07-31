import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaClient, StudentStatus } from '@prisma/client';
import { App } from 'supertest/types';
import { createTestApp, login, seedMinimalFixtures } from './helpers/test-app';

describe('Students (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let http: App;
  let token: string;

  beforeAll(async () => {
    ({ app, prisma, http } = await createTestApp());
    await seedMinimalFixtures(prisma);
    token = await login(http);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  it('supports default pagination and meta', async () => {
    const res = await request(http)
      .get('/students')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(20);
    expect(res.body.meta.total).toBeGreaterThan(0);
  });

  it('searches by studentCode, first name, and last name', async () => {
    const byCode = await request(http)
      .get('/students?search=6990000001')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(byCode.body.data[0].studentCode).toBe('6990000001');

    const byFirst = await request(http)
      .get('/students?search=Active')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(byFirst.body.data.length).toBeGreaterThan(0);

    const byLast = await request(http)
      .get('/students?search=Already')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(byLast.body.data[0].lastName).toBe('Already');
  });

  it('filters by status and sorts deterministically', async () => {
    const inactive = await request(http)
      .get('/students?status=INACTIVE')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(
      inactive.body.data.every((s: { status: StudentStatus }) => s.status === 'INACTIVE'),
    ).toBe(true);

    const sorted = await request(http)
      .get('/students?sortBy=firstName&sortOrder=asc&limit=50')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const names = sorted.body.data.map((s: { firstName: string }) => s.firstName);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it('validates query params and returns empty pages safely', async () => {
    await request(http).get('/students?page=0').set('Authorization', `Bearer ${token}`).expect(400);
    await request(http)
      .get('/students?limit=101')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
    await request(http)
      .get('/students?status=UNKNOWN')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
    await request(http)
      .get('/students?sortBy=password')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    const empty = await request(http)
      .get('/students?search=zzz-no-match')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(empty.body.data).toEqual([]);

    const beyond = await request(http)
      .get('/students?page=999')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(beyond.body.data).toEqual([]);
  });
});
