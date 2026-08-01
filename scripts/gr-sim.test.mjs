import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ORDERS = [
  [{ verb: 'HARVEST', seam: 'gold-seam-1' }],
  [{ verb: 'HARVEST', seam: 'gold-seam-2' }],
  [{ verb: 'BUILD', what: 'palisade', where: { x: 0, z: 10 }, when: { goldGte: 10 } }],
  [],
  [],
].map(JSON.stringify).join('\n') + '\n';

test('gr-sim replays the same contract, seed, and orders byte-for-byte', () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const run = () => spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'e1-dry-gulch', '--seed', 'bench-001'],
    { cwd: root, encoding: 'utf8', input: ORDERS, timeout: 30_000 },
  );
  const first = run();
  const second = run();
  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(second.stdout, first.stdout);

  const lines = first.stdout.trim().split('\n').map((line) => JSON.parse(line));
  assert.equal(lines[0].schema, 'goldrush.view.v1');
  assert.deepEqual(Object.keys(lines.at(-1)), ['secured', 'waves', 'timeMs', 'gold', 'kills', 'calls', 'eventLogHash']);
  assert.equal(lines.at(-1).calls, 5);
  assert.ok(lines.some((line) => line.schema === 'goldrush.view.v1' && line.now.works.byKind.palisade === 1));
  assert.match(first.stderr, /gr-sim speed: \d+\.\d{2} waves\/s/);

  const unsupported = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'e5-deepwater-claim', '--policy=idle'],
    { cwd: root, encoding: 'utf8', timeout: 30_000 },
  );
  assert.notEqual(unsupported.status, 0);
  assert.match(unsupported.stderr, /AP-07 supports only e1-dry-gulch, the-claim, e1-night-shift/);
});

test('gr-sim deterministically runs the Claim objective', () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const run = () => spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', 'the-claim', '--seed', 'e1-the-claim-01', '--policy=idle'],
    { cwd: root, encoding: 'utf8', timeout: 30_000 },
  );
  const first = run();
  const second = run();
  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(second.stdout, first.stdout);
  assert.deepEqual(
    Object.keys(JSON.parse(first.stdout.trim().split('\n').at(-1))),
    ['secured', 'waves', 'timeMs', 'gold', 'kills', 'calls', 'eventLogHash'],
  );
});

test('gr-sim places Night Shift fixtures from the contract', () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const contracts = JSON.parse(readFileSync(new URL('../assets/contracts/epoch-1-frontier/contracts.json', import.meta.url), 'utf8'));
  const contract = contracts.contracts.find(({ id }) => id === 'e1-night-shift');
  const run = spawnSync(
    process.execPath,
    ['scripts/gr-sim.mjs', '--contract', contract.id, '--seed', 'e1-night-shift-01', '--policy=idle'],
    { cwd: root, encoding: 'utf8', timeout: 30_000 },
  );
  assert.equal(run.status, 0, run.stderr);
  const firstView = JSON.parse(run.stdout.split('\n', 1)[0]);
  assert.equal(firstView.now.works.byKind.lantern_post, contract.tileParams.prePlacedBuildables.length);
});
