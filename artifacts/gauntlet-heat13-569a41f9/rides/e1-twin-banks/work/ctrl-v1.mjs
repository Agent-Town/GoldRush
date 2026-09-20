// e1-twin-banks controller, gen-82.
// Ranking: waves(20) and timeAlive(600) are PINNED by twist.secureWave, so GOLD is the
// only free axis. Roster is claim_jumper only: no wrecker, no thief -> works cannot be
// attacked and nothing can be stolen, so the stockpile is a pure cap-raise (200 -> 500)
// with zero theft risk, and REPAIR_UNDER / palisades are dead weight.

const SECURE_T = 600;
const CLAIM = { x: 0, z: -12 };

// ---- ladder: strategy order. cap-raisers and income early (gold is the score),
// turrets first for dps, beacons as the tail.
const LADDER = [
  { id: 'turret', cost: 50 },
  { id: 'stockpile', cost: 60 },
  { id: 'turret', cost: 70 },
  { id: 'sluice', cost: 40 },
  { id: 'stockpile', cost: 60 },
  { id: 'sluice', cost: 40 },
  { id: 'sentry_beacon', cost: 25 },
  { id: 'turret', cost: 95 },
  { id: 'sluice', cost: 40 },
  { id: 'sentry_beacon', cost: 35 },
  { id: 'turret', cost: 125 },
  { id: 'sentry_beacon', cost: 45 },
  { id: 'sentry_beacon', cost: 55 },
];

// More candidate spots than slots. Vary BOTH axes (gen-81: a candidate list that varies
// only one axis retires the whole buildable when that axis is the wrong one).
const SPOTS = {
  turret: [
    { x: -7, z: -12 }, { x: 7, z: -12 }, { x: 0, z: -18 }, { x: 0, z: -8 },
    { x: -11, z: -16 }, { x: 11, z: -16 }, { x: -11, z: -8 }, { x: 11, z: -8 },
    { x: 0, z: -22 }, { x: -14, z: -12 }, { x: 14, z: -12 },
  ],
  sentry_beacon: [
    { x: -4, z: -9 }, { x: 4, z: -9 }, { x: -4, z: -15 }, { x: 4, z: -15 },
    { x: 0, z: -15.5 }, { x: -8, z: -16 }, { x: 8, z: -16 }, { x: -8, z: -9 },
    { x: 8, z: -9 }, { x: 0, z: -7.5 },
  ],
  // sluice: the legal line is the INTERSECTION of buildZone (|z|>=7) and river pad
  // (river band +-5, pad 2 -> |z|<=7). That is exactly |z| = 7. Vary x; avoid the two
  // fords at x = +-16 (halfWidth 3) and the gravel bars near x = +-7.5.
  sluice: [
    { x: -10, z: -7 }, { x: -4, z: -7 }, { x: 4, z: -7 }, { x: 10, z: -7 },
    { x: -22, z: -7 }, { x: 22, z: -7 }, { x: -26, z: -7 }, { x: 26, z: -7 },
    { x: -10, z: 7 }, { x: 4, z: 7 }, { x: 10, z: 7 }, { x: -4, z: 7 },
  ],
  stockpile: [
    { x: -17, z: -19 }, { x: 17, z: -19 }, { x: -17, z: -25 }, { x: 17, z: -25 },
    { x: -22, z: -14 }, { x: 22, z: -14 }, { x: 0, z: -26 }, { x: -8, z: -24 },
  ],
};

const blacklist = new Set();     // GROUND refusals only
const attempts = new Map();      // per-spot patience
const retired = new Set();       // ladder rungs that ran out of ground
let lastSubmitT = -99;
let lastPlanSig = '';
let spentEst = 0;

const key = (id, s) => `${id}@${s.x},${s.z}`;

function scoreUpgrade(o) {
  const s = ((o.name || '') + ' ' + (o.effectText || '') + ' ' + (o.id || '')).toLowerCase();
  let v = 0;
  if (/plating|max\s*hp|health|vitality|hearty|tough/.test(s)) v += 100;
  if (/dressing|heal|regen|mend|recover/.test(s)) v += 60;
  if (/spark|damage|dmg|coil|tap|power/.test(s)) v += 40;
  if (/rate|speed|reload|fire/.test(s)) v += 25;
  if (/range|reach/.test(s)) v += 15;
  return v;
}

