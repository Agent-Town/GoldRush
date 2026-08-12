#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const hold = { verb: 'HOLD', pos: { x: 0, z: 12 } };
const builds = [
  ['turret', -3, 8, 50],
  ['palisade', -3, 10, 10],
  ['palisade', 0, 10, 10],
  ['palisade', 3, 10, 10],
  ['palisade', 0, 14, 10],
  ['turret', 3, 8, 70],
  ['palisade', -3, 14, 10],
  ['palisade', 3, 14, 10],
  ['palisade', -6, 10, 10],
  ['palisade', 6, 10, 10],
  ['turret', 0, 16, 95],
];
const upgradePriority = [
  'split_spark',
  'double_tap_coil',
  'tinkers_plating',
  'long_resonator',
  'heavy_spark',
  'prospectors_luck',
  'pan_legend',
  'wide_ring',
  'quick_fuse',
  'spring_heels',
];
const blockedBuilds = new Set();

function ordersFor(message) {
  const { now } = message;
  for (const entry of now.orders) {
    if (entry.status === 'failed' && entry.order.verb === 'BUILD') {
      blockedBuilds.add(`${entry.order.what}:${entry.order.where.x}:${entry.order.where.z}`);
    }
  }

  const orders = [];
  if (now.pendingOffer) {
    const pick = upgradePriority.find((id) => now.pendingOffer.some((offer) => offer.id === id));
    orders.push({ verb: 'PICK_UPGRADE', id: pick ?? now.pendingOffer[0].id });
  }
  if (now.blastReadyInMs === 0 && now.threats.alive > 0 && now.threats.edge) {
    const offset = { north: [0, -8], south: [0, 8], east: [8, 0], west: [-8, 0] }[now.threats.edge];
    orders.push({ verb: 'BLAST_AT', pos: { x: now.hero.x + offset[0], z: now.hero.z + offset[1] } });
  }
  for (const seam of now.seams.filter((candidate) => candidate.active)) {
    orders.push(...Array.from({ length: Math.ceil(seam.remaining / 5) }, () => ({ verb: 'HARVEST', seam: seam.id })));
  }
  orders.push({ verb: 'MOVE_TO', pos: { x: 0, z: 12 } });

  const built = { turret: 0, palisade: 0 };
  for (const [what, x, z, goldGte] of builds) {
    const key = `${what}:${x}:${z}`;
    const count = now.works.byKind[what] ?? 0;
    if (built[what]++ < count || blockedBuilds.has(key)) continue;
    orders.push({ verb: 'BUILD', what, where: { x, z }, when: { goldGte } });
  }
  if ((now.works.byKind.turret ?? 0) >= 3 && (now.works.byKind.palisade ?? 0) >= 8) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 60 });
  }
  orders.push(hold);
  return orders;
}

const child = spawn(process.execPath, [
  'scripts/gr-sim.mjs',
  '--contract', 'the-claim',
  '--seed', 'e1-the-claim-02',
], { stdio: ['pipe', 'pipe', 'inherit'] });

for await (const line of createInterface({ input: child.stdout })) {
  console.log(line);
  const message = JSON.parse(line);
  if (message.schema !== 'goldrush.view.v1') continue;

  const { now } = message;
  if (now.pendingSecure) {
    child.stdin.write(`${JSON.stringify([{ verb: 'SECURE_CHOICE', choice: 'bank' }])}\n`);
  } else if (now.hero.hp > 0 && message.appendLog.at(-1)?.outcome !== 'secured') {
    child.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
  }
}

const status = await new Promise((resolve, reject) => {
  child.once('error', reject);
  child.once('close', resolve);
});
process.exitCode = status ?? 1;
