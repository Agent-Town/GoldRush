#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const child = spawn(process.execPath, [
  'scripts/gr-sim.mjs',
  '--contract', 'e1-dry-gulch',
  '--seed', 'e1-dry-gulch-01',
], { cwd: HERE, stdio: ['pipe', 'pipe', 'pipe'] });

child.stderr.pipe(process.stderr);
const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
let finalOutcome = null;

for await (const line of lines) {
  if (!line.trim()) continue;
  const message = JSON.parse(line);
  if (message.schema === 'goldrush.view.v1') {
    const orders = chooseOrders(message);
    process.stderr.write(`${decisionLine(message, orders)}\n`);
    child.stdin.write(`${JSON.stringify(orders)}\n`);
  } else {
    finalOutcome = message;
    process.stdout.write(`${JSON.stringify(message)}\n`);
  }
}

const exitCode = await new Promise((done) => child.once('close', done));
if (exitCode !== 0) process.exitCode = exitCode ?? 1;
if (!finalOutcome && !process.exitCode) throw new Error('gr-sim ended without an outcome.');

function chooseOrders(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (now.pendingOffer?.length) {
    orders.push({ verb: 'PICK_UPGRADE', id: chooseUpgrade(now.pendingOffer, now) });
  }
  const desiredWeapon = now.wave >= 4 ? 'blast' : 'rig';
  if (now.weapon !== desiredWeapon) orders.push({ verb: 'SET_WEAPON', weapon: desiredWeapon });
  if (desiredWeapon === 'rig' && now.threats.alive > 0 && now.blastReadyInMs === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: now.hero.x, z: now.hero.z } });
  }

  const mechanics = new Map((view.stablePrefix.mechanics.buildables ?? []).map((entry) => [entry.id, entry]));
  const entries = (now.works.entries ?? []).map((entry) => ({ ...entry, position: { ...entry.position } }));
  const virtual = entries.map((entry) => ({ ...entry, position: { ...entry.position } }));
  let gold = now.gold;

  // Spend the money already in hand before panning so the bank cannot cap the next seam.
  gold = queueStrictBuildPlan(orders, virtual, mechanics, gold);

  // Every HARVEST action completes one deterministic pan tick. Dry Gulch yields 7g
  // per full tick (5g x 1.4), with a smaller final tick. Interleave each seam with
  // local defense: the wave-0 opening cannot afford to finish a county-wide tour
  // before returning to protect the stationary hero.
  const cap = 200 + (now.works.byKind?.stockpile ?? 0) * 150;
  let projected = gold;
  const seamPoints = new Map(view.stablePrefix.map.seams.map((entry) => [entry.id, entry]));
  let cursor = now.prospector ?? now.hero;
  const activeSeams = [...now.seams].filter((entry) => entry.active);
  activeSeams.sort((a, b) => distance(cursor, seamPoints.get(a.id) ?? cursor) - distance(cursor, seamPoints.get(b.id) ?? cursor) || a.id.localeCompare(b.id));
  for (const seam of activeSeams) {
    let remaining = seam.remaining;
    let room = Math.max(0, cap - projected);
    while (remaining > 0 && orders.length < 24) {
      const gain = Math.min(7, remaining);
      if (room + 1e-9 < gain) break;
      orders.push({ verb: 'HARVEST', seam: seam.id });
      remaining -= gain;
      projected += gain;
      room -= gain;
    }
    cursor = seamPoints.get(seam.id) ?? cursor;
    projected = queueStrictBuildPlan(orders, virtual, mechanics, projected);
  }

  // Repairs run only after all planned spending, so their variable price cannot make
  // a defense build fail. Multiple entries let several damaged works be restored.
  while (orders.length < 31 && orders.filter((order) => order.verb === 'REPAIR_UNDER').length < 4) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 78 });
  }
  return orders.slice(0, 32);
}

function queueStrictBuildPlan(orders, virtual, mechanics, startingGold) {
  let gold = startingGold;
  const blockedIds = new Set();
  while (orders.length <= 29) {
    const next = nextStrictBuild(virtual, mechanics, blockedIds);
    if (!next || next.cost > gold) break;
    const where = chooseBuildPosition(next.id, virtual);
    if (!where) {
      blockedIds.add(next.id);
      continue;
    }
    orders.push({ verb: 'MOVE_TO', pos: where });
    orders.push({ verb: 'BUILD', what: next.id, where, when: { goldGte: next.cost }, ...(next.rotationSteps === undefined ? {} : { rotationSteps: next.rotationSteps }) });
    gold -= next.cost;
    virtual.push({ id: next.id, index: virtual.filter((entry) => entry.id === next.id).length, tier: 1, hp: 1, maxHp: 1, wrecked: false, position: where });
  }
  return gold;
}

