import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const e2Contracts = JSON.parse(await readFile('assets/contracts/epoch-2-steamworks/contracts.json', 'utf8')).contracts;
const e3Contracts = JSON.parse(await readFile('assets/contracts/epoch-3-voltage/contracts.json', 'utf8')).contracts;
const e4Contracts = JSON.parse(await readFile('assets/contracts/epoch-4-motor/contracts.json', 'utf8')).contracts;
const e5Contracts = JSON.parse(await readFile('assets/contracts/epoch-5-deepwater/contracts.json', 'utf8')).contracts;
const e6Contracts = JSON.parse(await readFile('assets/contracts/epoch-6-atomic/contracts.json', 'utf8')).contracts;
const e7Contracts = JSON.parse(await readFile('assets/contracts/epoch-7-signal/contracts.json', 'utf8')).contracts;
const e8Contracts = JSON.parse(await readFile('assets/contracts/epoch-8-orbital/contracts.json', 'utf8')).contracts;
const e9Contracts = JSON.parse(await readFile('assets/contracts/epoch-9-redfields/contracts.json', 'utf8')).contracts;
const e10Contracts = JSON.parse(await readFile('assets/contracts/epoch-10-deepsky/contracts.json', 'utf8')).contracts;

async function table(id) {
  const era = id.startsWith('e10-') ? 'epoch-10-deepsky' : id.startsWith('e9-') ? 'epoch-9-redfields' : id.startsWith('e8-') ? 'epoch-8-orbital' : id.startsWith('e7-') ? 'epoch-7-signal' : id.startsWith('e6-') ? 'epoch-6-atomic' : id.startsWith('e5-') ? 'epoch-5-deepwater' : id.startsWith('e4-') ? 'epoch-4-motor' : id.startsWith('e2-') ? 'epoch-2-steamworks' : 'epoch-3-voltage';
  return JSON.parse(await readFile(`assets/contracts/${era}/mask-tables/${id}.json`, 'utf8'));
}

