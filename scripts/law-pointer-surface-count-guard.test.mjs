/**
 * law-pointer-surface-count-guard.test.mjs — F-2412-1.
 *
 * THE DEFECT: `law-pointer-guard.mjs` printed its headline as `SURFACES.length + 1`. The literal
 * stood for the goal ledger, which the file scans as a seventh corpus in a structurally different
 * arm (it walks JSON `blockedReason` fields, not markdown). The number was CORRECT and moved no
 * verdict — but it was TRANSCRIBED, which is precisely what that file's own SCAN_FAMILIES comment
 * forbids in its own words ("derive from the file, never transcribe -- a hardcoded description is
 * a defect awaiting the next edit"), and the corpus it stood for was named NOWHERE in the output.
 * Measured s2412: `goals.json` appeared 0 times in stdout, at --report verbosity too, and
 * contributed 0 pointers — so a reader comparing "surfaces : 7" against a CLOSED six-entry list
 * could not resolve the discrepancy and could not discover the seventh by reading harder.
 *
 * WHAT THIS ASSERTS, and why each arm exists rather than being decoration — every arm was proven by
 * MANUFACTURING the defect (the house standard: a passing guard never executes its violation path,
 * so its green is not evidence about its red). Arms 1-3 and 7 read a real spawn of the real subject;
 * 4-6 read the source, for the measured reason written above them:
 *
 *   1. the headline DECOMPOSES — a bare count is a boundary only its author sees (F-2196-1)
 *   2. the headline is SELF-CONSISTENT — total == law surfaces + named extras
 *   3. the extra corpus is NAMED — this is the whole finding
 *   4. the count is DERIVED from SCANNED_SURFACES, with no literal and no "+ N" (catches variant A,
 *      a re-transcription of the original defect)
 *   5. REVERSE CONTROL: the law-surface component is derived too, so growing LAW_SURFACES is not
 *      a red. A guard that hardcodes 6 would red the day someone lawfully adds a surface, and be
 *      excused into uselessness inside a week (F-1460-1, the `cross-engine` fate). Catches variant D.
 *   6. REVERSE CONTROL, and the destructive direction: LAW_SURFACES must NOT contain the ledger.
 *      The tempting "simplification" — fold `tasks/goals.json` into the list and drop the +1 —
 *      keeps the headline reading 7 and silently feeds a JSON file to the MARKDOWN pointer loop.
 *   7. the declaration prints on the HAPPY PATH at rc=0 (F-2342-1's rule, and F-2210-1's: this
 *      tool's real interface is stdout, so asserting the exit code alone tests the half nobody
 *      reads).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { LAW_SURFACES } from './law-surfaces.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SUBJECT = path.join(HERE, 'law-pointer-guard.mjs');

/**
 * Run a script against the real repo root. --root exists precisely so a relocated copy stays correct.
 *
 * EVERY spawn is BOUNDED, and that is not decoration — it was paid for while building this guard.
 * s2412's first draft spawned unbounded; a run wedged, `spawnSync` waited forever, and killing the
 * parent orphaned the child to PPID 1 at 0% CPU, where it sat contending with the next attempt. A
 * hang is the ONE failure a battery leg must never have: a red names a subject and a hang names
 * nothing, stalls the fire that is running its mandated last act, and looks identical to slowness.
 * Bounded, the same event is a LOUD failure with the command in the message.
 */
function spawnOnce(script, args) {
  return spawnSync('node', [script, '--root', ROOT, ...args],
    { encoding: 'utf8', maxBuffer: 64 << 20, timeout: 60_000, killSignal: 'SIGKILL' });
}

