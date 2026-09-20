#!/usr/bin/env node

/**
 * THE FAIRGROUND PROVER, SECOND RIDE (F-E3CF-4, 2026-08-20).
 *
 * `artifacts/e3-fairground/prover.mjs` is the first ride and stays where it is: it reached wave 14
 * with the wheel untouched and seven crossings banked, and it never got the middle crowd across.
 * This one is a different rider, written against what the FIRST one's failure measured. Everything
 * below is a public verb through the ordinary stdin door (`src/agent/StandingOrders.ts`): HARVEST,
 * BUILD, REPAIR_UNDER, MOVE_TO, PICK_UPGRADE, CONTEXT_ACTION demolish, SECURE_CHOICE. No
 * `admissionProbe` in the proving mode, no balance edits, no private handles.
 *
 * ── FIVE THINGS THE FIRST RIDE DID NOT KNOW ──────────────────────────────────────────────────
 *
 * 1. THE VIEW'S SEAM MAP IS NOT THE SEAMS. `stablePrefix.map.seams` publishes the six ANCHORS,
 *    keyed `gold-seam-<anchorIndex+1>`; `now.seams` reports the live NODES; and a node sits on a
 *    SHUFFLED anchor. On bench seed 01 `gold-seam-1` is at (7.5,6.5) and on seed 02 at (25,6.9),
 *    while the map says (-22,-6.8) for both. A rider that trusts the map walks to the wrong side
 *    of the fair — which is exactly what "it chased the richest seam" was. This rider LEARNS the
 *    map: when a seam's `remaining` falls, the body is standing on it, so the anchor under the
 *    Prospector is that seam's anchor until it goes inactive and respawns somewhere else.
 *
 * 2. PANNING IS INSTANT; TRAVEL IS THE WHOLE COST. One accepted HARVEST advances the harvest by a
 *    full `goldSeam.tickSeconds` in a single tick (`HeadlessContractSim.panAt`), so a seam pays out
 *    its whole capacity in six orders and a fifth of a second. The funding table in
 *    `reviews/e3-fairground-crowd-flocks.md` prices panning at 9 seconds per 30 gold; the real
 *    price is the walk. The ceiling is therefore much higher than 1.60 g/s — this rider measures
 *    1.5-2.1 g/s while ALSO carrying the fort — and `pan_legend` is worth nothing to an agent
 *    (the multiplier cancels inside `panAt`), while `prospectors_luck` is worth a great deal
 *    (+10 seam capacity and -5s respawn per stack, applied to every node).
 *
 * 3. THE VIEW ARRIVES ONLY AT WAVE BOUNDARIES AND SURPRISES. Between t=0 and the first wave there
 *    is no second turn at all, so the opening has to be a complete script rather than a state
 *    machine waiting to be asked again. The rider buys its own turn honestly: every seam is asked
 *    for ONE pan more than it can pay, and the refusal when it runs dry raises the ordinary
 *    order-failure surprise at exactly the moment the rider has news.
 *
 * 4. THE WHEEL'S DYNAMO STOPS ON ITS FIRST HIT, FOR THE RUN (`FerrisWheel.damage` sets
 *    `spinning = false` and only `reset()` clears it). Undefended it takes that hit at t~21s. Any
 *    post the rider owns is nearer to the saboteurs' 26wu spawn ring than a wheel 47wu beyond it,
 *    so the opening is a race to plant ONE post — and, measured on seed 02, a post planted NORTH
 *    of the wheel's watershed is worse than none: it diverts the saboteurs and then delivers them
 *    to the wheel's doorstep when it falls (first hit moved t=22 -> t=33.5, run still lost).
 *
 * 5. `REPAIR_UNDER` CANNOT BE AIMED. It takes the lowest-indexed hurt work, so an emergency post
 *    off the ring becomes the first stop of every mending trip for the rest of the run. The rider
 *    plants one only when the clock says the ring will be late, and demolishes it once the ring
 *    can stand on its own.
 *
 * Usage:
 *   node artifacts/e3-fairground/prover-v2.mjs --seed e3-fairground-01
 *   node artifacts/e3-fairground/prover-v2.mjs --seed e3-fairground-01 --probe   # measurement only
 *
 * `--probe` runs the SAME rider against an in-process `HeadlessContractSim` with the declared
 * `admissionProbe` seam, for use while `e3-fairground` is still exempted from the door. It is a
 * measurement path and makes no playability claim; the proof runs are the plain door above.
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const argv = process.argv.slice(2);
const valueOf = (flag) => {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
};

// ── THE FORT ────────────────────────────────────────────────────────────────────────────────────
// The target is the one `artifacts/e3-fairground/fort-budget-probe.mjs` priced: a radius-EIGHT
// palisade ring around the stake plus four sentry beacons, ~320 gold of construction. Radius eight
// is not a taste: the crowds take fright at 7, so a besieger pressed against a ring one unit wider
// than that stands OUTSIDE the middle crowd's ring while it waits at the gate. A tighter box parks
// them inside it and that crowd can never step out.
const GATE = { x: 0, z: -30 };
const RING_RADIUS = 8;
const RING_STEP = 4;
/**
 * THE RING BREATHES ON THE SHIFTED SIDE. After the owner's gate-lane ruling (2026-08-20,
 * `CrowdFlockSystem.GATE_LANE_SHIFT`) the middle crowd waits 6wu off the stake, and a wall at the
 * ordinary radius would put it inside its own defenders' siege: besiegers press about 1.5wu beyond
 * whatever they are chewing, so a crowd at -6 needs that wall at -12 to keep the declared fright
 * radius of 7. Only that one wall moves — the rest of the ring is unchanged, and the extra span
 * costs two posts.
 */
