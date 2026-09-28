#!/usr/bin/env node
/**
 * F-2278-1 (s2278) — status-archive-audit.mjs is leg 10 of `test:ledger-guards`, invoked BARE,
 * and until this file existed it had NO guard coverage of any kind in the repo.
 *
 * THE DEFECT: its argument parsing was one `argv.includes(...)` per flag, so any UNRECOGNISED
 * option was silently swallowed — contradicting the "Exit 2 = misuse" contract in its own header,
 * in the permissive direction, in a gate.
 *
 * MEASURED s2278 against the live board, all three BYTE-IDENTICAL at rc=0 / 252 B:
 *     `--limit 40 --quiet`   <- THE BATTERY LEG, passed since s1341 and NEVER implemented
 *     `--limit 40`
 *     `--limit 40 --strict`  <- a tightening flag a future fire might reach for
 * So the battery's own command line asserted a behaviour the tool did not have, and a caller who
 * believed they had tightened this gate had not. That is F-2209-1's class — a misparsed flag
 * invisible to the suite — with no suite for it to be invisible to.
 *
 * THE SHARPEST ARM is a TYPO of the BOUNDING flag, and its harm is NOT the one first written down.
 * `--lmit 40` left `limit = Infinity`, silently un-bounding the walk. Priced as wall-clock (~5 min
 * against ~2 s) that is an annoyance; MEASURED, it is a VERDICT FLIP — rc=1, 34,804 B, 352 lines,
 * `LOST: 81 handoff line-1s PERMANENTLY absent at HEAD`. Those 81 are exactly the legacy debt
 * s2224 measured and excused (all HISTORICAL, newest 2026-07-27, invisible to the 40-commit
 * regression window BY CONSTRUCTION). One mistyped character turns leg 10 from green into a
 * four-minute RED over known-excused history — and a guard that reds on legacy debt is the guard
 * that gets excused into uselessness (F-1460-1). A bound a typo can silently remove is not a bound.
 *
 * WHY THE ARMS ARE SHAPED THIS WAY. The three TEETH arms are cheap and obvious. The four REVERSE
 * CONTROLS are the ones that decide whether the cure is the RIGHT size, and each was proven by
 * manufacturing the over-general cure it catches:
 *   - refusing on `--quiet` instead of implementing it  -> reds arm 1 (it reds the battery itself)
 *   - letting `--quiet` suppress the DROPPED blocks     -> reds arm 7
 *   - not consuming `--limit`'s value                   -> reds arm 8 (the `40` reads as unknown)
 *   - dropping the stdout half of the refusal           -> reds arm 5 alone
 *
 * The fixture drives the tool through `GR_REPO`, which is the seam its own header already exposes,
 * so no arm touches the live board except the three that are ABOUT the live board.
 *
 * ---------------------------------------------------------------------------------------------
 * F-2401-1 (s2401) — THOSE THREE ARMS PINNED `rc === 0` ON A BOARD THAT IS rc=1 FOR THE ENTIRE
 * WORKING LIFE OF EVERY FIRE THAT HOLDS THE LOCK.
 *
 * §4's normal pattern is: take the lock (which DROPS the predecessor's line-1), do the work,
 * restore the archive in the handoff commit. `status-archive-audit` reads HEAD, so between those
 * two commits it correctly reports `LOST: 1 handoff line-1s PERMANENTLY absent at HEAD` and exits
 * 1. That is the tool being RIGHT -- it is telling the fire it still owes §4's archive.
 *
 * MEASURED s2401 over the last 8 lock commits: 6 of 8 dropped the predecessor archive at lock
 * time, so arms 1, 6 and 8 red on ~75% of fires that run this battery mid-run. Leg 10 itself
 * (`status-archive-audit --limit 40 --quiet`, chained bare) reds for the same reason.
 *
 * SEVERITY, STATED HONESTLY AND NOT INFLATED: this is a FALSE RED, not a false green, and at the
 * PRESCRIBED moment it does not fire at all -- F-1300-4 mandates the battery as the fire's LAST
 * act, AFTER the bookkeeping commit, by which time the archive is restored and rc=0. Nothing was
 * ever wrongly certified. What earns it a cure is F-1460-1's decay path: a red that fires during
 * ordinary correct operation is the red that gets excused, and these three are REVERSE CONTROLS --
 * the arms that decide whether the F-2278-1 cure is the right SIZE. Excused, they protect nothing.
 * It also punishes the mid-fire health check this factory otherwise encourages.
 *
 * THE CURE IS THE DISCRIMINATION THIS REPO ALREADY LIVES BY: rc=2 = "could not answer" (misuse)
 * vs rc=1 = "answered, and the answer refuses". F-2278-1's whole finding was about the MISUSE
 * contract -- every teeth arm asserts rc=2 -- so its reverse controls should assert "NOT a misuse
 * refusal", never "the board is clean". The audit and leg 10 are DELIBERATELY LEFT ALONE: their
 * mid-fire rc=1 is a true and useful reminder of an owed archive, and silencing it would trade a
 * false red for a false green.
 *
 * TEETH, every variant manufactured on scratch copies, each asserting it LOADED and ran all 8 arms
 * before its verdict was believed (F-2400-1's method note: a variant that fails to load prints no
 * `✖ arm N` and is otherwise scored as a clean pass -- F-2215-1's silence-vs-silence trap):
 *   · CONTROL, cured guard on the live board with the lock held  -> NO reds (the false red clears)
 *   · CONTROL, original guard on the same board                  -> reds 1, 6, 8 (reproduces it)
 *   · `--limit` stops consuming its value                        -> reds 1, 6, 8 (teeth intact)
 *   · `--all` stops printing the ok-excluded listing             -> reds 8 ALONE
 *   · the tool CRASHES                                           -> reds ALL 8 (not blind to it)
 *   · a VALID command prints a correct verdict and exits 2       -> reds 1, 6, 8 WITH the rc
 *     assertion and 7 ALONE without it -- so `notEqual(rc, 2)` is LOAD-BEARING, not decoration
 *     (s2226's duty: a manufactured defect that reddens nothing is an unreachable branch).
 *
 * ⚠️ AND A SECOND, SMALLER FINDING FOUND BY THE SAME SWEEP, arm 2. It asserted rc=2 and nothing
 * about WHICH refusal -- so restoring F-2278-1's ORIGINAL defect verbatim (disable the `KNOWN`
 * check) left it GREEN: `--limit 40 --strict` still exits 2, but with "--limit needs a number"
 * from an unrelated path, and only arm 3 reddened, incidentally, on its time bound. The arm NAMED
 * for the defect could not see the defect. It now pins the refusal's reason, and that same defect
 * reds arms 2 and 3. SAME ROOT CAUSE AS THE MAIN FINDING: an exit code alone is an ambiguous
 * observable in a tool with three of them -- assert the MESSAGE, not just the number.
 *
 * ---------------------------------------------------------------------------------------------
 * F-2402-1 (s2402) — THOSE THREE CURED ARMS ARE EXERCISED ONLY BY LUCK OF THE BOARD, AND ON A
 * FIRE THAT ARCHIVES AT LOCK TIME THEY CERTIFY NOTHING ABOUT THE CURE.
 *
 * Arms 1, 6 and 8 read the LIVE board by design -- this header says so itself, in the sentence
 * ending "except the three that are ABOUT the live board" (cite the CONTENT; coordinates drift,
 * and this very amendment moved every line below it). Their rc therefore
 * depends on a choice each fire makes about its OWN lock commit: §4's normal pattern drops the
 * predecessor's line-1 and restores it at handoff (audit -> rc=1, the state the cure is for),
 * but a fire may instead archive the predecessor IN the lock commit (audit -> rc=0, no window).
 *
 * MEASURED s2402 BY MANUFACTURING, on a board of the second kind: the PRE-CURE guard restored
 * verbatim -- `assert.equal(rc, 0)` on arms 1, 6 and 8, i.e. F-2401-1's defect itself -- passes
 * 8 of 8 GREEN. Control asserted its own validity first (F-2215-1): the relocated copy really
 * ran all 8 arms, 26.5 s, beside a copy of the tool so `import.meta.url` still resolved its
 * subject. So on ~25% of fires the cure and the defect are INDISTINGUISHABLE here.
 *
 * SEVERITY, STATED HONESTLY AND DELIBERATELY NOT INFLATED: the cure is CORRECT and s2401 proved
 * it with five scratch variants; nothing is wrong with the assertions and nothing was ever
 * wrongly certified. This is not a false green about the factory's work. What earns it an arm is
 * that an assertion whose EXERCISE depends on the live board is an INTERMITTENT gate -- reds on
 * ~75% of fires, green on the rest -- which is F-2320-1's disease ("the cost is a gate you cannot
 * trust") feeding F-1460-1's decay path, the very path F-2401-1 was written to close.
 *
 * ⚠️ AND IT MISREADS AN INHERITED INSTRUCTION, which is the half worth carrying: s2401's handoff
 * told its successor "when you run test:ledger-guards mid-fire it should now be GREEN while you
 * hold the lock". That is TRUE, and its converse is not -- a green is byte-compatible with the
 * uncured code on a board like s2402's, so a fire reading the green as confirmation would report
 * a cure verified on evidence that says nothing about it. A PREDICTION IS ONLY EVIDENCE IF THE
 * BOARD IT IS READ ON CAN FALSIFY IT.
 *
 * CURE: arm 9 pins the cure's SEMANTICS against the LOST fixture the file already owns, so the
 * contract "rc=1 is a board verdict, never a misuse refusal" is asserted on EVERY fire regardless
 * of which lock discipline that fire chose. It does NOT re-pin arms 1/6/8 -- those are about the
 * live board on purpose, and making them fixture-backed would delete the smoke test of the real
 * battery leg.
 *
 * TEETH for arm 9, every variant manufactured on scratch copies of the TOOL, each sitting beside
 * a copy of the guard so `import.meta.url` still resolved its subject:
 *   · a LOST board refused as misuse (rc=2) — F-2401-1's axis error, tool-side -> reds 7 and 9
 *   · the `across N` denominator dropped                                       -> reds 1, 6 and 9
 *   · `--limit` PRESENT and the board LOST refused as misuse                   -> reds 9 ALONE
 *   · REVERSE CONTROL, a cosmetic no-op beside the same exit                   -> reds NOTHING
 * The third is the one that earns the arm: arm 7 cannot see it (it never passes `--limit`) and
 * arms 1/6/8 cannot see it on a CLEAN board, so on a fire like s2402 it is invisible to all eight.
 *
 * ⚠️ ONE PREDICTION CORRECTED, recorded because this streak's note is that reverse controls keep
 * repricing what their author was surest of: I expected the FIRST variant to be arm 9's unique
 * catch. Arm 7 catches it too. Arm 9's real contribution is the PRESCRIBED FORMS -- the battery
 * leg's own `--limit 40 …` shapes -- against a LOST board, not LOST boards in general.
 *
 * ⓘ ONE THING THE FIXTURE CANNOT CARRY, found by checking what it makes reachable (F-2213-1)
 * rather than by assuming: a 2-commit fixture has NO ok-excluded shapes, so `--all` prints the
 * SAME 460 B as plain there. Arm 8's `--all > plain` size teeth are UNREACHABLE on it and are
 * deliberately NOT duplicated into arm 9; arm 9 asserts only what the fixture can actually prove.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// import.meta.url-anchored: this guard must be correct from any cwd, and a relocated copy must
// still find its subject (the F-2220-1 anchoring rule).
const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const TOOL = path.join(SCRIPTS, 'status-archive-audit.mjs');

const run = (args, env = {}) => {
  const r = spawnSync('node', [TOOL, ...args], {
    timeout: 240_000, killSignal: 'SIGKILL',
    encoding: 'utf8',
    maxBuffer: 64 << 20,
    env: { ...process.env, ...env },
  });
  return { rc: r.status, out: String(r.stdout ?? ''), err: String(r.stderr ?? '') };
};

/**
 * A scratch board carrying exactly ONE manufactured drop: s101 replaces s100's handoff line-1
 * and archives nothing. Ground truth = LOST, so the arms that assert what a RED prints have
 * something real to read.
 */