function run(script, args = []) {
  let r = spawnOnce(script, args);
  // RETRY EXACTLY ONE FAILURE MODE, AND ONLY THIS ONE (F-2412-2). Measured s2412: spawning a node
  // child from inside `node --test` wedges on this machine roughly 1 run in 10 — the same subject
  // spawned from a plain node parent is 10/10 and 12/12 clean at ~190 ms, so the cliff is 150x and
  // belongs to the arrangement, not the subject. It is UNRESOLVED, and this retry does not pretend
  // otherwise; it bounds the blast radius while the cause is unknown.
  //
  // WHAT IT DELIBERATELY DOES NOT COVER: an assertion failure is never retried, so a genuine
  // regression still reds on the first attempt. Only ETIMEDOUT — a verdict the subject never
  // produced — gets a second chance, and a second timeout fails LOUD with both attempts named.
  // "Raise the bound until it goes green" is the thing F-1410-2 forbids; this changes no bound.
  //
  // ⚠️ AMENDED s2413 (F-2413-1) — THE STATED CONDITION ABOVE IS MEASURABLY INSUFFICIENT, AND THE
  // NEXT FIRE MUST NOT INHERIT IT AS THE REPRODUCING RECIPE. s2412 priced the aim as "a node child
  // spawned from inside `node --test` at battery concurrency" and asked its successor to EXTEND its
  // controls into exactly that parameterisation. s2413 did, and it does NOT reproduce:
  //   arm 1  trivial child (`node -e`), 18 files x 4 spawns, `node --test`, concurrency 16
  //          -> 12/12 clean, 864 passing assertions, 346-362 ms, ZERO wedges
  //   arm 2  the REAL subject as the child (law-pointer-guard.mjs, 245 ms / 14 KB stdout solo),
  //          same parent, same concurrency -> 12/12 clean, 432 assertions, 1099-1163 ms, ZERO
  //   arm 3  the real `test:ledger-guards` battery itself, 4 runs -> 4/4 green, 948 assertions
  //          each, 87.7-99.3 s. A fired retry costs a full 60 s bound, so a retried run reads
  //          ~150 s; nothing exceeded 100 s, so no retry fired in any of the four.
  // 28 runs at or beside the production condition, 0 wedges. So the `node --test` parent is NOT
  // the sufficient condition, and neither is a heavy child: something s2412's arrangement had and
  // all three of these lack is still unnamed.
  //
  // 🚫 THE RETRY STAYS, AND THAT IS THE POINT OF RECORDING THIS RATHER THAN DELETING IT. A failure
  // to reproduce is NOT a proof of absence — s2412 caught its wedge with a real transcript (15 B of
  // stdout, the bare TAP header, zero arms reported) and the mandated battery later named the arm
  // and the ETIMEDOUT outright. What is refuted is the RECIPE, not the event. Removing the retry on
  // this evidence would re-arm a hang that stalls a fire's mandated last act, to buy nothing.
  //
  // 💡 METHOD NOTE, worth more than the result: arm 1's FIRST run reported pass=0 and read as "the
  // arm never ran". It had run perfectly — node v26's default reporter is `spec` (`ℹ pass N`), not
  // TAP (`# pass N`), and the harness matched only the TAP form. It was caught solely because the
  // harness prints its own validity line FIRST (F-2215-1). A control whose failure mode is silence
  // cannot be told from the silence it measures, and a parser is one more way to manufacture it.
  if (r.error && r.error.code === 'ETIMEDOUT') {
    const first = r;
    r = spawnOnce(script, args);
    assert.ok(!r.error, `spawn timed out TWICE (${first.error.code}, ${r.error && r.error.code}): node ${script} — this is no longer the F-2412-2 flake, investigate the subject`);
  }
  assert.ok(!r.error, `spawn failed (${r.error && r.error.code}): node ${script}`);
  assert.ok(r.stdout.length > 200, `arm produced only ${r.stdout.length} B — it did not really run (F-2215-1)`);
  return r;
}

/**
 * The happy-path run, taken ONCE and shared. Four arms below ask different questions of the SAME
 * stdout, and spawning it four times bought nothing but four more chances to wedge.
 *
 * THE FAILURE IS SHARED TOO, AND THAT HALF WAS MISSING UNTIL s2415 (F-2415-1). `happyPath ??= run()`
 * memoises a VALUE, never a THROW: when run() threw, nothing was cached and the next arm re-ran it
 * from scratch. So the invariant this comment states held on the happy path and INVERTED on exactly
 * the path it was written to protect. MEASURED, not reasoned — an instrumented scratch copy whose
 * subject is a 600 s hang, bound lowered 60_000 -> 1_000 to keep the experiment cheap (a deviation
 * that changes each attempt's DURATION, never the control flow being counted): 8 spawns, i.e. all
 * four arms x two attempts each, where the comment above promises one.
 *
 * WHAT THAT COSTS, PRICED HONESTLY AND IN TWO REGIMES, because they differ and only one is dear:
 *   - INTERMITTENT flake (the F-2412-2 event): cheap either way. Arm 1 burns its retry; the other
 *     three re-run and almost certainly succeed in ~250 ms. Little is lost, which is why no fire
 *     noticed.
 *   - PERSISTENT hang (a bad edit puts the subject in a loop): 8 x 60 s = up to EIGHT MINUTES before
 *     the battery says so, against a normal wall of 77-99 s, at the fire's mandated last act
 *     (F-1300-4). Caching the rejection makes that 2 x 60 s and names the same cause.
 *
 * NOT a false green — it fails LOUD in both regimes, and the realised cost to date is ZERO. The
 * defect is wall time at the worst possible moment, plus a comment a future reader would reason from.
 * The resilience given up is the accidental kind (three arms independently recovering); it costs up
 * to six extra 60 s spawns to buy a red the battery was going to show anyway.
 */
