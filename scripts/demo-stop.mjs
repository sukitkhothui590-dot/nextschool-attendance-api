import { runCompose } from './shared/command.mjs';
import { info, success } from './shared/output.mjs';

async function main() {
  info('Stopping reviewer demo services');
  await runCompose(['down']);
  success('Demo services stopped. Demo data volume was kept.');
}

main().catch((error) => {
  console.error(`[demo] Stop failed: ${error.message}`);
  process.exit(1);
});
