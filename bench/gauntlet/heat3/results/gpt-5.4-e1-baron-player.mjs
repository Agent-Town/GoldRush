#!/usr/bin/env node

import { spawn } from 'node:child_process';
import readline from 'node:readline';
import { pathToFileURL } from 'node:url';

const CLAIM = { x: 0, z: 12 };
const NORTH_HOLD = { x: 0, z: 10 };
const SLUICE_POS = { x: 1, z: 12 };
const BUILD_PLAN = [
  { what: 'sentry_beacon', where: { x: 0, z: 13 } },
  { what: 'palisade', where: { x: -2, z: 12 } },
  { what: 'palisade', where: { x: 2, z: 12 } },
  { what: 'palisade', where: { x: -2, z: 14 } },
  { what: 'palisade', where: { x: 2, z: 14 } },
  { what: 'turret', where: { x: 4, z: 10 } },
  { what: 'turret', where: { x: -4, z: 10 } },
  { what: 'sluice', where: SLUICE_POS },
  { what: 'turret', where: { x: 4, z: 14 } },
  { what: 'sentry_beacon', where: { x: 0, z: 11 } },
  { what: 'turret', where: { x: -4, z: 14 } },
  { what: 'sentry_beacon', where: { x: 3, z: 12 } },
  { what: 'sentry_beacon', where: { x: -3, z: 12 } },
  { what: 'sentry_beacon', where: { x: 0, z: 15 } },
  { what: 'sentry_beacon', where: { x: 0, z: 9 } },
];

const UPGRADE_COSTS = {
  turret: [0, 150, 300],
  sluice: [0, 120, 240],
  palisade: [0, 90, 250],
};

const EXACT_UPGRADE_PRIORITY = new Map([
  ['heavy_spark', 1000],
  ['double_tap_coil', 980],
  ['split_spark', 960],
  ['long_resonator', 940],
  ['quick_fuse', 920],
  ['powder_charge', 900],
  ['tinkers_plating', 880],
  ['spring_heels', 860],
  ['beacon_dynamo', 820],
  ['field_dressing', 780],
  ['pan_legend', 720],
  ['prospectors_luck', 680],
  ['wide_ring', 640],
  ['assay_bonus', 320],
  ['auto_pan', 280],
  ['sharpen', 200],
]);

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      options[key] = next;
      index += 1;
    } else {
      options[key] = true;
    }
  }
  return options;
}

function text(value) {
  return typeof value === 'string' ? value : '';
}

function clampOrders(orders) {
  return orders.slice(0, 32);
}

function distance(a, b) {
  return Math.hypot((a?.x ?? 0) - b.x, (a?.z ?? 0) - b.z);
}

function positionOf(view) {
  return view.now.prospector ?? view.now.hero;
}

function holdPosition(view) {
  return view.now.wave >= 18 ? NORTH_HOLD : CLAIM;
}

function fallbackThreshold(view) {
  return view.now.wave >= 12 ? 1 : 2;
}

function isCalm(view) {
  return view.now.threats.alive === 0 || view.now.threats.state === 'quiet';
}

function buildCosts(view) {
  const map = new Map();
  for (const entry of view.stablePrefix.mechanics.buildables ?? []) {
    map.set(entry.id, entry.costs ?? [entry.cost]);
  }
  return map;
}

function buildOrderQueue(view) {
  const counts = { ...view.now.works.byKind };
  const costTable = buildCosts(view);
  const orders = [];
  for (const item of BUILD_PLAN) {
    const built = counts[item.what] ?? 0;
    const prices = costTable.get(item.what) ?? [];
    const goldGte = prices[built] ?? prices.at(-1) ?? 0;
    orders.push({
      verb: 'BUILD',
      what: item.what,
      where: item.where,
      when: { goldGte },
    });
    counts[item.what] = built + 1;
  }
  return orders;
}

function nextUpgrade(view) {
  const calm = isCalm(view);
  if (!calm) return [];

  const actor = positionOf(view);
  const entries = [...view.now.works.entries].filter((entry) => !entry.wrecked);
  const turrets = entries
    .filter((entry) => entry.id === 'turret')
    .sort((left, right) => left.tier - right.tier || left.index - right.index);
  const sluices = entries
    .filter((entry) => entry.id === 'sluice')
    .sort((left, right) => left.tier - right.tier || left.index - right.index);
  const palisades = entries
    .filter((entry) => entry.id === 'palisade')
    .sort((left, right) => left.tier - right.tier || left.index - right.index);

  const turret = turrets.find((entry) => entry.tier < 2 && view.now.gold >= UPGRADE_COSTS.turret[entry.tier]);
  if (turret) return moveThenUpgrade(actor, turret);

  if (view.now.wave < 16) {
    const sluice = sluices.find((entry) => entry.tier < 2 && view.now.gold >= UPGRADE_COSTS.sluice[entry.tier]);
    if (sluice) return moveThenUpgrade(actor, sluice);
  }

  if (view.now.wave >= 16) {
    const palisade = palisades.find((entry) => entry.tier < 2 && view.now.gold >= UPGRADE_COSTS.palisade[entry.tier]);
    if (palisade) return moveThenUpgrade(actor, palisade);
  }

  return [];
}

function moveThenUpgrade(actor, entry) {
  const orders = [];
  if (distance(actor, entry.position) > 1.8) {
    orders.push({ verb: 'MOVE_TO', pos: entry.position });
  }
  orders.push({
    verb: 'CONTEXT_ACTION',
    action: 'upgrade',
    target: { id: entry.id, index: entry.index },
  });
  return orders;
}

