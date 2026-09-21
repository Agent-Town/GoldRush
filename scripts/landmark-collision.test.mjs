import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({ root, server: { middlewareMode: true, watch: null }, appType: 'custom', logLevel: 'silent' });
after(() => vite.close());
const { landmarkBlockersFor } = await vite.ssrLoadModule('/src/world/LandmarkCollision.ts');

for (const [contract, parent, solidIds] of [
  ['e6-picnic', 'glow-mesa', ['mesa-civilian-shade']],
  ['e7-dead-band', 'relay-valley', ['dead-band-yard-null-post', 'west-old-tool-cache', 'east-old-tool-cache']],
  ['e7-relay-rush', 'relay-valley', ['rush-start-horn']],
  ['e8-far-side', 'mare-claim', ['probe-recovery-cradle', 'west-comms-shadow-marker', 'east-suit-cache-rack', 'far-horizon-listening-post']],
]) {
  test(`${contract} retains the parent blockers and appends its own registered solids`, () => {
    const ownMap = contract.replace(/^e\d+-/, '');
    const own = landmarkBlockersFor(ownMap);
    assert.deepEqual(own.map(({ id }) => id), solidIds.map(id => `${ownMap}:${id}`));
    const blockers = landmarkBlockersFor(contract);
    assert.deepEqual(blockers, [...landmarkBlockersFor(parent), ...own]);
    assert.equal(new Set(blockers.map(({ id }) => id)).size, blockers.length);
  });
}

test('alias-only maps retain exactly their parent blockers', () => {
  for (const [contract, parent] of [['e5-stillwater', 'deepwater-claim'], ['e5-flotilla', 'deepwater-claim'], ['e8-eclipse', 'mare-claim']]) {
    assert.deepEqual(landmarkBlockersFor(contract), landmarkBlockersFor(parent));
  }
});

test('plain maps retain their footprints without duplication', () => {
  // Frozen pre-union output: positions, rotated extents, scale and ordering are unchanged.
  const relayValley = [
    {
      "id": "relay-valley:west-ridge-dish-cluster",
      "x": -56,
      "z": 30,
      "halfX": 2.320815623365354,
      "halfZ": 1.6307534078847432
    },
    {
      "id": "relay-valley:east-ridge-dish-cluster",
      "x": 56,
      "z": 30,
      "halfX": 2.308801931149333,
      "halfZ": 1.5933860377503082
    },
    {
      "id": "relay-valley:dead-gap-charting-station",
      "x": 0,
      "z": 18,
      "halfX": 2.2912200000000005,
      "halfZ": 1.31328
    },
    {
      "id": "relay-valley:valley-cable-drum-yard",
      "x": -44,
      "z": -26,
      "halfX": 2.6942953933669846,
      "halfZ": 1.9699649514722366
    },
    {
      "id": "relay-valley:drone-recovery-beacon",
      "x": 44,
      "z": -26,
      "halfX": 3.21408,
      "halfZ": 3.21408
    }
  ];
  assert.deepEqual(landmarkBlockersFor('e7-relay-valley'), relayValley);
  assert.deepEqual(landmarkBlockersFor('relay-valley'), relayValley);
  assert.deepEqual(landmarkBlockersFor('unknown-map'), []);
  const post = landmarkBlockersFor('dead-band').find(({ id }) => id === 'dead-band:dead-band-yard-null-post');
  assert.deepEqual(post, { id: 'dead-band:dead-band-yard-null-post', x: 0, z: -40, halfX: 0.864, halfZ: 0.864 });
});
