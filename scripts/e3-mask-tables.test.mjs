import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const contracts = JSON.parse(await readFile('assets/contracts/epoch-3-voltage/contracts.json', 'utf8')).contracts;

async function table(id) {
  return JSON.parse(await readFile(`assets/contracts/epoch-3-voltage/mask-tables/${id}.json`, 'utf8'));
}

function contract(id) {
  return contracts.find((entry) => entry.id === id);
}

function inBounds(mask, x, z, radius = 0) {
  const width = mask.dimensions?.width ?? mask.size;
  const height = mask.dimensions?.height ?? mask.size;
  assert.ok(x - radius >= -width / 2 && x + radius <= width / 2, `${mask.tileId}: x ${x} +/- ${radius}`);
  assert.ok(z - radius >= -height / 2 && z + radius <= height / 2, `${mask.tileId}: z ${z} +/- ${radius}`);
}

test('published E3 mask tables exactly track authored contract data', async () => {
  const canyon = contract('e3-canyon-works');
  const moth = contract('e3-moth-season');
  const canyonTable = await table(canyon.id);
  const mothTable = await table(moth.id);

  assert.deepEqual(Object.keys(canyonTable), ['maskTruth', 'waterAgreement']);
  assert.deepEqual(Object.keys(mothTable), ['maskTruth', 'waterAgreement']);
  assert.equal(canyonTable.maskTruth.source, 'assets/contracts/epoch-3-voltage/contracts.json');
  assert.equal(mothTable.maskTruth.source, 'assets/contracts/epoch-3-voltage/contracts.json');

  const canyonKeys = [
    'tileId', 'size', 'dimensions', 'river', 'ford', 'fords', 'buildZones', 'stakeMarkers',
    'pylonSites', 'damChannel', 'rails', 'waterSources', 'harvestAnchors', 'prePlacedBuildables',
    'elevation', 'heightfield', 'water', 'lanes',
  ];
  for (const key of canyonKeys) assert.deepEqual(canyonTable.maskTruth[key], canyon.tileParams[key], key);
  assert.deepEqual(canyonTable.maskTruth.spawnGates, canyon.twist.enemyRoster.flatMap((enemy) => enemy.spawnGates ?? []));

  const mothKeys = ['tileId', 'size', 'river', 'ford', 'buildZones', 'waterSources', 'lanes'];
  for (const key of mothKeys) assert.deepEqual(mothTable.maskTruth[key], moth.tileParams[key], key);
  assert.deepEqual(mothTable.maskTruth.spawnGates, moth.twist.enemyRoster.flatMap((enemy) => enemy.spawnGates ?? []));
  assert.deepEqual(mothTable.maskTruth.dayNightCycle, moth.twist.dayNightCycle);
  assert.deepEqual(mothTable.maskTruth.mothSeason, moth.twist.mothSeason);
});

test('published E3 masks stay inside bounds and agree with authored water', async () => {
  for (const id of ['e3-canyon-works', 'e3-moth-season']) {
    const { maskTruth: mask, waterAgreement } = await table(id);
    for (const zone of mask.buildZones) {
      inBounds(mask, zone.minX, zone.minZ);
      inBounds(mask, zone.maxX, zone.maxZ);
    }
    for (const point of [
      ...(mask.stakeMarkers ?? []), ...(mask.pylonSites ?? []), ...(mask.harvestAnchors ?? []),
      ...(mask.prePlacedBuildables ?? []), ...(mask.spawnGates ?? []),
      ...(mask.rails ?? []).flatMap((rail) => rail.points),
    ]) inBounds(mask, point.x, point.z, point.radius ?? 0);

    if (!mask.river) {
      assert.deepEqual(waterAgreement, { river: false, waterSources: [] });
      continue;
    }
    assert.deepEqual(waterAgreement.shallowsEnd, { minZ: mask.damChannel.minZ, maxZ: mask.damChannel.maxZ });
    assert.equal(waterAgreement.factoryVisualHalfWidth, mask.water.visualHalfWidth);
    assert.equal(waterAgreement.placeableBankStartsBeyondAbsZ, mask.water.visualHalfWidth);
    assert.ok(waterAgreement.deepBand.minZ >= waterAgreement.shallowsEnd.minZ);
    assert.ok(waterAgreement.deepBand.maxZ <= waterAgreement.shallowsEnd.maxZ);
  }
});
