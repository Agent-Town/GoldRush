#!/usr/bin/env node
/**
 * ledger-mirror-freshness-guard.test.mjs — the teeth for F-2351-1.
 *
 * The subject (scripts/ledger-mirror-freshness.mjs) exists because LB-01's
 * discharge test — "does today's ledger-YYYY-MM-DD.db exist?" — is EXISTENTIAL
 * and keyed on TODAY, and so is structurally incapable of ever reporting a hole
 * behind today. This guard asserts the three things that make the cure real:
 *
 *   1. an INTERIOR hole is named (the defect the tool exists for);
 *   2. "could not answer" (2) stays separated from "answered, and refuses" (1);
 *   3. the ADVISORY default stays 0 in every state, because a gap is often
 *      lawful and a red here would be excused into uselessness (F-1460-1).
 *
 * Every arm below was proven by MANUFACTURING the defect on a scratch copy — a
 * passing guard never executes its own violation path, so a green is not
 * evidence about a red. The manufactured variants and the single arm each one
 * reddens are recorded in the BACKLOG row for F-2351-1.
 *
 * FIXTURE DESIGN, and it is the transferable part: the subject anchors its
 * corpus to `import.meta.url` ON PURPOSE, so it cannot be aimed with a cwd. The
 * only way to point it at a fixture is therefore to RELOCATE it — copy the
 * script into <fixture>/scripts/ so its `../artifacts/ledger-backups/` resolves
 * inside the fixture. That makes arm 9 a genuine reverse control: an
 * over-general "fix" that re-anchors the corpus to process.cwd() passes every
 * defect arm and reds there alone.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  parseName,
  dayNumber,
  analyse,
  exitCodeFor,
  readMirrors,
  readAnchor,
  localToday,
} from './ledger-mirror-freshness.mjs';

const SUBJECT = fileURLToPath(new URL('./ledger-mirror-freshness.mjs', import.meta.url));

/**
 * Build a fixture tree and RELOCATE the subject into it.
 *
 * `anchor` (s2671, F-2668-2) writes <root>/ops/ledger-series-anchor.json, the
 * external denominator. It is a fixture OPTION rather than a default so that
 * the anchor's own absence stays testable — and note that the relocation makes
 * this a genuine control on WHERE the anchor is read from: the repo's real
 * ops/ledger-series-anchor.json exists, so a subject that resolved the anchor
 * against process.cwd() would pass every arm below by picking up the repo's.
 */
function fixture(days, { makeMirrorDir = true, anchor = null, anchorRaw = null } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 's2351-lmf-'));
  mkdirSync(path.join(root, 'scripts'), { recursive: true });
  copyFileSync(SUBJECT, path.join(root, 'scripts', path.basename(SUBJECT)));
  if (makeMirrorDir) {
    const dir = path.join(root, 'artifacts', 'ledger-backups');
    mkdirSync(dir, { recursive: true });
    for (const name of days) writeFileSync(path.join(dir, name), 'x');
  }
  if (anchor || anchorRaw) {
    mkdirSync(path.join(root, 'ops'), { recursive: true });
    writeFileSync(
      path.join(root, 'ops', 'ledger-series-anchor.json'),
      anchorRaw ?? JSON.stringify({ firstCoverageDay: anchor }, null, 2),
    );
  }
  return root;
}

function runIn(root, args = [], cwd = root) {
  const r = spawnSync('node', [path.join(root, 'scripts', path.basename(SUBJECT)), ...args], {
    timeout: 240_000, killSignal: 'SIGKILL',
    encoding: 'utf8',
    cwd,
  });
  return { rc: r.status, out: r.stdout ?? '', err: r.stderr ?? '' };
}

