#!/usr/bin/env node
/**
 * dry-board-probe.test.mjs — the guard for F-2207-1.
 *
 * Every assertion here was PROVEN BY MANUFACTURING THE DEFECT on a fixture, not
 * by observing a green (the s1299/s1300 standard: a passing guard never executes
 * its violation path, so its green says nothing about its red).
 *
 * The load-bearing case is `held`: §2F's prose filter selects only bare-dated
 * files, so a `held-` done-move -- the exact shape a DEFERRED drain takes -- is
 * invisible to it. At s2207 the live corpus held 6 of them, one being lane/a's
 * undrained e10s-1b slice.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { TERMINAL_TOKENS, bareDate, bucketOf, classifiableCapture, embeddedDate, exitCodeFor, selectSubjects } from './dry-board-probe.mjs';

function fixture(names) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dry-board-probe-'));
  fs.mkdirSync(path.join(root, 'tasks', 'done'), { recursive: true });
  for (const n of names) fs.writeFileSync(path.join(root, 'tasks', 'done', n), 'x\n');
  return root;
}

// A prefixed file fixes the convention start at 2026-07-25, matching the live corpus.
const ANCHOR = 'noop-s1033-20260725-140651-lane-m2-05-readiness-seam.md';

test('the convention start is DERIVED from the corpus, never pinned', (t) => {
  const root = fixture([ANCHOR, '20260705-010101-legacy.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  assert.equal(selectSubjects(root).conventionStart, '20260725');

  // RED arm: move the earliest prefixed file and the boundary MUST move with it.
  const later = fixture(['noop-s1200-20260810-090000-thing.md', '20260801-010101-mid.md']);
  t.after(() => fs.rmSync(later, { recursive: true }));
  const sel = selectSubjects(later);
  assert.equal(sel.conventionStart, '20260810');
  // 20260801 now precedes the convention, so it is legacy -- a date pinned at
  // 20260725 would have wrongly kept it as a subject. (The noop- file is skipped
  // on its own terminal prefix, which is why the subject set is empty here.)
  assert.deepEqual(sel.skippedLegacy, ['20260801-010101-mid.md']);
  assert.deepEqual(sel.subjects, []);
});

test('a NUMERIC SHORT HASH is never mistaken for a date', (t) => {
  // Both of these are REAL filenames from the live corpus. A /(\d{8})-\d{6}/
  // reader takes `bdd28000` and `67d87bc4` as dates (years 0910 and 1550) and
  // drags the derived boundary back to prehistory -- which is exactly what this
  // script did on its first live run: 32 subjects became 562.
  const hashy = 'shipped-09102598-20260727-133154-lane-055-standard-note-assertion-and-briefing.md';
  const hashy2 = 'drained-s1243-15505222-20260730-051923-ret-01-run-log-recoverability-guard.md';
  assert.equal(embeddedDate(hashy), '20260727');
  assert.equal(embeddedDate(hashy2), '20260730');
  assert.equal(bareDate('bdd28000-133154-not-a-date.md'), null, 'year 0910 is not plausible');
  assert.equal(bareDate('20260727-133154-real.md'), '20260727');

  // RED arm: with the anchor at 2026-07-25, a hash-bearing file must NOT move the
  // boundary, so the pre-convention file stays legacy.
  const root = fixture([ANCHOR, hashy, hashy2, '20260705-010101-legacy.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  const sel = selectSubjects(root);
  assert.equal(sel.conventionStart, '20260725');
  assert.deepEqual(sel.skippedLegacy, ['20260705-010101-legacy.md']);
});

test('a bare-dated file on/after the convention start is a subject; before it is legacy', (t) => {
  const root = fixture([ANCHOR, '20260726-072430-lane-e1-secure-wave-truth.md', '20260705-010101-legacy.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  const sel = selectSubjects(root);
  assert.ok(sel.subjects.includes('20260726-072430-lane-e1-secure-wave-truth.md'));
  assert.deepEqual(sel.skippedLegacy, ['20260705-010101-legacy.md']);
});

test('F-2207-1: a NON-TERMINAL prefix is a subject — this is the whole finding', (t) => {
  const held = 'held-s2125-owner-fork-f2125-1-20260821-112744-e10s-1b-ember-shore-schema-and-data.md';
  const ready = 'ready-for-gates-s1330-UNDRAINED-7c4f132f-leaf-blocked-20260801-122335-f1328-1-drill-yard-census-debt.md';
  const root = fixture([ANCHOR, held, ready, 'partial-a8f02a7a0-20260821-134347-f2127-1-stdin-rejection-deadlock.md',
    'blocked-s1217-F1217-1-20260729-165229-ap-orders-adapter-wiring.md',
    'OWNER-GATED-F-1096-2-do-not-drain-20260727-011937-lane-hero-y-restore-roundtrip.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  const sel = selectSubjects(root);
  for (const n of [held, ready]) assert.ok(sel.subjects.includes(n), `${n} must be a subject`);
  assert.equal(sel.subjects.length, 5, 'all five non-terminal prefixes are subjects');
  assert.equal(sel.skippedTerminal.length, 1, 'only the noop anchor is skipped');

  // RED arm: §2F's prose filter (bare-dated only) sees NONE of them.
  const proseFilter = Object.keys(sel.tokens).length > 0
    ? sel.subjects.filter((n) => /^\d{8}-/.test(n)) : [];
  assert.equal(proseFilter.length, 0,
    'the bare-dated-only filter is blind to every one of these — that is F-2207-1');
});

test('an UNRECOGNISED prefix fails SAFE into the subject set', (t) => {
  const root = fixture([ANCHOR, 'quarantined-s9999-20260901-000000-some-future-convention.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  const sel = selectSubjects(root);
  assert.ok(sel.subjects.includes('quarantined-s9999-20260901-000000-some-future-convention.md'),
    'a prefix nobody has invented yet must be probed, not skipped');
});

test('terminal prefixes are skipped, case-insensitively', (t) => {
  const names = [...TERMINAL_TOKENS].map((t2, i) => `${t2}-s10${i}-2026080${i % 9}-010101-x${i}.md`);
  const root = fixture([ANCHOR, ...names, 'DRAINED-s999-20260808-010101-shouty.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  const sel = selectSubjects(root);
  assert.deepEqual(sel.subjects, [], 'no terminal-prefixed file is a subject');
  assert.equal(sel.skippedTerminal.length, TERMINAL_TOKENS.size + 2);
});

test('with no prefixed file at all, nothing is legacy', (t) => {
  const root = fixture(['20260705-010101-a.md', '20260706-010101-b.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  const sel = selectSubjects(root);
  assert.equal(sel.conventionStart, null);
  assert.equal(sel.subjects.length, 2, 'bare-dating carries no signal, so probe everything');
  assert.deepEqual(sel.skippedLegacy, []);
});

test('UNKNOWN is bucketed apart from CLEAR — it is not a clearance', () => {
  assert.equal(bucketOf('? UNKNOWN — no goal leaf matches "x.md".'), 'unknown');
  assert.equal(bucketOf('⛔ CLOSED — DO NOT DRAIN: x.md'), 'closed');
  assert.equal(bucketOf('⛔ BLOCKED — DO NOT DRAIN: x.md'), 'closed');
  assert.equal(bucketOf('✅ CLEAR — x.md [leaf] status="merged"'), 'merged');
  // RED arm: a CLEAR with no merged status is a real drain, never a ghost.
  assert.equal(bucketOf('✅ CLEAR — x.md [leaf] status="queued"'), 'drain');
});

// ---------------------------------------------------------------------------
// F-2208-1 — the exit code, which is where the sibling test's principle leaked.
//
// The test above asserts UNKNOWN "is not a clearance" and is right about the
// BUCKET. For this script's whole first day `--strict` mapped only the drain arm
// to a non-zero code, so an UNKNOWN board exited 0 — byte-identical to an earned
// "✅ DRY", in the one mode whose purpose is to turn the verdict into a code.
// Nine tests missed it because the decision sat inline in main(), unreachable.
//
// Each arm below was PROVEN BY MANUFACTURING THE DEFECT: restoring the original
// `if (strict && buckets.drain.length) exit(1); exit(0)` reds the UNKNOWN cases
// (rc 2 → 0) and leaves every other arm green — i.e. these tests fail for the
// one reason they exist, and the old code passes the rest.
// ---------------------------------------------------------------------------

const NONE = { drain: [], unknown: [] };
const DRAIN = { drain: ['x.md'], unknown: [] };
const UNK = { drain: [], unknown: ['x.md'] };
const BOTH = { drain: ['x.md'], unknown: ['y.md'] };

test('advisory mode reports and never gates — every arm exits 0', () => {
  for (const b of [NONE, DRAIN, UNK, BOTH]) assert.equal(exitCodeFor(b, false), 0);
});

test('F-2208-1: --strict exits 2 on UNKNOWN — the ledger declining is not a clearance', () => {
  // THE finding. Live board at s2208: 0 drains, 3 UNKNOWNs, `--strict` rc=0.
  assert.equal(exitCodeFor(UNK, true), 2);
  assert.notEqual(exitCodeFor(UNK, true), exitCodeFor(NONE, true),
    'an UNKNOWN board must not be indistinguishable from an earned DRY');
});

test('--strict exits 1 on a real drain, 0 on an earned dry', () => {
  assert.equal(exitCodeFor(DRAIN, true), 1);
  assert.equal(exitCodeFor(NONE, true), 0);
});

test('a real drain outranks an UNKNOWN — the worse verdict wins the code', () => {
  assert.equal(exitCodeFor(BOTH, true), 1);
});

test('a missing tasks/done directory yields an empty, non-throwing result', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dry-board-probe-'));
  t.after(() => fs.rmSync(root, { recursive: true }));
  const sel = selectSubjects(root);
  assert.deepEqual(sel.subjects, []);
  assert.equal(sel.total, 0);
});

// ---------------------------------------------------------------------------
// F-2209-1 — the WIRING, which is the layer F-2208-1's own cure left uncovered.
//
// F-2208-1 extracted `exitCodeFor` so the arm that DECIDES could be exercised
// rather than admired, and its four tests above are correct about the decision.
// But the only thing a CALLER can observe is the process exit code, and after
// the cure not one test spawned the CLI -- so `main()`'s two links to that pure
// function were exactly as unreachable as the inline decision had been.
//
// MEASURED s2209 on scratch copies, both defects invisible to all 13 tests:
//   * `process.exit(exitCodeFor(buckets, strict))` -> `process.exit(0)`  : 13/13 pass
//   * `argv.includes('--strict')` -> `argv.includes('--Strict')`         : 13/13 pass
// Either one silently restores F-2208-1 in full -- an UNKNOWN board exiting 0,
// byte-identical to an earned DRY -- while the guard that names F-2208-1 stays
// green. That is F-2208-1's OWN lesson recurring one layer out: a guard that
// asserts a principle where it holds, and never where it fails, certifies its
// own blind spot. The cure for a layering blind spot cannot live at the layer
// that had it; it has to be observed from OUTSIDE, where the caller stands.
//
// These arms spawn the real script against a fixture root, so they cross every
// link: flag parse -> subject selection -> bucketing -> exit code -> process.
// `main()` derives the root from cwd and resolves drain-block-check under it,
// so a fixture supplies its own stub verdict and the live corpus is never read.
// ---------------------------------------------------------------------------

const PROBE = path.join(import.meta.dirname, 'dry-board-probe.mjs');

const SUBJECT = '20260801-010101-subject.md';

/** A fixture root the CLI can run in: one subject, plus a stubbed verdict. */
function cliFixture(t, verdict) {
  const root = fixture([ANCHOR, SUBJECT]);
  t.after(() => fs.rmSync(root, { recursive: true }));
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'scripts', 'drain-block-check.mjs'),
    `console.log(${JSON.stringify(verdict)});\n`,
  );
  return root;
}

