#!/usr/bin/env node

/**
 * THE SEED RUN PROVER — the measurement that priced `e9-seed-run` (2026-08-20, A8).
 *
 * It plays the map through the PUBLIC GRAMMAR and nothing else: every order below is a verb from
 * `src/agent/StandingOrders.ts` — HARVEST, HOLD, BUILD, REPAIR_UNDER, BLAST_AT, PICK_UPGRADE,
 * SECURE_CHOICE, and for the planting variant the one this slice adds, CONTEXT_ACTION action=plant.
 * No admission escape from the RULES, no private handles, no balance edits.
 *
 * WHY IT DRIVES THE SIM IN-PROCESS INSTEAD OF SPAWNING `scripts/gr-sim.mjs`. The Seed Run did not
 * secure, so it is now listed in `CONTRACT_ADMISSION_EXEMPTIONS` and the ordinary door refuses to
 * construct it — which would make the very evidence for that listing un-re-runnable. The house
 * already has the answer: `boot.admissionProbe` (`HeadlessContractSim.ts:442`), the same seam
 * `e2e/ap16-8b-capture-loop-probe.mjs` uses to keep measuring the exempt `e6-showroom`. The flag
 * lifts the ADMISSION gate only; every rule, cost and cap below is the ordinary game.
 *
 * WHAT IT MEASURED (both seeds, twice each, every repeat byte-identical):
 *   --plants none   wave 16 on BOTH seeds, UNSECURED against secureWave 20
 *                   (fnv1a32:aebdeea4 / fnv1a32:4d221a7b), caravan ARRIVED at 240 of 240.
 *   --plants all    the centre vault plants, the guard drops by the ratified 60 to 180 of 180,
 *                   the caravan still ARRIVES, and the run still ends unsecured - wave 16 / 14
 *                   (fnv1a32:77a015de / fnv1a32:9c5b06ec).
 *   --idle          waves 2 and 3, unsecured. Law 2 holds; see `run-evidence.mjs`.
 *
 * SO THE ESCORT IS NOT WHAT LOSES THIS MAP. The train made the basin on every run that reached
 * its arrival, at full guard and at three-quarters of it. What loses it is the ground: the claim
 * stands at (0,12), ON the north edge of the only buildZone within 30wu of it, waves enter from
 * BOTH the west and east edges, and half the roster is an hpScale-1.7 wrecker.
 *
 * THE PLAY, in three beats:
 *   1. ESCORT. The caravan leaves the south yard at t=0 and walks the five authored buildZone
 *      centres north, pausing 40s at each of the three planting grounds.
 *   2. PLANT (only with --plants all). Standing at a stake while the train stands at the same
 *      ground. Only the CENTRE stake is worth the walk — see `escortOrders`.
 *   3. HOLD THE CLAIM. From the caravan's arrival on, an ordinary hold at the fixed post (0,12).
 *
 * Usage: node artifacts/e9-seed-run/prover.mjs --seed e9-seed-run-01 [--plants all|none] [--quiet]
 * Prints a per-turn trace on stderr and the run's outcome JSON on stdout.
 */

import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const seed = valueOf('--seed') ?? 'e9-seed-run-01';
const contract = valueOf('--contract') ?? 'e9-seed-run';
const plants = valueOf('--plants') ?? 'none';
const quiet = args.includes('--quiet');
/**
 * THE NULL FLOOR, carried by the same file for the same reason the evidence is: `e9-seed-run` is
 * admission-exempt, so `scripts/null-floor-anchors.mjs` will not generate a floor for it and
 * `--policy=idle` on `scripts/gr-sim.mjs` cannot construct it either. Law 2 still has to be
 * checkable, so the floor runs here, through the same `admissionProbe` seam, submitting NOTHING.
 */
const idle = args.includes('--idle');
if (plants !== 'all' && plants !== 'none') throw new Error('--plants must be all or none');

/**
 * THE HERO NEVER MOVES. `HeadlessContractSim` drives slot 0 on IDLE_INTENTS (F-E2PA-4), so the
 * claim at (0,12) is a fixed post: a rider defends THAT, or it loses. Waves enter from the WEST
 * and EAST edges (the contract's own `lanes.spawnEdges`), so the gun line is built across those
 * two flanks rather than north-facing.
 *
 * THE BUILD LIST, in purchase order: four guns (the registry cap), then beacons — the beacons
 * slow what they touch (radius 8wu), which buys the guns a second volley per body.
 */
