#!/usr/bin/env node

/**
 * THE OLD CANAL PROVER — the measurement that prices `e9-old-canal` (2026-08-21, A10).
 *
 * It plays the map through the PUBLIC GRAMMAR and nothing else: every order below is a verb from
 * `src/agent/StandingOrders.ts` — HARVEST, HOLD, BUILD, REPAIR_UNDER, BLAST_AT, PICK_UPGRADE,
 * SECURE_CHOICE, and the two this slice adds, CONTEXT_ACTION action=redig / action=backfill.
 * No admission escape from the RULES, no private handles, no balance edits.
 *
 * THE PLAY, in three beats:
 *   1. DECIDE THE NEAR BAND FIRST. `old-canal-segment-b` (x -10..14, z -8..8) is the only
 *      buildable ground within 30wu of the claim at (0,12), and an UNDECIDED band takes no
 *      foundation — so the run's first act is a 12wu walk to `decide-segment-b` and a BACKFILL,
 *      which opens that ground for the rest of this run and every run after it.
 *   2. DECIDE THE FAR TWO. `decide-segment-a` (-30,-23) and `decide-segment-c` (32,23) are 46wu
 *      and 34wu out. Both are RE-DUG: the objective needs a verdict either way, and ground that
 *      far from the claim is worth nothing to a defender while a wet band is worth a permanent
 *      no-spawn zone from the next tile birth onward. Taken early, while the waves are thin.
 *   3. HOLD THE CLAIM. From the last verdict on, an ordinary hold at the fixed post (0,12) with
 *      the gun line inside the ground beat 1 opened.
 *
 * THE HERO NEVER MOVES. `HeadlessContractSim` drives slot 0 on IDLE_INTENTS (F-E2PA-4), so the
 * claim at (0,12) is a fixed post; the PROSPECTOR is the body that walks, builds, pans and
 * decides. Waves enter from the NORTH, WEST and EAST edges (the contract's own `lanes.spawnEdges`
 * — three doors, one more than the Seed Run's two).
 *
 * Usage: node artifacts/e9-old-canal/prover.mjs --seed e9-old-canal-01 [--idle] [--quiet]
 * Prints a per-turn trace on stderr and the run's outcome JSON on stdout.
 */

import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const args = process.argv.slice(2);
const seed = valueOf('--seed') ?? 'e9-old-canal-01';
const contract = valueOf('--contract') ?? 'e9-old-canal';
const quiet = args.includes('--quiet');
/** Law 2's floor, submitting NOTHING: an idle run that SECURES is the failure. */
const idle = args.includes('--idle');
/**
 * WHY IT ALWAYS LIFTS THE ADMISSION GATE. The Old Canal did not secure, so it is listed in
 * `CONTRACT_ADMISSION_EXEMPTIONS` and the ordinary door refuses to construct it — which would make
 * the very evidence for that listing un-re-runnable. The house already has the answer:
 * `boot.admissionProbe`, the same seam `e2e/ap16-8b-capture-loop-probe.mjs` uses to keep measuring
 * the exempt `e6-showroom`. The flag lifts the ADMISSION gate only; every rule, cost and cap below
 * is the ordinary game.
 */
/** Control: play the map WITHOUT discharging the objective, to price the walk itself. */
const noDecide = args.includes('--no-decide');

/** The fixed post this map is won or lost on (`contractHeroStart`: no heroStart stake -> (0,12)). */
const CLAIM = { x: 0, z: 12 };
/** Where the guns want the rider when nothing is being bought, panned or decided. */
const KEEP = { x: 0, z: 10 };
/** `CANAL_DECISION_REACH`, mirrored so the rider stops walking exactly where the verdict lands. */
const DECISION_REACH = 3.2;
/** How far off the claim a stake counts as "on the way". `decide-segment-b` is 12.2wu; the other two are 46 and 34. */
const NEAR_STAKE_LIMIT = 20;
/** How far off the claim a gold seam is worth answering. Measured — see `panOrders`. */
const PAN_DETOUR_LIMIT = 24;
const REPAIR_GATE = Number(process.env.A10_REPAIR ?? 60);
const BLAST_MIN = Number(process.env.A10_BLAST ?? 3);
const KEEP_Z = Number(process.env.A10_KEEPZ ?? 10);
/** The near band waits for this many standing works before the rider spends a turn on the walk. */
const NEAR_STAKE_WORKS = 4;
/** The safety nets under `roadIsOpen`: never let the objective go undischarged past these waves. */
const NEAR_STAKE_DEADLINE_WAVE = 5;
const FAR_STAKE_DEADLINE_WAVE = 10;

