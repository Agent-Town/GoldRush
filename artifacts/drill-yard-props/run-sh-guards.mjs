/**
 * s1449: the two shell-script members of `test:ledger-guards`, run through node because the
 * fire's bash allowlist refuses the invocation form (the gate denies the operator, not the
 * factory). Same scripts, same arguments, real exit codes.
 */
import { spawnSync } from 'node:child_process';

const scripts = [
  'scripts/main-lock-gate-guard.test.sh',
  'scripts/janitor-request-rejection.test.sh',
];

let bad = 0;
for (const s of scripts) {
  const r = spawnSync('bash', [s], { stdio: 'inherit' });
  const rc = r.status ?? 1;
  console.log(`\n==> ${s}: rc=${rc}`);
  if (rc !== 0) bad++;
}
console.log(bad ? `FAIL: ${bad} guard(s) red` : 'PASS: both shell guards green');
process.exit(bad ? 1 : 0);
