import { spawnSync } from 'node:child_process';

const nodeTests = [
  'scripts/goal-tracker.test.mjs',
  'scripts/goal-closure-reason.test.mjs',
  'scripts/ruling-propagation-guard.test.mjs',
  'scripts/law-pointer-guard.test.mjs',
  'scripts/gate-caller-audit.test.mjs',
  'scripts/block-class-guard.test.mjs',
  'scripts/banked-master-preflight-guard.test.mjs',
  'scripts/stale-hold-verdict-guard.test.mjs',
  'scripts/claimed-spec-harness-guard.test.mjs',
  'scripts/stale-ready-for-gates-guard.test.mjs',
];

const steps = [
  ['node', ['--test', ...nodeTests]],
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

for (const [cmd, args] of steps) {
  const label = `${cmd} ${args[0] === '--test' ? '--test (10 guard files)' : args.join(' ')}`;
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  const out = ((r.stdout || '') + (r.stderr || '')).trim().split('\n');
  const tail = out.slice(-9).join('\n');
  console.log(`\n=== rc=${r.status} — ${label}`);
  console.log(tail);
  if (r.status !== 0) {
    console.log('\n!!! STOPPED: this step is RED');
    process.exit(1);
  }
}
console.log('\nALL LEDGER GUARDS GREEN');