const PLAN = [
  // GUNS ON THE FLANKS, SLOW ON THE CLAIM. The hero is a fixed post at (0,12) and every enemy on
  // this map walks to it, so the six beacons (radius 8wu) are stacked ON that post rather than
  // spread across the yard — clustering them there was worth a whole wave in a controlled re-run
  // (16 -> 17), and pulling the turrets in beside them cost six (17 -> 11), because a turret that
  // stands where the swarm arrives is a turret being wrecked.
  { what: 'turret', where: { x: -7, z: 10 } },
  { what: 'turret', where: { x: 7, z: 10 } },
  { what: 'sentry_beacon', where: { x: -2, z: 12 } },
  { what: 'sentry_beacon', where: { x: 2, z: 12 } },
  { what: 'turret', where: { x: -7, z: 5 } },
  { what: 'turret', where: { x: 7, z: 5 } },
  { what: 'sentry_beacon', where: { x: -5, z: 12 } },
  { what: 'sentry_beacon', where: { x: 5, z: 12 } },
  { what: 'sentry_beacon', where: { x: -2, z: 9 } },
  { what: 'sentry_beacon', where: { x: 2, z: 9 } },
  // GUNS FIRST, THEN TIMBER — measured in that order. Turret caps at 4 and beacon at 6, so the ten
  // pads above are the whole ceiling of this map's aimed damage and gold spent before them is a gun
  // that arrives a wave late (front-loading the timber died at wave 10; the same timber bought
  // afterwards reached 16). Palisade is 10 gold flat with a cap of 48 — the ONLY defence here that
  // scales — and half this roster is `feral_terraformer`, a WRECKER with buildingDamageScale 1.4
  // (`Balance.ts:233`), so every stick is a turret that does not get chewed.
  ...flankWall(-9),
  ...flankWall(9),
  ...palisadeLine(-1),
  ...palisadeLine(-5),
];

/**
 * A SOLID COLUMN, not a picket. A palisade is 1 wide and 3 DEEP (`Balance.palisade`), so stacking
 * them every 3wu in z closes the gaps: six of them run x=+/-9 from z=-6 to z=12 with no seam. The
 * contract's `lanes.spawnEdges` are WEST and EAST, so these two columns stand across the only two
 * doors the wave has, and `palisadeRoute` makes the swarm walk around them under turret fire.
 */
function flankWall(x) {
  return [10.5, 7.5, 4.5, 1.5, -1.5, -4.5].map((z) => ({ what: 'palisade', where: { x, z } }));
}

/**
 * One skirmish row inside `center-green-waypoint` (x -10..10, z -6..12), flanks first: the
 * contract's `lanes.spawnEdges` are WEST and EAST, so x = +/-10 is where the wave actually lands.
 */
function palisadeLine(z) {
  // Strictly INSIDE the zone: a pad on the x = +/-10 boundary is refused, and a refusal is not in
  // THE VIEW, so a boundary pad in the middle of the plan is a silent stall.
  return [-9, 9, -7, 7, -5, 5, -3, 3].map((x) => ({ what: 'palisade', where: { x, z } }));
}

/** Where the guns want the rider when nothing is being bought or planted. */
const KEEP = { x: 0, z: 10 };
/** The fixed post this map is won or lost on (`contractHeroStart`: no heroStart stake -> (0,12)). */
const CLAIM = { x: 0, z: 12 };
/** How far off the claim a vault is worth walking for. Measured, not chosen — see `escortOrders`. */
const PLANT_DETOUR_LIMIT = 20;

/**
 * EVERY PAD ABOVE IS INSIDE `center-green-waypoint` (x -10..10, z -6..12), which is the ONLY
 * authored buildZone anywhere near the claim at (0,12) — the other four sit 30-60wu up and down
 * the caravan road. A pad one wu outside it is refused forever and the refusal is not in THE
 * VIEW, so the plan silently stalls with the gold unspent. (It did, on the first probe: a beacon
 * line at z=14 never placed and the run died at wave 11 with 30 gold in hand.)
 *
 * Stage three wu SOUTH of whatever is being placed: `Balance.turret.placeRadius` is 6 and every
 * pad above sits at z >= 1, so the stage is always in range and always on open ground. (Staging
 * from one fixed point also eats purchases: a pad 6.3wu away simply refuses.)
 */
