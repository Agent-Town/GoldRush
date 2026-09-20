// e10-archive-world controller v1 — generation 133
//
// CONTRACT (read from source + view):
//   secure = wave >= 12 AND archive.completedHolds > 0.
//   A hold completes when a LIVING POWERED sentry_beacon sits within radius 4 of the
//   next unrestored wing's light site at the instant telegraph begins, and stays lit
//   through telegraph(8s)+squall(25s) to the recover transition.
//   Squall cycle = 60 calm / 8 telegraph / 25 squall / 8 recover = 101 s.
//   Telegraph opens at t = 60, 161, 262, 363. Wave 12 lands at t = 360.
//   => build the west beacon (-28,-6) EARLY; the t=60 hold is free and there are 3 chances.
//   Roster declares NO wrecker and NO thief -> works cannot be attacked, gold cannot be stolen.
//   Gold is the ONLY free ranking axis (waves 12 + timeAlive 360 pinned by the gate).

const SECURE_WAVE = 12;
const SECURE_T = 360;

// --- objective: the west light site, radius 4 --------------------------------
const WEST_SITE = { x: -28, z: -6 };
const OBJ_SPOTS = [
  { x: -28, z: -6 }, { x: -28, z: -4 }, { x: -26, z: -6 }, { x: -30, z: -6 },
  { x: -28, z: -8 }, { x: -26, z: -4 }, { x: -30, z: -8 }, { x: -26, z: -8 },
  { x: -30, z: -4 }, { x: -25, z: -6 }, { x: -31, z: -6 }, { x: -28, z: -3 },
  { x: -28, z: -9 }, { x: -27, z: -5 }, { x: -29, z: -7 },
];

// --- fort: the entry hall pocket. hero sits at (0,-52); zone x-42..42 z-54..-38
const TURRET_SPOTS = [
  { x: -8, z: -44 }, { x: 8, z: -44 }, { x: -16, z: -46 }, { x: 16, z: -46 },
  { x: 0, z: -42 }, { x: -12, z: -40 }, { x: 12, z: -40 }, { x: -20, z: -48 },
  { x: 20, z: -48 }, { x: 0, z: -48 }, { x: -6, z: -40 }, { x: 6, z: -40 },
];
const BEACON_SPOTS = [
  { x: -5, z: -48 }, { x: 5, z: -48 }, { x: 0, z: -45 }, { x: -7, z: -52 },
  { x: 7, z: -52 }, { x: -3, z: -44 }, { x: 3, z: -44 }, { x: -10, z: -48 },
  { x: 10, z: -48 }, { x: 0, z: -50 }, { x: -6, z: -46 }, { x: 6, z: -46 },
];
const STOCK_SPOTS = [
  { x: -2, z: -53 }, { x: 2, z: -53 }, { x: -4, z: -50 }, { x: 4, z: -50 },
  { x: -9, z: -51 }, { x: 9, z: -51 }, { x: -13, z: -50 }, { x: 13, z: -50 },
];
const PAL_SPOTS = [];
for (const z of [-38, -40, -42]) for (let x = -24; x <= 24; x += 4) PAL_SPOTS.push({ x, z });

// ladder: ONE list, ONE ordinal per id (gen 110). strategy order, not price order.
const LADDER = [
  { id: 'sentry_beacon', spots: OBJ_SPOTS, tag: 'OBJ' },   // the gate, 25g
  { id: 'turret', spots: TURRET_SPOTS },                   // 50
  { id: 'turret', spots: TURRET_SPOTS },                   // 70
  { id: 'sentry_beacon', spots: BEACON_SPOTS },            // 35
  { id: 'turret', spots: TURRET_SPOTS },                   // 95
  { id: 'sentry_beacon', spots: BEACON_SPOTS },            // 45
  { id: 'turret', spots: TURRET_SPOTS },                   // 125
  { id: 'stockpile', spots: STOCK_SPOTS },                 // 60  (+150 cap, no thief on roster)
  { id: 'stockpile', spots: STOCK_SPOTS },                 // 60
  { id: 'sentry_beacon', spots: BEACON_SPOTS },            // 55
  { id: 'sentry_beacon', spots: BEACON_SPOTS },            // 75
  { id: 'sentry_beacon', spots: BEACON_SPOTS },            // 95
];
const CORE_LEN = 7; // through the 4th turret: the fort that has to hold

const banned = new Set();       // GROUND refusals only
const placedAt = [];            // positions I have seen standing
let lastSig = '';
let lastT = -99;

