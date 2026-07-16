import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const e3Contracts = JSON.parse(await readFile('assets/contracts/epoch-3-voltage/contracts.json', 'utf8')).contracts;
const e4Contracts = JSON.parse(await readFile('assets/contracts/epoch-4-motor/contracts.json', 'utf8')).contracts;
const e6Contracts = JSON.parse(await readFile('assets/contracts/epoch-6-atomic/contracts.json', 'utf8')).contracts;

async function table(id) {
  const era = id.startsWith('e6-') ? 'epoch-6-atomic' : id.startsWith('e4-') ? 'epoch-4-motor' : 'epoch-3-voltage';
  return JSON.parse(await readFile(`assets/contracts/${era}/mask-tables/${id}.json`, 'utf8'));
}

function contract(id) {
  return [...e3Contracts, ...e4Contracts, ...e6Contracts].find((entry) => entry.id === id);
}

function inBounds(mask, x, z, radius = 0) {
  const width = mask.dimensions?.width ?? mask.size;
  const height = mask.dimensions?.height ?? mask.size;
  assert.ok(x - radius >= -width / 2 && x + radius <= width / 2, `${mask.tileId}: x ${x} +/- ${radius}`);
  assert.ok(z - radius >= -height / 2 && z + radius <= height / 2, `${mask.tileId}: z ${z} +/- ${radius}`);
}

function assertBoundsAndWater(mask, waterAgreement) {
  for (const zone of mask.buildZones) {
    inBounds(mask, zone.minX, zone.minZ);
    inBounds(mask, zone.maxX, zone.maxZ);
  }
  for (const zone of mask.fixtureZones ?? []) {
    inBounds(mask, zone.minX, zone.minZ);
    inBounds(mask, zone.maxX, zone.maxZ);
  }
  for (const zone of [...(mask.elevationZones ?? []), ...(mask.decayFields ?? []), ...(mask.herdPaths ?? [])]) {
    inBounds(mask, zone.minX, zone.minZ);
    inBounds(mask, zone.maxX, zone.maxZ);
  }
  for (const point of [
    ...(mask.stakeMarkers ?? []), ...(mask.pylonSites ?? []), ...(mask.capacitorSites ?? []),
    ...(mask.harvestAnchors ?? []), ...(mask.prePlacedBuildables ?? []), ...(mask.spawnGates ?? []),
    ...(mask.rails ?? []).flatMap((rail) => rail.points), ...(mask.tarSeams ?? []),
    ...(mask.roadCorridors ?? []).flatMap((road) => [road.start, road.end]),
    ...(mask.ridgeGlow ? [mask.ridgeGlow] : []),
  ]) inBounds(mask, point.x, point.z, point.radius ?? 0);

  if (mask.orbitSpawn) inBounds(mask, mask.orbitSpawn.center.x, mask.orbitSpawn.center.z, mask.orbitSpawn.radius);
  if (mask.dryWash) {
    const { x, z, length, width, angle } = mask.dryWash;
    for (const along of [-length / 2, length / 2]) {
      for (const across of [-width / 2, width / 2]) {
        inBounds(mask, x + Math.cos(angle) * along - Math.sin(angle) * across,
          z + Math.sin(angle) * along + Math.cos(angle) * across);
      }
    }
  }

  if (!mask.river) {
    assert.deepEqual(waterAgreement, { river: false, waterSources: mask.waterSources });
    return;
  }
  assert.deepEqual(waterAgreement.shallowsEnd, { minZ: mask.damChannel.minZ, maxZ: mask.damChannel.maxZ });
  assert.equal(waterAgreement.factoryVisualHalfWidth, mask.water.visualHalfWidth);
  assert.equal(waterAgreement.placeableBankStartsBeyondAbsZ, mask.water.visualHalfWidth);
  assert.ok(waterAgreement.deepBand.minZ >= waterAgreement.shallowsEnd.minZ);
  assert.ok(waterAgreement.deepBand.maxZ <= waterAgreement.shallowsEnd.maxZ);
}

