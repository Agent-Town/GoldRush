/**
 * F-2240-1 — dry-board-probe classified its SIBLING'S REFUSAL as `closed`.
 *
 * drain-block-check carries the convention this whole family carries: 2 = "could
 * not answer", 1 = "answered, and the answer refuses". Its refusal banner leads
 * with ⛔, and `VERDICT_MARKER` matches ⛔ — so a refusal sailed through
 * `classifiableCapture`'s crash filter, was classified like any ordinary verdict,
 * and handed `bucketOf` the string "⛔ CANNOT VERIFY", which buckets `closed`:
 * DO NOT DRAIN, nothing owed. The refusal that exists precisely to stop a fire
 * acting on a board it could not read was converted into the strongest clearance
 * this tool can print.
 *
 * MEASURED s2240, ground truth = ONE REAL DRAIN, the sibling stubbed at its real
 * exit code with drain-block-check.mjs:426-439 reproduced verbatim:
 *   sibling healthy                  -> drains=1 closed=0 -> "⛔ NOT DRY"       rc=1
 *   sibling REFUSES        (rc=2)    -> drains=0 closed=1 -> "✅ DRY ... earned" rc=0
 *   REVERSE CONTROL, genuinely
 *   CLOSED                 (rc=1)    -> drains=0 closed=1 -> "✅ DRY ... earned" rc=0
 * The defect arm and a genuinely-closed board were BYTE-IDENTICAL on stdout, on
 * the bucket counts AND on rc in BOTH modes — the s1061 banner, permissive
 * direction, in the tool §2F names as the first command of every fire.
 *
 * SEVERITY, MEASURED AND NOT INFLATED: LATENT in the prescribed invocation. At
 * the repo root both tools resolve tree=main and the refusal never fires; the
 * live board classified 43/43 with real verdicts and 0 crashes on the day this
 * was written, so every DRY this streak declared was TRUE — verified, not
 * assumed. What earns a cure is that the two tools do not share a git call: this
 * consumer makes ONE tree probe and then spawns the sibling once PER SUBJECT, so
 * a transient git failure in any single child (F-2212-1's documented load
 * trigger) silently converts that subject to `closed` while every other subject
 * answers normally — and if that subject was the board's only real drain, the
 * banner reads "the word is earned".
 *
 * The lesson is this family's own, one seam further out: F-2211-1 stopped STDERR
 * reaching the classifier and F-2236-1 stopped the sibling's own STDOUT BODY
 * reaching it. Both asked what TEXT may be classified. This asks a different
 * question — IS THIS TEXT A VERDICT AT ALL? A refusal is not a verdict, and a
 * consumer that cannot say so has no way to fail safe.
 */
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUBJECT = path.join(HERE, 'dry-board-probe.mjs');

/** drain-block-check.mjs:426-439, the corpusTree refusal, as it really renders. */
const REFUSAL = [
  '',
  '  ⛔ CANNOT VERIFY — DO NOT DRAIN, DO NOT QUEUE off this run',
  '    corpus tree     : UNVERIFIABLE — git could not answer',
  '    cwd             : /somewhere',
  '    Re-run from the repo root. Do NOT re-run elsewhere until it goes green.',
  '',
].join('\n');

/** drain-block-check.mjs:630, a GENUINE closure. The reverse control. */
const GENUINE_CLOSED = [
  '',
  '  ⛔ CLOSED — DO NOT DRAIN: fix-e2-railcar-arsenal-floor.md [e2-railcar-arsenal-floor]',
  '    refusal arm     : status="superseded" (terminal-closed)',
].join('\n');

/** drain-block-check.mjs:700 for a non-merged leaf — i.e. A REAL DRAIN. */
const REAL_DRAIN = '  ✅ CLEAR — subject.md [subject] status="queued"';

const fresh = () => import(SUBJECT + '?v=' + Math.random().toString(36).slice(2));