/**
 * THE VERDICT PLAN — which way each authored segment goes, and why, measured rather than chosen.
 * Keyed by the authored stake id so a contract that renames a stake fails loudly instead of
 * silently skipping a decision the objective still wants.
 */
const VERDICTS = {
  'decide-segment-b': 'backfill',
  'decide-segment-a': 'redig',
  'decide-segment-c': 'redig',
};

/**
 * THE BUILD LIST, in purchase order, and every pad is INSIDE `old-canal-segment-b` (x -10..14,
 * z -8..8) or on the claim shoulder just north of it. A pad inside the band is illegal until the
 * band is backfilled and legal forever after — which is the whole point of beat 1 and the reason
 * the plan re-checks refusals instead of trusting a count.
 *
 * Guns on the flanks, slow on the claim: the hero is a fixed post and every enemy on this map
 * walks to it, so the beacons (radius 8wu) stack ON that post and the turrets stand off it.
 */
const PLAN = [
  // THE SHOULDER FIRST, and this ordering is the second finding the probes bought. Every pad at
  // z >= 10 is north of `old-canal-segment-b` and therefore legal from t=0, with no verdict
  // needed; every pad inside the band is illegal until the backfill lands. Buying the openable
  // ground's pads first stalls the whole line behind a walk (measured: wave 2, 60 gold in hand,
  // nothing standing), so the guns that defend the claim go up on ground that is already ground.
  //
  // EVERY PAD BELOW IS ALSO LEGAL UNDER THE HEADLESS TERRAIN, which is a real and separate
  // constraint (see F-A10-1 in the review): `Terrain`'s module-level `ACTIVE_CONTRACT` resolves to
  // `the-claim` under SSR, so this engine tests placement against THE CLAIM's ground — a river
  // band across z -6..6 and two landmark blockers at (x -12..-4, z 16..18) and (x 8..12, z 12..16).
  // The pads were chosen by probing `Terrain.isBuildable` on a grid rather than by guessing; the
  // first plan lost most of its pads to `out_of_zone` and froze the line at four works.
  // BEACONS OPEN, AND THAT IS MEASURED. A beacon is 25/35/45/55/75/95 and a turret 50/70/95/125,
  // so the first three slows cost less than the first gun; on a map whose whole roster walks at a
  // fixed hero, the slow is what buys the spark rig its second volley per body. Beacons-first
  // measured wave 17 against guns-first's 16 on seed 01.
  { what: 'sentry_beacon', where: { x: -2, z: 12 } },
  { what: 'sentry_beacon', where: { x: 2, z: 12 } },
  { what: 'sentry_beacon', where: { x: -5, z: 10 } },
  { what: 'turret', where: { x: -8, z: 10 } },
  { what: 'turret', where: { x: 8, z: 10 } },
  { what: 'sentry_beacon', where: { x: 5, z: 10 } },
  { what: 'sentry_beacon', where: { x: -2, z: 14 } },
  { what: 'sentry_beacon', where: { x: 2, z: 14 } },
  { what: 'turret', where: { x: -6, z: 20 } },
  // ONE STOCKPILE, AND ONLY HERE. The base gold ceiling measured 123 — the rider sat on exactly
  // 123 for whole waves, panning into a full pocket — and turret #4 costs 125, so the fourth gun
  // is UNBUYABLE at any income until the cap moves. Bought EARLIER it is simply 60 gold stolen
  // from the opening (two stockpiles at plan positions 3-4 measured wave 10 against 17), so it
  // sits exactly one line above the price it exists to make reachable.
  { what: 'stockpile', where: { x: -14, z: 16 } },
  { what: 'turret', where: { x: 6, z: 20 } },
  // TIMBER AFTER THE GUNS, and that order was RE-MEASURED here rather than inherited: moving the
  // two z=20/22 rows ahead of the third turret cost five waves on seed 01 (16 -> 11). The Seed
  // Run's finding one map over holds on this map too, even though this map's binding constraint
  // is gold rather than damage.
  ...palisadeRow(20, [-10, 10, -6, 6, -2, 2]),
  ...palisadeRow(22, [-10, 10, -6, 6, -2, 2]),
  ...palisadeRow(10, [-12, 12]),
  // THE ROW THE BACKFILL BUYS. z = 8 is the north lip of `old-canal-segment-b` (x -10..14,
  // z -8..8) and the only ground inside that band the headless terrain will take at all. Illegal
  // while the segment is undecided or re-dug, legal forever once it is backfilled — so this row
  // is the ratified trade, priced in palisades, and it is the reason the plan must NOT blacklist
  // an `out_of_zone` refusal that came from an undecided band.
  ...palisadeRow(8, [-9, -6, -3, 0, 3, 6, 9]),
  ...palisadeRow(18, [-16, -14, -2, 0, 2, 4, 6, 14, 16]),
];

