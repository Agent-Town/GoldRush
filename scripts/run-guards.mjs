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
 * These cover `scripts/**`, which `tsc` does NOT type check (tsconfig `include`
 * is [src, e2e, functions, playwright.config.ts]) -- for that part of the tree
 * these guards are the only gate there is. The worker code under `functions/`
 * used to belong in that sentence and NO LONGER DOES: ts-cov-01 (merged s1235)
 * brought all 22 worker files under tsc, and scripts/worker-type-coverage.test.mjs
 * fails if any of them ever falls back out.
 *
 * READ THAT SENTENCE PRECISELY (F-1232-1, s1232). "These cover scripts/**" was
 * false as written for four months, and it is the kind of false that reads as
 * reassurance. `test:node-guards` is a hand-written roster of test files; the
 * import graph out of it plus the other entrypoints reached 31 of 174
 * scripts/*.mjs. A hard SyntaxError in art-staging-audit.mjs -- a script the
 * ART-SLOT LAW obliges fires to run -- passed tsc, build, and all eight guards
 * 8/8. What coverage existed came from tests that happened to EXECUTE a script
 * (deploy-site.sh is gated only because its contract test runs it), never from
 * anything that read the tree as a whole. scripts/script-tree-parse.test.mjs now
 * holds the floor -- every .mjs and .sh here and in rehearsal/ must parse -- so
 * the sentence above is true at the parse level and ONLY at the parse level.
 * A script with a contract test is still gated far better than one without.
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
  'test:citations',
  'test:gate-callers',
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
// `test:citations` joined this list in s1252, and the reason is F-1126-1 rather than a new
// policy. scripts/citation-title-guard.mjs was written as a gate -- its own usage line says
// "# gate (exit 1 on a new bare citation)" -- and then never given a caller. Measured s1252:
// the ONLY reference to it anywhere was its own fixture test, so it had been RED against the
// real tree since s1241 (2026-07-30 04:25) and no one could have known. An unrun guard is an
// unread verdict. It rides beside test:task-guards for the same reason that one does: it
// gates the tasks/ ledger a drain itself writes, and it costs 0.33s on the real tree.
// REVERSIBLE IN ONE LINE if the owner would rather it stayed advisory (§7.4 veto window).
//
// `test:gate-callers` joined in s1253, and it is the guard that watches THIS LIST.
// s1252 found citation-title-guard.mjs by hand: a finished ratchet with a test, a
// baseline, and a usage line reading "# gate", which nothing had ever called, and
// which had therefore been RED against the real tree for nine fires while nine
// fires reported full green batteries. That was found by luck. scripts/gate-caller-
// audit.mjs makes it findable by a battery: it resolves the caller graph from these
// rosters plus the pipeline shells, the node --test argv, and *.config.ts webServer
// commands, and it exits 1 when a gate-shaped subject has no caller and no recorded
// reason. Measured s1253: 5 orphans on the real tree, all five grandfathered with a
// written reason in scripts/gate-caller-baseline.json (four are release-door gates
// whose wiring is an owner cost decision -- F-1253-1).
// It is a GATE rather than an advisory for the same reason test:citations is: it
// gates what a DRAIN ITSELF writes -- package.json and scripts/**. A slice that
// lands a new guard without a caller should not be able to merge quietly.
// REVERSIBLE IN ONE LINE, same as the line above (§7.4 veto window).
const GATE_GUARDS = [
  'test:node-guards',
  'test:power-budget',
  'test:task-guards',
  'test:citations',
  'test:gate-callers',
];

// PATH RULES (F-1229-1, measured s1229; the coverage sentence CORRECTED s1233).
// `vite build` does not bundle Cloudflare Pages Functions, and worker code was
// merging through drains with no gate of any kind before this rule existed;
// functions/ changed in four merges over 2026-07-28..29 alone. Directory-wide on
// purpose: a per-file map of which worker each guard exercises would rot silently
// the first time a route moved, and the whole trio costs ~7s.
//
// WHAT THIS RULE IS NOT ABOUT, AND THE HISTORY OF THAT (F-1233-1 s1233, CLOSED by
// ts-cov-01 s1235). This comment used to state as fact that because tsconfig
// `include` is ["src","e2e","playwright.config.ts"], `npx tsc --noEmit` "does NOT
// read functions/** at all". That was false twice over, and the first falseness is
// the one this file keeps finding: an English claim about coverage that nobody
// re-derived. `include` picks ROOT files; tsc also checks everything those roots
// transitively IMPORT, so 4 of the 22 files under functions/ were type-checked all
// along -- standings.ts, stats.ts, telemetry.ts, _ratelimit.ts -- because src/
// imports them. Mutation-proven s1233: an unclosed brace in standings.ts took
// `npx tsc --noEmit` to rc=2, on a tree whose comment promised tsc never looked.
//
// The other 18 were type-checked by NOTHING. That WAS the live gap; it is closed.
// ts-cov-01 added "functions" to `include` (scoping the Workers globals to
// _multiplayer.ts via inline `import()` types, so nothing leaks into src/'s type
// space) and fixed the 10 resulting errors with type predicates, not casts. The
// count is now 22 of 22, and it is GUARDED rather than merely done:
// scripts/worker-type-coverage.test.mjs walks functions/ and asserts every file
// appears in `tsc --noEmit --listFiles`. Do not restore the old sentence.
//
// The rule below survives the cure and is still load-bearing, for the reason it was
// written: `vite build` does not bundle Pages Functions, and TYPES ARE NOT
// BEHAVIOUR. `wrangler pages dev` builds the whole functions/ directory at startup,
// so a parse error anywhere reddens all three guards here (mutation-proven s1233:
// the standings.ts break took test:stats, test:accounts AND test:mp to rc=1, though
// standings is a route none of the three ever requests), and the bug/redeem/
// standings routes are additionally exercised by playwright specs that spawn their
// own wrangler (e2e/bug-office-api, cosmetic-grants, lb-01-county-standings).
// A worker whose types check can still answer the wrong thing -- keep the trio.
const PATH_RULES = [
  {
    label: 'functions/** (Cloudflare Pages Functions -- type-checked since s1235; these gate BEHAVIOUR)',
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
    maxBuffer: 64 * 1024 * 1024,
  });
  // Same law as the bad ref above, and it was missing here: treating a FAILED listing
  // as "no untracked files" drops exactly the brand-new-file protection this union
  // exists to provide, and still prints "guards: N/N passed". A transient fork failure
  // under load is enough -- `diff` and `ls-files` are separate spawns, so one can fail
  // while the other succeeds. `status` is null (not non-zero) when the child dies on a
  // signal or never spawns, so compare against 0 rather than testing truthiness.
  if (untracked.status !== 0) {
    console.error(
      `run-guards: git ls-files --others failed (rc=${untracked.status}` +
        `${untracked.signal ? `, signal=${untracked.signal}` : ''}` +
        `${untracked.error ? `, ${untracked.error.code ?? untracked.error.message}` : ''}). ` +
        `${(untracked.stderr ?? '').trim()}`,
    );
    process.exit(2);
  }
  const lines = `${diff.stdout ?? ''}\n${untracked.stdout ?? ''}`;
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
    timeout: 15 * 60 * 1000,
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