const stageFor = (pad) => ({ x: pad.x, z: pad.z - 3 });

/** Survive first, then hit harder. This roster only does contact, so plating and heals rank high. */
const UPGRADE_PREFERENCE = [
  // MEASURED ORDER, not a theory. Plating and the heal come first because a hero that cannot move
  // is the only body taking contact on this map. Three controlled re-runs fixed the rest: the
  // three BLAST lines above the economy cost five waves (16 -> 11); the ECONOMY above the damage
  // lines cost four (16 -> 12); and the DAMAGE lines above plating cost three (16 -> 13).
  'field_dressing', 'tinkers_plating', 'auto_pan', 'pan_legend', 'beacon_dynamo',
  'heavy_spark', 'double_tap_coil', 'split_spark', 'sharpen', 'long_resonator',
  'assay_bonus', 'prospectors_luck', 'spring_heels',
];

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/**
 * SEAM IDS ARE NOT PLACES. THE VIEW's live seam rows carry no coordinates (`View.ts:83`) — only
 * `active` and `remaining` — so a rider cannot aim at a seam, only at a seam ID. Two seams are
 * live at a time here, and on this map the pair can be 60wu apart, so panning the FIRST live one
 * walks the Prospector off the claim for a minute at a time. (It did: the first full probe
 * finished wave 11 with 30 gold in hand because both live seams were the south-yard pair.)
 */
function panOrders(view) {
  const now = view.now;
  const live = now.seams.filter((entry) => entry.active && entry.remaining > 0);
  if (live.length === 0) return [];
  // BOOT COORDINATES ARE A HINT, NOT A PROMISE. `stablePrefix.map.seams` carries the id->anchor
  // assignment made at birth, and `HarvestSystem` may re-place an id on respawn — so this ranks
  // by the last known place and accepts that a stale rank only costs walking, never correctness.
  const placed = new Map((view.stablePrefix.map.seams ?? []).map(({ id, x, z }) => [id, { x, z }]));
  const nearest = live
    .map((entry) => ({ entry, at: placed.get(entry.id) }))
    .sort((a, b) => (a.at ? distance(now.prospector, a.at) : 1e9) - (b.at ? distance(now.prospector, b.at) : 1e9))[0].entry;
  return Array.from({ length: 8 }, () => ({ verb: 'HARVEST', seam: nearest.id }));
}

/**
 * THE PLANT LEG. Returns orders only while the train is STANDING at a ground the rider can
 * actually reach without giving up the claim; null the rest of the run.
 */
function escortOrders(caravan, memo) {
  if (plants !== 'all' || !caravan || caravan.state !== 'paused' || caravan.atGround === null) return null;
  const ground = caravan.grounds.find((entry) => entry.id === caravan.atGround);
  if (!ground || caravan.plantedThisRun.includes(ground.id)) return null;
  // THE WEST AND EAST STAKES ARE NOT WORTH THE WALK, and that is a finding rather than a
  // preference. They sit 45wu and 42wu off the claim; a rider that goes to one abandons a fixed
  // hero for two whole waves, and the measured result was a run that died at WAVE 2 with nothing
  // built and nothing planted. The centre stake is 9wu away — a dart, not a journey — so this
  // play spends the guard exactly where the map lets a defender spend it.
  if (distance(CLAIM, ground) > PLANT_DETOUR_LIMIT) return null;
  const stake = { x: ground.x, z: ground.z };
  // Re-issued every turn until the vault actually lands: a CONTEXT_ACTION that arrives a tick
  // outside the window FAILS, and a failed order is never retried by the engine.
  return distance(caravan.prospector, stake) <= 3.2
    ? [{ verb: 'CONTEXT_ACTION', action: 'plant' }, { verb: 'HOLD', pos: stake }]
    : [{ verb: 'HOLD', pos: stake }];
}

const padKey = (entry) => `${entry.what}@${entry.where.x},${entry.where.z}`;

/**
 * THE RIDER LEARNS THE MAP FROM ITS REFUSALS, which is the only channel that carries placement
 * rules. `collision` and its siblings are PERMANENT for that pad - retrying one forever stalls the
 * whole plan with the gold unspent (measured: wave 10, 90 gold in hand, three sticks of timber).
 * `cap_reached` is about the KIND, not the pad: a WRECK still holds its slot, so once four turrets
 * have ever been raised a wrecked one frees its ground but not its licence, and the plan
 * oscillates between dead pads (measured: wave 15, 155 gold, five beacons up and a sixth in
 * splinters). `insufficient_gold` is not permanent and must never blacklist anything.
 */