/** One skirmish row, flanks first: the wave lands on the west and east doors before the north. */
function palisadeRow(z, xs) {
  return xs.map((x) => ({ what: 'palisade', where: { x, z } }));
}

/**
 * Stage three wu NORTH of whatever is being placed. `Balance.turret.placeRadius` is 6, so the
 * stage is always in range, and north keeps the Prospector on the claim's own shoulder instead of
 * standing in a band that may still refuse it.
 */
const stageFor = (pad) => ({ x: pad.x, z: pad.z + 3 });

/** Survive first, then hit harder. This roster only does contact, so plating and heals rank high. */
const UPGRADE_PREFERENCE = [
  // ECONOMY FIRST, unlike the Seed Run's measured order, and for the measured reason above: gold
  // is what this map runs out of, not damage. `auto_pan` and `pan_legend` are the only two lines
  // that move the ceiling the whole run is built against.
  'auto_pan', 'pan_legend', 'field_dressing', 'tinkers_plating', 'assay_bonus',
  'beacon_dynamo', 'heavy_spark', 'double_tap_coil', 'split_spark', 'sharpen',
  'long_resonator', 'prospectors_luck', 'spring_heels',
];

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/**
 * SEAM IDS ARE NOT PLACES. THE VIEW's live seam rows carry no coordinates (`View.ts:83`), so the
 * rider ranks by the birth assignment in `stablePrefix.map.seams` and accepts that a stale rank
 * costs walking, never correctness.
 */
function panOrders(view) {
  const now = view.now;
  const placed = new Map((view.stablePrefix.map.seams ?? []).map(({ id, x, z }) => [id, { x, z }]));
  const live = now.seams
    .filter((entry) => entry.active && entry.remaining > 0)
    .map((entry) => ({ entry, at: placed.get(entry.id) }))
    // THE YARD SEAMS ARE NOT WORTH THE WALK, and that is a measured finding rather than a
    // preference — the same one A8 recorded one map over. Two of this contract's five authored
    // `harvestAnchors` sit in the survey and outflow yards, 45wu off the claim; a rider that
    // answers one abandons the post for a whole turn each way. Measured: turns 1, 2, 5, 6, 11, 21
    // and 22 of the first full probe were spent standing at (10,45) and (-10,-45) with the wave
    // chewing the claim. The three anchors on the claim's own ground are what funds this map.
    .filter(({ at }) => at && distance(CLAIM, at) <= PAN_DETOUR_LIMIT);
  if (live.length === 0) return [];
  const nearest = live.sort((a, b) => distance(now.prospector, a.at) - distance(now.prospector, b.at))[0].entry;
  return Array.from({ length: 8 }, () => ({ verb: 'HARVEST', seam: nearest.id }));
}

/**
 * THE DECISION LEG. Returns orders while ANY segment is still undecided, in the plan's own order
 * (near band first, then the far pair), and null forever after. Re-issued every turn until the
 * verdict actually lands: a CONTEXT_ACTION taken out of reach FAILS, and a failed order is never
 * retried by the engine.
 */
function decisionOrders(canal, now) {
  if (!canal || noDecide) return null;
  for (const [stakeId, action] of Object.entries(VERDICTS)) {
    const standing = canal.choices.find((entry) => entry.id === stakeId);
    if (!standing || standing.choice !== 'undecided') continue;
    const segment = canal.segments.find((entry) => entry.id === stakeId);
    if (!segment) continue;
    const stake = { x: segment.x, z: segment.z };
    if (!roadIsOpen(now, distance(CLAIM, stake) <= NEAR_STAKE_LIMIT)) return null;
    return distance(now.prospector, stake) <= DECISION_REACH
      ? [{ verb: 'CONTEXT_ACTION', action }, { verb: 'HOLD', pos: stake }]
      : [{ verb: 'HOLD', pos: stake }];
  }
  return null;
}

