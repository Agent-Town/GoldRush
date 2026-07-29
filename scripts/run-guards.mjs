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

// `--only` takes one guard OR a comma-separated list (F-1228-1); `--changed-since
// <ref>` (F-1229-1) picks the battery from the merge's own diff. s1228 kept
// `test:accounts`/`test:mp` out of the merge path because they rewrite a tracked
// artifact and a drain's precondition is a clean tree -- that reason was correct
// and is now REMOVED rather than worked around: both writers honour
// GR_GUARD_NO_ARTIFACT, which this runner sets, so the only remaining question is
// whether a guard is RELEVANT to the merge. That is what the path rules answer.
//
// The guards every drain runs regardless of what it touched: they gate what a
// DRAIN ITSELF writes -- scripts/**, the tasks/ ledger, src/systems/PowerGraph.ts.
//
// site/ rides here too, inside test:node-guards (scripts/site-contract.test.mjs,
// F-1230-1) -- deliberately NOT a path rule. Its contract is two-sided: the page
// is untypechecked browser JS reading a shape produced by functions/api/stats.ts,
// and a `site/**` rule would miss the likelier drift direction, where the WORKER
// changes and the untouched consumer rots. It costs ~60ms, so there is nothing to
// buy by gating it behind a path. Do not "tidy" it into PATH_RULES.
const GATE_GUARDS = ['test:node-guards', 'test:power-budget', 'test:task-guards'];

// PATH RULES (F-1229-1, measured s1229). `tsconfig.json` include is
// ["src", "e2e", "playwright.config.ts"], so `npx tsc --noEmit` does NOT read
// functions/** at all, and `vite build` does not bundle Cloudflare Pages
// Functions either. Proven by mutation: `accountId: 12345` (a string field) in
// functions/api/_accounts.ts left tsc rc=0, build rc=0 AND the three gate guards
// rc=0 -- while `test:accounts` caught it in ONE second. Worker code has been
// merging through drains with no gate of any kind; functions/ changed in four
// merges over 2026-07-28..29 alone. Directory-wide on purpose: a per-file map of
// which worker each guard exercises would rot silently the first time a route
// moved, and the whole trio costs ~7s.
const PATH_RULES = [
  {
    label: 'functions/** (Cloudflare Pages Functions -- outside tsconfig include)',
    match: (file) => file.startsWith('functions/'),
    guards: ['test:stats', 'test:accounts', 'test:mp'],
  },
];

// null means ABSENT; '' means present-but-valueless. Collapsing those two into one
// null is how `--changed-since` with no ref would have silently run the full
// eight-guard battery instead of erroring -- caught by its own fixture test.
function argValue(flag) {
  const i = process.argv.indexOf(flag);
  if (i === -1) return null;
  return process.argv[i + 1] ?? '';
}

const onlyArg = argValue('--only');
const changedSince = argValue('--changed-since');

if (onlyArg !== null && changedSince !== null) {
  console.error('run-guards: --only and --changed-since are mutually exclusive.');
  process.exit(2);
}

// --changed-since <ref>: pick guards by what the merge actually touched, on top of
// the always-on gate set. A drain already knows this hash -- the review file's merge
// classification is required to name the base commit.
let changedFiles = null;
if (changedSince !== null) {
  if (!changedSince || changedSince.startsWith('--')) {
    console.error('run-guards: --changed-since needs a git ref (e.g. --changed-since HEAD~1).');
    process.exit(2);
  }
  const diff = spawnSync('git', ['diff', '--name-only', changedSince], { encoding: 'utf8' });
  // A bad ref must be LOUD. Falling back to the gate set would silently run a
  // narrower battery than the caller asked for -- the exact shape this file refuses.
  if (diff.status !== 0) {
    console.error(
      `run-guards: git diff --name-only ${changedSince} failed (rc=${diff.status}). ` +
        `${(diff.stderr ?? '').trim()}`,
    );
    process.exit(2);
  }
  // `git diff` sees TRACKED changes only, so a merge that adds a brand-new worker
  // file would show nothing until it is staged -- and the gate can run before the
  // commit. Union in untracked-but-not-ignored files: path rules only ever ADD
  // guards, so the safe direction to err is toward running more of them.
  const untracked = spawnSync('git', ['ls-files', '--others', '--exclude-standard'], {
    encoding: 'utf8',
  });
  const lines = `${diff.stdout ?? ''}\n${untracked.status === 0 ? untracked.stdout ?? '' : ''}`;
  changedFiles = [...new Set(lines.split('\n').map((s) => s.trim()).filter(Boolean))];
}

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

let selected;
if (requested) {
  selected = GUARDS.filter((g) => requested.includes(g));
} else if (changedFiles) {
  const wanted = new Set(GATE_GUARDS);
  const reasons = [];
  for (const rule of PATH_RULES) {
    const hits = changedFiles.filter(rule.match);
    if (hits.length === 0) continue;
    for (const g of rule.guards) wanted.add(g);
    reasons.push(`  + ${rule.guards.join(', ')} <- ${hits.length} file(s) in ${rule.label}`);
  }
  selected = GUARDS.filter((g) => wanted.has(g));
  console.log(`run-guards: ${changedFiles.length} file(s) changed since ${changedSince}`);
  console.log(`  base gate: ${GATE_GUARDS.join(', ')}`);
  for (const line of reasons) console.log(line);
  if (reasons.length === 0) console.log('  (no path rule matched -- base gate only)');
  console.log('');
} else {
  selected = GUARDS;
}

const rows = [];
for (const guard of selected) {
  const started = Date.now();
  const run = spawnSync('npm', ['run', '--silent', guard], {
    encoding: 'utf8',
    timeout: 10 * 60 * 1000,
    // Keeps the tree clean mid-gate: test:accounts / test:mp otherwise rewrite a
    // tracked artifact with nothing but a fresh timestamp (F-1229-1). This runner
    // produces VERDICTS; `npm run test:accounts` produces the artifact.
    env: { ...process.env, GR_GUARD_NO_ARTIFACT: '1' },
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
