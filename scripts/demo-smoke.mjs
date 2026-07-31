import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { runCompose } from './shared/command.mjs';
import { info, success } from './shared/output.mjs';

const API = process.env.API_BASE_URL ?? 'http://localhost:3001';
const WEB = process.env.WEB_BASE_URL ?? 'http://localhost:3000';

async function request(base, path, options = {}) {
  return fetch(`${base}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers ?? {}) },
  });
}

async function expectStatus(label, response, expected) {
  if (response.status !== expected) {
    const body = await response.text();
    throw new Error(`${label}: expected HTTP ${expected}, received ${response.status}. ${body}`);
  }
  success(`${label} (${expected})`);
}

async function loadDemoEnv() {
  const contents = await readFile('.env.demo.local', 'utf8');
  return Object.fromEntries(
    contents
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=');
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

async function login(email, password, expectedStatus) {
  const response = await request(API, '/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await expectStatus(
    expectedStatus === 200 ? 'Valid login' : 'Invalid login',
    response,
    expectedStatus,
  );
  if (!response.ok) {
    return null;
  }
  return response.json();
}

async function findStudent(token, code) {
  const response = await request(API, `/students?search=${encodeURIComponent(code)}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  await expectStatus(`Find ${code}`, response, 200);
  const body = await response.json();
  const student = body.data.find((item) => item.studentCode === code);
  if (!student) {
    throw new Error(`Expected seeded student ${code} was not found.`);
  }
  return student;
}

export async function runSmoke() {
  info('Running API smoke checks');
  await expectStatus('Health', await request(API, '/health'), 200);
  await expectStatus('Readiness', await request(API, '/ready'), 200);
  await expectStatus('Swagger docs', await request(API, '/docs'), 200);
  await expectStatus('Dashboard root', await request(WEB, '/'), 200);

  const session = await login('admin@nextschool.local', 'Password123!', 200);
  await login('admin@nextschool.local', 'wrong-password', 401);
  const token = session.data.access_token;
  const headers = { authorization: `Bearer ${token}` };

  const students = await request(API, '/students?page=1&limit=10', { headers });
  await expectStatus('Authenticated students list', students, 200);

  const checkIn = await findStudent(token, 'NS0020');
  const duplicate = await findStudent(token, 'NS0001');
  const inactive = await findStudent(token, 'NS0021');

  const env = await loadDemoEnv();
  const deleteSql =
    `DELETE FROM attendance USING students ` +
    `WHERE attendance."studentId" = students.id ` +
    `AND students."studentCode" = 'NS0020' ` +
    `AND attendance."attendanceDate" = ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Bangkok')::date);\n`;
  await runCompose(
    ['exec', '-T', 'postgres', 'psql', '-U', env.POSTGRES_USER, '-d', env.POSTGRES_DB],
    { capture: true, input: deleteSql },
  );

  await expectStatus(
    'Check-in NS0020',
    await request(API, '/attendance', {
      method: 'POST',
      headers,
      body: JSON.stringify({ studentId: checkIn.id }),
    }),
    201,
  );
  await expectStatus(
    'Duplicate check-in NS0001',
    await request(API, '/attendance', {
      method: 'POST',
      headers,
      body: JSON.stringify({ studentId: duplicate.id }),
    }),
    409,
  );
  await expectStatus(
    'Inactive student NS0021',
    await request(API, '/attendance', {
      method: 'POST',
      headers,
      body: JSON.stringify({ studentId: inactive.id }),
    }),
    422,
  );
  await expectStatus(
    'Attendance summary',
    await request(API, '/attendance/summary', { headers }),
    200,
  );

  const dashboardLogin = await request(WEB, '/api/session/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@nextschool.local',
      password: 'Password123!',
    }),
  });
  await expectStatus('Dashboard login route', dashboardLogin, 200);
  const cookie = (dashboardLogin.headers.getSetCookie?.() ?? [])
    .map((value) => value.split(';')[0])
    .join('; ');
  const protectedRoute = await request(WEB, '/api/attendance/summary', {
    headers: { cookie },
  });
  await expectStatus('Dashboard protected route', protectedRoute, 200);
  success('Smoke checks passed');
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  runSmoke().catch((error) => {
    console.error(`\n[demo] Smoke test failed: ${error.message}`);
    process.exit(1);
  });
}