const LANE_SHIFT = Number(process.env.GR_LANESHIFT ?? 0);
const SHIFT_SIDE = Math.sign(LANE_SHIFT) || -1;
/** `Balance.beacon` costs: 25 base x 1.3 growth, rounded up to 5. */
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];
/**
 * SIX SPOTS, AND THE LAST TWO ARE A KNOWN, DELIBERATE DEAD END — F-E3CF-6.
 *
 * (+-7,-30) sits ONE unit from the ring's own flank post, inside the overlap radius, so
 * `place_building` refuses it for the whole run. That is not harmless: the purse RESERVE in
 * `orders()` stops at the first plan piece it cannot cover, and a piece that can never be built is
 * never covered, so the reserve halts there permanently and the fort settles at about FOURTEEN
 * works instead of the twenty-two the plan lists — and the rest of the purse goes to upkeep.
 *
 * THAT ACCIDENT IS WHAT SECURES BENCH SEED 01. Removing the two dead spots and letting the rider
 * buy its whole plan was measured on both seeds at five construction budgets (10/12/14/16/22
 * works): the middle crowd crossed ZERO times in all ten runs and seed 01 fell from wave 12 to
 * wave 2-6. Replacing the accident with an explicit `maxWorks` cap did not recover it either —
 * the cap reproduces the SIZE of the fort but not its SHAPE, because the reserve also decides
 * WHICH pieces get bought and in what order as the purse rises.
 *
 * So the list stays exactly as measured, and the mechanism is written down rather than tidied
 * away: this rider's fort is "everything up to the first gun it cannot plant", which is a strategy
 * it found rather than one it was given. A future rider that wants the same fort ON PURPOSE should
 * name the pieces, not inherit the refusal.
 */
const BEACON_SPOTS = LANE_SHIFT === 0
  ? [{ x: -4, z: -26 }, { x: 4, z: -26 }, { x: -4, z: -34 }, { x: 4, z: -34 }, { x: -7, z: -30 }, { x: 7, z: -30 }]
  // With the crowd moved aside, the guns move to the side it LEFT, so no gun stands within the
  // waiting crowd's fright radius.
  : [2, 6].flatMap((offset) => [-26, -34, -30].map((z) => ({ x: -offset * SHIFT_SIDE, z })))
    .sort((left, right) => Math.abs(left.x) - Math.abs(right.x) || left.z - right.z);
