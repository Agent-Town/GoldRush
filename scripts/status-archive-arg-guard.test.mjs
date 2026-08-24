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
  assert.equal(r.rc, 0, 'leg 10 of test:ledger-guards must keep passing on a clean board');
  assert.match(r.out, /^(CLEAN|LOST):/m, 'the verdict line always prints, however quiet the caller asked for');
  assert.match(r.out, /across \d+ STATUS\.md commits/, 'the examined denominator stays declared (s2224)');
});

test('2. TEETH — an unrecognised option REFUSES with 2 rather than being swallowed', () => {
  const r = run(['--limit', '40', '--strict']);
  assert.equal(r.rc, 2, '`--strict` was byte-identical to passing nothing before this cure');
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
  assert.equal(r.rc, 0, 'if the value were not consumed, "40" itself would refuse as unrecognised');
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
  assert.equal(all.rc, 0);
  assert.ok(
    all.out.length > plain.out.length,
    `--all must still add the ok-excluded listing (plain ${plain.out.length} B vs --all ${all.out.length} B)`,
  );
  assert.match(all.out, /^ok-excluded /m, 'and that listing is what --all names');
});
