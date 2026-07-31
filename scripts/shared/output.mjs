export function info(message) {
  console.log(`\n[demo] ${message}`);
}

export function success(message) {
  console.log(`[demo] ✓ ${message}`);
}

export function fail(message) {
  console.error(`[demo] ✗ ${message}`);
}

export function banner(lines) {
  console.log(`\n${'='.repeat(64)}\n${lines.join('\n')}\n${'='.repeat(64)}`);
}
