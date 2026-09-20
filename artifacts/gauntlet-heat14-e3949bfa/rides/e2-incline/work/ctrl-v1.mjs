// e2-incline controller v1 — heat 14, era 6.
// Map facts measured this ride:
//  claim/heroStart (-24,-18); lower-yard build zone x -36..36, z -30..-7
//  rail route 0 is x = -12, z -46..46; railcar patrols (route REVERSES at each end)
//  boss wave 12, hpScale 12.5, 3 components (0.9+1.25+0.85=3.0) => ~3129 hp
//  turret range 16 dmg 52 rate 1.1 ; beacon range 8 dmg 10+0.75/wave rate 1.2
//  a turret at lateral offset d from the rail gets 2*sqrt(256-d^2) units of window
//  seams: only gold-seam-1 (-30,-20) is near; anchors do NOT re-anchor on this seed
//  river blocks enemies; all spawn edges are north of it; fords at x = +-12

const RAIL_X = -12;
const CLAIM = { x: -24, z: -18 };
const HERO_POST = [
  { x: -18, z: -16 }, // rail 6 (rig range 10 reaches it), claim 6.3
  { x: -19, z: -16 },
  { x: -20, z: -15 },
  { x: -22, z: -17 },
];

// candidates: integer lattice (gridSnap 1), turrets at |d|=4 from the rail for the
// widest window that still covers the claim; beacons behind them.
const CAND = {
  turret: [
    { x: -16, z: -14 }, { x: -16, z: -19 }, { x: -16, z: -9 }, { x: -16, z: -24 },
    { x: -17, z: -12 }, { x: -17, z: -21 }, { x: -15, z: -16 }, { x: -18, z: -10 },
    { x: -18, z: -22 }, { x: -19, z: -16 }, { x: -16, z: -28 }, { x: -20, z: -13 },
  ],
  sentry_beacon: [
    { x: -19, z: -12 }, { x: -19, z: -17 }, { x: -19, z: -22 }, { x: -20, z: -9 },
    { x: -20, z: -19 }, { x: -21, z: -14 }, { x: -18, z: -26 }, { x: -22, z: -21 },
    { x: -22, z: -11 }, { x: -21, z: -24 }, { x: -23, z: -14 }, { x: -17, z: -25 },
  ],
  stockpile: [
    { x: -26, z: -23 }, { x: -27, z: -14 }, { x: -29, z: -24 }, { x: -24, z: -26 },
    { x: -29, z: -12 }, { x: -25, z: -10 },
  ],
  palisade: [
    { x: -13, z: -8 }, { x: -11, z: -9 }, { x: -14, z: -10 }, { x: -10, z: -11 },
    { x: -13, z: -12 }, { x: -11, z: -13 }, { x: -14, z: -7 }, { x: -9, z: -9 },
    { x: -12, z: -15 }, { x: -10, z: -16 }, { x: -13, z: -17 }, { x: -11, z: -19 },
    { x: -12, z: -21 }, { x: -10, z: -23 }, { x: -13, z: -25 }, { x: -11, z: -27 },
  ],
};

// strategy order, not price order.
const LADDER = [
  'turret', 'sentry_beacon', 'turret', 'sentry_beacon', 'turret', 'turret',
  'sentry_beacon', 'sentry_beacon', 'stockpile', 'stockpile',
  'sentry_beacon', 'sentry_beacon',
];

const PLATING = ['tinkers_plating', 'field_dressing', 'iron_lung', 'second_wind'];
const DAMAGE = ['heavy_spark', 'double_tap_coil', 'split_spark', 'powder_charge', 'long_barrel'];

const poisoned = new Set();      // GROUND refusals only
const placed = [];               // {id, x, z} I believe I own
const retired = new Set();       // ladder indices that ran out of candidates
let heroIdx = 0;
let lastSig = null;
let lastSubmitT = -999;

function key(id, p) { return `${id}@${p.x},${p.z}`; }
function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

