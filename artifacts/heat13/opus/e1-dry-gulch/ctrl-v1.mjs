// e1-dry-gulch controller, generation 81.
// The gen-6->80 skeleton retargeted to the post-ADR-005 grammar (no MOVE_TO / HOLD / FALLBACK_IF),
// plus the one thing this board does differently: gold is the ONLY free ranking axis
// (waves pinned at 20, timeAlive pinned at 600 by twist.secureWave), the bank cap is 200 + 150
// per stockpile (max 2 => 500), and three passive sluices beside the lone spring are 1.8 g/s.

const HOME = { x: 0, z: 12 };          // hero start = claim; hero has no drift, so silence is the hold.
const SECURE_T = 600;                   // wave 20 * 30 s
const SPRING = { x: -18, z: -18 };      // lone spring; sluice pad is hypot(dx,dz) <= 3.4

// ---- candidate spots: MORE CANDIDATES THAN SLOTS, varied in BOTH axes (gen 74) ----
const TURRET_SPOTS = [
  { x: 6, z: 12 }, { x: -6, z: 12 }, { x: 0, z: 18 }, { x: 0, z: 6 },
  { x: 5, z: 17 }, { x: -5, z: 17 }, { x: 5, z: 7 }, { x: -5, z: 7 },
  { x: 9, z: 14 }, { x: -9, z: 10 }, { x: 3, z: 20 }, { x: -3, z: 4 },
];
const BEACON_SPOTS = [
  { x: 3, z: 12 }, { x: -3, z: 12 }, { x: 0, z: 15 }, { x: 0, z: 9 },
  { x: 4, z: 15 }, { x: -4, z: 15 }, { x: 4, z: 9 }, { x: -4, z: 9 },
  { x: 2, z: 16 }, { x: -2, z: 8 }, { x: 6, z: 16 }, { x: -6, z: 8 },
  { x: 7, z: 10 }, { x: -7, z: 14 },
];
// Ring around the spring edge: radius 2.0 and 2.6, both inside pad 2 of a 1.4-radius pond.
const SLUICE_SPOTS = [
  { x: -15.4, z: -18 }, { x: -18, z: -15.4 }, { x: -20.6, z: -18 }, { x: -18, z: -20.6 },
  { x: -16.2, z: -16.2 }, { x: -19.8, z: -19.8 }, { x: -16.2, z: -19.8 }, { x: -19.8, z: -16.2 },
  { x: -16, z: -18 }, { x: -18, z: -16 }, { x: -20, z: -18 }, { x: -18, z: -20 },
];
const STOCKPILE_SPOTS = [
  { x: 10, z: 16 }, { x: -10, z: 16 }, { x: 10, z: 8 }, { x: -10, z: 8 },
  { x: 12, z: 12 }, { x: -12, z: 12 },
];

// ---- the ladder, in STRATEGY order (never price order: gen 39) ----
// survival first, then the compounding sluice batch, then cap-raisers, then the rest.
const LADDER = [
  { id: 'turret', cost: 50 },
  { id: 'sentry_beacon', cost: 25 },
  { id: 'turret', cost: 70 },
  { id: 'sluice', cost: 40, batch: 'sluice' },   // one trip, cumulative-gated
  { id: 'sluice', cost: 40, batch: 'sluice' },
  { id: 'sluice', cost: 40, batch: 'sluice' },
  { id: 'sentry_beacon', cost: 35 },
  { id: 'turret', cost: 95 },
  { id: 'sentry_beacon', cost: 45 },
  { id: 'stockpile', cost: 60 },                 // cap 200 -> 350
  { id: 'turret', cost: 125 },
  { id: 'stockpile', cost: 60 },                 // cap 350 -> 500
  { id: 'sentry_beacon', cost: 55 },
  { id: 'sentry_beacon', cost: 75 },
  { id: 'sentry_beacon', cost: 95 },
];
const SPOTS = {
  turret: TURRET_SPOTS, sentry_beacon: BEACON_SPOTS,
  sluice: SLUICE_SPOTS, stockpile: STOCKPILE_SPOTS,
};

// GROUND refusals poison the coordinate; ECONOMY refusals poison nothing (gen 51).
const GROUND = /out_of_zone|collision|unreachable|out_of_reach|cap_reached|not legal|outside buildable/i;
const ECONOMY = /insufficient_gold|afford/i;

const blacklist = new Set();      // "id@x,z"
const attempts = new Map();       // "id@x,z" -> tries
let lastSubmitT = -99;
let entries = 0;
const panHist = [];               // [t, goldPanned]