/** The contract's declared `tileParams.buildZones`. */
const ZONES = [
  { minX: -36, maxX: 36, minZ: -38, maxZ: -12 },
  { minX: -38, maxX: -10, minZ: -8, maxZ: 30 },
  { minX: 10, maxX: 38, minZ: -8, maxZ: 30 },
];

const CONFIG = {
  beacons: Number(process.env.GR_BEACONS ?? 6),
  /** Mend at 60%: `ceil(cost x 0.25 x missing)` is exactly 1 gold for a palisade at 40% missing,
   *  which is the cheapest hit-point in the table (24 hp/gold); mending later or earlier costs
   *  more per point. */
  repairPct: 60,
  /** A fort trip is only worth the walk with this much in the purse — except while the fort is an
   *  infant, when every coin is worth it, and when the seam field is dry and the walk is free. */
  minTrip: Number(process.env.GR_MINTRIP ?? 70),
  maxRepairs: 18,
  /** `Balance.beacon.placeRadius` is 6 for every buildable here; 5.4 leaves room for the slide. */
  reach: 5.4,
  /** A post within this of an escort lane draws besiegers into that crowd's fright radius. */
  lanePad: 8,
  /** The palisade footprint is 1x3 and the placement test measures the FOOTPRINT, so ground on a
   *  zone's edge refuses with `out_of_zone`. */
  zonePad: 2,
  /** Nothing is planted north of this: a post there hands the saboteurs to the wheel. */
  southLimit: -12,
  standTravelWeight: 12,
  openTravelWeight: 8,
  /** Below this many standing works the fort is an infant and buys with whatever it has. */
  infant: 5,
  /** `Balance.agent.moveSpeed`; the Prospector's walk is not upgradable (`moveSpeedMult` is the
   *  HERO's stat, and the headless hero never moves). */
  agentSpeed: 4.8,
  /** If the ring cannot be reached by this clock reading, plant an emergency post on the way. */
  postDeadline: 15,
  detourBudget: 10,
  strayClearAt: 6,
  strayRange: 14,
  panCap: 20,
  rebuildCap: 3,
  /** How many works the rider will ever OWN — see the construction budget in `fortPlan`. */
  maxWorks: Number(process.env.GR_MAXWORKS ?? Number.POSITIVE_INFINITY),
  /** Fright radius 7 minus the ~1.5wu a besieger stands off the wall it is chewing. */
  laneClear: Number(process.env.GR_LANECLEAR ?? 5.5),
  picks: [
    // Income first: `prospectors_luck` is the only upgrade that moves the gold rate for an agent.
    'prospectors_luck',
    // Then REACH up the middle crowd's lane. The crowds are scattered by night runners that enter
    // 26wu due north and walk the lane to the stake; nothing the rider can BUILD reaches them
    // (a beacon's range is 8 and a beacon parked a lane-clear 8wu aside covers exactly one point
    // of the lane), so the hero's own rig is the only gun that can clear the corridor.
    'long_resonator', 'heavy_spark', 'split_spark', 'double_tap_coil',
    'tinkers_plating', 'beacon_dynamo', 'sharpen', 'field_dressing',
  ],
};

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function fortPlan(config) {
  const r = RING_RADIUS;
  // The wall on the crowd's side stands further out (see LANE_SHIFT); the other three do not move.
  // With no shift there is nothing to make room for and the ring is the plain radius-8 box.
  const wide = LANE_SHIFT === 0 ? RING_RADIUS : Math.abs(LANE_SHIFT) + Math.ceil(config.laneClear);
  const minX = SHIFT_SIDE < 0 ? -wide : -r;
  const maxX = SHIFT_SIDE < 0 ? r : wide;
  const northSouth = [];
  const eastWest = [];
  for (let x = minX; x <= maxX; x += RING_STEP) {
    northSouth.push({ what: 'palisade', x, z: GATE.z - r, rotationSteps: 1, cost: 10 });
    northSouth.push({ what: 'palisade', x, z: GATE.z + r, rotationSteps: 1, cost: 10 });
  }
  for (let z = GATE.z - r + RING_STEP; z <= GATE.z + r - RING_STEP; z += RING_STEP) {
    eastWest.push({ what: 'palisade', x: minX, z, rotationSteps: 0, cost: 10 });
    eastWest.push({ what: 'palisade', x: maxX, z, rotationSteps: 0, cost: 10 });
  }
  const ring = [...eastWest, ...northSouth];
  const flanks = ring.filter((p) => (p.x === minX || p.x === maxX) && p.z === GATE.z);
  const rest = ring.filter((p) => !flanks.includes(p));
  const beacons = BEACON_SPOTS.slice(0, config.beacons)
    .map((spot, index) => ({ what: 'sentry_beacon', ...spot, cost: BEACON_COSTS[index] }));
  // GUNS BEFORE WALL, measured: the same rider with the ring first dies around wave 5, because two
  // flank posts and a purse of timber do not kill anything. Two posts buy the wheel its decoy; the
  // beacons buy the run.
  const order = [...flanks, ...beacons, ...rest];
  // THE CONSTRUCTION BUDGET, and it is the single most load-bearing number in this file. A fort is
  // not free to OWN: every piece is another thing to walk to and mend, and the middle crowd needs
  // the pieces that stand to stand WELL, not a longer wall in pieces. Measured the hard way: an
  // earlier plan listed two beacons that `place_building` can never accept, the purse reserve stopped
  // dead at the first of them, and the accidental cap — about fourteen works — is what made that
  // configuration secure. Naming the cap turns a fluke into a policy.
  return order.slice(0, config.maxWorks);
}

