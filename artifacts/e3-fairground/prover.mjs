#!/usr/bin/env node

/**
 * THE FAIRGROUND PROVER — the run that admitted `e3-fairground` (2026-08-20).
 *
 * It drives the REAL door: it spawns `scripts/gr-sim.mjs` and answers each printed VIEW with a
 * line of standing orders on stdin, exactly as any rider would. No admission escape hatch, no
 * private handles, no balance edits — every verb below is in the public grammar
 * (`src/agent/StandingOrders.ts`): HARVEST, HOLD, BUILD, REPAIR_UNDER, PICK_UPGRADE,
 * SECURE_CHOICE.
 *
 * WHAT THE FAIR ASKS FOR, and why the play looks like this:
 *   1. THE WHEEL IS A MAGNET. Every wrecker on this tile is a `fevered_saboteur`, and the roster
 *      spawns them west and east on the hero's own ring (~26 units out). With no other building
 *      standing, the nearest building to a saboteur is the Fair Wheel at (0,8) — 47 units away and
 *      completely undefended. ONE point of damage stops the dynamo for the whole run, so the first
 *      10 gold in the run buys a palisade beside the hero: from then on the saboteurs turn south
 *      and the wheel is never the nearest thing again. Measured: undefended, the wheel takes its
 *      first hit at t~21 and is rubble by t~33.
 *   2. THE CROWDS NEED A RING THEY CAN LEAVE. A flock takes fright at any live enemy within 7. The
 *      middle crowd waits on the gate stake, which is where the hero stands and where every enemy
 *      is heading — so a tight palisade box (radius 5) parks besiegers INSIDE the escort ring and
 *      that crowd can never step out. The ring is therefore built at radius EIGHT: besiegers stop
 *      one unit beyond the fright radius, and the crowd gets its nights.
 *   3. NO TURRETS HERE. `twist.powerGrid` removes `turret` from the offered buildables, so the
 *      whole defence is four sentry beacons and a palisade ring, kept standing by REPAIR_UNDER.
 *
 * Usage: node artifacts/e3-fairground/prover.mjs --seed e3-fairground-01 [--quiet]
 * Prints a per-turn trace on stderr and the gr-sim outcome JSON on stdout.
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const seed = valueOf('--seed') ?? 'e3-fairground-01';
const contract = valueOf('--contract') ?? 'e3-fairground';
const quiet = args.includes('--quiet');

/** The gate stake: hero start, fort centre, and the middle crowd's own lane. */
const GATE = { x: 0, z: -30 };
/** The first purchase of the run: a post beside the hero, nearer every saboteur than the wheel. */
const FIRST_POST = { x: 0, z: -33 };
/**
 * The palisade ring at radius 8 — one unit outside the declared escort radius of 7, so a besieger
 * pressed against it does NOT frighten the crowd waiting at the gate.
 */
const RING = ringPlan(8, 4);
/**
 * Four beacons inside the ring; range 8 reaches the wall from here. Costs 25/35/45/55.
 * MEASURED, not guessed: pushing them out to the ring's diagonals (radius 8) to keep swinging
 * wreckers outside the crowds' fright radius collapsed the run from wave 14 to wave 4 — the
 * beacons stop covering the stake itself and the hero dies. These four positions stand.
 */
const BEACONS = [{ x: -4, z: -26 }, { x: 4, z: -26 }, { x: -4, z: -34 }, { x: 4, z: -34 }];
/** Four places to stand, between them within `placeRadius` 6 of every ring segment. */
const STAGES = [{ x: 0, z: -24 }, { x: 0, z: -36 }, { x: -5, z: -30 }, { x: 5, z: -30 }];
/** Combat first, then the panning legs; the fair is won by killing, not by hoarding. */
const PICKS = [
  'tinkers_plating', 'heavy_spark', 'double_tap_coil', 'split_spark',
  'beacon_dynamo', 'field_dressing', 'sharpen', 'long_resonator',
];
/** `Balance.beacon.placeRadius`, with a margin so a drifting Prospector still reaches. */
const REACH = 5.4;
/** The declared build zones: south midway, then the two pavilion aprons. */
const ZONES = [
  { minX: -36, maxX: 36, minZ: -38, maxZ: -12 },
  { minX: -38, maxX: -10, minZ: -8, maxZ: 30 },
  { minX: 10, maxX: 38, minZ: -8, maxZ: 30 },
];

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const at = (spot) => ({ x: spot.x, z: spot.z });

function ringPlan(radius, step) {
  const plan = [];
  for (let x = -radius; x <= radius; x += step) {
    plan.push({ x, z: GATE.z - radius, rotationSteps: 1 });
    plan.push({ x, z: GATE.z + radius, rotationSteps: 1 });
  }
  for (let z = GATE.z - radius + step; z <= GATE.z + radius - step; z += step) {
    plan.push({ x: -radius, z, rotationSteps: 0 });
    plan.push({ x: radius, z, rotationSteps: 0 });
  }
  return plan;
}

