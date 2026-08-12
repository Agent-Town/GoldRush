#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const CONTRACT = 'e1-baron';
const SEED = 'e1-baron-01';
const BUILD_RADIUS = 5.8;
const CLAIM = { x: 0, z: 12 };

const costs = {
  palisade: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  sentry_beacon: [25, 35, 45, 55, 75, 95],
  turret: [50, 70, 95, 125],
};

const buildPlan = [
  ['sentry_beacon', 0, 11],
  ['sentry_beacon', 0, 15],
  ['turret', -5.5, 12],
  ['turret', 5.5, 12],
  ['sentry_beacon', -3.5, 9],
  ['sentry_beacon', 3.5, 9],
  ['turret', -5.5, 15],
  ['turret', 5.5, 15],
  ['sentry_beacon', -3.5, 15],
  ['sentry_beacon', 3.5, 15],
  ['palisade', -4.5, 8, 1],
  ['palisade', -1.5, 8, 1],
  ['palisade', 1.5, 8, 1],
  ['palisade', 4.5, 8, 1],
  ['palisade', -7, 10, 0],
  ['palisade', -7, 13, 0],
  ['palisade', 7, 10, 0],
  ['palisade', 7, 13, 0],
  ['palisade', -4.5, 17, 1],
  ['palisade', -1.5, 17, 1],
  ['palisade', 1.5, 17, 1],
  ['palisade', 4.5, 17, 1],
].map(([what, x, z, rotationSteps = 0]) => ({ what, where: { x, z }, rotationSteps }));

const stations = [
  CLAIM,
  { x: 0, z: 8 },
  { x: -5.5, z: 12 },
  { x: 5.5, z: 12 },
  { x: 0, z: 15 },
];

const upgradePriority = [
  'split_spark',
  'heavy_spark',
  'double_tap_coil',
  'long_resonator',
  'tinkers_plating',
  'field_dressing',
  'beacon_dynamo',
  'quick_fuse',
  'powder_charge',
  'wide_ring',
  'prospectors_luck',
  'pan_legend',
  'spring_heels',
  'assay_bonus',
  'sharpen',
];

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function nextCost(view, what, plannedBudget) {
  const built = view.now.works.byKind[what] ?? 0;
  const alreadyQueued = plannedBudget.filter((order) => order.what === what).length;
  const curve = costs[what] ?? [9999];
  return curve[Math.min(curve.length - 1, built + alreadyQueued)] ?? curve.at(-1);
}

function reservingFourthTurret(view) {
  return view.now.wave >= 18 && (view.now.works.byKind.turret ?? 0) === 3 && view.now.gold < costs.turret[3];
}

function availableBuilds(view) {
  return buildPlan.filter(
    (item) => !view.now.works.entries.some((entry) => entry.id === item.what && dist(entry.position, item.where) <= 0.8)
  );
}

function buildOrdersFrom(view, origin, budget) {
  const orders = [];
  for (const item of availableBuilds(view)) {
    if (dist(origin, item.where) > BUILD_RADIUS) continue;
    const cost = nextCost(view, item.what, orders);
    if (item.what === 'turret' && (view.now.works.byKind.turret ?? 0) === 3 && budget < cost) break;
    if (budget < cost) continue;
    budget -= cost;
    orders.push({
      verb: 'BUILD',
      what: item.what,
      where: item.where,
      when: { goldGte: cost },
      ...(item.rotationSteps ? { rotationSteps: item.rotationSteps } : {}),
    });
  }
  return orders;
}

function bestBuildStation(view, prospector) {
  let best = null;
  for (const station of stations) {
    const orders = buildOrdersFrom(view, station, view.now.gold);
    if (orders.length === 0) continue;
    const score = orders.length * 20 - dist(prospector, station);
    if (!best || score > best.score) best = { station, orders, score };
  }
  return best;
}

