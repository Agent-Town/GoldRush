#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const sim = spawn(process.execPath, [
  'scripts/gr-sim.mjs',
  '--contract', 'e1-night-shift',
  '--seed', 'e1-night-shift-01',
], { cwd: process.cwd(), stdio: ['pipe', 'pipe', 'pipe'] });

const buildPlan = [
  ['turret', -3, 8, 0],
  ['palisade', -3, 10, 1],
  ['palisade', 0, 10, 1],
  ['palisade', 3, 10, 1],
  ['palisade', 0, 14, 1],
  ['sluice', -12, 7, 0],
  ['turret', 3, 8, 0],
  ['sluice', 0, 7, 0],
  ['turret', -4, 13, 0],
  ['sluice', 12, 7, 0],
  ['turret', 4, 13, 0],
  ['sentry_beacon', -6, 8, 0],
  ['sentry_beacon', 6, 8, 0],
  ['sentry_beacon', -7, 13, 0],
  ['sentry_beacon', 7, 13, 0],
  ['sentry_beacon', -5, 18, 0],
  ['sentry_beacon', 5, 18, 0],
  ['sentry_beacon', 0, 22, 0],
  ['sentry_beacon', -12, 12, 0],
  ['sentry_beacon', 12, 12, 0],
  ...[-9, -6, -3, 0, 3, 6, 9].map((x) => ['palisade', x, 19, 1]),
  ...[-9, -6, -3, 0, 3, 6, 9].map((x) => ['palisade', x, 7, 1]),
  ...[9, 12, 15, 18].map((z) => ['palisade', -9, z, 0]),
  ...[9, 12, 15, 18].map((z) => ['palisade', 9, z, 0]),
  ...[-12, -9, -6, -3, 0, 3, 6, 9, 12].map((x) => ['palisade', x, 22, 1]),
  ...[7, 10, 13, 16, 19].flatMap((z) => [
    ['palisade', -12, z, 0],
    ['palisade', 12, z, 0],
  ]),
  ...[-12, -9, -6, -3, 3, 6, 9, 12].map((x) => ['palisade', x, 16, 1]),
];

const upgradeRank = {
  split_spark: 100,
  double_tap_coil: 90,
  tinkers_plating: 80,
  heavy_spark: 75,
  long_resonator: 70,
  beacon_dynamo: 65,
  field_dressing: 60,
  sharpen: 55,
  assay_bonus: 50,
  prospectors_luck: 40,
  pan_legend: 35,
};

const costs = new Map();
const caps = new Map();
const refused = new Set();
let opening = true;
let outcome;

function key(what, x, z) {
  return `${what}:${x}:${z}`;
}

function learn(view) {
  for (const item of view.stablePrefix.mechanics.buildables ?? []) {
    costs.set(item.id, item.costs);
    caps.set(item.id, item.maxCount);
  }
  for (const record of view.now.orders ?? []) {
    if (record.status !== 'failed' || record.order?.verb !== 'BUILD') continue;
    const { what, where } = record.order;
    const buildKey = key(what, where.x, where.z);
    if (!refused.has(buildKey)) process.stderr.write(`${JSON.stringify({ refused: buildKey, reason: record.reason })}\n`);
    refused.add(buildKey);
  }
}

function pickOffer(view) {
  return [...view.now.pendingOffer].sort((a, b) => {
    const hurt = view.now.hero.hp < view.now.hero.maxHp;
    const healA = hurt ? (a.id === 'field_dressing' ? 1_000 : a.id === 'tinkers_plating' ? 900 : 0) : 0;
    const healB = hurt ? (b.id === 'field_dressing' ? 1_000 : b.id === 'tinkers_plating' ? 900 : 0) : 0;
    return Math.max(upgradeRank[b.id] ?? 0, healB) - Math.max(upgradeRank[a.id] ?? 0, healA);
  })[0];
}

function harvestOrders(view, limit = 24) {
  const active = view.now.seams.filter((seam) => seam.active && seam.remaining > 0);
  if (!active.length) return view.now.works.byKind.sluice ? [{ verb: 'HARVEST', sluice: 0 }] : [];
  const byId = new Map(view.stablePrefix.map.seams.map((seam) => [seam.id, seam]));
  const from = view.now.prospector ?? view.stablePrefix.map.claim;
  active.sort((a, b) => {
    const pa = byId.get(a.id);
    const pb = byId.get(b.id);
    return Math.hypot(pa.x - from.x, pa.z - from.z) - Math.hypot(pb.x - from.x, pb.z - from.z);
  });
  return active.flatMap(({ id }) => Array.from({ length: 6 }, () => ({ verb: 'HARVEST', seam: id }))).slice(0, limit);
}

