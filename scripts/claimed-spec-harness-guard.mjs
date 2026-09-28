#!/usr/bin/env node
// claimed-spec-harness-guard — a task master must not order a runner to run a spec
// that the harness it names cannot collect.
//
// WHY (F-1398-1, filed s1398, priced s1399/s1479, predicate chosen and built s1482)
//   Three e2e specs are claimed EXCLUSIVELY by another Playwright config and are `testIgnore`d
//   by the default one (`playwright.config.ts`, the `claimedByAnotherConfig` array, landed
//   `395bc04be` 2026-07-31T21:34 as the F-1296-3 cure). A master that tells a runner to run one
//   of them WITHOUT naming its owning config prescribes a command that cannot execute.
//
//   Measured s1482, and it fails LOUDLY rather than falsely green:
//       npx playwright test e2e/release-build.spec.ts --list
//       -> "Error: No tests found."  /  "Total: 0 tests in 0 files"
//   So the cost is not a false green; it is a runner cycle spent diagnosing a harness error
//   that the desk could never have executed. That is the author-could-not-run-its-own-cure class.
//
// THE PREDICATE — WHICH ARM, AND WHY. This was the whole slice (F-1398-1 said so explicitly:
// "the mechanism is easy and fully machine-derivable; the PREDICATE is the whole slice").
// All arms measured s1482 over 1,144 tracked `tasks/**/*.md`; 21 name a claimed spec.
//
//   (a) COMMAND FORM ONLY  — a `playwright test` line naming the spec .............  2 offenders
//   (b) COMMAND *or* GATE/ADJACENT context (CHOSEN) ..............................  6 offenders
//   (c) ANY mention with no owning config named ..................................  12 offenders
//
//   (a) is rejected because it misses 4 real cases that cause the identical harm. A checklist
//   line — "Adjacent unmodified-green: `e2e/release-build.spec.ts`, both projects" — sends the
//   runner to the same unrunnable harness as a bare command does; it just does not look like a
//   command, so a command-shaped regex never sees it.
//
//   (c) is rejected because its extra 6 are provably DESCRIPTIVE, verified by reading every one:
//   two say only "adjacent to the F-1296-3 standing order about release-build.spec.ts"; one names
//   the spec in a firewall NO-list and a `git diff` path; and three (lane-release-build,
//   -fixes-2, -town-fix) are the masters that CREATED or extended the spec — an authoring
//   instruction, not a run instruction. Requiring those to name a config is noise, and a guard
//   that manufactures noise trains people to add boilerplate.
//
// THE TIME DIMENSION — the half nobody had measured, and it changes who is guilty.
//   The inherited row named `lane-b-approach-convergence-class.md` as one of two canonical
//   offenders and prescribed a correction note for it. Measured s1482: that master was authored
//   `335020046` 2026-07-29, THREE DAYS BEFORE `395bc04be` made its command invalid. Its command
//   was correct when written. Of the 6 arm-(b) offenders, only 2 postdate the config change —
//   and they are NOT the 2 that arm (a) finds:
//
//       f1397-1-e1-release-door-drill-yard.md      55f4c9050  2026-08-02  AFTER   <- live
//       lane-a-f1305-2-console-watch-single-source a821..4aff1a7c6 2026-08-01  AFTER   <- live
//       lane-a-cp04-lever-unlock-seed-realign.md   c33b33873  2026-07-28  BEFORE  <- grandfathered
//       lane-b-approach-convergence-class.md       335020046  2026-07-29  BEFORE  <- grandfathered
//       lane-b-cp04-charter-name-composition.md    bcdbe98fb  2026-07-28  BEFORE  <- grandfathered
//       lane-b-cp04-launch-clear-observability.md  3dd9bcade  2026-07-29  BEFORE  <- grandfathered
//
//   Reding on a master that was correct when authored is exactly the "reds on history nobody
//   agreed was a defect" hazard the row warned about — but for a reason nobody had identified.
//   Everyone had assumed the offenders were always-wrong. Four of six were not.
//
// WHY A GRANDFATHER LIST AND NOT A DATE COMPARISON
//   A date test would need re-deriving every run and would silently re-open the moment anyone
//   edits `claimedByAnotherConfig` again. The debt is 4 files, so it is written down here in the
//   open, each with the commit that proves it predates the rule. Pay it down by appending a
//   correction note to a file and deleting its entry — never by adding entries silently.
//
// THE MAPPING IS DERIVED, NEVER TABULATED
//   Claimed specs come from the default config's own `claimedByAnotherConfig`; each owner is
//   found by scanning `playwright.*.config.ts` for a `testMatch` naming that spec; npm aliases
//   come from `package.json`. Add a fourth claimed spec and this guard covers it with no edit.
//
// USAGE
//   node scripts/claimed-spec-harness-guard.mjs            # gate (exit 1 on a live offender)
//   node scripts/claimed-spec-harness-guard.mjs --report   # full split, always exit 0
//   node scripts/claimed-spec-harness-guard.mjs --root <d> # synthetic corpus (tests); walks the
//                                                          # filesystem instead of git ls-files
import fs from 'node:fs';
import path from 'node:path';
import { isMain } from './is-main.mjs';
import { execSync } from 'node:child_process';

