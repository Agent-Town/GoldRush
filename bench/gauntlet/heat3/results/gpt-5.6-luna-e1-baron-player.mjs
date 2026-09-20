#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const CONTRACT = 'e1-baron';
const SEED = 'e1-baron-01';
const MAX_RUNS = 6;
const ERA = 'dbcbf312';

const TURRET_SLOTS = [
  { x: -3, z: 12 },
  { x: 3, z: 12 },
  { x: -3, z: 16 },
  { x: 3, z: 16 },
];
const BEACON_SLOTS = [
  { x: -1, z: 16 },
  { x: 1, z: 16 },
];
const PALISADE_SLOTS = [
  { x: -5, z: 12 },
  { x: 5, z: 12 },
  { x: -5, z: 16 },
  { x: 5, z: 16 },
];
const SLUICE_SLOT = { x: 0, z: 7 };
const SLUICE_COST = 40;
const TURRET_COSTS = [50, 70, 95, 125];
const BEACON_COSTS = [25, 35];

function firstUnbuilt(entries, id, slots) {
  const built = entries.filter((entry) => entry.id === id).length;
  return built < slots.length ? { slot: slots[built], count: built } : null;
}

function ordersFor(view) {
  const now = view.now;
  if (!now || now.hero.hp <= 0 || now.score?.terminal) return [];

  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  if (now.pendingOffer?.[0]) return [{ verb: 'PICK_UPGRADE', id: now.pendingOffer[0].id }];

  const orders = [{ verb: 'REPAIR_UNDER', pct: 100 }];
  const entries = now.works?.entries ?? [];
  const sluice = firstUnbuilt(entries, 'sluice', [SLUICE_SLOT]);
  const turret = firstUnbuilt(entries, 'turret', TURRET_SLOTS);
  const beacon = firstUnbuilt(entries, 'sentry_beacon', BEACON_SLOTS);
  const palisade = firstUnbuilt(entries, 'palisade', PALISADE_SLOTS);
  const nextBuild = sluice
    ? { what: 'sluice', where: sluice.slot, cost: SLUICE_COST }
    : turret
      ? { what: 'turret', where: turret.slot, cost: TURRET_COSTS[turret.count] }
      : beacon
        ? { what: 'sentry_beacon', where: beacon.slot, cost: BEACON_COSTS[beacon.count] }
        : palisade
          ? { what: 'palisade', where: palisade.slot, cost: 10 }
          : null;

  if (nextBuild && now.gold >= nextBuild.cost) {
    orders.push({ verb: 'MOVE_TO', pos: nextBuild.where });
    orders.push({ verb: 'BUILD', what: nextBuild.what, where: nextBuild.where, when: { goldGte: nextBuild.cost } });
  }

  if (now.wave >= 6 && now.weapon !== 'blast') orders.push({ verb: 'SET_WEAPON', weapon: 'blast' });

  const activeSeams = (now.seams ?? [])
    .filter((entry) => entry.active)
    .sort((a, b) => b.remaining - a.remaining || a.id.localeCompare(b.id));
  if (activeSeams.length > 0) {
    const seam = activeSeams[0];
    for (let index = 0; index < 7; index += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
  } else {
    orders.push({ verb: 'HOLD', pos: { x: 0, z: 12 } });
  }

  if (now.weapon === 'blast' && now.blastReadyInMs === 0) {
    orders.splice(1, 0, { verb: 'BLAST_AT', pos: { x: now.hero.x, z: now.hero.z } });
  }
  return orders;
}

function readRuns() {
  if (!existsSync('outcome.json')) return [];
  try {
    const value = JSON.parse(readFileSync('outcome.json', 'utf8'));
    return Array.isArray(value.runsSoFar) ? value.runsSoFar : [];
  } catch {
    return [];
  }
}

function better(a, b) {
  if (!a) return b;
  if (Boolean(b.secured) !== Boolean(a.secured)) return b.secured ? b : a;
  if (b.waves !== a.waves) return b.waves > a.waves ? b : a;
  if (b.kills !== a.kills) return b.kills > a.kills ? b : a;
  return b.gold > a.gold ? b : a;
}

function recordOutcome(outcome, runs) {
  const nextRuns = [...runs, { run: runs.length + 1, ...outcome }];
  const best = nextRuns.reduce((winner, run) => better(winner, run), null);
  writeFileSync('outcome.json', `${JSON.stringify({ ...best, runsSoFar: nextRuns }, null, 2)}\n`);
  appendFileSync(
    'NOTEBOOK.md',
    `\n- Run ${nextRuns.length} (${ERA}) on ${CONTRACT}/${SEED}: ${outcome.secured ? 'SECURED' : 'not secured'} at wave ${outcome.waves}, ${outcome.kills} kills, ${outcome.gold} gold, ${outcome.calls} order calls, ${outcome.defaultedPicks} defaulted picks, ${outcome.defaultedSecure} defaulted secure choices.\n`,
  );
  return { best, runs: nextRuns };
}

function runOnce() {
  return new Promise((resolve, reject) => {
    const sim = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', CONTRACT, '--seed', SEED], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const stdout = createInterface({ input: sim.stdout, crlfDelay: Infinity });
    const stderr = createInterface({ input: sim.stderr, crlfDelay: Infinity });
    let outcome = null;
    let settled = false;

    stderr.on('line', (line) => process.stderr.write(`${line}\n`));
    stdout.on('line', (line) => {
      let value;
      try {
        value = JSON.parse(line);
      } catch {
        return;
      }
      if (typeof value.secured === 'boolean' && !value.now) {
        outcome = value;
        return;
      }
      if (value.now?.hero?.hp <= 0 || value.now?.score?.terminal) return;
      if (process.env.DEBUG_PLAYER === '1') {
        const failures = value.now.orders.filter((entry) => entry.status === 'failed').map((entry) => entry.reason).join(' | ');
        const surprises = value.appendLog.at(-1)?.surprises?.join(',') ?? '';
        process.stderr.write(`view wave=${value.now.wave} gold=${value.now.gold} hp=${value.now.hero.hp} works=${value.now.works.standing} prospector=${JSON.stringify(value.now.prospector)} seams=${value.now.seams.filter((entry) => entry.active).length} failures=${failures} surprises=${surprises}\n`);
      }
      sim.stdin.write(`${JSON.stringify(ordersFor(value))}\n`);
    });
    sim.on('error', (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
    sim.on('close', (code) => {
      stdout.close();
      stderr.close();
      if (settled) return;
      settled = true;
      if (!outcome) return reject(new Error(`simulator exited ${code} without an outcome`));
      resolve(outcome);
    });
  });
}

const runs = readRuns();
if (runs.some((run) => run.secured)) {
  process.stderr.write('SECURE already recorded; no further run.\n');
  process.exit(0);
}
if (runs.length >= MAX_RUNS) {
  process.stderr.write(`Run cap reached (${MAX_RUNS}); no further run.\n`);
  process.exit(0);
}

const requested = Math.max(1, Math.min(MAX_RUNS - runs.length, Number(process.argv[2] ?? 1)));
for (let index = 0; index < requested; index += 1) {
  const outcome = await runOnce();
  const result = recordOutcome(outcome, readRuns());
  process.stderr.write(`run ${result.runs.length}: ${JSON.stringify(outcome)}\n`);
  if (outcome.secured) break;
}
