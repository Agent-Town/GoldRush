import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('whole suite collects without loading Vite-only modules', () => {
  const result = spawnSync('npx', ['playwright', 'test', '--list'], { encoding: 'utf8' });

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Total: [1-9]\d* tests/);
  assert.doesNotMatch(result.stderr, /needs an import attribute|glob is not a function/);
});
