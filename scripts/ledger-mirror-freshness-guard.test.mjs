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
  localToday,
} from './ledger-mirror-freshness.mjs';

const SUBJECT = fileURLToPath(new URL('./ledger-mirror-freshness.mjs', import.meta.url));

/** Build a fixture tree and RELOCATE the subject into it. */
function fixture(days, { makeMirrorDir = true } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 's2351-lmf-'));
  mkdirSync(path.join(root, 'scripts'), { recursive: true });
  copyFileSync(SUBJECT, path.join(root, 'scripts', path.basename(SUBJECT)));
  if (makeMirrorDir) {
    const dir = path.join(root, 'artifacts', 'ledger-backups');
    mkdirSync(dir, { recursive: true });
    for (const name of days) writeFileSync(path.join(dir, name), 'x');
  }
  return root;
}

function runIn(root, args = [], cwd = root) {
  const r = spawnSync('node', [path.join(root, 'scripts', path.basename(SUBJECT)), ...args], {
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
  const root = mk([dbFor(isoBack(2)), dbFor(isoBack(1)), dbFor(isoBack(0))]);
  const a = runIn(root);
  assert.ok(a.out.length > 0, 'control validity: the arm must actually produce output');
  assert.match(a.out, /WHOLE AND CURRENT/);
  assert.doesNotMatch(a.out, /MISSING COVERAGE DAY/);
  assert.equal(a.rc, 0);
  assert.equal(runIn(root, ['--strict']).rc, 0);
});

test('2. an INTERIOR hole is NAMED and strict exits 1 — the defect LB-01 cannot see', () => {
  // today, today-1 present, today-2 MISSING, today-3 present.
  const root = mk([dbFor(isoBack(3)), dbFor(isoBack(1)), dbFor(isoBack(0))]);
  const a = runIn(root);
  assert.ok(a.out.length > 0, 'control validity: the arm must actually produce output');
  assert.match(a.out, /MISSING COVERAGE DAY\(S\): 1/);
  assert.ok(a.out.includes(isoBack(2)), `the missing day ${isoBack(2)} must be named, got:\n${a.out}`);
  assert.equal(runIn(root, ['--strict']).rc, 1, 'answered, and the answer refuses');
});

test('3. a STALE newest (no holes) is reported with its age and strict exits 1', () => {
  const root = mk([dbFor(isoBack(6)), dbFor(isoBack(5))]);
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
  const root = mk([dbFor(isoBack(0)), 'ledger-2026-13-45.db', 'ledger-2026-02-30.db', 'notes.txt']);
  const a = runIn(root);
  // 4 entries on disk, but only the one real date is a subject.
  assert.match(a.out, /corpus\s+: read \(4 entries, 1 dated\)/);
  assert.doesNotMatch(a.out, /MISSING COVERAGE DAY/, 'a bogus date must not stretch the span');
});

test('9. REVERSE CONTROL: a relocated copy measures ITS OWN tree, from any cwd', () => {
  // Over-anchoring the corpus to process.cwd() passes every arm above and reds here.
  const root = mk([dbFor(isoBack(3)), dbFor(isoBack(0))]);
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
  assert.equal(exitCodeFor({ corpus: 'absent', missing: [], ageDays: null }, true), 2);
  assert.equal(exitCodeFor({ corpus: 'unreadable', missing: [], ageDays: null }, true), 2);
  assert.equal(exitCodeFor({ corpus: 'read', empty: true, missing: [], ageDays: null }, true), 2);
  assert.equal(exitCodeFor({ corpus: 'read', missing: ['2026-08-27'], ageDays: 0 }, true), 1);
  assert.equal(exitCodeFor({ corpus: 'read', missing: [], ageDays: 5 }, true), 1);
  assert.equal(exitCodeFor({ corpus: 'read', missing: [], ageDays: 1 }, true), 0);
  // the advisory contract, asserted directly
  for (const corpus of ['read', 'absent', 'unreadable']) {
    assert.equal(exitCodeFor({ corpus, missing: ['x'], ageDays: 9 }, false), 0);
  }
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
