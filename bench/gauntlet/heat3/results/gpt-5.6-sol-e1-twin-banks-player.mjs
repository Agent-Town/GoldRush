#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const child = spawn(process.execPath, [
  'scripts/gr-sim.mjs',
  '--contract', 'e1-twin-banks',
  '--seed', 'e1-twin-banks-01',
], { stdio: ['pipe', 'pipe', 'inherit'] });
const closed = new Promise((resolve) => child.once('close', resolve));

const failed = new Set();
let plan;
let outcome;

for await (const line of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
  const message = JSON.parse(line);
  if (message.schema !== 'goldrush.view.v1') {
    outcome = message;
    continue;
  }

  const { now } = message;
  if (!plan) plan = buildPlan(message.stablePrefix.map.claim);
  rememberFailures(now.orders);
  process.stderr.write(`${summary(now)}\n`);

  if (now.pendingSecure) {
    child.stdin.write(`${JSON.stringify([{ verb: 'SECURE_CHOICE', choice: 'bank' }])}\n`);
  } else if (now.pendingOffer) {
    const pick = chooseUpgrade(now.pendingOffer, now.hero);
    child.stdin.write(`${JSON.stringify([{ verb: 'PICK_UPGRADE', id: pick.id }])}\n`);
  } else if (!terminal(message)) {
    child.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
  }
}

const code = await closed;
if (code !== 0 || !outcome) process.exit(code || 1);
process.stdout.write(`${JSON.stringify(outcome)}\n`);

function buildPlan(claim) {
  const at = (x, z) => ({ x: claim.x + x, z: claim.z + z });
  const build = (what, x, z) => ({ what, where: at(x, z) });
  const openingWalls = [
    [-6, 4], [-3, 4], [3, 4], [6, 4], [-6, -6], [6, -6],
  ];
  const outerWalls = [
    ...[-12, -9, -6, -3, 3, 6, 9, 12].map((x) => [x, 4]),
    ...[-15, -12, -9, -6, -3, 0, 3, 6, 9, 12, 15].map((x) => [x, -10]),
    ...[-7, -4, -1, 2].flatMap((z) => [[-17, z], [17, z]]),
    ...[-12, -5, 0, 5, 12].map((x) => [x, -6]),
    ...[-9, -6, -3, 0, 3, 6, 9].map((x) => [x, -13]),
  ];

  return [
    build('turret', -3, 1),
    ...openingWalls.map(([x, z]) => build('palisade', x, z)),
    build('sluice', -16, 5), build('sluice', 16, 5), build('sluice', 0, 5),
    build('turret', 3, 1), build('turret', -3, -3), build('turret', 3, -3),
    build('sentry_beacon', -8, 0), build('sentry_beacon', 8, 0),
    build('sentry_beacon', -8, -5), build('sentry_beacon', 8, -5),
    build('sentry_beacon', -13, -2), build('sentry_beacon', 13, -2),
    ...outerWalls.map(([x, z]) => build('palisade', x, z)),
  ];
}

function ordersFor(view) {
  const { now, stablePrefix } = view;
  const built = now.works.entries;
  const counts = { ...now.works.byKind };
  const costs = Object.fromEntries((stablePrefix.mechanics.buildables ?? []).map((item) => [item.id, item.costs]));
  const pending = plan.filter(({ what, where }) =>
    !failed.has(key(what, where)) && !built.some((entry) => entry.id === what && distance(entry.position, where) < 0.6));
  const orders = now.weapon === 'rig' ? [] : [{ verb: 'SET_WEAPON', weapon: 'rig' }];
  let budget = now.gold;
  let queued = 0;

  for (const item of pending) {
    const index = counts[item.what] ?? 0;
    const curve = costs[item.what] ?? [];
    const cost = curve[index] ?? curve.at(-1) ?? Number.POSITIVE_INFINITY;
    if (queued === 4 || cost > budget) break;
    orders.push(
      { verb: 'MOVE_TO', pos: item.where },
      { verb: 'BUILD', what: item.what, where: item.where, when: { goldGte: cost } },
    );
    budget -= cost;
    counts[item.what] = index + 1;
    queued += 1;
  }

  if (now.blastReadyInMs === 0 && now.threats.alive >= 8) {
    orders.push({ verb: 'BLAST_AT', pos: stablePrefix.map.claim });
  }
  if ((now.works.byKind.turret ?? 0) === 4 && (now.works.byKind.sentry_beacon ?? 0) === 6) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 35 });
  }

  const seams = new Map(stablePrefix.map.seams.map((seam) => [seam.id, seam]));
  const active = now.seams
    .filter((seam) => seam.active && seam.remaining > 0 && seams.has(seam.id))
    .sort((a, b) => distance(now.prospector ?? stablePrefix.map.claim, seams.get(a.id))
      - distance(now.prospector ?? stablePrefix.map.claim, seams.get(b.id)));
  for (const seam of active) {
    for (let pans = Math.ceil(seam.remaining / 5); pans > 0 && orders.length < 31; pans -= 1) {
      orders.push({ verb: 'HARVEST', seam: seam.id });
    }
  }
  orders.push({ verb: 'HOLD', pos: stablePrefix.map.claim });
  return orders;
}

function chooseUpgrade(offer, hero) {
  const priorities = hero.hp < hero.maxHp * 0.72
    ? ['field_dressing', 'tinkers_plating', 'split_spark', 'double_tap_coil', 'heavy_spark', 'long_resonator']
    : ['split_spark', 'double_tap_coil', 'heavy_spark', 'tinkers_plating', 'long_resonator', 'field_dressing'];
  return [...offer].sort((a, b) => rank(a.id, priorities) - rank(b.id, priorities))[0];
}

function rank(id, priorities) {
  const index = priorities.indexOf(id);
  return index < 0 ? priorities.length : index;
}

function rememberFailures(orders = []) {
  for (const record of orders) {
    if (record.status === 'failed' && record.order?.verb === 'BUILD') {
      failed.add(key(record.order.what, record.order.where));
      process.stderr.write(`failed ${record.order.what}@${record.order.where.x},${record.order.where.z}: ${record.reason}\n`);
    }
  }
}

function summary(now) {
  const kinds = Object.entries(now.works.byKind).map(([id, count]) => `${id}:${count}`).join(',');
  return `w${now.wave} t${now.timers.runSeconds}s hp=${now.hero.hp}/${now.hero.maxHp} gold=${now.gold} threats=${now.threats.alive} works=${now.works.hp}/${now.works.maxHp} [${kinds}]`;
}

function terminal(view) {
  const last = view.appendLog.at(-1)?.outcome;
  return view.now.hero.hp <= 0 || last === 'rider-down' || last === 'secured';
}

function key(what, where) {
  return `${what}:${where.x},${where.z}`;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}
