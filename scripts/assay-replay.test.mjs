import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('rob\'s v1 live reel is retained but reported as unverifiable legacy', () => {
  const fixturePath = 'scripts/fixtures/assay/rob-the-claim-reel.json';
  const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
  const run = spawnSync(process.execPath, [
    'scripts/assay-replay.mjs',
    fixturePath,
  ], { cwd: process.cwd(), encoding: 'utf8', timeout: 120_000 });
  assert.equal(run.status, 0, run.stderr);
  const lines = run.stdout.trim().split('\n');
  assert.equal(lines.length, 1, run.stdout);
  const result = JSON.parse(lines[0]);
  assert.deepEqual(result, { status: 'unverifiable-legacy' });
  assert.equal(fixture.eventLogHash, 'fnv1a32:f6390382');
});
