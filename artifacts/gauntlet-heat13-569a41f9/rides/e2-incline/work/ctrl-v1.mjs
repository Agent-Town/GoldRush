// ctrl-v1.mjs — e2-incline. Secure = kill the wave-12 railcar riding rails[0] at x=-12.
// Fort is pushed toward the rail so turrets (range 16) buy rail-seconds; hero stands in it.
const RAIL_X = -12;

// candidate spots: more candidates than slots, GROUND refusals poison a coordinate.
const TURRETS = [
  { x: -16, z: -12 }, { x: -8, z: -12 }, { x: -16, z: -18 }, { x: -8, z: -18 },
  { x: -17, z: -15 }, { x: -7, z: -15 }, { x: -16, z: -22 }, { x: -8, z: -22 },
  { x: -19, z: -12 }, { x: -5, z: -18 },
];
const BEACONS = [
  { x: -14, z: -13 }, { x: -14, z: -17 }, { x: -19, z: -16 }, { x: -10, z: -16 },
  { x: -19, z: -13 }, { x: -10, z: -13 }, { x: -17, z: -20 }, { x: -12, z: -20 },
  { x: -21, z: -15 }, { x: -14, z: -21 }, { x: -22, z: -18 }, { x: -6, z: -14 },
];
const SLUICES = [
  { x: -24, z: -7 }, { x: -20, z: -7 }, { x: -28, z: -7 },
  { x: -24, z: -7.5 }, { x: -20, z: -7.5 }, { x: -28, z: -7.5 },
  { x: -32, z: -7 }, { x: -17, z: -7 },
];
const PALIS = [];
for (let i = 0; i < 16; i++) {
  const a = (i / 16) * Math.PI * 2;
  PALIS.push({ x: +(HERO_X() + Math.cos(a) * 9).toFixed(0), z: +(HERO_Z() + Math.sin(a) * 9).toFixed(0) });
}
function HERO_X() { return -18; }
function HERO_Z() { return -15; }

const POST = { x: HERO_X(), z: HERO_Z() };

const PLATING = ['tinkers_plating', 'field_dressing', 'iron_frame', 'plating', 'dressing'];
function scoreUpgrade(o) {
  const s = ((o.id || '') + ' ' + (o.name || '') + ' ' + (o.effectText || '')).toLowerCase();
  let v = 0;
  if (/plating|max health|maximum health|\+hp|hit points|vitality|tough/.test(s)) v += 100;
  if (/heal|dressing|regen|mend/.test(s)) v += 70;
  if (/damage|spark|coil|bolt|tap|power/.test(s)) v += 40;
  if (/fire rate|rate of fire|reload|cadence/.test(s)) v += 35;
  if (/blast|charge|radius/.test(s)) v += 25;
  if (/turret|beacon/.test(s)) v += 20;
  if (/gold|pan|luck|prospect/.test(s)) v += 5;
  if (/speed|heels|move/.test(s)) v += 2;
  return v;
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

export default function controller(view, S) {
  const now = view.now;
  const sp = view.stablePrefix;
  if (!S.init) {
    S.init = true;
    S.bad = new Set();          // GROUND-poisoned coordinates
    S.tries = new Map();        // per-rung patience
    S.costs = {};
    for (const b of sp.mechanics.buildables || []) S.costs[b.id] = { costs: b.costs || [b.cost], max: b.maxCount ?? 99 };
    S.lastN = 0;
  }

  // ---- refusal blacklist from the view's own order records -------------------
  for (const rec of now.orders || []) {
    const o = rec.order || rec;
    if (!o || o.verb !== 'BUILD') continue;
    const reason = String(rec.reason || rec.detail || '');
    if (rec.status !== 'failed') continue;
    if (/insufficient_gold/i.test(reason)) continue;               // ECONOMY: retry, poison nothing
    if (o.where) S.bad.add(`${o.what}@${o.where.x},${o.where.z}`);  // GROUND: poison
  }

  const byKind = now.works?.byKind || {};
  const nT = byKind.turret || 0, nB = byKind.sentry_beacon || 0, nS = byKind.sluice || 0, nP = byKind.palisade || 0;
  const priceOf = (id, count) => {
    const c = S.costs[id]; if (!c) return 1e9;
    return c.costs[Math.min(count, c.costs.length - 1)];
  };

  // ---- ladder: turrets first (they are the ONLY thing that reaches the rail) --
  const rungs = [];
  const push = (id, count, want, spots) => {
    if (count >= want) return;
    const price = priceOf(id, count);
    const free = spots.filter((p) => !S.bad.has(`${id}@${p.x},${p.z}`));
    if (!free.length) return;
    rungs.push({ id, price, spot: free[0], spots: free });
  };
  push('turret', nT, 4, TURRETS);
  push('sentry_beacon', nB, 6, BEACONS);
  push('sluice', nS, 3, SLUICES);
  if (nT >= 4 && nB >= 6 && nS >= 3) push('palisade', nP, 16, PALIS.filter(p => !S.bad.has(`palisade@${p.x},${p.z}`)));

  // interleave so a beacon lands early but never steals a turret's gold:
  // emit rungs whose CUMULATIVE cost is already covered by the purse.
  const orders = [];
  const gold = now.gold ?? 0;

  // 1. draft first (replace semantics)
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. blast is free and returns {} either way -> safe above the traveller
  if ((now.blastReadyInMs ?? 1) === 0) {
    const hx = now.hero?.x ?? POST.x, hz = now.hero?.z ?? POST.z;
    // aim at the rail beside the hero: the boss's line AND the ford's traffic lane
    const tx = RAIL_X, tz = hz;
    if (Math.hypot(tx - hx, tz - hz) <= 9.5) orders.push({ verb: 'BLAST_AT', pos: { x: tx, z: tz } });
    else orders.push({ verb: 'BLAST_AT', pos: { x: hx + 3, z: hz } });
  }

  // 3. park the hero (drops once parked; MOVE_HERO owns the tick while walking)
  const hero = { x: now.hero?.x ?? 0, z: now.hero?.z ?? 0 };
  if (dist(hero, POST) > 0.8) orders.push({ verb: 'MOVE_HERO', pos: POST });

  // 4. mend — bounded to the rig radius since ADR-005, so it cannot walk the map
  if ((now.works?.standing ?? 0) > 0) orders.push({ verb: 'REPAIR_UNDER', pct: 95 });

  // 5. builds: only what the purse already covers, cumulative
  let budget = gold;
  for (const r of rungs) {
    if (budget < r.price) break;
    orders.push({ verb: 'BUILD', what: r.id, where: r.spot, when: { goldGte: Math.max(0, r.price) } });
    budget -= r.price;
    if (orders.length > 18) break;
  }

  // 6. harvest tail — nearest live seam, drained in a block; NEVER filtered to empty
  const live = (now.seams || []).filter((s) => s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z));
  live.sort((a, b) => dist(a, hero) - dist(b, hero));
  const chain = live.length ? live : [{ id: 'gold-seam-1' }];
  const slots = Math.max(4, 31 - orders.length);
  for (let i = 0; i < slots; i++) {
    const s = chain[Math.floor(i / 7) % chain.length] || chain[0];
    orders.push({ verb: 'HARVEST', seam: s.id });
  }

  return orders.slice(0, 32);
}