/**
 * Run the real CLI in `root` and return BOTH observables — the exit code and
 * what it printed. F-2210-1: in advisory mode the code is constant 0, so the
 * output is the entire verdict; a helper that discards it can only ever test
 * half the interface.
 */
function runCliFull(root, args) {
  try {
    const out = execFileSync('node', [PROBE, ...args], { timeout: 240_000, killSignal: 'SIGKILL', cwd: root, encoding: 'utf8', stdio: 'pipe' });
    return { rc: 0, out };
  } catch (e) {
    return { rc: e.status, out: (e.stdout ?? '') + (e.stderr ?? '') };
  }
}

/** Run the real CLI in `root` and return its exit code. */
function runCli(root, args) {
  return runCliFull(root, args).rc;
}

const V_UNKNOWN = '? UNKNOWN — no goal leaf matches "subject.md".';
const V_DRAIN = '✅ CLEAR — subject.md [leaf] status="queued"';
const V_MERGED = '✅ CLEAR — subject.md [leaf] status="merged"';

test('F-2209-1: the CLI itself exits 2 on UNKNOWN — observed where a caller stands', (t) => {
  // THE finding, at the only layer that can see it. Severing main() from
  // exitCodeFor reds this and nothing else in the file.
  const rc = runCli(cliFixture(t, V_UNKNOWN), ['--strict']);
  assert.equal(rc, 2, 'an UNKNOWN board must not exit like an earned DRY');
  assert.notEqual(rc, runCli(cliFixture(t, V_MERGED), ['--strict']));
});

