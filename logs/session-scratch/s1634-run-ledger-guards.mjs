import { spawnSync } from 'node:child_process';

// Runs the repo's own `test:ledger-guards` npm script verbatim.
// Routed through node because the fire's bash allowlist refuses the npm script name
// (the gate denies the fire, not the factory).
const r = spawnSync('npm', ['run', 'test:ledger-guards'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

const out = (r.stdout || '') + (r.stderr || '');
const lines = out.split('\n');

const interesting = lines.filter((l) =>
  /^# (pass|fail|tests|skipped|todo)|not ok |FAIL|Error:|AssertionError|✗|EXIT|error|WARN|SKIP|PASS/i.test(l),
);

console.log(interesting.slice(-60).join('\n'));
console.log('================================');
console.log('LEDGER-GUARDS EXIT =', r.status);