// Masters authored BEFORE 395bc04be (2026-07-31T21:34), when naming no config was correct.
// Each entry must keep the commit that proves it. Deleting an entry is how the debt is paid.
export const GRANDFATHERED = new Map([
  ['tasks/lane-a-cp04-lever-unlock-seed-realign.md', 'added c33b33873 2026-07-28, predates 395bc04be'],
  ['tasks/lane-b-approach-convergence-class.md', 'added 335020046 2026-07-29, predates 395bc04be'],
  ['tasks/lane-b-cp04-charter-name-composition.md', 'added bcdbe98fb 2026-07-28, predates 395bc04be'],
  ['tasks/lane-b-cp04-launch-clear-observability.md', 'added 3dd9bcade 2026-07-29, predates 395bc04be'],
]);

const SELFCHECK = /^\s*(#+\s*)?(\*\*)?(SELF-?CHECK|GATES?|SELF CHECK|ACCEPTANCE)/i;
const ADJACENT = /adjacent[^\n]*(unmodified|green)|unmodified-green/i;
const RUNCMD = /(npx\s+)?playwright\s+test/;

export function deriveHarnessMap(root) {
  const cfgPath = path.join(root, 'playwright.config.ts');
  const defaultCfg = fs.readFileSync(cfgPath, 'utf8');
  const block = defaultCfg.match(/const claimedByAnotherConfig = \[([\s\S]*?)\];/);
  if (!block) {
    throw new Error(
      `could not find claimedByAnotherConfig in ${cfgPath}. If that array was renamed or removed, ` +
        `this guard is measuring nothing — fix the derivation, do not delete the guard.`
    );
  }
  const claimed = [...block[1].matchAll(/'\*\*\/([^']+)'/g)].map((m) => m[1]);
  const configs = fs.readdirSync(root).filter((f) => /^playwright\..*\.config\.ts$/.test(f));
  const owner = {};
  for (const spec of claimed) {
    const base = spec.replace(/\.spec\.ts$/, '');
    for (const c of configs) {
      const tm = fs.readFileSync(path.join(root, c), 'utf8').match(/testMatch:\s*(.+)/);
      if (tm && tm[1].includes(base)) {
        owner[spec] = c;
        break;
      }
    }
  }
  const alias = {};
  // `aliasesReadable` distinguishes "package.json says no script runs this config" from "there is
  // no package.json here" — the two are indistinguishable in an empty `alias` map, and the
  // runnerless WARN below must never fire on a synthetic --root fixture that simply has no
  // package.json to read. F-2117-1.
  let aliasesReadable = false;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    aliasesReadable = true;
    for (const [k, v] of Object.entries(pkg.scripts || {})) {
      for (const c of Object.values(owner)) if (v.includes(c)) (alias[c] ||= []).push(k);
    }
  } catch {
    /* a synthetic root need not carry a package.json */
  }
  return { claimed, owner, alias, aliasesReadable };
}

function corpus(root, useGit) {
  if (useGit) {
    return execSync('git ls-files "tasks/*.md" "tasks/**/*.md"', { cwd: root, maxBuffer: 1 << 28 })
      .toString()
      .trim()
      .split('\n')
      .filter(Boolean);
  }
  const out = [];
  (function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.md')) out.push(path.relative(root, p));
    }
  })(path.join(root, 'tasks'));
  return out;
}

// THE PREDICATE. Exported so the test can exercise it directly.
export function classify(text, harness) {
  const { claimed, owner, alias } = harness;
  const hits = claimed.filter((s) => text.includes(s));
  if (!hits.length) return null;

  const namesOwningConfig = hits.some((s) => {
    const c = owner[s];
    if (!c) return false;
    if (text.includes(c)) return true;
    return (alias[c] || []).some((a) => text.includes(a));
  });

  const lines = text.split('\n');
  let scStart = Infinity;
  for (let i = 0; i < lines.length; i++) {
    if (SELFCHECK.test(lines[i])) {
      scStart = i;
      break;
    }
  }

  const reasons = [];
  lines.forEach((l, i) => {
    if (!hits.some((s) => l.includes(s))) return;
    if (RUNCMD.test(l) && !/--config/.test(l)) reasons.push({ n: i + 1, form: 'command', line: l.trim() });
    else if (i >= scStart) reasons.push({ n: i + 1, form: 'gate', line: l.trim() });
    else if (ADJACENT.test(l)) reasons.push({ n: i + 1, form: 'checklist', line: l.trim() });
  });

  return { hits, namesOwningConfig, isOffender: !namesOwningConfig && reasons.length > 0, reasons };
}

