// s1588 LAST ACT (F-1300-4): re-run the chained ledger-guard leaves on MAIN, after the
// handoff commit. The drain battery ran on a tree that did not yet contain this fire's
// goal leaf, BACKLOG rows, or desk — so it was structurally blind to them. Line-1 is now
// a handoff rather than a lock, which means the desk guards evaluate my desk for real
// instead of SKIPping.
import { spawnSync } from 'node:child_process';

const CWD = '/Users/robin/Claude/Projects/Gold Rush';

const LEAVES = [
  ['node', ['scripts/findings-state-guard.mjs'], 'test:findings-state'],
  ['node', ['scripts/blocker-panel-closed-guard.mjs'], 'test:blocker-panel'],
  ['node', ['scripts/ruling-propagation-guard.mjs'], 'test:ruling-propagation'],
  ['node', ['scripts/citation-title-guard.mjs'], 'test:citations'],
  ['node', ['scripts/desk-declaration-guard.mjs'], 'test:desk-declaration'],
  ['node', ['scripts/desk-birth-guard.mjs'], 'test:desk-birth'],
  ['node', ['scripts/desk-carryforward-guard.mjs'], 'desk-carryforward (the one merged this fire)'],
  ['node', ['scripts/status-archive-audit.mjs', '--limit', '40', '--quiet'], 'status-archive-audit'],
  ['node', ['scripts/attended-owed-audit.mjs'], 'attended-owed-audit'],
  ['bash', ['scripts/main-lock-gate-guard.test.sh'], 'main-lock-gate-guard'],
  ['bash', ['scripts/janitor-request-rejection.test.sh'], 'janitor-request-rejection'],
  ['bash', ['scripts/lane-dispatch-safety-guard.test.sh'], 'lane-dispatch-safety-guard'],
  ['node', ['scripts/nul-audit.mjs'], 'nul-audit'],
];

let failed = 0;
for (const [cmd, args, name] of LEAVES) {
  const r = spawnSync(cmd, args, { cwd: CWD, encoding: 'utf8' });
  if (r.status !== 0) {
    failed++;
    console.log(`✖ ${name} rc=${r.status}`);
    console.log((r.stdout || '').trim().split('\n').slice(-20).join('\n'));
    console.log((r.stderr || '').trim().split('\n').slice(-20).join('\n'));
  } else {
    const out = (r.stdout || '').trim().split('\n').filter(Boolean);
    console.log(`✔ ${name} rc=0  ${out[out.length - 1]?.slice(0, 105) ?? ''}`);
  }
}
console.log(`\nchained leaves on main after handoff: ${LEAVES.length - failed}/${LEAVES.length} green`);
process.exit(failed ? 1 : 0);