function contract(id) {
  return [...e2Contracts, ...e3Contracts, ...e4Contracts, ...e5Contracts, ...e6Contracts, ...e7Contracts, ...e8Contracts, ...e9Contracts, ...e10Contracts].find((entry) => entry.id === id);
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
  for (const zone of [
    ...(mask.elevationZones ?? []), ...(mask.decayFields ?? []), ...(mask.herdPaths ?? []),
    ...(mask.ridgeBands ?? []), ...(mask.fogPockets ?? []),
    ...(mask.rimBands ?? []), ...(mask.mareFlat ? [mask.mareFlat] : []),
    ...(mask.lavaTubeMouth ? [mask.lavaTubeMouth] : []),
    ...(mask.quarryScarpBands ?? []), ...(mask.basinDepression ? [mask.basinDepression] : []),
    ...(mask.lavaVeinBands ?? []),
    ...(mask.deepwater?.waterTile.regions ?? []), ...(mask.raceCourse?.fastWaterZone ? [mask.raceCourse.fastWaterZone] : []),
    ...(mask.stillwater?.fogZone ? [mask.stillwater.fogZone] : []), ...(mask.stillwater?.quietZones ?? []),
    ...(mask.flotilla?.formationZone ? [mask.flotilla.formationZone] : []),
    ...(mask.showroomHouses ?? []), ...(mask.glowBridges ?? []), ...(mask.causeways ?? []),
    ...(mask.countdownGround ?? []), ...(mask.picnicBlankets ?? []),
    ...(mask.echoCanyonBands ?? []), ...(mask.broadcastMirrorZones ?? []), ...(mask.signalNullZones ?? []),
    ...(mask.interferenceFrontZones ?? []),
    ...(mask.permanentGreenWaypointZones ?? []), ...(mask.dustDevilCorridors ?? []),
    ...(mask.anchorSites ?? []), ...(mask.canalDecisionZones ?? []),
    ...(mask.trestleDeck ? [mask.trestleDeck] : []), ...(mask.restStops ?? []),
  ]) {
    inBounds(mask, zone.minX, zone.minZ);
    inBounds(mask, zone.maxX, zone.maxZ);
  }
  for (const point of [
    ...(mask.stakeMarkers ?? []), ...(mask.pylonSites ?? []), ...(mask.capacitorSites ?? []),
    ...(mask.harvestAnchors ?? []), ...(mask.prePlacedBuildables ?? []), ...(mask.spawnGates ?? []),
    ...(mask.rails ?? []).flatMap((rail) => rail.points), ...(mask.tarSeams ?? []),
    ...(mask.roadCorridors ?? []).flatMap((road) => [road.start, road.end]),
    ...(mask.lanes?.patrolRoutes ?? []).flatMap((route) => route.points),
    ...(mask.debrisArcLanes ?? []).flatMap((route) => route.points),
    ...(mask.canalRoute?.points ?? []), ...(mask.canalStageGates ?? []),
    ...(mask.dustDevilLanes ?? []).flatMap((route) => route.points),
    ...(mask.ridgeGlow ? [mask.ridgeGlow] : []),
    ...(mask.waterSources ?? []), ...(mask.deepwater?.claimBoat.anchors ?? []), ...(mask.deepwater?.wrecks ?? []),
    ...(mask.raceCourse?.beacons ?? []), ...(mask.stillwater?.noiseSources ?? []), ...(mask.flotilla?.hulls ?? []),
    ...(mask.catalogGoods ?? []), ...(mask.extractionRoute ?? []),
    ...(mask.civilianSites ?? []), ...(mask.sandwichSites ?? []),
    ...(mask.caravanRoute ?? []), ...(mask.inheritedCanalRoute?.points ?? []),
    ...(mask.coalSeams ?? []), ...(mask.convoyRoute ?? []), ...(mask.wildDerricks ?? []),
    ...(mask.outhouseGeyser ? [mask.outhouseGeyser] : []), ...(mask.salvageHulks ?? []),
    ...(mask.sleeper ? [mask.sleeper] : []), ...(mask.unmarkedWagon ? [mask.unmarkedWagon] : []),
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
  if (!mask.damChannel) {
    // Steamworks river masks: the sim band is the global RIVER_MIN/MAX_Z ±5 with
    // SHALLOWS_WIDTH 1.25 aprons (src/world/Terrain.ts:84-88); no dam channel exists.
    assert.equal(waterAgreement.factoryVisualHalfWidth, mask.water.visualHalfWidth);
    assert.equal(waterAgreement.shallowsEnd.minZ, -waterAgreement.shallowsEnd.maxZ);
    assert.equal(waterAgreement.placeableBankStartsBeyondAbsZ, waterAgreement.shallowsEnd.maxZ);
    assert.ok(waterAgreement.deepBand.minZ >= waterAgreement.shallowsEnd.minZ);
    assert.ok(waterAgreement.deepBand.maxZ <= waterAgreement.shallowsEnd.maxZ);
    for (const point of waterAgreement.sluiceSamples ?? []) inBounds(mask, point.x, point.z);
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
    'e2-trestle': [
      'tileId', 'size', 'river', 'ford', 'fords', 'buildZones', 'stakeMarkers', 'rails',
      'waterSources', 'harvestAnchors', 'elevation', 'heightfield', 'water', 'lanes',
    ],
    'e2-pressure-garden': [
      'tileId', 'size', 'river', 'ford', 'fords', 'buildZones', 'stakeMarkers', 'rails',
      'waterSources', 'harvestAnchors', 'elevation', 'heightfield', 'water', 'lanes',
    ],
    'e2-incline': [
      'tileId', 'size', 'river', 'ford', 'fords', 'buildZones', 'stakeMarkers', 'rails',
      'waterSources', 'harvestAnchors', 'elevation', 'heightfield', 'water', 'lanes',
    ],
    'e4-long-road': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers',
      'waterSources', 'harvestAnchors', 'roadCorridors', 'convoyRoute', 'restStops', 'lanes',
    ],
    'e4-gusher-county': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers',
      'waterSources', 'harvestAnchors', 'tarSeams', 'roadCorridors', 'wildDerricks', 'outhouseGeyser', 'lanes',
    ],
    'e4-boneyard': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers',
      'waterSources', 'harvestAnchors', 'roadCorridors', 'salvageHulks', 'sleeper', 'unmarkedWagon', 'lanes',
    ],
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
    'e5-regatta': [
      'tileId', 'size', 'dimensions', 'buildZones', 'stakeMarkers', 'waterSources',
      'harvestAnchors', 'water', 'deepwater', 'raceCourse', 'lanes',
    ],
    'e5-stillwater': [
      'tileId', 'size', 'dimensions', 'buildZones', 'stakeMarkers', 'waterSources',
      'harvestAnchors', 'water', 'deepwater', 'stillwater', 'lanes',
    ],
    'e5-flotilla': [
      'tileId', 'size', 'dimensions', 'buildZones', 'stakeMarkers', 'waterSources',
      'harvestAnchors', 'water', 'deepwater', 'flotilla', 'lanes',
    ],
    'e6-glow-mesa': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers',
      'waterSources', 'harvestAnchors', 'heightfield', 'lanes',
    ],
    'e6-showroom': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers',
      'waterSources', 'harvestAnchors', 'heightfield', 'lanes',
    ],
    'e6-half-life-hollow': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers',
      'waterSources', 'harvestAnchors', 'heightfield', 'lanes',
    ],
    'e6-picnic': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers',
      'waterSources', 'harvestAnchors', 'heightfield', 'lanes',
    ],
    'e7-relay-valley': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers',
      'waterSources', 'harvestAnchors', 'heightfield', 'lanes',
    ],
    'e7-echo-canyon': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers',
      'waterSources', 'harvestAnchors', 'heightfield', 'echoCanyonBands', 'broadcastMirrorZones', 'lanes',
    ],
    'e7-dead-band': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers',
      'waterSources', 'harvestAnchors', 'heightfield', 'signalNullZones', 'lanes',
    ],
    'e7-relay-rush': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers',
      'waterSources', 'harvestAnchors', 'heightfield', 'interferenceFrontZones', 'lanes',
    ],
    'e8-mare-claim': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers', 'rails',
      'waterSources', 'harvestAnchors', 'heightfield', 'gravity', 'atmosphere', 'lanes',
    ],
    'e9-dome-basin': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers', 'rails',
      'waterSources', 'harvestAnchors', 'heightfield', 'lanes',
    ],
    'e9-seed-run': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers',
      'waterSources', 'harvestAnchors', 'heightfield', 'lanes',
    ],
    'e9-devils-alley': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers',
      'waterSources', 'harvestAnchors', 'heightfield', 'lanes',
    ],
    'e9-old-canal': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers',
      'waterSources', 'harvestAnchors', 'heightfield', 'lanes',
    ],
    'e10-ember-shore': [
      'tileId', 'size', 'dimensions', 'river', 'ford', 'buildZones', 'stakeMarkers', 'rails',
      'waterSources', 'harvestAnchors', 'heightfield', 'lanes',
    ],
  };

  for (const [id, directKeys] of Object.entries(keys)) {
    const authored = contract(id);
    const published = await table(id);
    assert.deepEqual(Object.keys(published), ['maskTruth', 'waterAgreement']);
    const source = id.startsWith('e2-')
      ? 'assets/contracts/epoch-2-steamworks/contracts.json'
      : id === 'e3-fairground'
      ? 'assets/contracts/epoch-3-voltage/contracts.json; src/entities/FerrisWheel.ts:43-44'
      : id.startsWith('e4-')
        ? 'assets/contracts/epoch-4-motor/contracts.json; lore/STORYBOOK.md — E4 "New maps, specified for whoever builds them"'
      : id.startsWith('e5-')
        ? 'assets/contracts/epoch-5-deepwater/contracts.json; lore/STORYBOOK.md:281-284'
      : id === 'e6-glow-mesa'
        ? 'assets/contracts/epoch-6-atomic/contracts.json; specs/epoch-saga/e6-atomic-bundle.md §B'
        : id.startsWith('e6-')
          ? 'assets/contracts/epoch-6-atomic/contracts.json; lore/STORYBOOK.md — E6 "New maps, specified for whoever builds them"'
        : id.startsWith('e7-')
          ? id === 'e7-relay-valley'
            ? 'assets/contracts/epoch-7-signal/contracts.json; specs/epoch-saga/e7-signal-bundle.md §B'
            : 'assets/contracts/epoch-7-signal/contracts.json; lore/STORYBOOK.md E7 contracts'
          : id === 'e8-mare-claim'
            ? 'assets/contracts/epoch-8-orbital/contracts.json; specs/epoch-saga/e8-orbital-bundle.md §B'
            : id === 'e9-dome-basin'
              ? 'assets/contracts/epoch-9-redfields/contracts.json; specs/epoch-saga/e9-redfields-bundle.md §B'
              : id.startsWith('e9-')
                ? 'assets/contracts/epoch-9-redfields/contracts.json; lore/STORYBOOK.md E9 contracts'
              : id === 'e10-ember-shore'
                ? 'assets/contracts/epoch-10-deepsky/contracts.json; specs/epoch-saga/e10-deepsky-bundle.md §B2'
              : 'assets/contracts/epoch-3-voltage/contracts.json';
    assert.equal(published.maskTruth.source, source);
    for (const key of directKeys) assert.deepEqual(published.maskTruth[key], authored.tileParams[key], `${id}.${key}`);
    const authoredSpawnGates = authored.twist.enemyRoster?.flatMap((enemy) => enemy.spawnGates ?? []) ?? [];
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

  const showroom = contract('e6-showroom');
  const showroomMask = (await table(showroom.id)).maskTruth;
  assert.deepEqual(showroomMask.showroomHouses, [
    { id: 'west-display-home', cascade: 'catalog-product-family', minX: -46, maxX: -28, minZ: -18, maxZ: 0 },
    { id: 'northwest-display-home', cascade: 'catalog-product-family', minX: -28, maxX: -10, minZ: 10, maxZ: 28 },
    { id: 'north-display-home', cascade: 'catalog-product-family', minX: -9, maxX: 9, minZ: -18, maxZ: 0 },
    { id: 'northeast-display-home', cascade: 'catalog-product-family', minX: 10, maxX: 28, minZ: 10, maxZ: 28 },
    { id: 'east-display-home', cascade: 'catalog-product-family', minX: 28, maxX: 46, minZ: -18, maxZ: 0 },
  ]);
  assert.deepEqual(showroomMask.catalogGoods, showroom.tileParams.harvestAnchors);

  const hollowMask = (await table('e6-half-life-hollow')).maskTruth;
  assert.deepEqual(hollowMask.glowBridges, [
    { id: 'south-glow-bridge', minX: -8, maxX: 8, minZ: -40, maxZ: -22 },
    { id: 'north-glow-bridge', minX: -8, maxX: 8, minZ: 26, maxZ: 40 },
  ]);
  assert.deepEqual(hollowMask.causeways, [
    { id: 'center-dial-causeway', minX: -8, maxX: 8, minZ: -6, maxZ: 10 },
  ]);
  assert.deepEqual(hollowMask.countdownGround, [
    { id: 'west-countdown-ground', minX: -42, maxX: -8, minZ: -22, maxZ: -6 },
    { id: 'east-countdown-ground', minX: 8, maxX: 42, minZ: 10, maxZ: 26 },
  ]);
  assert.deepEqual(hollowMask.extractionRoute, [
    { x: 0, z: -48 }, { x: 0, z: -30 }, { x: -24, z: -14 }, { x: 0, z: 2 },
    { x: 24, z: 18 }, { x: 0, z: 34 }, { x: 0, z: 48 },
  ]);

  const picnic = contract('e6-picnic');
  const picnicMask = (await table(picnic.id)).maskTruth;
  assert.equal(picnic.tileParams.tileId, glowMesa.tileParams.tileId);
  assert.deepEqual(picnicMask.picnicBlankets, [
    { id: 'west-picnic-blanket', minX: -24, maxX: -8, minZ: 12, maxZ: 24 },
    { id: 'center-picnic-blanket', minX: -8, maxX: 8, minZ: 22, maxZ: 34 },
    { id: 'east-picnic-blanket', minX: 8, maxX: 24, minZ: 12, maxZ: 24 },
  ]);
  assert.deepEqual(picnicMask.civilianSites, [
    { x: -20, z: 18 }, { x: -12, z: 18 }, { x: -4, z: 28 },
    { x: 4, z: 28 }, { x: 12, z: 18 }, { x: 20, z: 18 },
  ]);
  assert.deepEqual(picnicMask.sandwichSites, picnic.tileParams.stakeMarkers
    .map(({ id, x, z }) => ({ id, x, z })));

  const relayValley = contract('e7-relay-valley');
  const relayValleyMask = (await table(relayValley.id)).maskTruth;
  assert.deepEqual(relayValleyMask.ridgeBands, [
    { id: 'ridge-west-h5', height: 5, minX: -54, maxX: -8, minZ: 24, maxZ: 54 },
    { id: 'ridge-east-h5', height: 5, minX: 8, maxX: 54, minZ: 24, maxZ: 54 },
    { id: 'valley-floor-h0', height: 0, minX: -54, maxX: 54, minZ: -54, maxZ: 18 },
  ]);
  assert.deepEqual(relayValleyMask.fogPockets, [
    { id: 'ridge-dead-gap', minX: -8, maxX: 8, minZ: 24, maxZ: 54 },
    { id: 'west-fog-pocket', minX: -42, maxX: -18, minZ: -4, maxZ: 18 },
    { id: 'east-fog-pocket', minX: 18, maxX: 42, minZ: -12, maxZ: 12 },
  ]);

  const mareClaim = contract('e8-mare-claim');
  const mareClaimMask = (await table(mareClaim.id)).maskTruth;
  assert.deepEqual(mareClaimMask.rimBands, [
    { id: 'crater-rim-north-h6', height: 6, minX: -54, maxX: 54, minZ: 42, maxZ: 54 },
    { id: 'crater-rim-south-h6', height: 6, minX: -54, maxX: 54, minZ: -54, maxZ: -42 },
    { id: 'crater-rim-west-h6', height: 6, minX: -54, maxX: -42, minZ: -42, maxZ: 42 },
    { id: 'crater-rim-east-h6', height: 6, minX: 42, maxX: 54, minZ: -42, maxZ: 42 },
  ]);
  assert.deepEqual(mareClaimMask.mareFlat,
    { id: 'mare-flat-h0', height: 0, minX: -42, maxX: 42, minZ: -42, maxZ: 42 });
  assert.deepEqual(mareClaimMask.lavaTubeMouth,
    { id: 'lava-tube-mouth', minX: -38, maxX: -24, minZ: 18, maxZ: 32 });
  assert.deepEqual(mareClaimMask.debrisArcLanes, mareClaim.tileParams.lanes.patrolRoutes);

  const domeBasin = contract('e9-dome-basin');
  const domeBasinMask = (await table(domeBasin.id)).maskTruth;
  assert.deepEqual(domeBasinMask.quarryScarpBands, [
    { id: 'ice-quarry-scarp-north-h4', height: 4, minX: -54, maxX: -18, minZ: 42, maxZ: 54 },
  ]);
  assert.deepEqual(domeBasinMask.basinDepression,
    { id: 'dome-basin-floor-h-2', height: -2, minX: -14, maxX: 18, minZ: -28, maxZ: 26 });
  assert.deepEqual(domeBasinMask.canalRoute, domeBasin.tileParams.rails[0]);
  assert.deepEqual(domeBasinMask.canalStageGates, domeBasin.tileParams.stakeMarkers
    .map(({ id, x, z }) => ({ id, x, z })));
  assert.deepEqual(domeBasinMask.dustDevilLanes, domeBasin.tileParams.lanes.patrolRoutes);

  const seedRun = contract('e9-seed-run');
  const seedRunMask = (await table(seedRun.id)).maskTruth;
  assert.deepEqual(seedRunMask.permanentGreenWaypointZones, [
    { id: 'west-green-waypoint', minX: -44, maxX: -24, minZ: -30, maxZ: -12 },
    { id: 'center-green-waypoint', minX: -10, maxX: 10, minZ: -6, maxZ: 12 },
    { id: 'east-green-waypoint', minX: 24, maxX: 44, minZ: 18, maxZ: 36 },
  ]);
  assert.deepEqual(seedRunMask.caravanRoute, [
    { x: 0, z: -48 }, { x: -34, z: -21 }, { x: 0, z: 3 }, { x: 34, z: 27 }, { x: 0, z: 48 },
  ]);

  const devilsAlley = contract('e9-devils-alley');
  const devilsAlleyMask = (await table(devilsAlley.id)).maskTruth;
  assert.deepEqual(devilsAlleyMask.dustDevilCorridors, [
    { id: 'south-devil-sweep', description: 'First scheduled pickup-and-relocation sweep.', minX: -54, maxX: 54, minZ: -34, maxZ: -18 },
    { id: 'center-devil-sweep', description: 'Second scheduled pickup-and-relocation sweep.', minX: -54, maxX: 54, minZ: -8, maxZ: 8 },
    { id: 'north-devil-sweep', description: 'Third scheduled pickup-and-relocation sweep.', minX: -54, maxX: 54, minZ: 18, maxZ: 34 },
  ]);
  assert.deepEqual(devilsAlleyMask.anchorSites, devilsAlley.tileParams.buildZones
    .filter((zone) => zone.id.endsWith('anchor-bay'))
    .map(({ id, minX, maxX, minZ, maxZ }) => ({ id, minX, maxX, minZ, maxZ })));

  const oldCanal = contract('e9-old-canal');
  const oldCanalMask = (await table(oldCanal.id)).maskTruth;
  assert.equal(oldCanal.tileParams.rails, undefined, 'canal route must not enter the live rail renderer');
  assert.deepEqual(oldCanalMask.inheritedCanalRoute, {
    style: 'old-digger-canal',
    points: [
      { x: -46, z: -38 }, { x: -30, z: -23 }, { x: -12, z: -26 }, { x: 2, z: 0 },
      { x: 26, z: 6 }, { x: 32, z: 23 }, { x: 12, z: 48 },
    ],
  });
  assert.deepEqual(oldCanalMask.canalDecisionZones, [
    { id: 'old-canal-segment-a', choice: 'redig-or-demolish', minX: -42, maxX: -18, minZ: -32, maxZ: -14 },
    { id: 'old-canal-segment-b', choice: 'redig-or-demolish', minX: -10, maxX: 14, minZ: -8, maxZ: 8 },
    { id: 'old-canal-segment-c', choice: 'redig-or-demolish', minX: 20, maxX: 44, minZ: 14, maxZ: 32 },
  ]);

  const emberShore = contract('e10-ember-shore');
  const emberShoreMask = (await table(emberShore.id)).maskTruth;
  assert.deepEqual(emberShoreMask.lavaVeinBands, [
    { id: 'cooling-lava-vein-west', minX: -52, maxX: -40, minZ: -52, maxZ: 40 },
    { id: 'cooling-lava-vein-center', minX: -18, maxX: -8, minZ: -54, maxZ: 10 },
    { id: 'cooling-lava-vein-east', minX: 44, maxX: 54, minZ: -12, maxZ: 54 },
  ]);
  assert.deepEqual(emberShoreMask.fixtureZones, emberShore.tileParams.buildZones
    .filter((zone) => zone.id === 'last-warm-vent-site')
    .map(({ id, minX, maxX, minZ, maxZ }) => ({ id, minX, maxX, minZ, maxZ })));
  assert.deepEqual(emberShore.tileParams.harvestAnchors, []);

  for (const id of ['e4-long-road', 'e4-gusher-county', 'e4-boneyard', 'e5-regatta', 'e5-stillwater', 'e5-flotilla']) {
    const authored = contract(id);
    const mask = (await table(id)).maskTruth;
    assert.deepEqual(mask.weather, authored.twist.weather, `${id}.weather`);
    assert.deepEqual(mask.enemyRoster, authored.twist.enemyRoster, `${id}.enemyRoster`);
  }

  const trestleMask = (await table('e2-trestle')).maskTruth;
  assert.deepEqual(trestleMask.trestleDeck, { id: 'trestle-deck', minX: -3, maxX: 3, minZ: -7, maxZ: 7 });
  assert.deepEqual(trestleMask.coalSeams, []);
  assert.deepEqual((await table('e2-incline')).maskTruth.coalSeams, []);
  assert.equal((await table('e2-pressure-garden')).maskTruth.coalSeamSource, 'src/systems/PressureSystem.ts');
  assert.equal(contract('e5-stillwater').tileParams.tileId, 'e5-deepwater-claim');
  assert.equal(contract('e5-flotilla').tileParams.tileId, 'e5-deepwater-claim');

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

for (const id of ['e2-trestle', 'e2-pressure-garden', 'e2-incline', 'e3-canyon-works', 'e3-blackout-ridge', 'e3-moth-season', 'e3-fairground', 'e4-dust-flats', 'e4-long-road', 'e4-gusher-county', 'e4-boneyard', 'e5-regatta', 'e5-stillwater', 'e5-flotilla', 'e6-glow-mesa', 'e6-showroom', 'e6-half-life-hollow', 'e6-picnic', 'e7-relay-valley', 'e7-echo-canyon', 'e7-dead-band', 'e7-relay-rush', 'e8-mare-claim', 'e9-dome-basin', 'e9-seed-run', 'e9-devils-alley', 'e9-old-canal', 'e10-ember-shore']) {
  test(`${id} mask stays inside bounds and agrees with authored water`, async () => {
    const { maskTruth, waterAgreement } = await table(id);
    assertBoundsAndWater(maskTruth, waterAgreement);
  });
}
