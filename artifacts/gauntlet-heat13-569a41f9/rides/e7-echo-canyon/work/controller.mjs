// heat13 opus — e7-echo-canyon controller.
//
// THE MAP'S ONE NEW THING: `now.playbookUse.objective === "mirror"`, and
// E7PlaybookLatch.allowsSecure returns `fieldedMirrors > 0` — so no wave count secures this
// claim until a corrupted squad has actually FIELDED. The loop is:
//   view 0  -> submit a demonstration that contains NO BUILD, NO BLAST_AT and no hero movement,
//              so BroadcastMirror.shapeOfTape gives the cheapest possible shadow
//              (count 2 = MIN_SQUAD, thief not wrecker, roving false, hunts false).
//   view 1  -> PLAYBOOK_USE a fresh name. noteUse queues one pending mirror.
//   next wave -> WaveSystem fields it, squadsFielded = 1, objectiveMet = true. Never use again.
// Everything after that is the gen-6..63 ordinary-survival skeleton.

const CLAIM = { x: 0, z: 12 };

// canyon-floor-yard is x -30..30, z -42..10; the hero is welded-by-choice at the claim (0,12),
// 2wu north of the zone's edge. Turret range 16 clears the whole approach from the z~9 line;
// a beacon's radius is 8, so only |x| <= ~7.7 on that line even touches the hero.
const TURRET_SPOTS = [
  { x: 0, z: 9 }, { x: -12, z: 9 }, { x: 12, z: 9 }, { x: 0, z: 1 },
  { x: -6, z: 2 }, { x: 6, z: 2 }, { x: -18, z: 9 }, { x: 18, z: 9 }, { x: 0, z: -5 },
];
const BEACON_SPOTS = [
  { x: -6, z: 10 }, { x: 6, z: 10 }, { x: 0, z: 6 }, { x: -3, z: 9 }, { x: 3, z: 9 },
  { x: -5, z: 6 }, { x: 5, z: 6 }, { x: 0, z: 9 }, { x: -2, z: 6 }, { x: 2, z: 6 },
  { x: -7, z: 8 }, { x: 7, z: 8 },
];

// Interleaved so real dps lands early but a cheap rung can never starve an expensive one:
// each rung is gated on the CUMULATIVE cost through it (gen 47/48).
const LADDER = [
  { id: 'turret', cost: 50 }, { id: 'sentry_beacon', cost: 25 },
  { id: 'turret', cost: 70 }, { id: 'sentry_beacon', cost: 35 },
  { id: 'turret', cost: 95 }, { id: 'sentry_beacon', cost: 45 },
  { id: 'turret', cost: 125 }, { id: 'sentry_beacon', cost: 55 },
  { id: 'sentry_beacon', cost: 75 }, { id: 'sentry_beacon', cost: 95 },
];

const TIER2_COST = 150;
// Gold is the ONLY free ranking axis at a fixed wave-20 secure, and the bank cap is 200.
// Stop buying with enough clock left for ~2.5 g/s to refill the purse to the cap (gen 63).
const STOP_SPENDING_AT = 495;
const BANK_CAP = 200;

const PLATING = /plating|dressing|hearty|vigor|constitution|armou?r|bulwark|tough/i;
const DAMAGE = /spark|coil|damage|tap|volley|burst|power|bolt/i;

function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

function liveSeams(now) {
  return (now.seams || [])
    .filter((s) => s && s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z)
      && typeof s.id === 'string' && s.remaining > 0);
}

function pickUpgrade(offer) {
  if (!offer || !offer.length) return null;
  let best = offer[0], bestScore = -1e9;
  for (const o of offer) {
    const text = `${o.id || ''} ${o.name || ''} ${o.effectText || ''}`;
    let s = 0;
    if (PLATING.test(text)) s += 100;
    if (DAMAGE.test(text)) s += 40;
    if (/speed|heel|luck|pan_|seam|carry/i.test(text)) s -= 20;
    if (s > bestScore) { bestScore = s; best = o; }
  }
  return best.id;
}

