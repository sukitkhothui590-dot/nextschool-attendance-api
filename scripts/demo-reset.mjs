import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { runCompose } from './shared/command.mjs';
import { info, success } from './shared/output.mjs';

async function main() {
  const confirmed = process.argv.includes('--yes');
  if (!confirmed) {
    const prompt = createInterface({ input: stdin, output: stdout });
    const answer = await prompt.question(
      'This deletes the nextschool_demo_pg_data volume and all demo data. Continue? [y/N] ',
    );
    prompt.close();
    if (answer.trim().toLowerCase() !== 'y') {
      info('Reset cancelled.');
      return;
    }
  }
  info('Removing demo containers and database volume');
  await runCompose(['down', '--volumes', '--remove-orphans']);
  success('nextschool_demo_pg_data was removed. Run npm run demo to create fresh seeded data.');
}

main().catch((error) => {
  console.error(`[demo] Reset failed: ${error.message}`);
  process.exit(1);
});
