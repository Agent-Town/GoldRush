import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('rob\'s live The Claim reel replays deterministically through the browser door', () => {
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
  assert.deepEqual(result.outcome, { secured: false, waves: 4, gold: 30, timeAlive: 141.3 });
  assert.equal(result.eventLogHash, 'fnv1a32:29454bf2');
  assert.equal(fixture.eventLogHash, 'fnv1a32:f6390382');
  assert.notEqual(result.eventLogHash, fixture.eventLogHash, 'F-ASSAY-1 remains open');
  assert.equal(result.ticks, 9000);
  assert.ok(result.wallMs > 0 && result.wallMs < 300_000);
});