/** ISO for (local today - n days), via the subject's own arithmetic. */
function isoBack(n) {
  const t = localToday();
  const d = new Date(t.y, t.m - 1, t.d - n); // local-component construction, never Date.parse
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const dbFor = (iso) => `ledger-${iso}.db`;

const cleanup = [];
const mk = (...a) => {
  const r = fixture(...a);
  cleanup.push(r);
  return r;
};
process.on('exit', () => {
  for (const r of cleanup) {
    try {
      rmSync(r, { recursive: true, force: true });
    } catch {
      /* the fixture is in tmpdir and disposable; a failed unlink must not mask a real red */
    }
  }
});

// ---------------------------------------------------------------- CLI arms

test('1. a whole, current series reports WHOLE AND CURRENT and strict exits 0', () => {
  const root = mk([dbFor(isoBack(2)), dbFor(isoBack(1)), dbFor(isoBack(0))], { anchor: isoBack(2) });
  const a = runIn(root);
  assert.ok(a.out.length > 0, 'control validity: the arm must actually produce output');
  assert.match(a.out, /WHOLE AND CURRENT/);
  assert.doesNotMatch(a.out, /MISSING COVERAGE DAY/);
  assert.equal(a.rc, 0);
  assert.equal(runIn(root, ['--strict']).rc, 0);
});

test('2. an INTERIOR hole is NAMED and strict exits 1 — the defect LB-01 cannot see', () => {
  // today, today-1 present, today-2 MISSING, today-3 present.
  const root = mk([dbFor(isoBack(3)), dbFor(isoBack(1)), dbFor(isoBack(0))], { anchor: isoBack(3) });
  const a = runIn(root);
  assert.ok(a.out.length > 0, 'control validity: the arm must actually produce output');
  assert.match(a.out, /MISSING COVERAGE DAY\(S\): 1/);
  assert.ok(a.out.includes(isoBack(2)), `the missing day ${isoBack(2)} must be named, got:\n${a.out}`);
  assert.equal(runIn(root, ['--strict']).rc, 1, 'answered, and the answer refuses');
});

test('3. a STALE newest (no holes) is reported with its age and strict exits 1', () => {
  const root = mk([dbFor(isoBack(6)), dbFor(isoBack(5))], { anchor: isoBack(6) });
  const a = runIn(root);
  assert.ok(a.out.length > 0, 'control validity: the arm must actually produce output');
  assert.match(a.out, /DAYS BEHIND/);
  assert.doesNotMatch(a.out, /WHOLE AND CURRENT/);
  assert.equal(runIn(root, ['--strict']).rc, 1);
});

test('4. an ABSENT mirror directory CANNOT VERIFY — strict exits 2, never 1', () => {
  const root = mk([], { makeMirrorDir: false });
  const a = runIn(root);
  assert.match(a.out, /CANNOT VERIFY/);
  assert.match(a.out, /corpus\s+: ABSENT/);
  assert.equal(
    runIn(root, ['--strict']).rc,
    2,
    'could not answer (2) must stay distinct from answered-and-refuses (1)',
  );
});

test('5. a readable but EMPTY series CANNOT VERIFY — an empty series has no gaps', () => {
  const root = mk([]);
  const a = runIn(root);
  assert.ok(a.out.length > 0, 'control validity: the arm must actually produce output');
  assert.match(a.out, /CANNOT VERIFY/);
  assert.doesNotMatch(a.out, /WHOLE AND CURRENT/, 'zero gaps in an empty series is not good news');
  assert.equal(runIn(root, ['--strict']).rc, 2);
});

test('6. ADVISORY default is 0 in EVERY state, including a gap and an unreadable corpus', () => {
  const gap = mk([dbFor(isoBack(3)), dbFor(isoBack(0))]);
  const absent = mk([], { makeMirrorDir: false });
  const empty = mk([]);
  assert.equal(runIn(gap).rc, 0, 'a gap must not block a fire by default');
  assert.equal(runIn(absent).rc, 0);
  assert.equal(runIn(empty).rc, 0);
});

test('7. the corpus is DECLARED on the HAPPY path too, not only on failure', () => {
  const root = mk([dbFor(isoBack(1)), dbFor(isoBack(0))]);
  const a = runIn(root);
  assert.match(a.out, /corpus\s+: read \(2 entries, 2 dated\)/);
});

test('8. the CALENDAR is validated, not the digit count', () => {
  const root = mk([dbFor(isoBack(0)), 'ledger-2026-13-45.db', 'ledger-2026-02-30.db', 'notes.txt'], {
    anchor: isoBack(0),
  });
  const a = runIn(root);
  // 4 entries on disk, but only the one real date is a subject.
  assert.match(a.out, /corpus\s+: read \(4 entries, 1 dated\)/);
  assert.doesNotMatch(a.out, /MISSING COVERAGE DAY/, 'a bogus date must not stretch the span');
});

test('9. REVERSE CONTROL: a relocated copy measures ITS OWN tree, from any cwd', () => {
  // Over-anchoring the corpus to process.cwd() passes every arm above and reds here.
  // Since s2671 this arm covers the DENOMINATOR too: the repo really does ship an
  // ops/ledger-series-anchor.json, so a subject that resolved it against cwd would
  // read the repo's 2026-08-24 when run from the repo and nothing when run from tmp.
  const root = mk([dbFor(isoBack(3)), dbFor(isoBack(0))], { anchor: isoBack(3) });
  const fromRepo = runIn(root, [], process.cwd());
  const fromTmp = runIn(root, [], tmpdir());
  const fromRoot = runIn(root, [], root);
  const norm = (s) => s.replace(/\/private\/var\S*|\/var\S*|\/Users\S*/g, '<ROOT>');
  assert.equal(norm(fromRepo.out), norm(fromRoot.out), 'cwd must not change the corpus');
  assert.equal(norm(fromTmp.out), norm(fromRoot.out), 'cwd must not change the corpus');
  assert.ok(fromRepo.out.includes(isoBack(2)), 'it must still see the FIXTURE gap, not the repo');
});

// ------------------------------------------------------------- unit arms

test('10. gaps are computed across month and year boundaries', () => {
  const sel = {
    corpus: 'read',
    corpusDetail: 'x',
    files: [],
    dated: [
      { name: 'a', y: 2026, m: 8, d: 30, iso: '2026-08-30' },
      { name: 'b', y: 2026, m: 9, d: 2, iso: '2026-09-02' },
    ],
  };
  const r = analyse(sel, { y: 2026, m: 9, d: 2 });
  assert.deepEqual(r.missing, ['2026-08-31', '2026-09-01']);
  assert.equal(r.ageDays, 0);

  const across = analyse(
    {
      ...sel,
      dated: [
        { name: 'a', y: 2026, m: 12, d: 31, iso: '2026-12-31' },
        { name: 'b', y: 2027, m: 1, d: 2, iso: '2027-01-02' },
      ],
    },
    { y: 2027, m: 1, d: 2 },
  );
  assert.deepEqual(across.missing, ['2027-01-01']);
});

test('11. day arithmetic is leap-correct and monotone (no Date, so no timezone)', () => {
  assert.equal(dayNumber({ y: 2028, m: 3, d: 1 }) - dayNumber({ y: 2028, m: 2, d: 28 }), 2, '2028 is a leap year');
  assert.equal(dayNumber({ y: 2026, m: 3, d: 1 }) - dayNumber({ y: 2026, m: 2, d: 28 }), 1, '2026 is not');
  assert.equal(dayNumber({ y: 2100, m: 3, d: 1 }) - dayNumber({ y: 2100, m: 2, d: 28 }), 1, '2100 is not a leap year');
});

test('12. parseName accepts only well-formed calendar names', () => {
  assert.ok(parseName('ledger-2026-08-29.db'));
  assert.equal(parseName('ledger-2026-13-01.db'), null);
  assert.equal(parseName('ledger-2026-02-30.db'), null);
  assert.equal(parseName('ledger-2026-8-9.db'), null);
  assert.equal(parseName('ledger-20260829.db'), null);
  assert.equal(parseName('ledger-2026-08-29.db.bak'), null);
});

test('13. exitCodeFor keeps 2 (could not answer) above 1 (refuses) above 0', () => {
  // anchorState: 'read' is stated in every arm that expects an ANSWER — since
  // s2671 a report without an external denominator cannot produce 0 or 1 at all.
  const ok = { anchorState: 'read' };
  assert.equal(exitCodeFor({ ...ok, corpus: 'absent', missing: [], ageDays: null }, true), 2);
  assert.equal(exitCodeFor({ ...ok, corpus: 'unreadable', missing: [], ageDays: null }, true), 2);
  assert.equal(exitCodeFor({ ...ok, corpus: 'read', empty: true, missing: [], ageDays: null }, true), 2);
  assert.equal(exitCodeFor({ ...ok, corpus: 'read', missing: ['2026-08-27'], ageDays: 0 }, true), 1);
  assert.equal(exitCodeFor({ ...ok, corpus: 'read', missing: [], ageDays: 5 }, true), 1);
  assert.equal(exitCodeFor({ ...ok, corpus: 'read', missing: [], ageDays: 1 }, true), 0);
  // the advisory contract, asserted directly
  for (const corpus of ['read', 'absent', 'unreadable']) {
    assert.equal(exitCodeFor({ ...ok, corpus, missing: ['x'], ageDays: 9 }, false), 0);
  }
});

// -------------------------------------- s2671: the DENOMINATOR (F-2668-2's gate)
//
// The subject's span used to take BOTH edges from the directory it audits. The
// right edge was safe (checked against today); the left edge was whatever
// survived, so a wholesale loss of the old end of the series was invisible by
// construction and printed a clean verdict. Arms 16-20 are the teeth for the
// external anchor that closes it. Every one was proven by manufacturing the
// defect first: artifacts/s2671/repro-self-denominator.txt is the transcript of
// the pre-cure subject calling a 1-of-32 series whole.

test('16. THE DEFECT, GUARDED: 31 of 32 days deleted is NAMED, not read as a shorter perfect series', () => {
  const anchor = isoBack(31);
  const root = mk([dbFor(isoBack(0))], { anchor });
  const a = runIn(root);
  assert.ok(a.out.length > 0, 'control validity: the arm must actually produce output');
  assert.match(a.out, /MISSING COVERAGE DAY\(S\): 31/);
  assert.ok(a.out.includes(anchor), 'the declared first coverage day itself is missing and must be named');
  assert.match(a.out, /1\/32 day\(s\) present/, 'the denominator is the DECLARED span, not the surviving one');
  assert.doesNotMatch(a.out, /WHOLE AND CURRENT/);
  assert.equal(runIn(root, ['--strict']).rc, 1, 'answered, and the answer refuses');
});

test('17. an ABSENT anchor WITHHOLDS the verdict — 2 (could not answer), never a silent fallback', () => {
  // The whole series is on disk and perfectly healthy; the point is that the
  // subject cannot KNOW that without a denominator, and must not pretend to.
  const root = mk([dbFor(isoBack(2)), dbFor(isoBack(1)), dbFor(isoBack(0))]);
  const a = runIn(root);
  assert.match(a.out, /series anchor\s+: ABSENT/);
  assert.match(a.out, /CANNOT VERIFY WHOLENESS/);
  assert.doesNotMatch(a.out, /WHOLE AND CURRENT/, 'a cure that degrades to the defect is the defect with extra steps');
  assert.equal(a.rc, 0, 'advisory stays 0 in every state');
  assert.equal(runIn(root, ['--strict']).rc, 2, 'could not answer (2), NOT answered-and-clear (0)');
});

test('18. a MALFORMED anchor is could-not-answer too — bad JSON and a non-calendar day alike', () => {
  const days = [dbFor(isoBack(1)), dbFor(isoBack(0))];
  const badJson = mk(days, { anchorRaw: '{ this is not json' });
  assert.match(runIn(badJson).out, /series anchor\s+: MALFORMED/);
  assert.equal(runIn(badJson, ['--strict']).rc, 2);

  const badDay = mk(days, { anchor: '2026-02-30' });
  assert.match(runIn(badDay).out, /series anchor\s+: MALFORMED/, 'the calendar is validated, not the shape');
  assert.equal(runIn(badDay, ['--strict']).rc, 2);

  const noField = mk(days, { anchorRaw: JSON.stringify({ note: 'wrong key' }) });
  assert.match(runIn(noField).out, /series anchor\s+: MALFORMED/);
  assert.equal(runIn(noField, ['--strict']).rc, 2);
});

test('19. the ANCHOR is declared on the HAPPY path too, with its source (F-2208-1)', () => {
  const root = mk([dbFor(isoBack(1)), dbFor(isoBack(0))], { anchor: isoBack(1) });
  const a = runIn(root);
  assert.ok(a.out.includes(`series anchor           : ${isoBack(1)}`), `got:\n${a.out}`);
  assert.match(a.out, /declared OUTSIDE the corpus/);
  assert.match(a.out, /left edge from the anchor/, 'the span must say where its left edge came from');
});

test('20. a file OLDER than the anchor widens the window and is never counted as a hole', () => {
  // Someone backfilled further back than the declared start. That is not an
  // error and must not manufacture missing days before the anchor.
  const root = mk([dbFor(isoBack(3)), dbFor(isoBack(2)), dbFor(isoBack(1)), dbFor(isoBack(0))], {
    anchor: isoBack(1),
  });
  const a = runIn(root);
  assert.doesNotMatch(a.out, /MISSING COVERAGE DAY/);
  assert.match(a.out, /4\/4 day\(s\) present/, 'the window widened to the oldest file, not to the anchor');
  assert.match(a.out, /predate the anchor/);
  assert.equal(runIn(root, ['--strict']).rc, 0);
});

test('21. the repo\'s OWN anchor is present, parseable and a real calendar day', () => {
  // The subject fails safe without it, which means a lost anchor degrades to a
  // permanent advisory 2 that nobody is obliged to read. This arm is what makes
  // its absence a RED rather than a shrug.
  const anchor = readAnchor();
  assert.equal(anchor.state, 'read', `the repo anchor must be readable, got: ${anchor.detail}`);
  assert.equal(typeof anchor.iso, 'string');
  assert.ok(Number.isInteger(anchor.day), 'the anchor must resolve to a day number');
  assert.ok(anchor.day <= dayNumber(localToday()), 'an anchor in the FUTURE would silence every hole');
});

test('15. localToday reads LOCAL components — the UTC date-only trap, guarded', () => {
  // 02:00 local. On any machine east of UTC this instant's UTC DATE is the
  // previous day, which is exactly how a toISOString()-derived "today" silently
  // reasons about yesterday for the first hours of every local day.
  const d = new Date(2026, 7, 30, 2, 0, 0);

  // The invariant, asserted on ANY machine in ANY timezone: this must be the
  // local calendar date, never a UTC-projected one.
  assert.deepEqual(localToday(d), { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() });

  // And where the two genuinely disagree, prove the tool takes the local side.
  // Guarded by the offset so this can never red on a UTC-configured machine —
  // but on this repo's machine (UTC+07) it is the arm that has the teeth.
  const utcDate = d.toISOString().slice(0, 10);
  const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  if (utcDate !== localDate) {
    assert.equal(localDate, '2026-08-30');
    assert.notEqual(utcDate, localDate, 'control: the two really do disagree at this instant');
    assert.equal(
      `${localToday(d).y}-${String(localToday(d).m).padStart(2, '0')}-${String(localToday(d).d).padStart(2, '0')}`,
      localDate,
      'localToday must follow the LOCAL date when the two diverge',
    );
  }
});

test('14. readMirrors DECLARES an unreadable corpus rather than returning an empty selection', () => {
  const sel = readMirrors(path.join(tmpdir(), 's2351-does-not-exist-' + process.pid));
  assert.equal(sel.corpus, 'absent');
  assert.equal(sel.dated.length, 0);
  assert.equal(typeof sel.corpus, 'string', 'a STRING, so careless truthiness coerces toward noticing');
});
