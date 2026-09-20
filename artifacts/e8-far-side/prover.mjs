#!/usr/bin/env node

/**
 * THE FAR SIDE PROVER — the run that admitted `e8-far-side` (2026-08-20, A6).
 *
 * It drives the REAL door: it spawns `scripts/gr-sim.mjs` and answers each printed VIEW with a
 * line of standing orders on stdin, exactly as any rider would. No admission escape hatch, no
 * private handles, no balance edits — every verb below is in the public grammar
 * (`src/agent/StandingOrders.ts`): HARVEST, HOLD, BUILD, PICK_UPGRADE, SECURE_CHOICE, and the
 * new CONTEXT_ACTION `recover`.
 *
 * THE OBJECTIVE IS NOT SURVIVAL, SO NEITHER IS THE PROOF. `twist.probePlayback` pins
 * `objectiveAllowsSecure` false until the probe is out of the ground (`ProbeRecovery`), so a
 * run that outlives wave 20 without crossing simply never secures. The trace therefore has to
 * show BOTH: the crossing (a `recover` that returns ok, and `now.probeRecovery.recovered`
 * flipping true) and the hold that follows it.
 *
 * SUPPRESSION IS INHERITED, NOT RE-PROVEN. `twist.signalSuppression` declares drones and
 * playbooks off; there is no drone order and no playbook order anywhere in this file, and the
 * view's own `now.signalSuppression` row says so on every turn. `relayChains` is ABSENT from
 * the declaration, so it is NOT suppressed — the literal-false rule, honoured literally.
 *
 * THE PLAY, in three beats:
 *   1. CROSS FIRST. Waves 1-2 are the thinnest this map ever is, and the crater sits under the
 *      north spawn edge — so the Prospector walks the 77wu crossing immediately, panning the
 *      two crater seams on the way, and recovers the probe before the map fills up. Crossing
 *      late is how this run dies with the objective still buried.
 *   2. COME HOME AND DIG IN. Back in `far-side-landing-yard` around the stake at (0,-36):
 *      four guns (the registry cap), then beacons, then timber on the yard's north lip.
 *   3. HOLD. Every roster entry is `sun_glare_shambler`, a contact enemy that comes for the
 *      hero — and the hero never leaves its stake (`HeadlessContractSim:919` drives slot 0 on
 *      IDLE_INTENTS). So the guns ring the stake and the Prospector keeps panning behind them.
 *
 * Usage: node artifacts/e8-far-side/prover.mjs --seed e8-far-side-01 [--quiet]
 * Prints a per-turn trace on stderr and the gr-sim outcome JSON on stdout.
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const seed = valueOf('--seed') ?? 'e8-far-side-01';
const contract = valueOf('--contract') ?? 'e8-far-side';
const quiet = args.includes('--quiet');

/** The crater's own centre, from `tileParams.probeRecoveryZones[0]` (x -14..14, z 38..52). */
const CRATER = { x: 0, z: 45 };
/** Where the guns want the Prospector once the crossing is done: beside the stake. */
const KEEP = { x: 0, z: -34 };

/**
 * THE BUILD LIST, in purchase order, all inside `far-side-landing-yard` (x -24..24, z -48..-30).
 * Timber comes BEFORE the last two beacons and that ordering is measured, not stylistic: the
 * 5th and 6th beacons cost 75 and 95, and queueing them first starved the wall entirely in an
 * earlier run that died on wave 19 with three palisades standing.
 */
