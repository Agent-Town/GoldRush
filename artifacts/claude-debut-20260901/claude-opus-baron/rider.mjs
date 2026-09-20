#!/usr/bin/env node
// claude-opus-5 — e1-baron rider (era 5, "the Replayed Board").
//
// Open-book: the shape of this fort comes from the county's shared baron-campaign
// war-room (rob's human reference w30, codex's r1/r10/r19/r20 attempt notes) and from
// reading the era-5 source in src/agent/StandingOrders.ts, src/agent/View.ts and
// src/sim/HeadlessContractSim.ts. The code is mine; the strategy is the county's.
//
// The load-bearing facts I verified in source before writing a line:
//   * StandingOrders.execute(): BUILD walks the PROSPECTOR to the site and fails with
//     "UNREACHABLE: BUILD target has no traversable approach." after 4s of no progress,
//     so every build is prefixed with an explicit MOVE_TO (StandingOrders.ts:278-298).
//   * REPAIR_UNDER takes the FIRST eligible work, not a chosen one (:301-309). It cannot
//     be aimed; withholding it to avoid the wrong target repairs nothing, which is worse.
//   * BLAST_AT measures range from the HERO (HeadlessContractSim.ts:2367), not from the
//     Prospector, and shares the automatic Blast shooter's cooldown timer (:2385).
//   * A failed order raises an order_failure surprise (StandingOrders.ts:415-421), and a
//     surprise ends the turn (HeadlessContractSim.ts:1168-1174). An order that fails
//     honestly therefore BUYS A DECISION POINT — deliberate, published, load-bearing.
//   * fail() de-duplicates by (order identity, reason), and a success clears that memo,
//     so a blast that lands and then cools down keeps yielding fresh turns.

import { createWriteStream } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const ROOT = '/tmp/heat8-4675cfd7';
const HERE = `${ROOT}/artifacts/claude-opus-baron`;

// ---------------------------------------------------------------- the ground
// All coordinates checked against the live first view: claim (0,12), river/ford
// across z~6.5-7, seams at (-9,6.7) / (-1.5,-6.4) / (-22,-6.8) live at boot.
const CLAIM = { x: 0, z: 12 };
const SLUICES = [{ x: -10, z: 7 }, { x: -6, z: 7 }, { x: -2, z: 7 }];
const TURRETS = [{ x: -6, z: 12 }, { x: -2, z: 12 }, { x: 2, z: 12 }, { x: 6, z: 12 }];
const BEACONS = [{ x: 0, z: 15 }, { x: -6, z: 14 }, { x: -4, z: 15 }, { x: 2, z: 15 }, { x: 3, z: 14 }, { x: 3, z: 16 }];
const STOCKPILES = [{ x: -10, z: 14 }, { x: 10, z: 14 }];
// Panel 0 is the route blocker the Baron must break; the flanks are shot-decoys.
const PALISADES = [{ x: 0, z: 11 }, { x: -10, z: 11 }, { x: 10, z: 11 }];
const BLOCKER = PALISADES[0];

// From stablePrefix.mechanics.buildables in the live view, not from memory.
const COSTS = { sentry_beacon: [25, 35, 45, 55, 75, 95], sluice: 40, turret: [50, 70, 95, 125], stockpile: 60, palisade: 10 };
const TIER_COSTS = { sluice: [0, 120, 240], turret: [0, 150, 300] };

const buildStep = (id, index, at) => ({ kind: 'build', id, index, pos: at[index], cost: Array.isArray(COSTS[id]) ? COSTS[id][index] : COSTS[id] });
const upgradeStep = (id, index, fromTier) => ({ kind: 'upgrade', id, index, fromTier, cost: TIER_COSTS[id][fromTier] });

