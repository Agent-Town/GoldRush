import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const e3Contracts = JSON.parse(await readFile('assets/contracts/epoch-3-voltage/contracts.json', 'utf8')).contracts;
const e4Contracts = JSON.parse(await readFile('assets/contracts/epoch-4-motor/contracts.json', 'utf8')).contracts;

async function table(id) {
  const era = id.startsWith('e4-') ? 'epoch-4-motor' : 'epoch-3-voltage';
  return JSON.parse(await readFile(`assets/contracts/${era}/mask-tables/${id}.json`, 'utf8'));
}

function contract(id) {
  return [...e3Contracts, ...e4Contracts].find((entry) => entry.id === id);
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

test('published E3 mask tables exactly track authored contract data', async () => {
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
  };

  for (const [id, directKeys] of Object.entries(keys)) {
    const authored = contract(id);
    const published = await table(id);
    assert.deepEqual(Object.keys(published), ['maskTruth', 'waterAgreement']);
    assert.equal(published.maskTruth.source, 'assets/contracts/epoch-3-voltage/contracts.json');
    for (const key of directKeys) assert.deepEqual(published.maskTruth[key], authored.tileParams[key], `${id}.${key}`);
    assert.deepEqual(published.maskTruth.spawnGates, authored.twist.enemyRoster.flatMap((enemy) => enemy.spawnGates ?? []));
  }

  const moth = contract('e3-moth-season');
  const mothMask = (await table(moth.id)).maskTruth;
  assert.deepEqual(mothMask.dayNightCycle, moth.twist.dayNightCycle);
  assert.deepEqual(mothMask.mothSeason, moth.twist.mothSeason);
  const blackout = contract('e3-blackout-ridge');
  assert.deepEqual((await table(blackout.id)).maskTruth.dayNightCycle, blackout.twist.dayNightCycle);
});

test('published Moth Season mask stays inside bounds and agrees with authored water', async () => {
  const { maskTruth, waterAgreement } = await table('e3-moth-season');
  assertBoundsAndWater(maskTruth, waterAgreement);
});

for (const id of ['e3-canyon-works', 'e3-blackout-ridge', 'e4-dust-flats']) {
  test(`${id} mask stays inside bounds and agrees with authored water`, async () => {
    const { maskTruth, waterAgreement } = await table(id);
    assertBoundsAndWater(maskTruth, waterAgreement);
  });
}
