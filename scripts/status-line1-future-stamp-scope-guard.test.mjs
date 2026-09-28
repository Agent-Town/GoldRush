#!/usr/bin/env node
/**
 * status-line1-future-stamp-scope-guard.test.mjs — does `status-line1.mjs`'s future-stamp
 * check bound itself to the line's OWN stamp, while still refusing a future stamp in the
 * position that can actually stall the factory? (F-2676-1, filed s2676, cured s2677.)
 *
 * WHY THIS EXISTS
 * ---------------
 * `assertNoFutureStamp` walked EVERY full-ISO match on the new line 1 and threw on any one
 * of them more than the 2-minute skew ahead of now. The header sentence said so plainly —
 * "appearing anywhere in the new line 1" — so this was the tool working as written, not a
 * slip. The cost is that a handoff sentence which merely CITES a future date has full-ISO
 * shape too: RT-01 due dates, gate windows and veto windows all do. s2676 wanted to write
 * "the next RT-01 mint is due after 2026-09-27T00:00Z" on a line whose own stamp was a
 * lawful {STAMP}, was refused with the hand-computed-stamp message (a message about a
 * different act entirely), and got the line onto the board only by degrading the ISO form
 * to prose.
 *
 * It never cost DATA — the refusal is atomic, and s2676 controlled that — which is exactly
 * why it survived unseen: the tool failed safe and the fire rewrote its sentence.
 *
 * WHAT THIS ASSERTS, AND THE CONTROLS THAT BOUND IT
 * -------------------------------------------------
 * The two arms the finding prescribes are 2 (teeth kept) and 4 (the cure), and each is
 * paired so neither can be vacuous: a cure that merely deleted the check would pass arm 4
 * and fail arm 2, and a guard still refusing lawful prose fails arm 4. Arm 1 proves the
 * harness manufactures the REAL defect before arms 4-6 are believed (F-2215-1).
 *
 *   1  CONTROL VALIDITY  the pre-cure subject REFUSES the lawful cited-date line, so the
 *                        arms below are measuring the cure and not an absent defect.
 *   2  TEETH             a FUTURE stamp in the line's own position still REFUSES, rc 1,
 *                        still naming F-1039-2 — the failure mode that stalls the factory
 *                        for the skew plus 45 minutes is untouched by this cure.
 *   3  ATOMICITY         ...and STATUS.md is BYTE-UNCHANGED, the arm that would catch the
 *                        check being moved below the write.
 *   4  THE CURE          a future date CITED after the em-dash PASSES, and lands on the
 *                        board in full ISO form rather than degraded to prose.
 *   5  THE REAL SHAPE    s2676's exact line — {STAMP} own stamp plus a cited RT-01 due
 *                        date — passes, and the stamp written first is the MEASURED one.
 *   6  NOT OVER-CURED    a PAST date cited later still passes (it always did), so arm 4
 *                        is not resting on the check having been deleted outright.
 *
 * THE PRE-CURE MUTATION IS EXACT, NOT APPROXIMATE. It replaces the cured `ownStamp` — the
 * FIRST match — with the LATEST-DATED match. For the throw DECISION that is identical to
 * the old "any match is future" loop: if any match is future then the maximum is future,
 * and if the maximum is not future then none is. The ISO minute form sorts correctly as a
 * string (fixed width, most-significant first), so `.sort().at(-1)` is that maximum.
 *
 * THE SUBJECT IS COPIED, which is safe here for the reason its sibling states (F-2672-2):
 * `status-line1.mjs` has no local imports, so a copied variant cannot die on
 * ERR_MODULE_NOT_FOUND and wear the costume of an arm that correctly refused. Arm 1 proves
 * the copy RUNS by making it refuse a line the real subject accepts — a difference no
 * failure-to-load could produce, since a copy that cannot load fails every arm alike.
 */

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SUBJECT = fileURLToPath(new URL('./status-line1.mjs', import.meta.url));

// No desk on the displaced line, so the F-2671-2 displacement guard never fires and every
// verdict below belongs to the stamp check alone. Its sibling test owns that predicate.
const PRIOR = 'Last updated: 2026-09-24T22:22Z s2676 handoff, lock CLEARED — the prior line.';
const BODY = ['', '- **s2675 handoff (line-1 archive):** an older line, kept.', '', 'Board notes.', ''];

// Far enough ahead that no plausible clock skew between writing and running this reaches it.
const FUTURE = '2031-09-27T00:00Z';
const PAST = '2026-09-20T00:00Z';

// Every fixture this file makes is removed when the file's tests end (F-1335-5: a leaked mkdtemp dir reds
// scripts/fixture-teardown.test.mjs and, through it, test:node-guards; measured 2026-09-25 by the pp3 drain,
// F-PP3-5: 328 survivors of this file and its s2677 sibling in the host tmpdir). The literal prefix stays at
// the mkdtemp call site because the sweep's extractor is a regex over this source.
const FIXTURES = [];
after(() => { for (const d of FIXTURES) rmSync(d, { recursive: true, force: true }); });

