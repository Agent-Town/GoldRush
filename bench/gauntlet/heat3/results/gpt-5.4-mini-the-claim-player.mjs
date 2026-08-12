#!/usr/bin/env node

import assert from 'node:assert/strict';
import { createInterface } from 'node:readline';

const HOME = { x: 0, z: 12 };
const ORDERS = [
  { verb: 'MOVE_TO', pos: { x: -9, z: 6.7 } },
  { verb: 'HARVEST', seam: 'gold-seam-2' },
  { verb: 'MOVE_TO', pos: HOME },
  { verb: 'BUILD', what: 'palisade', where: { x: -2, z: 12 }, when: { goldGte: 5 } },
  { verb: 'BUILD', what: 'palisade', where: { x: 2, z: 12 }, when: { goldGte: 5 } },
  { verb: 'BUILD', what: 'palisade', where: { x: -2, z: 14 }, when: { goldGte: 5 } },
  { verb: 'BUILD', what: 'palisade', where: { x: 2, z: 14 }, when: { goldGte: 5 } },
  { verb: 'BUILD', what: 'sentry_beacon', where: { x: 1, z: 11 }, when: { goldGte: 15 } },
  { verb: 'BUILD', what: 'turret', where: { x: 2, z: 10 }, when: { goldGte: 50 } },
  { verb: 'BUILD', what: 'turret', where: { x: -2, z: 10 }, when: { goldGte: 70 } },
  { verb: 'FALLBACK_IF', threat: { enemiesGte: 3 }, pos: { x: 0, z: 14 } },
];

function ordersFor(view) {
  const now = view?.view?.now ?? view?.now;
  if (!now) return null;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  return ORDERS;
}

if (process.env.CHECK_PLAYER === '1') {
  assert.equal(ordersFor({ view: { now: { pendingSecure: true } } })[0].verb, 'SECURE_CHOICE');
  assert.equal(ordersFor({ view: { now: {} } }).length, ORDERS.length);
  process.exit(0);
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on('line', (line) => {
  if (!line.trim()) return;
  let view;
  try {
    view = JSON.parse(line);
  } catch {
    return;
  }
  const orders = ordersFor(view);
  if (orders) process.stdout.write(`${JSON.stringify(orders)}\n`);
});
