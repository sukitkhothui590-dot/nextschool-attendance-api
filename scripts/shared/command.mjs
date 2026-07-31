import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';

export function run(command, args, { capture = false, stdio = 'inherit', input } = {}) {
  return new Promise((resolve, reject) => {
    // Windows cannot spawn .cmd shims (npm/npx) without a shell.
    const needsShell = isWindows && (command === 'npm' || command === 'npx');
    const child = spawn(command, args, {
      shell: needsShell,
      windowsHide: true,
      stdio: input
        ? ['pipe', capture ? 'pipe' : 'inherit', capture ? 'pipe' : 'inherit']
        : capture
          ? ['ignore', 'pipe', 'pipe']
          : stdio,
      env: process.env,
    });
    let output = '';
    if (capture) {
      child.stdout.on('data', (chunk) => {
        output += chunk;
      });
      child.stderr.on('data', (chunk) => {
        output += chunk;
      });
    }
    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    }
    child.on('error', (error) => reject(new Error(`Could not run "${command}": ${error.message}`)));
    child.on('close', (code) => {
      if (code === 0) return resolve(output.trim());
      reject(
        new Error(
          `"${command} ${args.join(' ')}" exited with code ${code}.${output ? `\n${output.trim()}` : ''}`,
        ),
      );
    });
  });
}

export const composeArgs = [
  'compose',
  '-p',
  'nextschool-demo',
  '-f',
  'docker-compose.demo.yml',
  '--env-file',
  '.env.demo.local',
];
export const runCompose = (args, options) => run('docker', [...composeArgs, ...args], options);
