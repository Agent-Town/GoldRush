#!/usr/bin/env node

import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const CONTRACT_ID = 'e1-night-shift';
const SEEDS = ['night-stall-01', 'night-stall-02', 'night-stall-03', 'night-stall-04', 'night-stall-05'];
const STEP_SECONDS = 1 / 30;
const SAMPLE_TICKS = 15;
const ROUTES_PER_SEED = 12;
const ROUTE_SECONDS = 12;
const STALL_SECONDS = 3;
const MIN_PROGRESS = 0.35;

const location = new URL(`http://gr-sim.local/?debug&contract=${CONTRACT_ID}`);
globalThis.location = location;
globalThis.window = { location };

const root = fileURLToPath(new URL('..', import.meta.url));
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });

try {
  const [{ HeadlessContractSim }, Terrain, { createRng }, { getBuildableDef }, { loadContract }] = await Promise.all([
    vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts'),
    vite.ssrLoadModule('/src/world/Terrain.ts'),
    vite.ssrLoadModule('/src/core/Rng.ts'),
    vite.ssrLoadModule('/src/game/buildables.ts'),
    vite.ssrLoadModule('/src/meta/ContractFamilies.ts'),
  ]);
  const contract = loadContract(CONTRACT_ID);
  const landmarks = Terrain.landmarkBlockers();
  const objects = [
    ...landmarks.map((entry) => ({ ...entry, id: `landmark:${entry.id}` })),
    ...(contract.tileParams.prePlacedBuildables ?? []).map((fixture, index) => {
      const footprint = getBuildableDef(fixture.id)?.footprint ?? { w: 1, d: 1 };
      const rotated = (fixture.rotationSteps ?? 0) % 2 === 1;
      return {
        id: `preplaced:${fixture.id}:${index}`,
        x: fixture.x,
        z: fixture.z,
        halfX: (rotated ? footprint.d : footprint.w) / 2,
        halfZ: (rotated ? footprint.w : footprint.d) / 2,
      };
    }),
  ];
  const stalls = [];

  for (const seed of SEEDS) {
    location.searchParams.set('seed', seed);
    const sim = new HeadlessContractSim(CONTRACT_ID, seed);
    const rng = createRng(seed);

    for (let route = 0; route < ROUTES_PER_SEED; route += 1) {
      const object = landmarks[route % landmarks.length];
      const slot = rng.int(0, 16);
      const face = rng.int(0, 4);
      const tangentSide = slot % 2 === 0 ? -1 : 1;
      const jitter = rng.range(-0.3, 0.3);
      const { start, target } = routeAcross(object, face, tangentSide, jitter);
      sim.enemies.recycleAll();
      const enemy = sim.enemies.spawn({ x: start.x, y: 0.06, z: start.z }, {}, slot);
      if (!enemy) throw new Error(`Could not spawn census enemy in slot ${slot}.`);
      enemy.scriptMoveTo(target.x, target.z, 2.7);
      let anchor = { at: 0, distance: distanceTo(enemy.position, target) };

      for (let tick = 1; tick <= ROUTE_SECONDS / STEP_SECONDS; tick += 1) {
        sim.enemies.update(STEP_SECONDS, sim.hero.group.position, () => false, landmarks);
        if (tick % SAMPLE_TICKS !== 0) continue;
        const at = tick * STEP_SECONDS;
        const distance = distanceTo(enemy.position, target);
        if (distance <= 1.25) break;
        if (at - anchor.at < STALL_SECONDS) continue;
        if (anchor.distance - distance < MIN_PROGRESS) {
          const nearest = nearestObject(enemy.position, objects);
          stalls.push({
            seed,
            slot,
            at: round(at),
            x: round(enemy.position.x),
            z: round(enemy.position.z),
            progress: round(anchor.distance - distance),
            object: nearest.distance <= 1.5 ? nearest.id : 'unclassified',
          });
          break;
        }
        anchor = { at, distance };
      }
    }
  }

  printTable(stalls);
  if (stalls.length > 0) process.exitCode = 1;
} finally {
  await vite.close();
}

function routeAcross(object, face, tangentSide, jitter) {
  const margin = 2;
  if (face === 0 || face === 1) {
    const normal = face === 0 ? 1 : -1;
    return {
      start: { x: object.x + jitter, z: object.z + normal * (object.halfZ + margin) },
      target: { x: object.x + tangentSide * (object.halfX + margin), z: object.z - normal * (object.halfZ + margin) },
    };
  }
  const normal = face === 2 ? 1 : -1;
  return {
    start: { x: object.x + normal * (object.halfX + margin), z: object.z + jitter },
    target: { x: object.x - normal * (object.halfX + margin), z: object.z + tangentSide * (object.halfZ + margin) },
  };
}

function nearestObject(point, objects) {
  return objects.reduce((nearest, object) => {
    const dx = Math.max(Math.abs(point.x - object.x) - object.halfX, 0);
    const dz = Math.max(Math.abs(point.z - object.z) - object.halfZ, 0);
    const distance = Math.hypot(dx, dz);
    return distance < nearest.distance ? { id: object.id, distance } : nearest;
  }, { id: 'none', distance: Number.POSITIVE_INFINITY });
}

function printTable(stalls) {
  const clusters = new Map();
  for (const stall of stalls) {
    const key = `${stall.object}|${Math.round(stall.x)},${Math.round(stall.z)}`;
    const row = clusters.get(key) ?? { object: stall.object, position: key.split('|')[1], count: 0, seeds: new Set() };
    row.count += 1;
    row.seeds.add(stall.seed);
    clusters.set(key, row);
  }
  console.log(`Night Shift stall census: ${SEEDS.length} seeds x ${ROUTES_PER_SEED} scripted routes; stall = <${MIN_PROGRESS}wu goal progress / ${STALL_SECONDS}s`);
  console.log('| object | position cluster | stalls | seeds |');
  console.log('|---|---:|---:|---:|');
  for (const row of [...clusters.values()].sort((a, b) => b.count - a.count || a.object.localeCompare(b.object))) {
    console.log(`| ${row.object} | ${row.position} | ${row.count} | ${row.seeds.size} |`);
  }
  if (clusters.size === 0) console.log('| none | - | 0 | 0 |');
}

function round(value) {
  return Number(value.toFixed(3));
}

function distanceTo(point, target) {
  return Math.hypot(target.x - point.x, target.z - point.z);
}
