// Gen 101 controller — e2-pressure-garden, seed 01, era 6.
//
// Ranking arithmetic (done BEFORE writing this, per gen 54/85):
//   twist.secureWave = 12 pins waves at 12 and timeAlive at 360.000s.
//   => GOLD IS THE ONLY FREE AXIS.  banked = min(earnings - spend, liveCap).
//   liveCap = 200 + 150*capMult(tier) per UNWRECKED stockpile (max 2).
//   stockpile build: 60g -> +150 cap  (net +90, always a win if cap-bound)
//   stockpile tier2: 110g -> +90 cap  (net -20, only if surplus > newCap)
//   Gen 85 secured here banking 18 of 500 because an `urgent` bypass let a
//   40g sluice land 5 seconds before the secure tick.  Hence: HARD_STOP.

const CLAIM = { x: -12, z: 12 };
const SECURE_T = 360;
const HARD_STOP = 315;     // no BUILD at all after this, bypasses included
const REPAIR_STOP = 330;   // a late proportional mend is pure score loss (gen 97)
const GATE_FROM = 145;     // bank gate is wrong early, right late (gen 79)
const SEAM_REACH = 32;     // don't chase a seam across the map (gen 100)

const CAP_MULT = [1, 1, 1.6, 2.4]; // index by tier (1-based, gen 45 defensive)

// more candidates than slots; GROUND refusals poison a coordinate, ECONOMY ones don't
const SPOTS = {
  turret: [[-12,15],[-16,12],[-8,12],[-12,9],[-18,15],[-6,15],[-18,9],[-6,9],[-20,12],[-4,12],[-12,16],[0,12]],
  stockpile: [[-14,14],[-10,10],[-14,10],[-10,14],[-16,16],[-8,16],[-15,15],[-9,9]],
  sentry_beacon: [[-15,8],[-9,8],[-18,13],[-6,13],[-12,7],[-16,15],[-8,15],[-20,10],[-4,10]],
  palisade: [[-24,14],[-22,10],[0,14],[2,10],[-26,12],[4,12],[-24,8],[2,16],[-28,14],[6,10]],
};

// strategy order, NOT price order.  Cap-raisers early (gen 81): they cannot be
// refused for ground the way a water-gated buildable can, and they switch the
// income back on before the purse first pins at 200.
const LADDER = [
  'turret', 'turret', 'stockpile', 'stockpile', 'turret',
  'sentry_beacon', 'turret', 'sentry_beacon', 'sentry_beacon',
  'palisade', 'palisade', 'palisade', 'palisade',
];

const badSpot = new Set();     // "id@x,z" poisoned by a GROUND refusal
const retired = new Set();     // ladder ordinals with no candidates left (gen 81)
let costsOf = {}, maxOf = {};

function pickSpot(id, entries) {
  const taken = new Set(entries.map(e => `${Math.round(e.position.x)},${Math.round(e.position.z)}`));
  for (const [x, z] of (SPOTS[id] || [])) {
    if (badSpot.has(`${id}@${x},${z}`)) continue;
    if (taken.has(`${x},${z}`)) continue;
    // keep 3 units clear of anything already standing
    if (entries.some(e => Math.hypot(e.position.x - x, e.position.z - z) < 3)) continue;
    if (Math.hypot(CLAIM.x - x, CLAIM.z - z) < 1.5) continue;
    return { x, z };
  }
  return null;
}

