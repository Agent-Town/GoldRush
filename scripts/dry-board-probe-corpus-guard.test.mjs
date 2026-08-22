/**
 * F-2217-1 — the ENUMERATION layer of dry-board-probe.
 *
 * The streak that produced this guard walked one layer outward each fire:
 *   F-2209-1  the EXIT CODE      (nothing exercised exitCodeFor's call site)
 *   F-2210-1  STDOUT             (advisory mode carries the verdict there, untested)
 *   F-2211-1  the CAPTURE        (a crash classified as the verdict it died on)
 *   F-2217-1  the ENUMERATION    (the subject set is empty because the READ FAILED)
 *
 * `selectSubjects` swallowed a failed `readdirSync(tasks/done)` and returned the
 * empty selection. Empty subjects drive every bucket to zero, so `main()` printed
 *
 *     ✅ DRY — every subject resolves merged or closed. The word is earned.
 *
 * at rc=0 in BOTH modes, byte-identical on both channels to a genuinely clean
 * board. That is the s1061 incident reproduced inside the tool built to prevent
 * it: four consecutive fires declared a dry board off an instrument that could
 * not fail loudly.
 *
 * The legacy suite's test "a missing tasks/done directory yields an empty,
 * non-throwing result" asserts the ENUMERATION and is correct about it -- it
 * simply never asks what the CALLER then prints. A guard that asserts a
 * principle only at the layer where it holds certifies its own blind spot
 * (F-2208-1's own lesson, recurring at the next layer in).
 *
 * Every red arm below was proven by manufacturing the defect on a scratch copy.
 * Arms 4-6 are REVERSE CONTROLS: they fail if the cure is one level too general
 * (refusing unconditionally, or collapsing "could not answer" into "refuses").
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { exitCodeFor, selectSubjects } from './dry-board-probe.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROBE = path.join(HERE, 'dry-board-probe.mjs');

const EARNED = 'The word is earned';
const CANNOT_VERIFY = 'CANNOT VERIFY';

/** A fixture board. `drain` adds one bare-dated (=> non-terminal => probed) entry. */
function board(t, { drain }) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dry-board-corpus-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'tasks', 'done'), { recursive: true });
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  // A terminal-prefixed entry so the corpus is non-empty but contributes no subject.
  fs.writeFileSync(path.join(root, 'tasks', 'done', 'drained-s1-20260801-010101-x.md'), 'x');
  if (drain) {
    fs.writeFileSync(path.join(root, 'tasks', 'done', '20260801-020202-real-slice.md'), 'x');
  }
  // Stub the classifier so the live corpus is never read and the fixture owns its verdict.
  fs.writeFileSync(
    path.join(root, 'scripts', 'drain-block-check.mjs'),
    'console.log("✅ CLEAR — nothing blocks this drain");\n',
  );
  return root;
}

function hideCorpus(root) {
  fs.renameSync(path.join(root, 'tasks', 'done'), path.join(root, 'tasks', 'done-hidden'));
}

function runProbe(root, args = []) {
  const r = spawnSync('node', [PROBE, ...args], { cwd: root, encoding: 'utf8' });
  return { rc: r.status, out: r.stdout || '' };
}

// ---------------------------------------------------------------------------
// THE DEFECT — both channels, both modes.
// ---------------------------------------------------------------------------

test('an unreadable corpus never prints the earned-DRY banner in ADVISORY mode', (t) => {
  const root = board(t, { drain: true });

  // Control first: the fixture really does hold a drain the probe can see.
  const truth = runProbe(root);
  assert.match(truth.out, /NOT DRY/, 'control invalid — the fixture drain was not detected');

  hideCorpus(root);
  const got = runProbe(root);
  assert.ok(!got.out.includes(EARNED), 'declared a dry board off a corpus it never read');
  assert.match(got.out, new RegExp(CANNOT_VERIFY));
});

test('an unreadable corpus exits 2 = "could not answer" under --strict', (t) => {
  const root = board(t, { drain: true });
  hideCorpus(root);
  assert.equal(runProbe(root, ['--strict']).rc, 2);
});

test('the corpus source is declared on stdout ALWAYS, including the happy path', (t) => {
  // F-2208-1: a declaration that appears only on failure re-creates the very
  // ambiguity it removes. This arm reds if a cure declares only when refusing.
  const root = board(t, { drain: false });
  assert.match(runProbe(root).out, /corpus tasks\/done\/\s*:\s*read/);
});

// ---------------------------------------------------------------------------
// REVERSE CONTROLS — an over-general cure passes every arm above and reds here.
// ---------------------------------------------------------------------------

test('REVERSE CONTROL: a genuinely dry board still earns the word, rc=0 in both modes', (t) => {
  const root = board(t, { drain: false });
  const adv = runProbe(root);
  assert.match(adv.out, new RegExp(EARNED), 'a cure that refuses unconditionally broke the happy path');
  assert.equal(adv.rc, 0);
  assert.equal(runProbe(root, ['--strict']).rc, 0);
});

test('REVERSE CONTROL: a real drain still exits 1, never collapsed into 2', (t) => {
  const root = board(t, { drain: true });
  const strict = runProbe(root, ['--strict']);
  assert.equal(strict.rc, 1, '"answered, and the answer refuses" must not become "could not answer"');
  assert.match(strict.out, /NOT DRY/);
});

test('REVERSE CONTROL: the advisory default still exits 0 on an unreadable corpus', (t) => {
  // An advisory reader must never block a drain by its own absence. The banner
  // is the cure in advisory mode; the exit code stays advisory by design.
  const root = board(t, { drain: true });
  hideCorpus(root);
  assert.equal(runProbe(root).rc, 0);
});

// ---------------------------------------------------------------------------
// The decision function itself, and the legacy two-argument call shape.
// ---------------------------------------------------------------------------

test('exitCodeFor: an unreadable corpus outranks every bucket verdict', () => {
  const withDrain = { merged: [], closed: [], unknown: [], drain: ['a.md'] };
  assert.equal(exitCodeFor(withDrain, true, 'unreadable'), 2,
    'when the corpus was never read the buckets are not evidence at all');
  assert.equal(exitCodeFor(withDrain, true, 'read'), 1);
});

test('exitCodeFor: the legacy two-argument call is unchanged (corpus defaults to read)', () => {
  const empty = { merged: [], closed: [], unknown: [], drain: [] };
  const unknown = { merged: [], closed: [], unknown: ['a.md'], drain: [] };
  assert.equal(exitCodeFor(empty, true), 0);
  assert.equal(exitCodeFor(unknown, true), 2);
  assert.equal(exitCodeFor(empty, false), 0);
});

test('selectSubjects declares corpus="unreadable" with a detail, not a bare empty result', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dry-board-corpus-none-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const sel = selectSubjects(root);
  assert.equal(sel.corpus, 'unreadable');
  assert.equal(typeof sel.corpus, 'string',
    'a STRING so a careless truthiness test coerces toward NOTICING (F-2212-1)');
  assert.ok(sel.corpusDetail.length > 0);
  // The legacy contract still holds.
  assert.deepEqual(sel.subjects, []);
  assert.equal(sel.total, 0);
});

test('selectSubjects declares corpus="read" on a corpus it really read', (t) => {
  const root = board(t, { drain: true });
  const sel = selectSubjects(root);
  assert.equal(sel.corpus, 'read');
  assert.equal(sel.subjects.length, 1);
});