export function makeRider(overrides = {}) {
  const config = { ...CONFIG, ...overrides };
  const plan = fortPlan(config);
  return {
    orders(view, memo) {
      const now = view.now;
      if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
      learnSeams(view, memo);
      learnLanes(view, memo);

      const head = now.pendingOffer
        ? [{ verb: 'PICK_UPGRADE', id: config.picks.find((id) => now.pendingOffer.some((e) => e.id === id)) ?? now.pendingOffer[0].id }]
        : [];
      const entries = now.works.entries ?? [];
      const missing = missingPlan(plan, entries, memo, config);
      const hurt = entries.filter((e) => e.wrecked || (e.maxHp > 0 && (e.hp / e.maxHp) * 100 < config.repairPct));
      const pros = now.prospector ?? GATE;
      const infant = entries.filter((e) => !e.wrecked).length < config.infant;

      // THE OPENING: one seam, then a post. There is no gold at t=0 and no second turn until the
      // seam runs dry, so the first submission is simply "drain the nearest seam you can name".
      if (entries.length === 0 && now.gold < 10) {
        const seam = chooseSeam(view, memo, pros);
        return seam ? [...head, ...pans(seam.id, 7)] : [...head];
      }

      // THE OPENING BUYS TIMBER, NEVER A GUN: thirty gold is three 60-hp posts or one 40-hp beacon,
      // and what the wheel needs in its first twenty seconds is something STANDING, not something
      // shooting. From the second errand on, the plan order (guns before wall) rules — measured,
      // the same rider with the ring first dies around wave 5.
      const wanted = entries.length < 3 ? missing.filter((p) => p.what === 'palisade') : missing;
      const stand = standPoint(wanted, hurt, pros, config, infant ? config.openTravelWeight : config.standTravelWeight);
      const reachable = stand ? wanted.filter((p) => dist(p, stand) <= config.reach) : [];
      // THE PURSE IS A RESERVE, NOT A BUDGET: it is allocated in plan order and STOPS at the first
      // piece it cannot cover. A `BUILD` whose `goldGte` is unmet is SKIPPED rather than queued, so
      // a list that asks for a 35-gold beacon and three 10-gold posts in one breath spends the
      // purse on timber every trip and never buys the gun — measured, the rider finished the whole
      // sixteen-piece ring by t=169s with exactly ONE of its guns standing. Walking PAST the gun to
      // buy the cheap pieces behind it measures worse still, so the reserve stops dead.
      let purse = now.gold;
      const inReach = reachable.filter((p) => (purse -= p.cost) >= 0);
      const repairs = Math.min(config.maxRepairs, hurt.length);
      const dry = liveSeams(view).length === 0;
      const fortWorth = stand !== null && (inReach.length > 0 || repairs > 0)
        && ((infant && now.gold >= 10) || now.gold >= config.minTrip || (dry && now.gold >= 3));

      const script = [...head];
      // Pay off the emergency post before it can cost another mending trip.
      const stray = entries.find((e) => e.id === 'palisade'
        && dist(e.position, GATE) > config.strayRange
        && !plan.some((p) => p.what === 'palisade' && dist(p, e.position) < 2.5));
      if (stray && entries.filter((e) => !e.wrecked).length >= config.strayClearAt && now.gold >= 3) {
        script.push({ verb: 'MOVE_TO', pos: { x: stray.position.x, z: stray.position.z } });
        script.push({ verb: 'CONTEXT_ACTION', action: 'demolish', target: { id: 'palisade', index: stray.index } });
      }
      if (fortWorth) {
        const arrival = now.timers.runSeconds + dist(pros, stand) / config.agentSpeed;
        const early = !memo.postPlanted && infant && now.gold >= 20 && arrival > config.postDeadline
          ? onTheWay(pros, stand, memo, config)
          : null;
        if (early) {
          memo.postPlanted = true;
          script.push({ verb: 'MOVE_TO', pos: early });
          script.push(buildOrder({ what: 'palisade', ...early, cost: 10, rotationSteps: 0 }));
        }
        script.push({ verb: 'MOVE_TO', pos: { x: stand.x, z: stand.z } });
        for (const piece of inReach) script.push(buildOrder(piece));
        for (let i = 0; i < repairs; i += 1) script.push({ verb: 'REPAIR_UNDER', pct: config.repairPct });
      }
      const from = fortWorth ? stand : pros;
      script.push(...panChain(view, memo, from, Math.min(config.panCap, 32 - script.length)));
      // Seams respawn on a random OPEN anchor, so an idle body waits among the ones nobody is
      // standing on rather than drifting back to the stake and paying the walk out again.
      if (!fortWorth && dry) script.push({ verb: 'MOVE_TO', pos: waitingSpot(view, memo) });
      return script.slice(0, 32);
    },
  };
}