test('F-2209-1: the CLI exits 1 on a real drain and 0 on an earned dry', (t) => {
  assert.equal(runCli(cliFixture(t, V_DRAIN), ['--strict']), 1);
  assert.equal(runCli(cliFixture(t, V_MERGED), ['--strict']), 0);
});

test('F-2209-1: the --strict flag is actually read — advisory stays advisory', (t) => {
  // RED arm for the second manufactured defect: a misparsed flag makes strict
  // mode unreachable, so the drain case below would return 0 like advisory.
  assert.equal(runCli(cliFixture(t, V_DRAIN), []), 0, 'advisory never gates');
  assert.notEqual(
    runCli(cliFixture(t, V_DRAIN), ['--strict']),
    runCli(cliFixture(t, V_DRAIN), []),
    'if --strict were misparsed these would be equal',
  );
});

// ---------------------------------------------------------------------------
// F-2210-1 — the ADVISORY verdict: the layer F-2209-1's cure left uncovered,
// and the only one scripts/fire.md §2F actually prescribes.
//
// F-2209-1 crossed the wiring from bucket to EXIT CODE, and its three arms above
// are correct about it. But `exitCodeFor(b, false)` returns 0 for EVERY bucket,
// so in advisory mode -- `node scripts/dry-board-probe.mjs`, the command §2F
// names as the first act of a dry-board fire, and the one every fire since s2207
// has actually run -- the exit code carries ZERO information. The whole verdict
// travels on stdout, and after F-2209-1 not one test read a character of it:
// `runCli` piped the output and returned only the status.
//
// MEASURED s2210 on scratch copies. Both defects are invisible to all 16 tests:
//   * verdict banner made unconditional (always "✅ DRY")   : 16/16 pass, rc unchanged
//   * 'drain' dropped from the report loop                  : 16/16 pass, rc unchanged
// On a fixture board holding ONE REAL DRAIN the first prints, in advisory mode
// at rc=0:  "✅ DRY — every subject resolves merged or closed. The word is
// earned."  That is not a cosmetic regression. It is the s1061 incident verbatim
// -- an undrained slice sitting 28 hours behind a probe that could not fail
// loudly -- reproduced inside the tool built to prevent it. The second is worse
// in a quieter way: the banner stays honest while the NAMES vanish, so a fire is
// told a drain exists and is given nothing to act on.
//
// The rule is F-2209-1's own, turned on itself: TEST FROM WHERE THE CALLER
// STANDS. A caller of this script in its prescribed mode observes exactly one
// thing, and it is not the exit code.
// ---------------------------------------------------------------------------

