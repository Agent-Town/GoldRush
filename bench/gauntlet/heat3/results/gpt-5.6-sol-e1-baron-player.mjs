#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const sim = spawn(process.execPath, [
  'scripts/gr-sim.mjs',
  '--contract', 'e1-baron',
  '--seed', 'e1-baron-01',
], { stdio: ['pipe', 'pipe', 'pipe'] });

sim.stderr.pipe(process.stderr);

const rejected = new Set();
let lastWave = -1;
let outcome;
let wakeups = 0;

for await (const line of createInterface({ input: sim.stdout })) {
  const message = JSON.parse(line);
  if (message.schema !== 'goldrush.view.v1') {
    outcome = message;
    continue;
  }

  rememberFailures(message.now.orders);
  if (message.now.wave !== lastWave) {
    lastWave = message.now.wave;
    const { hero, works } = message.now;
    const tiers = works.entries.filter((work) => work.tier > 1).map((work) => `${work.id}:${work.tier}`).join(',') || '-';
    process.stderr.write(`wave ${lastWave}: ${hero.hp}/${hero.maxHp} HP, ${works.hp}/${works.maxHp} works ${JSON.stringify(works.byKind)}, tiers ${tiers}, ${message.now.gold}g, ${message.now.threats.alive} threats\n`);
  }
  if (message.now.hero.hp <= 0) {
    process.stderr.write(`terminal: ${JSON.stringify({ hero: message.now.hero, works: message.now.works, threats: message.now.threats })}\n`);
  }
  sim.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
}

const code = await new Promise((resolve) => sim.once('close', resolve));
if (code !== 0 || !outcome) process.exit(code || 1);
process.stdout.write(`${JSON.stringify(outcome)}\n`);

function ordersFor(view) {
  const { now } = view;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  const claim = view.stablePrefix.map.claim;
  const offer = now.pendingOffer;
  if (offer) orders.push({ verb: 'PICK_UPGRADE', id: chooseUpgrade(offer, now.hero) });
  if (now.blastReadyInMs === 0 && now.threats.alive > 0) {
    orders.push({ verb: 'BLAST_AT', pos: blastTarget(now, claim) });
  }

  const primary = primaryPlan(claim);
  queueFundedBuilds(orders, view, primary, 7);
  const primaryDone = planComplete(now.works.entries, primary);
  const secondary = secondaryPlan(claim);
  if (primaryDone && now.wave < 14) queueTurretUpgrade(orders, now, 2);
  if (primaryDone && now.wave >= 14) queueFundedBuilds(orders, view, secondary, 7);

  const secondaryDone = planComplete(now.works.entries, secondary);
  if (primaryDone && secondaryDone) {
    if (!queueBarrierUpgrade(orders, now, claim, 2)) {
      const turretsT2 = now.works.entries.filter((work) => work.id === 'turret' && !work.wrecked && work.tier >= 2).length === 4;
      if (!turretsT2) queueTurretUpgrade(orders, now, 2);
      else if (!queueBarrierUpgrade(orders, now, claim, 3)) queueTurretUpgrade(orders, now, 3);
    }
  }

  queueHarvest(orders, view);
  if (orders.length === 0) orders.push({ verb: 'HOLD', pos: claim });
  return orders.slice(0, 32);
}

function primaryPlan({ x, z }) {
  const turret = (dx, dz) => ({ what: 'turret', x: x + dx, z: z + dz });
  const sluice = (dx) => ({ what: 'sluice', x: x + dx, z: 7 });
  const beacon = (dx, dz) => ({ what: 'sentry_beacon', x: x + dx, z: z + dz });
  const wall = (dx, dz) => ({ what: 'palisade', x: x + dx, z: z + dz, rotationSteps: 0 });
  return [
    turret(-6, 2),
    wall(-12, 2), wall(12, 2),
    sluice(-20), sluice(-16), sluice(-12),
    turret(6, 2), turret(-5, 6), turret(5, 6),
    beacon(-9, 2), beacon(9, 2), beacon(0, 3), beacon(-8, 7), beacon(8, 7), beacon(0, 9),
    { what: 'stockpile', x, z: z + 6 },
  ];
}

function secondaryPlan({ x, z }) {
  const wall = (dx, dz, rotationSteps) => ({ what: 'palisade', x: x + dx, z: z + dz, rotationSteps });
  const across = [1.5, -1.5, 4.5, -4.5, 7.5, -7.5, 10.5, -10.5];
  return [-5, -3, -1].flatMap((dz) => across.map((dx) => wall(dx, dz, 1)));
}

function queueFundedBuilds(orders, view, plan, limit) {
  const entries = view.now.works.entries;
  const costs = new Map(view.stablePrefix.mechanics.buildables.map((def) => [def.id, def.costs]));
  const counts = new Map();
  for (const work of entries) counts.set(work.id, (counts.get(work.id) ?? 0) + 1);

  let gold = view.now.gold;
  let queued = 0;
  for (const item of plan) {
    if (hasWork(entries, item) || rejected.has(key(item))) continue;
    const familyCosts = costs.get(item.what) ?? [];
    const count = counts.get(item.what) ?? 0;
    const cost = familyCosts[Math.min(count, familyCosts.length - 1)];
    if (!Number.isFinite(cost) || gold < cost || queued >= limit || orders.length > 29) break;
    const pos = { x: item.x, z: item.z };
    orders.push(
      { verb: 'MOVE_TO', pos },
      {
        verb: 'BUILD',
        what: item.what,
        where: pos,
        when: { goldGte: cost },
        ...(item.rotationSteps === undefined ? {} : { rotationSteps: item.rotationSteps }),
      },
    );
    gold -= cost;
    counts.set(item.what, count + 1);
    queued += 1;
  }
}

