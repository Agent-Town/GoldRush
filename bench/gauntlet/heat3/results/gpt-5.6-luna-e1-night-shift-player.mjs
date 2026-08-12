#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';

const ROOT = new URL('.', import.meta.url).pathname;
const CONTRACT = 'e1-night-shift';
const SEED = 'e1-night-shift-01';
const CENTER = { x: 0, z: 12 };

const buildPlan = [
  ['sentry_beacon', { x: 0, z: 14 }, 25],
  ['sentry_beacon', { x: 0, z: 10 }, 35],
  ['turret', { x: 4, z: 14 }, 50],
  ['turret', { x: -4, z: 14 }, 70],
  ['turret', { x: 4, z: 10 }, 95],
  ['turret', { x: -4, z: 10 }, 125],
  ['sentry_beacon', { x: -3, z: 12 }, 45],
  ['sentry_beacon', { x: 3, z: 12 }, 55],
  ['sentry_beacon', { x: -4, z: 16 }, 75],
];

const log = [];
let lastView;
const waveSnapshots = [];

const upgradePriority = [
  'tinkers_plating',
  'field_dressing',
  'powder_charge',
  'quick_fuse',
  'wide_ring',
  'heavy_spark',
  'double_tap_coil',
  'split_spark',
  'spring_heels',
  'pan_legend',
  'prospectors_luck',
  'beacon_dynamo',
  'assay_bonus',
];

function ordersFor(view) {
  const { now } = view;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  if (now.pendingOffer?.[0]) {
    const picked = now.pendingOffer.find(({ id }) => upgradePriority.includes(id)) ?? now.pendingOffer[0];
    return [{ verb: 'PICK_UPGRADE', id: picked.id }];
  }

  const built = now.works.byKind;
  const remaining = buildPlan.filter(([what], index) => (built[what] ?? 0) < buildPlan.slice(0, index + 1).filter(([kind]) => kind === what).length);
  const affordable = remaining.find(([, , cost]) => now.gold >= cost);
  const orders = [{ verb: 'SET_WEAPON', weapon: now.wave >= 6 ? 'blast' : 'rig' }];

  if (affordable) {
    const rider = now.prospector ?? now.hero;
    const distance = Math.hypot(rider.x - CENTER.x, rider.z - CENTER.z);
    if (distance > 1.5) orders.push({ verb: 'MOVE_TO', pos: CENTER });
    for (const [what, where, cost] of remaining) {
      orders.push({ verb: 'BUILD', what, where, when: { goldGte: cost } });
    }
  }

  const damaged = now.works.entries.some((entry) => entry.wrecked || entry.hp < entry.maxHp * 0.65);
  const repairReserve = now.works.entries.some((entry) => entry.wrecked && entry.id === 'lantern_post') ? 8 : 20;
  if (damaged && now.gold >= repairReserve && (!affordable || now.gold < affordable[2] + repairReserve)) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 100 });
  }

  const seams = now.seams
    .filter((seam) => seam.active && seam.remaining > 0)
    .sort((a, b) => b.remaining - a.remaining);
  for (const seam of seams) {
    for (let count = 0; count < Math.ceil(seam.remaining / 5); count += 1) {
      if (orders.length >= 31) break;
      orders.push({ verb: 'HARVEST', seam: seam.id });
    }
  }
  orders.push({ verb: 'HOLD', pos: CENTER });
  return orders.slice(0, 32);
}

function better(a, b) {
  if (!b) return true;
  if (a.secured !== b.secured) return a.secured;
  return a.waves > b.waves || (a.waves === b.waves && a.kills > b.kills);
}

async function recordOutcome(outcome) {
  let previous = null;
  try {
    previous = JSON.parse(await readFile(new URL('outcome.json', import.meta.url), 'utf8'));
  } catch {
    // First run.
  }
  const runsSoFar = (previous?.runsSoFar ?? 0) + 1;
  const previousBest = previous?.best ?? (previous?.secured !== undefined ? previous : null);
  const best = better(outcome, previousBest) ? outcome : previousBest;
  await writeFile(new URL('outcome.json', import.meta.url), `${JSON.stringify({ ...best, runsSoFar }, null, 2)}\n`);
  log.push({ run: runsSoFar, outcome, best });
  const lesson = outcome.secured
    ? `- Run ${runsSoFar} secured wave ${outcome.waves} with ${outcome.kills} kills, ${outcome.gold} gold, ${outcome.calls} order calls, and ${outcome.defaultedPicks} defaulted picks; banking was answered explicitly.`
    : `- Run ${runsSoFar} reached wave ${outcome.waves} with ${outcome.kills} kills and ${outcome.gold} gold before ending unsecured; the next revision should change the build/harvest priority.`;
  const notebook = new URL('NOTEBOOK.md', import.meta.url);
  const text = await readFile(notebook, 'utf8');
  await writeFile(notebook, `${text.trimEnd()}\n${lesson}\n`);
}

async function main() {
  const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED], {
    cwd: ROOT,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const childClosed = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code) => code === 0 ? resolve() : reject(new Error(`gr-sim exited ${code}`)));
  });
  const reader = createInterface({ input: child.stdout });
  let outcome;
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));
  for await (const line of reader) {
    if (!line.trim()) continue;
    const message = JSON.parse(line);
    if (message.schema === 'goldrush.view.v1') {
      lastView = message;
      const priorWave = waveSnapshots.at(-1)?.wave;
      if (priorWave !== message.now.wave) {
        waveSnapshots.push({
          wave: message.now.wave,
          hero: message.now.hero,
          gold: message.now.gold,
          threats: message.now.threats,
          works: message.now.works,
        });
      }
      const orders = ordersFor(message);
      child.stdin.write(`${JSON.stringify(orders)}\n`);
      continue;
    }
    outcome = message;
  }
  await childClosed;
  await recordOutcome(outcome);
  let priorReport = '';
  try {
    priorReport = await readFile(new URL('report.md', import.meta.url), 'utf8');
  } catch {
    // First run.
  }
  const report = `# Night Shift run report\n\n${log.map(({ run, outcome: result }) => `## Run ${run}\n\n- secured: ${result.secured}\n- waves: ${result.waves}\n- timeMs: ${result.timeMs}\n- gold: ${result.gold}\n- kills: ${result.kills}\n- calls: ${result.calls}\n- defaultedPicks: ${result.defaultedPicks}\n- defaultedSecure: ${result.defaultedSecure}\n- eventLogHash: ${result.eventLogHash}\n- finalView: ${JSON.stringify(lastView?.now ?? null)}`).join('\n\n')}\n\n### Wave snapshots\n\n${waveSnapshots.map((snapshot) => `- wave ${snapshot.wave}: hero ${Math.round(snapshot.hero.hp)} hp, ${snapshot.threats.alive} threats, ${snapshot.works.standing} standing works, ${snapshot.works.wrecked} wrecked`).join('\n')}\n`;
  await writeFile(new URL('report.md', import.meta.url), `${priorReport ? `${priorReport.trimEnd()}\n\n---\n\n` : ''}${report}`);
}

await main();