function chooseUpgrade(offer) {
  return offer
    .map(({ id }) => id)
    .sort((a, b) => {
      const ai = upgradePriority.indexOf(a);
      const bi = upgradePriority.indexOf(b);
      return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    })[0];
}

function blastTarget(view) {
  const edge = view.now.threats.edge;
  if (view.now.wave >= 18) return { x: 0, z: 4 };
  if (edge === 'north') return { x: 0, z: 4 };
  if (edge === 'south') return { x: 0, z: 20 };
  if (edge === 'east') return { x: 8, z: 12 };
  if (edge === 'west') return { x: -8, z: 12 };
  return view.now.threats.alive > 18 ? { x: 0, z: 6 } : null;
}

function harvestOrders(view, prospector) {
  const positions = new Map(view.stablePrefix.map.seams.map((seam) => [seam.id, seam]));
  return view.now.seams
    .filter((seam) => seam.active && seam.remaining > 0)
    .map((seam) => ({ ...seam, pos: positions.get(seam.id) }))
    .filter((seam) => seam.pos)
    .sort((a, b) => {
      const ap = { x: a.pos.x, z: a.pos.z };
      const bp = { x: b.pos.x, z: b.pos.z };
      return dist(prospector, ap) + 0.35 * dist(CLAIM, ap) - (dist(prospector, bp) + 0.35 * dist(CLAIM, bp));
    })
    .flatMap((seam) => {
      const repeats = Math.max(1, Math.min(4, Math.ceil(seam.remaining / 5)));
      return Array.from({ length: repeats }, () => ({ verb: 'HARVEST', seam: seam.id }));
    });
}

function ordersFor(view) {
  if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  if (view.now.pendingOffer?.length) return [{ verb: 'PICK_UPGRADE', id: chooseUpgrade(view.now.pendingOffer) }];

  const prospector = view.now.prospector ?? CLAIM;
  const orders = [];
  if (view.now.weapon !== 'rig') orders.push({ verb: 'SET_WEAPON', weapon: 'rig' });

  const immediateBuilds = buildOrdersFrom(view, prospector, view.now.gold);
  if (immediateBuilds.length > 0) {
    orders.push(...immediateBuilds);
  } else if (view.now.gold >= 10) {
    const station = bestBuildStation(view, prospector);
    if (station && dist(prospector, station.station) > 0.4) {
      orders.push({ verb: 'MOVE_TO', pos: station.station }, ...station.orders);
    }
  }

  const target = view.now.blastReadyInMs === 0 ? blastTarget(view) : null;
  if (target) orders.push({ verb: 'BLAST_AT', pos: target });

  if (!reservingFourthTurret(view) && view.now.wave >= 12 && view.now.works.maxHp > 0 && view.now.works.hp < view.now.works.maxHp * 0.72) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 88 });
  }

  orders.push(...harvestOrders(view, prospector));
  orders.push({ verb: 'HOLD', pos: CLAIM });
  return orders.slice(0, 32);
}

async function main() {
  const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  let buffer = '';
  let stderr = '';
  let outcome = null;

  child.stdout.on('data', (chunk) => {
    buffer += chunk;
    let newline;
    while ((newline = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, newline);
      buffer = buffer.slice(newline + 1);
      if (!line.trim()) continue;
      const message = JSON.parse(line);
      if (message.schema === 'goldrush.view.v1') {
        if (process.env.GR_TRACE) appendFileSync(process.env.GR_TRACE, `${JSON.stringify(message)}\n`);
        child.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
      } else {
        outcome = message;
      }
    }
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
    if (process.env.GR_TRACE) appendFileSync(process.env.GR_TRACE, String(chunk));
  });

  const code = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', resolve);
  });
  if (code !== 0) {
    process.stderr.write(stderr);
    process.exit(code ?? 1);
  }
  process.stdout.write(`${JSON.stringify(outcome)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error?.stack ?? error}\n`);
  process.exit(1);
});
