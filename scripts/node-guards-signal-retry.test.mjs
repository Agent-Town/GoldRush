/**
 * node-guards-signal-retry.test.mjs — the battery runner re-runs a guard ONCE when its node:test
 * child died by a SIGNAL, and only then (F-NCB-10, 2026-09-18).
 *
 * A signal death (SIGBUS/SIGSEGV from a native binding, a SIGKILL from outside) leaves node:test
 * with one file-level failure whose only text is 'test failed' — no assertion, no verdict. Three
 * manufactured fixtures pin the arm's edges: a file that kills itself on its first run and passes
 * on the second must turn the battery green with the retry named on stderr; a file that always
 * dies must stay red; a signal death beside an ordinary assertion failure must NOT be retried, so
 * the exit code a real red produces is untouched (the sibling guard in node-guards-concurrency
 * pins exact exit-code propagation for the non-signal path).
 */
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const HARNESS = fileURLToPath(new URL('./run-node-guards.mjs', import.meta.url));

function cleanEnv() {
  // NODE_TEST_CONTEXT marks a nested node:test child; left in place the runner's own `node --test` prints
  // "run() is being called recursively within a test file. skipping running files" and runs nothing.
  const { CLAUDE_CONFIG_DIR: _fire, NODE_TEST_CONTEXT: _nested, ...env } = process.env;
  return env;
}

function fixture(dir, name, body) {
  const file = join(dir, name);
  writeFileSync(file, `import test from 'node:test';\nimport { existsSync, writeFileSync } from 'node:fs';\n${body}\n`);
  return file;
}

function launch(files) {
  return spawnSync(process.execPath, [HARNESS, ...files], {
    timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8', env: cleanEnv(),
  });
}

test('a guard that dies by signal once and passes alone turns the battery green, and the retry is named', () => {
  const dir = mkdtempSync(join(tmpdir(), 'node-guards-signal-retry-'));
  try {
    const marker = join(dir, 'died-once');
    const dies = fixture(dir, 'dies-once.test.mjs', `test('dies once', () => {
  if (!existsSync(${JSON.stringify(marker)})) { writeFileSync(${JSON.stringify(marker)}, 'x'); process.kill(process.pid, 'SIGBUS'); }
});`);
    const ok = fixture(dir, 'passes.test.mjs', `test('passes', () => {});`);
    const run = launch([dies, ok]);
    const out = `${run.stdout}${run.stderr}`;
    assert.ok(existsSync(marker), `the fixture never ran its first arm:\n${out}`);
    assert.match(out, /SIGNAL-DEATH RETRY \(F-NCB-10\): .*dies-once\.test\.mjs died by SIGBUS/, out);
    assert.match(out, /SIGNAL-DEATH RETRY: passed alone/, out);
    assert.equal(run.status, 0, out);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a guard that dies by signal every time stays red', () => {
  const dir = mkdtempSync(join(tmpdir(), 'node-guards-signal-retry-'));
  try {
    const always = fixture(dir, 'always-dies.test.mjs', `test('always dies', () => { process.kill(process.pid, 'SIGBUS'); });`);
    const run = launch([always]);
    const out = `${run.stdout}${run.stderr}`;
    assert.match(out, /SIGNAL-DEATH RETRY \(F-NCB-10\)/, out);
    assert.match(out, /SIGNAL-DEATH RETRY: failed again/, out);
    assert.notEqual(run.status, 0, out);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a signal death beside an assertion failure is not retried and the run stays red', () => {
  const dir = mkdtempSync(join(tmpdir(), 'node-guards-signal-retry-'));
  try {
    const marker = join(dir, 'died-once');
    const dies = fixture(dir, 'dies-once.test.mjs', `test('dies once', () => {
  if (!existsSync(${JSON.stringify(marker)})) { writeFileSync(${JSON.stringify(marker)}, 'x'); process.kill(process.pid, 'SIGBUS'); }
});`);
    const red = fixture(dir, 'asserts.test.mjs', `test('a real red', () => { throw new Error('manufactured assertion failure'); });`);
    const run = launch([dies, red]);
    const out = `${run.stdout}${run.stderr}`;
    assert.doesNotMatch(out, /SIGNAL-DEATH RETRY/, out);
    assert.notEqual(run.status, 0, out);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