/**
 * WHEN THE FAR TWO ARE WORTH THE WALK, and this is the finding the first probe bought.
 *
 * The near stake at (2,0) is 12wu off the claim — a dart, and it must be taken FIRST because
 * every buildable pad on this map is inside the band it opens. The far pair sit 46wu and 34wu
 * out, and walking to them at wave 2 with nothing built and nothing panned is how the first
 * measured run died: `secured:false, waves:2, gold:0`, the rider standing at `decide-segment-a`
 * with two verdicts in hand and no gun line behind it.
 *
 * So the road opens on EVIDENCE rather than on a wave number: once the aimed-damage ceiling is
 * standing (turret cap 4 + beacon cap 6), more gold only buys timber, and the two turns the walk
 * costs are the cheapest they will ever be. The wave floor below is the safety net — an objective
 * that waits for a gun line that never arrives is an objective that never discharges, and this
 * contract cannot secure with a band undecided at ANY wave.
 */
function roadIsOpen(now, near) {
  const byKind = now.works.byKind ?? {};
  const standing = Object.values(byKind).reduce((sum, count) => sum + count, 0);
  return near
    ? standing >= NEAR_STAKE_WORKS || now.wave >= NEAR_STAKE_DEADLINE_WAVE
    : ((byKind.turret ?? 0) >= 4 && (byKind.sentry_beacon ?? 0) >= 6) || now.wave >= FAR_STAKE_DEADLINE_WAVE;
}

const padKey = (entry) => `${entry.what}@${entry.where.x},${entry.where.z}`;

/**
 * THE RIDER LEARNS THE MAP FROM ITS REFUSALS. `collision` and its siblings are PERMANENT for that
 * pad; `cap_reached` is about the KIND (a WRECK still holds its slot); `insufficient_gold` is not
 * permanent and must never blacklist anything.
 *
 * A10 ADDS ONE MORE CLASS AND IT IS DELIBERATELY NOT LEARNED: `out_of_zone` inside a canal band is
 * TEMPORARY until that band is backfilled, so blacklisting it would throw the plan away one turn
 * before the ground opened. The plan simply re-offers the pad — the decision leg above always
 * runs first, so the window is a handful of turns at most.
 */
function learnFromRefusals(now, memo) {
  for (const record of now.orders ?? []) {
    if (record.status !== 'failed' || record.order?.verb !== 'BUILD') continue;
    const reason = record.reason ?? '';
    if (reason.includes('insufficient_gold')) continue;
    if (reason.includes('out_of_zone') && insideUndecidedBand(now.canalChoices, record.order.where)) continue;
    if (reason.includes('cap_reached')) memo.capped.add(record.order.what);
    else memo.refused.add(padKey({ what: record.order.what, where: record.order.where }));
  }
}

/**
 * The one refusal on this map that is TEMPORARY. A pad inside a band the profile has not decided
 * yet is refused today and legal the moment the backfill lands, so blacklisting it would throw the
 * plan's last row away one turn before the ground opened. A pad refused ANYWHERE ELSE — including
 * inside a band that was re-dug, which is water forever — is permanent and is learned.
 */
function insideUndecidedBand(canal, where) {
  if (!canal || !where) return false;
  return canal.segments.some((segment) =>
    where.x >= segment.minX && where.x <= segment.maxX
    && where.z >= segment.minZ && where.z <= segment.maxZ
    && canal.choices.find((entry) => entry.id === segment.id)?.choice === 'undecided');
}

function repairOrders(now, gate) {
  if (now.gold < 40) return [];
  const hurt = (now.works.entries ?? []).some((entry) =>
    entry.id !== 'palisade' && (entry.wrecked || entry.hp < entry.maxHp * gate / 100));
  return hurt ? [{ verb: 'REPAIR_UNDER', pct: gate }] : [];
}