const PLAN = [
  { what: 'turret', where: { x: -5, z: -33 }, costs: 50 },
  { what: 'turret', where: { x: 5, z: -33 }, costs: 70 },
  { what: 'sentry_beacon', where: { x: -2, z: -31 }, costs: 25 },
  { what: 'sentry_beacon', where: { x: 2, z: -31 }, costs: 35 },
  { what: 'turret', where: { x: -4, z: -39 }, costs: 95 },
  { what: 'turret', where: { x: 4, z: -39 }, costs: 125 },
  { what: 'sentry_beacon', where: { x: -8, z: -32 }, costs: 45 },
  { what: 'sentry_beacon', where: { x: 8, z: -32 }, costs: 55 },
  // TIMBER, AND IT HAS TO BE A HORSESHOE RATHER THAN A FENCE. Waves enter from north, west AND
  // east (`lanes.spawnEdges`), so a straight line at the yard's north lip is simply walked
  // around: a run with nine pieces standing in that line still died on 19. This wraps the
  // stake at (0,-36) on all three threatened sides.
  //
  // z = -30 EXACTLY on the north run. `Terrain.isBuildable` tests the zone rectangle
  // INCLUSIVELY (`Terrain.ts:242`) and `far-side-landing-yard` ends at maxZ -30 — one wu
  // further north is outside the yard. Measured: a wall authored at z = -29 built ZERO
  // palisades and the run died believing it had one.
  //
  // THE ENGINE SAID SO AND THIS PROVER WASN'T LISTENING — worth recording, because the
  // tempting lesson is the wrong one. `place_building` returns an explicit `out_of_zone`
  // rejection detail (`buildRejectionDetail.ts:5`) and the executor writes it into the order
  // log as "<reason> (out_of_zone): BUILD action was rejected."
  // (`StandingOrders.ts:finishAction`). The failure was fully reported; this file just judged
  // its own builds by `now.works.byKind` and never read `now.orders`. A rider that reads the
  // order log gets told exactly what happened, on the first refused piece.
  ...Array.from({ length: 9 }, (_, index) => ({
    what: 'palisade',
    where: { x: -12 + index * 3, z: -30 },
    costs: 10,
  })),
  { what: 'sentry_beacon', where: { x: -11, z: -35 }, costs: 75 },
  { what: 'sentry_beacon', where: { x: 11, z: -35 }, costs: 95 },
  // The two flanks, south from the north run's ends to the yard's floor.
  ...Array.from({ length: 5 }, (_, index) => ({
    what: 'palisade',
    where: { x: -12, z: -33 - index * 3 },
    costs: 10,
  })),
  ...Array.from({ length: 5 }, (_, index) => ({
    what: 'palisade',
    where: { x: 12, z: -33 - index * 3 },
    costs: 10,
  })),
];

/** Pads this close to the staging point are all inside `Balance.turret.placeRadius` (6). */
const BATCH_RADIUS = 5.5;

/**
 * Stage three wu SOUTH of whatever is being placed: `Balance.turret.placeRadius` is 6, every
 * pad above sits at z >= -39, and the yard runs to z = -48, so this is always legal ground and
 * always in range. (Staging from one fixed point silently eats purchases: a pad 6.3wu away
 * simply refuses, and the refusal is not in THE VIEW.)
 */
const stageFor = (pad) => ({ x: pad.x, z: pad.z - 3 });

/**
 * ECONOMY FIRST, AND THAT ORDER IS MEASURED. The Far Side caps at four turrets, so the only
 * defence that scales is beacons (6) and timber (48) — both of which are bought with gold the
 * Prospector has to walk for. Runs that opened on survivability topped out around 32 gold a
 * wave and died on 18 with the wall half-built; `pan_legend` (-30% pan time) and
 * `prospectors_luck` (+10 seam capacity, -5s respawn) compound from the first wave and pay for
 * the wall that actually holds waves 19-20. `beacon_dynamo` ranks above raw damage for the
 * same reason: it multiplies six standing beacons rather than one hero.
 */
const UPGRADE_PREFERENCE = [
  'pan_legend', 'prospectors_luck', 'tinkers_plating', 'field_dressing', 'beacon_dynamo',
  'heavy_spark', 'double_tap_coil', 'split_spark', 'sharpen', 'long_resonator',
  'wide_ring', 'spring_heels', 'assay_bonus',
];

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/**
 * SEAM IDS ARE NOT PLACES. `HarvestSystem` hands `gold-seam-N` to a SHUFFLED anchor and moves
 * it again on every respawn (`HarvestSystem.ts:82` + `:301-311`), and THE VIEW's live seam rows
 * carry no coordinates (`View.ts:83`) — so a rider can aim at a seam ID, never at a seam. This
 * play pans whichever seam is active and lets the Prospector walk to it; that body is
 * expendable, the claim is not. (F-E7DB-3, still open, and it costs this run real walking.)
 */
function panOrders(now) {
  const seam = now.seams.find((entry) => entry.active && entry.remaining > 0);
  return seam ? Array.from({ length: 8 }, () => ({ verb: 'HARVEST', seam: seam.id })) : [];
}