function fixtureWithOneDrop() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 's2278-arch-'));
  const git = (...a) =>
    execFileSync('git', ['-C', root, '-c', 'user.email=a@b', '-c', 'user.name=c', ...a], { encoding: 'utf8' });
  git('init', '-q', '-b', 'main', '.');
  const write = (l1) => fs.writeFileSync(path.join(root, 'STATUS.md'), `${l1}\n- body bullet\n`);

  write('Last updated: 2026-01-01T00:00Z s100 handoff, lock CLEARED — alpha priorities');
  git('add', 'STATUS.md');
  git('commit', '-q', '-m', 's100 handoff: alpha');

  // s101 replaces s100's line-1 and archives NOTHING — the violation class.
  write('Last updated: 2026-01-01T01:00Z s101 handoff, lock CLEARED — beta priorities');
  git('add', 'STATUS.md');
  git('commit', '-q', '-m', 's101 handoff: beta');
  return root;
}

// ---------------------------------------------------------------- prescribed forms (live board)

test('1. REVERSE CONTROL — the battery leg `--limit 40 --quiet` still succeeds and still reports', () => {
  const r = run(['--limit', '40', '--quiet']);
  // F-2401-1: NOT `rc === 0`. This tool's rc carries TWO axes -- 2 = "could not answer" (misuse)
  // vs 1 = "answered, and the answer refuses" (a LOST verdict) -- and this arm is about the first.
  // A fire holding the lock has, BY CONSTRUCTION, dropped its predecessor's line-1 and not yet
  // restored it (§4's normal pattern), so the audit correctly reports LOST at rc=1 for the whole
  // working life of the fire. Pinning rc=0 made this arm red on 6 of the last 8 fires.
  assert.notEqual(r.rc, 2, 'leg 10 must never REFUSE as misuse; rc=1 is a board verdict, not a parse failure');
  assert.match(r.out, /^(CLEAN|LOST):/m, 'the verdict line always prints, however quiet the caller asked for');
  assert.match(r.out, /across \d+ STATUS\.md commits/, 'the examined denominator stays declared (s2224)');
});