function costOf(view, id, builtCount) {
  const b = (view.stablePrefix.mechanics.buildables || []).find((q) => q.id === id);
  if (!b) return Infinity;
  const costs = b.costs || [b.cost];
  return costs[Math.min(builtCount, costs.length - 1)] ?? b.cost;
}
function maxOf(view, id) {
  const b = (view.stablePrefix.mechanics.buildables || []).find((q) => q.id === id);
  return b?.maxCount ?? 0;
}

function pickSpot(id, byKind) {
  const list = CAND[id] || [];
  for (const p of list) {
    if (poisoned.has(key(id, p))) continue;
    // keep 2.5 clear of anything I already placed (overlapRadius 1.2 each)
    let clash = false;
    for (const q of placed) if (dist(p, q) < 2.5) { clash = true; break; }
    if (clash) continue;
    if (dist(p, CLAIM) < 2.5) continue;
    return p;
  }
  return null;
}

export default function controller(view) {
  const now = view.now;
  const t = now.timers?.runSeconds ?? 0;
  const wave = now.wave ?? 0;
  const gold = now.gold ?? 0;
  const hero = now.hero || {};
  const byKind = now.works?.byKind || {};
  const entries = now.works?.entries || [];

  // 0. secure window: silence. Cannot be rejected; takes the bank default.
  if (now.pendingSecure) return '\n';

  // learn from the last array's refusals
  for (const rec of now.orders || []) {
    const o = rec.order || rec;
    if (o.verb !== 'BUILD' || rec.status !== 'failed') continue;
    const r = String(rec.reason || '').toLowerCase();
    if (/insufficient_gold|gold/.test(r)) continue;          // ECONOMY: retry, poison nothing
    if (o.where) poisoned.add(key(o.what, o.where));         // GROUND: poison the coordinate
  }
  // reconcile what actually stands
  placed.length = 0;
  for (const e of entries) if (e.position) placed.push({ id: e.id, x: e.position.x, z: e.position.z });

  const orders = [];

  // 1. draft first (replace semantics)
  if (now.pendingOffer && now.pendingOffer.length) {
    const score = (o) => {
      const id = String(o.id || '');
      let s = 0;
      if (PLATING.includes(id)) s += 100 - PLATING.indexOf(id);
      if (DAMAGE.includes(id)) s += 50 - DAMAGE.indexOf(id);
      return s;
    };
    const best = [...now.pendingOffer].sort((a, b) => score(b) - score(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. free blast — returns {} on success and failure, safe above the traveller.
  if ((now.blastReadyInMs ?? 1) === 0 && Number.isFinite(hero.x)) {
    // aim at the rail beside the hero when it is in reach, else at the nearest scrum
    const target = { x: RAIL_X, z: Math.round(hero.z) };
    if (Math.hypot(target.x - hero.x, target.z - hero.z) <= 9.5) {
      orders.push({ verb: 'BLAST_AT', pos: target });
    } else {
      orders.push({ verb: 'BLAST_AT', pos: { x: Math.round(hero.x), z: Math.round(hero.z) } });
    }
  }

  // 3. hero post — emit only while displaced; advance only on a real refusal.
  const post = HERO_POST[Math.min(heroIdx, HERO_POST.length - 1)];
  for (const rec of now.orders || []) {
    const o = rec.order || rec;
    if (o.verb === 'MOVE_HERO' && rec.status === 'failed' && /UNREACHABLE/i.test(String(rec.reason || ''))) {
      heroIdx = Math.min(heroIdx + 1, HERO_POST.length - 1);
    }
  }
  if (Number.isFinite(hero.x) && dist({ x: hero.x, z: hero.z }, post) > 0.8) {
    orders.push({ verb: 'MOVE_HERO', pos: post });
  }

  // 4. mend — ungated (ADR-005 bounds it to the rig sweep), only when something is hurt
  const hurt = (now.works?.wrecked ?? 0) > 0 || (now.works?.hp ?? 0) < (now.works?.maxHp ?? 0);
  if (hurt) orders.push({ verb: 'REPAIR_UNDER', pct: 99 });

  // 5. build ladder — one rung, plan-time affordable, cumulative gate
  const turretCount = byKind.turret ?? 0;
  const thin = turretCount < 4 || (now.works?.wrecked ?? 0) > 0 || (hero.hp ?? 100) < (hero.maxHp ?? 100) * 0.7;
  const STOP_BUILD_AT = 440;
  if (t < STOP_BUILD_AT || thin) {
    // ordinal[id] counts how many rungs of that id we have walked past, 1-based for
    // the rung in hand. A rung is SATISFIED when that many already stand.
    const ordinal = {};
    for (let i = 0; i < LADDER.length; i++) {
      const id = LADDER[i];
      ordinal[id] = (ordinal[id] ?? 0) + 1;
      if (retired.has(i)) continue;
      const standing = byKind[id] ?? 0;
      if (standing >= ordinal[id]) continue;          // already built by an earlier ride of this rung
      if (standing >= maxOf(view, id)) { retired.add(i); continue; }
      const c = costOf(view, id, standing);           // instance index = what stands now
      const spot = pickSpot(id, byKind);
      if (!spot) { retired.add(i); continue; }        // no ground left: RETIRE, never stall
      if (gold >= c) orders.push({ verb: 'BUILD', what: id, where: spot, when: { goldGte: c } });
      break;                                          // only the head rung is ever emitted
    }
  }

  // 6. surplus sinks once the fort stands: tier-2 turrets (the boss lever), then timber
  const ladderCore = (byKind.turret ?? 0) >= 4 && (byKind.sentry_beacon ?? 0) >= 4;
  if (ladderCore && t < STOP_BUILD_AT && orders.filter((o) => o.verb === 'BUILD').length === 0) {
    const up = entries.find((e) => e.id === 'turret' && (e.tier ?? 1) < 2 && !e.wrecked);
    if (up && gold >= 150 && up.position) {
      const d = Math.hypot(up.position.x - hero.x, up.position.z - hero.z);
      if (d > 1.0) orders.push({ verb: 'MOVE_HERO', pos: { x: up.position.x + 1, z: up.position.z } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: up.index } });
    } else if (gold >= 40) {
      const spot = pickSpot('palisade', byKind);
      if (spot && (byKind.palisade ?? 0) < 20) orders.push({ verb: 'BUILD', what: 'palisade', where: spot, when: { goldGte: 10 } });
    }
  }

  // 7. harvest tail — camp gold-seam-1; failures are free decision points (the
  //    Prospector already stands there) and they buy blast windows during the boss pass.
  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const ranked = live.sort((a, b) => dist(a, CLAIM) - dist(b, CLAIM));
  const slots = Math.max(0, 31 - orders.length);
  if (ranked.length) {
    const near = ranked[0];
    for (let i = 0; i < slots; i++) orders.push({ verb: 'HARVEST', seam: near.id });
  } else if (now.seams && now.seams.length) {
    for (let i = 0; i < slots; i++) orders.push({ verb: 'HARVEST', seam: now.seams[0].id });
  }
  if (!orders.length) orders.push({ verb: 'HARVEST', seam: 'gold-seam-1' });

  // dedupe: resubmit on a plan change, a live draft, a ready blast in the boss window,
  // or a 4-second floor. Silence otherwise — it keeps the reel small and cannot be rejected.
  const sig = JSON.stringify(orders.map((o) => [o.verb, o.what, o.where, o.id, o.pos, o.action]));
  const bossTime = wave >= 11;
  const mustSend = sig !== lastSig
    || (now.pendingOffer && now.pendingOffer.length)
    || (bossTime && (now.blastReadyInMs ?? 1) === 0)
    || (t - lastSubmitT) >= 4;
  if (!mustSend) return '\n';
  lastSig = sig; lastSubmitT = t;
  return orders.slice(0, 32);
}
