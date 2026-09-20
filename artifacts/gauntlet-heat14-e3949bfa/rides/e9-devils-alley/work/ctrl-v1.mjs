// generation 112 — e9-devils-alley controller v1
//
// Contract read (all measured off view 0 + Balance, not inherited):
//  * roster is ONE id, claim_jump_prospect_drone, thief:true -> wrecker=false.
//    No stockpile (a till makes nearestGoldHolding non-empty and converts every
//    drone from hero-chaser to gold-grabber; gen 106 measured that at -435 gold).
//    So the bank cap is 200 and 200 is the arithmetic ceiling of the ranked axis.
//  * loss is hero_down (appendLog surprise, outcome 'rider-down'); the claim at
//    (0,12) is NOT a loss stake, so the hero is free to leave it.
//  * scheduled_relocation rule: "a standing work inside the column and outside
//    every anchor hold is lifted ... works inside an anchor hold are never taken",
//    damages:false, gatesSecure:false. anchor-center@(0,0) holdRadius 8.
//    => the era mechanic is a PLACEMENT TAX: keep every build inside x^2+z^2<=56
//    (r<=7.48, safely inside the r8 hold and inside center-anchor-bay).
//  * MOVE_HERO lets the hero stand at (0,0): the fort then rings the body that
//    must live AND every coordinate is anchor-held, and both live seams
//    ((14,12) and (-14,-12)) are equidistant at 18.44.
//  * no secureWave -> Balance default 20 -> t=600 -> tick 18000 == clockTicks.
//    Answer pendingSecure with SILENCE: it records no entry (so the last accepted
//    order cannot sit on the terminal tick, F-HEAT11-1) and cannot be rejected.

const POST = { x: 0, z: 0 };
const SECURE_T = 600;
const BUILD_FLOOR_T = 500;     // no BUILD after this; let the purse refill to the cap
const CAP = 200;

// integer lattice, x^2+z^2 <= 56, spaced so footprints do not collide
const RING_A = [{ x: 0, z: 7 }, { x: 7, z: 0 }, { x: 0, z: -7 }, { x: -7, z: 0 }];
const RING_B = [{ x: 5, z: 5 }, { x: -5, z: 5 }, { x: 5, z: -5 }, { x: -5, z: -5 },
                { x: 4, z: 6 }, { x: -4, z: 6 }, { x: 6, z: -4 }, { x: -6, z: -4 },
                { x: 6, z: 4 }, { x: -6, z: 4 }, { x: 4, z: -6 }, { x: -4, z: -6 }];
const RING_C = [{ x: 3, z: 3 }, { x: -3, z: 3 }, { x: 3, z: -3 }, { x: -3, z: -3 },
                { x: 0, z: 4 }, { x: 4, z: 0 }, { x: 0, z: -4 }, { x: -4, z: 0 },
                { x: 2, z: 7 }, { x: -2, z: 7 }, { x: 7, z: -2 }, { x: -7, z: -2 },
                { x: 7, z: 2 }, { x: -7, z: 2 }, { x: 2, z: -7 }, { x: -2, z: -7 },
                { x: 1, z: 6 }, { x: -1, z: 6 }, { x: 6, z: 1 }, { x: -6, z: 1 },
                { x: 1, z: -6 }, { x: -1, z: -6 }, { x: 6, z: -1 }, { x: -6, z: -1 }];

// ONE ladder, ONE ordinal per id (gen 110). Strategy order, not price order.
const LADDER = [
  { id: 'turret', spots: RING_A },
  { id: 'sentry_beacon', spots: RING_B },
  { id: 'turret', spots: RING_A },
  { id: 'sentry_beacon', spots: RING_B },
  { id: 'turret', spots: RING_A },
  { id: 'sentry_beacon', spots: RING_B },
  { id: 'turret', spots: RING_A },
  { id: 'sentry_beacon', spots: RING_B },
  { id: 'sentry_beacon', spots: RING_B },
  { id: 'sentry_beacon', spots: RING_B },
  // surplus sink: palisades are permanent chaff here only in the sense that a
  // non-wrecker still gnaws them, so they buy time; 10g flat, 48 max.
  ...Array.from({ length: 14 }, () => ({ id: 'palisade', spots: RING_C })),
];

const badGround = new Set();   // GROUND refusals poison the coordinate
const placed = new Set();      // spots I have successfully committed to
let panRate = 1.2;             // biased LOW on purpose: errs toward banking
let lastBuild = null;

const key = (id, s) => `${id}@${s.x},${s.z}`;
const d2 = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;

function costOf(prefix, id, standing) {
  const b = (prefix.mechanics.buildables || []).find(b => b.id === id);
  if (!b) return Infinity;
  const c = b.costs || [];
  if (standing < c.length) return c[standing];
  return Math.ceil((c[c.length - 1] * 1.0) / 5) * 5;
}
function capOf(prefix, id) {
  const b = (prefix.mechanics.buildables || []).find(b => b.id === id);
  return b ? (b.maxCount ?? 0) : 0;
}

