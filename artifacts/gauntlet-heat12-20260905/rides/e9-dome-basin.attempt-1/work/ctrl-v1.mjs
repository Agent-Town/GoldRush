// e9-dome-basin controller v1
// Map facts (measured): claim+hero welded at (0,12), maxHp 100. NO build zone within 28.28wu
// (rim-dome-pad-east corner (28,8)); turret range 16, beacon range 8 -> nothing defends the hero.
// Seams: (22,-28),(28,-22),(34,-28) all inside seed-rows-footing (x18..44,z-32..-18): free build ground
// at the money. Roster: feral_terraformer (wrecker) + claim_jump_prospect_drone (THIEF).
// Plan: (a) stockpile as a thief holding so drones commute+flee instead of pursuing the hero
//       (syncStockpileHoldings: holding.amount = economy.gold, so gold must stay banked);
//       (b) NO sentry_beacon -> keeps beacon_dynamo out of Progression.eligibleDefs, shortening the
//       road to the infinite `field_dressing` filler (0.3*maxHp heal), which is the only unbounded HP;
//       (c) turrets on the east rim, 4.5wu from the east spawn ring point, as bait + damage;
//       (d) BLAST_AT the scrum on the hero every view it is ready.

const CLAIM = { x: 0, z: 12 };

// ladder: [what, x, z, cost]
const LADDER = [
  ['turret', 28, 6, 50],
  ['stockpile', 20, -20, 60],
  ['turret', 28, 2, 70],
  ['turret', 28, 10 - 4, 95],   // (28,6) taken; alt below via candidates
  ['turret', 30, 8, 125],
];

// extra candidate spots per kind, used when a coordinate refuses
const CANDS = {
  turret: [[28, 6], [28, 2], [28, -2], [30, 8], [32, 4], [30, 0], [34, 6], [28, -6], [36, 2], [40, 6]],
  stockpile: [[20, -20], [24, -20], [22, -18], [26, -18]],
  palisade: [[30, 8], [32, 8], [34, 8], [30, 4], [32, 4], [34, 4], [30, 0], [32, 0], [34, 0],
             [30, -4], [32, -4], [34, -4], [36, 8], [36, 4], [36, 0]],
};
const PLAN = [
  { what: 'turret', cost: 50 },
  { what: 'stockpile', cost: 60 },
  { what: 'turret', cost: 70 },
  { what: 'turret', cost: 95 },
  { what: 'turret', cost: 125 },
  { what: 'stockpile', cost: 60 },
  ...Array.from({ length: 12 }, () => ({ what: 'palisade', cost: 10 })),
];

const W = {
  field_dressing: 1000,
  tinkers_plating: 100, heavy_spark: 80, split_spark: 75, long_resonator: 70,
  powder_charge: 40, wide_ring: 35, quick_fuse: 30, auto_pan: 25,
  prospectors_luck: 20, pan_legend: 15, spring_heels: 10, beacon_dynamo: 5,
  assay_bonus: 1,
};
const MAXST = {
  heavy_spark: 3, long_resonator: 2, split_spark: 2, tinkers_plating: 3, spring_heels: 3,
  pan_legend: 2, auto_pan: 1, prospectors_luck: 2, beacon_dynamo: 2, powder_charge: 2,
  wide_ring: 2, quick_fuse: 2,
};

const d2 = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;

export default function controller(view, S) {
  const now = view.now;
  if (!S.init) {
    S.init = true;
    S.black = new Set();      // refused "what@x,z"
    S.tries = {};             // attempts per key
    S.built = {};             // what -> count we believe standing
    S.log = [];
  }

  // --- 1. secure boundary: blank line takes the configured `bank` default without recording
  //        a terminal-tick entry (envelope insurance; F-HEAT11-1 is cured but this is free).
  if (now.pendingSecure) return 'BLANK';

  // --- refusal blacklist, read from the view's own order records (gen-35)
  for (const rec of now.orders || []) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || {};
    if (o.verb === 'BUILD' && o.where) {
      const k = `${o.what}@${o.where.x},${o.where.z}`;
      S.tries[k] = (S.tries[k] || 0) + 1;
      if (S.tries[k] >= 2) S.black.add(k);
    }
  }

  const byKind = now.works?.byKind || {};
  const entries = now.works?.entries || [];
  const orders = [];

  // --- 2. upgrade draft owns the tick, first in the array (REPLACE semantics)
  if (now.pendingOffer && now.pendingOffer.length) {
    const stacks = now.hero?.upgradesTaken || {};
    let best = null, bestScore = -1;
    for (const o of now.pendingOffer) {
      const have = stacks[o.id] || 0;
      const max = MAXST[o.id] ?? 99;
      let sc = (W[o.id] ?? 20) + 12 * have + (max - have === 1 ? 20 : 0);
      if (/heal/i.test(o.effectText || '')) sc += 1000;   // field_dressing by effect too
      if (sc > bestScore) { bestScore = sc; best = o; }
    }
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // --- 3. free damage into the scrum standing on the welded hero
  if (now.blastReadyInMs === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z } });
  }

  // --- 4. exactly one plan-time-affordable BUILD rung (gen-28/33: never a pending gold gate,
  //        which on a 22wu commute is a walk generator)
  const done = {};
  for (const p of PLAN) {
    const what = p.what;
    done[what] = (done[what] || 0);
    const standing = byKind[what] || 0;
    if (done[what] < standing) { done[what]++; continue; }   // this rung is already up
    if (now.gold < p.cost) break;                             // cannot pay right now
    // choose the first non-blacklisted, unoccupied candidate
    const spots = CANDS[what] || [];
    let placed = null;
    for (const [x, z] of spots) {
      const k = `${what}@${x},${z}`;
      if (S.black.has(k)) continue;
      if (entries.some((e) => e.position && Math.abs(e.position.x - x) < 1.2 && Math.abs(e.position.z - z) < 1.2)) continue;
      placed = { x, z }; break;
    }
    if (placed) orders.push({ verb: 'BUILD', what, where: placed, when: { goldGte: p.cost } });
    break;
  }

  // --- 5. mend the rim works (falls through free when nothing qualifies)
  orders.push({ verb: 'REPAIR_UNDER', pct: 55 });

  // --- 6. the tail: pan. Seams are mutually near (<=12wu) and 35wu from the claim, so chain
  //        across the live ones and let a drained seam fail honestly (each failure is a view).
  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x));
  const p = now.prospector || { x: 28, z: -24 };
  live.sort((a, b) => d2(a, p) - d2(b, p));
  const slots = 31 - orders.length;
  if (live.length) {
    let i = 0;
    while (orders.length < 31) {
      const s = live[Math.floor(i / 4) % live.length];
      orders.push({ verb: 'HARVEST', seam: s.id });
      i++;
    }
    orders.push({ verb: 'HOLD', pos: { x: live[0].x, z: live[0].z } });
  } else {
    orders.push({ verb: 'HOLD', pos: { x: 28, z: -24 } });
  }

  return orders.slice(0, 32);
}
