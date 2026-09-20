// e2-pressure-garden controller v1 — post-ADR-005 grammar.
// Claim (-12,12) sits inside boiler-terrace (x -36..36, z 7..16); hero starts there and
// has no drift, so silence is the hold. Sluice legal line derived: bank needs z>6.25,
// buildZone minZ=7, riverPad 2 over river z<=5  =>  z == 7 exactly.

const HOME = { x: -12, z: 12 };
const SECURE_T = 360;
const BASE_CAP = 200;

const SPOTS = {
  turret: [
    { x: -12, z: 15.5 }, { x: -18, z: 12 }, { x: -6, z: 12 }, { x: -12, z: 9.5 },
    { x: -16, z: 15 }, { x: -8, z: 15 }, { x: -21, z: 14 }, { x: -3, z: 14 },
    { x: -17, z: 9.5 }, { x: -7, z: 9.5 }, { x: -23, z: 11 }, { x: -1, z: 11 },
  ],
  sluice: [
    { x: -20, z: 7 }, { x: -14, z: 7 }, { x: -8, z: 7 },
    { x: -26, z: 7 }, { x: -2, z: 7 }, { x: -32, z: 7 },
    { x: 4, z: 7 }, { x: 10, z: 7 }, { x: -17, z: 7 }, { x: -11, z: 7 },
  ],
  sentry_beacon: [
    { x: -14.5, z: 13.5 }, { x: -9.5, z: 13.5 }, { x: -14.5, z: 10.5 }, { x: -9.5, z: 10.5 },
    { x: -12, z: 12.8 }, { x: -19, z: 14.5 }, { x: -5, z: 14.5 }, { x: -19.5, z: 10 },
    { x: -4.5, z: 10 }, { x: -12, z: 17 }, { x: -15.5, z: 16 }, { x: -8.5, z: 16 },
  ],
  stockpile: [
    { x: -12.5, z: 11 }, { x: -11.5, z: 14 },
    { x: -16, z: 12.5 }, { x: -8, z: 12.5 }, { x: -12, z: 7.8 }, { x: -20, z: 15.5 },
  ],
};

// strategy order, not price order
const LADDER = [
  'turret', 'sluice', 'turret', 'sluice', 'sluice', 'turret',
  'sentry_beacon', 'turret', 'sentry_beacon', 'stockpile', 'stockpile',
  'sentry_beacon', 'sentry_beacon', 'sentry_beacon', 'sentry_beacon',
];

const GROUND_FAIL = /out_of_zone|collision|out_of_reach|cap_reached|UNREACHABLE|outside buildable|not legal/i;

const dead = new Set();      // poisoned "id@x,z"
const tries = new Map();     // patience budget per spot
let costsById = null;
let maxById = null;

