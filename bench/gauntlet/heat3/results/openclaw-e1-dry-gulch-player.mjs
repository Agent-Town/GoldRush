#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { readFile, writeFile } from 'node:fs/promises';

const CONTRACT = 'e1-dry-gulch';
const SEED = 'e1-dry-gulch-01';
const RUN_CMD = ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED];
const OUTCOME_PATH = new URL('./outcome.json', import.meta.url);

const COSTS = {
  sentry_beacon: [25, 35, 45, 55, 75, 95],
  turret: [50, 70, 95, 125],
  sluice: [40, 40, 40],
  palisade: Array.from({ length: 48 }, () => 10),
  stockpile: [60, 60],
};

const DEFENSE_PLAN = [
  { id: 'sentry_beacon', x: 0, z: 7 },
  { id: 'turret', x: 0, z: 10 },
  { id: 'sentry_beacon', x: -5, z: 12 },
  { id: 'turret', x: -4, z: 10 },
  { id: 'sentry_beacon', x: 5, z: 12 },
  { id: 'turret', x: 4, z: 10 },
  { id: 'sentry_beacon', x: 0, z: 17 },
  { id: 'turret', x: 0, z: 15 },
  { id: 'sentry_beacon', x: -7, z: 8 },
  { id: 'sentry_beacon', x: 7, z: 8 },
];

const SPRING_PLAN = [
  { id: 'sluice', x: -18, z: -15 },
  { id: 'sluice', x: -15, z: -18 },
  { id: 'sluice', x: -21, z: -18 },
];

const PALISADE_PLAN = [
  { id: 'palisade', x: -2, z: 9, rotationSteps: 1 },
  { id: 'palisade', x: 2, z: 9, rotationSteps: 1 },
  { id: 'palisade', x: -2, z: 15, rotationSteps: 1 },
  { id: 'palisade', x: 2, z: 15, rotationSteps: 1 },
  { id: 'palisade', x: -5, z: 12, rotationSteps: 0 },
  { id: 'palisade', x: 5, z: 12, rotationSteps: 0 },
];

const UPGRADE_PRIORITY = [
  'split_spark',
  'heavy_spark',
  'double_tap_coil',
  'quick_fuse',
  'powder_charge',
  'wide_ring',
  'long_resonator',
  'beacon_dynamo',
  'beacon_handoff',
  'chain_spark_arc',
  'tinkers_plating',
  'pan_legend',
  'spring_heels',
  'prospectors_luck',
  'stockpile_seam_survey',
  'rich_seam_pact',
  'spark_pressure_ring',
  'sharpen',
  'field_dressing',
  'assay_bonus',
  'prospector_policy_slot',
];

const transcript = [];
let terminalOutcome = null;

const child = spawn(process.execPath, RUN_CMD, {
  cwd: new URL('.', import.meta.url),
  stdio: ['pipe', 'pipe', 'pipe'],
});

child.stderr.setEncoding('utf8');
child.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
});

const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
lines.on('line', (line) => {
  if (!line.trim()) return;
  let value;
  try {
    value = JSON.parse(line);
  } catch (error) {
    process.stderr.write(`player ignored non-json stdout: ${error.message}\n`);
    return;
  }

  if (value?.schema === 'goldrush.view.v1') {
    transcript.push(summarizeView(value));
    const orders = chooseOrders(value);
    child.stdin.write(`${JSON.stringify(orders)}\n`);
    return;
  }

  terminalOutcome = value;
});

const exitCode = await new Promise((resolve) => {
  child.on('close', resolve);
});

if (!terminalOutcome) {
  terminalOutcome = { secured: false, error: `sim exited ${exitCode} without an outcome` };
}

const previous = await readPreviousOutcome();
const runsSoFar = (previous?.runsSoFar ?? 0) + 1;
const best = betterLine(previous?.bestLine, terminalOutcome) ? previous.bestLine : lineFromOutcome(terminalOutcome);
const record = {
  contract: CONTRACT,
  seed: SEED,
  runsSoFar,
  lastRun: lineFromOutcome(terminalOutcome),
  bestLine: best,
  telemetry: transcript,
  outcome: terminalOutcome,
};

await writeFile(OUTCOME_PATH, `${JSON.stringify(record, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(terminalOutcome)}\n`);
process.exitCode = exitCode || (terminalOutcome.secured ? 0 : 1);