let happyPath;
let happyFailure;
const happy = () => {
  if (happyFailure) throw happyFailure;
  if (happyPath) return happyPath;
  try {
    happyPath = run(SUBJECT);
  } catch (e) {
    happyFailure = e;
    throw e;
  }
  return happyPath;
};

const headlineOf = (stdout) => stdout.split('\n').find((l) => l.includes('surfaces      :')) ?? '';

test('1. the surfaces headline decomposes rather than printing a bare count', () => {
  const line = headlineOf(happy().stdout);
  assert.match(line, /surfaces\s+: \d+\s+\(/, `headline does not decompose: ${line}`);
});

test('2. the headline is self-consistent: total == law surfaces + named extras', () => {
  const line = headlineOf(happy().stdout);
  const m = line.match(/surfaces\s+: (\d+)\s+\((\d+) law surface\(s\)(?:, no other corpus|\s\+\s(.+))\)/);
  assert.ok(m, `headline did not parse: ${line}`);
  const total = Number(m[1]);
  const law = Number(m[2]);
  const extras = m[3] ? m[3].split(', ').filter(Boolean) : [];
  assert.equal(law, LAW_SURFACES.length, 'law-surface component disagrees with the shared list');
  assert.equal(total, law + extras.length, `total ${total} != ${law} + ${extras.length} named extras`);
});

test('3. the extra scanned corpus is NAMED — the finding itself', () => {
  const out = happy().stdout;
  assert.match(headlineOf(out), /tasks\/goals\.json/, 'the goal ledger is counted but never named');
});

/**
 * ARMS 4 AND 5 ARE STATIC, AND THE DOWNGRADE IS DELIBERATE, MEASURED, AND WORTH MORE THAN THE
 * TEETH IT COSTS (F-2412-2, corrected s2412 by the battery itself).
 *
 * Both arms originally spawned a RELOCATED COPY of the subject from `os.tmpdir()` and read the
 * headline it printed — genuinely stronger evidence, because it proved the number FOLLOWS the list
 * rather than merely that the source says it should. In the mandated `test:ledger-guards` run, under
 * ~100 concurrent test files, arm 4's tmpdir spawn hit its 60 s bound and RED THE BATTERY.
 *
 * That result also CORRECTED my own diagnosis, which is why it is written here rather than quietly
 * fixed: I had recorded the hang as a `node --test` STARTUP flake on the evidence that a caught hang
 * showed 15 bytes and zero arms reporting, and had banked it as unattributable. The battery named the
 * exact command — the relocated variant — so the earlier reading was measuring a different
 * manifestation and generalised from it. A negative result inherits a measurement's duties; this one
 * failed them, and the correction belongs next to the claim.
 *
 * THE TRADE, STATED PLAINLY: a static assertion cannot see a behavioural regression that leaves the
 * source shape intact. What it CAN see is every regression the manufactured variants actually
 * produced — re-transcribing `+ 1` (variant A) and hardcoding the law-surface component (variant D)
 * are both edits to this exact expression. And a battery leg that intermittently wedges the fire
 * running its mandated last act is a worse instrument than a slightly weaker one: a red names a
 * subject, a hang names nothing. The behavioural proof is retained where it is stable — arms 1, 2, 3
 * and 7 read a real spawn of the real subject, a pattern measured 10/10 and 12/12 clean.
 */
const subjectSource = () => fs.readFileSync(SUBJECT, 'utf8');
const headlineStatement = () => {
  const line = subjectSource().split('\n').find((l) => l.includes('console.log(`  surfaces'));
  assert.ok(line, 'the headline statement was not found — re-derive this arm against the subject');
  return line;
};

test('4. the count is DERIVED from the scanned list, not transcribed', () => {
  const src = subjectSource();
  assert.match(src, /const SCANNED_SURFACES = \[\.\.\.SURFACES, GOAL_LEDGER\];/,
    'the derived scanned-surface list is gone — the count has nothing to follow');
  const stmt = headlineStatement();
  assert.match(stmt, /\$\{SCANNED_SURFACES\.length\}/, `the total is not read from the derived list: ${stmt}`);
  assert.doesNotMatch(stmt, /SURFACES\.length \+ \d/, `the transcribed "+ N" is back: ${stmt}`);
  assert.doesNotMatch(stmt, /:\s*\d+\s/, `a literal count is baked into the headline: ${stmt}`);
});

test('5. REVERSE CONTROL: the law-surface component is derived too, so growing LAW_SURFACES is lawful', () => {
  const stmt = headlineStatement();
  assert.match(stmt, /\$\{SURFACES\.length\} law surface/,
    `the law-surface component is hardcoded — it would lie the day a surface is lawfully added: ${stmt}`);
  assert.match(stmt, /extraCorpora/, `the named extras are not derived: ${stmt}`);
});

test('6. REVERSE CONTROL: the goal ledger must NOT be folded into LAW_SURFACES', () => {
  assert.ok(
    !LAW_SURFACES.includes('tasks/goals.json'),
    'tasks/goals.json is in LAW_SURFACES — it would be fed to the MARKDOWN pointer loop, which is not what scans it',
  );
});

test('7. the declaration prints on the happy path, at an unchanged exit code', () => {
  const r = happy();
  assert.equal(r.status, 0, 'the advisory declaration must not move the exit code');
  assert.ok(headlineOf(r.stdout).length > 0, 'headline absent on a green run — a declaration that appears only on failure re-creates the ambiguity it removes (F-2208-1)');
});

/**
 * ARM 8 IS STATIC, FOR THE SAME MEASURED REASON ARMS 4 AND 5 ARE (F-2415-1).
 *
 * The behavioural proof exists and is what produced this cure — an instrumented scratch copy over a
 * hanging subject, 8 spawns before and 2 after — but reproducing it here means putting a deliberate
 * WEDGE inside the battery leg whose entire purpose is never to wedge. That trade was already made
 * and written down thirty lines up; this arm honours it rather than re-opening it.
 *
 * WHAT IT CANNOT SEE, DECLARED: a rewrite that keeps both identifiers and still re-spawns per arm.
 * WHAT IT DOES SEE is the regression that actually threatens this file — a tidying pass restoring the
 * pre-cure one-liner, which is the exact shape s2415 measured at 8 spawns.
 *
 * IT MATCHES WHOLE TRIMMED CODE LINES, NEVER THE RAW FILE, AND THAT IS NOT STYLE — IT IS THE BUG THIS
 * ARM SHIPPED WITH FOR ITS FIRST DRAFT. Reading itself with a substring needle, the arm RED ON THE
 * CURED FILE, because the prose above quoted the very shape it forbids. A self-reading guard whose own
 * documentation satisfies its own needle is the `pgrep`-inside-the-command-it-probes tautology wearing
 * a new costume; line equality is immune to anything written in a comment.
 */
const MEMO_PRE_CURE = 'const happy = () => (happyPath ??= run(SUBJECT));';
const MEMO_RETHROW = 'if (happyFailure) throw happyFailure;';
const MEMO_CACHE = 'happyFailure = e;';

test('8. the shared happy-path run shares its FAILURE too, not only its value (F-2415-1)', () => {
  const codeLines = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8')
    .split('\n').map((l) => l.trim());
  assert.ok(!codeLines.includes(MEMO_PRE_CURE),
    'the `??=` memo is back: it caches a value but never a throw, so a wedged subject is re-spawned by every arm (measured s2415: 8 spawns, up to 8 min at the mandated last act)');
  assert.ok(codeLines.includes(MEMO_RETHROW),
    'the cached failure is no longer re-thrown — each arm would pay the wedge again');
  assert.ok(codeLines.includes(MEMO_CACHE),
    'the failure is never cached, so the shared run is shared on success only');
});