test('2. TEETH — an unrecognised option REFUSES with 2 rather than being swallowed', () => {
  const r = run(['--limit', '40', '--strict']);
  assert.equal(r.rc, 2, '`--strict` was byte-identical to passing nothing before this cure');
  // F-2401-1: rc=2 ALONE is satisfied by ANY refusal, so this arm -- the one named for F-2278-1 --
  // was blind to F-2278-1's own defect. MEASURED: disabling the KNOWN check makes `--limit 40
  // --strict` refuse with "--limit needs a number" instead, still rc=2, and this arm stayed GREEN
  // while only arm 3 reddened (incidentally, on its time bound). Pin WHICH refusal.
  assert.match(r.out, /unrecognised option/, 'and it must refuse for THAT reason, not some other');
  assert.doesNotMatch(r.out, /^CLEAN:/m, 'a refusal must not also render an affirmative verdict');
});

test('3. TEETH — a TYPO of the bounding flag refuses, and does so BOUNDED in time', () => {
  const t0 = Date.now();
  const r = run(['--lmit', '40']);
  const ms = Date.now() - t0;
  assert.equal(r.rc, 2, '`--lmit` silently left limit=Infinity before this cure');
  // The real harm is the VERDICT FLIP, so assert that first: pre-cure this exited 1 with
  // `LOST: 81 handoff line-1s PERMANENTLY absent` over legacy debt the 40-commit window excludes.
  assert.notEqual(r.rc, 1, 'a typo must not red the battery over excused legacy history');
  assert.doesNotMatch(r.out, /^LOST:/m, 'and must not render that false red as a verdict');
  // The wall-clock half is real too — pre-cure this ran ~5 minutes before reaching its false red.
  assert.ok(ms < 30_000, `the refusal must be immediate, not an unbounded walk (took ${ms} ms)`);
});

