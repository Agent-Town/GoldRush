#!/usr/bin/env node
/**
 * status-line1-desk-displacement-guard.test.mjs — does `status-line1.mjs set` refuse to
 * drop the OWNER'S DESK off the board? (F-2671-2, filed s2671, cured and guarded s2673.)
 *
 * WHY THIS EXISTS
 * ---------------
 * s2671 took the lock with `set`, and s2670's 7,974-char handoff line — the desk header
 * and all three items with it — left the board at 20:26:30 and lived in git alone for
 * eleven minutes. The behaviour was DOCUMENTED (status-line1.mjs:43-48 says plainly that
 * `set` does not archive); s2671 had just read that block for its `{STAMP}` contract and
 * dropped the line anyway. F-2671-2's gate asked for a refusal or a loud warning, and
 * deliberately did not cure it in the fire that found it, because the fix belongs in the
 * tool every fire reads.
 *
 * The desk is the one surface whose whole purpose is to be read by the owner WITHOUT a
 * git command, so "it is still in git" is not a defence.
 *
 * WHAT THIS ASSERTS, AND THE CONTROLS THAT BOUND IT
 * -------------------------------------------------
 * The predicate refuses only when ALL THREE hold: the displaced line carries a desk, the
 * new line does not carry it forward intact, and no archive bullet below already holds the
 * displaced line. So the arms come in pairs — each refusal arm is matched by a LAWFUL arm
 * that must still pass, because a guard that also reds on correct work is the guard that
 * gets excused into uselessness (F-1460-1).
 *
 *   1  CONTROL VALIDITY  the mutated (pre-cure) subject ACCEPTS the drop — proving the
 *                        harness manufactures the real defect and arms 2-3 are not
 *                        vacuous (F-2215-1: assert the control before trusting the teeth).
 *   2  TEETH             the real subject REFUSES it, rc 1, naming F-2671-2.
 *   3  ATOMICITY         ...and STATUS.md is BYTE-UNCHANGED. A refusal that has already
 *                        written the file is not a refusal, and this is the arm that would
 *                        catch the check being moved below the write.
 *   4  LAWFUL: carried   new line carries the tail verbatim -> passes (this is the habit
 *                        F-2671-2 prescribes; if it reds, the cure has banned its own cure).
 *   5  LAWFUL: archived  the displaced line is already in a bullet below -> passes.
 *   6  LAWFUL: no desk   the displaced line never had a desk -> passes.
 *   7  LAWFUL: handoff   `handoff` preserves by construction and is never checked.
 *   8  OVERRIDE          --allow-desk-drop proceeds AND warns on stderr, so a ruled item
 *                        leaving the tail stays possible but never silent.
 *   9  NON-F-ID ITEM     a desk item keyed `b1-...` rather than `F-...` is still protected
 *                        by the 🔺 count arm -> refused.
 *  10  REVERSE OF 9      the same shape with every item kept -> passes, so arm 9 is
 *                        measuring the loss and not merely the presence of a backtick key.
 *
 * THE SUBJECT IS COPIED, WHICH IS SAFE HERE AND WAS NOT ELSEWHERE (F-2672-2, s2672): a
 * copied variant of a script that imports a relative sibling dies on ERR_MODULE_NOT_FOUND
 * before executing a line, and an arm that cannot LOAD is indistinguishable at a glance
 * from an arm that correctly refused. `status-line1.mjs` has no local imports, and arm 1
 * proves the copy runs by making it SUCCEED rather than fail.
 */

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SUBJECT = fileURLToPath(new URL('./status-line1.mjs', import.meta.url));

const DESK_TAIL =
  "🔺 **OWNER'S DESK — 3 awaiting a word.** " +
  '🔺 **F-2642-3** — the account-registry deploy day. ' +
  '🔺 **`b1-device-verdict-rows`** (B1) — the device verdict rows. ' +
  '🔺 **F-2299-1** — revoke the August Claude Code token.';

const HANDOFF_LINE = `Last updated: 2026-09-24T22:22Z s2672 handoff, lock CLEARED — landed the thing. ${DESK_TAIL}`;
const LOCK_NO_DESK = 'ACTIVE 2026-09-24T23:28Z (s2673 fire) — taking the lock, no desk carried.';
const LOCK_WITH_DESK = `ACTIVE 2026-09-24T23:28Z (s2673 fire) — taking the lock. ${DESK_TAIL}`;

