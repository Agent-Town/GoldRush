#!/usr/bin/env node

/**
 * THE KITE PROVER — can the Seed Run be taken by MOVEMENT alone? (2026-08-20)
 *
 * WHY IT EXISTS. The owner played `e9-seed-run` on 2026-08-20 and secured it "without building
 * anything, just kiting". A8's own prover made fifteen stand-and-build attempts and topped out at
 * wave 16 of 20, which is why the map self-placed into `CONTRACT_ADMISSION_EXEMPTIONS`. If a
 * kiting policy secures where a fortifying one cannot, the exemption is measuring the WRONG PLAY
 * and F-A8-4 (the owner's open re-admit fork) has its answer. So this file asks the question in
 * the only currency the door accepts: a repeated, hashed, public-verb run.
 *
 * IT DOES NOT TOUCH THE DOOR. `boot.admissionProbe` lifts the ADMISSION gate only, exactly as
 * `artifacts/e9-seed-run/prover.mjs` and `e2e/ap16-8b-capture-loop-probe.mjs` already do; every
 * rule, cost, cap and cooldown below is the ordinary game. No exemption is added and none is
 * removed — this is evidence FOR the owner's decision, not the decision.
 *
 * THE GRAMMAR IS PUBLIC AND THE PLAN IS EMPTY. Orders are `MOVE_TO`, `HOLD`, `SET_WEAPON`,
 * `BLAST_AT`, `PICK_UPGRADE` and `SECURE_CHOICE` (`public/skill.md:72-77`). There is not one
 * `BUILD` in this file, which is the point: the owner built nothing.
 *
 * THE EXPERIMENT, and it is a CONTROLLED one rather than a single attempt. Three movement
 * patterns run against the same seeds:
 *
 *   --pattern still  the rider stands on the claim. The control.
 *   --pattern hug    the rider circles the claim at 5wu — the shape a player uses to pull a
 *                    swarm off a fixed thing without leaving it.
 *   --pattern drag   the rider runs a 200wu circuit out through the WEST and EAST spawn lanes and
 *                    across the caravan road — the shape a player uses to take the wave AWAY.
 *
 * If the wave can see the rider, `drag` and `hug` must differ from `still` in waves survived, in
 * kills, or in when the hero's guard breaks. If all three land on the same numbers, the rider's
 * position is not an input to this engine's threat model, and THAT is the finding.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * WHAT IT MEASURED (2026-08-20, both seeds, every arm twice, every repeat byte-identical —
 * `run-kite-evidence.mjs`, `kite-summary.json`, `kite-*.log`):
 *
 *   arm         seed  waves  timeMs   kills  max d(hero)  caravan
 *   still        01     3     101233    43       2.1      paused  240/240
 *   hug          01     3     101233    43       5.0      paused  240/240
 *   drag         01     3     101233    43      61.4      paused  240/240
 *   still        02     9     286300   267       2.1      ARRIVED 222.2/240
 *   hug          02     9     286300   267       5.0      ARRIVED 222.2/240
 *   drag         02     9     286300   267      61.4      ARRIVED 222.2/240
 *   drag+blast   01     2      83867    33      61.4      moving  240/240
 *   drag+blast   02     2      65067    24      61.4      paused  240/240
 *
 * THE KITE ARMS ARE NOT WORSE. THEY ARE IDENTICAL. Walking the rider 61.4wu off the claim, across
 * both spawn lanes and down the whole caravan road, changed waves, timeMs, kills, gold, calls AND
 * the per-wave hero-guard curve by exactly nothing against standing still. The only field that
 * moved is `eventLogHash`, and it moves because the hash covers the ORDER STREAM
 * (`canonicalStandingOrders`, `HeadlessContractSim.outcome()`) — the world did not move at all.
 *
 * SO THE KITE IS NOT MEASURABLE HERE, and the reason is two verified lines of engine, not a
 * shortfall in the policy:
 *   1. THE BODY THE WAVE WALKS AT CANNOT BE MOVED. `enemies.update` is handed
 *      `this.hero.group.position` (`HeadlessContractSim.ts:1271`) and slot 0 runs on
 *      `IDLE_INTENTS` (F-E2PA-4, `:478`). `MOVE_TO`/`HOLD` steer the PROSPECTOR
 *      (`StandingOrders.ts:286-298` returns `{ movement }` for the rider), which nothing seeks.
 *      The BROWSER is different, and that is the whole gap: `Game.ts:2783-2787` hands the pool
 *      `visibleActorPositions()` — the set of visible actors, i.e. the body the player is
 *      steering. Kiting is expressible in the browser and INEXPRESSIBLE headless.
 *   2. THE GUNS ARE HERO-ANCHORED TOO. The automatic Spark Rig fires from
 *      `this.hero.group.position` off deepwater (`:389`) and `BLAST_AT` refuses anything beyond
 *      `Balance.blast.range` (10) of the hero (`:2141`). The rider carries neither the aggro nor
 *      the gun, so a kite arm is a hero standing alone plus a tourist.
 *
 * TWO THINGS WORTH KEEPING ANYWAY. `--blast` is WORSE, not better (waves 2 on both seeds): the
 * automatic rig is gated on `weapon === 'rig'` (`:388`), so selecting blast trades a continuous
 * gun for a 2.5s lob and the hero dies sooner. And on seed 02 the no-build arms reached wave 9
 * with the CARAVAN ARRIVED at 222.2 of 240 — three times the idle floor's wave 3, and the
 * objective latch fired — which says again what A8 said: the escort is not what loses this map.
 *
 * VERDICT: NO ARM SECURED. Against `secureWave` 20, the best kite arm reached wave 9 (seed 02)
 * and wave 3 (seed 01), versus wave 16/14 for A8's stand-and-build prover. The door's exemption
 * reason therefore still holds on its own terms — AND the owner's winning play cannot be tested
 * by this engine at all, which is a finding the F-A8-4 fork should carry. Nothing here flips
 * admission either way; that call is the owner's.
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Usage: node artifacts/e9-seed-run/kite-prover.mjs --seed e9-seed-run-01 [--pattern still|hug|drag]
 *                                                   [--blast] [--quiet]
 * Prints a per-turn trace on stderr and the run's outcome JSON on stdout.
 */