const key = (id, s) => `${id}@${s.x},${s.z}`;

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name || ''} ${o.effectText || ''}`.toLowerCase();
  let v = 0;
  if (/plating|max hp|maxhp|health|vitality|hardy/.test(s)) v += 100;
  if (/dressing|heal|regen|mend/.test(s)) v += 80;
  if (/spark|damage|coil|tap|bolt|pierce|crit/.test(s)) v += 40;
  if (/fire rate|reload|rate/.test(s)) v += 30;
  if (/blast|charge|radius/.test(s)) v += 20;
  if (/gold|luck|pan|seam|prospector|assay/.test(s)) v += 5;
  return v;
}

export default function controller(view) {
  const now = view.now;
  const sp = view.stablePrefix;

  // The secure boundary accepts exactly one SECURE_CHOICE and refuses anything else,
  // and a refused array burns the choice clock (gen 84). Answer with silence -> bank.
  if (now.pendingSecure) return null;

  if (!costsById) {
    costsById = {}; maxById = {};
    for (const b of sp.mechanics.buildables || []) {
      costsById[b.id] = b.costs; maxById[b.id] = b.maxCount;
    }
  }

  // ---- refusal ledger from the view's own order records -------------------
  for (const rec of now.orders || []) {
    const o = rec.order || rec;
    if (!o || o.verb !== 'BUILD' || !o.where) continue;
    const k = key(o.what, o.where);
    const reason = `${rec.reason || ''} ${rec.detail || ''}`;
    if (rec.status === 'failed') {
      if (GROUND_FAIL.test(reason)) dead.add(k);
      else if (!/insufficient_gold/i.test(reason)) {
        const n = (tries.get(k) || 0) + 1;
        tries.set(k, n);
        if (n >= 6) dead.add(k);
      }
    }
  }

  const entries = now.works?.entries || [];
  const standing = {};
  const unwreckedStock = [];
  for (const e of entries) {
    standing[e.id] = (standing[e.id] || 0) + 1;
    if (e.position) dead.add(key(e.id, { x: e.position.x, z: e.position.z }));
    if (e.id === 'stockpile' && !e.wrecked) unwreckedStock.push(e);
  }
  const byKind = now.works?.byKind || {};
  const countOf = (id) => byKind[id] ?? standing[id] ?? 0;

  const t = now.timers?.runSeconds ?? 0;
  const gold = now.gold ?? 0;
  const panned = now.score?.goldPanned ?? 0;
  const hero = now.hero || {};
  const hpFrac = hero.maxHp ? hero.hp / hero.maxHp : 1;
  const anyWrecked = (now.works?.wrecked ?? 0) > 0;
  const liveCap = BASE_CAP + 150 * unwreckedStock.length;

  const orders = [];

  // 1. draft first (replace semantics: the pick must own the top of the array)
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. free damage; BLAST_AT answers {} on success and on failure, so it never eats a tick
  if ((now.blastReadyInMs ?? 1) === 0 && Number.isFinite(hero.x) && Number.isFinite(hero.z)) {
    orders.push({ verb: 'BLAST_AT', pos: { x: +hero.x.toFixed(2), z: +hero.z.toFixed(2) } });
  }

  // 3. hero correction only when it has actually been pushed off home
  if (Number.isFinite(hero.x) && Math.hypot(hero.x - HOME.x, hero.z - HOME.z) > 1.5) {
    orders.push({ verb: 'MOVE_HERO', pos: HOME });
  }

  // 4. ladder: next pending rungs, cumulatively gated so a cheap rung cannot steal
  //    gold an expensive one is waiting for. One trip buys the whole batch.
  const built = {};
  let cum = 0, emitted = 0;
  // income rate for the bank gate, floored so an early view cannot over-promise
  const rate = t > 40 ? Math.max(0.8, panned / t) : 1.6;
  for (const id of LADDER) {
    if (emitted >= 4) break;
    const have = countOf(id) + (built[id] || 0);
    if (have >= (maxById[id] ?? 0)) continue;
    const cost = costsById[id]?.[have] ?? costsById[id]?.[costsById[id].length - 1];
    if (!Number.isFinite(cost)) continue;
    const spot = (SPOTS[id] || []).find((s) => !dead.has(key(id, s)));
    if (!spot) { built[id] = (built[id] || 0) + 1; continue; }   // retire an unfillable rung

    // bank gate: gold is the only free ranking axis once waves/time are pinned.
    // Stockpiles RAISE the cap, so they are never gated by it; nor is anything
    // while the hero is hurt or the fort is being eaten.
    const urgent = hpFrac < 0.92 || anyWrecked || countOf('turret') < 2;
    const exempt = id === 'stockpile' || urgent || t < SECURE_T - 150;
    const projected = (gold - (cum + cost)) + rate * (SECURE_T - t);
    if (!exempt && projected < liveCap + 5) continue;

    cum += cost;
    orders.push({ verb: 'BUILD', what: id, where: spot, when: { goldGte: cum } });
    built[id] = (built[id] || 0) + 1;
    emitted++;
  }

  // 5. mend — bounded to the rig radius since ADR-005, so it is free when nothing is near
  orders.push({ verb: 'REPAIR_UNDER', pct: 99 });

  // 6. harvest tail: the throughput AND the clock. Drain a seam in a block before walking.
  const pros = now.prospector || hero;
  const live = (now.seams || [])
    .filter((s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map((s) => ({ ...s, d: Math.hypot(s.x - (pros.x ?? HOME.x), s.z - (pros.z ?? HOME.z)) }))
    .sort((a, b) => a.d - b.d);

  const room = 32 - orders.length;
  if (live.length) {
    const per = 7;
    for (let i = 0; orders.length < 32; i++) {
      const seam = live[Math.floor(i / per) % live.length];
      orders.push({ verb: 'HARVEST', seam: seam.id });
    }
  } else if (room > 0) {
    // never leave the array empty of a terminal anchor
    for (const s of now.seams || []) {
      if (orders.length >= 32) break;
      orders.push({ verb: 'HARVEST', seam: s.id });
    }
  }

  return orders.slice(0, 32);
}