function queueTurretUpgrade(orders, now, tier) {
  const cost = tier === 2 ? 150 : 300;
  const turret = now.works.entries.find((work) => work.id === 'turret' && !work.wrecked && work.tier === tier - 1);
  if (!turret) return;
  if (now.gold < cost) return queueWakeup(orders, cost);
  if (orders.length > 29) return;
  orders.push(
    { verb: 'MOVE_TO', pos: turret.position },
    { verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: turret.index } },
  );
}

function queueBarrierUpgrade(orders, now, claim, tier) {
  for (const dz of [-5, -3, -1]) {
    const wall = now.works.entries.find((work) => work.id === 'palisade' && !work.wrecked
      && distance(work.position, { x: claim.x + 1.5, z: claim.z + dz }) < 0.6 && work.tier === tier - 1);
    if (!wall) continue;
    const cost = tier === 2 ? 90 : 250;
    if (now.gold < cost) {
      queueWakeup(orders, cost);
      return true;
    }
    if (orders.length > 29) return true;
    orders.push(
      { verb: 'MOVE_TO', pos: wall.position },
      { verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'palisade', index: wall.index } },
    );
    return true;
  }
  return false;
}

function queueWakeup(orders, goldGte) {
  if (orders.length > 30) return;
  wakeups += 1;
  orders.push({
    verb: 'BUILD',
    what: 'palisade',
    where: { x: 1_000 + wakeups, z: 1_000 },
    when: { goldGte },
  });
}

function queueHarvest(orders, view) {
  if (view.now.wave >= 20 || orders.length >= 32) return;
  const positions = new Map(view.stablePrefix.map.seams.map((seam) => [seam.id, seam]));
  const from = view.now.prospector ?? view.stablePrefix.map.claim;
  const seams = view.now.seams
    .filter((seam) => seam.active && seam.remaining > 0)
    .sort((a, b) => distance(from, positions.get(a.id)) - distance(from, positions.get(b.id)));
  for (const seam of seams) {
    const repeats = Math.max(1, Math.ceil(seam.remaining / 5));
    for (let count = 0; count < repeats && orders.length < 32; count += 1) {
      orders.push({ verb: 'HARVEST', seam: seam.id });
    }
  }
}

function chooseUpgrade(offer, hero) {
  const score = {
    split_spark: 100,
    double_tap_coil: 95,
    heavy_spark: 90,
    long_resonator: 85,
    tinkers_plating: hero.hp < hero.maxHp ? 92 : 75,
    powder_charge: 72,
    quick_fuse: 70,
    beacon_dynamo: 68,
    field_dressing: hero.hp < hero.maxHp * 0.7 ? 110 : hero.hp < hero.maxHp ? 80 : 25,
    sharpen: 65,
    wide_ring: 55,
    spring_heels: 45,
    pan_legend: 35,
    prospectors_luck: 30,
    assay_bonus: 20,
  };
  return offer.toSorted((a, b) => (score[b.id] ?? 40) - (score[a.id] ?? 40))[0].id;
}

function blastTarget(now, claim) {
  if (now.wave >= 20) return { x: claim.x, z: claim.z - 4 };
  const target = { x: claim.x, z: claim.z };
  const edge = now.threats.edge;
  if (edge === 'north') target.z -= 8;
  else if (edge === 'south') target.z += 8;
  else if (edge === 'east') target.x += 8;
  else if (edge === 'west') target.x -= 8;
  const dx = target.x - now.hero.x;
  const dz = target.z - now.hero.z;
  const length = Math.hypot(dx, dz) || 1;
  const scale = Math.min(1, 9.5 / length);
  return { x: now.hero.x + dx * scale, z: now.hero.z + dz * scale };
}

function rememberFailures(records) {
  for (const record of records) {
    if (record.status !== 'failed' || record.order?.verb !== 'BUILD') continue;
    if (/out_of_zone|collision|cap_reached/i.test(record.reason ?? '')) {
      const item = {
        what: record.order.what,
        x: record.order.where.x,
        z: record.order.where.z,
        rotationSteps: record.order.rotationSteps,
      };
      if (!rejected.has(key(item))) {
        rejected.add(key(item));
        process.stderr.write(`suppressed ${key(item)}: ${record.reason}\n`);
      }
    }
  }
}

function planComplete(entries, plan) {
  return plan.every((item) => rejected.has(key(item)) || hasWork(entries, item));
}

function hasWork(entries, item) {
  return entries.some((work) => work.id === item.what && distance(work.position, item) < 0.6);
}

function key(item) {
  return `${item.what}:${item.x}:${item.z}:${item.rotationSteps ?? 0}`;
}

function distance(a, b) {
  return b ? Math.hypot(a.x - b.x, a.z - b.z) : Infinity;
}
