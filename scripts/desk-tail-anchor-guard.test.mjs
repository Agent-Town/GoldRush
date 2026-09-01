/**
 * desk-tail-anchor-guard.test.mjs — does the desk parser start at the HEADER, or
 * at whatever prose happens to say "OWNER'S DESK" last? (F-2435-1, s2435, curing
 * F-2434-1 filed s2434.)
 *
 * WHY THIS EXISTS
 * ---------------
 * F-1471-3's cure was "the desk is the TAIL; prose mentions lose", implemented as
 * the LAST bare DESK_WORD hit on line-1. That is right for a mention UPSTREAM of
 * the header and it INVERTS for one DOWNSTREAM — sitting INSIDE the desk body,
 * where "last wins" promotes the fragment to header and discards every item above
 * it. A rule that disambiguates by POSITION assumes the noise is all on one side.
 *
 * THE MECHANISM IS THIS FAMILY'S OWN ERROR TEXT, which is why it recurs and why
 * it is worth a guard rather than a one-off edit. All seven divergent desks in
 * STATUS.md's history are handoffs QUOTING a desk guard's red — "N item(s) left
 * the OWNER'S DESK with no reason given" — or carrying a severed remnant of that
 * sentence spliced into the desk body. A guard's failure message becomes a PARSER
 * INPUT the moment a fire narrates it, and these parsers read the very surface
 * their own siblings write about.
 *
 * MEASURED OVER THE WHOLE CORPUS BEFORE THE CURE LANDED (F-1274-2): 1,551
 * non-lock desk-bearing line-1s, 1,544 byte-identical, 7 moved — every one
 * BACKWARD onto the real `🔺 **OWNER'S DESK` header. On s2434's desk that
 * recovers `NEW — HEAT 10 NEEDS A RE-RIDE AUTHORIZATION`, the newest item and the
 * one asking the owner for a spend authorization.
 *
 * WHAT THIS ASSERTS — AND THE REVERSE CONTROLS THAT BOUND IT
 * ----------------------------------------------------------
 * Three over-general cures are live hazards here and each has an arm built for it
 * and proven by manufacturing it:
 *   - plain last-wins restored          -> arms 2, 9, 10
 *   - the fallback dropped              -> arm 4 ALONE (every pre-🔺 desk refuses)
 *   - FIRST shaped hit instead of LAST  -> arm 6 ALONE
 *   - the shape widened to bare `**`    -> arm 5 ALONE
 * Arm 4 is the load-bearing one: an anchor with no fallback reds on lawful
 * historical desks and would be excused into uselessness inside a week (F-1460-1).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { DESK_WORD, deskIds, deskTail, deskTailStart } from './desk-declaration-guard.mjs';
import { deskTail as birthTail } from './desk-birth-guard.mjs';
import { deskTail as carryTail } from './desk-carryforward-guard.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GUARD = path.join(HERE, 'desk-declaration-guard.mjs');

function fixture(t, statusText, backlogText) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-tail-anchor-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.writeFileSync(path.join(dir, 'STATUS.md'), statusText);
  fs.mkdirSync(path.join(dir, 'tasks'));
  fs.writeFileSync(path.join(dir, 'tasks', 'BACKLOG.md'), backlogText);
  return dir;
}

const run = (dir) =>
  spawnSync(process.execPath, [GUARD, '--root', dir], { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8' });

/** The rule as it shipped before F-2435-1 — the reference this cure must match on 1,544 of 1,551 desks. */
function plainLastWins(line) {
  const hits = [...line.matchAll(DESK_WORD)];
  return hits.length ? line.slice(hits.at(-1).index) : null;
}

const HEAD = 'Last updated: 2026-09-01T21:52Z s1 handoff, lock CLEARED — work happened. ';
/** The real fragment shape, copied verbatim from s2434's line-1 rather than invented. */
const FRAGMENT = 'the OWNER’S DESK with no reason given: F-2408-1` ';
const ARCHIVE = '\n- **s0 handoff (line-1 archive):** older text\n';

