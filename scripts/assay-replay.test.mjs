import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('rob\'s live The Claim reel reproduces through the browser replay door', () => {
  const run = spawnSync(process.execPath, [
    'scripts/assay-replay.mjs',
    'scripts/fixtures/assay/rob-the-claim-reel.json',
  ], { cwd: process.cwd(), encoding: 'utf8', timeout: 120_000 });
  assert.equal(run.status, 0, run.stderr);
  const lines = run.stdout.trim().split('\n');
  assert.equal(lines.length, 1, run.stdout);
  const result = JSON.parse(lines[0]);
  assert.deepEqual(result.outcome, { secured: true, waves: 10, gold: 280, timeAlive: 300 });
  assert.equal(result.eventLogHash, 'fnv1a32:f6390382');
  assert.equal(result.ticks, 9000);
  assert.ok(result.wallMs > 0 && result.wallMs < 300_000);
});