// F-2117-1 — THE OTHER HALF OF "coverage is not lost, it moves to the owning config".
//
// `playwright.config.ts` removes three specs from the DEFAULT gate and justifies it in one
// sentence: "coverage is not lost, it moves to the owning config (`npm run test:release`, etc.)".
// Measured s2117 with this file's own `deriveHarnessMap`: that sentence is true of exactly ONE
// of the three members, and the "etc." is where the coverage went.
//
//   release-build.spec.ts      -> playwright.release.config.ts       -> npm run test:release   (30 tests)
//   release-base-path.spec.ts  -> playwright.release-base.config.ts  -> NO CALLER ANYWHERE      (4 tests)
//     ^ 4 was s2117's measurement and is RESTATED, NOT DELETED. s2118 moved this spec's second
//       test — a browser-free CORS assertion — out to scripts/function-cors-allowlist.test.mjs
//       (F-2118-1), so this row is 2 tests today and the total below is 20 of 50 (40.0%).
//       The verdict is unchanged; what shrank is the amount of coverage stranded here.
//   accounts-sync.spec.ts      -> playwright.accounts.config.ts      -> NO CALLER ANYWHERE     (18 tests)
//
// 22 of 52 claimed-spec tests (42.3%) are collected by a config that no npm script, shell script
// or gate invokes. The VERDICT (ignore them in the default gate) stays correct — each genuinely
// needs a harness the default config cannot provide. What is false is the stated REASON, for two
// of three. `npm run test:accounts` looks like the missing runner and is not: it runs
// scripts/test-accounts.mjs, a wrangler HTTP harness with ZERO references to playwright.
//
// WHY THIS GUARD AND NOT A NEW ONE: the `alias` map above ALREADY computes this, on every run,
// and then discards it. Nothing else in the factory can see it — gate-caller-audit.mjs treats
// npm scripts as ROOTS and *.config.ts as EDGES, never as subjects (its own tally: 131 subjects
// = 23 npm + 29 guards + 79 tests, exactly), so "does this config have a caller?" is outside its
// question by construction. The fact was derivable for 635 fires and printed by nobody.
//
// WHY WARN AND NOT RED (the F-1613 / gazette-sweep disposition): two members are runnerless
// RIGHT NOW, so a red would fail the board on a standing condition and be excused within a week
// — the `cross-engine` label's fate (F-1460-1). Whether these two harnesses get stood up and
// rooted is GATE POLICY and costs owner time (accounts wants wrangler + KV on :8788), so it is
// an owner call on the halo-reextraction-check.mjs precedent, not a drive-by. This prints the
// fact; it does not decide it. Exit codes are untouched in every arm.
export function runnerless(harness) {
  if (!harness.aliasesReadable) return [];
  return harness.claimed
    .map((spec) => ({ spec, cfg: harness.owner[spec] }))
    .filter(({ cfg }) => cfg && !(harness.alias[cfg] || []).length);
}