const pans = (id, count) => Array.from({ length: count }, () => ({ verb: 'HARVEST', seam: id }));

/**
 * WHAT THE PLAN STILL OWES. A placed post SLIDES off the spot it was asked for
 * (`Balance.palisade.slideBias` / `avoidancePad`), so "is this one of mine?" is a 2.5wu question:
 * matching at 1.6 makes the rider believe its own wall is missing, rebuild it, and — worse — read
 * it as a stray and demolish it. A piece the fort has lost `rebuildCap` times steps to the back of
 * the queue while anything else is still unbuilt, so the purse cannot be poured into one hot spot.
 */
function missingPlan(plan, entries, memo, config) {
  memo.seen ??= {};
  memo.lost ??= {};
  const gone = [];
  const open = [];
  for (const piece of plan) {
    const key = `${piece.what}:${piece.x}:${piece.z}`;
    if (entries.some((e) => e.id === piece.what && dist(e.position, piece) < 2.5)) {
      memo.seen[key] = true;
      continue;
    }
    if (memo.seen[key]) {
      memo.lost[key] = (memo.lost[key] ?? 0) + 1;
      memo.seen[key] = false;
    }
    ((memo.lost[key] ?? 0) >= config.rebuildCap ? gone : open).push(piece);
  }
  return open.length > 0 ? open : gone;
}

