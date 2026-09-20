// gen-102 controller for e3-blackout-ridge (era 6), seed ...-01
// Facts measured this heat:
//  - claim + hero start + loss stake all at (24,30); build zone `ridge-line` x8..34 z20..40 CONTAINS it.
//  - all three harvest anchors (8,30)(18,34)(30,26) are inside that zone, 7.2-16.0 wu from the hero.
//  - roster has NO turret and NO lantern_post (twist.powerGrid filter): beacons (6 cap, 3 pre-placed
//    => my first costs costs[3]=55) + 10g palisade chaff.
//  - loss is HERO DOWN (idle died hp->0 at w4/134.8s); no thief on the roster => goldStolen stays 0.
//  - secureWave 12 pins waves=12 and timeAlive=360.000s, so GOLD is the only free ranking axis.
//    Live cap = 200 + 2 stockpiles x 150 = 500. Tier-2 stockpile is 110 for +90 cap => net -20, declined.
//  - capacitor_bank declined: any one of the three trunk frames 79wu away (wrecked at t=53 in idle)
//    cuts the chain, so 150g of banks goes dark before wave 2 whatever I pay.
const HOME = { x: 24, z: 30 };
const SECURE_T = 360;
const CAP = 500;          // 200 + 2 x 150 (both stockpiles standing and unwrecked)
const HARD_STOP = 318;    // no BUILD at all after this, bypasses included (gen-85)
const GATE_FROM = 120;    // bank gate arms late (gen-79)

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// ---- ladder: strategy order, ONE head rung emitted per array -----------------
// beacons first (the only damage the roster sells), then the two cap-raisers deep
// in the pocket, then unbounded 10g chaff which the bank gate will self-limit.
const LADDER = [
  { id: 'sentry_beacon', spots: [{ x: 20, z: 27 }, { x: 21, z: 26 }, { x: 19, z: 28 }, { x: 20, z: 25 }] },
  { id: 'sentry_beacon', spots: [{ x: 28, z: 27 }, { x: 27, z: 26 }, { x: 29, z: 28 }, { x: 28, z: 25 }] },
  { id: 'sentry_beacon', spots: [{ x: 24, z: 24 }, { x: 24, z: 23 }, { x: 23, z: 25 }, { x: 25, z: 25 }] },
  { id: 'stockpile', spots: [{ x: 31, z: 36 }, { x: 30, z: 37 }, { x: 32, z: 35 }, { x: 29, z: 38 }] },
  { id: 'stockpile', spots: [{ x: 27, z: 38 }, { x: 26, z: 37 }, { x: 28, z: 39 }, { x: 25, z: 38 }] },
];
// palisade arc: tight ring on the claim so the Prospector's trip is ~2-5wu from a seam.
const PAL = [
  { x: 21, z: 31 }, { x: 27, z: 31 }, { x: 21, z: 29 }, { x: 27, z: 29 },
  { x: 19, z: 32 }, { x: 29, z: 32 }, { x: 19, z: 27 }, { x: 29, z: 27 },
  { x: 23, z: 34 }, { x: 25, z: 34 }, { x: 23, z: 26 }, { x: 25, z: 26 },
  { x: 17, z: 30 }, { x: 31, z: 30 }, { x: 22, z: 36 }, { x: 26, z: 36 },
  { x: 17, z: 24 }, { x: 31, z: 24 }, { x: 15, z: 28 }, { x: 33, z: 28 },
];
for (const p of PAL) LADDER.push({ id: 'palisade', spots: [p] });

const GROUND = ['out_of_zone', 'collision', 'cap_reached', 'unreachable', 'out_of_reach', 'terrain'];

function scoreUpgrade(id, name, txt) {
  const s = `${id} ${name} ${txt}`.toLowerCase();
  if (/plating|dressing|vital|grit|armou?r|hp|health/.test(s)) return 100;
  if (/spark|coil|damage|resonator|split|blast|shot|volley/.test(s)) return 50;
  if (/pan|gold|luck|assay/.test(s)) return 20;
  return 10;
}