test('F-2210-1: in ADVISORY mode the banner is the ONLY signal — it must match the bucket', (t) => {
  // Mutual exclusion is the load-bearing half: asserting the right banner is
  // PRESENT does not catch an unconditional banner, because a probe that always
  // says "DRY" still says it on a dry board. The forbidden list is what reds.
  const cases = [
    [V_DRAIN, '⛔ NOT DRY', ['✅ DRY', 'owe a file probe']],
    [V_UNKNOWN, 'owe a file probe', ['✅ DRY', '⛔ NOT DRY']],
    [V_MERGED, '✅ DRY', ['⛔ NOT DRY', 'owe a file probe']],
  ];
  for (const [verdict, expected, forbidden] of cases) {
    const { rc, out } = runCliFull(cliFixture(t, verdict), []);
    assert.equal(rc, 0, 'advisory never gates — rc says nothing, so stdout says everything');
    assert.ok(out.includes(expected), `advisory verdict must read "${expected}"`);
    for (const f of forbidden) {
      assert.ok(!out.includes(f), `a "${expected}" board must NOT also print "${f}"`);
    }
  }
});

test('F-2210-1: a drain and an UNKNOWN are NAMED, not merely counted', (t) => {
  // A fire cannot act on a count. §2F sends it to the file named here, and the
  // s1061 file probe needs the UNKNOWN's name for exactly the same reason.
  const drain = runCliFull(cliFixture(t, V_DRAIN), []).out;
  assert.match(drain, /REAL DRAINS[^\n]*: 1/, 'the drain bucket must be reported at all');
  assert.ok(drain.includes(SUBJECT), 'the undrained filename must print, not just its count');

  const unknown = runCliFull(cliFixture(t, V_UNKNOWN), []).out;
  assert.match(unknown, /UNKNOWN[^\n]*: 1/);
  assert.ok(unknown.includes(SUBJECT), 'the UNKNOWN filename must print — it owes a file probe');
});

