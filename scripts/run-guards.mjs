/**
 * run-guards.mjs — run every non-browser guard and report each one's REAL exit code.
 *
 * WHY THIS EXISTS (F-1125-1, F-1126-1):
 * `test:node-guards` is an `&&` chain. For a full day it printed "61/61 pass" and
 * then exited 1, because the second half of the chain threw after the counter was
 * printed. Two fires in a row read the counter, never read `$?`, and recorded a
 * green. The defect was not the chain -- it was that a human eye reads OUTPUT and
 * a gate is defined by its EXIT CODE.
 *
 * So this runner never prints a guard's output as its verdict. It prints an rc
 * column, one row per guard, and its own exit code is 1 if ANY row is non-zero.
 * A guard that talks its way to a green cannot pass here.
 *
 * These cover `scripts/**` and the worker code, which `tsc` does NOT type
 * check (tsconfig `include` is [src, e2e, playwright.config.ts]) -- for that part
 * of the tree these guards are the only gate there is.
 *
 * `test:task-guards` (added s1131) is the odd one out: it gates the tasks/ ledger
 * rather than code. It is here because F-1130-4/F-1131-2 showed the same failure
 * mode this runner was built for -- a check that only ever ran by hand, as a
 * one-time sweep, while the board moved underneath it.
 */
import { spawnSync } from 'node:child_process';

const GUARDS = [
  'test:node-guards',
  'test:power-budget',
  'test:stats',
  'test:accounts',
  'test:mp',
  'test:deploy-contract',
  'test:deploy-site-contract',
  'test:task-guards',
];

// `--only` takes one guard OR a comma-separated list (F-1228-1). The drain gate
// needs a SUBSET, not all eight: `test:accounts` and `test:mp` each rewrite a
// tracked artifact, and a drain's own precondition is a clean tree, so they must
// stay out of the merge path. Selecting by list keeps the drain on ONE command
// that still prints a real rc per guard -- which is the whole point of this file.
const onlyArg = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1]
  : null;
const requested = onlyArg ? onlyArg.split(',').map((s) => s.trim()).filter(Boolean) : null;
const unknown = requested ? requested.filter((g) => !GUARDS.includes(g)) : [];

// An unknown name must be loud: silently narrowing to nothing would report a
// green over zero guards, which is the failure mode this runner exists to refuse.
if (requested && (unknown.length > 0 || requested.length === 0)) {
  console.error(
    `run-guards: no guard named "${unknown.join(', ') || onlyArg}". Known: ${GUARDS.join(', ')}`,
  );
  process.exit(2);
}

const selected = requested ? GUARDS.filter((g) => requested.includes(g)) : GUARDS;

const rows = [];
for (const guard of selected) {
  const started = Date.now();
  const run = spawnSync('npm', ['run', '--silent', guard], {
    encoding: 'utf8',
    timeout: 10 * 60 * 1000,
  });
  const seconds = Math.round((Date.now() - started) / 1000);
  // A signal-killed child reports status null; that is a failure, not a pass.
  const rc = run.status === null ? `signal:${run.signal ?? 'unknown'}` : run.status;
  const output = `${run.stdout ?? ''}${run.stderr ?? ''}`.trim();
  const p95 = output.match(/^power-graph-budget: p95=([0-9.]+)ms\b/m)?.[1];
  rows.push({ guard, rc, seconds, output });
  console.log(
    `${rc === 0 ? 'PASS' : 'FAIL'}  rc=${rc}  ${seconds}s  ${guard}` +
      (p95 ? `  p95=${p95}ms` : ''),
  );
}

const failed = rows.filter((r) => r.rc !== 0);

for (const row of failed) {
  console.log(`\n--- ${row.guard} (rc=${row.rc}) last 20 lines ---`);
  console.log(row.output.split('\n').slice(-20).join('\n'));
}

console.log(
  `\nguards: ${rows.length - failed.length}/${rows.length} passed` +
    (failed.length ? ` -- RED: ${failed.map((r) => r.guard).join(', ')}` : ''),
);

process.exit(failed.length ? 1 : 0);