import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const seed = valueOf('--seed') ?? 'e9-seed-run-01';
const contract = valueOf('--contract') ?? 'e9-seed-run';
const pattern = valueOf('--pattern') ?? 'drag';
const useBlast = args.includes('--blast');
const quiet = args.includes('--quiet');
if (!['still', 'hug', 'drag'].includes(pattern)) throw new Error('--pattern must be still, hug or drag');

/**
 * THE FIXED POST. `contractHeroStart` gives this contract no `heroStart` stake, so the hero begins
 * at (0,12) — and `HeadlessContractSim` drives slot 0 on `IDLE_INTENTS` (F-E2PA-4,
 * `HeadlessContractSim.ts:478`), so it stays there. Every waypoint below is measured from here.
 */
const CLAIM = { x: 0, z: 12 };

/** A tight ring on the claim: five wu out, eight stations, anticlockwise. */
const HUG = Array.from({ length: 8 }, (_, index) => {
  const angle = (index / 8) * Math.PI * 2;
  return { x: round1(CLAIM.x + Math.cos(angle) * 5), z: round1(CLAIM.z + Math.sin(angle) * 5) };
});

/**
 * THE DRAG CIRCUIT. Authored from the contract's own geometry rather than invented: the tile is
 * 128 wide, `lanes.spawnEdges` are WEST and EAST, and the caravan road runs the five buildZone
 * centres from (0,-48) to (0,48). So this circuit crosses the west lane, runs the length of the
 * road on the west side, cuts the yard end, comes back up the east lane, and returns past the
 * claim — roughly 200wu at `Balance.agent.moveSpeed` 4.8, about 42 seconds a lap.
 *
 * If a swarm follows bodies, this is the lap that drags it off the claim AND off the train.
 */