function learnFromRefusals(now, memo) {
  for (const record of now.orders ?? []) {
    if (record.status !== 'failed' || record.order?.verb !== 'BUILD') continue;
    const reason = record.reason ?? '';
    if (reason.includes('insufficient_gold')) continue;
    if (reason.includes('cap_reached')) memo.capped.add(record.order.what);
    else memo.refused.add(padKey({ what: record.order.what, where: record.order.where }));
  }
}

/**
 * A WRECK KEEPS ITS SLOT, so the ten capped pads are a fixed asset that must be MAINTAINED rather
 * than re-bought. `REPAIR_UNDER` takes damaged and wrecked works alike and walks the Prospector to
 * them. Guns and beacons only: timber is 10 gold to replace and not worth the walk.
 */
function repairOrders(now, gate) {
  if (now.gold < 40) return [];
  const hurt = (now.works.entries ?? []).some((entry) =>
    entry.id !== 'palisade' && (entry.wrecked || entry.hp < entry.maxHp * gate / 100));
  return hurt ? [{ verb: 'REPAIR_UNDER', pct: gate }] : [];
}

/**
 * THE BLAST IS THE ONLY DAMAGE THAT SCALES WITH THE WAVE. `Balance.blast` is 20 base +28% PER
 * WAVE inside 2.2wu, off a 2.5s cooldown and a 10wu range - at wave 18 that is ~120 a throw, more
 * than the whole capped gun line adds in the same window. The rider cannot see enemy positions
 * (THE VIEW carries counts, not bodies), but it does not need to: this roster walks at the hero,
 * so the hero's own feet are the densest ground on the map.
 */
function blastOrders(now) {
  if ((now.blastReadyInMs ?? 1) > 0 || now.threats.alive < 3) return [];
  return [{ verb: 'BLAST_AT', pos: { x: now.hero.x, z: now.hero.z - 1 } }];
}

/** Pure function of THE VIEW (plus one bit of memory): same seed in, same orders out. */
function orders(view, memo) {
  const now = view.now;
  learnFromRefusals(now, memo);
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const picks = [];
  if (now.pendingOffer?.length) {
    const offered = now.pendingOffer.map(({ id }) => id);
    const wanted = UPGRADE_PREFERENCE.find((id) => offered.includes(id)) ?? offered[0];
    picks.push({ verb: 'PICK_UPGRADE', id: wanted });
  }

  const caravan = now.seedCaravan ? { ...now.seedCaravan, prospector: now.prospector } : null;
  const escort = escortOrders(caravan, memo);
  if (escort) return [...picks, ...blastOrders(now), ...escort];

  // PLAN BY PAD, NOT BY COUNT. Counting `works.byKind` cannot tell an occupied pad from a
  // refused one, so a single illegal pad mid-plan stalls the whole line with the gold unspent —
  // and `byKind` counts WRECKED works too, which on a wrecker roster means the plan believes it
  // still owns timber that is already splinters. Both were measured, not guessed: the count-based
  // version died at wave 11 with four palisades and 40 gold in hand. Reading `works.entries`
  // (positions + `wrecked`) fixes both, and re-buys anything the terraformers chew down.
  const held = (now.works.entries ?? []).filter((entry) => !entry.wrecked);
  // ANY kind, not just this one: a beacon standing on a pad the timber line also wants is still
  // an occupied pad, and BUILD refuses silently rather than telling THE VIEW why.
  const taken = (pad) => held.some((entry) => distance(entry.position, pad) < 1.2);
  const step = PLAN.find((entry) =>
    !memo.capped.has(entry.what) && !taken(entry.where) && !memo.refused.has(padKey(entry)));
  const priceOf = (kind) => {
    const row = (view.stablePrefix.mechanics.buildables ?? []).find((entry) => entry.id === kind);
    const standing = held.filter((entry) => entry.id === kind).length;
    return row ? row.costs[Math.min(standing, row.costs.length - 1)] : Number.POSITIVE_INFINITY;
  };
  const pan = panOrders(view);

  // REPAIR OUTRANKS THE NEXT PURCHASE: a wrecked turret cannot be replaced (the cap counts it) and
  // is worth more standing than any stick of timber the same gold would buy.
  const mend = repairOrders(now, 60);
  if (mend.length > 0) return [...picks, ...blastOrders(now), ...mend];

  if (step) {
    const stage = stageFor(step.where);
    const price = priceOf(step.what);
    if (now.gold < price) {
      memo.staged = false;
      return [...picks, ...blastOrders(now), ...repairOrders(now, 60), ...(pan.length > 0 ? pan : [{ verb: 'HOLD', pos: KEEP }])];
    }
    if (!memo.staged || distance(now.prospector, stage) > 1.5) {
      memo.staged = true;
      return [...picks, ...blastOrders(now), { verb: 'HOLD', pos: stage }];
    }
    memo.staged = false;
    return [
      ...picks,
      { verb: 'BUILD', what: step.what, where: step.where, when: { goldGte: price } },
      { verb: 'HOLD', pos: stage },
    ];
  }
  // Nothing left to buy: put the timber and the guns back up, then work the seam.
  return [...picks, ...blastOrders(now), ...repairOrders(now, 60), ...(pan.length > 0 ? pan : []), { verb: 'HOLD', pos: KEEP }];
}