// ---------------------------------------------------------------------------
// F-2211-1 — the CAPTURE, which is upstream of every layer above.
//
// s2210 recorded main()'s catch as the one branch no test reaches, and judged it
// no finding: "it fails LOUD in both directions -- a crash leaves out='', which
// bucketOf classifies as drain." That was measured ACCIDENTALLY, from a stub with
// a quoting fault, and it holds at exactly that one parameterisation.
//
// The catch is not an edge case. drain-block-check exits 1 for EVERY "do not
// drain" verdict, so it is the path every closed and blocked subject travels --
// 8 of 8 on the live board at s2211. An uncaught exception exits 1 too, so the
// exit code cannot separate a verdict from a crash. Only the content can, and
// the shipped code folded stderr into the classified text -- where node has
// written the THROWING SOURCE LINE, out of a file whose own source carries every
// verdict literal it prints (⛔ at :365/:493/:525/:533/:624, UNKNOWN at :429).
//
// MEASURED s2211 on scratch copies, subject truth = A REAL DRAIN in every arm,
// all four invisible to the 18 tests that shipped before this block:
//   * throw on the "⛔ CLOSED" line   -> 'closed'  -> "✅ DRY ... The word is earned."
//   * throw on the "⛔ BLOCKED" line  -> 'closed'  -> "✅ DRY ... The word is earned."
//   * throw on a status="merged" line -> 'merged'  -> "✅ DRY ... The word is earned."
//   * throw on the "? UNKNOWN" line   -> 'unknown' -> "owe a file probe"
//   * CONTROL, no verdict literal     -> 'drain'   -> "⛔ NOT DRY"   (fail-safe)
//
// Three of four print the s1061 banner on a board the classifier never read --
// F-2210-1's own failure, one layer upstream, reached through a different door:
// there the banner lied about the bucket, here the bucket itself is a lie and
// the banner reports it faithfully. So F-2210-1's guard cannot see this, and
// does not: it asserts banner-matches-bucket, and the banner does match.
//
// REUSABLE: a negative result is a measurement and inherits a measurement's
// duties. s2210's was true, honestly reported, and confirmed at ONE arm of a
// five-arm class -- the only arm that happens to be safe. When you record a
// branch as harmless, parameterise the harm before you write "no finding".
// ---------------------------------------------------------------------------

/** A fixture whose stubbed drain-block-check CRASHES on the given source line. */
function crashFixture(t, sourceLine) {
  const root = fixture([ANCHOR, SUBJECT]);
  t.after(() => fs.rmSync(root, { recursive: true }));
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  // The undefined identifier sits INSIDE the verdict line, exactly as a rot in
  // drain-block-check's own template literals would -- so node prints that line,
  // verdict literal and all, into stderr.
  fs.writeFileSync(path.join(root, 'scripts', 'drain-block-check.mjs'), `${sourceLine}\n`);
  return root;
}