function chooseOrders(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (now.pendingOffer?.length) {
    orders.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer, now) });
  }

  if (now.wave >= 8 && now.weapon !== 'blast') {
    orders.push({ verb: 'SET_WEAPON', weapon: 'blast' });
  } else if (now.wave < 8 && now.weapon !== 'rig') {
    orders.push({ verb: 'SET_WEAPON', weapon: 'rig' });
  }

  orders.push({ verb: 'REPAIR_UNDER', pct: now.wave >= 12 ? 82 : 65 });

  const pendingDefense = pendingBuilds(DEFENSE_PLAN, now);
  const pendingSpring = pendingBuilds(SPRING_PLAN, now);
  const pendingPalisade = pendingBuilds(PALISADE_PLAN, now);
  const nextDefense = pendingDefense[0] ?? null;
  const nextSpring = pendingSpring[0] ?? null;
  const nextPalisade = pendingPalisade[0] ?? null;

  const plannedGoldNeed = Math.min(
    nextDefense ? buildCost(nextDefense, now) : Infinity,
    nextSpring && now.wave >= 3 ? buildCost(nextSpring, now) : Infinity,
    nextPalisade && now.wave >= 8 ? buildCost(nextPalisade, now) : Infinity,
  );
  const harvestOrders = harvestPlan(view, plannedGoldNeed);
  orders.push(...harvestOrders.before);

  if (nextDefense && (now.gold >= buildCost(nextDefense, now) || now.wave >= 2)) {
    orders.push({ verb: 'MOVE_TO', pos: { x: 0, z: 12 } });
    for (const build of pendingDefense.slice(0, now.wave < 8 ? 3 : 6)) {
      orders.push(buildOrder(build, now));
    }
  }

  if (nextSpring && now.wave >= 3 && (now.gold >= buildCost(nextSpring, now) || now.works.byKind.turret >= 1)) {
    orders.push({ verb: 'MOVE_TO', pos: { x: -18, z: -15 } });
    for (const build of pendingSpring) {
      orders.push(buildOrder(build, now));
    }
  }

  if (nextPalisade && now.wave >= 8 && now.works.byKind.turret >= 2) {
    orders.push({ verb: 'MOVE_TO', pos: { x: 0, z: 12 } });
    for (const build of pendingPalisade.slice(0, 4)) {
      orders.push(buildOrder(build, now));
    }
  }

  orders.push(...upgradeOrders(now));
  orders.push(...harvestOrders.after);

  if (now.threats.alive >= 6) {
    orders.push({ verb: 'FALLBACK_IF', threat: { enemiesGte: 6 }, pos: { x: 0, z: 12 } });
  }
  orders.push({ verb: 'HOLD', pos: { x: now.wave >= 12 ? 0 : -2, z: now.wave >= 12 ? 12 : 10 } });

  return orders.slice(0, 32);
}

function harvestPlan(view, plannedGoldNeed) {
  const now = view.now;
  const active = activeSeams(view);
  if (active.length === 0) return { before: [], after: [] };
  const nearest = active
    .map((seam) => ({ ...seam, distance: dist(seam, now.prospector ?? now.hero) }))
    .sort((a, b) => a.distance - b.distance || b.remaining - a.remaining)[0];
  const richest = [...active].sort((a, b) => b.remaining - a.remaining || dist(a, now.prospector ?? now.hero) - dist(b, now.prospector ?? now.hero))[0];
  const target = now.wave < 6 ? nearest : richest;
  const neededTicks = Number.isFinite(plannedGoldNeed)
    ? Math.max(0, Math.ceil((plannedGoldNeed - now.gold) / 7))
    : 2;
  const beforeCount = Math.max(0, Math.min(4, neededTicks || (now.wave < 7 ? 2 : 1)));
  const afterCount = now.wave < 10 ? 2 : 1;
  return {
    before: repeatHarvest(target.id, beforeCount),
    after: repeatHarvest(target.id, afterCount),
  };
}

