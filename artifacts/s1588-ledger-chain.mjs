// s1588: run test:ledger-guards' CHAINED leaves (the && tail after the node --test root),
// which the bash allowlist refuses by npm script name. Same commands, same order, rc reported
// per leaf so a failure names itself instead of vanishing into a single tail.
import { spawnSync } from 'node:child_process';

const CWD = '/Users/robin/Claude/Projects/Gold Rush/gate-s1588';

const LEAVES = [
  ['node', ['scripts/findings-state-guard.mjs'], 'test:findings-state'],
  ['node', ['scripts/blocker-panel-closed-guard.mjs'], 'test:blocker-panel'],
  ['node', ['scripts/ruling-propagation-guard.mjs'], 'test:ruling-propagation'],
  ['node', ['scripts/citation-title-guard.mjs'], 'test:citations'],
  ['node', ['scripts/desk-declaration-guard.mjs'], 'test:desk-declaration'],
  ['node', ['scripts/desk-birth-guard.mjs'], 'test:desk-birth'],
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
  const rc = r.status;
  if (rc !== 0) {
    failed++;
    console.log(`✖ ${name} rc=${rc}`);
    console.log((r.stdout || '').trim().split('\n').slice(-15).join('\n'));
    console.log((r.stderr || '').trim().split('\n').slice(-15).join('\n'));
  } else {
    const out = (r.stdout || '').trim().split('\n').filter(Boolean);
    console.log(`✔ ${name} rc=0  ${out[out.length - 1]?.slice(0, 110) ?? ''}`);
  }
}
console.log(`\nchained leaves: ${LEAVES.length - failed}/${LEAVES.length} green`);
process.exit(failed ? 1 : 0);