const BODY = ['', '- **s2671 handoff (line-1 archive):** an older line, kept.', '', 'Board notes.', ''];

/**
 * Build a throwaway board: <tmp>/scripts/status-line1.mjs beside <tmp>/STATUS.md, because
 * the subject resolves STATUS.md as `../STATUS.md` from its own location.
 * `mutate` (optional) edits the copied source, which is how the pre-cure control is made.
 */
// Every fixture this file makes is removed when the file's tests end (F-1335-5: a leaked mkdtemp dir reds
// scripts/fixture-teardown.test.mjs and, through it, test:node-guards; measured 2026-09-25 by the pp3 drain,
// F-PP3-5: 328 survivors of this file and its s2677 sibling in the host tmpdir). The literal prefix stays at
// the mkdtemp call site because the sweep's extractor is a regex over this source.
const FIXTURES = [];
after(() => { for (const d of FIXTURES) rmSync(d, { recursive: true, force: true }); });

function board({ line1, extraBullets = [], mutate }) {
  const dir = mkdtempSync(join(tmpdir(), 's2673-desk-'));
  FIXTURES.push(dir);
  mkdirSync(join(dir, 'scripts'));
  const tool = join(dir, 'scripts', 'status-line1.mjs');
  copyFileSync(SUBJECT, tool);
  if (mutate) writeFileSync(tool, mutate(readFileSync(tool, 'utf8')), 'utf8');

  const status = join(dir, 'STATUS.md');
  writeFileSync(status, [line1, ...extraBullets, ...BODY].join('\n'), 'utf8');
  return { dir, tool, status };
}

/**
 * spawnSync, NOT execFileSync — and the difference was caught by arm 8 rather than reasoned
 * about. execFileSync RETURNS stdout only, so this harness reported `stderr: ''` for every
 * run that exited 0, and arm 8's whole subject is a warning printed on a SUCCESSFUL run.
 * The first draft therefore redded against a correct subject: a harness blind spot wearing
 * the costume of a missing feature. Arms 4-7 and 10 were blind the same way and silently
 * passed, which is the direction that would have mattered later.
 */