export default function controller(view, st) {
  const now = view.now || {};
  const sp = view.stablePrefix || {};

  // pendingSecure: answer with SILENCE. It banks the default, records no entry,
  // and cannot be REJECTED (a rejected array inside the choice window is invisible
  // to the tape and visible to the sim, which desyncs the replay -- gen-84).
  if (now.pendingSecure) return 'BLANK';

  if (!st.init) {
    st.init = true;
    st.bad = new Set();          // poisoned GROUND coordinates
    st.tries = {};               // per-rung patience
    st.retired = new Set();      // rungs with no candidates left
    st.buildables = {};
    for (const b of (sp.mechanics?.buildables || [])) st.buildables[b.id] = b;
    st.seamCycle = 0;
  }

  const t = now.timers?.runSeconds ?? 0;
  const gold = now.gold ?? 0;
  const pan = now.score?.goldPanned ?? 0;
  const entries = now.works?.entries || [];
  const hero = now.hero || HOME;

  // --- read refusals off the view and partition them (gen-51) ---
  for (const rec of (now.orders || [])) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || {};
    if (o.verb !== 'BUILD' || !o.where) continue;
    const reason = String(rec.reason || rec.detail || '').toLowerCase();
    if (reason.includes('insufficient_gold')) continue;      // ECONOMY: poison nothing
    if (GROUND.some((g) => reason.includes(g))) st.bad.add(`${o.where.x},${o.where.z}`);
  }

  // --- income rate, biased LOW on purpose (protective direction) ---
  const rate = t > 20 ? pan / t : 2.4;

  // --- live cap from UNWRECKED stockpiles only (gen-82) ---
  const stock = entries.filter((e) => e.id === 'stockpile' && !e.wrecked).length;
  const liveCap = 200 + stock * 150;

  const orders = [];

  // 1. draft first, under replace semantics
  const offer = now.pendingOffer;
  if (Array.isArray(offer) && offer.length) {
    let best = offer[0], bs = -1;
    for (const o of offer) {
      const s = scoreUpgrade(o.id, o.name || '', o.effectText || '');
      if (s > bs) { bs = s; best = o; }
    }
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. free BLAST_AT: returns {} on success AND failure, so it is safe above the traveller
  if ((now.blastReadyInMs ?? 1) === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: +(hero.x ?? HOME.x).toFixed(2), z: +((hero.z ?? HOME.z) - 2).toFixed(2) } });
  }

  // 3. displacement guard: emitted ONCE, only when actually displaced. Never a ladder
  //    of posts (gen-68: a ladder of MOVE_HERO is a shuttle that freezes the economy).
  if (dist(hero, HOME) > 1.2) orders.push({ verb: 'MOVE_HERO', pos: HOME });

  // 4. mend. Ungated in gold beyond the mend price; suppressed in the closing window
  //    unless something is actually wrecked, because a proportional mend then is a
  //    permanent score cost the capped economy cannot re-earn (gen-97).
  const anyWrecked = (now.works?.wrecked ?? 0) > 0;
  const closing = t > SECURE_T - 32;
  if (gold >= 15 && (!closing || anyWrecked)) orders.push({ verb: 'REPAIR_UNDER', pct: 99 });

  // 5. ONE ladder head rung. Ordinal accounting: count rungs of this id walked past,
  //    skip while standing >= ordinal, price the first unsatisfied one at costs[standing]
  //    (gen-99: standing + rungsWalkedPast double-counts and retires half the ladder).
  const standingOf = {};
  for (const e of entries) if (!e.wrecked) standingOf[e.id] = (standingOf[e.id] || 0) + 1;
  const seen = {};
  let build = null, buildCost = 0;
  for (let i = 0; i < LADDER.length; i++) {
    const rung = LADDER[i];
    seen[rung.id] = (seen[rung.id] || 0) + 1;
    if (st.retired.has(i)) continue;
    if ((standingOf[rung.id] || 0) >= seen[rung.id]) continue;   // already satisfied
    const b = st.buildables[rung.id];
    if (!b) { st.retired.add(i); continue; }
    const built = standingOf[rung.id] || 0;
    const cost = b.costs[Math.min(built, b.costs.length - 1)];
    if (b.maxCount != null && built >= b.maxCount) { st.retired.add(i); continue; }
    const spot = rung.spots.find((s) => !st.bad.has(`${s.x},${s.z}`));
    if (!spot) { st.retired.add(i); continue; }                   // RETIRE, never stall (gen-81)
    st.tries[i] = (st.tries[i] || 0) + 1;
    if (st.tries[i] > 40) { st.retired.add(i); continue; }
    build = { verb: 'BUILD', what: rung.id, where: spot, when: { goldGte: cost } };
    buildCost = cost;
    break;
  }
  if (build && t < HARD_STOP && gold >= buildCost) {
    const urgent = (hero.maxHp && hero.hp / hero.maxHp < 0.92) || anyWrecked
      || (standingOf.sentry_beacon || 0) < 4;                     // 3 pre-placed + 1
    const projected = (gold - buildCost) + rate * (SECURE_T - t);
    const gateOk = t < GATE_FROM || urgent || projected >= Math.min(liveCap, CAP) + 5;
    if (gateOk) orders.push(build);
  }

  // 6. HARVEST tail: the throughput AND the clock. Alternating blocks of six across
  //    live seams sorted by distance to HOME. Number.isFinite before any sort, because
  //    an inactive seam publishes x/z/anchorIndex as null and one non-finite number
  //    refuses the WHOLE array silently.
  const seams = (now.seams || []).filter((s) => s && s.active !== false
    && Number.isFinite(s.x) && Number.isFinite(s.z) && s.id);
  seams.sort((a, b) => dist(a, HOME) - dist(b, HOME));
  const ids = seams.map((s) => s.id);
  // fallback: never an empty tail -- name every published anchor seam id even if inactive
  const allIds = (now.seams || []).map((s) => s && s.id).filter(Boolean);
  const chain = ids.length ? ids : (allIds.length ? allIds : ['gold-seam-1']);
  const slots = 32 - orders.length;
  st.seamCycle = (st.seamCycle + 1) % Math.max(1, chain.length);
  for (let k = 0; k < slots; k++) {
    const blk = Math.floor(k / 6);
    const id = chain[(blk + st.seamCycle) % chain.length];
    orders.push({ verb: 'HARVEST', seam: id });
  }

  return orders.slice(0, 32);
}