test('control: the subjects exist and export what this guard drives', () => {
  assert.equal(typeof deskTailStart, 'function');
  assert.equal(typeof deskTail, 'function');
  assert.equal(typeof deskIds, 'function');
  assert.ok(DESK_WORD instanceof RegExp, 'the pattern must be exported to be shared');
  // The fragment really does supply a desk word — without this the arms below
  // would pass while measuring nothing (F-2215-1: assert the fixture is valid).
  assert.equal([...FRAGMENT.matchAll(DESK_WORD)].length, 1, 'the fragment must carry a desk word');
});

test('THE CORE — a fragment INSIDE the desk body does not steal the parse start', () => {
  const line = HEAD + '🔺 **OWNER’S DESK — 2 awaiting a word.** ' +
    '🔺 **F-9001-1 — the newest item, written where a fire writes one.** ' + FRAGMENT +
    '🔺 **F-9002-1 — an older item.**';
  assert.equal([...line.matchAll(DESK_WORD)].length, 2, 'fixture must hold header + fragment');
  const got = deskIds(line + '\nsecond line');
  assert.equal(got.kind, 'desk');
  assert.ok(got.ids.includes('F-9001-1'), 'the item ABOVE the fragment must be visible');
  assert.ok(got.ids.includes('F-9002-1'), 'the item below it must stay visible');
  // The tail begins AT the desk word, so the header's own 🔺 is not inside it:
  // `segments` counts the ITEMS, not the header.
  assert.equal(got.segments, 2, 'both items');
  // And it really is the header, not merely "an earlier hit".
  assert.match(deskTail(line).slice(0, 30), /^OWNER’S DESK — 2 awaiting/);
});

test("F-1471-3's REVERSE CONTROL — an UPSTREAM prose mention still loses", () => {
  const line = 'Last updated: 2026-09-01T21:52Z s1 handoff, lock CLEARED — I read the OWNER’S DESK and found nothing. ' +
    '🔺 **OWNER’S DESK — 1 awaiting a word.** 🔺 **F-9003-1 — the only item.**';
  const got = deskIds(line + '\nsecond line');
  assert.equal(got.segments, 1, 'the upstream prose mention must not become the header');
  assert.ok(got.ids.includes('F-9003-1'));
  assert.match(deskTail(line).slice(0, 12), /^OWNER’S DESK/);
  assert.equal(deskTailStart(line), line.lastIndexOf('OWNER’S DESK'), 'the header is the LAST shaped hit');
});

test('THE FALLBACK — a desk whose header is not 🔺-shaped still parses (last-wins)', () => {
  // ~490 historical desks predate the 🔺 convention; an anchor with no fallback
  // would refuse on every one of them. This arm is the whole reason for it.
  const line = HEAD + '**⚠ OWNER’S DESK — 1 awaiting a word.** F-9004-1 is the item.';
  assert.equal(deskTail(line), plainLastWins(line), 'unshaped headers must parse exactly as before');
  const got = deskIds(line + '\nsecond line');
  assert.equal(got.kind, 'desk');
  assert.ok(got.ids.includes('F-9004-1'));
});

test('the shape requires 🔺 — a BOLDED downstream prose mention still loses', () => {
  // Shape copied from s1369's real line-1: fires bold the phrase in prose, so
  // `The **OWNER'S DESK** is …` is exactly what a bare-`**` anchor would swallow.
  // Measured s2435 over STATUS.md: 49 desks carry a hit a bare-`**` shape would
  // accept and the 🔺 shape rejects, so this arm guards a real population.
  const line = HEAD + '🔺 **OWNER’S DESK — 1 awaiting a word.** ' +
    '🔺 **F-9005-1 — an item whose prose says: The **OWNER’S DESK** is the other enumeration.**';
  assert.ok(deskIds(line + '\nsecond line').ids.includes('F-9005-1'), 'a bolded mention must not steal the start');
  assert.match(deskTail(line).slice(0, 26), /^OWNER’S DESK — 1 awaiting/);
});