function run(tool, args, cwd) {
  const r = spawnSync('node', [tool, ...args], { encoding: 'utf8', cwd });
  return { rc: r.status ?? 1, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

function textfile(dir, name, content) {
  const p = join(dir, name);
  writeFileSync(p, content, 'utf8');
  return p;
}

// The pre-cure source: the call is the whole cure, so removing it restores s2671's tool.
const REMOVE_CURE = (src) => {
  const needle = '    assertDeskSurvives(lines[0], next, lines, allowDrop);\n';
  assert.ok(src.includes(needle), 'mutation target not found — re-read the subject, do not assume');
  return src.replace(needle, '');
};

test('1 CONTROL VALIDITY — the pre-cure subject accepts the drop, so the harness is real', () => {
  const b = board({ line1: HANDOFF_LINE, mutate: REMOVE_CURE });
  const f = textfile(b.dir, 'new.txt', LOCK_NO_DESK);
  const r = run(b.tool, ['set', f], b.dir);

  assert.equal(r.rc, 0, `pre-cure tool should succeed; stderr: ${r.stderr}`);
  const after = readFileSync(b.status, 'utf8');
  assert.ok(!after.includes("OWNER'S DESK"), 'the manufactured defect IS the desk leaving the board');
  assert.ok(!after.includes('F-2299-1'), 'every desk item should be gone in the pre-cure run');
});

test('2 TEETH — the real subject refuses the same drop, naming F-2671-2', () => {
  const b = board({ line1: HANDOFF_LINE });
  const f = textfile(b.dir, 'new.txt', LOCK_NO_DESK);
  const r = run(b.tool, ['set', f], b.dir);

  assert.equal(r.rc, 1, 'a desk-dropping set must fail');
  assert.match(r.stderr, /F-2671-2/, 'the refusal must name the finding it enforces');
  assert.match(r.stderr, /handoff/, 'and must name the command that does it correctly');
});

test('3 ATOMICITY — a refused set leaves STATUS.md byte-unchanged', () => {
  const b = board({ line1: HANDOFF_LINE });
  const before = readFileSync(b.status);
  run(b.tool, ['set', textfile(b.dir, 'new.txt', LOCK_NO_DESK)], b.dir);
  assert.deepEqual(readFileSync(b.status), before, 'the refusal must not have written first');
});

test('4 LAWFUL — a new line that carries the tail verbatim passes', () => {
  const b = board({ line1: HANDOFF_LINE });
  const r = run(b.tool, ['set', textfile(b.dir, 'new.txt', LOCK_WITH_DESK)], b.dir);

  assert.equal(r.rc, 0, `carrying the desk is the prescribed habit and must not red; stderr: ${r.stderr}`);
  const after = readFileSync(b.status, 'utf8');
  assert.ok(after.includes('F-2299-1') && after.includes('b1-device-verdict-rows'));
});

test('5 LAWFUL — an already-archived line may be displaced freely', () => {
  const b = board({
    line1: HANDOFF_LINE,
    extraBullets: [`- **s2672 handoff (line-1 archive):** ${HANDOFF_LINE}`],
  });
  const r = run(b.tool, ['set', textfile(b.dir, 'new.txt', LOCK_NO_DESK)], b.dir);
  assert.equal(r.rc, 0, `the desk is still on the board in the bullet; stderr: ${r.stderr}`);
});

test('6 LAWFUL — a displaced line with no desk is not the subject of this guard', () => {
  const b = board({ line1: 'Last updated: 2026-09-24T22:22Z s2672 handoff, lock CLEARED — no desk here.' });
  const r = run(b.tool, ['set', textfile(b.dir, 'new.txt', LOCK_NO_DESK)], b.dir);
  assert.equal(r.rc, 0, `nothing to lose, nothing to refuse; stderr: ${r.stderr}`);
});

test('7 LAWFUL — handoff preserves by construction and is never checked', () => {
  const b = board({ line1: HANDOFF_LINE });
  const r = run(b.tool, ['handoff', textfile(b.dir, 'new.txt', LOCK_NO_DESK), 's2672 handoff'], b.dir);

  assert.equal(r.rc, 0, `handoff must stay unobstructed; stderr: ${r.stderr}`);
  const after = readFileSync(b.status, 'utf8');
  assert.ok(after.includes(`- **s2672 handoff (line-1 archive):** ${HANDOFF_LINE}`));
  assert.ok(after.includes('F-2299-1'), 'the desk rides down into the bullet, still on the board');
});

test('8 OVERRIDE — --allow-desk-drop proceeds, and warns rather than going quiet', () => {
  const b = board({ line1: HANDOFF_LINE });
  const r = run(b.tool, ['set', textfile(b.dir, 'new.txt', LOCK_NO_DESK), '--allow-desk-drop'], b.dir);

  assert.equal(r.rc, 0, `the override must work; stderr: ${r.stderr}`);
  assert.match(r.stderr, /DESK DROP ALLOWED/, 'an override that is silent is a hole, not an escape');
  assert.ok(!readFileSync(b.status, 'utf8').includes("OWNER'S DESK"));
});

test('9 NON-F-ID ITEM — losing a backtick-keyed item is caught by the 🔺 count arm', () => {
  // Every F-id is preserved; only `b1-device-verdict-rows` is dropped. The id test alone
  // would wave this through, which is exactly why the count arm exists.
  const thinned =
    "🔺 **OWNER'S DESK — 2 awaiting a word.** " +
    '🔺 **F-2642-3** — the account-registry deploy day. ' +
    '🔺 **F-2299-1** — revoke the August Claude Code token.';
  const b = board({ line1: HANDOFF_LINE });
  const r = run(b.tool, ['set', textfile(b.dir, 'new.txt', `ACTIVE — lock. ${thinned}`)], b.dir);

  assert.equal(r.rc, 1, 'an item with no F-id is still an item the owner is waiting on');
  assert.match(r.stderr, /🔺 marker/, 'and the reason must say which test caught it');
});

test('10 REVERSE OF 9 — the same shape with every item kept passes', () => {
  const b = board({ line1: HANDOFF_LINE });
  const r = run(b.tool, ['set', textfile(b.dir, 'new.txt', `ACTIVE — lock. ${DESK_TAIL}`)], b.dir);
  assert.equal(r.rc, 0, `arm 9 must be measuring the LOSS, not the presence of a key; stderr: ${r.stderr}`);
});