export default function controller(view, n) {
  const now = view.now;
  const sp = view.stablePrefix;

  // pendingSecure accepts exactly one SECURE_CHOICE and refuses anything else;
  // silence records no tape entry and takes the configured 'bank' default.
  if (now.pendingSecure) return null;

  const t = (now.timers?.runSeconds) ?? 0;
  const gold = now.gold ?? 0;
  const pan = now.score?.goldPanned ?? 0;
  if (t > 30) panRate = Math.max(0.5, (pan / t) * 0.9);

  const byKind = now.works?.byKind || {};
  const hero = now.hero || {};
  const hpFrac = hero.maxHp ? hero.hp / hero.maxHp : 1;
  const out = [];

  // ---- 1. draft first, under replace semantics; plating-first scorer
  if (now.pendingOffer && now.pendingOffer.length) {
    const score = (o) => {
      const s = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
      if (/plating|dressing|vitality|health|max hp|maxhp|tough/.test(s)) return 100;
      if (/heal|regen|mend/.test(s)) return 80;
      if (/spark|damage|coil|tap|powder|fuse|ring|volley|rate/.test(s)) return 60;
      if (/range|reach|pierce/.test(s)) return 40;
      return 10;
    };
    const best = [...now.pendingOffer].sort((a, b) => score(b) - score(a))[0];
    out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // ---- 2. BLAST_AT: returns {} on success AND failure, so it is safe above the
  //         travellers. The drones converge on the hero, so the hero's feet is
  //         the densest point; reach is 10 from the hero.
  if ((now.blastReadyInMs ?? 1) === 0 && Number.isFinite(hero.x)) {
    out.push({ verb: 'BLAST_AT', pos: { x: Math.round(hero.x), z: Math.round(hero.z) } });
  }

  // ---- 3. hero post. Emit ONCE and drop when parked (a ladder of posts is a
  //         shuttle that ping-pongs the body and freezes the economy, gen 68).
  if (!Number.isFinite(hero.x) || d2(hero, POST) > 0.36) {
    out.push({ verb: 'MOVE_HERO', pos: POST });
  }

  // ---- 4. exactly one BUILD rung: the head unsatisfied rung of the single
  //         ladder, priced at its LIVE instance index.
  const seen = {};
  let rung = null;
  for (const r of LADDER) {
    seen[r.id] = (seen[r.id] || 0) + 1;
    const standing = byKind[r.id] || 0;
    if (standing >= seen[r.id]) continue;          // already satisfied by a standing instance
    if (seen[r.id] > capOf(sp, r.id)) continue;    // never exceed the roster cap
    const spot = r.spots.find(s => !badGround.has(key(r.id, s)) && !placed.has(`${s.x},${s.z}`));
    if (!spot) continue;                            // RETIRE the rung, never stall behind it
    rung = { id: r.id, spot, cost: costOf(sp, r.id, standing) };
    break;
  }
  if (rung && t < BUILD_FLOOR_T && gold >= rung.cost) {
    const coreIncomplete = (byKind.turret || 0) < 4 || (byKind.sentry_beacon || 0) < 6;
    const projected = (gold - rung.cost) + panRate * Math.max(0, SECURE_T - t);
    const urgent = hpFrac < 0.75;
    if (coreIncomplete || urgent || projected >= CAP + 5) {
      out.push({ verb: 'BUILD', what: rung.id, where: rung.spot, when: { goldGte: rung.cost } });
      lastBuild = rung;
    }
  }

  // ---- 5. mend only when something is actually wrecked and gold is spare.
  //         (A failed REPAIR_UNDER walks first, so it is not a free order.)
  if ((now.works?.wrecked || 0) > 0 && gold >= 40 && t < BUILD_FLOOR_T) {
    out.push({ verb: 'REPAIR_UNDER', pct: 60 });
  }

  // ---- 6. harvest tail. Inactive seams publish x/z/anchorIndex as null and one
  //         non-finite number refuses the WHOLE array silently.
  const live = (now.seams || [])
    .filter(s => s.active && Number.isFinite(s.x) && Number.isFinite(s.z))
    .sort((a, b) => d2(a, POST) - d2(b, POST));
  const slots = 32 - out.length;
  if (live.length && slots > 0) {
    const BLOCK = 6;   // a seam holds 30 gold = six 1.5s pans
    let i = 0, ring = 0;
    while (i < slots) {
      const s = live[ring % live.length];
      for (let k = 0; k < BLOCK && i < slots; k++, i++) out.push({ verb: 'HARVEST', seam: s.id });
      ring++;
    }
  } else if (slots > 0) {
    // never let the array end up empty: name the nearest anchor's seam id anyway
    // so the failing order parks the worker where the gold will come back.
    const any = (now.seams || [])[0];
    if (any) out.push({ verb: 'HARVEST', seam: any.id });
  }

  // refusal blacklist, partitioned: GROUND poisons the coordinate, ECONOMY retries
  for (const rec of (now.orders || [])) {
    if (rec.status !== 'failed' || rec.order?.verb !== 'BUILD') continue;
    const reason = `${rec.reason || ''} ${rec.detail || ''}`.toLowerCase();
    if (/insufficient_gold/.test(reason)) continue;
    const w = rec.order.where;
    if (w) badGround.add(key(rec.order.what, w));
  }
  // anything that actually stands occupies its ground
  for (const e of (now.works?.entries || [])) {
    if (e.position) placed.add(`${Math.round(e.position.x)},${Math.round(e.position.z)}`);
  }

  return out.slice(0, 32);
}
