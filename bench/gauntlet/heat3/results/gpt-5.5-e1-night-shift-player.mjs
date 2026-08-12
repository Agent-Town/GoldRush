#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';

const CONTRACT = 'e1-night-shift';
const SEED = 'e1-night-shift-01';
const HOLD = { x: 0, z: 12 };
const BUILD_STATION = { x: 0, z: 12 };
const BUILD_PLAN = withKindIndexes([
  ['palisade', -3, 9, 1],
  ['palisade', 0, 9, 1],
  ['palisade', 3, 9, 1],
  ['palisade', -5, 11, 0],
  ['palisade', 5, 11, 0],
  ['sentry_beacon', 0, 13],
  ['turret', 4, 14],
  ['turret', -4, 14],
  ['sentry_beacon', 0, 11],
  ['palisade', -3, 15, 1],
  ['palisade', 0, 15, 1],
  ['palisade', 3, 15, 1],
  ['palisade', -5, 14, 0],
  ['palisade', 5, 14, 0],
  ['sentry_beacon', 3, 12],
  ['sentry_beacon', -3, 12],
  ['turret', 4, 10],
  ['turret', -4, 10],
  ['sentry_beacon', 0, 7],
]);
const UPGRADE_PRIORITY = [
  'heavy_spark',
  'tinkers_plating',
  'double_tap_coil',
  'split_spark',
  'long_resonator',
  'field_dressing',
  'beacon_dynamo',
  'field_dressing',
  'prospectors_luck',
  'pan_legend',
  'spring_heels',
  'powder_charge',
  'wide_ring',
  'quick_fuse',
];

function buildCost(view, kind, index) {
  const entry = view.stablePrefix.mechanics.buildables?.find((buildable) => buildable.id === kind);
  return entry?.costs?.[index] ?? entry?.cost ?? 10;
}

function currentBuildCost(view, kind) {
  return buildCost(view, kind, view.now.works.byKind[kind] ?? 0);
}

function withKindIndexes(rows) {
  const counts = {};
  return rows.map(([what, x, z, rotationSteps]) => {
    const index = counts[what] ?? 0;
    counts[what] = index + 1;
    return { what, index, where: { x, z }, rotationSteps };
  });
}

function activeSeams(view) {
  const points = new Map(view.stablePrefix.map.seams.map((seam) => [seam.id, seam]));
  const actor = view.now.prospector ?? view.now.hero;
  return view.now.seams
    .filter((seam) => seam.active && seam.remaining > 0)
    .map((seam) => ({ ...seam, point: points.get(seam.id) }))
    .filter((seam) => seam.point)
    .sort((left, right) => (
      Math.hypot(left.point.x - actor.x, left.point.z - actor.z)
      - Math.hypot(right.point.x - actor.x, right.point.z - actor.z)
    ));
}

function blastTarget(view) {
  if (view.now.threats.edge === 'north') return { x: HOLD.x - 2, z: HOLD.z + 3 };
  if (view.now.threats.edge === 'south') return { x: HOLD.x, z: HOLD.z - 3 };
  if (view.now.threats.edge === 'east') return { x: HOLD.x + 3, z: HOLD.z };
  if (view.now.threats.edge === 'west') return { x: HOLD.x - 3, z: HOLD.z };
  return HOLD;
}

function hasWorkAt(view, item) {
  return view.now.works.entries.some((entry) =>
    entry.id === item.what
    && Math.abs(entry.position.x - item.where.x) < 0.2
    && Math.abs(entry.position.z - item.where.z) < 0.2
  );
}

function ordersFor(view) {
  if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  if (view.now.pendingOffer?.[0]) {
    const pick = UPGRADE_PRIORITY.find((id) => view.now.pendingOffer.some((offer) => offer.id === id))
      ?? view.now.pendingOffer[0].id;
    return [{ verb: 'PICK_UPGRADE', id: pick }];
  }

  const orders = [];
  if (view.now.weapon !== 'rig') orders.push({ verb: 'SET_WEAPON', weapon: 'rig' });
  if (view.now.wave >= 10 && view.now.works.entries.some((entry) =>
    entry.id !== 'lantern_post' && (entry.wrecked || entry.hp < entry.maxHp * 0.55)
  )) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 88 });
  }
  const nextTurret = BUILD_PLAN.find((item) =>
    item.what === 'turret'
    && !hasWorkAt(view, item)
    && view.now.gold >= currentBuildCost(view, item.what)
  );
  if (view.now.wave >= 14 && nextTurret && distance(view.now.prospector ?? view.now.hero, nextTurret.where) > 6) {
    orders.push({ verb: 'MOVE_TO', pos: BUILD_STATION });
  }

  for (const item of BUILD_PLAN) {
    if (!hasWorkAt(view, item)) {
      orders.push({
        verb: 'BUILD',
        what: item.what,
        where: item.where,
        when: { goldGte: currentBuildCost(view, item.what) },
        ...(item.rotationSteps === undefined ? {} : { rotationSteps: item.rotationSteps }),
      });
    }
  }

  if (view.now.works.hp > 0 && view.now.works.hp < view.now.works.maxHp * 0.65) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 85 });
  }
  if (view.now.blastReadyInMs === 0 && view.now.threats.alive > 0) {
    orders.push({ verb: 'BLAST_AT', pos: blastTarget(view) });
  }

  for (const seam of activeSeams(view)) {
    for (let count = 0; count < 3; count += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
  }

  orders.push({ verb: 'HOLD', pos: HOLD });
  return orders.slice(0, 32);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

async function previousOutcome() {
  try {
    return JSON.parse(await readFile('outcome.json', 'utf8'));
  } catch {
    return null;
  }
}

function isBetter(candidate, current) {
  if (!current) return true;
  if (candidate.secured !== current.secured) return candidate.secured;
  if (candidate.waves !== current.waves) return candidate.waves > current.waves;
  if (candidate.kills !== current.kills) return candidate.kills > current.kills;
  return candidate.gold > current.gold;
}

const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED], {
  stdio: ['pipe', 'pipe', 'inherit'],
});
const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
let outcome;
let lastView;

lines.on('line', (line) => {
  if (!line.trim()) return;
  const message = JSON.parse(line);
  if (message.schema === 'goldrush.view.v1') {
    lastView = message;
    child.stdin.write(`${JSON.stringify(ordersFor(message))}\n`);
  } else {
    outcome = message;
  }
});

const code = await new Promise((resolve, reject) => {
  child.on('error', reject);
  child.on('close', resolve);
});

if (code !== 0) process.exit(code);
if (!outcome) throw new Error('gr-sim ended without an outcome line.');

const previous = await previousOutcome();
const runsSoFar = (previous?.runsSoFar ?? 0) + 1;
const candidate = { ...outcome, runsSoFar };
if (process.env.GR_DEBUG_RUN) {
  process.stderr.write(`current-run ${JSON.stringify(candidate)}\n`);
  process.stderr.write(`last-view ${JSON.stringify({
    wave: lastView?.now?.wave,
    gold: lastView?.now?.gold,
    hero: lastView?.now?.hero,
    works: lastView?.now?.works?.byKind,
    entries: lastView?.now?.works?.entries?.map(({ id, index, tier, hp, maxHp, wrecked, position }) => (
      { id, index, tier, hp, maxHp, wrecked, position }
    )),
    worksHp: [lastView?.now?.works?.hp, lastView?.now?.works?.maxHp],
    threats: lastView?.now?.threats,
  })}\n`);
}
const result = isBetter(candidate, previous) ? candidate : { ...previous, runsSoFar };
await writeFile('outcome.json', `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result)}\n`);