const buildOrder = (piece) => ({
  verb: 'BUILD',
  what: piece.what,
  where: { x: piece.x, z: piece.z },
  when: { goldGte: piece.cost },
  ...(piece.rotationSteps === undefined ? {} : { rotationSteps: piece.rotationSteps }),
});

function learnSeams(view, memo) {
  const now = view.now;
  const anchors = view.stablePrefix.map.seams;
  memo.anchorOf ??= {};
  const previous = memo.seamState ?? {};
  const near = now.prospector ? anchors.filter((a) => dist(a, now.prospector) <= 2.5) : [];
  for (const seam of now.seams) {
    const before = previous[seam.id];
    if (!seam.active) delete memo.anchorOf[seam.id];
    else if (before?.active && seam.remaining < before.remaining && near.length === 1) {
      memo.anchorOf[seam.id] = { x: near[0].x, z: near[0].z };
    }
  }
  memo.seamState = Object.fromEntries(now.seams.map((s) => [s.id, { active: s.active, remaining: s.remaining }]));
}

/** The escort lanes, read off the view: a crowd waiting at the gate stands in its own lane. */
function learnLanes(view, memo) {
  memo.lanes ??= {};
  for (const flock of view.now.fairground?.flocks?.flocks ?? []) {
    if (flock.phase === 'home') memo.lanes[flock.id] = flock.x;
  }
}

function laneClear(spot, memo, config) {
  return Object.values(memo.lanes ?? {}).every((laneX) => {
    const z = Math.max(GATE.z, Math.min(12, spot.z));
    return Math.hypot(spot.x - laneX, spot.z - z) >= config.lanePad;
  });
}

const liveSeams = (view) => view.now.seams.filter((s) => s.active && s.remaining > 0);

/** A seam we have stood on has a real distance; one we have not gets the mean anchor distance. */
function seamCost(seam, memo, from, view) {
  const known = memo.anchorOf?.[seam.id];
  if (known) return dist(known, from);
  const anchors = view.stablePrefix.map.seams;
  return anchors.reduce((sum, a) => sum + dist(a, from), 0) / anchors.length;
}

function chooseSeam(view, memo, from) {
  return liveSeams(view).sort((a, b) => seamCost(a, memo, from, view) - seamCost(b, memo, from, view))[0];
}

function panChain(view, memo, from, budget) {
  const live = liveSeams(view);
  const chain = [];
  let at = from;
  let left = Math.max(0, budget);
  const used = new Set();
  while (left > 0) {
    const next = live.filter((s) => !used.has(s.id))
      .sort((a, b) => seamCost(a, memo, at, view) - seamCost(b, memo, at, view))[0];
    if (!next) break;
    used.add(next.id);
    const want = Math.min(left, Math.ceil(next.remaining / 5) + 1);
    chain.push(...pans(next.id, want));
    left -= want;
    at = memo.anchorOf?.[next.id] ?? at;
  }
  return chain;
}

function waitingSpot(view, memo) {
  const anchors = view.stablePrefix.map.seams;
  const taken = new Set(Object.values(memo.anchorOf ?? {}).map((a) => `${a.x}:${a.z}`));
  const open = anchors.filter((a) => !taken.has(`${a.x}:${a.z}`));
  const pool = open.length > 0 ? open : anchors;
  return {
    x: Number((pool.reduce((sum, a) => sum + a.x, 0) / pool.length).toFixed(2)),
    z: Number((pool.reduce((sum, a) => sum + a.z, 0) / pool.length).toFixed(2)),
  };
}