export default function controller(view) {
  const now = view.now;
  const t = now.timers?.runSeconds ?? 0;
  const gold = now.gold ?? 0;
  const hero = now.hero || {};
  const hx = hero.x ?? CLAIM.x, hz = hero.z ?? CLAIM.z;

  // ---- pendingSecure: answer with a blank line. gr-sim records NO entry for an empty
  // submission, so the configured `bank` default fires for free, the last accepted order
  // stays well inside the tick envelope, and the reel keeps a call.
  if (now.pendingSecure) return null;

  const orders = [];

  // 1. draft first (REPLACE semantics: the pick must own the array it rides in)
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. free blast. Returns {} on success AND failure, so it never owns the tick -> safe
  // above the travelling verbs.
  if ((now.blastReadyInMs ?? 1) === 0) {
    const edge = now.threats?.edge;
    const d = { north: [0, 6], south: [0, -6], east: [6, 0], west: [-6, 0] }[edge] || [0, 5];
    orders.push({ verb: 'BLAST_AT', pos: { x: +(hx + d[0]).toFixed(2), z: +(hz + d[1]).toFixed(2) } });
  }

  // ---- ladder state from the view (never from my own counter)
  const byKind = now.works?.byKind || {};
  const standing = {};
  for (const [k, v] of Object.entries(byKind)) standing[k] = v;

  // reconstruct spend estimate from what actually stands
  const COSTS = { turret: [50, 70, 95, 125], sentry_beacon: [25, 35, 45, 55, 75, 95], sluice: [40, 40, 40], stockpile: [60, 60] };
  spentEst = 0;
  for (const [k, n] of Object.entries(standing)) {
    const arr = COSTS[k]; if (!arr) continue;
    for (let i = 0; i < n && i < arr.length; i++) spentEst += arr[i];
  }

  const nStock = standing.stockpile || 0;
  const cap = 200 + 150 * nStock;
  const income = gold + spentEst;
  const rate = t > 8 ? income / t : 0.8;

  // ---- occupancy: which spots are taken (positions from works.entries)
  const taken = new Set();
  for (const e of (now.works?.entries || [])) {
    if (e.position) taken.add(`${Math.round(e.position.x)},${Math.round(e.position.z)}`);
  }

  // ---- refusal blacklist, partitioned GROUND vs ECONOMY (gen-51).
  for (const rec of (now.orders || [])) {
    const o = rec.order || rec;
    if (o.verb !== 'BUILD' || !o.where) continue;
    const reason = `${rec.reason || ''} ${rec.detail || ''}`.toLowerCase();
    if (!reason) continue;
    if (/insufficient_gold|insufficient/.test(reason)) continue;   // ECONOMY: retry, poison nothing
    if (/out_of_zone|collision|unreachable|terrain|cap_reached|out_of_reach/.test(reason)) {
      blacklist.add(key(o.what, o.where));
    }
  }

  // ---- how many of each rung already stand
  const need = [];
  const seen = {};
  for (let i = 0; i < LADDER.length; i++) {
    const r = LADDER[i];
    seen[r.id] = (seen[r.id] || 0) + 1;
    if ((standing[r.id] || 0) >= seen[r.id]) continue;   // already built
    if (retired.has(i)) continue;
    need.push({ ...r, idx: i });
  }

  // ---- the BANK GATE. Gold is the only free ranking axis and it caps at `cap`;
  // panning into a full purse credits nothing, so spend freely early and stop late.
  // Bypass entirely while the hero is actually hurt or the fort is thin.
  const hurt = (hero.maxHp ? hero.hp / hero.maxHp : 1) < 0.92;
  const thin = (standing.turret || 0) < 2;
  const runway = SECURE_T - t;
  function allowed(cost) {
    if (hurt || thin) return true;
    if (runway > 260) return true;                       // early: buy freely
    return (gold - cost) + rate * runway >= cap + 10;    // late: must still refill to cap
  }

  // ---- emit a cumulatively-gated batch: rung i gated at the SUM of costs through i,
  // so a cheap rung can never steal gold an expensive one is waiting for.
  let cum = 0, emitted = 0;
  for (const r of need) {
    if (emitted >= 4) break;
    cum += r.cost;
    if (!allowed(cum)) break;
    const spots = SPOTS[r.id] || [];
    let spot = null;
    for (const s of spots) {
      const k = key(r.id, s);
      if (blacklist.has(k)) continue;
      if (taken.has(`${Math.round(s.x)},${Math.round(s.z)}`)) continue;
      if ((attempts.get(k) || 0) > 8) { blacklist.add(k); continue; }
      spot = s; attempts.set(k, (attempts.get(k) || 0) + 1); break;
    }
    if (!spot) { retired.add(r.idx); continue; }   // gen-81: RETIRE the rung, never stall the ladder
    taken.add(`${Math.round(spot.x)},${Math.round(spot.z)}`);
    orders.push({ verb: 'BUILD', what: r.id, where: { x: spot.x, z: spot.z }, when: { goldGte: cum } });
    emitted++;
  }

  // ---- HARVEST tail = throughput AND the clock (its honest refusals buy decision points
  // for free, because the Prospector already stands where it pans).
  // Inactive seams publish x/z/anchorIndex as NULL; one non-finite number refuses the
  // WHOLE array silently, so filter on Number.isFinite before any sort.
  const live = (now.seams || [])
    .filter((s) => s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map((s) => ({ ...s, d: Math.hypot(s.x - hx, s.z - hz) }))
    .sort((a, b) => a.d - b.d);

  const slots = 32 - orders.length;
  if (live.length && slots > 0) {
    // Drain one seam in a BLOCK before walking to the next, and alternate blocks so the
    // far half keeps working while the near one respawns (a seam holds 30g = six pans,
    // then waits 20s).
    const BLOCK = 6;
    let i = 0;
    while (orders.length < 32) {
      const seam = live[Math.floor(i / BLOCK) % live.length];
      orders.push({ verb: 'HARVEST', seam: seam.id });
      i++;
      if (i > 40) break;
    }
  }

  // ---- reel budget: resubmit only on a real change of plan, a live draft, or after a
  // time floor. Keeps entries (and bytes) far inside the envelope over a 600s ride.
  const planSig = JSON.stringify(orders.filter((o) => o.verb !== 'HARVEST')) +
    '|' + live.map((s) => s.id).join(',');
  const draftLive = !!(now.pendingOffer && now.pendingOffer.length);
  if (!draftLive && planSig === lastPlanSig && (t - lastSubmitT) < 2.0) return null;
  lastPlanSig = planSig; lastSubmitT = t;

  return orders.slice(0, 32);
}