/**
 * The legal build spot nearest the gate that a Prospector standing on `seam` can reach. Searched
 * on rings around the seam rather than by clamping into a zone: a clamp lands on the zone's corner,
 * which is often just past `placeRadius`, and then nothing is built at all.
 */
function decoySpot(seam, blocked) {
  const candidates = [];
  for (const radius of [2, 3.2, 4.2]) {
    for (let step = 0; step < 16; step += 1) {
      const angle = (step / 16) * Math.PI * 2;
      const spot = {
        x: Number((seam.x + Math.cos(angle) * radius).toFixed(2)),
        z: Number((seam.z + Math.sin(angle) * radius).toFixed(2)),
      };
      if (!ZONES.some((zone) => spot.x >= zone.minX && spot.x <= zone.maxX && spot.z >= zone.minZ && spot.z <= zone.maxZ)) continue;
      if (blocked.has(`${spot.x}:${spot.z}`)) continue;
      candidates.push(spot);
    }
  }
  return candidates.sort((left, right) => distance(left, GATE) - distance(right, GATE))[0] ?? null;
}

/**
 * The legal ground CLOSEST TO THE GATE on the straight line from `seam` home — near enough that
 * the hero's own rig (range 10) defends it, far enough that the walk still beats the first
 * saboteur. A post planted halfway is up sooner and dead sooner: undefended, it lasts 8 seconds.
 */
function decoyOnPath(seam) {
  for (const t of [0.85, 0.75, 0.65, 0.5, 0.4, 0.3]) {
    const spot = {
      x: Number((seam.x + (GATE.x - seam.x) * t).toFixed(2)),
      z: Number((seam.z + (GATE.z - seam.z) * t).toFixed(2)),
    };
    if (ZONES.some((zone) => spot.x >= zone.minX && spot.x <= zone.maxX && spot.z >= zone.minZ && spot.z <= zone.maxZ)) return spot;
  }
  return FIRST_POST;
}

/** Spots a previous turn asked for and the engine refused: never asked for twice. */
function refusals(view, blocked) {
  for (const record of view.now.orders ?? []) {
    if (record.status !== 'failed' || record.order?.verb !== 'BUILD') continue;
    blocked.add(`${record.order.where.x}:${record.order.where.z}`);
  }
  return blocked;
}