// Economy first (sluices pay for the guns), then the gun line, then the rest of the
// beacon ring and the second stockpile. One early beacon buys slow while the sluices pay.
const PLAN = [
  buildStep('sluice', 0, SLUICES), buildStep('sentry_beacon', 0, BEACONS),
  buildStep('sluice', 1, SLUICES), buildStep('sluice', 2, SLUICES),
  ...TURRETS.map((_, i) => buildStep('turret', i, TURRETS)),
  buildStep('stockpile', 0, STOCKPILES),
  ...SLUICES.flatMap((_, i) => [upgradeStep('sluice', i, 1), upgradeStep('sluice', i, 2)]),
  buildStep('sentry_beacon', 1, BEACONS), buildStep('sentry_beacon', 2, BEACONS),
  ...TURRETS.map((_, i) => upgradeStep('turret', i, 1)),
  ...TURRETS.map((_, i) => upgradeStep('turret', i, 2)),
  ...BEACONS.slice(3).map((_, o) => buildStep('sentry_beacon', o + 3, BEACONS)),
  buildStep('stockpile', 1, STOCKPILES),
];

const KNOBS = {
  bossWave: 19,        // start the palisade line one wave before the Baron rides
  repairPct: 31,       // a wave-20 panel sits at 52/180 after one 128-damage strike
  goldCeiling: 480,    // stop panning near the two-stockpile cap (200 + 150 + 150)
  variant: 'proven',
  run: 1,
};
for (const arg of process.argv.slice(2)) {
  const [key, value] = arg.replace(/^--/, '').split('=');
  if (key in KNOBS) KNOBS[key] = Number.isNaN(Number(value)) ? value : Number(value);
}

// ------------------------------------------------------------- the draft
// Damage first: the Baron is an hpScale-240 sponge and tank-and-survive is measured to
// lose (w21-23 alive, boss still standing). Plating/dressing only when the run is late
// or the hero is already hurt.
function pickUpgrade(view) {
  const offer = view.now.pendingOffer ?? [];
  if (!offer.length) return null;
  const hpRatio = view.now.hero.hp / Math.max(1, view.now.hero.maxHp);
  const late = view.now.wave >= 16 || hpRatio < 0.72;
  const veryLate = view.now.wave >= 18 || hpRatio < 0.72;
  const worth = {
    split_spark: 130, heavy_spark: 124, double_tap_coil: 121, long_resonator: 116,
    powder_charge: 113, quick_fuse: 111, beacon_dynamo: 109, chain_spark_arc: 106,
    beacon_handoff: 104, tinkers_plating: late ? 145 : 101,
    sharpen: 100, wide_ring: 94, spark_pressure_ring: 92,
    field_dressing: veryLate ? 142 : 60,
    prospectors_luck: 52, rich_seam_pact: 48, stockpile_seam_survey: 45,
    pan_legend: 40, assay_bonus: 38, spring_heels: 20, prospector_policy_slot: 5,
  };
  return [...offer].sort((a, b) => (worth[b.id] ?? 50) - (worth[a.id] ?? 50))[0];
}

const near = (a, b) => Math.abs(a.x - b.x) < 0.2 && Math.abs(a.z - b.z) < 0.2;

// The next unfinished step of the fort, or null when the lattice is complete.
function nextStep(view) {
  const entries = view.now.works.entries ?? [];
  const step = PLAN.find((candidate) => candidate.kind === 'build'
    ? !entries.some((entry) => entry.id === candidate.id && near(entry.position, candidate.pos))
    : entries.some((entry) => entry.id === candidate.id && entry.index === candidate.index && entry.tier === candidate.fromTier));
  if (!step) return null;
  if (step.kind === 'build') {
    return { cost: step.cost, pos: step.pos, order: { verb: 'BUILD', what: step.id, where: step.pos, when: { goldGte: step.cost } } };
  }
  const entry = entries.find((e) => e.id === step.id && e.index === step.index);
  if (!entry) return null;
  return { cost: step.cost, pos: entry.position, order: { verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: step.id, index: step.index } } };
}

// The three wave-19 panels, cheapest possible route control.
function nextPalisade(view) {
  const built = view.now.works.byKind?.palisade ?? 0;
  if (built >= PALISADES.length) return null;
  const pos = PALISADES[built];
  return { cost: COSTS.palisade, pos, order: { verb: 'BUILD', what: 'palisade', where: pos, when: { goldGte: COSTS.palisade } } };
}

// Aim at the lane the wave is actually coming down; during the boss, aim at the blocker
// where he is held. Range is measured from the hero, who holds the claim at (0,12).
function blastTarget(view, boss) {
  if (boss) return BLOCKER;
  const edge = view.now.threats?.edge;
  if (edge === 'north') return { x: 0, z: 20 };
  if (edge === 'south') return { x: 0, z: 4 };
  if (edge === 'east') return { x: 8, z: 12 };
  if (edge === 'west') return { x: -8, z: 12 };
  return { x: 0, z: 9 };
}

