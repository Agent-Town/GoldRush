#!/usr/bin/env node
/**
 * desk-unrecorded-mention-guard.test.mjs — does UNRECORDED say WHICH kind of
 * "no record" it means? (F-2263-1, s2263.)
 *
 * WHY THIS EXISTS
 * ---------------
 * desk-state-audit keys every BACKLOG row by the FIRST F-ID inside its 90-char
 * subject zone, and a row states the state only of that subject. That rule is
 * CORRECT and is not what this guards.
 *
 * What it guards is the branch the rule leaves behind. An id that never wins a
 * subject zone falls to `UNRECORDED` — and that one word covered two facts that
 * demand OPPOSITE acts:
 *
 *   (a) the board has never heard of this id      -> a bookkeeping gap; write a row
 *   (b) the board DISCUSSES this id, and the       -> go read those lines; the tool
 *       subject-first rule declined to attribute      is deliberately silent, not
 *       state from those rows                         empty-handed
 *
 * PROVEN BY MANUFACTURING, not by reading: a desk carrying F-2249-2 (present on
 * BACKLOG line 10, never a subject) and F-9999-9 (absent entirely) printed
 * `finding\tUNRECORDED\t—` for BOTH — byte-identical verdict and evidence.
 * Measured on the live board: 567 of 2,175 distinct F-IDs never win a subject
 * zone, so case (b) is the overwhelmingly common one.
 *
 * This is the s2262 aim landing one tool over: ask not whether a selector
 * DECLARES, but whether it declares ON THE BRANCH WHERE IT IS MOST LIKELY TO BE
 * WRONG. classifyFinding printed evidence line numbers on every branch that HAS
 * rows and was silent on the single branch that has none.
 *
 * SEVERITY, STATED HONESTLY AND NOT INFLATED
 * ------------------------------------------
 * LATENT. The live desk reads UNRECORDED=0 (29 carried items, verified s2262 and
 * again s2263), the tool is advisory and exits 0 always, and `--strict` reds only
 * on CLOSED. No verdict was wrong and no gate was wrong. What was wrong is that
 * the word over-claimed: it asserted ABSENCE where the truth may be PRESENT-BUT-
 * UNATTRIBUTABLE.
 *
 * WHAT THIS ASSERTS — AND THE REVERSE CONTROLS THAT BOUND IT
 * ----------------------------------------------------------
 * The cure DECLARES and does NOT refuse: mentioned-not-subject is a lawful,
 * routine state (555 such ids carry a state marker on their line), so a refusal
 * would red on ordinary work and be excused into uselessness inside a week
 * (F-1460-1). Arms 5, 6 and 8 are the reverse controls: the verdict vocabulary,
 * the counts and the other four branches must all be untouched, and declaring
 * must never become refusing.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { audit } from './desk-state-audit.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TOOL = path.join(HERE, 'desk-state-audit.mjs');

const deskLine = (...ids) =>
  'Last updated: 2026-01-01T00:00Z s1 handoff, lock CLEARED — fixture. ' +
  `\u{1F53A} **OWNER'S DESK — ${ids.length} awaiting a word.** ` +
  ids.map((id) => `\u{1F53A} **${id}**`).join(' ');

// Line 1 is a subject row for F-1000-1 that merely CITES F-2000-2.
// Line 2 is a subject row for F-3000-3, open.
const BACKLOG = [
  '- **F-1000-1 ✅ SHIPPED** (s10, merge `abc1234`) — cured the thing, and see F-2000-2 for the sibling.',
  '- **F-3000-3 \u{1F53A} OPEN** — awaiting an owner word.',
  '- prose line with no finding id at all.',
].join('\n');

const classify = (id, backlog = BACKLOG) => {
  const result = audit(deskLine(id), backlog, {});
  return result.items[0];
};

test('an id mentioned only as a NON-SUBJECT declares WHERE it was seen', () => {
  const item = classify('F-2000-2');
  assert.equal(item.verdict, 'UNRECORDED');
  assert.deepEqual(item.mentioned, [1]);
  assert.match(item.mentionNote, /mentioned \(non-subject\) at 1\b/);
});

test('an id absent from the board declares its ABSENCE, not silence', () => {
  const item = classify('F-9999-9');
  assert.equal(item.verdict, 'UNRECORDED');
  assert.deepEqual(item.mentioned, []);
  assert.match(item.mentionNote, /absent from BACKLOG entirely/);
});

test('THE CORE ASSERTION — the two are DISTINGUISHABLE', () => {
  const seen = classify('F-2000-2');
  const absent = classify('F-9999-9');
  assert.equal(seen.verdict, absent.verdict, 'same verdict word, by design');
  assert.notEqual(
    seen.mentionNote,
    absent.mentionNote,
    'two facts demanding opposite acts must not print identically',
  );
});

test('the declaration names the state it must NOT attribute', () => {
  // The mentioning row is a ✅ SHIPPED row. The cure reports WHERE to look and
  // must never let that ✅ leak into the verdict for the cited id.
  const item = classify('F-2000-2');
  assert.equal(item.verdict, 'UNRECORDED');
  assert.notEqual(item.verdict, 'CLOSED');
  assert.deepEqual(item.evidence, [], 'evidence stays empty; only the note speaks');
  assert.match(item.mentionNote, /NOT attributable/);
});

test('REVERSE CONTROL — a subject id is untouched by the cure', () => {
  // Deliberately format-independent. These fixtures do not use the census's
  // closed/open vocabulary, so both subjects land in OPEN-DESK-ONLY — and that
  // is fine, because the invariant under test is not WHICH branch they take but
  // that the cure neither reclassifies nor annotates any branch that HAS rows.
  // The broader claim (every other branch byte-identical) is proven by the
  // F-1274-2 neutrality run over every archived desk in STATUS.md, not here.
  for (const id of ['F-1000-1', 'F-3000-3']) {
    const item = classify(id);
    assert.notEqual(item.verdict, 'UNRECORDED', `${id} has a row of its own`);
    assert.equal(item.mentionNote, undefined, `${id}: no mention machinery off the empty branch`);
    assert.equal(item.mentioned, undefined);
    assert.ok(item.evidence.length > 0, `${id} still reports its own row`);
  }
});

test('REVERSE CONTROL — an id that is BOTH a subject and a mention is not UNRECORDED', () => {
  const backlog = [BACKLOG, '- **F-2000-2 \u{1F53A} OPEN** — now it has a row of its own.'].join('\n');
  const item = classify('F-2000-2', backlog);
  assert.notEqual(item.verdict, 'UNRECORDED', 'one subject row is enough to leave the branch');
  assert.equal(item.mentionNote, undefined);
});

test('the counts line is untouched — both kinds still tally as UNRECORDED', () => {
  const result = audit(deskLine('F-2000-2', 'F-9999-9'), BACKLOG, {});
  assert.equal(result.counts.UNRECORDED, 2);
  assert.equal(result.counts.CLOSED, 0);
  assert.equal(result.counts.OPEN, 0);
});

test('REVERSE CONTROL — declaring must not become refusing (--strict stays 0)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's2263-'));
  try {
    const statusPath = path.join(dir, 'STATUS.md');
    const backlogPath = path.join(dir, 'BACKLOG.md');
    const goalsPath = path.join(dir, 'goals.json');
    fs.writeFileSync(statusPath, deskLine('F-2000-2', 'F-9999-9'));
    fs.writeFileSync(backlogPath, BACKLOG);
    fs.writeFileSync(goalsPath, '{}');
    const r = spawnSync('node',
      [TOOL, '--status', statusPath, '--backlog', backlogPath, '--goals', goalsPath, '--strict'],
      { encoding: 'utf8' });
    assert.equal(r.status, 0, 'an UNRECORDED-only desk must not red --strict');
    assert.match(r.stdout, /mentioned \(non-subject\) at 1/);
    assert.match(r.stdout, /absent from BACKLOG entirely/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('END TO END — the CLI stdout carries both declarations (F-2210-1)', () => {
  // Test from where the CALLER stands: this tool is advisory, so in the mode a
  // fire actually runs it the exit code carries no information and the whole
  // verdict travels on stdout. Asserting only the exported function tests the
  // half nobody reads.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's2263-'));
  try {
    const statusPath = path.join(dir, 'STATUS.md');
    const backlogPath = path.join(dir, 'BACKLOG.md');
    const goalsPath = path.join(dir, 'goals.json');
    fs.writeFileSync(statusPath, deskLine('F-2000-2', 'F-9999-9'));
    fs.writeFileSync(backlogPath, BACKLOG);
    fs.writeFileSync(goalsPath, '{}');
    const r = spawnSync('node',
      [TOOL, '--status', statusPath, '--backlog', backlogPath, '--goals', goalsPath],
      { encoding: 'utf8' });
    assert.equal(r.status, 0);
    assert.ok(r.stdout.length > 0, 'the arm really produced output (F-2215-1)');
    const rows = r.stdout.split('\n').filter((l) => /^F-\S+\t/.test(l));
    assert.equal(rows.length, 2);
    assert.notEqual(
      rows[0].replace(/^F-\S+\t/, ''),
      rows[1].replace(/^F-\S+\t/, ''),
      'the CLI must print them differently, not merely the library',
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('--json carries the declaration for machine callers', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's2263-'));
  try {
    const statusPath = path.join(dir, 'STATUS.md');
    const backlogPath = path.join(dir, 'BACKLOG.md');
    const goalsPath = path.join(dir, 'goals.json');
    fs.writeFileSync(statusPath, deskLine('F-2000-2'));
    fs.writeFileSync(backlogPath, BACKLOG);
    fs.writeFileSync(goalsPath, '{}');
    const r = spawnSync('node',
      [TOOL, '--status', statusPath, '--backlog', backlogPath, '--goals', goalsPath, '--json'],
      { encoding: 'utf8' });
    assert.equal(r.status, 0);
    const parsed = JSON.parse(r.stdout);
    assert.deepEqual(parsed.items[0].mentioned, [1]);
    assert.match(parsed.items[0].mentionNote, /non-subject/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the two id regexes are DERIVED from one source and cannot drift', () => {
  // Four independent copies of one predicate is how the F-2227-1 lock test
  // rotted for hundreds of fires, in this very file.
  const src = fs.readFileSync(TOOL, 'utf8');
  assert.match(
    src,
    /const FINDING_ALL = new RegExp\(FINDING_ONE\.source, 'g'\)/,
    'FINDING_ALL must be derived from FINDING_ONE, never re-typed',
  );
});

test('a multi-mention id lists every line, deduped, in order', () => {
  const backlog = [
    BACKLOG,
    '- **F-4000-4 \u{1F53A} OPEN** — cites F-2000-2 and F-2000-2 again on one line.',
    '- **F-5000-5 \u{1F53A} OPEN** — also cites F-2000-2.',
  ].join('\n');
  const item = classify('F-2000-2', backlog);
  assert.equal(item.verdict, 'UNRECORDED');
  assert.deepEqual(item.mentioned, [1, 4, 5], 'one entry per line, not per occurrence');
});