function nextStrictBuild(works, mechanics, blockedIds = new Set()) {
  const priorities = [
    ['sentry_beacon', 1],
    ['palisade', 6],
    ['turret', 4],
    ['sentry_beacon', 3],
    ['palisade', 8],
    ['sentry_beacon', 6],
  ];
  for (const [id, desired] of priorities) {
    if (blockedIds.has(id)) continue;
    const rule = mechanics.get(id);
    if (!rule) continue;
    const count = works.filter((entry) => entry.id === id).length;
    if (count >= Math.min(desired, rule.maxCount)) continue;
    const cost = rule.costs?.[count] ?? rule.cost;
    return { id, cost, rotationSteps: id === 'palisade' ? count % 2 : undefined };
  }
  return null;
}

function chooseBuildPosition(id, works) {
  const candidates = id === 'sluice'
    ? [
        { x: -18, z: -15 }, { x: -15, z: -18 }, { x: -21, z: -18 },
      ]
    : id === 'turret'
      ? [
          { x: -2, z: 10 }, { x: 2, z: 10 }, { x: -2, z: 14 }, { x: 2, z: 14 },
          { x: -3, z: 9 }, { x: 3, z: 9 }, { x: -3, z: 15 }, { x: 3, z: 15 },
        ]
      : id === 'sentry_beacon'
        ? [
            { x: 0, z: 12 }, { x: 0, z: 9 }, { x: 0, z: 15 }, { x: 3, z: 12 }, { x: -3, z: 12 },
            { x: 3, z: 9 }, { x: -3, z: 9 }, { x: 3, z: 15 }, { x: -3, z: 15 },
            { x: 5, z: 12 }, { x: -5, z: 12 },
          ]
        : [
            { x: 0, z: 7 }, { x: 0, z: 17 }, { x: -5, z: 12 }, { x: 5, z: 12 },
            { x: -4, z: 8 }, { x: 4, z: 8 }, { x: -4, z: 16 }, { x: 4, z: 16 },
            { x: -6, z: 10 }, { x: 6, z: 10 }, { x: -6, z: 14 }, { x: 6, z: 14 },
            { x: -2, z: 7 }, { x: 2, z: 7 }, { x: -2, z: 17 }, { x: 2, z: 17 },
          ];
  const minimum = id === 'sluice' ? 3.7 : id === 'palisade' ? 2.4 : 1.75;
  return candidates.find((point) => works.every((work) => distance(point, work.position) >= minimum)) ?? null;
}

function chooseUpgrade(offer, now) {
  const hpRatio = now.hero.hp / Math.max(1, now.hero.maxHp);
  const wave = now.wave;
  const beacons = now.works.byKind?.sentry_beacon ?? 0;
  const score = (id) => {
    if (id === 'tinkers_plating') return hpRatio < 0.9 ? 120 : 101;
    if (id === 'field_dressing') return hpRatio < 0.58 ? 130 : hpRatio < 0.82 ? 99 : 42;
    if (id === 'quick_fuse') return 100;
    if (id === 'wide_ring') return 96;
    if (id === 'powder_charge') return 93;
    if (id === 'assay_bonus') return 58 + Math.min(42, wave * 3.5);
    if (id === 'beacon_dynamo') return beacons > 0 ? 88 : 70;
    if (id === 'prospectors_luck') return wave < 9 ? 76 : 55;
    if (id === 'pan_legend') return wave < 7 ? 72 : 48;
    if (id === 'split_spark') return 38;
    if (id === 'double_tap_coil') return 35;
    if (id === 'heavy_spark') return 34;
    if (id === 'long_resonator') return 30;
    if (id === 'sharpen') return 28;
    if (id === 'spring_heels') return 20;
    return 10;
  };
  return [...offer].sort((a, b) => score(b.id) - score(a.id) || a.id.localeCompare(b.id))[0].id;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function decisionLine(view, orders) {
  const pick = orders.find((order) => order.verb === 'PICK_UPGRADE')?.id ?? '-';
  const builds = orders.filter((order) => order.verb === 'BUILD').map((order) => order.what).join(',') || '-';
  const surprises = (view.now.needsRider ? view.now.orders : [])
    .filter((entry) => entry.status === 'failed')
    .map((entry) => `${entry.order.verb}:${entry.reason ?? 'failed'}`)
    .join('|') || '-';
  const prospector = view.now.prospector ? `${view.now.prospector.x},${view.now.prospector.z}` : '-';
  return `[player] wave=${view.now.wave} t=${view.now.timers.runSeconds.toFixed(2)} gold=${view.now.gold} hp=${view.now.hero.hp}/${view.now.hero.maxHp} works=${view.now.works.standing}/${view.now.works.wrecked} threats=${view.now.threats.alive} pro=${prospector} pick=${pick} builds=${builds} failed=${surprises} orders=${orders.length}`;
}