export default function controller(view) {
  const n = view.now;
  // 1. the secure boundary: silence.  Banks the default, cannot be REJECTED
  //    (a rejected array inside the choice window is invisible to the tape and
  //    visible to the sim, so the replay diverges — gen 84).
  if (n.pendingSecure) return null;

  const sp = view.stablePrefix;
  if (!costsOf.turret) {
    for (const b of (sp.mechanics?.buildables || [])) { costsOf[b.id] = b.costs; maxOf[b.id] = b.maxCount; }
  }

  const t = n.timers?.runSeconds ?? 0;
  const gold = n.gold ?? 0;
  const panned = n.score?.goldPanned ?? 0;
  const entries = (n.works?.entries || []).filter(e => e.position);
  const alive = entries.filter(e => !e.wrecked);

  // live cap from UNWRECKED stockpiles only — a wrecked one removes its cap
  // source while the purse keeps the gold (gen 82)
  let cap = 200;
  for (const e of alive) if (e.id === 'stockpile') cap += 150 * (CAP_MULT[Math.max(1, e.tier || 1)] ?? 1);

  // income rate, biased LOW on purpose: goldPanned misses other credits, so the
  // gate under-estimates the runway and stops spending early — the protective
  // direction (gen 98).
  const rate = t > 20 ? panned / t : 1.2;

  const orders = [];

  // 2. draft first under replace semantics; plating-first scorer
  if (n.pendingOffer?.length) {
    const score = o => {
      const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
      if (/plating|dressing|vitality|health|hp|armor|armour/.test(s)) return 5;
      if (/heal|regen|resil/.test(s)) return 4;
      if (/spark|damage|coil|coil|tap|coil/.test(s)) return 3;
      if (/rate|speed|reload/.test(s)) return 2;
      return 1;
    };
    const best = [...n.pendingOffer].sort((a, b) => score(b) - score(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 3. BLAST_AT returns {} on success AND failure, so it is safe above the
  //    traveller and never eats the tick (gen 78)
  if ((n.blastReadyInMs ?? 1) === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z + 4 } });
  }

  // 4. come-home guard ABOVE the ladder (gen 65/83): a travelling verb below it
  //    would delete it.  Emitted once, dropped when parked.
  const hx = n.hero?.x ?? CLAIM.x, hz = n.hero?.z ?? CLAIM.z;
  if (Math.hypot(hx - CLAIM.x, hz - CLAIM.z) > 1.2) {
    orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
  }

  // 5. mending: ungated while it matters (steam_wrecker is a real wrecker here,
  //    bdmg 2.5), off in the closing window because a proportional mend is
  //    score (gen 97).  Fires only when the Prospector is within sparkRig.range
  //    of a damaged work, so it is free when it finds nothing (gen 87).
  if (t < REPAIR_STOP) orders.push({ verb: 'REPAIR_UNDER', pct: 99 });

  // 6. exactly ONE build rung: the first unsatisfied one, priced at its real
  //    instance index (ordinal accounting — gen 100; the gen-99 bug was adding
  //    the walked-past count into the index twice).
  if (t < HARD_STOP) {
    const standing = {};
    for (const e of alive) standing[e.id] = (standing[e.id] || 0) + 1;
    const seen = {};
    for (let i = 0; i < LADDER.length; i++) {
      const id = LADDER[i];
      const ord = (seen[id] = (seen[id] || 0) + 1);      // 1-based ordinal
      if (retired.has(`${id}#${ord}`)) continue;
      if ((standing[id] || 0) >= ord) continue;          // already satisfied
      const built = standing[id] || 0;
      if (built >= (maxOf[id] ?? 99)) continue;
      const cost = (costsOf[id] || [])[built] ?? (costsOf[id] || []).slice(-1)[0] ?? 9999;
      if (gold < cost) break;                            // plan-time affordability

      // the bank gate: refuse a spend that would cost the ranked axis.
      const urgent = (n.hero && n.hero.hp / n.hero.maxHp < 0.72)
        || (n.works?.wrecked || 0) > 0
        || alive.length < 2;
      if (t >= GATE_FROM && !urgent) {
        const projected = (gold - cost) + rate * Math.max(0, SECURE_T - t);
        if (projected < cap + 5) break;                  // would cost score: stop
      }
      const where = pickSpot(id, entries);
      if (!where) { retired.add(`${id}#${ord}`); continue; }  // RETIRE, never stall (gen 81)
      orders.push({ verb: 'BUILD', what: id, where, when: { goldGte: cost } });
      break;
    }
  }

  // 7. harvest tail — the throughput AND the clock.  Alternating blocks across
  //    the two nearest live seams keeps the far half working while the near one
  //    refills (gen 76).  Null coordinates on an inactive seam would refuse the
  //    whole array silently (gen 59), so filter on Number.isFinite.
  const live = (n.seams || [])
    .filter(s => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map(s => ({ id: s.id, d: Math.hypot(s.x - CLAIM.x, s.z - CLAIM.z) }))
    .filter(s => s.d <= SEAM_REACH)
    .sort((a, b) => a.d - b.d);

  const chain = live.length ? live.slice(0, 2).map(s => s.id) : ['gold-seam-2', 'gold-seam-1'];
  const room = 32 - orders.length;
  const BLOCK = 7;
  for (let i = 0; i < room; i++) {
    orders.push({ verb: 'HARVEST', seam: chain[Math.floor(i / BLOCK) % chain.length] });
  }

  // learn from refusals: GROUND poisons the coordinate, ECONOMY never does (gen 51)
  for (const rec of (n.orders || [])) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || {};
    if (o.verb !== 'BUILD' || !o.where) continue;
    const reason = `${rec.reason || ''} ${rec.detail || ''}`.toLowerCase();
    if (/insufficient_gold/.test(reason)) continue;
    if (/out_of_zone|collision|cap_reached|unreachable|terrain/.test(reason)) {
      badSpot.add(`${o.what}@${Math.round(o.where.x)},${Math.round(o.where.z)}`);
    }
  }

  return orders.slice(0, 32);
}
