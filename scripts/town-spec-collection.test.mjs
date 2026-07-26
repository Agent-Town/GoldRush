import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('town specs collect without loading Vite-only modules', () => {
  const result = spawnSync('npx', [
    'playwright',
    'test',
    '--list',
    'e2e/cast-motion-wiring.spec.ts',
    'e2e/ts-01-plaza-ground.spec.ts',
    'e2e/town-t5-townsfolk.spec.ts',
    'e2e/ts-04-living-pass.spec.ts',
  ], { encoding: 'utf8' });

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Total: [1-9]\d* tests/);
  assert.doesNotMatch(result.stderr, /glob is not a function/);
});
