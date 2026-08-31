/**
 * law-pointer-surface-count-guard.test.mjs — F-2412-1.
 *
 * THE DEFECT: `law-pointer-guard.mjs` printed its headline as `SURFACES.length + 1`. The literal
 * stood for the goal ledger, which the file scans as a seventh corpus in a structurally different
 * arm (it walks JSON `blockedReason` fields, not markdown). The number was CORRECT and moved no
 * verdict — but it was TRANSCRIBED, which is precisely what that file's own SCAN_FAMILIES comment
 * forbids in its own words ("derive from the file, never transcribe -- a hardcoded description is
 * a defect awaiting the next edit"), and the corpus it stood for was named NOWHERE in the output.
 * Measured s2412: `goals.json` appeared 0 times in stdout, at --report verbosity too, and
 * contributed 0 pointers — so a reader comparing "surfaces : 7" against a CLOSED six-entry list
 * could not resolve the discrepancy and could not discover the seventh by reading harder.
 *
 * WHAT THIS ASSERTS, and why each arm exists rather than being decoration — every arm below was
 * proven by MANUFACTURING the defect on a scratch copy (the house standard: a passing guard never
 * executes its violation path, so its green is not evidence about its red):
 *
 *   1. the headline DECOMPOSES — a bare count is a boundary only its author sees (F-2196-1)
 *   2. the headline is SELF-CONSISTENT — total == law surfaces + named extras
 *   3. the extra corpus is NAMED — this is the whole finding
 *   4. the count is DERIVED — adding a member moves the printed number (catches a re-transcription)
 *   5. REVERSE CONTROL: the law-surface component is derived too, so growing LAW_SURFACES is not
 *      a red. A guard that hardcodes 6 would red the day someone lawfully adds a surface, and be
 *      excused into uselessness inside a week (F-1460-1, the `cross-engine` fate).
 *   6. REVERSE CONTROL, and the destructive direction: LAW_SURFACES must NOT contain the ledger.
 *      The tempting "simplification" — fold `tasks/goals.json` into the list and drop the +1 —
 *      keeps the headline reading 7 and silently feeds a JSON file to the MARKDOWN pointer loop.
 *   7. the declaration prints on the HAPPY PATH at rc=0 (F-2342-1's rule, and F-2210-1's: this
 *      tool's real interface is stdout, so asserting the exit code alone tests the half nobody
 *      reads).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

import { LAW_SURFACES } from './law-surfaces.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SUBJECT = path.join(HERE, 'law-pointer-guard.mjs');

/**
 * Run a script against the real repo root. --root exists precisely so a relocated copy stays correct.
 *
 * EVERY spawn is BOUNDED, and that is not decoration — it was paid for while building this guard.
 * s2412's first draft spawned unbounded; a run wedged, `spawnSync` waited forever, and killing the
 * parent orphaned the child to PPID 1 at 0% CPU, where it sat contending with the next attempt. A
 * hang is the ONE failure a battery leg must never have: a red names a subject and a hang names
 * nothing, stalls the fire that is running its mandated last act, and looks identical to slowness.
 * Bounded, the same event is a LOUD failure with the command in the message.
 */
function run(script, args = []) {
  const r = spawnSync('node', [script, '--root', ROOT, ...args],
    { encoding: 'utf8', maxBuffer: 64 << 20, timeout: 60_000, killSignal: 'SIGKILL' });
  assert.ok(!r.error, `spawn failed or timed out (${r.error && r.error.code}): node ${script}`);
  assert.ok(r.stdout.length > 200, `arm produced only ${r.stdout.length} B — it did not really run (F-2215-1)`);
  return r;
}

/**
 * The happy-path run, taken ONCE and shared. Four arms below ask different questions of the SAME
 * stdout, and spawning it four times bought nothing but four more chances to wedge.
 */
let happyPath;
const happy = () => (happyPath ??= run(SUBJECT));

/**
 * Write a variant of the subject to a scratch dir, asserting the edit MATCHED. A variant whose
 * edit silently matched nothing is a construction refusal wearing a green's clothes.
 */
