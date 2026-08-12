#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const CONTRACT = 'e1-dry-gulch';
const SEED = 'e1-dry-gulch-01';
const BANK_CAP = 200;
const BASE_PAN_YIELD = 5;
const TURRET_POSITIONS = [
  { x: -4, z: 0 },
  { x: 4, z: 0 },
  { x: 0, z: -4 },
  { x: 0, z: 4 },
];

const BEACON_POSITIONS = [
  { x: -3, z: -3 },
  { x: 3, z: -3 },
  { x: -3, z: 3 },
  { x: 3, z: 3 },
  { x: -6, z: 0 },
  { x: 6, z: 0 },
];

let defenseAnchor = null;
let outcome = null;

const sim = spawn(process.execPath, [
  'scripts/gr-sim.mjs',
  '--contract', CONTRACT,
  '--seed', SEED,
], {
  cwd: process.cwd(),
  stdio: ['pipe', 'pipe', 'pipe'],
});

sim.stderr.setEncoding('utf8');
sim.stderr.on('data', (chunk) => process.stderr.write(chunk));

const lines = createInterface({ input: sim.stdout, crlfDelay: Infinity });
for await (const line of lines) {
  if (!line.trim()) continue;
  const message = JSON.parse(line);
  if (message.schema !== 'goldrush.view.v1') {
    outcome = message;
    continue;
  }

  defenseAnchor ??= { x: message.now.hero.x, z: message.now.hero.z };
  logView(message);
  if (isTerminalView(message)) continue;

  const orders = planOrders(message);
  sim.stdin.write(`${JSON.stringify(orders)}\n`);
}

const exitCode = await new Promise((resolve, reject) => {
  sim.once('error', reject);
  sim.once('close', resolve);
});
if (exitCode !== 0) throw new Error(`gr-sim exited with status ${exitCode}`);
if (!outcome) throw new Error('gr-sim ended without an outcome line');

persistOutcome(outcome);
process.stdout.write(`${JSON.stringify(outcome)}\n`);

function planOrders(view) {
  if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (view.now.pendingOffer?.length) {
    orders.push({ verb: 'PICK_UPGRADE', id: chooseUpgrade(view.now.pendingOffer).id });
  }
  orders.push({ verb: 'SET_WEAPON', weapon: 'blast' });

  const entries = view.now.works.entries;
  const gold = view.now.gold;
  const damaged = entries.some((entry) => entry.wrecked || entry.hp / entry.maxHp < 0.55);
  let expectedSpend = 0;

  if (damaged && gold >= 50) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 80 });
  } else {
    const turret = buildable(view, 'turret');
    const turrets = entries.filter((entry) => entry.id === 'turret');
    if (turret && turrets.length < Math.min(turret.maxCount, TURRET_POSITIONS.length)) {
      const cost = turret.costs[turrets.length] ?? turret.cost;
      if (gold >= cost) {
        const where = offset(TURRET_POSITIONS[turrets.length]);
        orders.push(
          { verb: 'MOVE_TO', pos: where },
          { verb: 'BUILD', what: 'turret', where, when: { goldGte: cost } },
        );
        expectedSpend = cost;
      }
    } else {
      const beacon = buildable(view, 'sentry_beacon');
      const beacons = entries.filter((entry) => entry.id === 'sentry_beacon');
      if (beacon && beacons.length < Math.min(beacon.maxCount, BEACON_POSITIONS.length)) {
        const cost = beacon.costs[beacons.length] ?? beacon.cost;
        if (gold >= cost) {
          const where = offset(BEACON_POSITIONS[beacons.length]);
          orders.push(
            { verb: 'MOVE_TO', pos: where },
            { verb: 'BUILD', what: 'sentry_beacon', where, when: { goldGte: cost } },
          );
          expectedSpend = cost;
        }
      } else {
        const upgrade = turrets.find((entry) => entry.tier === 1 && !entry.wrecked);
        if (upgrade && gold >= 150) {
          orders.push(
            { verb: 'MOVE_TO', pos: upgrade.position },
            { verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: upgrade.id, index: upgrade.index } },
          );
          expectedSpend = 150;
        }
      }
    }
  }

  appendSafeHarvestOrders(orders, view, Math.max(0, gold - expectedSpend));
  orders.push({ verb: 'HOLD', pos: defenseAnchor });
  if (orders.length > 32) throw new Error(`policy produced ${orders.length} orders`);
  return orders;
}


