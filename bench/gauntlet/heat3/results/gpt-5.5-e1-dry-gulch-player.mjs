#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const contract = process.argv[2] ?? 'e1-dry-gulch';
const seed = process.argv[3] ?? 'e1-dry-gulch-01';

const wantedBuilds = [
  ['sentry_beacon', -2, 11, 25],
  ['sentry_beacon', 2, 11, 35],
  ['turret', 0, 9, 50],
  ['turret', -4, 11, 70],
  ['turret', 4, 11, 95],
  ['sentry_beacon', 0, 6, 45],
  ['sentry_beacon', -6, 9, 55],
  ['sentry_beacon', 6, 9, 75],
  ['turret', 0, 14, 125],
].map(([what, x, z, goldGte]) => ({ what, where: { x, z }, when: { goldGte } }));

const upgradePriority = [
  'tinkers_plating',
  'double_tap_coil',
  'heavy_spark',
  'beacon_lens',
  'rich_veins',
  'sluice_foreman',
  'quick_pan',
  'long_barrel',
];

const sim = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed], {
  stdio: ['pipe', 'pipe', 'inherit'],
});
const lines = createInterface({ input: sim.stdout, crlfDelay: Infinity });
let outcome = null;

lines.on('line', (line) => {
  const message = JSON.parse(line);
  if (message.schema === 'goldrush.view.v1') {
    sim.stdin.write(`${JSON.stringify(decide(message))}\n`);
    return;
  }
  outcome = message;
});

sim.on('close', (code) => {
  if (code !== 0) process.exitCode = code;
  if (outcome) process.stdout.write(`${JSON.stringify(outcome)}\n`);
});

function decide(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  if (now.pendingOffer) return [{ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer, now.hero.hp) }];

  const orders = [];
  const build = wantedBuilds.find((candidate) =>
    !hasNearbyWork(now.works.entries, candidate.what, candidate.where)
    && now.gold >= candidate.when.goldGte,
  );
  if (build) {
    orders.push({ verb: 'MOVE_TO', pos: build.where });
    orders.push({ verb: 'BUILD', ...build });
  }

  const seam = nearestActiveSeam(view);
  if (seam) orders.push({ verb: 'HARVEST', seam: seam.id });
  orders.push({ verb: 'REPAIR_UNDER', pct: 70 });
  orders.push({ verb: 'FALLBACK_IF', threat: { enemiesGte: 35 }, pos: { x: 0, z: 12 } });
  orders.push({ verb: 'HOLD', pos: { x: 0, z: 12 } });
  return orders.slice(0, 32);
}

function pickUpgrade(offer, hp) {
  if (hp < 55) {
    const heal = offer.find((item) => item.id === 'tinkers_plating');
    if (heal) return heal.id;
  }
  return upgradePriority.find((id) => offer.some((item) => item.id === id)) ?? offer[0].id;
}

function nearestActiveSeam(view) {
  const positions = new Map(view.stablePrefix.map.seams.map((seam) => [seam.id, seam]));
  const from = view.now.prospector ?? view.now.hero;
  return view.now.seams
    .filter((seam) => seam.active && seam.remaining > 0)
    .map((seam) => ({ ...seam, ...positions.get(seam.id) }))
    .sort((a, b) => distance(a, from) - distance(b, from))[0];
}

function hasNearbyWork(entries, id, pos) {
  return entries.some((entry) => entry.id === id && distance(entry, pos) < 0.6);
}

function distance(a, b) {
  return Math.hypot((a.x ?? 0) - (b.x ?? 0), (a.z ?? 0) - (b.z ?? 0));
}
