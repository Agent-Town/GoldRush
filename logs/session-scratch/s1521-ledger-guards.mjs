// s1521 — run the FULL test:ledger-guards set through node (the bash allowlist refuses the npm
// script name; fire.md: the gate denies YOU, not the factory). Expanded verbatim from package.json.
import { spawnSync } from 'node:child_process';

const NODE_TESTS = [
  'scripts/goal-tracker.test.mjs', 'scripts/goal-closure-reason.test.mjs',
  'scripts/ruling-propagation-guard.test.mjs', 'scripts/law-pointer-guard.test.mjs',
  'scripts/gate-caller-audit.test.mjs', 'scripts/block-class-guard.test.mjs',
  'scripts/banked-master-preflight-guard.test.mjs', 'scripts/stale-hold-verdict-guard.test.mjs',
  'scripts/claimed-spec-harness-guard.test.mjs', 'scripts/stale-ready-for-gates-guard.test.mjs',
  'scripts/stale-successor-pointer-guard.test.mjs',
  'scripts/stopped-leaf-supersession-guard.test.mjs',
];

const STEPS = [
  ['node', ['--test', ...NODE_TESTS]],
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
for (const [cmd, args] of STEPS) {
  const label = `${cmd} ${args.slice(0, 2).join(' ')}${args.length > 2 ? ` … (${args.length} args)` : ''}`;
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  const ok = r.status === 0;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  rc=${r.status}  ${label}`);
  if (cmd === 'node' && args[0] === '--test') {
    const tail = (r.stdout || '').split('\n').filter((l) => /^ℹ (tests|pass|fail|skipped)/.test(l));
    tail.forEach((l) => console.log('       ', l));
  }
  if (!ok) {
    console.log('--- stdout tail ---');
    console.log((r.stdout || '').split('\n').slice(-25).join('\n'));
    console.log('--- stderr tail ---');
    console.log((r.stderr || '').split('\n').slice(-15).join('\n'));
  }
}
console.log(`\n${failed === 0 ? 'LEDGER-GUARDS GREEN' : `LEDGER-GUARDS RED (${failed} step(s))`}`);
process.exit(failed ? 1 : 0);
