/**
 * F-2236-1 — dry-board-probe's bucketOf classified a verdict by substring-matching
 * the WHOLE stdout blob, and drain-block-check's closed-class arms echo the leaf's
 * AUTHOR-WRITTEN prose (note / blockedReason / stopNote) into that blob. So any
 * ledger note that merely CONTAINS a token bucketOf keys on re-classified its own
 * subject.
 *
 * This is F-2211-1 one layer further in. That finding stopped STDERR reaching the
 * classifier; this one stops the tool's own STDOUT BODY reaching it. The lesson is
 * the same and is why this guard exists: ASSERT THE OBSERVABLE, NOT THE BLOB.
 *
 * Not hypothetical. s2236 registered three legacy leaves to discharge Goal
 * Registration debt; their notes explain, accurately, that each done-move "read
 * UNKNOWN to dry-board-probe because no leaf existed" -- and that sentence flipped
 * its own subject from `closed` to `unknown` on the live board, same rc, the same
 * instant the leaf was written. Measured before the cure: 3 UNKNOWN -> 1 UNKNOWN
 * after registration, where the 1 survivor was purely the note's own wording.
 *
 * SEVERITY, MEASURED, NOT INFLATED: the permissive s1061 direction is UNREACHABLE
 * via this route. Measured s2236, one drain-arm probe per live status over leaves
 * that HAVE prose, detector validated against a known-leaky control FIRST
 * (F-2215-1): blocked/stopped/superseded ECHO prose; planned/queued/shipped/merged
 * DO NOT -- so prose can only move a subject already in a closed arm, never a real
 * drain into silence. The reachable harm is conservative, and it earns a cure for
 * F-1600-1's reason: it is a duty that can never be discharged. --strict exits 2
 * forever on a genuinely clean board, and every fire pays the file-probe cost again.
 */
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test, { after } from 'node:test';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUBJECT = path.join(HERE, 'dry-board-probe.mjs');
const fixtures = [];
after(() => fixtures.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

/** The real shapes drain-block-check renders, verdict first, body underneath. */
const CLOSED_WITH_UNKNOWN_IN_ITS_NOTE = [
  '  ⛔ CLOSED — DO NOT DRAIN: ap-orders-adapter-wiring.md [ap-orders-adapter-wiring]',
  '    refusal arm     : status="superseded" (terminal-closed)',
  '    note: Registered s2236 to discharge Goal Registration Law debt. The done-move',
  '          read UNKNOWN to dry-board-probe because no leaf existed; s2206 file-probed',
  '          it as a GHOST and status="merged" was verified for the successor.',
].join('\n');

const REAL_DRAIN_WITH_EVERY_TOKEN_IN_ITS_BODY = [
  '  ✅ CLEAR — some-live-slice.md [some-live-slice] status="queued"',
  '    note: an earlier attempt read ? UNKNOWN and a sibling was ⛔ CLOSED — DO NOT DRAIN',
  '          before status="merged" was recorded for the other half.',
].join('\n');

/** Run the subject as a fresh module, optionally with a hand-made defect. */
const load = async (variant) => {
  if (!variant) return import(SUBJECT + '?v=' + Math.random().toString(36).slice(2));
  const src = fs.readFileSync(SUBJECT, 'utf8');
  const mutated = variant(src);
  assert.notEqual(mutated, src, 'variant must actually edit the subject');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'f2236-'));
  fixtures.push(dir);
  const p = path.join(dir, 'variant.mjs');
  fs.writeFileSync(p, mutated);
  try { return await import(p); } finally { /* dir removed by the owner test below */ }
};

test('1. the finding: a closed verdict whose NOTE says UNKNOWN is still closed', async () => {
  const { bucketOf } = await load();
  assert.equal(bucketOf(CLOSED_WITH_UNKNOWN_IN_ITS_NOTE), 'closed');
});

test('2. the dangerous direction: a real drain survives every token in its body', async () => {
  const { bucketOf } = await load();
  assert.equal(bucketOf(REAL_DRAIN_WITH_EVERY_TOKEN_IN_ITS_BODY), 'drain',
    'a body full of verdict words must never silence a real drain');
});

