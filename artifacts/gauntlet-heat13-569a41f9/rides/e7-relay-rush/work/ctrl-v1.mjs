// heat13 opus — e7-relay-rush controller v1 (post-ADR-005 grammar: no MOVE_TO/HOLD/FALLBACK_IF).
//
// Two gates, both ANDed into autoSecureWaveForRun:
//   1. interferenceFront: >= 3 of 4 relay sites carry a standing turret/sentry_beacon at the
//      instant front 3 ARRIVES (t = 270.000s). One-way latch; miss it and no wave secures.
//   2. playbookUse (objective "suspended"): interferenceFront.refusals.playbooks > 0. Earned
//      either by a PLAYBOOK_USE issued while the HERO stands under the band, or by a running
//      program being auto-suspended at the hero by syncProgramSuspension (fires on the fixed
//      step, no view needed). We arm the program before front 1 and let the wall take it.
//
// Front geometry: cadence 90s, crossing 20s, halfWidth 6, corridor x -54..54.
// Centre runs -60 -> +60 over the 20s. Hero at x=-25 is muted from t=+4.833 to +6.833 of a
// crossing, i.e. t ~= 94.83..96.83 on front 1.

const CLAIM = { x: -25, z: 41 };
const BANK_CAP = 200;

// Only build ground on this map is the four 10x10 relay sites (z 36..46).
// r2 (x -30..-20) contains the claim, so the fort and one relay light are the same purchase.
const PLAN = [
  { id: 'sentry_beacon', x: -25, z: 44.5, tag: 'r2' },   // lights r2 free (no commute)
  { id: 'turret', x: -28.5, z: 43, tag: 'fort' },
  { id: 'sentry_beacon', x: -45, z: 41, tag: 'r1', minWave: 3 },  // 20wu trip
  { id: 'turret', x: -21.5, z: 43, tag: 'fort' },
  { id: 'sentry_beacon', x: 25, z: 41, tag: 'r3', minWave: 4 },   // 50wu trip
  { id: 'turret', x: -28.5, z: 38.5, tag: 'fort' },
  { id: 'sentry_beacon', x: -25, z: 37.5, tag: 'fort' },
  { id: 'turret', x: -21.5, z: 38.5, tag: 'fort' },
  { id: 'sentry_beacon', x: -29, z: 41, tag: 'fort' },
  { id: 'sentry_beacon', x: -21, z: 41, tag: 'fort' },
];
// spare coordinates if a planned spot refuses on GROUND
const SPARES = [
  { id: 'sentry_beacon', x: -26.5, z: 45.5 }, { id: 'sentry_beacon', x: -23.5, z: 37 },
  { id: 'turret', x: -27, z: 45.5 }, { id: 'turret', x: -23, z: 45.5 },
  { id: 'turret', x: -27, z: 37 }, { id: 'turret', x: -23, z: 39.5 },
  { id: 'sentry_beacon', x: -46.5, z: 43 }, { id: 'sentry_beacon', x: 26.5, z: 43 },
  { id: 'sentry_beacon', x: -43.5, z: 39 }, { id: 'sentry_beacon', x: 23.5, z: 39 },
];

const PLATING = /plating|dressing|hardy|vital|health|hp|armor|armour|tough/i;
const DAMAGE = /spark|tap|coil|damage|shot|volley|blast|pierce/i;

export function makeState() {
  return { badSpots: new Set(), tries: new Map(), programArmed: false, useCount: 0, lastA: null };
}

function keyOf(s) { return `${s.id}@${s.x},${s.z}`; }

function occupied(entries, spot) {
  return entries.some((e) => Math.hypot(e.position.x - spot.x, e.position.z - spot.z) < 1.2);
}

function priceOf(view, id, count) {
  const b = (view.stablePrefix.mechanics.buildables || []).find((x) => x.id === id);
  if (!b) return 9999;
  if (Array.isArray(b.costs) && count < b.costs.length) return b.costs[count];
  return b.costs ? Math.ceil((b.costs[b.costs.length - 1] * 1.2) / 5) * 5 : b.cost;
}
function capOf(view, id) {
  const b = (view.stablePrefix.mechanics.buildables || []).find((x) => x.id === id);
  return b ? (b.maxCount ?? 0) : 0;
}

function pickUpgrade(offer) {
  let best = offer[0], bestScore = -1e9;
  for (const o of offer) {
    const t = `${o.name} ${o.effectText}`;
    let s = 0;
    if (PLATING.test(t)) s += 100;
    if (DAMAGE.test(t)) s += 40;
    if (/gold|pan|luck|seam/i.test(t)) s += 5;
    if (s > bestScore) { bestScore = s; best = o; }
  }
  return best.id;
}

