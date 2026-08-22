#!/usr/bin/env node
/**
 * dry-board-probe.test.mjs — the guard for F-2207-1.
 *
 * Every assertion here was PROVEN BY MANUFACTURING THE DEFECT on a fixture, not
 * by observing a green (the s1299/s1300 standard: a passing guard never executes
 * its violation path, so its green says nothing about its red).
 *
 * The load-bearing case is `held`: §2F's prose filter selects only bare-dated
 * files, so a `held-` done-move -- the exact shape a DEFERRED drain takes -- is
 * invisible to it. At s2207 the live corpus held 6 of them, one being lane/a's
 * undrained e10s-1b slice.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { TERMINAL_TOKENS, bareDate, bucketOf, embeddedDate, selectSubjects } from './dry-board-probe.mjs';

function fixture(names) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dry-board-probe-'));
  fs.mkdirSync(path.join(root, 'tasks', 'done'), { recursive: true });
  for (const n of names) fs.writeFileSync(path.join(root, 'tasks', 'done', n), 'x\n');
  return root;
}

// A prefixed file fixes the convention start at 2026-07-25, matching the live corpus.
const ANCHOR = 'noop-s1033-20260725-140651-lane-m2-05-readiness-seam.md';

test('the convention start is DERIVED from the corpus, never pinned', (t) => {
  const root = fixture([ANCHOR, '20260705-010101-legacy.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  assert.equal(selectSubjects(root).conventionStart, '20260725');

  // RED arm: move the earliest prefixed file and the boundary MUST move with it.
  const later = fixture(['noop-s1200-20260810-090000-thing.md', '20260801-010101-mid.md']);
  t.after(() => fs.rmSync(later, { recursive: true }));
  const sel = selectSubjects(later);
  assert.equal(sel.conventionStart, '20260810');
  // 20260801 now precedes the convention, so it is legacy -- a date pinned at
  // 20260725 would have wrongly kept it as a subject. (The noop- file is skipped
  // on its own terminal prefix, which is why the subject set is empty here.)
  assert.deepEqual(sel.skippedLegacy, ['20260801-010101-mid.md']);
  assert.deepEqual(sel.subjects, []);
});

test('a NUMERIC SHORT HASH is never mistaken for a date', (t) => {
  // Both of these are REAL filenames from the live corpus. A /(\d{8})-\d{6}/
  // reader takes `09102598` and `15505222` as dates (years 0910 and 1550) and
  // drags the derived boundary back to prehistory -- which is exactly what this
  // script did on its first live run: 32 subjects became 562.
  const hashy = 'shipped-09102598-20260727-133154-lane-055-standard-note-assertion-and-briefing.md';
  const hashy2 = 'drained-s1243-15505222-20260730-051923-ret-01-run-log-recoverability-guard.md';
  assert.equal(embeddedDate(hashy), '20260727');
  assert.equal(embeddedDate(hashy2), '20260730');
  assert.equal(bareDate('09102598-133154-not-a-date.md'), null, 'year 0910 is not plausible');
  assert.equal(bareDate('20260727-133154-real.md'), '20260727');

  // RED arm: with the anchor at 2026-07-25, a hash-bearing file must NOT move the
  // boundary, so the pre-convention file stays legacy.
  const root = fixture([ANCHOR, hashy, hashy2, '20260705-010101-legacy.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  const sel = selectSubjects(root);
  assert.equal(sel.conventionStart, '20260725');
  assert.deepEqual(sel.skippedLegacy, ['20260705-010101-legacy.md']);
});

test('a bare-dated file on/after the convention start is a subject; before it is legacy', (t) => {
  const root = fixture([ANCHOR, '20260726-072430-lane-e1-secure-wave-truth.md', '20260705-010101-legacy.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  const sel = selectSubjects(root);
  assert.ok(sel.subjects.includes('20260726-072430-lane-e1-secure-wave-truth.md'));
  assert.deepEqual(sel.skippedLegacy, ['20260705-010101-legacy.md']);
});

test('F-2207-1: a NON-TERMINAL prefix is a subject — this is the whole finding', (t) => {
  const held = 'held-s2125-owner-fork-f2125-1-20260821-112744-e10s-1b-ember-shore-schema-and-data.md';
  const ready = 'ready-for-gates-s1330-UNDRAINED-7c4f132f-leaf-blocked-20260801-122335-f1328-1-drill-yard-census-debt.md';
  const root = fixture([ANCHOR, held, ready, 'partial-a8f02a7a0-20260821-134347-f2127-1-stdin-rejection-deadlock.md',
    'blocked-s1217-F1217-1-20260729-165229-ap-orders-adapter-wiring.md',
    'OWNER-GATED-F-1096-2-do-not-drain-20260727-011937-lane-hero-y-restore-roundtrip.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  const sel = selectSubjects(root);
  for (const n of [held, ready]) assert.ok(sel.subjects.includes(n), `${n} must be a subject`);
  assert.equal(sel.subjects.length, 5, 'all five non-terminal prefixes are subjects');
  assert.equal(sel.skippedTerminal.length, 1, 'only the noop anchor is skipped');

  // RED arm: §2F's prose filter (bare-dated only) sees NONE of them.
  const proseFilter = Object.keys(sel.tokens).length > 0
    ? sel.subjects.filter((n) => /^\d{8}-/.test(n)) : [];
  assert.equal(proseFilter.length, 0,
    'the bare-dated-only filter is blind to every one of these — that is F-2207-1');
});

test('an UNRECOGNISED prefix fails SAFE into the subject set', (t) => {
  const root = fixture([ANCHOR, 'quarantined-s9999-20260901-000000-some-future-convention.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  const sel = selectSubjects(root);
  assert.ok(sel.subjects.includes('quarantined-s9999-20260901-000000-some-future-convention.md'),
    'a prefix nobody has invented yet must be probed, not skipped');
});

test('terminal prefixes are skipped, case-insensitively', (t) => {
  const names = [...TERMINAL_TOKENS].map((t2, i) => `${t2}-s10${i}-2026080${i % 9}-010101-x${i}.md`);
  const root = fixture([ANCHOR, ...names, 'DRAINED-s999-20260808-010101-shouty.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  const sel = selectSubjects(root);
  assert.deepEqual(sel.subjects, [], 'no terminal-prefixed file is a subject');
  assert.equal(sel.skippedTerminal.length, TERMINAL_TOKENS.size + 2);
});

test('with no prefixed file at all, nothing is legacy', (t) => {
  const root = fixture(['20260705-010101-a.md', '20260706-010101-b.md']);
  t.after(() => fs.rmSync(root, { recursive: true }));
  const sel = selectSubjects(root);
  assert.equal(sel.conventionStart, null);
  assert.equal(sel.subjects.length, 2, 'bare-dating carries no signal, so probe everything');
  assert.deepEqual(sel.skippedLegacy, []);
});

test('UNKNOWN is bucketed apart from CLEAR — it is not a clearance', () => {
  assert.equal(bucketOf('? UNKNOWN — no goal leaf matches "x.md".'), 'unknown');
  assert.equal(bucketOf('⛔ CLOSED — DO NOT DRAIN: x.md'), 'closed');
  assert.equal(bucketOf('⛔ BLOCKED — DO NOT DRAIN: x.md'), 'closed');
  assert.equal(bucketOf('✅ CLEAR — x.md [leaf] status="merged"'), 'merged');
  // RED arm: a CLEAR with no merged status is a real drain, never a ghost.
  assert.equal(bucketOf('✅ CLEAR — x.md [leaf] status="queued"'), 'drain');
});

test('a missing tasks/done directory yields an empty, non-throwing result', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dry-board-probe-'));
  t.after(() => fs.rmSync(root, { recursive: true }));
  const sel = selectSubjects(root);
  assert.deepEqual(sel.subjects, []);
  assert.equal(sel.total, 0);
});