const DRAG = [
  { x: -46, z: 12 },
  { x: -46, z: -20 },
  { x: -20, z: -46 },
  { x: 20, z: -46 },
  { x: 46, z: -20 },
  { x: 46, z: 12 },
  { x: 20, z: 34 },
  { x: -20, z: 34 },
];

const CIRCUIT = pattern === 'hug' ? HUG : pattern === 'drag' ? DRAG : [];

/**
 * Survive first. This roster only does contact damage, so plating and the field dressing rank
 * highest — the same measured order `prover.mjs` fixed by controlled re-run, minus the build and
 * economy lines, which buy nothing when nothing is ever bought.
 */
const UPGRADE_PREFERENCE = [
  'field_dressing', 'tinkers_plating', 'spring_heels', 'heavy_spark', 'double_tap_coil',
  'split_spark', 'sharpen', 'long_resonator', 'auto_pan', 'pan_legend', 'beacon_dynamo',
  'assay_bonus', 'prospectors_luck',
];

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/**
 * THE ONE PIECE OF MEMORY THIS RIDER KEEPS: which station of the circuit it is walking to.
 * `MOVE_TO` reports `done` inside `Balance.agent.arriveRadius` (0.16), so the advance is read off
 * the rider's own position rather than off an order record that may not have been re-issued yet.
 */
function nextStation(now, memo) {
  if (CIRCUIT.length === 0) return null;
  const station = CIRCUIT[memo.station % CIRCUIT.length];
  if (distance(now.prospector, station) <= 1.5) {
    memo.station += 1;
    memo.laps = Math.floor(memo.station / CIRCUIT.length);
    return CIRCUIT[memo.station % CIRCUIT.length];
  }
  return station;
}

/**
 * THE BLAST IS HERO-ANCHORED, and that is a measured constraint rather than a style choice:
 * `HeadlessContractSim.blastAt():2139` takes its origin from `this.hero.group.position` and
 * refuses anything beyond `Balance.blast.range` (10) of it. So a rider that walks away cannot
 * carry the throw with it — the lob always lands beside the pinned hero, whatever the rider does.
 * Included anyway, behind `--blast`, so the kite arms are not accused of fighting with one hand.
 */
function blastOrders(now) {
  if (!useBlast || (now.blastReadyInMs ?? 1) > 0 || now.threats.alive < 3) return [];
  return [{ verb: 'BLAST_AT', pos: { x: now.hero.x, z: now.hero.z - 1 } }];
}

/** Pure function of THE VIEW plus the circuit cursor: same seed in, same orders out. */
function orders(view, memo) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const picks = [];
  if (now.pendingOffer?.length) {
    const offered = now.pendingOffer.map(({ id }) => id);
    const wanted = UPGRADE_PREFERENCE.find((id) => offered.includes(id)) ?? offered[0];
    picks.push({ verb: 'PICK_UPGRADE', id: wanted });
  }

  // SET_WEAPON never toggles (`public/skill.md:112`), so re-submitting it every turn is safe and
  // keeps the arm's weapon state independent of turn ordering.
  const weapon = [{ verb: 'SET_WEAPON', weapon: useBlast ? 'blast' : 'rig' }];
  const station = nextStation(now, memo);
  const walk = station ? [{ verb: 'MOVE_TO', pos: station }, { verb: 'HOLD', pos: station }] : [{ verb: 'HOLD', pos: CLAIM }];
  return [...picks, ...weapon, ...blastOrders(now), ...walk];
}