// The weapon line. Quiet board: just keep the Rig selected (idempotent, never toggles).
// Boss: pulse one tick of Blast mode so the AUTOMATIC blast shooter gets a shot, restore
// the Rig immediately so continuous fire never stops, then throw a directed charge.
function weaponOrders(view, boss = false) {
  if ((view.now.threats?.alive ?? 0) === 0) return [{ verb: 'SET_WEAPON', weapon: 'rig' }];
  if (KNOBS.variant === 'compact') {
    // The open question heat-6 left: pad with idempotent SET_WEAPON rig (each consumes one
    // tick and SUCCEEDS, so no surprise fires) until the Blast cooldown has burned down,
    // then throw. Same fort, same draft — only the cadence and the reel size change.
    const waits = Math.min(26, Math.ceil((view.now.blastReadyInMs ?? 0) / (1000 / 30)));
    const shot = { verb: 'BLAST_AT', pos: blastTarget(view, boss) };
    return [...Array.from({ length: waits }, () => ({ verb: 'SET_WEAPON', weapon: 'rig' })), shot, shot];
  }
  if (boss) {
    return [
      { verb: 'SET_WEAPON', weapon: 'blast' },
      { verb: 'SET_WEAPON', weapon: 'rig' },
      { verb: 'BLAST_AT', pos: BLOCKER },
    ];
  }
  const blast = { verb: 'BLAST_AT', pos: blastTarget(view, false) };
  return (view.now.blastReadyInMs ?? 0) <= 80 ? [blast, blast] : [blast];
}

// Pan the nearest live seam. HARVEST is a per-order machine tick, so a batch of identical
// orders is a batch of pans; the walk to the seam is paid once.
function moneyOrders(view) {
  if ((view.now.gold ?? 0) >= KNOBS.goldCeiling) return [];
  const body = view.now.prospector ?? CLAIM;
  const live = (view.now.seams ?? []).filter((s) => s.active && s.remaining > 0 && Number.isFinite(s.x) && Number.isFinite(s.z));
  if (!live.length) return [];
  const seam = live.slice().sort((a, b) => Math.hypot(a.x - body.x, a.z - body.z) - Math.hypot(b.x - body.x, b.z - body.z))[0];
  const pans = Math.min(12, Math.ceil(seam.remaining / 5) + 1);
  return Array.from({ length: pans }, () => ({ verb: 'HARVEST', seam: seam.id }));
}

// The view strips the internal repairCost, so price a repair from the published formula
// (25% of invested cost) rather than reading a field that is not there.
function repairPrice(entry) {
  if (entry.id === 'sluice') return Math.ceil((40 + (entry.tier >= 2 ? 120 : 0) + (entry.tier >= 3 ? 240 : 0)) * 0.25);
  if (entry.id === 'turret') return Math.ceil(((COSTS.turret[entry.index] ?? 50) + (entry.tier >= 2 ? 150 : 0) + (entry.tier >= 3 ? 300 : 0)) * 0.25);
  if (entry.id === 'sentry_beacon') return Math.ceil((COSTS.sentry_beacon[entry.index] ?? 25) * 0.25);
  return 15;
}

const cap = (orders) => (orders.length ? orders.slice(0, 32) : [{ verb: 'HOLD', pos: CLAIM }]);

