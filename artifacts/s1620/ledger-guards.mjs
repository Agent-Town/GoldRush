import { spawnSync } from 'node:child_process';

const nodeTests = [
  'scripts/goal-tracker.test.mjs', 'scripts/goal-closure-reason.test.mjs',
  'scripts/ruling-propagation-guard.test.mjs', 'scripts/law-pointer-guard.test.mjs',
  'scripts/gate-caller-audit.test.mjs', 'scripts/block-class-guard.test.mjs',
  'scripts/banked-master-preflight-guard.test.mjs', 'scripts/stale-hold-verdict-guard.test.mjs',
  'scripts/claimed-spec-harness-guard.test.mjs', 'scripts/stale-ready-for-gates-guard.test.mjs',
  'scripts/stale-successor-pointer-guard.test.mjs', 'scripts/stopped-leaf-supersession-guard.test.mjs',
  'scripts/desk-carryforward-guard.test.mjs', 'scripts/desk-birth-guard.test.mjs',
  'scripts/desk-state-audit.test.mjs',
];

const steps = [
  ['node', ['--test', ...nodeTests]],
  ['npm', ['run', 'test:findings-state']],
  ['npm', ['run', 'test:blocker-panel']],
  ['npm', ['run', 'test:ruling-propagation']],
  ['npm', ['run', 'test:citations']],
  ['npm', ['run', 'test:desk-declaration']],
  ['npm', ['run', 'test:desk-birth']],
  ['node', ['scripts/status-archive-audit.mjs', '--limit', '40', '--quiet']],
  ['node', ['scripts/attended-owed-audit.mjs']],
  ['bash', ['scripts/main-lock-gate-guard.test.sh']],
  ['bash', ['scripts/janitor-request-rejection.test.sh']],
  ['bash', ['scripts/lane-dispatch-safety-guard.test.sh']],
  ['node', ['scripts/nul-audit.mjs']],
];

let failed = 0;
for (const [cmd, args] of steps) {
  const label = `${cmd} ${args.slice(0, 2).join(' ')}`;
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1e8 });
  const out = (r.stdout || '') + (r.stderr || '');
  if (r.status === 0) {
    const m = out.match(/# pass (\d+)[\s\S]*?# fail (\d+)/);
    console.log(`OK    ${label}${m ? `  (pass ${m[1]} / fail ${m[2]})` : ''}`);
  } else {
    failed++;
    console.log(`FAIL  rc=${r.status}  ${label}`);
    console.log(out.split('\n').slice(-40).join('\n'));
  }
}
console.log(failed === 0 ? '\nLEDGER GUARDS: ALL GREEN' : `\nLEDGER GUARDS: ${failed} STEP(S) RED`);
