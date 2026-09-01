#!/usr/bin/env node
/**
 * desk-declaration-segment-denominator-guard.test.mjs — does the guard declare
 * the corpus its PASS ranges over? (F-2256-1, s2256.)
 *
 * WHY THIS EXISTS
 * ---------------
 * desk-declaration-guard's PASS reads "every non-grandfathered desk item has a
 * declaring row". The corpus that claim ranges over is whatever its two parsers
 * managed to KEY out of line-1's tail: `ids` (a FLAT scan, so an F-ID anywhere
 * counts) UNION `slugs` (segment-anchored, first key inside KEY_ZONE). A 🔺
 * segment contributing to NEITHER cannot enter `undeclared`, so it is
 * structurally incapable of failing the gate — and the guard said nothing.
 *
 * Its own SLUG note states the principle — "a parser whose denominator nobody
 * checks is how the 145-id misread survived (F-1471-3)" — and then nothing in
 * the file checked the denominator. It was validated by hand, once, at s1535.
 *
 * PROVEN BY MANUFACTURING, not by a green. Ground truth: a desk carrying one
 * item with NO declaring row, written exactly as s1585 wrote four of them.
 *   backticked `rf-34-hero-y-restore-roundtrip` -> FAIL rc=1, names it
 *   written BARE (same item, same absent row)   -> PASS rc=0, "desk slugs: 0",
 * BYTE-IDENTICAL on stdout and rc to a genuinely clean board. The "desk slugs:
 * 0" line is TRUE — about a corpus that excluded the item (F-2221-1's polarity).
 *
 * Measured s2256 over the 702 post-s1535 archived desks: 20 desks carry 24
 * unexamined segments, of which 10 are REAL owner items (s1585's four bare goal
 * slugs, the FIVE-MAP FORK TABLE across s2123/s2124/s2125, `F-1533-x` twice —
 * a placeholder id, so FINDING's trailing \d+ never matches — and MP-07c).
 * The live inherited desk reads 27 segments / 0 unexamined, so this is LATENT
 * today and was LIVE twenty times.
 *
 * WHAT THIS ASSERTS — AND THE REVERSE CONTROLS THAT BOUND IT
 * ----------------------------------------------------------
 * The cure DECLARES and does not REFUSE, for a measured reason: the other 14 of
 * those 24 segments are ordinary handoff prose riding a 🔺 ("AUDITED with
 * `desk-state-audit --status`…", "Carried from s1580 and re-verified…"). A
 * refusal would red the battery on honest writing and be excused into
 * uselessness inside a week (F-1460-1). Arms 4, 5 and 6 exist solely to catch
 * the over-general cures — refusing on unexamined, anchoring the F-ID test to
 * KEY_ZONE (which would destroy the documented flat-scan FEATURE), and blunting
 * the real undeclared check — and each was proven by manufacturing it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';

import { deskIds, unexaminedSegments } from './desk-declaration-guard.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GUARD = path.join(HERE, 'desk-declaration-guard.mjs');
const dirs = [];

const HEAD =
  'Last updated: 2026-08-24T02:50Z s9999 handoff, lock CLEARED — work landed. ' +
  "\u{1F53A} **OWNER'S DESK — 2 awaiting a word.** " +
  '\u{1F53A} **F-9001-1** (a real finding, and it has a row) \u{1F53A} ';

/** A hermetic board. The live STATUS.md/BACKLOG.md are never read. */
function board(secondItem) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-denom-'));
  dirs.push(dir);
  fs.mkdirSync(path.join(dir, 'tasks'));
  fs.writeFileSync(path.join(dir, 'STATUS.md'), HEAD + secondItem + '\n');
  fs.writeFileSync(
    path.join(dir, 'tasks', 'BACKLOG.md'),
    '# BACKLOG\n- 🔺 **F-9001-1 OPEN** — the declared one, has a row here.\n',
  );
  return dir;
}

