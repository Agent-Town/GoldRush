#!/usr/bin/env node
/**
 * guard-source-snapshot-race-guard.test.mjs — F-2420-1 (measured and cured s2420).
 *
 * SUBJECT: guard-source-snapshot.mjs, whose cure is a `catch`. This repo has spent
 * twenty findings on catches that widen silently, so the arms below are weighted
 * toward the REVERSE CONTROLS: it is not enough that a vanished file is tolerated,
 * it must be tolerated for ENOENT AND NOTHING ELSE, and the subject must still be
 * proven to arrive.
 *
 * EVERY RED ARM IS PROVEN BY MANUFACTURING THE DEFECT on a scratch copy of the
 * cured module, never by admiring a green. Per s2226's duty the variant sweep is
 * also a REACHABILITY AUDIT: an arm that no manufactured defect reddens is not a
 * strong arm, it is decoration.
 *
 * THE TWO ERROR MECHANISMS ARE DETERMINISTIC, NOT TIMED — a race reproduced by
 * sleeping is a flake in the guard as well as the subject:
 *   ENOENT  — a DANGLING SYMLINK is listed by readdirSync and fails the copy with
 *             exactly the errno a mid-copy deletion produces (verified s2420).
 *   EISDIR  — a destination path already occupied by a directory (verified s2420).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUBJECT = path.join(HERE, 'guard-source-snapshot.mjs');
const { copyGuardSources } = await import(pathToFileURL(SUBJECT).href);

const scratch = [];
const tmp = (tag) => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), `snapshot-${tag}-`));
  scratch.push(d);
  return d;
};
process.on('exit', () => scratch.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

/** A source dir shaped like scripts/: real sources, a test file, an optional ghost. */
function sourceDir({ ghost = false } = {}) {
  const d = tmp('src');
  fs.writeFileSync(path.join(d, 'desk-birth-guard.mjs'), '// the subject\n');
  fs.writeFileSync(path.join(d, 'corpus-tree.mjs'), '// a dependency\n');
  fs.writeFileSync(path.join(d, 'something-guard.test.mjs'), '// a test, must NOT be copied\n');
  // A transient shadow the way the two sibling guards write one, but already gone
  // by copy time — which is what a dangling symlink models exactly.
  if (ghost) fs.symlinkSync(path.join(d, 'deleted-by-sibling.mjs'), path.join(d, 'tmp-s2262-shadow-9-9.mjs'));
  return d;
}

// ------------------------------------------------------------------ the cure
test('1 — a clean snapshot copies the sources and reports nothing vanished', () => {
  const dest = tmp('dest');
  const r = copyGuardSources(sourceDir(), dest, 'desk-birth-guard.mjs');
  assert.equal(r.copied, 2, 'both real sources must arrive');
  assert.deepEqual(r.vanished, [], 'nothing vanished on a quiet run');
  assert.ok(fs.existsSync(path.join(dest, 'desk-birth-guard.mjs')));
});

test('2 — THE DEFECT: an entry that vanishes mid-copy is skipped, not fatal', () => {
  const dest = tmp('dest');
  const r = copyGuardSources(sourceDir({ ghost: true }), dest, 'desk-birth-guard.mjs');
  assert.equal(r.copied, 2, 'the real sources still arrive');
  assert.deepEqual(r.vanished, ['tmp-s2262-shadow-9-9.mjs'],
    'the skipped entry must be NAMED, not silently dropped — a skip nobody can see is a swallow');
});

test('3 — .test.mjs files are excluded from the snapshot', () => {
  const dest = tmp('dest');
  copyGuardSources(sourceDir(), dest, 'desk-birth-guard.mjs');
  assert.ok(!fs.existsSync(path.join(dest, 'something-guard.test.mjs')),
    'copying test files in would register their tests inside the fixture');
});

// ------------------------------------------------------------ reverse controls
test('4 — REVERSE CONTROL: a NON-ENOENT copy failure is rethrown, never skipped', () => {
  const src = sourceDir();
  const dest = tmp('dest');
  fs.mkdirSync(path.join(dest, 'corpus-tree.mjs')); // occupy the destination path
  assert.throws(
    () => copyGuardSources(src, dest, 'desk-birth-guard.mjs'),
    (e) => e.code === 'EISDIR',
    'a real copy failure must stay LOUD — tolerating every errno is the swallow this cure exists to avoid',
  );
});

test('5 — REVERSE CONTROL: an absent SUBJECT refuses, and names what it skipped', () => {
  const src = sourceDir({ ghost: true });
  fs.rmSync(path.join(src, 'desk-birth-guard.mjs'));
  assert.throws(
    () => copyGuardSources(src, tmp('dest'), 'desk-birth-guard.mjs'),
    (e) => /SUBJECT "desk-birth-guard\.mjs" never reached/.test(e.message)
      && /tmp-s2262-shadow-9-9\.mjs/.test(e.message),
    'a fixture whose subject never arrived would test nothing, and must say which skips it made',
  );
});

test('6 — REVERSE CONTROL: calling it with no required subject refuses', () => {
  assert.throws(
    () => copyGuardSources(sourceDir(), tmp('dest')),
    /a required subject basename must be named/,
    'defaulting the subject would let a caller opt out of the only check that proves the copy worked',
  );
});