/** Pure function of THE VIEW (plus one bit of memory): same seed in, same orders out. */
function orders(view, memo) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const picks = [];
  if (now.pendingOffer?.length) {
    const offered = now.pendingOffer.map(({ id }) => id);
    picks.push({ verb: 'PICK_UPGRADE', id: UPGRADE_PREFERENCE.find((id) => offered.includes(id)) ?? offered[0] });
  }

  const standing = now.works.byKind ?? {};
  const done = {
    turret: standing.turret ?? 0,
    sentry_beacon: standing.sentry_beacon ?? 0,
    palisade: standing.palisade ?? 0,
  };
  const seen = { turret: 0, sentry_beacon: 0, palisade: 0 };
  // Everything in the plan that is not standing yet, in purchase order.
  const remaining = PLAN.filter((entry) => {
    seen[entry.what] += 1;
    return seen[entry.what] > done[entry.what];
  });
  /**
   * THE CORE IS A LOCK; EVERYTHING AFTER IT IS A PREFERENCE.
   *
   * Once the four guns and four beacons stand, a rider that only ever looks at the HEAD of its
   * list stalls: seed 02 died on wave 19 sitting on 85 gold because the next item was a
   * 95-gold beacon with ten 10-gold palisades queued behind it. So after the core, take the
   * first item that can actually be paid for.
   *
   * Before the core, that same rule is a disaster and the run dies on wave 4 — at 10 gold the
   * cheapest affordable item is always a palisade, so a fallthrough opening buys timber
   * instead of the guns that carry the whole map. Measured both ways.
   */
  const coreStanding = done.turret >= 4 && done.sentry_beacon >= 4;
  const step = (coreStanding ? remaining.find((entry) => now.gold >= entry.costs) : undefined) ?? remaining[0];
  const pan = panOrders(now);

  // THE CROSSING, AND ITS TIMING IS THE WHOLE DIFFICULTY OF THIS MAP. It waits for the four
  // core (two guns and two beacons) to stand, because the hero holds its stake alone while the
  // Prospector is away and an undefended yard loses the run by wave 2 — measured, twice. It
  // also does not wait any longer than that: the map thickens every wave and the crater sits
  // under the north spawn edge, so the first quiet moment after the core is the moment to go.
  const probe = now.probeRecovery;
  if (probe && !probe.recovered && done.turret >= 2 && done.sentry_beacon >= 2) {
    // `inReach` slack is 2.2wu around the crater rectangle; HOLD lands the body on the point.
    if (distance(now.prospector, CRATER) <= 6) {
      return [...picks, { verb: 'CONTEXT_ACTION', action: 'recover' }, { verb: 'HOLD', pos: CRATER }];
    }
    return [...picks, { verb: 'HOLD', pos: CRATER }];
  }

  if (step) {
    const stage = stageFor(step.where);
    if (now.gold < step.costs) {
      memo.staged = false;
      return [...picks, ...(pan.length > 0 ? pan : [{ verb: 'HOLD', pos: KEEP }])];
    }
    if (!memo.staged || distance(now.prospector, stage) > 1.5) {
      memo.staged = true;
      return [...picks, { verb: 'HOLD', pos: stage }];
    }
    memo.staged = false;
    // ONE TURN, EVERY PAD THIS STAGING POINT CAN REACH AND AFFORD. A turn is most of a wave,
    // so placing one piece per turn made the 14-piece wall cost fourteen waves and the run
    // died on 14 with two guns standing. Orders execute in sequence, so the running budget
    // below is what the executor will actually see.
    const batch = [];
    let budget = now.gold;
    for (const entry of remaining) {
      // Skip rather than stop, but only under the same core lock as `step` above — before the
      // core stands, batching past an unaffordable gun would buy the timber behind it.
      const blocked = distance(entry.where, stage) > BATCH_RADIUS || budget < entry.costs;
      if (blocked && coreStanding) continue;
      if (blocked) break;
      budget -= entry.costs;
      batch.push({ verb: 'BUILD', what: entry.what, where: entry.where, when: { goldGte: entry.costs } });
      if (batch.length >= 8) break;
    }
    return [...picks, ...batch, { verb: 'HOLD', pos: stage }];
  }
  return [...picks, ...pan, { verb: 'HOLD', pos: KEEP }];
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
  if (!quiet) {
    const off = now.signalSuppression;
    const probe = now.probeRecovery;
    process.stderr.write(`t${turns} w${now.wave} gold=${now.gold} hp=${now.hero.hp.toFixed(0)}`
      + ` pros=(${now.prospector.x.toFixed(1)},${now.prospector.z.toFixed(1)})`
      + ` works=${JSON.stringify(now.works.byKind)} alive=${now.threats.alive}`
      + ` lvl=${now.hero.level}`
      + ` off=${off ? `${off.drones ? 'D' : '-'}${off.playbooks ? 'P' : '-'}${off.relayChains ? 'R' : '-'}` : '???'}`
      + ` probe=${probe ? (probe.recovered ? 'RECOVERED' : 'buried') : '???'}\n`);
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
