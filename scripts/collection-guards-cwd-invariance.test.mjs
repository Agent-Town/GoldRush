import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

function runGuard(file) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return spawnSync(process.execPath, ['--test', fileURLToPath(new URL(file, import.meta.url))], {
    cwd: os.tmpdir(),
    encoding: 'utf8',
    env,
  });
}

test('whole-suite collection guard is cwd-invariant', () => {
  const result = runGuard('./whole-suite-collection.test.mjs');
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test('town-spec collection guard is cwd-invariant', () => {
  const result = runGuard('./town-spec-collection.test.mjs');
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