/** Pure function of THE VIEW (plus a little memory): same seed in, same orders out. */
function orders(view, memo) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const pick = now.pendingOffer
    ? PICKS.find((id) => now.pendingOffer.some((entry) => entry.id === id)) ?? now.pendingOffer[0].id
    : null;
  const head = pick ? [{ verb: 'PICK_UPGRADE', id: pick }] : [];

  const standing = now.works.entries.filter((entry) => !entry.wrecked);
  // A WRECK STILL OWNS ITS GROUND. `place_building` refuses a spot a rubble pile sits on, so a
  // rider that treats wrecked works as missing re-orders the same refused build every turn and
  // never reaches the REPAIR_UNDER below it — which is the verb that actually brings it back.
  const posts = now.works.entries.filter((entry) => entry.id === 'palisade');
  const beacons = now.works.entries.filter((entry) => entry.id === 'sentry_beacon');
  const seam = pickSeam(view, memo);
  const pan = (count) => (seam ? Array.from({ length: count }, () => ({ verb: 'HARVEST', seam: seam.id })) : []);
  // Repair is FIRST in the standing list and returns null when nothing is hurt, so it pre-empts
  // panning exactly when the fort needs it and costs nothing when it does not.
  const keep = [{ verb: 'REPAIR_UNDER', pct: 60 }, ...pan(8)];

  // BEAT 1 — THE WHEEL'S DECOY, AND IT IS A RACE. Undefended, the wheel takes its first hit at
  // t~21s and one hit ends the run's chances. The Prospector cannot pan at the seam ring AND
  // stand at the gate, so the first post goes up WHERE IT IS PANNING: any standing building is
  // nearer to a saboteur's spawn ring than a wheel 47 units away, and that is all the wheel needs.
  // THE WHOLE OPENING IN ONE SUBMISSION, because there may be no second turn in time. Standing
  // orders are STRICT PRIORITY (`StandingOrders.tick` returns on the first order that acts), so a
  // list is a script: pan exactly twice (10 gold), walk back with MOVE_TO — which completes on
  // arrival where HOLD never would — plant the post, then fall through to panning for the rest.
  if (standing.length === 0) {
    // The post goes up ON THE WAY HOME, at the first legal ground between the seam and the gate:
    // the walk back to the stake costs ~7 seconds the wheel does not have, and a post halfway is
    // still nearer to every saboteur's spawn ring than a wheel 47 units north of them.
    const spot = seam ? decoyOnPath(seam) : FIRST_POST;
    memo.decoy = spot;
    return [
      ...head,
      ...pan(2),
      { verb: 'MOVE_TO', pos: at(spot) },
      { verb: 'BUILD', what: 'palisade', where: at(spot), when: { goldGte: 10 } },
      ...keep,
    ];
  }

  // BEAT 2 — the fort, bought in trips. Only pieces the purse ALREADY covers are ordered, so every
  // BUILD fires on the tick the body reaches the stage and none is left waiting to fail from afar.
  // GUNS FIRST, THEN THE WALL. The hero cannot move on this claim — it is a hundred-hit-point
  // target nailed to the stake — so the first purchases must KILL. Four sentry beacons
  // (25/35/45/55) go up around the stake, then the sixteen-segment radius-8 ring that keeps
  // besiegers both off the hero and outside the crowds' fright radius.
  const wanted = [
    ...BEACONS.slice(beacons.length).map((spot, index) => ({
      ...spot, what: 'sentry_beacon', cost: [25, 35, 45, 55][beacons.length + index],
    })),
    ...RING.filter((spot) => !posts.some((entry) => distance(entry.position, spot) < 1.6))
      .map((spot) => ({ ...spot, what: 'palisade', cost: 10 })),
  ];
  // A trip to the fort costs ~14 seconds of panning time, so the rider waits until the purse
  // covers at least two purchases before walking back.
  const opening = 60;
  if (!memo.fortStarted && now.gold >= opening) memo.fortStarted = true;
  if (wanted.length > 0 && memo.fortStarted) {
    const stage = STAGES
      .map((point) => ({ point, reach: wanted.filter((spot) => distance(spot, point) <= REACH) }))
      .sort((left, right) => right.reach.length - left.reach.length)[0];
    let purse = now.gold;
    const affordable = stage.reach.filter((spot) => (purse -= spot.cost) >= 0);
    if (affordable.length > 0) {
      memo.trips = (memo.trips ?? 0) + 1;
      return [
        ...head,
        { verb: 'MOVE_TO', pos: at(stage.point) },
        ...affordable.map((spot) => ({
          verb: 'BUILD',
          what: spot.what,
          where: at(spot),
          when: { goldGte: spot.cost },
          ...(spot.rotationSteps === undefined ? {} : { rotationSteps: spot.rotationSteps }),
        })),
        ...keep,
      ];
    }
  }

  // BEAT 3 — hold the ring up and keep panning. REPAIR_UNDER walks the Prospector itself, and it
  // sits FIRST because it returns null when nothing is hurt: repairs pre-empt, panning fills in.
  memo.holding = (memo.holding ?? 0) + 1;
  return [...head, ...keep];
}

/**
 * The seam is STICKY. Re-choosing the richest seam every turn walks the Prospector back and forth
 * between two of them and pans neither; it keeps the seam it is working until that seam is dry.
 */
function pickSeam(view, memo) {
  const live = view.now.seams.filter((entry) => entry.active && entry.remaining > 0);
  const map = new Map(view.stablePrefix.map.seams.map((entry) => [entry.id, entry]));
  const held = live.find((entry) => entry.id === memo.seam);
  const chosen = held ?? live.sort((left, right) => right.remaining - left.remaining || (left.id < right.id ? -1 : 1))[0];
  memo.seam = chosen?.id;
  return chosen ? { ...chosen, ...map.get(chosen.id) } : undefined;
}

const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed], {
  cwd: ROOT,
  stdio: ['pipe', 'pipe', 'inherit'],
});
const memo = {};
let turns = 0;
let outcome = null;

for await (const line of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
  if (!line.trim()) continue;
  const message = JSON.parse(line);
  if (message.schema !== 'goldrush.view.v1') {
    outcome = message;
    process.stdout.write(`${line}\n`);
    continue;
  }
  const now = message.now;
  const fair = now.fairground;
  if (!quiet) {
    process.stderr.write(`t${turns} s${now.timers.runSeconds.toFixed(0)} w${now.wave} gold=${Math.round(now.gold)} hp=${now.hero.hp.toFixed(0)}`
      + ` works=${now.works.standing}/${now.works.standing + now.works.wrecked}`
      + ` alive=${now.threats.alive}`
      + ` wheel=${fair ? `${fair.wheel.spinning ? 'spin' : 'STOP'}/${fair.wheel.hp.toFixed(0)}` : '-'}`
      + ` crossings=${fair ? fair.flocks.flocks.map((f) => f.crossings).join('') : '-'}`
      + ` att=${fair?.flocks.attempts ?? 0}`
      + ` pros=(${now.prospector ? `${now.prospector.x.toFixed(0)},${now.prospector.z.toFixed(0)}` : '-'})`
      + ` decoy=${memo.decoy ? `${memo.decoy.x},${memo.decoy.z}` : '-'}\n`);
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