function upgradeOrders(now) {
  const orders = [];
  if (now.wave >= 10) {
    const turrets = (now.works.entries ?? []).filter((entry) => entry.id === 'turret' && !entry.wrecked && entry.tier < 2);
    for (const turret of turrets.slice(0, 2)) {
      orders.push({ verb: 'MOVE_TO', pos: { x: turret.position.x, z: turret.position.z } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: turret.index } });
    }
  }
  if (now.wave >= 12) {
    const sluices = (now.works.entries ?? []).filter((entry) => entry.id === 'sluice' && !entry.wrecked && entry.tier < 2);
    for (const sluice of sluices.slice(0, 1)) {
      orders.push({ verb: 'MOVE_TO', pos: { x: sluice.position.x, z: sluice.position.z } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'sluice', index: sluice.index } });
    }
  }
  return orders;
}

function pendingBuilds(plan, now) {
  return plan.filter((build) => !hasWork(now, build.id, build));
}

function hasWork(now, id, point) {
  return (now.works.entries ?? []).some((entry) =>
    entry.id === id &&
    !entry.wrecked &&
    Math.hypot(entry.position.x - point.x, entry.position.z - point.z) <= 0.75
  );
}

function buildOrder(build, now) {
  const order = {
    verb: 'BUILD',
    what: build.id,
    where: { x: build.x, z: build.z },
    when: { goldGte: buildCost(build, now) },
  };
  if (build.rotationSteps !== undefined) order.rotationSteps = build.rotationSteps;
  return order;
}

function buildCost(build, now) {
  const count = now.works.byKind?.[build.id] ?? 0;
  const costs = COSTS[build.id] ?? [9999];
  return costs[Math.min(count, costs.length - 1)];
}

function repeatHarvest(id, count) {
  return Array.from({ length: Math.max(0, count) }, () => ({ verb: 'HARVEST', seam: id }));
}

function activeSeams(view) {
  const byId = new Map(view.stablePrefix.map.seams.map((seam) => [seam.id, seam]));
  return view.now.seams
    .filter((seam) => seam.active && seam.remaining > 0)
    .map((seam) => ({ ...seam, ...(byId.get(seam.id) ?? {}) }))
    .filter((seam) => Number.isFinite(seam.x) && Number.isFinite(seam.z));
}

function pickUpgrade(offer, now) {
  if (now.hero.hp < Math.min(65, now.hero.maxHp * 0.55)) {
    const healing = offer.find((card) => card.id === 'field_dressing' || card.id === 'tinkers_plating');
    if (healing) return healing.id;
  }
  let best = offer[0].id;
  let bestScore = Infinity;
  for (const card of offer) {
    const score = UPGRADE_PRIORITY.indexOf(card.id);
    if (score !== -1 && score < bestScore) {
      best = card.id;
      bestScore = score;
    }
  }
  return best;
}

function summarizeView(view) {
  return {
    wave: view.now.wave,
    t: view.now.timers.runSeconds,
    gold: view.now.gold,
    hp: view.now.hero.hp,
    works: view.now.works.byKind,
    threats: view.now.threats,
    offer: view.now.pendingOffer?.map((card) => card.id),
    pendingSecure: Boolean(view.now.pendingSecure),
    needsRider: view.now.needsRider,
  };
}

function lineFromOutcome(outcome) {
  return {
    secured: outcome.secured === true,
    waves: outcome.waves ?? 0,
    timeMs: outcome.timeMs ?? 0,
    gold: outcome.gold ?? 0,
    kills: outcome.kills ?? 0,
    calls: outcome.calls ?? 0,
    defaultedPicks: outcome.defaultedPicks ?? 0,
    defaultedSecure: outcome.defaultedSecure ?? 0,
    eventLogHash: outcome.eventLogHash ?? null,
    endReason: outcome.endReason ?? null,
  };
}

function betterLine(previous, currentOutcome) {
  if (!previous) return false;
  const current = lineFromOutcome(currentOutcome);
  if (previous.secured !== current.secured) return previous.secured;
  if (previous.waves !== current.waves) return previous.waves > current.waves;
  if (previous.kills !== current.kills) return previous.kills > current.kills;
  return previous.gold >= current.gold;
}

async function readPreviousOutcome() {
  try {
    return JSON.parse(await readFile(OUTCOME_PATH, 'utf8'));
  } catch {
    return null;
  }
}

function dist(a, b) {
  return Math.hypot((a.x ?? 0) - (b.x ?? 0), (a.z ?? 0) - (b.z ?? 0));
}