test('4. TEETH — a non-positive limit refuses instead of printing CLEAN over an empty corpus', () => {
  for (const n of ['0', '-1']) {
    const r = run(['--limit', n]);
    assert.equal(r.rc, 2, `--limit ${n} examines nothing; CLEAN over an empty corpus is F-2217-1's polarity`);
    assert.doesNotMatch(r.out, /^CLEAN:/m, `--limit ${n} must not render an all-clear`);
  }
});

test('5. REVERSE CONTROL — the refusal reaches STDOUT, not stderr alone (F-2211-1)', () => {
  const r = run(['--hunter2']);
  assert.equal(r.rc, 2);
  assert.match(r.out, /REFUSING \(misuse\)/, 'a caller that classifies stdout reads an empty string as silence');
  assert.match(r.err, /REFUSING \(misuse\)/, 'and the human channel keeps it too');
});

test('6. REVERSE CONTROL — `--limit N` consumes its value, so the number is not read as an option', () => {
  const r = run(['--limit', '40']);
  // F-2401-1: this arm is about ARGUMENT PARSING, not about the board's verdict. rc=2 is the only
  // outcome that means "the parse failed"; the `across 40` regex below carries the positive teeth.
  assert.notEqual(r.rc, 2, 'if the value were not consumed, "40" itself would refuse as unrecognised (rc=2)');
  assert.match(r.out, /across 40 STATUS\.md commits/, 'and the bound must still be the one asked for');
});