function run(root, extra = []) {
  const r = spawnSync('node', [GUARD, '--root', root, ...extra], { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8' });
  return { rc: r.status, out: r.stdout ?? '', err: r.stderr ?? '' };
}

/** The shape s1585 wrote four times: a real owner item, keyed by nothing. */
const BARE = '**rf-34-hero-y-restore-roundtrip BLOCKED owner-fork**';
/** The SAME item, keyed — the guard can see this one. */
const KEYED = '**`rf-34-hero-y-restore-roundtrip` BLOCKED owner-fork**';
/** Ordinary handoff prose riding a 🔺 — measured as 14 of the 24 live cases. */
const PROSE = '**AUDITED with `desk-state-audit --status` against the inherited line-1: CLOSED=0**';

test('1. an unexamined segment is NAMED — the substantive detection', () => {
  const r = run(board(BARE));
  assert.equal(r.rc, 0, 'still a PASS by design — this cure declares, it does not gate');
  assert.match(r.out, /unexamined\s*:\s*1/, 'the denominator must report the miss');
  assert.match(r.out, /rf-34-hero-y-restore-roundtrip/, 'and must name the segment it never examined');
});

test('2. the declaration is printed on the HAPPY path too (F-2208-1)', () => {
  // A declaration that appears only on failure re-creates the ambiguity it
  // removes — and here the failure state IS a pass, so there is no failure for
  // it to appear on. "unexamined 0" is what separates "I checked all of them"
  // from "I checked the ones I could see".
  const r = run(board('**F-9002-2** a second keyed item'));
  assert.equal(r.rc, 1, 'F-9002-2 has no row, so this board legitimately fails');
  assert.match(r.out, /unexamined\s*:\s*0/, 'zero must still be declared, not omitted');
  assert.match(r.out, /desk segments\s*:\s*2/, 'and the denominator itself must be stated');
});

test('3. the declaration reaches STDOUT, not stderr (F-2211-1)', () => {
  // A caller that classifies stdout reads an empty string as silence.
  const r = run(board(BARE));
  assert.match(r.out, /unexamined/, 'declaration belongs on the channel the report uses');
  assert.doesNotMatch(r.err, /unexamined/, 'and must not hide on stderr');
});

test('4. REVERSE CONTROL — an unexamined segment must NOT change the exit code', () => {
  // Catches the over-general cure: refusing on any unexamined segment. Measured
  // s2256, 58% of live cases are legitimate prose, so that cure reds the battery
  // on honest handoff writing and gets excused away (F-1460-1).
  const prose = run(board(PROSE));
  assert.equal(prose.rc, 0, 'prose riding a 🔺 is reported, never gated on');
  assert.match(prose.out, /unexamined\s*:\s*1/, 'but it IS reported');
  assert.match(prose.out, /ADVISORY, not a failure/, 'and the advisory says so in words');
});

test('5. REVERSE CONTROL — a deep F-ID is EXAMINED, not reported as a miss', () => {
  // The flat F-ID scan is a documented FEATURE (it is how F-1193-2 was caught
  // riding inside F-1242-1's item at s1334). A cure that anchored the F-ID test
  // to KEY_ZONE the way the SLUG test is anchored would report these as
  // unexamined and destroy that. The id sits far past KEY_ZONE (120).
  const deep = '**a long owner item whose key rides late** ' + 'x'.repeat(200) + ' F-9003-3 rides here';
  const r = run(board(deep));
  assert.match(r.out, /unexamined\s*:\s*0/, 'an F-ID anywhere in the tail means the segment WAS examined');
  assert.equal(r.rc, 1, 'and F-9003-3 has no row, so it correctly fails');
  assert.match(r.err, /F-9003-3/, 'named as undeclared, which is the pre-existing behaviour');
});

test('6. REVERSE CONTROL — the real undeclared check is not blunted', () => {
  // The same item as arm 1, merely keyed. If a careless cure suppressed the
  // undeclared report for segments it now "explains", this would go green.
  const r = run(board(KEYED));
  assert.equal(r.rc, 1, 'a keyed item with no BACKLOG row must still FAIL');
  assert.match(r.err, /rf-34-hero-y-restore-roundtrip/, 'and must still be named');
  assert.match(r.out, /unexamined\s*:\s*0/, 'while the denominator reports a full read');
});

test('7. the segment count is the real denominator, not the keyed count', () => {
  // The flat scan can key MORE ids than there are segments (riding ids), so the
  // two numbers are genuinely different questions. Live board s2256: 27
  // segments, 29 keyed. Asserting them equal would be wrong.
  const tail = "OWNER'S DESK — 2 awaiting a word.** 🔺 **F-1-1** cites F-2-2 as well 🔺 **F-3-3** alone";
  const parsed = deskIds('Last updated: x s1 handoff, lock CLEARED — ' + tail);
  assert.equal(parsed.segments, 2, 'two 🔺 items');
  assert.equal(parsed.ids.length, 3, 'but three ids, because a riding id is deliberately kept');
  assert.equal(parsed.unexamined.length, 0, 'and neither segment went unexamined');
});

test('8. a live ACTIVE lock makes no denominator claim at all', () => {
  // The desk is written at handoff time. A lock line has no desk, so declaring
  // a denominator over it would be asserting something about nothing.
  const dir = board(BARE);
  fs.writeFileSync(
    path.join(dir, 'STATUS.md'),
    'Last updated: 2026-08-24T02:47Z ACTIVE (s2256 fire) — board triage\n',
  );
  const r = run(dir);
  assert.equal(r.rc, 0);
  assert.match(r.out, /SKIP/, 'a lock SKIPs');
  assert.doesNotMatch(r.out, /unexamined/, 'and claims no denominator');
});

test('9. unexaminedSegments is pure and survives repeated calls', () => {
  // FINDING is global and carries lastIndex between calls, so a filter using it
  // would skip every other segment. The helper uses the non-global twin; this
  // arm fails loudly if anyone swaps it back.
  const tail = "OWNER'S DESK — 3 awaiting.** 🔺 **F-1-1** a 🔺 **bare-one here** b 🔺 **F-2-2** c";
  const first = unexaminedSegments(tail);
  const second = unexaminedSegments(tail);
  assert.equal(first.length, 1, 'exactly the bare segment is unexamined');
  assert.deepEqual(first, second, 'and the answer must not drift between calls');
});

test('10. the four bare goal slugs of s1585 all read unexamined', () => {
  // Ground truth copied verbatim from the archived s1585 desk rather than
  // invented — the measurement is only meaningful against what fires write.
  const tail =
    "OWNER'S DESK — 24 awaiting a word.** " +
    '🔺 **rf-34-hero-y-restore-roundtrip BLOCKED owner-fork** ' +
    '🔺 **e3-fairground-socket BLOCKED owner-fork** ' +
    '🔺 **bt-04-homestead-automation BLOCKED owner-fork** ' +
    '🔺 **f1328-1-drill-yard-census-debt BLOCKED disputed**';
  assert.equal(unexaminedSegments(tail).length, 4, 'all four were invisible to this guard');
});

test.after(() => {
  for (const d of dirs) fs.rmSync(d, { recursive: true, force: true });
});