function board({ mutate } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 's2677-stamp-'));
  FIXTURES.push(dir);
  mkdirSync(join(dir, 'scripts'));
  const tool = join(dir, 'scripts', 'status-line1.mjs');
  copyFileSync(SUBJECT, tool);
  if (mutate) writeFileSync(tool, mutate(readFileSync(tool, 'utf8')), 'utf8');

  const status = join(dir, 'STATUS.md');
  writeFileSync(status, [PRIOR, ...BODY].join('\n'), 'utf8');
  return { dir, tool, status };
}

// spawnSync, not execFileSync: the refusal this guard is about is written to STDERR, and
// execFileSync hands back stdout only (the blind spot the sibling harness was bitten by).
function run(tool, args, cwd) {
  const r = spawnSync('node', [tool, ...args], { encoding: 'utf8', cwd });
  return { rc: r.status ?? 1, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

function textfile(dir, name, content) {
  const p = join(dir, name);
  writeFileSync(p, content, 'utf8');
  return p;
}

const line1of = (status) => readFileSync(status, 'utf8').split('\n')[0];

// Restores the pre-cure throw decision. See the header for why max-dated is exactly
// equivalent to the old walk-every-match loop.
const RESTORE_PRE_CURE = (src) => {
  const needle = 'const ownStamp = (line) => (line.match(ISO_MIN) ?? [])[0] ?? null;';
  assert.ok(src.includes(needle), 'mutation target not found — re-read the subject, do not assume');
  return src.replace(needle, 'const ownStamp = (line) => (line.match(ISO_MIN) ?? []).sort().at(-1) ?? null;');
};

const CITES_FUTURE = `ACTIVE {STAMP} (s2677 fire) — the next RT-01 mint is due after ${FUTURE}.`;

test('1 CONTROL VALIDITY — the pre-cure subject refuses the lawful cited-date line', () => {
  const b = board({ mutate: RESTORE_PRE_CURE });
  const r = run(b.tool, ['set', textfile(b.dir, 'new.txt', CITES_FUTURE)], b.dir);

  assert.equal(r.rc, 1, `the manufactured defect IS this refusal; stderr: ${r.stderr}`);
  assert.match(r.stderr, /FUTURE stamp/, 'and it must refuse for the stamp reason, not some other');
  assert.equal(line1of(b.status), PRIOR, 'the pre-cure refusal was atomic too — that is why it hid');
});

test('2 TEETH — a future stamp in the line\'s OWN position still refuses', () => {
  const b = board();
  const hand = `ACTIVE ${FUTURE} (s2677 fire) — a hand-computed stamp, the F-1039-2 failure mode.`;
  const r = run(b.tool, ['set', textfile(b.dir, 'new.txt', hand)], b.dir);

  assert.equal(r.rc, 1, 'the stamp that stalls the factory must still be refused');
  assert.match(r.stderr, new RegExp(FUTURE), 'the refusal must name the offending stamp');
  assert.match(r.stderr, /F-1039-2/, 'and the lineage it enforces');
});

test('3 ATOMICITY — that refusal leaves STATUS.md byte-unchanged', () => {
  const b = board();
  const before = readFileSync(b.status);
  run(b.tool, ['set', textfile(b.dir, 'new.txt', `ACTIVE ${FUTURE} (s2677 fire) — refused.`)], b.dir);
  assert.deepEqual(readFileSync(b.status), before, 'a refusal that already wrote is not a refusal');
});

test('4 THE CURE — a future date cited after the em-dash passes, in full ISO', () => {
  const b = board();
  const r = run(b.tool, ['set', textfile(b.dir, 'new.txt', CITES_FUTURE)], b.dir);

  assert.equal(r.rc, 0, `citing a future due date is lawful prose; stderr: ${r.stderr}`);
  assert.ok(
    line1of(b.status).includes(FUTURE),
    'and it must reach the board in ISO form — degrading it to prose was the cost of the defect',
  );
});

test('5 THE REAL SHAPE — {STAMP} own stamp plus a cited due date, and the stamp is measured', () => {
  const b = board();
  const r = run(b.tool, ['set', textfile(b.dir, 'new.txt', CITES_FUTURE)], b.dir);
  assert.equal(r.rc, 0, `s2676's exact line must now pass; stderr: ${r.stderr}`);

  const written = line1of(b.status);
  const own = written.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}Z/)[0];
  assert.notEqual(own, FUTURE, 'the line\'s own stamp must be the substituted one, not the cited one');
  assert.ok(
    Date.parse(`${own.replace(/Z$/, '')}:00`) <= Date.now() + 2 * 60 * 1000,
    'and {STAMP} must still come from the clock, within skew of now',
  );
});

test('6 NOT OVER-CURED — a past date cited later still passes', () => {
  const b = board();
  const r = run(b.tool, ['set', textfile(b.dir, 'new.txt', `ACTIVE {STAMP} (s2677 fire) — since ${PAST}, quiet.`)], b.dir);
  assert.equal(r.rc, 0, `past citations always passed and must keep passing; stderr: ${r.stderr}`);
  assert.ok(line1of(b.status).includes(PAST));
});