const key = (id, s) => `${id}@${s.x},${s.z}`;
const d2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name || ''} ${o.effectText || ''}`.toLowerCase();
  if (/plating|max hp|maxhp|health|armou?r|vitality|tough/.test(s)) return 100;
  if (/dressing|heal|regen|mend/.test(s)) return 90;
  if (/spark|damage|coil|tap|bolt|power/.test(s)) return 50;
  if (/rate|speed|reload|cool/.test(s)) return 40;
  return 10;
}

export default function controller(view) {
  const n = view.now;
  const t = n.timers?.runSeconds ?? 0;

  // The secure boundary: answer with SILENCE so the configured `bank` default fires and the
  // reel's last accepted order stays inside the envelope (standing equipment, 11 contracts).
  if (n.pendingSecure) return null;

  const gold = n.gold ?? 0;
  const hero = { x: n.hero?.x ?? 0, z: n.hero?.z ?? 12 };
  const hp = n.hero?.hp ?? 100, maxHp = n.hero?.maxHp ?? 100;
  const byKind = n.works?.byKind ?? {};
  const stockpiles = byKind.stockpile ?? 0;
  const sluices = byKind.sluice ?? 0;
  const cap = 200 + 150 * stockpiles;

  // --- learn from refusals in the accepted-order snapshot ---
  for (const rec of n.orders ?? []) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || {};
    if (o.verb !== 'BUILD' || !o.where) continue;
    const k = key(o.what, o.where);
    const reason = String(rec.reason || '');
    if (ECONOMY.test(reason)) continue;              // transient: poison nothing
    const tries = (attempts.get(k) ?? 0) + 1;
    attempts.set(k, tries);
    if (GROUND.test(reason) || tries >= 3) blacklist.add(k);
  }

  // --- income rate, measured, for the bank gate (biased DOWN: pan misses sluice gold) ---
  panHist.push([t, n.score?.goldPanned ?? 0]);
  while (panHist.length > 12) panHist.shift();
  let rate = 1.2;
  if (panHist.length >= 2) {
    const [t0, p0] = panHist[0], [t1, p1] = panHist[panHist.length - 1];
    if (t1 - t0 > 8) rate = Math.max(0.4, (p1 - p0) / (t1 - t0));
  }
  rate += 0.6 * sluices;

  // --- which ladder rungs are still owed ---
  const built = {};
  const owed = [];
  for (const rung of LADDER) {
    built[rung.id] = (built[rung.id] ?? 0);
    const have = byKind[rung.id] ?? 0;
    if (built[rung.id] < have) { built[rung.id] += 1; continue; }  // this rung already stands
    built[rung.id] += 1;
    owed.push(rung);
  }

  // BANK GATE (gen 74/79): late-only, and suspended whenever the hero is actually being hurt.
  const hurt = hp / maxHp < 0.92;
  const bankOk = (cost) => {
    if (hurt || t < 300) return true;
    return (gold - cost) + rate * (SECURE_T - t) >= cap + 5;
  };

  const orders = [];

  // 1. the draft, first, under replace semantics — plating first, never offer[0].
  if (n.pendingOffer?.length) {
    const best = [...n.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. free supplementary damage; returns {} on success AND failure, so it is safe up here.
  if ((n.blastReadyInMs ?? 1) === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: round1(hero.x), z: round1(hero.z + 2) } });
  }

  // 3. knockback correction only. The hero has no drift: with no move intent it simply stays,
  //    so "hold" costs zero orders. Emit ONCE, never a ladder of posts (gen 68's shuttle).
  if (d2(hero, HOME) > 1.5) orders.push({ verb: 'MOVE_HERO', pos: HOME });

  // 4. the ladder. Plan-time affordable only, except the sluice batch, which is cumulatively
  //    gated so all three land on ONE 33-wu trip instead of three.
  const next = owed[0];
  if (next) {
    if (next.batch === 'sluice') {
      const batch = owed.filter((r) => r.batch === 'sluice');
      const total = batch.reduce((s, r) => s + r.cost, 0);
      if (gold >= total && bankOk(total)) {
        let remain = total;
        const taken = [];
        for (const r of batch) {
          const spot = pick(r.id, n.works?.entries ?? [], taken);
          if (spot) { taken.push(spot); orders.push({ verb: 'BUILD', what: r.id, where: spot, when: { goldGte: remain } }); }
          remain -= r.cost;
        }
      }
    } else if (gold >= next.cost && bankOk(next.cost)) {
      const spot = pick(next.id, n.works?.entries ?? [], []);
      if (spot) orders.push({ verb: 'BUILD', what: next.id, where: spot, when: { goldGte: next.cost } });
    }
  }

  // 5. the harvest tail: the throughput AND the clock. Alternating blocks of six drain a
  //    30-capacity seam and come back after its 20 s respawn. null coords on an inactive seam
  //    would refuse the WHOLE array, so filter for finiteness before any sort (gen 59).
  const live = (n.seams ?? [])
    .filter((s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z) && s.id)
    .sort((a, b) => d2(a, hero) - d2(b, hero));
  const slots = 32 - orders.length;
  if (live.length) {
    const blocks = [];
    for (let i = 0; blocks.length * 6 < slots; i += 1) blocks.push(live[i % live.length]);
    for (const seam of blocks) {
      for (let k = 0; k < 6 && orders.length < 32; k += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
    }
  }
  while (orders.length > 32) orders.pop();

  // --- byte pacing: the reel's binding axis is bytes, ~2.4 KB per order entry ---
  const urgent = !!n.pendingOffer?.length || hurt || orders.some((o) => o.verb === 'BUILD');
  if (!urgent && entries > 0 && t - lastSubmitT < 2.5) return null;
  lastSubmitT = t; entries += 1;
  return orders;
}

function round1(v) { return Math.round(v * 10) / 10; }

// A candidate is usable when it is not blacklisted, not already occupied by a standing work,
// and not already reserved by an earlier rung of the same in-flight batch.
function pick(id, entries, taken) {
  for (const s of SPOTS[id] ?? []) {
    if (blacklist.has(key(id, s))) continue;
    if (entries.some((e) => e.position && d2(e.position, s) < 2.5)) continue;
    if (taken.some((r) => d2(r, s) < 2.5)) continue;
    return s;
  }
  return null;
}
