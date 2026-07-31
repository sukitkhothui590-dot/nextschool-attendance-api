import { runCompose } from './shared/command.mjs';

runCompose(['logs', '--tail', '200', ...process.argv.slice(2)]).catch((error) => {
  console.error(`[demo] Logs failed: ${error.message}`);
  process.exit(1);
});