function offset(relative) {
  return {
    x: defenseAnchor.x + relative.x,
    z: defenseAnchor.z + relative.z,
  };
}

function buildable(view, id) {
  return view.stablePrefix.mechanics.buildables?.find((entry) => entry.id === id) ?? null;
}

function appendSafeHarvestOrders(orders, view, expectedGold) {
  const multiplierRule = view.stablePrefix.mechanics.rules.find((rule) => rule.id === 'seam_yield_multiplier');
  const multiplier = multiplierRule?.details?.multiplier ?? 1;
  const panYield = BASE_PAN_YIELD * multiplier;
  let plannedGold = expectedGold;

  for (const seam of view.now.seams) {
    if (!seam.active || seam.remaining <= 0) continue;
    let remaining = seam.remaining;
    while (remaining > 0 && orders.length < 31) {
      const gain = Math.min(panYield, remaining);
      if (plannedGold + gain > BANK_CAP + 1e-9) return;
      orders.push({ verb: 'HARVEST', seam: seam.id });
      plannedGold += gain;
      remaining -= gain;
    }
  }
}

function chooseUpgrade(offers) {
  return [...offers].sort((left, right) => scoreUpgrade(right) - scoreUpgrade(left))[0];
}

function scoreUpgrade(offer) {
  const text = `${offer.name} ${offer.effectText}`.toLowerCase();
  const weights = [
    ['turret', 100],
    ['beacon', 90],
    ['blast', 80],
    ['volley', 70],
    ['damage', 60],
    ['fire rate', 55],
    ['cooldown', 50],
    ['health', 30],
    ['heal', 25],
    ['gold', 15],
    ['pan', 5],
  ];
  return weights.reduce((score, [term, weight]) => score + (text.includes(term) ? weight : 0), 0);
}

function isTerminalView(view) {
  if (view.now.hero.hp <= 0) return true;
  const final = view.appendLog.at(-1)?.outcome;
  return final === 'secured' || final === 'rider-down';
}

function logView(view) {
  const offer = view.now.pendingOffer?.map((entry) => entry.id).join(',') ?? '-';
  process.stderr.write(
    `player view wave=${view.now.wave} hp=${view.now.hero.hp} gold=${view.now.gold} `
      + `works=${view.now.works.standing}/${view.now.works.wrecked} threats=${view.now.threats.alive} offer=${offer}\n`,
  );
}

function persistOutcome(runOutcome) {
  const previous = readPreviousOutcome();
  const runsSoFar = previous.runsSoFar + 1;
  const candidate = {
    contractId: CONTRACT,
    seed: SEED,
    ...runOutcome,
  };
  const bestLine = better(candidate, previous.bestLine) ? candidate : previous.bestLine;
  writeFileSync('outcome.json', `${JSON.stringify({ bestLine, runsSoFar }, null, 2)}\n`);
}

function readPreviousOutcome() {
  if (!existsSync('outcome.json')) return { bestLine: null, runsSoFar: 0 };
  const parsed = JSON.parse(readFileSync('outcome.json', 'utf8'));
  return {
    bestLine: parsed.bestLine ?? null,
    runsSoFar: Number.isInteger(parsed.runsSoFar) ? parsed.runsSoFar : 0,
  };
}

function better(candidate, incumbent) {
  if (!incumbent) return true;
  if (candidate.secured !== incumbent.secured) return candidate.secured;
  if (candidate.waves !== incumbent.waves) return candidate.waves > incumbent.waves;
  if (candidate.kills !== incumbent.kills) return candidate.kills > incumbent.kills;
  return candidate.gold > incumbent.gold;
}
