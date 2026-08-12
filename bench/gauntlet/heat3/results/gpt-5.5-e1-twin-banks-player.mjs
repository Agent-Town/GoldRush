#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const CONTRACT = 'e1-twin-banks';
const SEED = 'e1-twin-banks-01';

const BUILD_PLAN = [
  b('palisade', -3, -9, 10, 1),
  b('palisade', 0, -9, 10, 1),
  b('palisade', 3, -9, 10, 1),
  b('palisade', -4, -12, 10, 0),
  b('palisade', 4, -12, 10, 0),
  b('palisade', -3, -15, 10, 1),
  b('palisade', 0, -15, 10, 1),
  b('palisade', 3, -15, 10, 1),
  b('sentry_beacon', -2, -12, 25),
  b('sentry_beacon', 2, -12, 35),
  b('turret', 0, -11, 50),
  b('turret', -2, -13, 70),
  b('turret', 2, -13, 95),
  b('sentry_beacon', 0, -13, 45),
  b('turret', 0, -12, 125),
];

const UPGRADE_PRIORITY = [
  'split_spark',
  'heavy_spark',
  'double_tap_coil',
  'long_resonator',
  'tinkers_plating',
  'beacon_dynamo',
  'powder_charge',
  'quick_fuse',
  'wide_ring',
  'pan_legend',
  'prospectors_luck',
  'spring_heels',
  'field_dressing',
  'assay_bonus',
  'sharpen',
];

const sim = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED], {
  stdio: ['pipe', 'pipe', 'pipe'],
});

let outcome = null;
let preferredSeamId = null;

sim.stderr.on('data', (chunk) => process.stderr.write(chunk));

const lines = createInterface({ input: sim.stdout, crlfDelay: Infinity });
lines.on('line', (line) => {
  const message = JSON.parse(line);
  if (message.schema === 'goldrush.view.v1') {
    traceView(message);
    sim.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
    return;
  }
  outcome = message;
  process.stdout.write(`${JSON.stringify(outcome)}\n`);
});

sim.on('close', (code) => {
  if (code !== 0 || !outcome) process.exit(code || 1);
});

function b(what, x, z, goldGte, rotationSteps) {
  return { what, where: { x, z }, goldGte, ...(rotationSteps === undefined ? {} : { rotationSteps }) };
}

function ordersFor(view) {
  if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const offer = view.now.pendingOffer;
  if (offer?.length) return [{ verb: 'PICK_UPGRADE', id: chooseUpgrade(offer) }];

  const seam = nearestActiveSeam(view);
  const orders = [];
  if (view.now.weapon !== 'rig') orders.push({ verb: 'SET_WEAPON', weapon: 'rig' });
  orders.push(...buildOrders(view));

  if (view.now.blastReadyInMs === 0 && view.now.threats.alive > 0) {
    orders.push({ verb: 'BLAST_AT', pos: blastTarget(view) });
  }

  if (seam) orders.push({ verb: 'HARVEST', seam: seam.id });

  return orders;
}

function buildOrders(view) {
  const palisades = liveCount(view, 'palisade');
  const beacons = liveCount(view, 'sentry_beacon');
  const turrets = liveCount(view, 'turret');
  const gold = view.now.gold;
  const spot = openSpot(view, view.now.prospector ?? view.now.hero);

  if (palisades < 1 && gold >= 10) return [buildOrder(b('palisade', spot.x, spot.z, 10, wallRotation(spot)))];
  if (beacons < 1 && gold >= beaconCost(beacons)) return [buildOrder(b('sentry_beacon', spot.x, spot.z, beaconCost(beacons)))];
  if (palisades < 3 && gold >= 10) return [buildOrder(b('palisade', spot.x, spot.z, 10, wallRotation(spot)))];
  if (turrets < 1 && gold >= turretCost(turrets)) return [buildOrder(b('turret', spot.x, spot.z, turretCost(turrets)))];
  if (beacons < 3 && gold >= beaconCost(beacons)) return [buildOrder(b('sentry_beacon', spot.x, spot.z, beaconCost(beacons)))];
  if (turrets < 4 && gold >= turretCost(turrets)) return [buildOrder(b('turret', spot.x, spot.z, turretCost(turrets)))];
  if (palisades < 8 && gold >= 10) return [buildOrder(b('palisade', spot.x, spot.z, 10, wallRotation(spot)))];
  return [];
}