/** A board holding exactly one bare-dated subject, with the sibling stubbed. */
function board(stub) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'f2240-'));
  fs.mkdirSync(path.join(root, 'tasks', 'done'), { recursive: true });
  fs.mkdirSync(path.join(root, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tasks', 'done', 'drained-20260725-000000-seed.md'), 'x');
  fs.writeFileSync(path.join(root, 'tasks', 'done', '20260726-010101-subject.md'), 'x');
  fs.writeFileSync(path.join(root, 'scripts', 'drain-block-check.mjs'), stub);
  return root;
}
const stubFor = (text, code) =>
  `process.stdout.write(${JSON.stringify(text + '\n')});\nprocess.exit(${code});\n`;

/** Run the real CLI against a fixture root, returning BOTH observables (F-2210-1). */
function cli(stub, mode = []) {
  const root = board(stub);
  try {
    const r = spawnSync('node', [SUBJECT, ...mode], { cwd: root, encoding: 'utf8' });
    const out = r.stdout ?? '';
    assert.ok(/REAL DRAINS/.test(out), 'the CLI arm must reach the classify branch'); // s2227
    return { out, rc: r.status };
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('1. THE FINDING: a sibling refusal is not a verdict, and never `closed`', async () => {
  const { classifiableCapture, bucketOf } = await fresh();
  const cap = { failed: true, status: 2, stdout: REFUSAL, stderr: '' };
  const got = classifiableCapture(cap);
  assert.equal(got.refused, true, 'rc=2 + CANNOT VERIFY is a refusal');
  assert.notEqual(bucketOf(got.text), 'closed', 'a refusal must never read as closed');
});

test('2. it falls to the LOUD bucket BY CONSTRUCTION, not via the banner (F-2211-1)', async () => {
  const { classifiableCapture, bucketOf } = await fresh();
  const got = classifiableCapture({ failed: true, status: 2, stdout: REFUSAL, stderr: '' });
  assert.equal(got.text, '', 'the refusal text must not be handed to the classifier');
  assert.equal(bucketOf(got.text), 'drain', 'empty text is the loud bucket');
});

test('3. REVERSE CONTROL — a GENUINE closure (rc=1) is still `closed`', async () => {
  const { classifiableCapture, bucketOf } = await fresh();
  const got = classifiableCapture({ failed: true, status: 1, stdout: GENUINE_CLOSED, stderr: '' });
  assert.ok(!got.refused, 'rc=1 is "answered, and the answer refuses" — a verdict');
  assert.equal(bucketOf(got.text), 'closed');
});

test('4. REVERSE CONTROL — rc=2 with no banner is a CRASH, not a refusal', async () => {
  const { classifiableCapture } = await fresh();
  const got = classifiableCapture({ failed: true, status: 2, stdout: '', stderr: 'TypeError: boom' });
  assert.ok(!got.refused, 'a usage error / crash must not be laundered into a refusal');
  assert.equal(got.crashed, true);
});

test('5. a healthy CLEAR verdict on a non-merged leaf is still a REAL DRAIN', async () => {
  const { classifiableCapture, bucketOf } = await fresh();
  const got = classifiableCapture({ failed: false, status: 0, stdout: REAL_DRAIN, stderr: '' });
  assert.ok(!got.refused);
  assert.equal(bucketOf(got.text), 'drain');
});

test('6. exitCodeFor: "could not answer" (2) OUTRANKS "answered" (1)', async () => {
  const { exitCodeFor } = await fresh();
  const withDrain = { merged: [], closed: [], unknown: [], drain: ['x'] };
  assert.equal(exitCodeFor(withDrain, true, 'read', 1), 2, 'a refusal outranks a drain');
  assert.equal(exitCodeFor(withDrain, true, 'read', 0), 1, 'without refusals, a drain is 1');
  assert.equal(exitCodeFor(withDrain, false, 'read', 1), 0, 'advisory stays advisory');
});

test('7. CLI — the refusal is NAMED and the banner refuses (F-2209-1 + F-2210-1)', () => {
  const { out, rc } = cli(stubFor(REFUSAL, 2), ['--strict']);
  assert.match(out, /SIBLING REFUSED/, 'the refused subject must be named, not merely counted');
  // Scope the name assertion to the REFUSAL SECTION. Asserting it appears
  // anywhere in stdout is vacuous: refusals are also counted as drains, so the
  // filename shows up in the drain listing too and a count-only cure passes.
  // s2222's rule — ASSERT THE OBSERVABLE, NOT THE BLOB — measured here, not
  // predicted: my first draft made exactly that mistake and scored a false green.
  const section = out.slice(out.indexOf('SIBLING REFUSED')).split('\n\n')[0];
  assert.match(section, /20260726-010101-subject\.md/, 'named IN the refusal section');
  assert.doesNotMatch(out, /The word is earned/, 'a board we could not read is never earned-DRY');
  assert.equal(rc, 2, '--strict must say "could not answer", not 0 and not 1');
});

test('8. CLI advisory — the verdict travels on stdout, where §2F reads it', () => {
  const { out, rc } = cli(stubFor(REFUSAL, 2));
  assert.match(out, /CANNOT VERIFY — drain-block-check REFUSED/);
  assert.doesNotMatch(out, /The word is earned/);
  assert.equal(rc, 0, 'advisory stays advisory by design');
});

test('9. CLI REVERSE CONTROL — a genuinely closed board is STILL earned-DRY', () => {
  // The over-general cure (key on ⛔ alone) reds here and nowhere else: it would
  // convert all 8 of the live board's genuinely-closed subjects into refusals.
  const { out, rc } = cli(stubFor(GENUINE_CLOSED, 1));
  assert.match(out, /The word is earned/, 'a real closure must still earn the word');
  assert.doesNotMatch(out, /SIBLING REFUSED/);
  assert.equal(rc, 0);
});

test('10. CLI CONTROL — a healthy sibling still reports the real drain', () => {
  const { out, rc } = cli(stubFor(REAL_DRAIN, 0), ['--strict']);
  assert.match(out, /NOT DRY/);
  assert.doesNotMatch(out, /SIBLING REFUSED/);
  assert.equal(rc, 1, 'a drain the sibling DID verify is still rc=1, not 2');
});