test('among SEVERAL shaped hits the LAST wins — an earlier 🔺 header loses', () => {
  // s1325 is the ONE real line-1 in STATUS.md carrying two header-shaped hits
  // (measured s2435: 1 of 1,565): an early desk sentence, then the real header.
  const line = HEAD + '🔺 **OWNER DESK: one clean runner restart is the only thing owed.** ' +
    '🔺 **OWNER DESK — one new item, small and concrete.** 🔺 **F-9006-1 — the only item.**';
  assert.match(deskTail(line).slice(0, 28), /^OWNER DESK — one new item/, 'the real header is the LAST shaped hit');
  assert.equal(deskIds(line + '\nsecond line').segments, 1);
});

test('NEUTRALITY — a fragment-free desk parses byte-identically to the old rule', () => {
  const clean = HEAD + '🔺 **OWNER’S DESK — 2 awaiting a word.** 🔺 **F-9007-1 — one.** 🔺 **F-9007-2 — two.**';
  assert.equal(deskTail(clean), plainLastWins(clean));
  const noDesk = 'Last updated: 2026-09-01T21:52Z s1 handoff, lock CLEARED — nothing here.';
  assert.equal(deskTail(noDesk), null);
  assert.equal(plainLastWins(noDesk), null);
  assert.equal(deskTailStart(noDesk), -1, 'absence is -1, never 0 — 0 is a valid start');
});

test('ONE IMPLEMENTATION — all three modules resolve to the same function', () => {
  assert.equal(birthTail, deskTail, 'desk-birth must re-export, not re-implement');
  assert.equal(carryTail, deskTail, 'desk-carryforward must re-export, not re-implement');
  const sources = ['desk-declaration-guard.mjs', 'desk-birth-guard.mjs', 'desk-carryforward-guard.mjs']
    .map((f) => fs.readFileSync(path.join(HERE, f), 'utf8'))
    .filter((s) => /^export function deskTail\b/m.test(s));
  assert.equal(sources.length, 1, 'exactly one file may DECLARE deskTail; the others re-export it');
});

test('END TO END — the gate SEES an item that sits above a fragment (F-2210-1)', (t) => {
  const line = HEAD + '🔺 **OWNER’S DESK — 1 awaiting a word.** ' +
    '🔺 **F-9008-1 — the newest item.** ' + FRAGMENT;
  // The fragment is verbatim and carries F-2408-1, so it needs a row too — an arm
  // that reds for a SECOND reason proves nothing about the one it was built for.
  const dir = fixture(
    t,
    line + ARCHIVE,
    '- 🟡 **F-9008-1 (s1, MEASURED — a thing).** details\n- 🟡 **F-2408-1 (s1, MEASURED — the pin).** details\n',
  );
  const r = run(dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  // Assert the COUNTS, not the word PASS: under the old rule this fixture also
  // exits 0 — the item is simply invisible — so a PASS/FAIL assertion here would
  // be decoration. The report is the observable (F-2210-1).
  assert.match(r.stdout, /desk F-IDs\s+: 2\b/, 'the recovered id must reach the report');
  assert.match(r.stdout, /desk segments\s+: 1\b/, 'the recovered SEGMENT must be counted');
});

test('END TO END REVERSE CONTROL — an UNDECLARED item above a fragment now FAILS', (t) => {
  // The recovered region must be GATED, not merely parsed. Under the old rule
  // this fixture passed at rc=0 with the undeclared item invisible.
  const line = HEAD + '🔺 **OWNER’S DESK — 1 awaiting a word.** ' +
    '🔺 **F-9009-1 — an item nobody declared.** ' + FRAGMENT;
  const dir = fixture(
    t,
    line + ARCHIVE,
    '- 🟡 **F-8888-1 (s1) — unrelated.** details\n- 🟡 **F-2408-1 (s1, MEASURED — the pin).** details\n',
  );
  const r = run(dir);
  assert.equal(r.status, 1, 'an undeclared item above the fragment must red the gate');
  assert.match(r.stderr, /F-9009-1/);
  assert.doesNotMatch(r.stderr, /F-2408-1/, 'the fragment id is declared — only the item may fail');
});
