#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const CONTRACT = 'e1-night-shift';
const SEED = 'e1-night-shift-01';
const OUTCOME_PATH = resolve('outcome.json');
const MAX_RUNS = 6;

const previous = await readOutcome();
if (previous?.bestLine?.secured === true) {
  console.error('player: refusing another run because the contract is already secured.');
  process.exit(0);
}
if ((previous?.runsSoFar ?? 0) >= MAX_RUNS) {
  console.error(`player: refusing run ${previous.runsSoFar + 1}; the six-run cap is spent.`);
  process.exit(2);
}

const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe'],
});
child.stderr.pipe(process.stderr);

let finalOutcome = null;
let lastView = null;
const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
for await (const line of lines) {
  if (!line.trim()) continue;
  process.stdout.write(`${line}\n`);
  let value;
  try {
    value = JSON.parse(line);
  } catch {
    continue;
  }
  if (value?.schema === 'goldrush.view.v1') {
    lastView = value;
    if (value.now?.hero?.hp > 0) {
      const orders = chooseOrders(value);
      child.stdin.write(`${JSON.stringify(orders)}\n`);
    }
  } else if (typeof value?.secured === 'boolean') {
    finalOutcome = value;
  }
}

const exitCode = await new Promise((resolveExit) => child.once('close', resolveExit));
if (exitCode !== 0) {
  console.error(`player: gr-sim exited ${exitCode}`);
  process.exit(typeof exitCode === 'number' ? exitCode : 1);
}
if (!finalOutcome) {
  console.error(`player: simulator ended without an outcome after wave ${lastView?.now?.wave ?? 'unknown'}.`);
  process.exit(1);
}

const runsSoFar = (previous?.runsSoFar ?? 0) + 1;
const bestLine = better(finalOutcome, previous?.bestLine) ? finalOutcome : previous.bestLine;
await writeFile(OUTCOME_PATH, `${JSON.stringify({ runsSoFar, bestLine }, null, 2)}\n`);