test('published mask tables exactly track authored contract data', async () => {
  const keys = {
    'e3-canyon-works': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'fords', 'buildZones', 'stakeMarkers',
      'pylonSites', 'damChannel', 'rails', 'waterSources', 'harvestAnchors', 'prePlacedBuildables',
      'elevation', 'heightfield', 'water', 'lanes',
    ],
    'e3-moth-season': ['tileId', 'size', 'river', 'ford', 'buildZones', 'waterSources', 'lanes'],
    'e3-blackout-ridge': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers', 'pylonSites',
      'capacitorSites', 'prePlacedBuildables', 'ridgeGlow', 'waterSources', 'harvestAnchors', 'heightfield', 'lanes',
    ],
    'e3-fairground': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers',
      'waterSources', 'heightfield', 'palette', 'scatter', 'lanes',
    ],
    'e6-glow-mesa': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers',
      'waterSources', 'harvestAnchors', 'heightfield', 'lanes',
    ],
  };

  for (const [id, directKeys] of Object.entries(keys)) {
    const authored = contract(id);
    const published = await table(id);
    assert.deepEqual(Object.keys(published), ['maskTruth', 'waterAgreement']);
    const source = id === 'e3-fairground'
      ? 'assets/contracts/epoch-3-voltage/contracts.json; src/entities/FerrisWheel.ts:43-44'
      : id === 'e6-glow-mesa'
        ? 'assets/contracts/epoch-6-atomic/contracts.json; specs/epoch-saga/e6-atomic-bundle.md §B'
        : 'assets/contracts/epoch-3-voltage/contracts.json';
    assert.equal(published.maskTruth.source, source);
    for (const key of directKeys) assert.deepEqual(published.maskTruth[key], authored.tileParams[key], `${id}.${key}`);
    const authoredSpawnGates = id === 'e6-glow-mesa'
      ? []
      : authored.twist.enemyRoster.flatMap((enemy) => enemy.spawnGates ?? []);
    assert.deepEqual(published.maskTruth.spawnGates, authoredSpawnGates);
  }

  const glowMesa = contract('e6-glow-mesa');
  const glowMesaMask = (await table(glowMesa.id)).maskTruth;
  assert.deepEqual(glowMesaMask.fixtureZones, glowMesa.tileParams.buildZones
    .filter((zone) => ['calculating-house-site', 'reactor-dome-site'].includes(zone.id))
    .map(({ id, minX, maxX, minZ, maxZ }) => ({ id, minX, maxX, minZ, maxZ })));
  assert.deepEqual(glowMesaMask.elevationZones, [
    { id: 'base-flat-h1', height: 1, minX: -52, maxX: 52, minZ: -54, maxZ: -10 },
    { id: 'mesa-top-h5', height: 5, minX: -30, maxX: 30, minZ: 0, maxZ: 40 },
  ]);
  assert.deepEqual(glowMesaMask.decayFields, [
    { id: 'decay-field-east', minX: 18, maxX: 34, minZ: -46, maxZ: -30 },
    { id: 'decay-field-southeast', minX: 32, maxX: 50, minZ: -28, maxZ: -12 },
  ]);
  assert.deepEqual(glowMesaMask.herdPaths, [
    { id: 'warehouse-herd-path', minX: -46, maxX: -28, minZ: 28, maxZ: 52 },
    { id: 'west-scarp-herd-path', minX: -52, maxX: -30, minZ: 4, maxZ: 28 },
    { id: 'east-scarp-herd-path', minX: 30, maxX: 52, minZ: 4, maxZ: 28 },
  ]);

  const moth = contract('e3-moth-season');
  const mothMask = (await table(moth.id)).maskTruth;
  assert.deepEqual(mothMask.dayNightCycle, moth.twist.dayNightCycle);
  assert.deepEqual(mothMask.mothSeason, moth.twist.mothSeason);
  const blackout = contract('e3-blackout-ridge');
  assert.deepEqual((await table(blackout.id)).maskTruth.dayNightCycle, blackout.twist.dayNightCycle);
  const fairground = contract('e3-fairground');
  const fairgroundMask = (await table(fairground.id)).maskTruth;
  assert.deepEqual(fairgroundMask.dayNightCycle, fairground.twist.dayNightCycle);
  assert.deepEqual(fairgroundMask.fixtureZones, [{ id: 'ferris-wheel', minX: -4.1, maxX: 4.1, minZ: 6.2, maxZ: 9.8 }]);
  assert.match(fairgroundMask.source, /src\/entities\/FerrisWheel\.ts:43-44/);
});

test('published Moth Season mask stays inside bounds and agrees with authored water', async () => {
  const { maskTruth, waterAgreement } = await table('e3-moth-season');
  assertBoundsAndWater(maskTruth, waterAgreement);
});

for (const id of ['e3-canyon-works', 'e3-blackout-ridge', 'e3-fairground', 'e4-dust-flats', 'e6-glow-mesa']) {
  test(`${id} mask stays inside bounds and agrees with authored water`, async () => {
    const { maskTruth, waterAgreement } = await table(id);
    assertBoundsAndWater(maskTruth, waterAgreement);
  });
}