function harvestOrders(view) {
  if (view.now.wave >= 18) return [];
  const quiet = isCalm(view);
  if (!quiet) return [];

  const orders = [];
  const sluices = view.now.works.byKind.sluice ?? 0;
  if (sluices > 0) {
    for (let count = 0; count < 4; count += 1) orders.push({ verb: 'HARVEST', sluice: 0 });
  }

  const mapSeams = view.stablePrefix.map.seams ?? [];
  const activeSeams = [...view.now.seams]
    .filter((seam) => seam.active && seam.remaining > 0)
    .sort((left, right) => {
      const leftPos = mapSeams.find((entry) => entry.id === left.id);
      const rightPos = mapSeams.find((entry) => entry.id === right.id);
      return distance(leftPos ?? CLAIM, CLAIM) - distance(rightPos ?? CLAIM, CLAIM);
    });
  const preferred = activeSeams.slice(0, sluices > 0 ? 1 : 2);
  for (const seam of preferred) {
    const repeats = seam.id === preferred[0]?.id ? 4 : 2;
    for (let count = 0; count < repeats; count += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
  }
  return orders;
}

function pickUpgrade(view) {
  if (!view.now.pendingOffer?.length) return [];
  const scored = [...view.now.pendingOffer]
    .map((offer, index) => ({ offer, index, score: scoreOffer(view, offer) }))
    .sort((left, right) => right.score - left.score || left.index - right.index);
  return [{ verb: 'PICK_UPGRADE', id: scored[0].offer.id }];
}

function scoreOffer(view, offer) {
  if (EXACT_UPGRADE_PRIORITY.has(offer.id)) {
    let score = EXACT_UPGRADE_PRIORITY.get(offer.id);
    if (offer.id === 'field_dressing' && view.now.hero.hp >= view.now.hero.maxHp * 0.8) score -= 280;
    if (offer.id === 'prospectors_luck' && view.now.wave >= 10) score -= 220;
    if (offer.id === 'pan_legend' && (view.now.works.byKind.sluice ?? 0) > 0) score -= 160;
    return score;
  }

  const haystack = `${text(offer.name)} ${text(offer.effectText)} ${offer.id}`.toLowerCase();
  let score = 0;
  if (haystack.includes('damage')) score += 600;
  if (haystack.includes('fire rate')) score += 560;
  if (haystack.includes('spark')) score += 520;
  if (haystack.includes('range')) score += 500;
  if (haystack.includes('volley')) score += 480;
  if (haystack.includes('blast')) score += 420;
  if (haystack.includes('beacon')) score += 360;
  if (haystack.includes('move speed')) score += 320;
  if (haystack.includes('heal')) score += view.now.hero.hp < view.now.hero.maxHp * 0.7 ? 350 : 80;
  if (haystack.includes('gold')) score += 120;
  return score;
}

function repairOrders(view) {
  if (view.now.works.standing === 0) return [];
  if (view.now.wave >= 18) return [{ verb: 'REPAIR_UNDER', pct: 85 }];
  if (view.now.wave >= 10) return [{ verb: 'REPAIR_UNDER', pct: 65 }];
  if (view.now.wave >= 6) return [{ verb: 'REPAIR_UNDER', pct: 50 }];
  return [];
}

export function decide(view) {
  if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const pick = pickUpgrade(view);
  if (pick.length > 0) return pick;

  const hold = holdPosition(view);
  const upgrade = nextUpgrade(view);
  const orders = [
    ...upgrade,
    ...buildOrderQueue(view),
    ...repairOrders(view),
    { verb: 'FALLBACK_IF', threat: { enemiesGte: fallbackThreshold(view) }, pos: hold },
    ...harvestOrders(view),
    { verb: 'HOLD', pos: hold },
  ];
  return clampOrders(orders);
}

async function runStdio() {
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    const message = JSON.parse(line);
    if (message?.schema !== 'goldrush.view.v1') continue;
    process.stdout.write(`${JSON.stringify(decide(message))}\n`);
  }
}

export function runContract(contract, seed, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const stderr = [];
    const debug = options.debug === true;
    let outcome = null;
    let lastView = null;
    const trace = [];
    let stdoutBuffer = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (chunk) => {
      stdoutBuffer += chunk;
      let newline = stdoutBuffer.indexOf('\n');
      while (newline >= 0) {
        const line = stdoutBuffer.slice(0, newline);
        stdoutBuffer = stdoutBuffer.slice(newline + 1);
        if (line.trim()) {
          const message = JSON.parse(line);
          if (message?.schema === 'goldrush.view.v1') {
            lastView = message;
            const orders = decide(message);
            if (debug) {
              trace.push({
                wave: message.now.wave,
                gold: message.now.gold,
                hp: message.now.hero.hp,
                threats: message.now.threats,
                works: message.now.works.byKind,
                needsRider: message.now.needsRider,
                lastWave: message.appendLog.at(-1) ?? null,
                orders,
              });
            }
            child.stdin.write(`${JSON.stringify(orders)}\n`);
          } else {
            outcome = message;
          }
        }
        newline = stdoutBuffer.indexOf('\n');
      }
    });
    child.stderr.on('data', (chunk) => stderr.push(chunk));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.join('').trim() || `player run exited ${code}`));
        return;
      }
      resolve({ outcome, lastView, stderr: stderr.join(''), trace });
    });
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.contract) {
    const result = await runContract(text(options.contract), text(options.seed) || 'e1-baron-01', {
      debug: options.debug === true,
    });
    if (options.debug === true) {
      process.stderr.write(`${JSON.stringify(result.trace, null, 2)}\n`);
    }
    process.stdout.write(`${JSON.stringify(result.outcome)}\n`);
    return;
  }
  await runStdio();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