function chooseOrders(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  const push = (order) => {
    if (orders.length >= 32) return false;
    orders.push(order);
    return true;
  };

  if (now.pendingOffer?.length) {
    push({ verb: 'PICK_UPGRADE', id: chooseUpgrade(now.pendingOffer, now) });
  }
  if (now.weapon !== 'blast') push({ verb: 'SET_WEAPON', weapon: 'blast' });

  const mechanics = view.stablePrefix.mechanics.buildables ?? [];
  const costs = new Map(mechanics.map((entry) => [entry.id, entry.costs]));
  const entries = now.works.entries ?? [];
  const defenses = new Set(['sentry_beacon', 'palisade', 'sluice', 'turret', 'stockpile']);
  const damaged = entries.filter((entry) => defenses.has(entry.id) && (entry.wrecked || entry.hp < entry.maxHp));
  const repairQueue = [...damaged].sort(buildingOrder);
  let projectedGold = now.gold;

  // Keep a struck defense standing before taking another trip to the river.
  while (repairQueue.length && orders.length < 31) {
    const target = repairQueue[0];
    const repairCost = estimateRepairCost(target, costs);
    if (projectedGold < repairCost) break;
    push({ verb: 'REPAIR_UNDER', pct: 100 });
    projectedGold -= repairCost;
    repairQueue.shift();
  }

  const desired = desiredBuildings(costs);
  const planned = new Set();
  const present = (candidate) => entries.some((entry) =>
    entry.id === candidate.what && Math.abs(entry.position.x - candidate.where.x) < 0.2
      && Math.abs(entry.position.z - candidate.where.z) < 0.2);

  const queueAffordableBuildings = () => {
    for (const item of desired) {
      const key = buildingKey(item);
      if (present(item) || planned.has(key)) continue;
      // Strict priority: save for the next part of the defense rather than buying sediment.
      if (projectedGold < item.cost || orders.length > 30) return;
      if (!push({ verb: 'MOVE_TO', pos: item.where })) return;
      if (!push({
        verb: 'BUILD', what: item.what, where: item.where,
        when: { goldGte: item.cost }, ...(item.rotationSteps === undefined ? {} : { rotationSteps: item.rotationSteps }),
      })) return;
      projectedGold -= item.cost;
      planned.add(key);
    }
  };

  // Spend before panning when the bank is already full.
  queueAffordableBuildings();

  const seamPositions = new Map(view.stablePrefix.map.seams.map((seam) => [seam.id, { x: seam.x, z: seam.z }]));
  const active = now.seams
    .filter((seam) => seam.active && seam.remaining > 0)
    .map((seam) => ({ ...seam, pos: seamPositions.get(seam.id) ?? { x: 0, z: 0 } }));
  const orderedSeams = nearestNeighbor(active, now.prospector ?? { x: now.hero.x, z: now.hero.z });
  const bankCap = entries.some((entry) => entry.id === 'stockpile' && !entry.wrecked) ? 350 : 200;
  for (const seam of orderedSeams) {
    const ticks = Math.ceil(seam.remaining / 5);
    for (let index = 0; index < ticks && projectedGold < bankCap && orders.length < 30; index += 1) {
      if (!push({ verb: 'HARVEST', seam: seam.id })) break;
      projectedGold = Math.min(bankCap, projectedGold + Math.min(5, seam.remaining - index * 5));
    }
  }

  // At tick zero there are only the seven cold fixtures; relight the central post exactly once.
  const centralCold = entries.some((entry) => entry.id === 'lantern_post' && entry.index === 0 && entry.wrecked);
  const hasBuiltDefense = entries.some((entry) => defenses.has(entry.id));
  if (now.wave === 0 && centralCold && !hasBuiltDefense && projectedGold >= 8 && orders.length < 32) {
    push({ verb: 'REPAIR_UNDER', pct: 100 });
    projectedGold -= 8;
  }

  // If low gold deferred repairs, freshly panned gold pays them before expansion.
  while (repairQueue.length && orders.length < 31) {
    const target = repairQueue[0];
    const repairCost = estimateRepairCost(target, costs);
    if (projectedGold < repairCost) break;
    push({ verb: 'REPAIR_UNDER', pct: 100 });
    projectedGold -= repairCost;
    repairQueue.shift();
  }

  queueAffordableBuildings();

  // Once the one-owner build plan exists, deepen the four turrets in index order.
  const allDesiredPresent = desired.every((item) => present(item) || planned.has(buildingKey(item)));
  if (allDesiredPresent) {
    const queuedUpgrades = new Set();
    for (const tier of [1, 2]) {
      const price = tier === 1 ? 150 : 300;
      for (const turret of entries.filter((entry) => entry.id === 'turret' && !entry.wrecked && entry.tier === tier).sort((a, b) => a.index - b.index)) {
        if (projectedGold < price || orders.length > 30) break;
        const key = `${turret.id}:${turret.index}`;
        if (queuedUpgrades.has(key)) continue;
        push({ verb: 'MOVE_TO', pos: turret.position });
        push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: turret.index } });
        projectedGold -= price;
        queuedUpgrades.add(key);
      }
    }
  }

  return orders.slice(0, 32);
}

