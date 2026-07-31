import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { App } from 'supertest/types';
import { createTestApp, login, seedMinimalFixtures } from './helpers/test-app';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let http: App;

  beforeAll(async () => {
    ({ app, prisma, http } = await createTestApp());
    await seedMinimalFixtures(prisma);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  it('logs in successfully', async () => {
    const res = await request(http)
      .post('/login')
      .send({ email: 'admin@nextschool.local', password: 'Password123!' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.access_token).toBeDefined();
    expect(res.body.data.token_type).toBe('Bearer');
    expect(res.body.data.expires_in).toBeGreaterThan(0);
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
  });

  it('rejects wrong password and unknown email with same shape', async () => {
    const wrongPassword = await request(http)
      .post('/login')
      .send({ email: 'admin@nextschool.local', password: 'WrongPassword1!' })
      .expect(401);

    const unknown = await request(http)
      .post('/login')
      .send({ email: 'nobody@nextschool.local', password: 'Password123!' })
      .expect(401);

    expect(wrongPassword.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(unknown.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(wrongPassword.body.requestId).toBeDefined();
  });

  it('rejects missing and malformed Authorization', async () => {
    await request(http).get('/students').expect(401);
    await request(http).get('/students').set('Authorization', 'Bearer not-a-jwt').expect(401);
  });

  it('rejects invalid signature', async () => {
    const token = await login(http);
    const forged = `${token.split('.').slice(0, 2).join('.')}.invalidsignature`;
    const res = await request(http)
      .get('/students')
      .set('Authorization', `Bearer ${forged}`)
      .expect(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