const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
let outcome = null;
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
  const sim = new HeadlessContractSim({ contractId: contract, seed, admissionProbe: true });
  const secureWave = sim.manifest.twist.secureWave ?? Balance.run.secureWave;
  const waveCeiling = sim.manifest.twist.baron
    ? Math.max(secureWave, sim.manifest.twist.baron.wave) + 2
    : secureWave + 2;
  const memo = { station: 0, laps: 0 };
  // THE DIAGNOSTIC THAT DECIDES THE QUESTION: how far the rider actually got from the body the
  // wave walks at, and what the hero's guard was doing while it was out there.
  const reach = { maxFromClaim: 0, maxFromHero: 0, minFromHero: Infinity };
  const guardByWave = new Map();
  let turn = sim.currentTurn();
  let turns = 0;
  let endReason;

  while (true) {
    if (!turn.terminal && turn.view.now.wave >= waveCeiling) {
      sim.hero.hp = 0;
      sim.dead = true;
      endReason = 'wave-ceiling';
      turn = sim.currentTurn();
    }
    const now = turn.view.now;
    if (now.prospector) {
      reach.maxFromClaim = Math.max(reach.maxFromClaim, distance(now.prospector, CLAIM));
      reach.maxFromHero = Math.max(reach.maxFromHero, distance(now.prospector, now.hero));
      reach.minFromHero = Math.min(reach.minFromHero, distance(now.prospector, now.hero));
    }
    guardByWave.set(now.wave, Math.round(now.hero.hp));
    if (!quiet) trace(turns, now, memo);
    if (turn.terminal) break;
    sim.submitOrders(orders(turn.view, memo));
    turns += 1;
    turn = sim.advanceToTurn();
  }

  const caravan = turn.view.now.seedCaravan;
  outcome = {
    ...sim.outcome(),
    ...(endReason ? { endReason } : {}),
    seed,
    policy: `kite/${pattern}${useBlast ? '+blast' : ''}`,
    kite: {
      pattern,
      blast: useBlast,
      laps: memo.laps,
      stations: memo.station,
      maxDistanceFromClaim: round1(reach.maxFromClaim),
      maxDistanceFromHero: round1(reach.maxFromHero),
      minDistanceFromHero: Number.isFinite(reach.minFromHero) ? round1(reach.minFromHero) : null,
      heroHpByWave: Object.fromEntries(guardByWave),
    },
    caravan: caravan
      ? { state: caravan.state, hp: caravan.hp, maxHp: caravan.maxHp, arrived: caravan.arrived, planted: caravan.plantedThisRun }
      : null,
  };
  process.stdout.write(`${JSON.stringify(outcome)}\n`);
  if (!quiet) process.stderr.write(`kite-prover: ${turns} turns\n`);
} finally {
  await vite.close();
}
// A kite arm that does NOT secure is the expected reading today; the exit code reports it without
// asserting it, so the caller decides what the number means.
if (!outcome?.secured) process.exitCode = 1;

function trace(turns, now, memo) {
  const car = now.seedCaravan;
  const rider = now.prospector;
  process.stderr.write(`t${turns} w${now.wave} hp=${now.hero.hp.toFixed(0)}`
    + ` rider=(${rider ? `${rider.x.toFixed(1)},${rider.z.toFixed(1)}` : '?'})`
    + ` d(hero)=${rider ? distance(rider, now.hero).toFixed(1) : '?'}`
    + ` station=${memo.station} alive=${now.threats.alive} kills=${now.threats.defeatedTotal}`
    + ` caravan=${car ? `${car.state}/${car.hp.toFixed(0)}of${car.maxHp}/leg${car.leg}` : '???'}`
    + `${failures(now)}\n`);
}

function failures(now) {
  const failed = (now.orders ?? []).filter((record) => record.status === 'failed');
  return failed.length === 0 ? '' : ` FAIL=${failed.map((record) => record.reason).join('|')}`;
}

function round1(value) {
  return Number(value.toFixed(1));
}

function valueOf(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}