function ordersFor(view) {
  if (view.now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const offer = pickUpgrade(view);
  const head = offer ? [{ verb: 'PICK_UPGRADE', id: offer.id }] : [];
  const entries = view.now.works.entries ?? [];
  const boss = view.now.wave >= KNOBS.bossWave;

  if (boss) {
    const panel = nextPalisade(view);
    if (panel) {
      if (view.now.gold >= panel.cost) return cap([...head, { verb: 'MOVE_TO', pos: panel.pos }, panel.order, ...weaponOrders(view)]);
      const coin = moneyOrders(view);
      if (coin.length) return cap([...head, ...coin]);
    }
    // Keep the blocker alive IN PLACE. Demolish-and-rebuild is measured to lose: the
    // slot deactivates, the Baron walks the dead footprint, and the new panel lands
    // behind him. Repair before the wreck, and do not guard the selector — letting it
    // clear an earlier eligible work still reaches the blocker; refusing repairs does not.
    const hurt = entries.some((e) => e.id === 'palisade' && e.index === 0 && (e.wrecked || e.hp / Math.max(1, e.maxHp) < KNOBS.repairPct / 100));
    if (hurt) return cap([...head, { verb: 'REPAIR_UNDER', pct: KNOBS.repairPct }, ...weaponOrders(view, true)]);
    return cap([...head, ...weaponOrders(view, true), { verb: 'HOLD', pos: CLAIM }]);
  }

  // Before the boss, only fully wrecked works are worth walking to; palisades do not
  // exist yet, and a scratch is cheaper to ignore than to cross the claim for.
  const ruined = entries.find((e) => e.wrecked && e.id !== 'palisade');
  if (ruined) {
    if (view.now.gold >= repairPrice(ruined)) return cap([...head, { verb: 'REPAIR_UNDER', pct: 1 }, ...weaponOrders(view)]);
    const coin = moneyOrders(view);
    if (coin.length) return cap([...head, ...coin]);
  }

  const step = nextStep(view);
  if (step && view.now.gold >= step.cost) return cap([...head, { verb: 'MOVE_TO', pos: step.pos }, step.order, ...weaponOrders(view)]);
  const coin = moneyOrders(view);
  if (coin.length) return cap([...head, ...coin]);
  return cap([...head, ...weaponOrders(view)]);
}

// ------------------------------------------------------------------ the door
const run = String(KNOBS.run);
const tapePath = `${HERE}/attempt-${run}-tape.json`;
const transcript = createWriteStream(`${HERE}/attempt-${run}.jsonl`);
const stderrLog = createWriteStream(`${HERE}/attempt-${run}.stderr.log`);

const child = spawn(process.execPath, [
  'scripts/gr-sim.mjs', '--contract', 'e1-baron', '--seed', 'e1-baron-01',
  '--difficulty', 'trail', '--tape', tapePath,
], { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });

let buffer = '';
let outcome = null;
let turns = 0;
const started = Date.now();

child.stdout.on('data', (chunk) => {
  buffer += chunk;
  let newline;
  while ((newline = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, newline);
    buffer = buffer.slice(newline + 1);
    if (!line.trim()) continue;
    let message;
    try {
      message = JSON.parse(line);
    } catch (error) {
      stderrLog.write(`unparsable stdout line: ${error.message}\n`);
      continue;
    }
    if (message.schema !== 'goldrush.view.v1') {
      outcome = message;
      transcript.write(`${JSON.stringify({ type: 'outcome', outcome: message })}\n`);
      continue;
    }
    turns += 1;
    let orders;
    try {
      orders = ordersFor(message);
    } catch (error) {
      stderrLog.write(`policy threw at wave ${message.now.wave}: ${error.stack}\n`);
      orders = [{ verb: 'HOLD', pos: CLAIM }];
    }
    if (turns % 200 === 0 || message.now.wave >= KNOBS.bossWave) {
      transcript.write(`${JSON.stringify({
        turn: turns, wave: message.now.wave, gold: message.now.gold, hero: message.now.hero,
        threats: message.now.threats, works: message.now.works, orders,
      })}\n`);
    }
    child.stdin.write(`${JSON.stringify(orders)}\n`);
  }
});

child.stderr.on('data', (chunk) => stderrLog.write(chunk));

child.on('close', async (code) => {
  transcript.end();
  stderrLog.end();
  const wall = ((Date.now() - started) / 1000).toFixed(1);
  if (!outcome) {
    console.error(`gr-sim exited ${code} with no outcome after ${wall}s / ${turns} turns`);
    process.exitCode = 1;
    return;
  }
  const record = { ...outcome, attempt: Number(run), turns, wallSeconds: Number(wall), tape: tapePath, knobs: KNOBS };
  await writeFile(`${HERE}/attempt-${run}-outcome.json`, `${JSON.stringify(record, null, 2)}\n`);
  console.log(JSON.stringify(record));
});