function blastOrders(now) {
  if ((now.blastReadyInMs ?? 1) > 0 || now.threats.alive < BLAST_MIN) return [];
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

  // THE OBJECTIVE OUTRANKS EVERYTHING. This contract cannot secure with a band undecided, so a
  // rider that stops to build before it has walked the three stakes is playing to lose slowly.
  const decide = decisionOrders(now.canalChoices, now);
  if (decide) return [...picks, ...blastOrders(now), ...decide];

  const held = (now.works.entries ?? []).filter((entry) => !entry.wrecked);
  const taken = (pad) => held.some((entry) => distance(entry.position, pad) < 1.2);
  const priceOf = (kind) => {
    const row = (view.stablePrefix.mechanics.buildables ?? []).find((entry) => entry.id === kind);
    const standing = held.filter((entry) => entry.id === kind).length;
    return row ? row.costs[Math.min(standing, row.costs.length - 1)] : Number.POSITIVE_INFINITY;
  };
  // THE CEILING IS NOT IN THE VIEW, so the rider LEARNS it: `now.gold` carries no cap field, and
  // a plan that waits forever for a price the pocket can never hold is a plan that stalls with
  // the wave still coming. Tracking the highest gold ever SEEN is enough — a step priced above
  // that ceiling is skipped (not blacklisted) and the next affordable one is taken instead, and
  // the moment a stockpile lifts the ceiling the skipped step comes back on its own.
  memo.goldSeen = Math.max(memo.goldSeen ?? 0, now.gold);
  const open = PLAN.filter((entry) =>
    !memo.capped.has(entry.what) && !taken(entry.where) && !memo.refused.has(padKey(entry)));
  const strict = open[0];
  // STALL FIRST, THEN FALL THROUGH — and the order matters, because the naive version of this
  // rule cost eleven waves. A rider that skips ahead the moment a step is dearer than the gold it
  // has SEEN skips the very first turret (50) at t=1 with 30 gold seen, buys timber instead, and
  // dies at wave 6 the way front-loaded timber always does here. So the fall-through arms only
  // after the pocket has sat AT its own ceiling for three consecutive turns with the step still
  // unaffordable — which is the signature of a price the cap can never reach, not of a rider that
  // simply has not panned yet.
  const stuck = strict !== undefined && now.gold >= memo.goldSeen && priceOf(strict.what) > now.gold;
  memo.stalled = stuck ? (memo.stalled ?? 0) + 1 : 0;
  const step = memo.stalled >= 3
    ? open.find((entry) => priceOf(entry.what) <= memo.goldSeen) ?? strict
    : strict;
  const pan = panOrders(view);

  const mend = repairOrders(now, REPAIR_GATE);
  if (mend.length > 0) return [...picks, ...blastOrders(now), ...mend];

  if (step) {
    const stage = stageFor(step.where);
    const price = priceOf(step.what);
    if (now.gold < price) {
      memo.staged = false;
      return [...picks, ...blastOrders(now), ...(pan.length > 0 ? pan : [{ verb: 'HOLD', pos: { x: KEEP.x, z: KEEP_Z } }])];
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
  return [...picks, ...blastOrders(now), ...repairOrders(now, REPAIR_GATE), ...(pan.length > 0 ? pan : []), { verb: 'HOLD', pos: { x: KEEP.x, z: KEEP_Z } }];
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

  const canal = turn.view.now.canalChoices;
  outcome = {
    ...sim.outcome(),
    ...(endReason ? { endReason } : {}),
    seed,
    policy: idle ? 'idle' : 'public-verb',
    // The canal's own terminal state travels WITH the outcome, so a reader never has to trust a
    // sentence about the objective that the numbers do not carry.
    canal: canal
      ? { decided: canal.decided, total: canal.total, allDecided: canal.allDecided, flow: canal.flow, openGround: canal.openGround }
      : null,
  };
  process.stdout.write(`${JSON.stringify(outcome)}\n`);
  if (!quiet) process.stderr.write(`prover: ${turns} turns\n`);
} finally {
  await vite.close();
}
if (idle ? outcome?.secured : !outcome?.secured) process.exitCode = 1;

function trace(turns, now) {
  const canal = now.canalChoices;
  process.stderr.write(`t${turns} w${now.wave} gold=${now.gold} hp=${now.hero.hp.toFixed(0)}`
    + ` pros=(${now.prospector.x.toFixed(1)},${now.prospector.z.toFixed(1)})`
    + ` works=${JSON.stringify(now.works.byKind)} alive=${now.threats.alive}`
    + ` lvl=${now.hero.level} kills=${now.threats.defeatedTotal}`
    + ` canal=${canal ? `${canal.decided}/${canal.total}|flow=${canal.flow.join('+') || '-'}|open=${canal.openGround.join('+') || '-'}` : '???'}`
    + `${failures(now)}\n`);
}

function failures(now) {
  const failed = (now.orders ?? []).filter((record) => record.status === 'failed');
  return failed.length === 0 ? '' : ` FAIL=${failed.map((record) => record.reason).join('|')}`;
}

function valueOf(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}
