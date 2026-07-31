import { access, copyFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { runDoctor } from './demo-doctor.mjs';
import { runCompose } from './shared/command.mjs';
import { waitForUrl } from './shared/health.mjs';
import { banner, info, success } from './shared/output.mjs';

async function ensureDemoEnv() {
  try {
    await access('.env.demo.local');
    info('Using existing .env.demo.local');
  } catch {
    await copyFile('.env.demo.example', '.env.demo.local');
    success('Created .env.demo.local from .env.demo.example');
  }
}

function openBrowser(url) {
  const command =
    process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  const child = spawn(command, args, { detached: true, stdio: 'ignore' });
  child.on('error', () => {});
  child.unref();
}

async function main() {
  await runDoctor();
  await ensureDemoEnv();
  info('Building and starting the reviewer demo stack');
  await runCompose(['up', '-d', '--build']);
  await waitForUrl('http://localhost:3001/health', { label: 'API liveness' });
  await waitForUrl('http://localhost:3001/ready', { label: 'API readiness' });
  await waitForUrl('http://localhost:3000', { label: 'web application' });
  success('Services are healthy');
  await import('./demo-smoke.mjs').then(({ runSmoke }) => runSmoke());
  banner([
    '==================================================',
    'NextSchool Attendance Operations is ready',
    '==================================================',
    '',
    'Dashboard:',
    'http://localhost:3000',
    '',
    'Swagger API Documentation:',
    'http://localhost:3001/docs',
    '',
    'Health:',
    'http://localhost:3001/health',
    '',
    'Demo Login:',
    'Email: admin@nextschool.local',
    'Password: Password123!',
    '',
    'Useful demo students:',
    'Successful check-in: NS0020',
    'Duplicate check-in: NS0001',
    'Inactive student: NS0021',
    '',
    'Stop services:',
    'npm run demo:stop',
    '',
    'View logs:',
    'npm run demo:logs',
    '',
    'Reset all demo data:',
    'npm run demo:reset',
  ]);
  openBrowser('http://localhost:3000');
}

main().catch((error) => {
  console.error(`\n[demo] Start failed: ${error.message}`);
  console.error('[demo] Inspect logs with: npm run demo:logs');
  process.exit(1);
});
