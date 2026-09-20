#!/usr/bin/env node

/**
 * THE MARE CLAIM PROVER — the floor ride for `e8-mare-claim-physics` (2026-09-03, L2).
 *
 * It drives the REAL door: it spawns `scripts/gr-sim.mjs` and answers each printed VIEW with one
 * line of standing orders on stdin, exactly as any rider would. No admission escape hatch, no
 * private handles, no balance edits — every verb below is in the public grammar
 * (`src/agent/StandingOrders.ts`): HARVEST, HOLD, BUILD, REPAIR_UNDER, SET_WEAPON, PICK_UPGRADE,
 * SECURE_CHOICE.
 *
 * THE OBJECTIVE IS THE REGOLITH RUN, SO THE PROOF HAS TO SHOW IT. The Mare Claim's own briefing
 * promises "Work the six regolith harvest grounds across the mare flat", and the bundle names
 * the objective "pan (regolith He-3 runs on suit timers)" (`specs/epoch-saga/e8-orbital-bundle.md`
 * §B). The door now latches on exactly that: `now.air.regolith.complete` opens the secure only
 * once every one of the six grounds has taken a pan tick while the Prospector's suit still held
 * air. Outside the three dome pads the suit drains one second per second from a 60-second fill;
 * inside a dome whose air holds it refills at 4/s. So the whole play is a rhythm: go out, work a
 * ground, come back under glass, breathe, go out again — and the trace has to show BOTH the
 * grounds being worked (`worked` growing to six) and the suit being managed (never panning dry).
 *
 * THE PLAY, in three beats:
 *   1. GUNS ON THE PADS. The hero holds its stake at (0,12), six wu north of the dome cluster's
 *      north edge (z=6) and inside turret range (16). Two turrets and two beacons on the centre
 *      pad's north edge come first; nothing is bought before they stand (the far-side lesson).
 *      A BUILD order walks itself to its pad (the executor moves the body when the target is
 *      out of placement reach), so the orders are a PRIORITY LIST rather than a staged tour:
 *      builds that can be paid for, then repairs, then the regolith run, then home to breathe.
 *      A target the engine refuses (`collision`, `out_of_zone`) is read off `now.orders` and
 *      dropped for good — the far-side lesson F-E8FS-3, applied instead of relearned.
 *   2. THE RUNS. Each turn the Prospector takes the active seam standing on a ground it has not
 *      yet worked (or the nearest active seam once all have been), drains it, and comes home to
 *      the breathing dome with the most air to refill. It only leaves when the suit can pay for
 *      the round trip with margin, so no tick is ever landed breathless.
 *   3. HOLD. Two more guns on the flank pads, beacons at the approaches, then a timber run along
 *      the pads' north edge to keep siegers off the turrets (a sieger on a pad breaches the dome).
 *
 * Usage: node artifacts/e8-mare-claim-physics/prover.mjs [--seed e8-mare-claim-01] [--tape <path>]
 *        [--views <ndjson-path>] [--no-refill] [--quiet]
 *   --no-refill  the CONTROL: the same rider that never goes home to breathe (HOLD at the stake
 *                instead of a dome), so its suit runs dry at 60 s and every later tick is
 *                breathless — it must NOT secure, however long it survives.
 * Prints a per-turn trace on stderr and the gr-sim outcome JSON on stdout.
 */

import { spawn } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const seed = valueOf('--seed') ?? 'e8-mare-claim-01';
const contract = valueOf('--contract') ?? 'e8-mare-claim';
const tape = valueOf('--tape');
/** `--views <path>`: every VIEW the rider answered, as NDJSON, followed by the outcome line. */
const viewsPath = valueOf('--views');
if (viewsPath) writeFileSync(viewsPath, '');
const quiet = args.includes('--quiet');
const noRefill = args.includes('--no-refill');

/** The hero's stake (no `heroStart` marker declared, so the door's default). */
const STAKE = { x: 0, z: 12 };
/** Where the Prospector breathes: one point inside each dome pad, a wu inside its walls. */
const DOME_POINTS = {
  'dome-cluster-pad-west': { x: -18, z: 2 },
  'dome-cluster-pad-center': { x: 0, z: 2 },
  'dome-cluster-pad-east': { x: 18, z: 2 },
};
const SUIT_MARGIN_SECONDS = 12;
const PROSPECTOR_SPEED = 4.8;
/** `Balance.goldSeam.tickGold`: one HARVEST order is one tick of five gold. */
const GOLD_PER_TICK = 5;

