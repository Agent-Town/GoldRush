#!/usr/bin/env node

import { createInterface } from 'node:readline';

const CLAIM_POS = { x: 0, z: 12 };
const EPSILON = 1;

const BUILD_PLAN = [
  { id: 't1', what: 'turret', where: { x: -8, z: 7 } },
  { id: 't2', what: 'turret', where: { x: -2, z: -7 } },
  { id: 't3', what: 'turret', where: { x: 7, z: 7 } },
  { id: 't4', what: 'turret', where: { x: 4, z: 12 } },
  { id: 'b1', what: 'sentry_beacon', where: { x: -4, z: 8 } },
  { id: 'b2', what: 'sentry_beacon', where: { x: -3, z: -5 } },
  { id: 'b3', what: 'sentry_beacon', where: { x: 8, z: 4 } },
  { id: 'p1', what: 'palisade', where: { x: -4, z: 1 } },
  { id: 'b4', what: 'sentry_beacon', where: { x: 0, z: 16 } },
  { id: 'p2', what: 'palisade', where: { x: 0, z: -2 } },
  { id: 'p3', what: 'palisade', where: { x: 3, z: 1 } },
  { id: 'b5', what: 'sentry_beacon', where: { x: 2, z: 14 } },
];

const blockedSteps = new Set();
let lastAttemptedBuildId = null;
const UPGRADE_PRIORITY = [
  'heavy_spark',
  'double_tap_coil',
  'split_spark',
  'quick_fuse',
  'long_resonator',
  'tinkers_plating',
  'powder_charge',
  'beacon_dynamo',
  'spring_heels',
  'prospectors_luck',
  'pan_legend',
];

function distance(a, b) {
  return Math.hypot((a.x ?? a.position?.x ?? 0) - (b.x ?? b.position?.x ?? 0), (a.z ?? a.position?.z ?? 0) - (b.z ?? b.position?.z ?? 0));
}

function buildableMap(view) {
  return new Map((view.stablePrefix?.mechanics?.buildables ?? []).map((entry) => [entry.id, entry]));
}

function builtCounts(view) {
  const counts = Object.create(null);
  for (const entry of view.now?.works?.entries ?? []) counts[entry.id] = (counts[entry.id] ?? 0) + 1;
  return counts;
}

function isBuilt(view, step) {
  return (view.now?.works?.entries ?? []).some((entry) => entry.id === step.what && distance(entry.position, step.where) <= EPSILON);
}

function nextBuildCost(view, step, counts, byId) {
  const entry = byId.get(step.what);
  const costs = entry?.costs ?? (typeof entry?.cost === 'number' ? [entry.cost] : []);
  const built = counts[step.what] ?? 0;
  if (costs.length === 0) return Number.POSITIVE_INFINITY;
  return costs[Math.min(built, costs.length - 1)];
}

function markBlockedFromFailures(view) {
  if (!lastAttemptedBuildId) return;
  for (const order of view.now?.orders ?? []) {
    if (order.order?.verb !== 'BUILD') continue;
    if (order.status !== 'failed') continue;
    if (order.reason?.includes('insufficient_gold')) continue;
    const step = BUILD_PLAN.find((candidate) => candidate.id === lastAttemptedBuildId);
    if (!step) return;
    if (order.order.what !== step.what) continue;
    if (distance(order.order.where, step.where) > EPSILON) continue;
    blockedSteps.add(step.id);
    lastAttemptedBuildId = null;
    return;
  }
}

function normalizeOffer(offer) {
  if (typeof offer === 'string') return { id: offer };
  if (offer && typeof offer === 'object' && typeof offer.id === 'string') return offer;
  return null;
}

function chooseUpgrade(view) {
  const offers = (view.now?.pendingOffer ?? []).map(normalizeOffer).filter(Boolean);
  if (offers.length === 0) return null;
  offers.sort((a, b) => {
    const ai = UPGRADE_PRIORITY.indexOf(a.id);
    const bi = UPGRADE_PRIORITY.indexOf(b.id);
    const ar = ai === -1 ? UPGRADE_PRIORITY.length : ai;
    const br = bi === -1 ? UPGRADE_PRIORITY.length : bi;
    return ar - br;
  });
  return offers[0].id;
}

function chooseBuild(view) {
  const byId = buildableMap(view);
  const counts = builtCounts(view);
  for (const step of BUILD_PLAN) {
    if (blockedSteps.has(step.id)) continue;
    if (isBuilt(view, step)) continue;
    const cost = nextBuildCost(view, step, counts, byId);
    if (view.now.gold < cost) return null;
    return { ...step, cost };
  }
  return null;
}

function harvestOrders(view) {
  const active = (view.now?.seams ?? []).filter((seam) => seam.active && seam.remaining > 0);
  const builtTotal = (view.now?.works?.entries ?? []).length;
  const perSeam = builtTotal === 0 ? 4 : active.length === 1 ? 6 : 3;
  const orders = [];
  for (const seam of active) {
    for (let i = 0; i < perSeam; i += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
  }
  return orders;
}

function ordersFor(view) {
  markBlockedFromFailures(view);

  const upgradeId = chooseUpgrade(view);
  if (upgradeId) return [{ verb: 'PICK_UPGRADE', id: upgradeId }];
  if (view.now?.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  const build = chooseBuild(view);
  if (build) {
    lastAttemptedBuildId = build.id;
    orders.push({ verb: 'MOVE_TO', pos: build.where });
    orders.push({ verb: 'BUILD', what: build.what, where: build.where, when: { goldGte: build.cost } });
  } else {
    lastAttemptedBuildId = null;
  }

  orders.push({ verb: 'REPAIR_UNDER', pct: 50 });
  orders.push(...harvestOrders(view));
  orders.push({ verb: 'HOLD', pos: CLAIM_POS });
  return orders.slice(0, 32);
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on('line', (line) => {
  if (!line.trim()) {
    process.stdout.write('[]\n');
    return;
  }

  let payload;
  try {
    payload = JSON.parse(line);
  } catch {
    process.stdout.write('[]\n');
    return;
  }

  if (payload?.schema !== 'goldrush.view.v1') return;
  process.stdout.write(`${JSON.stringify(ordersFor(payload))}\n`);
});
