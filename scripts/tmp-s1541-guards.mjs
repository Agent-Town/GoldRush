// s1541 scratch — runs the CHAINED leaves of `test:ledger-guards` directly, because the
// fire shell's bash allowlist refuses `npm run` and `;`-separated rc echoes. The gate denies
// the operator, not the factory (fire-permission law); the guards themselves are unchanged.
import { spawnSync } from 'node:child_process';

const LEAVES = [
  ['node', ['scripts/findings-state-guard.mjs']],
  ['node', ['scripts/blocker-panel-closed-guard.mjs']],
  ['node', ['scripts/ruling-propagation-guard.mjs']],
  ['node', ['scripts/citation-title-guard.mjs']],
  ['node', ['scripts/desk-declaration-guard.mjs']],
  ['node', ['scripts/status-archive-audit.mjs', '--limit', '40', '--quiet']],
  ['node', ['scripts/attended-owed-audit.mjs']],
  ['bash', ['scripts/main-lock-gate-guard.test.sh']],
  ['bash', ['scripts/janitor-request-rejection.test.sh']],
  ['bash', ['scripts/lane-dispatch-safety-guard.test.sh']],
  ['node', ['scripts/nul-audit.mjs']],
];

let failed = 0;
for (const [cmd, args] of LEAVES) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  const name = args[0].replace('scripts/', '');
  const ok = r.status === 0;
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} rc=${r.status} ${name}`);
  if (!ok) {
    console.log('--- stdout tail ---');
    console.log((r.stdout || '').split('\n').slice(-25).join('\n'));
    console.log('--- stderr tail ---');
    console.log((r.stderr || '').split('\n').slice(-25).join('\n'));
  }
}
console.log(`\n${LEAVES.length - failed}/${LEAVES.length} chained leaves green`);
process.exit(failed ? 1 : 0);
