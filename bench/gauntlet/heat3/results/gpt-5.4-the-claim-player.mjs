#!/usr/bin/env node

import readline from 'node:readline';

const UPGRADE_PREFERENCE = [
  'split_spark',
  'heavy_spark',
  'double_tap_coil',
  'chain_spark_arc',
  'long_resonator',
  'tinkers_plating',
  'field_dressing',
  'beacon_dynamo',
  'beacon_handoff',
  'sharpen',
  'powder_charge',
  'wide_ring',
  'quick_fuse',
  'prospectors_luck',
  'rich_seam_pact',
  'pan_legend',
  'auto_pan',
  'assay_bonus',
  'spring_heels',
];

const PLAN = [
  { kind: 'build', order: { verb: 'BUILD', what: 'palisade', where: { x: -2, z: 12 }, when: { goldGte: 10 } } },
  { kind: 'build', order: { verb: 'BUILD', what: 'palisade', where: { x: 2, z: 12 }, when: { goldGte: 10 } } },
  { kind: 'build', order: { verb: 'BUILD', what: 'palisade', where: { x: -2, z: 14 }, when: { goldGte: 10 } } },
  { kind: 'build', order: { verb: 'BUILD', what: 'palisade', where: { x: 2, z: 14 }, when: { goldGte: 10 } } },
  { kind: 'build', order: { verb: 'BUILD', what: 'sentry_beacon', where: { x: 1, z: 11 }, when: { goldGte: 25 } } },
  { kind: 'build', order: { verb: 'BUILD', what: 'turret', where: { x: 2, z: 10 }, when: { goldGte: 50 } } },
  { kind: 'build', order: { verb: 'BUILD', what: 'turret', where: { x: -2, z: 10 }, when: { goldGte: 70 } } },
  { kind: 'persistent', order: { verb: 'REPAIR_UNDER', pct: 60 } },
  { kind: 'persistent', order: { verb: 'FALLBACK_IF', threat: { enemiesGte: 1 }, pos: { x: 0, z: 12 } } },
  { kind: 'harvest', order: { verb: 'HARVEST', seam: 'gold-seam-2' } },
  { kind: 'harvest', order: { verb: 'HARVEST', seam: 'gold-seam-1' } },
  { kind: 'persistent', order: { verb: 'HOLD', pos: { x: 0, z: 12 } } },
];

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

rl.on('line', (line) => {
  if (!line.trim()) return;

  let view;
  try {
    view = JSON.parse(line);
  } catch {
    process.stdout.write('[]\n');
    return;
  }

  const orders = nextOrders(view);
  process.stdout.write(`${JSON.stringify(orders)}\n`);
});

function nextOrders(view) {
  const active = new Map();
  for (const entry of view.now?.orders ?? []) active.set(orderKey(entry.order), entry.status);

  if (view.now?.pendingSecure) {
    return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  }

  const orders = [];
  const upgradeId = pickUpgrade(view.now?.pendingOffer);
  if (upgradeId) orders.push({ verb: 'PICK_UPGRADE', id: upgradeId });

  for (const item of PLAN) {
    if (item.kind === 'persistent') {
      orders.push(item.order);
      continue;
    }
    const status = active.get(orderKey(item.order));
    if (status === 'done' || status === 'failed') continue;
    orders.push(item.order);
  }
  return orders;
}

function pickUpgrade(offer) {
  if (!Array.isArray(offer) || offer.length === 0) return null;
  for (const id of UPGRADE_PREFERENCE) {
    if (offer.some((entry) => entry?.id === id)) return id;
  }
  return offer[0]?.id ?? null;
}

function orderKey(order) {
  return JSON.stringify(order);
}