function inZone(spot, config) {
  return ZONES.some((zone) => spot.x >= zone.minX + config.zonePad && spot.x <= zone.maxX - config.zonePad
    && spot.z >= zone.minZ + config.zonePad && spot.z <= zone.maxZ - config.zonePad);
}

/** The soonest legal, lane-clear ground south of the wheel's watershed, within a bounded detour. */
function onTheWay(from, to, memo, config) {
  const direct = dist(from, to);
  if (direct < 1) return null;
  let best = null;
  let bestArrival = Infinity;
  for (let x = -34; x <= 34; x += 2) {
    for (let z = -36; z <= config.southLimit; z += 2) {
      const spot = { x, z };
      if (!inZone(spot, config) || !laneClear(spot, memo, config)) continue;
      const arrival = dist(from, spot);
      if (arrival + dist(spot, to) - direct > config.detourBudget) continue;
      if (arrival < bestArrival) { best = spot; bestArrival = arrival; }
    }
  }
  return best && direct - bestArrival >= 8 ? best : null;
}

/**
 * Where to stand: the spot from which the most fort pieces are in reach, discounted by the walk.
 * Candidates ring each wanted piece, so the body stops on the NEAR side of the fort instead of
 * crossing it. A BUILD checks the TARGET's zone, never the builder's ground, and a friendly body
 * never frightens a crowd — so neither zones nor lanes bind the stand point itself.
 */
function standPoint(targets, hurt, from, config, travelWeight) {
  if (targets.length === 0 && hurt.length === 0) return null;
  const anchors = targets.length > 0 ? targets : hurt.map((e) => e.position);
  const candidates = [];
  for (const target of anchors) {
    for (const radius of [0, 2.5, 4.6]) {
      const steps = radius === 0 ? 1 : 16;
      for (let i = 0; i < steps; i += 1) {
        const angle = (i / steps) * Math.PI * 2;
        candidates.push({
          x: Number((target.x + Math.cos(angle) * radius).toFixed(1)),
          z: Number((target.z + Math.sin(angle) * radius).toFixed(1)),
        });
      }
    }
  }
  let best = null;
  let bestScore = -Infinity;
  for (const spot of candidates) {
    const score = targets.filter((p) => dist(p, spot) <= config.reach).length - dist(spot, from) / travelWeight;
    if (score > bestScore) { best = spot; bestScore = score; }
  }
  return best;
}

// ── DRIVERS ─────────────────────────────────────────────────────────────────────────────────────

async function rideTheDoor({ contract, seed, quiet }) {
  const child = spawn(process.execPath, ['scripts/gr-sim.mjs', '--contract', contract, '--seed', seed], {
    cwd: ROOT,
    stdio: ['pipe', 'pipe', 'inherit'],
  });
  const rider = makeRider();
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
    if (!quiet) process.stderr.write(`${traceLine(turns, message.now)}\n`);
    turns += 1;
    if (!child.stdin.writable || child.stdin.destroyed) continue;
    try {
      child.stdin.write(`${JSON.stringify(rider.orders(message, memo))}\n`);
    } catch {
      // gr-sim closes stdin the moment the run terminates; a lost final line is not an error.
    }
  }
  child.stdin.end();
  const code = await new Promise((resolve) => child.on('close', resolve));
  if (!quiet) process.stderr.write(`prover-v2: ${turns} turns, gr-sim rc=${code}\n`);
  return outcome;
}

/**
 * MEASUREMENT MODE. Same rider, same loop gr-sim runs (`currentTurn` -> `submitOrders` ->
 * `advanceToTurn`, wave ceiling `secureWave + 2`), against an in-process sim opened with the
 * declared `admissionProbe` seam. Used while the contract is exempted; it measures and claims
 * nothing.
 */