// ------------------------------------------------------------------- what a RED prints (fixture)

test('7. REVERSE CONTROL — `--quiet` must NOT suppress the DROPPED blocks or the verdict', () => {
  const root = fixtureWithOneDrop();
  try {
    const loud = run([], { GR_REPO: root });
    // F-2215-1: assert the control arm reached the state it is about to measure.
    assert.equal(loud.rc, 1, 'the fixture must actually produce a LOST verdict, or this arm proves nothing');
    assert.match(loud.out, /^DROPPED /m, 'and it must actually print a DROPPED block');

    const quiet = run(['--quiet'], { GR_REPO: root });
    assert.equal(quiet.rc, 1, '--quiet must never turn a red into a green');
    assert.match(quiet.out, /^DROPPED /m, 'a gate that reds while withholding what it found is worse than a chatty one');
    assert.match(quiet.out, /^LOST:/m, 'the verdict line is not advisory chatter');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('8. REVERSE CONTROL — `--all` still lists the excluded shapes; the cure did not break advisory output', () => {
  const plain = run(['--limit', '40']);
  const all = run(['--limit', '40', '--all']);
  // F-2401-1: as arm 6 -- this is about `--all` still producing its listing, not about the verdict.
  assert.notEqual(all.rc, 2);
  assert.ok(
    all.out.length > plain.out.length,
    `--all must still add the ok-excluded listing (plain ${plain.out.length} B vs --all ${all.out.length} B)`,
  );
  assert.match(all.out, /^ok-excluded /m, 'and that listing is what --all names');
});

// ------------------------------------------------- the cure's semantics, pinned board-INDEPENDENTLY

test('9. TEETH — on a board that IS LOST, every prescribed form answers with 1 and never refuses as 2', () => {
  // F-2402-1: arms 1, 6 and 8 meet this state only when the fire's own lock discipline happens to
  // produce it (~75% of fires, s2401). This arm manufactures it, so the contract the F-2401-1 cure
  // established -- rc=1 is a BOARD VERDICT, rc=2 is a MISUSE refusal, and they are not the same
  // axis -- is exercised on every fire regardless of the board it runs on.
  const root = fixtureWithOneDrop();
  try {
    for (const form of [['--limit', '40', '--quiet'], ['--limit', '40'], ['--limit', '40', '--all']]) {
      const r = run(form, { GR_REPO: root });
      const label = form.join(' ');
      // F-2215-1: assert the arm REACHED the state it is about to measure. A fixture that silently
      // stopped producing a LOST board would make every assertion below vacuous.
      assert.match(r.out, /^LOST:/m, `${label}: the fixture must actually be LOST, or this arm proves nothing`);
      assert.notEqual(r.rc, 2, `${label}: a LOST board is an ANSWER; refusing it as misuse is the F-2401-1 defect`);
      assert.equal(r.rc, 1, `${label}: and the answer that refuses is exit 1`);
      assert.match(r.out, /across \d+ STATUS\.md commits/, `${label}: the examined denominator stays declared (s2224)`);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

// ------------------------------------------- F-2673-1: the unbounded walk states its price FIRST

/**
 * A copy of the subject with one source string replaced, run from a temp dir.
 *
 * SAFE FOR THIS SUBJECT, CHECKED RATHER THAN ASSUMED (F-2672-2, s2672): relocating a script
 * breaks any RELATIVE import it carries, and a variant that cannot LOAD exits non-zero with no
 * output -- indistinguishable at a glance from a variant the guard correctly refused.
 * `status-archive-audit.mjs` imports only node builtins (`node:child_process`, `node:fs`), so the
 * copy survives the trip. The arms below assert control validity (`out.length > 0`) anyway,
 * because that assertion is what turned F-2672-2 from a silent false green into a loud red.
 */
function variantOf(find, replace) {
  const src = fs.readFileSync(TOOL, 'utf8');
  assert.ok(src.includes(find), `the variant anchor must still exist in the subject: ${find}`);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's2674-var-'));
  const p = path.join(dir, 'status-archive-audit.mjs'); // .mjs is load-bearing: node keys ESM on the extension
  fs.writeFileSync(p, src.replace(find, replace));
  return p;
}

const runTool = (tool, args, env = {}) => {
  const r = spawnSync('node', [tool, ...args], {
    timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8', maxBuffer: 64 << 20,
    env: { ...process.env, ...env },
  });
  return { rc: r.status, out: String(r.stdout ?? ''), err: String(r.stderr ?? '') };
};

test('10. F-2673-1 — the UNBOUNDED walk announces its price BEFORE it walks, not after', () => {
  const root = fixtureWithOneDrop();
  try {
    const r = run([], { GR_REPO: root });
    // F-2215-1: the fixture must reach the state being measured, or the ordering proves nothing.
    assert.equal(r.rc, 1, 'control validity: this fixture is LOST, so there IS a walk to precede');
    assert.match(r.out, /^UNBOUNDED WALK \(no --limit\)/m, 'a bare run must name itself as unbounded');
    assert.match(r.out, /price\s+: (~\d+ ms per blob read|UNKNOWN)/, 'and must state what the walk COSTS');
    assert.match(r.out, /ANSWER ALREADY KNOWN \(live board\)/, 'and the verdict already written down (F-2278-1)');

    // THE LOAD-BEARING ASSERTION. "Before starting" is the entire gate: a price printed after ten
    // minutes of grinding is not a price, it is a receipt. Ordering is checked by POSITION in
    // stdout, which is what a reader actually experiences, and it is what breaks if the block is
    // ever moved below the loop.
    assert.ok(
      r.out.indexOf('UNBOUNDED WALK') < r.out.indexOf('DROPPED '),
      'the announcement must precede the findings it prices -- a receipt is not a warning',
    );
    assert.ok(
      r.out.indexOf('UNBOUNDED WALK') < r.out.search(/^(CLEAN|LOST):/m),
      'and it must precede the verdict line for the same reason',
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('11. F-2673-1 — a caller who CHOSE a bound is not lectured (one population, not two)', () => {
  const root = fixtureWithOneDrop();
  try {
    for (const form of [['--limit', '40'], ['--limit', '40', '--quiet']]) {
      const r = run(form, { GR_REPO: root });
      assert.ok(r.out.length > 0, `control validity: ${form.join(' ')} really ran`);
      assert.doesNotMatch(
        r.out, /UNBOUNDED WALK/,
        `${form.join(' ')}: the announcement belongs to the unbounded path ALONE -- the battery leg's output is a contract`,
      );
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('12. TEETH — remove the announcement and arm 10 goes blind, while nothing else moves', () => {
  const root = fixtureWithOneDrop();
  // The mutation is the regression this cure exists to forbid: the announcement suppressed, the
  // walk unchanged. If rc or the verdict moved too, arm 10 could be passing on some OTHER signal.
  const stripped = variantOf('if (limit === Infinity) {', 'if (false) {');
  try {
    const cured = runTool(TOOL, [], { GR_REPO: root });
    const variant = runTool(stripped, [], { GR_REPO: root });
    assert.ok(cured.out.length > 0 && variant.out.length > 0, 'control validity: both really ran (F-2672-2)');

    assert.match(cured.out, /UNBOUNDED WALK/, 'the cured subject announces');
    assert.doesNotMatch(variant.out, /UNBOUNDED WALK/, 'the variant does not -- so arm 10 has something to catch');

    // ADDITIVE, PROVEN: the announcement changes what a reader LEARNS, never what the gate DECIDES.
    assert.equal(variant.rc, cured.rc, 'the announcement must not touch rc');
    assert.equal(
      variant.out.match(/^(CLEAN|LOST):.*$/m)?.[0],
      cured.out.match(/^(CLEAN|LOST):.*$/m)?.[0],
      'nor the verdict line -- if these differed, the cure would be changing the answer, not pricing it',
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(path.dirname(stripped), { recursive: true, force: true });
  }
});