// F-2098-1 — WHY THIS FUNCTION SETS `process.exitCode` AND RETURNS INSTEAD OF CALLING
// `process.exit()`. Do not "tidy" it back; the force-exit is what hung the factory.
//
// s2098 sampled a live orphan of this very script (pid 40407, `--report`, PPID 1, 9 h 39 m
// elapsed, 0:00.10 CPU total, holding NO file/lock/port — `lsof` showed only cwd + the node
// binary). Its stack is an unambiguous two-thread deadlock INSIDE V8, on the way out:
//
//   main thread : process.exit() -> node::Environment::Exit -> DisposePlatform
//                 -> WorkerThreadsTaskRunner::Shutdown -> uv_thread_join -> __ulock_wait
//   V8 worker   : ConcurrentBaselineCompiler -> BaselineCompiler::Build
//                 -> CodeBuilder::BuildInternal -> HeapAllocator::AllocateRawSlowPath
//                 -> CollectionBarrier::AwaitCollectionBackground -> _pthread_cond_wait
//
// The main thread is joining the platform workers; a baseline-compiler worker is parked on
// the collection barrier waiting for a GC that only the main thread can service. Each waits
// for the other, forever. `main()` is fully SYNCHRONOUS with zero pending handles, so this
// scan finishes its work and then fails to die — which is why the corpses hold nothing and
// burn no CPU, and why 0% CPU was never evidence of innocence.
//
// This retires the shared-fixture/contention hypothesis F-2090-2 carried: the hang is not
// the board, not git, not another battery, and not a fixture. It is load-CORRELATED only
// because load changes JIT/GC timing. Returning normally lets the loop drain and V8 finish
// its in-flight jobs, removing the guaranteed-in-flight window that `process.exit()` creates
// at peak JIT activity. It also removes the known truncation of pending piped stdout.
// (It shifts probability rather than proving impossibility — s2098 could NOT reproduce the
// deadlock on demand in 180 bounded attempts, so no stronger claim is made here.)
function main() {
  const argv = process.argv.slice(2);
  const report = argv.includes('--report');
  const rootIdx = argv.indexOf('--root');
  const root = rootIdx >= 0 ? path.resolve(argv[rootIdx + 1]) : process.cwd();
  const useGit = rootIdx < 0;

  const harness = deriveHarnessMap(root);
  const files = corpus(root, useGit);

  const offenders = [];
  let mentions = 0;
  for (const f of files) {
    let text;
    try {
      text = fs.readFileSync(path.join(root, f), 'utf8');
    } catch {
      continue;
    }
    const c = classify(text, harness);
    if (!c) continue;
    mentions++;
    if (c.isOffender) offenders.push({ f, ...c });
  }

  const live = offenders.filter((o) => !GRANDFATHERED.has(o.f));
  const grand = offenders.filter((o) => GRANDFATHERED.has(o.f));

  console.log(`claimed specs (derived): ${harness.claimed.join(', ')}`);
  console.log(
    `corpus ${files.length} task files · ${mentions} name a claimed spec · ` +
      `${offenders.length} offend the predicate · ${grand.length} grandfathered · ${live.length} LIVE`
  );

  // F-2117-1 — WARN only, never a red, and never an exit-code change. See the note above.
  const orphanHarnesses = runnerless(harness);
  if (orphanHarnesses.length) {
    console.log(
      `\nWARN: ${orphanHarnesses.length} of ${harness.claimed.length} claimed spec(s) are ignored by the default ` +
        `gate and their owning config has NO npm caller — so "coverage moves to the owning config" is not true of them:`
    );
    for (const { spec, cfg } of orphanHarnesses) {
      console.log(`    ${spec} -> ${cfg} -> no npm script invokes this config (runs only if typed by hand).`);
    }
    console.log('    Not a failure: wiring/rooting these harnesses is gate policy (owner). Advisory only.\n');
  }

  if (report) {
    for (const o of offenders) {
      const tag = GRANDFATHERED.has(o.f) ? 'GRANDFATHERED' : 'LIVE';
      console.log(`\n[${tag}] ${o.f}`);
      if (tag === 'GRANDFATHERED') console.log(`    reason: ${GRANDFATHERED.get(o.f)}`);
      for (const r of o.reasons) console.log(`    :${r.n} (${r.form}) ${r.line.slice(0, 160)}`);
    }
    process.exitCode = 0;
    return;
  }

  // A grandfather entry naming a file that is no longer an offender is stale bookkeeping:
  // it would silently excuse the file if it regressed. Surface it, but do not fail on it.
  const offenderPaths = new Set(offenders.map((o) => o.f));
  for (const [f] of GRANDFATHERED) {
    if (!offenderPaths.has(f)) {
      console.log(`note: grandfather entry for ${f} is no longer needed — delete it (debt paid).`);
    }
  }

  if (live.length) {
    console.error(`\nFAIL: ${live.length} task master(s) order a run of a spec the named harness cannot collect.\n`);
    for (const o of live) {
      const cfg = o.hits.map((s) => harness.owner[s]).filter(Boolean).join(', ');
      console.error(`  ${o.f}`);
      for (const r of o.reasons) console.error(`    :${r.n} (${r.form}) ${r.line.slice(0, 200)}`);
      console.error(
        `    -> names ${o.hits.join(', ')} but never names its owning config (${cfg}).\n` +
          `       Under the default config this collects ZERO tests and exits rc=1.\n` +
          `       CURE: APPEND a correction note naming the owning config — do not edit the cited\n` +
          `       lines, which would rot every citation quoting them (F-1397-3).\n`
      );
    }
    process.exitCode = 1;
    return;
  }
  console.log('OK: no live offender.');
  process.exitCode = 0;
}

// NOT `file://${process.argv[1]}` — this repo's absolute path contains a space ("Gold Rush"),
// which `import.meta.url` percent-encodes and `process.argv[1]` does not. That comparison is
// false here for EVERY invocation, so the guard ran, printed nothing and exited 0: a gate that
// silently measures nothing while looking rooted. Caught s1482 on this guard's first run.
if (isMain(import.meta.url)) main();
