import { runCompose } from './shared/command.mjs';

runCompose(['ps']).catch((error) => {
  console.error(`[demo] Status failed: ${error.message}`);
  process.exit(1);
});
