import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

function run(args) {
  const child = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', timeout: 120_000 });
  assert.equal(child.status, 0, child.stderr);
  return JSON.parse(child.stdout.trim().split('\n').at(-1));
}

test('Stillwater carries one corsair at 8 seconds on a 32 second cycle without disabling scheduled waves', async () => {
  globalThis.location = new URL('http://stillwater.test/?debug&contract=e5-stillwater');
  globalThis.window = { location: globalThis.location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { createDeepwaterClaimTile, deepwaterStormCarriesCorsairs, deepwaterStormDisablesScheduledWaves } = await vite.ssrLoadModule('/src/world/DeepwaterClaimTile.ts');
    const contract = loadContract('e5-stillwater');
    assert.equal(contract.twist.weather.cycleSeconds, 32);
    assert.equal(deepwaterStormCarriesCorsairs(contract), true);
    assert.equal(deepwaterStormDisablesScheduledWaves(contract), false);
    const tile = createDeepwaterClaimTile(contract);
    assert.equal(tile.advance(7.999).corsairWaves.length, 0);
    const first = tile.advance(8).corsairWaves;
    assert.equal(first.length, 1);
    assert.equal(first[0].scheduledAt, 8);
    assert.equal(first[0].enemies.length, 1);
    assert.equal(tile.advance(39.999).corsairWaves.length, 1);
    assert.equal(tile.advance(40).corsairWaves.length, 2);
  } finally {
    await vite.close();
  }
});

test('ordinary Stillwater riders lose by wave 3 while the reference ride secures at wave 12', () => {
  // RE-PINNED 2026-09-07 (attended drain of rider-parity-grammar stage 3, F-RPG-17): the prover's two HOLD
  // orders became MOVE_HERO when HOLD retired under ADR-005; the ride still secures at wave 12 / 360 s on
  // both seeds with the same purse, only the event-log hashes moved (7661ca43 -> 879badb5, 3d3ea0fc -> 4ec49fdf);
  // the idle rows are byte-unchanged.
  const expected = {
    'e5-stillwater-01': { played: 'fnv1a32:879badb5', idle: 'fnv1a32:ba80f970', inProcessIdle: 'fnv1a32:0ec0ed52' },
    'e5-stillwater-02': { played: 'fnv1a32:4ec49fdf', idle: 'fnv1a32:7ab6a335', inProcessIdle: 'fnv1a32:b72d7bbc' },
  };
  for (const [seed, pins] of Object.entries(expected)) {
    const played = run(['artifacts/e5-stillwater/prover.mjs', '--plain', '--seed', seed, '--policy', 'bait', '--deck', 'turret,sentry_beacon,turret', '--harvest', 'on', '--quiet']);
    assert.deepEqual(
      { secured: played.secured, waves: played.waves, timeMs: played.timeMs, eventLogHash: played.eventLogHash },
      { secured: true, waves: 12, timeMs: 360_000, eventLogHash: pins.played },
    );
    const idle = run(['artifacts/e5-stillwater/prover.mjs', '--plain', '--seed', seed, '--idle', '--quiet']);
    assert.equal(idle.secured, false);
    assert.ok(idle.waves <= 3);
    assert.equal(idle.eventLogHash, pins.idle);
    const inProcessIdle = run(['artifacts/e5-stillwater/prover.mjs', '--seed', seed, '--idle', '--quiet']);
    assert.equal(inProcessIdle.secured, false);
    assert.ok(inProcessIdle.waves <= 3);
    assert.equal(inProcessIdle.eventLogHash, pins.inProcessIdle);
  }
  const hunt = run(['artifacts/e5-stillwater/prover.mjs', '--seed', 'e5-stillwater-01', '--policy', 'bait', '--deck', 'turret,sentry_beacon,turret', '--harvest', 'on', '--quiet']);
  assert.ok(hunt.noiseHunt.strikes > 0);
  assert.deepEqual(
    JSON.parse(readFileSync(`${ROOT}/assets/contracts/epoch-5-deepwater/contracts.json`)).contracts
      .find(({ id }) => id === 'e5-stillwater').tileParams.stillwater.noiseSources.map(({ id }) => id),
    ['air-pump', 'engine', 'harpoon-reload'],
  );
});

test('the other E5 idle pins stay byte-identical', () => {
  const pins = {
    'e5-deepwater-claim-01': 'fnv1a32:9c344f09',
    'e5-deepwater-claim-02': 'fnv1a32:dee7a8dc',
    'e5-regatta-01': 'fnv1a32:80b36bec',
    'e5-regatta-02': 'fnv1a32:3dfe7f19',
    'e5-flotilla-01': 'fnv1a32:68d87963',
    'e5-flotilla-02': 'fnv1a32:008f54ba',
  };
  for (const [seed, eventLogHash] of Object.entries(pins)) {
    const contract = seed.replace(/-0[12]$/, '');
    assert.equal(run(['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, '--policy=idle']).eventLogHash, eventLogHash);
  }
});
