// Guard for scripts/gate-battery.mjs — the permanent gate-battery driver (F-1255-3, s1275).
//
// WHY THIS FILE EXISTS. The defect it guards is ONE CHARACTER of difference: an unguarded
// `writeFileSync(out, ...)` truncates the transcript on every invocation, so a multi-battery
// drain keeps only its last arm; the `existsSync(out)` guard makes it append-only. That
// difference is invisible in a passing run — the driver looks identical, exits 0, and prints
// the same tail either way. It only shows up as MISSING EVIDENCE, later, in a review nobody
// can now reconstruct. s1254 shipped the truncating version, s1255 fixed it in its own copy
// and asked for it to be folded somewhere permanent, and `tmp-s1146-gate.mjs:51` shows the
// same bug independently re-minted at a fixed path (F-1275-1). Prose could not stop the
// second instance; this test can stop the third.
//
// It asserts BEHAVIOUR by running the real driver in a temp dir — not by grepping the source
// for `existsSync`, which would pass for a rewrite that kept the string and lost the property.
//
// Verdicts come from exit codes and from the transcript's CONTENT, never from parsing the
// driver's stdout: spawnSync can silently truncate stdout under load, and this whole file is
// about not trusting a possibly-truncated stream.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

import { withSerialWorkers } from './gate-battery.mjs';

const DRIVER = fileURLToPath(new URL('./gate-battery.mjs', import.meta.url));

function runDriver(transcript, jobs, label) {
  const args = [DRIVER, '--transcript', transcript];
  if (label) args.push('--label', label);
  args.push(JSON.stringify(jobs));
  return spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 120_000 });
}

function withTmp(fn) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'gate-battery-guard-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// THE F-1255-3 PROPERTY. This is the assertion the whole file exists for.
test('a second battery APPENDS — it never destroys the first arm evidence', () => {
  withTmp((dir) => {
    const transcript = path.join(dir, 'transcript.txt');

    const first = runDriver(transcript, [['arm-one', process.execPath, '-e', "console.log('FIRST-ARM-MARKER')"]]);
    assert.equal(first.status, 0, `first battery should pass: ${first.stderr}`);
    assert.match(readFileSync(transcript, 'utf8'), /FIRST-ARM-MARKER/, 'first arm never reached the transcript');

    const second = runDriver(transcript, [['arm-two', process.execPath, '-e', "console.log('SECOND-ARM-MARKER')"]]);
    assert.equal(second.status, 0, `second battery should pass: ${second.stderr}`);

    const text = readFileSync(transcript, 'utf8');
    assert.match(
      text,
      /FIRST-ARM-MARKER/,
      'F-1255-3 REGRESSION: the second battery DESTROYED the first arm. The transcript must be ' +
        'opened append-only (create-if-absent), never with a bare truncating writeFileSync — ' +
        'otherwise a multi-battery drain keeps only its last arm as evidence.',
    );
    assert.match(text, /SECOND-ARM-MARKER/, 'second arm never reached the transcript');

    // Each battery must be separable in the record, or "append" just makes one unreadable blob.
    assert.equal((text.match(/######## BATTERY /g) || []).length, 2, 'each battery needs its own stamp');
  });
});

// scripts/fire.md §3.1 — a correctness requirement in the fire shell, not an optimisation.
test('playwright jobs get --workers=1 injected', () => {
  assert.deepEqual(
    withSerialWorkers('npx', ['playwright', 'test', 'e2e/foo.spec.ts']),
    ['playwright', 'test', 'e2e/foo.spec.ts', '--workers=1'],
    'F-1270-1 REGRESSION: a playwright job ran without --workers=1. In the fire shell the ' +
      'per-job CPU ceiling (F-1269-1) starves each chromium at the default 6 workers and ' +
      'manufactures drift reds (17/18 vs 0/18, s1270).',
  );
});

test('an explicit --workers is respected, so a deliberate parallelism control is not overridden', () => {
  assert.deepEqual(
    withSerialWorkers('npx', ['playwright', 'test', '--workers=6']),
    ['playwright', 'test', '--workers=6'],
    'the injection must be idempotent — a control arm measuring parallelism must survive it',
  );
});

test('non-playwright jobs are left exactly as given', () => {
  assert.deepEqual(withSerialWorkers('npx', ['tsc', '--noEmit']), ['tsc', '--noEmit']);
});

// A driver that reports green for a failed gate is worse than no driver.
test('a failing job produces a non-zero overall verdict', () => {
  withTmp((dir) => {
    const transcript = path.join(dir, 'transcript.txt');
    const r = runDriver(transcript, [
      ['ok', process.execPath, '-e', 'process.exit(0)'],
      ['bad', process.execPath, '-e', 'process.exit(3)'],
    ]);
    assert.equal(r.status, 1, 'a failed job must make the battery exit non-zero');
    assert.match(readFileSync(transcript, 'utf8'), /rc=3/, 'the failing arm rc must be in the record');
  });
});

// A command that does not exist must not read as success — the s1254-lineage driver used
// r.status directly, which is null on a spawn error and would compare != 0 only by luck.
test('a command that cannot spawn is recorded as a failure, not a pass', () => {
  withTmp((dir) => {
    const transcript = path.join(dir, 'transcript.txt');
    const r = runDriver(transcript, [['missing', 'gr-no-such-binary-xyz', '--version']]);
    assert.equal(r.status, 1, 'ENOENT must not read as rc=0');
    assert.match(readFileSync(transcript, 'utf8'), /SPAWN-ERROR/, 'the spawn failure must be in the record');
  });
});

// Misuse must never exit 0: a driver that measured nothing and returned success is exactly
// the vacuous-green failure mode the repo has now hit five times on other guards.
test('misuse exits 2 rather than reporting a vacuous green', () => {
  const noArgs = spawnSync(process.execPath, [DRIVER], { encoding: 'utf8', timeout: 30_000 });
  assert.equal(noArgs.status, 2, 'no jobs spec must exit 2');

  const badJson = spawnSync(process.execPath, [DRIVER, 'not-json'], { encoding: 'utf8', timeout: 30_000 });
  assert.equal(badJson.status, 2, 'unparseable jobs spec must exit 2');

  const empty = spawnSync(process.execPath, [DRIVER, '[]'], { encoding: 'utf8', timeout: 30_000 });
  assert.equal(empty.status, 2, 'an empty battery measured nothing and must not exit 0');
});