function variantOf(from, to) {
  const src = fs.readFileSync(SUBJECT, 'utf8');
  assert.ok(src.includes(from), `variant precondition absent — cannot manufacture this defect: ${from.slice(0, 60)}`);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's2412-lpg-'));
  const dst = path.join(dir, 'variant.mjs');
  fs.writeFileSync(dst, src.replace(from, to));
  // The subject imports ./law-surfaces.mjs relatively, so the variant needs it beside itself.
  fs.copyFileSync(path.join(HERE, 'law-surfaces.mjs'), path.join(dir, 'law-surfaces.mjs'));
  return { dir, dst };
}

const headlineOf = (stdout) => stdout.split('\n').find((l) => l.includes('surfaces      :')) ?? '';

test('1. the surfaces headline decomposes rather than printing a bare count', () => {
  const line = headlineOf(happy().stdout);
  assert.match(line, /surfaces\s+: \d+\s+\(/, `headline does not decompose: ${line}`);
});

test('2. the headline is self-consistent: total == law surfaces + named extras', () => {
  const line = headlineOf(happy().stdout);
  const m = line.match(/surfaces\s+: (\d+)\s+\((\d+) law surface\(s\)(?:, no other corpus|\s\+\s(.+))\)/);
  assert.ok(m, `headline did not parse: ${line}`);
  const total = Number(m[1]);
  const law = Number(m[2]);
  const extras = m[3] ? m[3].split(', ').filter(Boolean) : [];
  assert.equal(law, LAW_SURFACES.length, 'law-surface component disagrees with the shared list');
  assert.equal(total, law + extras.length, `total ${total} != ${law} + ${extras.length} named extras`);
});

test('3. the extra scanned corpus is NAMED — the finding itself', () => {
  const out = happy().stdout;
  assert.match(headlineOf(out), /tasks\/goals\.json/, 'the goal ledger is counted but never named');
});

test('4. the count is DERIVED, not transcribed — adding a member moves the printed number', () => {
  const base = Number(headlineOf(happy().stdout).match(/surfaces\s+: (\d+)/)[1]);
  const { dst } = variantOf(
    'const SCANNED_SURFACES = [...SURFACES, GOAL_LEDGER];',
    "const SCANNED_SURFACES = [...SURFACES, GOAL_LEDGER, 'tasks/BACKLOG.md'];",
  );
  const line = headlineOf(run(dst).stdout);
  assert.equal(Number(line.match(/surfaces\s+: (\d+)/)[1]), base + 1, `count did not follow the list: ${line}`);
  assert.match(line, /tasks\/BACKLOG\.md/, 'the added corpus was counted but not named');
});

test('5. REVERSE CONTROL: growing LAW_SURFACES is lawful and must not red this guard', () => {
  const src = fs.readFileSync(path.join(HERE, 'law-surfaces.mjs'), 'utf8');
  const anchor = "  'CLAUDE.md',";
  assert.ok(src.includes(anchor), 'law-surfaces.mjs shape changed — re-derive this arm');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's2412-lpg-grow-'));
  fs.writeFileSync(path.join(dir, 'law-surfaces.mjs'), src.replace(anchor, `${anchor}\n  'TASK.md',`));
  fs.copyFileSync(SUBJECT, path.join(dir, 'variant.mjs'));
  const line = headlineOf(run(path.join(dir, 'variant.mjs')).stdout);
  const m = line.match(/surfaces\s+: (\d+)\s+\((\d+) law surface\(s\)/);
  assert.ok(m, `headline did not parse under a grown list: ${line}`);
  assert.equal(Number(m[2]), LAW_SURFACES.length + 1, 'the law-surface component is not derived');
  assert.equal(Number(m[1]), Number(m[2]) + 1, 'total did not follow the grown list');
});

test('6. REVERSE CONTROL: the goal ledger must NOT be folded into LAW_SURFACES', () => {
  assert.ok(
    !LAW_SURFACES.includes('tasks/goals.json'),
    'tasks/goals.json is in LAW_SURFACES — it would be fed to the MARKDOWN pointer loop, which is not what scans it',
  );
});

test('7. the declaration prints on the happy path, at an unchanged exit code', () => {
  const r = happy();
  assert.equal(r.status, 0, 'the advisory declaration must not move the exit code');
  assert.ok(headlineOf(r.stdout).length > 0, 'headline absent on a green run — a declaration that appears only on failure re-creates the ambiguity it removes (F-2208-1)');
});