async function rideTheProbe({ contract, seed, quiet }) {
  const { createServer } = await import('vite');
  globalThis.location = new URL(`http://gr-sim.local/?debug&contract=${contract}&seed=${seed}`);
  globalThis.window = { location: globalThis.location };
  const real = console.log;
  console.log = console.info = console.debug = () => undefined;
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    console.log = real;
    const sim = new HeadlessContractSim({ contractId: contract, seed, admissionProbe: true });
    const ceiling = (sim.manifest.twist.secureWave ?? 20) + 2;
    const rider = makeRider();
    const memo = {};
    let turn = sim.currentTurn();
    let turns = 0;
    while (true) {
      if (!turn.terminal && turn.view.now.wave >= ceiling) {
        sim.hero.hp = 0;
        sim.dead = true;
        turn = sim.currentTurn();
      }
      if (!quiet) process.stderr.write(`${traceLine(turns, turn.view.now)}\n`);
      if (turn.terminal) break;
      const receipt = sim.submitOrders(rider.orders(turn.view, memo));
      if (!receipt.outcome.ok) process.stderr.write(`prover-v2 rejected: ${receipt.outcome.message ?? receipt.outcome.reason}\n`);
      turns += 1;
      turn = sim.advanceToTurn();
    }
    const outcome = sim.outcome();
    const panned = sim.economy.log.filter((e) => e.type === 'gold_panned').reduce((sum, e) => sum + e.amount, 0);
    const spent = sim.economy.log.filter((e) => e.type === 'gold_spent').reduce((sum, e) => sum + e.amount, 0);
    const ledger = { panned: Math.round(panned), spent: Math.round(spent), granted: Math.round(sim.economy.log.filter((e) => e.type === 'gold_granted').reduce((s, e) => s + e.amount, 0)) };
    // Read-only: the escort's own counters, so a "did not secure" can say WHICH clause refused.
    const escort = sim.crowdFlocks
      ? {
          crossings: sim.crowdFlocks.diagnostics.flocks.map(({ crossings }) => crossings),
          homes: sim.crowdFlocks.diagnostics.flocks.map(({ id }) => id),
          attempts: sim.crowdFlocks.diagnostics.attempts,
          frights: sim.crowdFlocks.diagnostics.frights,
          wheelSpinning: sim.ferrisWheel?.diagnostics.spinning ?? null,
        }
      : null;
    process.stdout.write(`${JSON.stringify({ ...outcome, admissionProbe: true, ledger, escort })}\n`);
    if (!quiet) process.stderr.write(`prover-v2 probe: ${turns} turns\n`);
    return outcome;
  } finally {
    console.log = real;
    await vite.close();
  }
}

function traceLine(turn, now) {
  const fair = now.fairground;
  return `t${turn} s${now.timers.runSeconds.toFixed(0)} w${now.wave} gold=${Math.round(now.gold)} hp=${now.hero.hp.toFixed(0)}`
    + ` works=${now.works.standing}/${now.works.standing + now.works.wrecked}`
    + ` alive=${now.threats.alive}`
    + ` wheel=${fair ? `${fair.wheel.spinning ? 'spin' : 'STOP'}/${fair.wheel.hp.toFixed(0)}` : '-'}`
    + ` crossings=${fair ? fair.flocks.flocks.map((f) => f.crossings).join('') : '-'}`
    + ` att=${fair?.flocks.attempts ?? 0}`
    + ` pros=(${now.prospector ? `${now.prospector.x.toFixed(0)},${now.prospector.z.toFixed(0)}` : '-'})`;
}

// Compared through `fileURLToPath`, never by string-splicing `file://` onto argv[1]: this repo's
// own path contains a space, which a file URL percent-encodes, and the naive form silently turns
// the prover into a no-op that exits 0.
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const options = {
    contract: valueOf('--contract') ?? 'e3-fairground',
    seed: valueOf('--seed') ?? 'e3-fairground-01',
    quiet: argv.includes('--quiet'),
  };
  const outcome = argv.includes('--probe') ? await rideTheProbe(options) : await rideTheDoor(options);
  if (!outcome?.secured) process.exitCode = 1;
}