function desiredBuildings(costs) {
  const price = (id, index, fallback) => costs.get(id)?.[index] ?? fallback;
  return [
    { what: 'sluice', where: { x: 0, z: 7 }, cost: price('sluice', 0, 40) },
    { what: 'turret', where: { x: -1, z: 11 }, cost: price('turret', 0, 50) },
    { what: 'turret', where: { x: 2, z: 11 }, cost: price('turret', 1, 70) },
    { what: 'turret', where: { x: -1, z: 14 }, cost: price('turret', 2, 95) },
    { what: 'turret', where: { x: 2, z: 14 }, cost: price('turret', 3, 125) },
    // A closed north-bank shell. Every seam touches rather than overlaps after grid snap.
    { what: 'palisade', where: { x: -1, z: 18 }, rotationSteps: 1, cost: price('palisade', 0, 10) },
    { what: 'palisade', where: { x: 2, z: 18 }, rotationSteps: 1, cost: price('palisade', 0, 10) },
    { what: 'palisade', where: { x: -3, z: 16 }, rotationSteps: 0, cost: price('palisade', 0, 10) },
    { what: 'palisade', where: { x: -3, z: 13 }, rotationSteps: 0, cost: price('palisade', 0, 10) },
    { what: 'palisade', where: { x: -3, z: 10 }, rotationSteps: 0, cost: price('palisade', 0, 10) },
    { what: 'palisade', where: { x: 4, z: 16 }, rotationSteps: 0, cost: price('palisade', 0, 10) },
    { what: 'palisade', where: { x: 4, z: 13 }, rotationSteps: 0, cost: price('palisade', 0, 10) },
    { what: 'palisade', where: { x: 4, z: 10 }, rotationSteps: 0, cost: price('palisade', 0, 10) },
    { what: 'palisade', where: { x: -1, z: 8 }, rotationSteps: 1, cost: price('palisade', 0, 10) },
    { what: 'palisade', where: { x: 2, z: 8 }, rotationSteps: 1, cost: price('palisade', 0, 10) },
    { what: 'sluice', where: { x: -3, z: 7 }, cost: price('sluice', 0, 40) },
    { what: 'sluice', where: { x: 3, z: 7 }, cost: price('sluice', 0, 40) },
    { what: 'sentry_beacon', where: { x: -5, z: 12 }, cost: price('sentry_beacon', 0, 25) },
    { what: 'sentry_beacon', where: { x: 6, z: 12 }, cost: price('sentry_beacon', 1, 35) },
    { what: 'sentry_beacon', where: { x: -2, z: 20 }, cost: price('sentry_beacon', 2, 45) },
    { what: 'sentry_beacon', where: { x: 3, z: 20 }, cost: price('sentry_beacon', 3, 55) },
    { what: 'sentry_beacon', where: { x: -2, z: 6 }, cost: price('sentry_beacon', 4, 75) },
    { what: 'sentry_beacon', where: { x: 3, z: 6 }, cost: price('sentry_beacon', 5, 95) },
    { what: 'stockpile', where: { x: 0, z: 21 }, cost: price('stockpile', 0, 60) },
  ];
}

function chooseUpgrade(offer, now) {
  const score = {
    quick_fuse: 100,
    wide_ring: 99,
    powder_charge: 98,
    tinkers_plating: 92,
    field_dressing: now.hero.hp <= now.hero.maxHp * 0.72 ? 91 : 25,
    assay_bonus: now.wave <= 12 ? 82 : 45,
    prospectors_luck: 76,
    beacon_dynamo: 70,
    split_spark: 22,
    heavy_spark: 20,
    double_tap_coil: 18,
    long_resonator: 15,
    pan_legend: 12,
    spring_heels: 10,
    sharpen: 5,
  };
  return [...offer].sort((a, b) => (score[b.id] ?? 0) - (score[a.id] ?? 0) || a.id.localeCompare(b.id))[0].id;
}

function nearestNeighbor(seams, start) {
  const rest = [...seams];
  const result = [];
  let point = start;
  while (rest.length) {
    rest.sort((a, b) => distance(point, a.pos) - distance(point, b.pos) || a.id.localeCompare(b.id));
    const next = rest.shift();
    result.push(next);
    point = next.pos;
  }
  return result;
}

function estimateRepairCost(entry, costs) {
  const base = costs.get(entry.id)?.[entry.index] ?? costs.get(entry.id)?.[0] ?? ({ palisade: 10, sluice: 40, stockpile: 60 }[entry.id] ?? 50);
  const invested = base + (entry.id === 'turret' ? (entry.tier >= 2 ? 150 : 0) + (entry.tier >= 3 ? 300 : 0) : 0);
  const missing = entry.maxHp > 0 ? Math.max(0, entry.maxHp - entry.hp) / entry.maxHp : 1;
  return Math.max(1, Math.ceil(invested * 0.25 * missing));
}

function buildingOrder(a, b) {
  const rank = { sentry_beacon: 0, palisade: 1, sluice: 2, stockpile: 3, turret: 4 };
  return (rank[a.id] ?? 99) - (rank[b.id] ?? 99) || a.index - b.index;
}

function buildingKey(item) {
  return `${item.what}:${item.where.x}:${item.where.z}`;
}
function distance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}
function better(candidate, incumbent) {
  if (!incumbent) return true;
  if (candidate.secured !== incumbent.secured) return candidate.secured;
  if (candidate.waves !== incumbent.waves) return candidate.waves > incumbent.waves;
  if (candidate.kills !== incumbent.kills) return candidate.kills > incumbent.kills;
  return candidate.timeMs > incumbent.timeMs;
}
async function readOutcome() {
  try {
    const parsed = JSON.parse(await readFile(OUTCOME_PATH, 'utf8'));
    return parsed && Number.isInteger(parsed.runsSoFar) ? parsed : null;
  } catch {
    return null;
  }
}