const CRASH_ARMS = [
  ['⛔ CLOSED (:493)', 'console.log(`\\n  ⛔ CLOSED — DO NOT DRAIN: ${leafLabel(leaf)}`);'],
  ['⛔ BLOCKED (:365)', 'console.log(`\\n  ⛔ BLOCKED — DO NOT DRAIN: ${targetX}\\n`);'],
  ['? UNKNOWN (:429)', 'console.log(`  ? UNKNOWN — no goal leaf matches "${targetX}".`);'],
  ['status="merged"', 'console.log(`  ✅ CLEAR — x [leaf] status="merged" ${leafX.id}`);'],
];

test('F-2211-1: a CRASH is never classified as the verdict whose line it died on', (t) => {
  // Parameterised across every verdict literal ON PURPOSE: the defect this
  // replaces was recorded as harmless from a single arm, and four of five lie.
  for (const [name, line] of CRASH_ARMS) {
    const { rc, out } = runCliFull(crashFixture(t, line), []);
    assert.equal(rc, 0, 'advisory never gates');
    assert.ok(out.includes('⛔ NOT DRY'), `${name}: a crashed classifier must read NOT DRY`);
    assert.ok(!out.includes('✅ DRY'), `${name}: a crashed classifier must NEVER print the earned banner`);
    assert.ok(!out.includes('owe a file probe'), `${name}: a crash is not an UNKNOWN`);
    assert.ok(out.includes('CLASSIFIER CRASHED'), `${name}: the crash must be named as a crash`);
    assert.ok(out.includes(SUBJECT), `${name}: the affected subject must be named`);
  }
});

test('F-2211-1: --strict gates on a crashed classifier — it is a drain, not a clearance', (t) => {
  for (const [name, line] of CRASH_ARMS) {
    assert.equal(runCli(crashFixture(t, line), ['--strict']), 1, `${name}: must gate like a drain`);
  }
});

test('F-2211-1: a REAL rc=1 verdict still classifies — the cure must not break the live path', (t) => {
  // The reverse control, and the one that matters most in practice: every closed
  // and blocked subject on the board arrives through the catch with rc=1 and its
  // verdict on stdout. A cure that simply ignored the catch would score green on
  // the arms above and silently turn all 8 of them into drains.
  const root = fixture([ANCHOR, SUBJECT]);
  t.after(() => fs.rmSync(root, { recursive: true }));
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'scripts', 'drain-block-check.mjs'),
    'console.log("  ⛔ BLOCKED — DO NOT DRAIN: x.md");\nprocess.exit(1);\n',
  );
  const { rc, out } = runCliFull(root, []);
  assert.equal(rc, 0);
  assert.ok(out.includes('✅ DRY'), 'a genuine rc=1 BLOCKED verdict is a closed subject, not a drain');
  assert.ok(!out.includes('CLASSIFIER CRASHED'), 'a printed verdict is not a crash');
  assert.equal(runCli(root, ['--strict']), 0, 'and it must not gate');
});

test('F-2211-1: the capture refuses stderr, and says so at the unit level too', () => {
  // Per F-2209-1: extracting a decision creates a new seam at the CALL SITE, so
  // the arms above spawn the CLI. These assert the same rule where it is stated.
  const crash = classifiableCapture({
    failed: true, stdout: '', stderr: 'x.mjs:493\nconsole.log(`⛔ CLOSED — DO NOT DRAIN`);\nReferenceError: leafLabel is not defined',
  });
  assert.equal(crash.crashed, true);
  assert.equal(crash.text, '', 'stderr must never reach the classifier');
  assert.equal(bucketOf(crash.text), 'drain', 'and the fall-through must be the loud one');
  assert.match(crash.detail, /ReferenceError/, 'the reader is told what actually broke');

  const verdict = classifiableCapture({ failed: true, stdout: '  ⛔ CLOSED — DO NOT DRAIN: x.md', stderr: '' });
  assert.equal(verdict.crashed, false, 'rc=1 with a printed verdict is a verdict');
  assert.equal(bucketOf(verdict.text), 'closed');

  const ok = classifiableCapture({ failed: false, stdout: '  ? UNKNOWN — no goal leaf matches "x".' });
  assert.equal(ok.crashed, false);
  assert.equal(bucketOf(ok.text), 'unknown');
});