/**
 * THE BUILD LIST, in purchase order, every footprint inside a dome zone (x -24..-12 / -6..6 /
 * 12..24, z -6..6) with a wu of clearance from its neighbours and from the zone's edge — the
 * engine reports a footprint that touches either as a `collision`, and the first draft of this
 * list retried one such beacon every turn for eight waves with 200 gold pinned at the pan cap.
 * Turret range is 16 and the stake sits at (0,12), so the flank guns stop at |x| = 13.5 (15.1
 * wu from the stake); the north row sits at z = 5 / 5.5 so a 2x2 gun stays inside z <= 6.
 * Costs are the registry's own curves by ordinal (turret 50/70/95/125, beacon 25..95).
 */
const PLAN = [
  { what: 'turret', where: { x: -3, z: 5 }, costs: 50 },
  { what: 'turret', where: { x: 3, z: 5 }, costs: 70 },
  { what: 'sentry_beacon', where: { x: 0, z: 5.5 }, costs: 25 },
  { what: 'sentry_beacon', where: { x: -4, z: 2.5 }, costs: 35 },
  { what: 'turret', where: { x: -13.5, z: 5 }, costs: 95 },
  { what: 'turret', where: { x: 13.5, z: 5 }, costs: 125 },
  // The stockpile lifts the pan cap from 200 to 350, so the last gun and the last beacons can be
  // saved for instead of lost to the cap.
  { what: 'stockpile', where: { x: 0, z: 1 }, costs: 60 },
  { what: 'sentry_beacon', where: { x: 4, z: 2.5 }, costs: 45 },
  { what: 'sentry_beacon', where: { x: -16.5, z: 5.5 }, costs: 55 },
  { what: 'sentry_beacon', where: { x: 16.5, z: 5.5 }, costs: 75 },
  { what: 'sentry_beacon', where: { x: 0, z: -2 }, costs: 95 },
];

/**
 * THE DRAFT, AND ITS ORDER IS MEASURED. The two economy picks compound from wave one and pay for
 * the kit; after them the RIG's multipliers (`split_spark` +1 bolt per volley, `double_tap_coil`
 * +25% fire rate, `heavy_spark` +30% damage) come before plating and healing. The first draft of
 * this list ranked `field_dressing` (infinite stacks) above every damage pick, so at level 20+
 * the rider healed 30 hp a level instead of tripling its bolts, and died on wave 18 both seeds.
 */
const UPGRADE_PREFERENCE = [
  'pan_legend', 'prospectors_luck', 'split_spark', 'double_tap_coil', 'heavy_spark',
  'beacon_dynamo', 'tinkers_plating', 'sharpen', 'long_resonator', 'field_dressing',
  'spring_heels', 'assay_bonus', 'powder_charge', 'wide_ring', 'quick_fuse',
];

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/** The dome with the most air; ties go to the centre pad, then west, then east. */
function refillPoint(now) {
  if (noRefill) return STAKE;
  const domes = [...(now.air?.domes ?? [])].sort((a, b) => b.air - a.air);
  const best = domes.find((dome) => dome.air > 0.2) ?? domes[0];
  return (best && DOME_POINTS[best.id]) ?? DOME_POINTS['dome-cluster-pad-center'];
}

/**
 * The seam to work this turn: an active seam on a ground not yet worked, nearest first; once all
 * six are worked, the nearest active seam with gold left. Null when nothing is active.
 */
function pickSeam(now, from) {
  const worked = new Set(now.air?.regolith?.worked ?? []);
  const active = now.seams.filter((seam) => seam.active && seam.remaining > 0 && seam.x !== null);
  const fresh = active.filter((seam) => !worked.has(seam.anchorIndex));
  const pool = fresh.length > 0 ? fresh : active;
  return pool.sort((a, b) => distance(from, a) - distance(from, b))[0] ?? null;
}

/**
 * One breath's worth of regolith: the freshest seam first, then a second one if the suit can pay
 * for the longer loop, each drained with exactly the ticks it has left (a HARVEST on an emptied
 * seam fails and wakes the rider for nothing). The whole loop starts and ends at `home`.
 */
function runOrders(now, home) {
  const suit = now.air?.suit;
  const ticks = (seam) => Array.from({ length: Math.max(1, Math.ceil(seam.remaining / GOLD_PER_TICK)) }, () => ({ verb: 'HARVEST', seam: seam.id }));
  const affordable = (loop) => noRefill || !suit || suit.seconds >= loop / PROSPECTOR_SPEED + SUIT_MARGIN_SECONDS;
  const first = pickSeam(now, home);
  if (!first) return [];
  if (!affordable(distance(home, first) * 2)) return [];
  const rest = now.seams.filter((seam) => seam.active && seam.remaining > 0 && seam.x !== null && seam.id !== first.id);
  const second = rest.sort((a, b) => distance(first, a) - distance(first, b))[0];
  if (second && affordable(distance(home, first) + distance(first, second) + distance(second, home))) {
    return [...ticks(first), ...ticks(second)];
  }
  return ticks(first);
}

