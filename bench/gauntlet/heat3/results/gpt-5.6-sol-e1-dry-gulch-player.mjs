#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const sim = spawn(process.execPath, [
  'scripts/gr-sim.mjs',
  '--contract', 'e1-dry-gulch',
  '--seed', 'e1-dry-gulch-01',
], { stdio: ['pipe', 'pipe', 'pipe'] });

const upgradePriority = [
  'split_spark',
  'double_tap_coil',
  'tinkers_plating',
  'heavy_spark',
  'long_resonator',
  'powder_charge',
  'wide_ring',
  'spring_heels',
  'prospectors_luck',
  'pan_legend',
];
const blockedBuilds = new Set();

function chooseUpgrade(offer) {
  return [...offer].sort((a, b) => {
    const ai = upgradePriority.indexOf(a.id);
    const bi = upgradePriority.indexOf(b.id);
    return (ai < 0 ? upgradePriority.length : ai) - (bi < 0 ? upgradePriority.length : bi);
  })[0].id;
}

function ordersFor(view) {
  if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const { x, z } = view.stablePrefix.map.claim;
  const available = new Map((view.stablePrefix.mechanics.buildables ?? []).map((buildable) => [buildable.id, buildable]));
  const corePlans = [
    ['palisade', -4, -1], ['palisade', 4, -1], ['palisade', -4, 2], ['palisade', 4, 2],
    ['turret', -3, -4],
    ['palisade', -7, 0], ['palisade', 7, 0], ['palisade', 0, -6], ['palisade', 0, 6],
    ['turret', 3, -4], ['turret', -3, 3],
  ];
  const coreReady = (view.now.works.byKind.turret ?? 0) >= 3 && (view.now.works.byKind.palisade ?? 0) >= 6;
  const latePlans = coreReady ? [
    ['sentry_beacon', -9, 0], ['sentry_beacon', 9, 0], ['sentry_beacon', 0, -9],
    ['sentry_beacon', 0, 9], ['sentry_beacon', -8, 9], ['sentry_beacon', 8, 9],
    ['turret', 3, 3],
    ['palisade', -10, -3], ['palisade', 10, -3], ['palisade', -10, 3], ['palisade', 10, 3],
    ['palisade', -5, -9], ['palisade', 5, -9], ['palisade', -5, 9], ['palisade', 5, 9],
  ] : [];
  const plans = [...corePlans, ...latePlans];
  const built = view.now.works.entries;
  const orders = [];

  if (view.now.pendingOffer) {
    orders.push({ verb: 'PICK_UPGRADE', id: chooseUpgrade(view.now.pendingOffer) });
  }

  const nextInstance = new Map([...available].map(([id]) => [id, view.now.works.byKind[id] ?? 0]));
  let budget = view.now.gold;
  for (const [what, dx, dz] of plans) {
    const definition = available.get(what);
    const where = { x: x + dx, z: z + dz };
    const key = `${what}:${where.x}:${where.z}`;
    if (!definition || blockedBuilds.has(key)) continue;
    if (built.some((entry) => entry.id === what && Math.hypot(entry.position.x - where.x, entry.position.z - where.z) < 0.2)) continue;
    const instance = nextInstance.get(what) ?? 0;
    if (instance >= definition.maxCount) continue;
    const cost = definition.costs[instance] ?? definition.cost;
    if (cost > budget) break;
    budget -= cost;
    nextInstance.set(what, instance + 1);
    orders.push(
      { verb: 'MOVE_TO', pos: where },
      { verb: 'BUILD', what, where, when: { goldGte: cost } },
    );
  }

  const prospector = view.now.prospector ?? view.now.hero;
  const seamPositions = new Map(view.stablePrefix.map.seams.map((seam) => [seam.id, seam]));
  const seams = view.now.seams.filter((seam) => seam.active).sort((a, b) => {
    const ap = seamPositions.get(a.id);
    const bp = seamPositions.get(b.id);
    return Math.hypot(ap.x - prospector.x, ap.z - prospector.z) - Math.hypot(bp.x - prospector.x, bp.z - prospector.z);
  });
  for (const seam of seams) {
    for (let pan = 0; pan < 5 && orders.length < 30; pan += 1) {
      orders.push({ verb: 'HARVEST', seam: seam.id });
    }
  }
  if ((view.now.works.byKind.turret ?? 0) === 4 && (view.now.works.byKind.sentry_beacon ?? 0) === 6) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 70 });
  }
  if (orders.length < 31) orders.push({ verb: 'SET_WEAPON', weapon: 'rig' });
  orders.push({ verb: 'HOLD', pos: { x, z } });
  return orders.slice(0, 32);
}

let outcome;
let lastWave = -1;
createInterface({ input: sim.stdout, crlfDelay: Infinity }).on('line', (line) => {
  const message = JSON.parse(line);
  if (message.schema === 'goldrush.view.v1') {
    for (const record of message.now.orders) {
      if (record.status !== 'failed' || record.order.verb !== 'BUILD') continue;
      const key = `${record.order.what}:${record.order.where.x}:${record.order.where.z}`;
      if (!blockedBuilds.has(key)) process.stderr.write(`blocked build: ${key} (${record.reason})\n`);
      blockedBuilds.add(key);
    }
    if (message.now.wave !== lastWave) {
      process.stderr.write(`wave: ${JSON.stringify({ wave: message.now.wave, gold: message.now.gold, hp: message.now.hero.hp, worksHp: message.now.works.hp, works: message.now.works.byKind, threats: message.now.threats.alive })}\n`);
      lastWave = message.now.wave;
    }
    if (message.now.hero.hp > 0) sim.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
  } else if (typeof message.secured === 'boolean') {
    outcome = message;
  }
});

let stderr = '';
sim.stderr.setEncoding('utf8');
sim.stderr.on('data', (chunk) => { stderr += chunk; });
sim.on('close', (code) => {
  if (stderr) process.stderr.write(stderr);
  if (outcome) process.stdout.write(`${JSON.stringify(outcome)}\n`);
  process.exitCode = code || (outcome ? 0 : 1);
});
