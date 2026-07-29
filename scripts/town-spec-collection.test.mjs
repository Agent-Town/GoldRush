import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

test('town specs collect without loading Vite-only modules', () => {
  const result = spawnSync('npx', [
    'playwright',
    'test',
    '--list',
    'e2e/cast-motion-wiring.spec.ts',
    'e2e/ts-01-plaza-ground.spec.ts',
    'e2e/town-t5-townsfolk.spec.ts',
    'e2e/ts-04-living-pass.spec.ts',
  ], {
    cwd: fileURLToPath(new URL('../', import.meta.url)),
    encoding: 'utf8',
  });
  const tail = (text) => text.split(/\r?\n/).slice(-20).join('\n').slice(-4000);

  assert.equal(result.status, 0, `child exit ${result.status}\nstderr:\n${tail(result.stderr)}\nstdout:\n${tail(result.stdout)}`);
  assert.match(result.stdout, /Total: [1-9]\d* tests/);
  assert.doesNotMatch(result.stderr, /glob is not a function/);
});