test('3. every legacy single-line shape is unchanged', async () => {
  const { bucketOf } = await load();
  assert.equal(bucketOf('? UNKNOWN — no goal leaf matches "x.md".'), 'unknown');
  assert.equal(bucketOf('⛔ CLOSED — DO NOT DRAIN: x.md'), 'closed');
  assert.equal(bucketOf('⛔ BLOCKED — DO NOT DRAIN: x.md'), 'closed');
  assert.equal(bucketOf('✅ CLEAR — x.md [leaf] status="merged"'), 'merged');
  assert.equal(bucketOf('✅ CLEAR — x.md [leaf] status="queued"'), 'drain');
});

test('4. F-2211-1 still holds: an empty capture falls through to the LOUD bucket', async () => {
  const { bucketOf } = await load();
  assert.equal(bucketOf(''), 'drain');
  assert.equal(bucketOf('   \n\n  '), 'drain', 'whitespace-only is not a verdict');
  assert.equal(bucketOf(undefined), 'drain', 'and a missing capture is not a clearance');
});

test('5. leading blank lines do not hide the verdict', async () => {
  const { verdictLine, bucketOf } = await load();
  const padded = '\n\n   \n  ⛔ CLOSED — DO NOT DRAIN: x.md\n    note: UNKNOWN';
  assert.match(verdictLine(padded), /⛔ CLOSED/);
  assert.equal(bucketOf(padded), 'closed');
});

test('6. REVERSE CONTROL — restoring the pre-cure blob match reds arms 1 and 2', async () => {
  const { bucketOf } = await load((src) =>
    src.replace('const verdict = verdictLine(output);', 'const verdict = String(output ?? \'\');'));
  assert.equal(bucketOf(CLOSED_WITH_UNKNOWN_IN_ITS_NOTE), 'unknown', 'the defect, reproduced');
  assert.equal(bucketOf(REAL_DRAIN_WITH_EVERY_TOKEN_IN_ITS_BODY), 'unknown', 'and the drain vanishes');
});

test('7. REVERSE CONTROL — a naive split()[0] breaks arm 5, not arms 1-4', async () => {
  const { bucketOf } = await load((src) =>
    src.replace(/export function verdictLine\(output\) \{[\s\S]*?\n\}/,
      'export function verdictLine(output) {\n  return String(output ?? \'\').split(\'\\n\')[0];\n}'));
  // still right where the verdict really is first...
  assert.equal(bucketOf(CLOSED_WITH_UNKNOWN_IN_ITS_NOTE), 'closed');
  // ...and wrong the moment anything precedes it, which is what arm 5 asserts.
  assert.equal(bucketOf('\n  ⛔ CLOSED — DO NOT DRAIN: x.md\n    note: UNKNOWN'), 'drain',
    'the naive cure silently re-buckets a closed subject as a DRAIN');
});

test('8. REVERSE CONTROL — dropping the UNKNOWN-first order reds arm 3', async () => {
  const { bucketOf } = await load((src) =>
    src.replace("  if (/UNKNOWN/.test(verdict)) return 'unknown';\n", ''));
  assert.equal(bucketOf('? UNKNOWN — no goal leaf matches "x.md".'), 'drain',
    'UNKNOWN must be bucketed apart from a real drain — it is not a clearance');
});

test('9. the cure is exercised by the CLI, not just the unit (F-2209-1)', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'f2236-cli-'));
  fixtures.push(root);
  fs.mkdirSync(path.join(root, 'tasks', 'done'), { recursive: true });
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  // a terminal-prefixed file establishes the convention start; the bare-dated one is the subject
  fs.writeFileSync(path.join(root, 'tasks', 'done', 'drained-20260725-000000-seed.md'), 'x');
  fs.writeFileSync(path.join(root, 'tasks', 'done', '20260726-010101-subject.md'), 'x');
  // stub the classifier: a CLOSED verdict whose BODY says UNKNOWN
  fs.writeFileSync(path.join(root, 'scripts', 'drain-block-check.mjs'),
    'console.log("  ⛔ CLOSED — DO NOT DRAIN: subject.md");\n' +
    'console.log("    note: this once read UNKNOWN to dry-board-probe");\n' +
    'process.exit(1);\n');
  const r = spawnSync('node', [SUBJECT, '--strict'], { cwd: root, encoding: 'utf8' });
  const out = r.stdout ?? '';
  assert.ok(out.trim().length, 'the CLI arm must actually run');           // F-2215-1
  assert.match(out, /UNKNOWN[^\n]*: 0/, 'no subject may be parked in UNKNOWN by its own note');
  assert.equal(r.status, 0, '--strict must not report an undischargeable duty');
  fs.rmSync(root, { recursive: true, force: true });
});