/** Pure function of THE VIEW (plus the refusals it has read): same seed in, same orders out. */
function orders(view, memo) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  memo.refused ??= new Set();
  for (const record of now.orders ?? []) {
    if (record.status === 'failed' && record.order?.verb === 'BUILD' && /collision|out_of_zone|UNREACHABLE/.test(record.reason ?? '')) {
      memo.refused.add(`${record.order.what}@${record.order.where.x},${record.order.where.z}`);
    }
  }

  const picks = [];
  if (now.pendingOffer?.length) {
    const offered = now.pendingOffer.map(({ id }) => id);
    picks.push({ verb: 'PICK_UPGRADE', id: UPGRADE_PREFERENCE.find((id) => offered.includes(id)) ?? offered[0] });
  }
  const home = refillPoint(now);
  const standing = now.works.byKind ?? {};
  const done = { turret: standing.turret ?? 0, sentry_beacon: standing.sentry_beacon ?? 0, stockpile: standing.stockpile ?? 0 };
  const seen = { turret: 0, sentry_beacon: 0, stockpile: 0 };
  const remaining = PLAN.filter((entry) => {
    seen[entry.what] += 1;
    return seen[entry.what] > done[entry.what];
  }).filter((entry) => !memo.refused.has(`${entry.what}@${entry.where.x},${entry.where.z}`));
  // THE CORE IS A LOCK; EVERYTHING AFTER IT IS A PREFERENCE (the far-side rule): before two guns
  // and two beacons stand, only the head of the list is bought, in order; after, anything that
  // can be paid for, so a 125-gold gun never blocks a 45-gold beacon.
  const coreStanding = done.turret >= 2 && done.sentry_beacon >= 2;
  const builds = [];
  let budget = now.gold;
  for (const entry of remaining) {
    if (budget < entry.costs) {
      if (coreStanding) continue;
      break;
    }
    budget -= entry.costs;
    builds.push({ verb: 'BUILD', what: entry.what, where: entry.where, when: { goldGte: entry.costs } });
    if (builds.length >= 3) break;
  }
  return [
    ...picks,
    // MEASURED, NOT ASSUMED: switching the hero to the Blast Charge once the core stood took both
    // seeds from wave 18 to waves 12/11. Under 0.6g the auto-fired lob reaches 24 wu but hangs
    // 1.68 s, and `targetPoint` aims at where the outlaw IS, so against moving packs it lands
    // behind them; the spark rig's continuous bolts hold the stake longer. The rider keeps the
    // rig; the gravity-scaled lob is proved by the door's own BLAST_AT event instead.
    ...builds,
    { verb: 'REPAIR_UNDER', pct: 60 },
    ...runOrders(now, home),
    { verb: 'HOLD', pos: home },
  ];
}

const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed, ...(tape ? ['--tape', tape] : [])], {
  cwd: ROOT,
  stdio: ['pipe', 'pipe', 'inherit'],
});
const memo = {};
let turns = 0;
let outcome = null;

for await (const line of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
  if (!line.trim()) continue;
  const message = JSON.parse(line);
  if (viewsPath) appendFileSync(viewsPath, `${line}\n`);
  if (message.schema !== 'goldrush.view.v1') {
    outcome = message;
    process.stdout.write(`${line}\n`);
    continue;
  }
  const now = message.now;
  if (!quiet) {
    const air = now.air;
    process.stderr.write(`t${turns} w${now.wave} gold=${now.gold} hp=${now.hero.hp.toFixed(0)}`
      + ` pros=(${now.prospector.x.toFixed(1)},${now.prospector.z.toFixed(1)})`
      + ` works=${JSON.stringify(now.works.byKind)} alive=${now.threats.alive} lvl=${now.hero.level}`
      + ` suit=${air ? `${air.suit.seconds.toFixed(1)}s${air.suit.inDome ? `@${air.suit.inDome.replace('dome-cluster-pad-', '')}` : '/out'}` : '???'}`
      + ` domes=${air ? air.domes.map((d) => `${d.id.slice(-1)}:${d.air.toFixed(2)}${d.breached ? '!' : ''}`).join(',') : '???'}`
      + ` worked=${air ? `${air.regolith.worked.length}/${air.regolith.required}` : '???'}`
      + ` breathless=${air?.regolith.breathlessPans ?? '?'}\n`);
  }
  turns += 1;
  if (!child.stdin.writable || child.stdin.destroyed) continue;
  try {
    child.stdin.write(`${JSON.stringify(orders(message, memo))}\n`);
  } catch {
    // gr-sim closes stdin the moment the run terminates; a lost final line is not an error.
  }
}

child.stdin.end();
const code = await new Promise((resolve) => child.on('close', resolve));
if (!quiet) process.stderr.write(`prover: ${turns} turns, gr-sim rc=${code}\n`);
if (!outcome?.secured) process.exitCode = 1;

function valueOf(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}