function buildOrder(entry) {
  return {
    verb: 'BUILD',
    what: entry.what,
    where: entry.where,
    when: { goldGte: entry.goldGte },
    ...(entry.rotationSteps === undefined ? {} : { rotationSteps: entry.rotationSteps }),
  };
}

function chooseUpgrade(offer) {
  return UPGRADE_PRIORITY.find((id) => offer.some((entry) => entry.id === id)) ?? offer[0].id;
}

function hasWork(view, planned) {
  return view.now.works.entries.some((entry) =>
    entry.id === planned.what &&
    Math.hypot(entry.position.x - planned.where.x, entry.position.z - planned.where.z) < 0.6
  );
}

function nearestActiveSeam(view) {
  const active = view.now.seams.filter((seam) => seam.active && seam.remaining > 0);
  if (preferredSeamId && active.some((seam) => seam.id === preferredSeamId)) {
    return { id: preferredSeamId };
  }
  const byId = new Map(view.stablePrefix.map.seams.map((seam) => [seam.id, seam]));
  const from = view.now.prospector ?? view.now.hero;
  const picked = active
    .map((seam) => byId.get(seam.id) ?? seam)
    .sort((a, b) => dist(a, from) - dist(b, from))[0];
  preferredSeamId = picked?.id ?? null;
  return picked;
}

function blastTarget(view) {
  const hero = view.now.hero;
  const targets = {
    north: { x: hero.x, z: hero.z + 8 },
    south: { x: hero.x, z: hero.z - 8 },
    east: { x: hero.x + 8, z: hero.z },
    west: { x: hero.x - 8, z: hero.z },
  };
  return targets[view.now.threats.edge] ?? { x: hero.x, z: hero.z + 8 };
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function liveCount(view, id) {
  return view.now.works.entries.filter((entry) => entry.id === id && !entry.wrecked && entry.hp > 0).length;
}

function beaconCost(count) {
  return Math.ceil((25 * 1.3 ** count) / 5) * 5;
}

function turretCost(count) {
  return Math.ceil((50 * 1.35 ** count) / 5) * 5;
}

function openSpot(view, origin) {
  const base = banked(snap(origin));
  const offsets = [[0, 0], [-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, -2], [-2, 2], [2, 2]];
  for (const [dx, dz] of offsets) {
    const spot = banked({ x: base.x + dx, z: base.z + dz });
    if (!view.now.works.entries.some((entry) => dist(entry.position, spot) < 1.5)) return spot;
  }
  return base;
}

function snap(pos) {
  return { x: Math.round(pos.x), z: Math.round(pos.z) };
}

function banked(pos) {
  return {
    x: Math.max(-27, Math.min(27, pos.x)),
    z: pos.z > -7 && pos.z < 7 ? (pos.z < 0 ? -8 : 8) : Math.max(-29, Math.min(29, pos.z)),
  };
}

function wallRotation(pos) {
  return Math.abs(pos.x) > 6 ? 0 : 1;
}

function traceView(view) {
  if (!process.env.TRACE) return;
  const latest = view.now.orders
    .filter((entry) => entry.status === 'failed')
    .map((entry) => `${entry.order?.verb}:${entry.reason}`)
    .join('; ');
  process.stderr.write(
    `view wave=${view.now.wave} gold=${view.now.gold} hp=${Math.round(view.now.hero.hp)} hero=${pt(view.now.hero)} prospector=${pt(view.now.prospector)} works=${view.now.works.standing} threats=${view.now.threats.alive}${latest ? ` failures=${latest}` : ''}\n`,
  );
}

function pt(pos) {
  return pos ? `${pos.x},${pos.z}` : 'none';
}