function policy(view) {
  learn(view);
  const existing = new Set(view.now.works.entries
    .map((work) => key(work.id, work.position.x, work.position.z)));
  const countByKind = { ...view.now.works.byKind };
  let gold = view.now.gold;
  const orders = [];

  if (view.now.blastReadyInMs === 0 && view.now.threats.alive >= 10) {
    orders.push({ verb: 'BLAST_AT', pos: { x: view.now.hero.x, z: view.now.hero.z } });
  }

  if (view.now.wave >= 14 && gold >= 150) {
    const turret = view.now.works.entries.find((work) => work.id === 'turret' && !work.wrecked && work.tier === 1);
    if (turret) {
      orders.push(
        { verb: 'MOVE_TO', pos: turret.position },
        { verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: turret.index } },
      );
      gold -= 150;
    }
  }

  for (const [what, x, z, rotationSteps] of buildPlan) {
    const buildKey = key(what, x, z);
    if (existing.has(buildKey) || refused.has(buildKey)) continue;
    if ((countByKind[what] ?? 0) >= (caps.get(what) ?? Infinity)) continue;
    const curve = costs.get(what) ?? [];
    const cost = curve[Math.min(countByKind[what] ?? 0, curve.length - 1)] ?? 1_000_000;
    if (cost > gold || orders.length > 26) break;
    orders.push(
      { verb: 'MOVE_TO', pos: { x, z } },
      { verb: 'BUILD', what, where: { x, z }, when: { goldGte: cost }, rotationSteps },
    );
    gold -= cost;
    countByKind[what] = (countByKind[what] ?? 0) + 1;
  }

  if (view.now.wave >= 10 && gold >= 40) orders.push({ verb: 'REPAIR_UNDER', pct: 55 });
  orders.push(...harvestOrders(view, 31 - orders.length));
  if (orders.length < 32) orders.push({ verb: 'HOLD', pos: view.stablePrefix.map.claim });
  return orders.slice(0, 32);
}

function ordersFor(view) {
  if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const orders = policy(view);
  if (view.now.pendingOffer?.length) {
    const picked = pickOffer(view);
    process.stderr.write(`${JSON.stringify({ offer: view.now.pendingOffer.map(({ id }) => id), picked: picked.id, heroHp: view.now.hero.hp })}\n`);
    orders.unshift({ verb: 'PICK_UPGRADE', id: picked.id });
  }
  return orders.slice(0, 32);
}

const stdout = createInterface({ input: sim.stdout, crlfDelay: Infinity });
stdout.on('line', (line) => {
  const message = JSON.parse(line);
  if (message.schema !== 'goldrush.view.v1') {
    outcome = message;
    process.stdout.write(`${JSON.stringify(message)}\n`);
    return;
  }
  const summary = {
    wave: message.now.wave,
    gold: message.now.gold,
    heroHp: message.now.hero.hp,
    worksHp: message.now.works.hp,
    works: message.now.works.byKind,
    threats: message.now.threats.alive,
    needsRider: message.now.needsRider,
  };
  process.stderr.write(`${JSON.stringify(summary)}\n`);
  if (message.now.hero.hp <= 0 || message.appendLog.at(-1)?.outcome === 'secured') return;
  if (opening) {
    learn(message);
    const first = ['gold-seam-2', 'gold-seam-4', 'gold-seam-3']
      .flatMap((seam) => Array.from({ length: 6 }, () => ({ verb: 'HARVEST', seam })));
    sim.stdin.write(`${JSON.stringify([
      ...first,
      { verb: 'MOVE_TO', pos: message.stablePrefix.map.claim },
      ...buildPlan.slice(0, 5).map(([what, x, z, rotationSteps]) => ({
        verb: 'BUILD', what, where: { x, z }, when: { goldGte: what === 'turret' ? 50 : 10 }, rotationSteps,
      })),
      { verb: 'HOLD', pos: message.stablePrefix.map.claim },
    ])}\n`);
    opening = false;
    return;
  }
  sim.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
});

sim.stderr.pipe(process.stderr);
sim.on('error', (error) => {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
});
sim.on('close', (code) => {
  if (!outcome && code) process.exitCode = code;
});
