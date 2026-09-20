import { spawnSync } from 'node:child_process';
const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const steps = [
  ['node', ['scripts/findings-state-guard.mjs']],
  ['node', ['scripts/blocker-panel-closed-guard.mjs']],
  ['node', ['scripts/ruling-propagation-guard.mjs']],
  ['node', ['scripts/citation-title-guard.mjs']],
  ['node', ['scripts/desk-declaration-guard.mjs']],
  ['node', ['scripts/status-archive-audit.mjs', '--limit', '40', '--quiet']],
  ['node', ['scripts/attended-owed-audit.mjs']],
  ['bash', ['scripts/main-lock-gate-guard.test.sh']],
  ['bash', ['scripts/janitor-request-rejection.test.sh']],
  ['node', ['scripts/nul-audit.mjs']],
];
let failed = 0;
for (const [cmd, args] of steps) {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8' });
  const name = args[0].replace('scripts/', '');
  const tail = (r.stdout || '').trim().split('\n').slice(-2).join(' | ').slice(0, 190);
  const err = (r.stderr || '').trim().split('\n').slice(-2).join(' | ').slice(0, 190);
  if (r.status !== 0) failed++;
  console.log(`${r.status === 0 ? 'PASS' : '*** FAIL ***'} rc=${r.status}  ${name}`);
  if (tail) console.log('      out: ' + tail);
  if (r.status !== 0 && err) console.log('      err: ' + err);
}
console.log(`\n${failed === 0 ? 'ALL LEDGER GUARDS GREEN' : failed + ' STEP(S) RED'}`);
process.exit(failed ? 1 : 0);