const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
let outcome = null;
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
  const sim = new HeadlessContractSim({ contractId: contract, seed, admissionProbe: true });
  // The same anti-hang bound `scripts/gr-sim.mjs` applies: wave scaling should end the run first,
  // and a rider that outlives the ceiling is stopped rather than allowed to spin.
  const secureWave = sim.manifest.twist.secureWave ?? Balance.run.secureWave;
  const waveCeiling = sim.manifest.twist.baron
    ? Math.max(secureWave, sim.manifest.twist.baron.wave) + 2
    : secureWave + 2;
  const memo = { refused: new Set(), capped: new Set() };
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
    if (!quiet) trace(turns, turn.view.now);
    if (turn.terminal) break;
    if (!idle) sim.submitOrders(orders(turn.view, memo));
    turns += 1;
    turn = sim.advanceToTurn();
  }

  const caravan = turn.view.now.seedCaravan;
  outcome = {
    ...sim.outcome(),
    ...(endReason ? { endReason } : {}),
    seed,
    policy: idle ? 'idle' : `public-verb/plants=${plants}`,
    // The caravan's own terminal state travels WITH the outcome, so a reader never has to trust
    // a sentence about the escort that the numbers do not carry.
    caravan: caravan
      ? { state: caravan.state, hp: caravan.hp, maxHp: caravan.maxHp, arrived: caravan.arrived, planted: caravan.plantedThisRun }
      : null,
  };
  process.stdout.write(`${JSON.stringify(outcome)}\n`);
  if (!quiet) process.stderr.write(`prover: ${turns} turns\n`);
} finally {
  await vite.close();
}
// Law 2 inverts the exit code for the floor: an idle run that SECURES is the failure.
if (idle ? outcome?.secured : !outcome?.secured) process.exitCode = 1;

function trace(turns, now) {
  const car = now.seedCaravan;
  process.stderr.write(`t${turns} w${now.wave} gold=${now.gold} hp=${now.hero.hp.toFixed(0)}`
    + ` pros=(${now.prospector.x.toFixed(1)},${now.prospector.z.toFixed(1)})`
    + ` works=${JSON.stringify(now.works.byKind)} alive=${now.threats.alive}`
    + ` lvl=${now.hero.level} kills=${now.threats.defeatedTotal}`
    + ` caravan=${car ? `${car.state}/${car.hp.toFixed(0)}of${car.maxHp}/leg${car.leg}/at=${car.atGround ?? '-'}/planted=${car.plantedThisRun.length}` : '???'}`
    + `${failures(now)}\n`);
}

/**
 * REFUSALS ARE THE ONLY WAY A RIDER LEARNS THE MAP. A BUILD that lands outside a buildZone, on an
 * occupied pad, or out of the Prospector's reach fails SILENTLY as far as `now.works` is
 * concerned — the reason lives only in the standing-order records. This trace prints them.
 */
function failures(now) {
  const failed = (now.orders ?? []).filter((record) => record.status === 'failed');
  return failed.length === 0 ? '' : ` FAIL=${failed.map((record) => record.reason).join('|')}`;
}

function valueOf(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}