// harvest tail: drain the nearest live seam in a block before walking to the next (gen 47/51)
function harvestTail(now, slots) {
  const from = now.prospector || CLAIM;
  const live = (now.seams || [])
    .filter((s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map((s) => ({ id: s.id, d: Math.hypot(s.x - from.x, s.z - from.z), dc: Math.hypot(s.x - CLAIM.x, s.z - CLAIM.z) }))
    .sort((a, b) => (a.dc - b.dc) || (a.d - b.d));
  const out = [];
  if (live.length === 0) return out;
  const block = 6;
  let i = 0;
  while (out.length < slots) {
    const seam = live[Math.floor(i / block) % live.length];
    out.push({ verb: 'HARVEST', seam: seam.id });
    i += 1;
  }
  return out.slice(0, slots);
}

export function decide(view, st) {
  const now = view.now;
  const t = now.timers?.runSeconds ?? 0;
  const pb = now.playbookUse || {};
  const front = now.interferenceFront || {};
  const met = pb.objectiveMet === true;

  // 1. Secure boundary: blank line banks it for free and keeps the last accepted order
  //    strictly inside the tick envelope (F-HEAT11-1's cure, still free insurance).
  if (now.pendingSecure) return '\n';

  // 2. THE PLAYBOOK GATE.
  const heroX = now.hero?.x ?? CLAIM.x;
  const heroZ = now.hero?.z ?? CLAIM.z;
  const mutedNow = front.centerX !== null && front.centerX !== undefined
    && Math.abs(heroX - front.centerX) <= (front.halfWidth ?? 6)
    && heroZ >= -54 && heroZ <= 54;

  if (!met) {
    // 2a. The wall is over the hero RIGHT NOW: a use is refused on the spot and the refusal IS
    //     the objective. Cheapest possible discharge.
    if (mutedNow && st.lastA) {
      st.useCount += 1;
      return JSON.stringify([{ verb: 'PLAYBOOK_USE', name: `rush-${st.useCount}` }]) + '\n';
    }
    // 2b. Arm the program before front 1 (arrives t=90, sweeps the hero at t~94.8-96.8) and
    //     then stay silent so it keeps holding the wheel when the wall lands on it.
    if (!st.programArmed && st.lastA && t >= 55) {
      st.programArmed = true;
      st.useCount += 1;
      return JSON.stringify([{ verb: 'PLAYBOOK_USE', name: `rush-${st.useCount}` }]) + '\n';
    }
    if (st.programArmed && pb.runningProgram !== null) return '\n';  // let the program ride
    if (st.programArmed && pb.suspendedProgram) return '\n';
  }

  const orders = [];

  // 3. Draft first, under replace semantics.
  if (now.pendingOffer && now.pendingOffer.length) {
    orders.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer) });
  }

  // 4. Pin the hero on the claim. It starts there, so this completes on the first tick and
  //    falls through; it re-arms every submission and costs nothing when already home.
  orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });

  // 5. Free supplementary damage.
  if ((now.blastReadyInMs ?? 1) === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z + 6 } });
  }

  // 6. Refusal blacklist, partitioned GROUND vs ECONOMY (gen 51).
  for (const rec of now.orders?.orders ?? []) {
    const o = rec.order, r = String(rec.reason || '');
    if (o?.verb !== 'BUILD' || rec.status !== 'failed') continue;
    if (/insufficient_gold/i.test(r)) continue;            // transient — never poison
    const k = `${o.what}@${o.where.x},${o.where.z}`;
    st.tries.set(k, (st.tries.get(k) || 0) + 1);
    if (st.tries.get(k) >= 3) st.badSpots.add(k);
  }

  // 7. The ladder: remaining spots in priority order, non-decreasing price prefix.
  const entries = now.works?.entries ?? [];
  const counts = {};
  for (const e of entries) counts[e.id] = (counts[e.id] || 0) + 1;
  const wave = now.wave ?? 0;
  const litIds = new Set((front.sites || []).filter((s) => s.lit).map((s) => s.id));
  const needLights = Math.max(0, (front.relayTarget ?? 3) - litIds.size);
  const deadlineClose = !front.deadlineResolved && (front.frontsArrived ?? 0) >= (front.deadlineFront ?? 3) - 1;

  const pool = PLAN.concat(SPARES);
  const wanted = [];
  const seen = new Set();
  const localCounts = { ...counts };
  for (const spot of pool) {
    const k = keyOf(spot);
    if (st.badSpots.has(k) || seen.has(k)) continue;
    if (occupied(entries, spot)) continue;
    if ((localCounts[spot.id] || 0) >= capOf(view, spot.id)) continue;
    // hold the far relay trips until the fort stands, unless the deadline is closing in
    if (spot.minWave && wave < spot.minWave && !(deadlineClose && needLights > 0)) continue;
    seen.add(k);
    wanted.push({ ...spot, price: priceOf(view, spot.id, localCounts[spot.id] || 0) });
    localCounts[spot.id] = (localCounts[spot.id] || 0) + 1;
    if (wanted.length >= 6) break;
  }
  // non-decreasing price prefix: cut at the first price decrease so no cheap rung starves a
  // dearer one that sits above it (gen 9), then gate cumulatively (gen 47/48).
  let cum = 0, lastPrice = 0;
  for (const w of wanted) {
    if (w.price < lastPrice) break;
    lastPrice = w.price;
    cum += w.price;
    orders.push({ verb: 'BUILD', what: w.id, where: { x: w.x, z: w.z }, when: { goldGte: cum } });
    if (orders.length >= 12) break;
  }

  // 8. Gold sink once the ladder is done: turret tiers, so the purse never pins and panning
  //    keeps crediting (a full bucket refuses the credit outright).
  const ladderDone = wanted.length === 0;
  if (ladderDone && (now.gold ?? 0) >= 150) {
    const target = entries.find((e) => e.id === 'turret' && (e.tier ?? 1) < 2);
    if (target) {
      orders.push({ verb: 'MOVE_HERO', pos: { x: target.position.x, z: target.position.z + 1.2 } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: target.index } });
    }
  }

  // 9. Harvest tail — pad to exactly 32 so that whatever slice the program takes is a complete
  //    standing policy, and so the first array is exactly the program.
  const slots = Math.max(0, 32 - orders.length);
  orders.push(...harvestTail(now, slots));
  while (orders.length > 32) orders.pop();

  const sig = JSON.stringify(orders);
  st.lastA = sig;
  return sig + '\n';
}