export function makeOrders(view, st) {
  const now = view.now || {};
  const pb = now.playbookUse || {};
  const bm = now.broadcastMirror || {};

  if (st.views === undefined) {
    st.views = 0;
    st.blacklist = new Set();     // coordinate key -> refused on GROUND, never on economy
    st.attempts = new Map();      // patience budget per spot
    st.used = false;
  }
  st.views += 1;
  const t = now.timers?.runSeconds ?? 0;

  // ---- the secure boundary: a blank line lets the configured `bank` default fire, records no
  // tape entry, and keeps the last accepted order well inside the tick envelope (gen 27/30).
  if (now.pendingSecure) return null;

  // ---- refusal blacklist, fed from the view's own order records.
  // GROUND reasons poison the coordinate; ECONOMY reasons poison nothing (gen 51).
  for (const rec of (now.orders || [])) {
    const o = rec && rec.order;
    if (!o || o.verb !== 'BUILD' || !o.where) continue;
    const reason = `${rec.reason || ''} ${rec.detail || ''}`;
    if (rec.status !== 'failed' || !reason) continue;
    if (/insufficient_gold/i.test(reason)) continue;
    if (/out_of_zone|collision|cap_reached|UNREACHABLE|out_of_reach|terrain/i.test(reason)) {
      st.blacklist.add(`${o.what}@${o.where.x},${o.where.z}`);
    }
  }

  const orders = [];

  // 1. The draft owns the tick first, under replace semantics.
  if (now.pendingOffer && now.pendingOffer.length) {
    const id = pickUpgrade(now.pendingOffer);
    if (id) orders.push({ verb: 'PICK_UPGRADE', id });
  }

  // ---- PHASE A (view 1): a build-free, blast-free, motionless demonstration.
  // shapeOfTape then reads: builds=false -> thief (not wrecker), volleys=false -> no hunt,
  // moving=0 -> not roving, acting small -> MIN_SQUAD of 2. The cheapest legal shadow.
  const objectiveMet = pb.objectiveMet === true || (bm.squadsFielded || 0) > 0;
  const needDemo = !objectiveMet && !st.used;

  if (needDemo && st.views === 1) {
    pushHarvest(orders, now, 30);
    return orders;
  }

  // ---- PHASE B: record + use, still build-free so the recorded tape stays clean.
  if (needDemo) {
    orders.push({ verb: 'PLAYBOOK_USE', name: 'echo-canyon-quiet-pan' });
    st.used = true;
    pushHarvest(orders, now, 30);
    return orders;
  }

  // ---- PHASE C: ordinary survival.

  // Free supplementary damage into the scrum standing on the hero. Returns {} either way,
  // so it never eats the tick from the work below it.
  if ((now.blastReadyInMs ?? 1) === 0) {
    const hz = now.hero?.z ?? CLAIM.z, hx = now.hero?.x ?? CLAIM.x;
    orders.push({ verb: 'BLAST_AT', pos: { x: hx, z: hz - 3 } });
  }

  const gold = now.gold ?? 0;
  const spending = t < STOP_SPENDING_AT;
  const entries = now.works?.entries || [];
  const byKind = now.works?.byKind || {};

  // Ladder: emit the remaining rungs as a cumulative-gated, non-decreasing prefix, and only
  // rungs the purse can plausibly reach. `works.byKind` is the retirement test, never a counter.
  let builtT = byKind.turret || 0, builtB = byKind.sentry_beacon || 0;
  const usedT = new Set(), usedB = new Set();
  for (const e of entries) {
    if (!e || !e.position) continue;
    const key = `${Math.round(e.position.x)},${Math.round(e.position.z)}`;
    if (e.id === 'turret') usedT.add(key); else if (e.id === 'sentry_beacon') usedB.add(key);
  }
  const nextSpot = (spots, taken, id) => {
    for (const s of spots) {
      const k = `${s.x},${s.z}`;
      if (taken.has(k)) continue;
      if (st.blacklist.has(`${id}@${s.x},${s.z}`)) continue;
      return s;
    }
    return null;
  };

  let ladderDone = true;
  if (spending) {
    let cum = 0;
    let tSeen = 0, bSeen = 0;
    const takenT = new Set(usedT), takenB = new Set(usedB);
    for (const rung of LADDER) {
      const isT = rung.id === 'turret';
      // skip rungs already standing
      if (isT) { tSeen += 1; if (tSeen <= builtT) continue; }
      else { bSeen += 1; if (bSeen <= builtB) continue; }
      ladderDone = false;
      cum += rung.cost;
      if (cum > gold + 400) break;           // do not carry a tail the run cannot reach
      const spot = nextSpot(isT ? TURRET_SPOTS : BEACON_SPOTS, isT ? takenT : takenB, rung.id);
      if (!spot) continue;
      (isT ? takenT : takenB).add(`${spot.x},${spot.z}`);
      orders.push({ verb: 'BUILD', what: rung.id, where: { x: spot.x, z: spot.z }, when: { goldGte: cum } });
      if (orders.length >= 14) break;
    }
  }

  // The capped-purse sink: a live gold sink is what keeps panning crediting at all, because
  // Economy refuses a credit while the purse sits at the cap (gen 39/45/48).
  // CONTEXT_ACTION does not travel and reaches from the HERO, so pair it with MOVE_HERO.
  if (spending && ladderDone && gold >= TIER2_COST) {
    const target = entries.find((e) => e && e.id === 'turret' && (e.tier ?? 1) < 2 && !e.wrecked);
    if (target && target.position) {
      orders.push({ verb: 'MOVE_HERO', pos: { x: target.position.x, z: target.position.z } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: target.index } });
    }
  } else if (!spending || gold >= BANK_CAP) {
    // Nothing left to buy: stand the hero back on the claim it is defending.
    orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
  }

  pushHarvest(orders, now, 32 - orders.length);
  return orders;
}

// A seam holds 30 gold = six 1.5s pans; the near anchors sit 22.8wu from the claim, so DRAIN one
// seam in a block before walking to the next (gen 47/51). The tail is emitted unconditionally:
// a HARVEST that fails where the Prospector already stands costs nothing and buys a decision
// point, and an array that can filter itself empty is a wipe generator (gen 42/59).
function pushHarvest(orders, now, budget) {
  if (budget <= 0) return;
  const live = liveSeams(now);
  const from = now.prospector && Number.isFinite(now.prospector.x) ? now.prospector : CLAIM;
  live.sort((a, b) => (dist(a, from) - dist(b, from)) || (a.id < b.id ? -1 : 1));
  // Prefer seams reachable without crossing the canyon: the two near anchors at (+-14,-6).
  const near = live.filter((s) => dist(s, CLAIM) <= 30);
  const chain = (near.length ? near : live);
  const BLOCK = 7;
  let i = 0;
  outer: while (orders.length < 32 && budget > 0) {
    if (!chain.length) break;
    const seam = chain[i % chain.length];
    for (let k = 0; k < BLOCK; k += 1) {
      if (orders.length >= 32 || budget <= 0) break outer;
      orders.push({ verb: 'HARVEST', seam: seam.id });
      budget -= 1;
    }
    i += 1;
    if (i > 8) break;
  }
  if (!orders.length) orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
}
