import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
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
  assert.match(unsupported.stderr, /currently supports only e1-dry-gulch/);
});
