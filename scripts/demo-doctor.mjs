import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { run } from './shared/command.mjs';
import { assertPortsAvailable } from './shared/ports.mjs';
import { info, success } from './shared/output.mjs';

const REQUIRED_FILES = [
  '.env.demo.example',
  'docker-compose.demo.yml',
  'apps/api/Dockerfile',
  'apps/web/Dockerfile',
  'apps/api/prisma/schema.prisma',
];

export async function runDoctor() {
  info('Checking demo prerequisites');
  const major = Number(process.versions.node.split('.')[0]);
  if (major < 20)
    throw new Error(`Node.js ${process.version} is unsupported. Node.js >=20 is required.`);
  await run('npm', ['--version'], { capture: true });
  await run('docker', ['--version'], { capture: true });
  await run('docker', ['compose', 'version'], { capture: true });
  await run('docker', ['info'], { capture: true });
  await Promise.all(REQUIRED_FILES.map((file) => access(resolve(file))));
  await assertPortsAvailable([3000, 3001]);
  success(
    `Node ${process.version}, npm, Docker, Compose, required files, and ports 3000/3001 are ready`,
  );
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  runDoctor().catch((error) => {
    console.error(`\n[demo] Doctor failed: ${error.message}`);
    process.exit(1);
  });
}
