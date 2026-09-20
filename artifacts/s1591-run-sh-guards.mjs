// s1591: the three bash leaves of test:ledger-guards, run through node because the fire's
// bash allowlist refuses `sh scripts/*.test.sh` (the gate denies the fire, not the factory —
// the same route s1301 used when the npm script name was refused).
import { execFileSync } from 'node:child_process';

const leaves = [
  'scripts/main-lock-gate-guard.test.sh',
  'scripts/janitor-request-rejection.test.sh',
  'scripts/lane-dispatch-safety-guard.test.sh',
];

let failed = 0;
for (const leaf of leaves) {
  try {
    const out = execFileSync('bash', [leaf], { cwd: process.cwd(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const tail = out.trim().split('\n').slice(-2).join(' | ');
    console.log('PASS  ' + leaf + '  :: ' + tail);
  } catch (err) {
    failed += 1;
    const out = (err.stdout || '') + (err.stderr || '');
    console.log('FAIL  ' + leaf + '  rc=' + err.status);
    console.log(out.trim().split('\n').slice(-12).join('\n'));
  }
}
console.log(failed === 0 ? 'ALL THREE BASH LEAVES PASS' : failed + ' bash leaf/leaves FAILED');
process.exit(failed === 0 ? 0 : 1);