function key(p) { return `${p.x},${p.z}`; }
function d2(a, b) { return (a.x - b.x) ** 2 + (a.z - b.z) ** 2; }

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name || ''} ${o.effectText || ''}`.toLowerCase();
  if (/plating|armor|armour|max hp|maxhp|tough|vigor/.test(s)) return 100;
  if (/dressing|heal|regen|mend|recover/.test(s)) return 90;
  if (/spark|damage|tap|coil|volley|split|powder|blast/.test(s)) return 60;
  if (/fire rate|rate|reload|cooldown/.test(s)) return 55;
  if (/range|reach/.test(s)) return 40;
  if (/luck|pan|gold|legend/.test(s)) return 20;
  return 30;
}

export default function controller(view) {
  const now = view.now || {};
  const t = now.timers?.runSeconds ?? 0;

  // secure boundary: silence. cannot be rejected, takes the bank default.
  if (now.pendingSecure) return '\n';

  const orders = [];
  const gold = now.gold ?? 0;
  const byKind = now.works?.byKind || {};
  const entries = now.works?.entries || [];
  const buildables = (view.stablePrefix?.mechanics?.buildables) || [];
  const costOf = (id, n) => {
    const b = buildables.find(x => x.id === id);
    if (!b) return 1e9;
    const arr = b.costs || [b.cost];
    return arr[Math.min(n, arr.length - 1)] ?? b.cost ?? 1e9;
  };
  const capOf = (id) => buildables.find(x => x.id === id)?.maxCount ?? 0;

  // record standing positions so a spot is not retried into a collision
  for (const e of entries) if (e.position) placedAt.push({ x: e.position.x, z: e.position.z });

  // GROUND / ECONOMY refusal partition (gen 51)
  for (const rec of (now.orders || [])) {
    if (rec.status !== 'failed') continue;
    const r = String(rec.reason || '').toLowerCase();
    const w = rec.order?.where;
    if (!w) continue;
    if (/insufficient_gold|insufficient gold/.test(r)) continue;     // ECONOMY: retry, poison nothing
    if (/unreachable|out_of_zone|out of zone|collision|terrain|cap_reached|out_of_reach/.test(r)) banned.add(key(w));
    else banned.add(key(w));
  }

  // ---- 1. draft first, under replace semantics
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // ---- 2. free blast (returns {} on success and failure: safe anywhere)
  if ((now.blastReadyInMs ?? 1) === 0) {
    const hx = now.hero?.x ?? 0, hz = now.hero?.z ?? -52;
    orders.push({ verb: 'BLAST_AT', pos: { x: +(hx).toFixed(2), z: +(hz + 7).toFixed(2) } });
  }

  // ---- 3. the ladder: ONE ordinal per id, head rung only (+1 cumulative)
  const seen = {};
  let emitted = 0, cum = 0;
  const objDone = (byKind['sentry_beacon'] ?? 0) > 0;
  const hurt = (now.hero?.hp ?? 100) / (now.hero?.maxHp ?? 100) < 0.55;
  const coreIncomplete = LADDER.slice(0, CORE_LEN).some((r, i) => {
    const o = (seenCount(LADDER, i, r.id));
    return (byKind[r.id] ?? 0) < o;
  });
  function seenCount(list, upto, id) {
    let n = 0;
    for (let i = 0; i <= upto; i++) if (list[i].id === id) n++;
    return n;
  }
  // bank gate: only late, and never while the core is unbuilt or the hero is hurt (gens 128/131)
  const rate = t > 20 ? Math.max(0.6, (now.score?.goldPanned ?? 0) / t * 0.9) : 2;
  const liveCap = 200 + 150 * Math.min(2, byKind['stockpile'] ?? 0);

  for (let i = 0; i < LADDER.length && emitted < 2; i++) {
    const rung = LADDER[i];
    seen[rung.id] = (seen[rung.id] ?? 0) + 1;
    const standing = byKind[rung.id] ?? 0;
    if (standing >= seen[rung.id]) continue;            // already satisfied
    if (seen[rung.id] > capOf(rung.id)) continue;       // past the roster cap: retire
    const cost = costOf(rung.id, standing + emitted);
    // late spend guard, with hard bypasses
    if (!coreIncomplete && !hurt && t > SECURE_T - 90) continue;
    if (!coreIncomplete && !hurt && t > 150) {
      const projected = (gold - cost) + rate * Math.max(0, SECURE_T - t);
      if (projected < liveCap + 5) continue;
    }
    const spot = rung.spots.find(p => !banned.has(key(p)) && !placedAt.some(q => d2(q, p) < 2.9));
    if (!spot) continue;                                 // rung with no candidates: RETIRE, do not stall
    cum += cost;
    orders.push({ verb: 'BUILD', what: rung.id, where: spot, when: { goldGte: cum } });
    emitted++;
  }

  // ---- 4. harvest tail: finite-filtered, nearest-first, drained in blocks
  const hero = { x: now.hero?.x ?? 0, z: now.hero?.z ?? -52 };
  const live = (now.seams || [])
    .filter(s => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map(s => ({ id: s.id, d: Math.hypot(s.x - hero.x, s.z - hero.z) }))
    .sort((a, b) => a.d - b.d);
  const chain = live.length ? live.slice(0, 3).map(s => s.id) : ['gold-seam-1'];
  const room = 31 - orders.length;
  const BLOCK = 6;
  for (let n = 0; n < room; n++) {
    const seam = chain[Math.floor(n / BLOCK) % chain.length];
    orders.push({ verb: 'HARVEST', seam });
  }

  // reel budget: resubmit only on a real change (the tail drains, so resubmit often enough)
  const sig = JSON.stringify(orders.map(o => o.verb === 'HARVEST' ? 'H' : o));
  const stale = t - lastT;
  if (sig === lastSig && stale < 4 && !now.pendingOffer) return '\n';
  lastSig = sig; lastT = t;
  return JSON.stringify(orders) + '\n';
}
