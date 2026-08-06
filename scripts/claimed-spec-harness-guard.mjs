#!/usr/bin/env node
// claimed-spec-harness-guard — a task master must not order a runner to run a spec
// that the harness it names cannot collect.
//
// WHY (F-1398-1, filed s1398, priced s1399/s1479, predicate chosen and built s1482)
//   Three e2e specs are claimed EXCLUSIVELY by another Playwright config and are `testIgnore`d
//   by the default one (`playwright.config.ts`, the `claimedByAnotherConfig` array, landed
//   `c8ed271c4` 2026-07-31T21:34 as the F-1296-3 cure). A master that tells a runner to run one
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
//   `ec72d12bc` 2026-07-29, THREE DAYS BEFORE `c8ed271c4` made its command invalid. Its command
//   was correct when written. Of the 6 arm-(b) offenders, only 2 postdate the config change —
//   and they are NOT the 2 that arm (a) finds:
//
//       f1397-1-e1-release-door-drill-yard.md      a821ff629  2026-08-02  AFTER   <- live
//       lane-a-f1305-2-console-watch-single-source a821..187d26736 2026-08-01  AFTER   <- live
//       lane-a-cp04-lever-unlock-seed-realign.md   831a8ea5e  2026-07-28  BEFORE  <- grandfathered
//       lane-b-approach-convergence-class.md       ec72d12bc  2026-07-29  BEFORE  <- grandfathered
//       lane-b-cp04-charter-name-composition.md    839a0d7a8  2026-07-28  BEFORE  <- grandfathered
//       lane-b-cp04-launch-clear-observability.md  1a836c08f  2026-07-29  BEFORE  <- grandfathered
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
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';

// Masters authored BEFORE c8ed271c4 (2026-07-31T21:34), when naming no config was correct.
// Each entry must keep the commit that proves it. Deleting an entry is how the debt is paid.
export const GRANDFATHERED = new Map([
  ['tasks/lane-a-cp04-lever-unlock-seed-realign.md', 'added 831a8ea5e 2026-07-28, predates c8ed271c4'],
  ['tasks/lane-b-approach-convergence-class.md', 'added ec72d12bc 2026-07-29, predates c8ed271c4'],
  ['tasks/lane-b-cp04-charter-name-composition.md', 'added 839a0d7a8 2026-07-28, predates c8ed271c4'],
  ['tasks/lane-b-cp04-launch-clear-observability.md', 'added 1a836c08f 2026-07-29, predates c8ed271c4'],
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
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    for (const [k, v] of Object.entries(pkg.scripts || {})) {
      for (const c of Object.values(owner)) if (v.includes(c)) (alias[c] ||= []).push(k);
    }
  } catch {
    /* a synthetic root need not carry a package.json */
  }
  return { claimed, owner, alias };
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

  if (report) {
    for (const o of offenders) {
      const tag = GRANDFATHERED.has(o.f) ? 'GRANDFATHERED' : 'LIVE';
      console.log(`\n[${tag}] ${o.f}`);
      if (tag === 'GRANDFATHERED') console.log(`    reason: ${GRANDFATHERED.get(o.f)}`);
      for (const r of o.reasons) console.log(`    :${r.n} (${r.form}) ${r.line.slice(0, 160)}`);
    }
    process.exit(0);
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
    process.exit(1);
  }
  console.log('OK: no live offender.');
  process.exit(0);
}

// NOT `file://${process.argv[1]}` — this repo's absolute path contains a space ("Gold Rush"),
// which `import.meta.url` percent-encodes and `process.argv[1]` does not. That comparison is
// false here for EVERY invocation, so the guard ran, printed nothing and exited 0: a gate that
// silently measures nothing while looking rooted. Caught s1482 on this guard's first run.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
