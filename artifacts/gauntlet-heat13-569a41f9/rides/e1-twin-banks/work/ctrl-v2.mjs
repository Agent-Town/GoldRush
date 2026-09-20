// e1-twin-banks controller v2, gen-82.
// tune-1 reached w18/553.4s and died with 241 IDLE gold and a frozen economy. One cause,
// three faces: works ARE attackable here (wreckers arrive from ~wave 8; 7 wrecked by the
// end, including 2 of 4 turrets and BOTH stockpiles), nothing mended them, and a wrecked
// stockpile REMOVES its cap source while the purse keeps the gold -- so gold 241 sat above
// a cap that fell back to 200 and Economy refused every credit for 240 seconds.
// v2: mend continuously, put the stockpiles inside the turret ring, and give the purse a
// real sink (beacon rungs 5-6 + turret tier 2).

const SECURE_T = 600;
const CLAIM = { x: 0, z: -12 };
const TIER2_COST = 150;

const LADDER = [
  { id: 'turret', cost: 50 },
  { id: 'turret', cost: 70 },
  { id: 'sluice', cost: 40 },
  { id: 'sentry_beacon', cost: 25 },
  { id: 'stockpile', cost: 60 },
  { id: 'sluice', cost: 40 },
  { id: 'turret', cost: 95 },
  { id: 'sentry_beacon', cost: 35 },
  { id: 'sluice', cost: 40 },
  { id: 'stockpile', cost: 60 },
  { id: 'turret', cost: 125 },
  { id: 'sentry_beacon', cost: 45 },
  { id: 'sentry_beacon', cost: 55 },
  { id: 'sentry_beacon', cost: 75 },
  { id: 'sentry_beacon', cost: 95 },
];

const SPOTS = {
  turret: [
    { x: -7, z: -12 }, { x: 7, z: -12 }, { x: 0, z: -8 }, { x: 0, z: -18 },
    { x: -11, z: -16 }, { x: 11, z: -16 }, { x: -11, z: -8 }, { x: 11, z: -8 },
    { x: 0, z: -22 }, { x: -14, z: -12 }, { x: 14, z: -12 },
  ],
  sentry_beacon: [
    { x: -4, z: -9 }, { x: 4, z: -9 }, { x: -4, z: -15 }, { x: 4, z: -15 },
    { x: 0, z: -15.5 }, { x: -8, z: -16 }, { x: 8, z: -16 }, { x: -8, z: -9 },
    { x: 8, z: -9 }, { x: 0, z: -7.5 },
  ],
  // legal line = intersection of buildZone (|z|>=7) and river pad (band +-5, pad 2).
  sluice: [
    { x: -10, z: -7 }, { x: -4, z: -7 }, { x: 4, z: -7 }, { x: 10, z: -7 },
    { x: -22, z: -7 }, { x: 22, z: -7 }, { x: -26, z: -7 }, { x: 26, z: -7 },
    { x: -10, z: 7 }, { x: 4, z: 7 }, { x: 10, z: 7 }, { x: -4, z: 7 },
  ],
  // INSIDE the ring: tune-1's (+-17,-19) sat outside turret cover and both died.
  stockpile: [
    { x: -4, z: -17 }, { x: 4, z: -17 }, { x: -8, z: -13 }, { x: 8, z: -13 },
    { x: 0, z: -16 }, { x: -4, z: -20 }, { x: 4, z: -20 }, { x: -9, z: -17 },
  ],
};

const blacklist = new Set();
const attempts = new Map();
const retired = new Set();
let lastSubmitT = -99;
let lastPlanSig = '';

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

  if (now.pendingSecure) return null;   // blank line banks the secure for free

  const orders = [];

  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  if ((now.blastReadyInMs ?? 1) === 0) {
    const edge = now.threats?.edge;
    const d = { north: [0, 6], south: [0, -6], east: [6, 0], west: [-6, 0] }[edge] || [0, 5];
    orders.push({ verb: 'BLAST_AT', pos: { x: +(hx + d[0]).toFixed(2), z: +(hz + d[1]).toFixed(2) } });
  }

  // ---- MEND. Works are attackable here and nothing mended them in tune-1. ADR-005
  // bounded REPAIR_UNDER to the Spark Rig radius around the Prospector, so it can no
  // longer walk the map -- it carries no gold gate and is cheap (repair is a fraction of
  // cost). It also un-freezes the economy: spending drops the purse back under the cap.
  orders.push({ verb: 'REPAIR_UNDER', pct: 99 });

  const byKind = now.works?.byKind || {};
  const standing = { ...byKind };
  const entries = now.works?.entries || [];

  const COSTS = { turret: [50, 70, 95, 125], sentry_beacon: [25, 35, 45, 55, 75, 95], sluice: [40, 40, 40], stockpile: [60, 60] };
  let spentEst = 0;
  for (const [k, n] of Object.entries(standing)) {
    const arr = COSTS[k]; if (!arr) continue;
    for (let i = 0; i < n && i < arr.length; i++) spentEst += arr[i];
  }

  // cap counts only stockpiles that are STANDING (a wrecked one drops its cap source)
  const liveStock = entries.filter((e) => e.id === 'stockpile' && !e.wrecked).length;
  const cap = 200 + 150 * liveStock;
  const income = gold + spentEst;
  const rate = t > 8 ? income / t : 0.8;

  const taken = new Set();
  for (const e of entries) if (e.position) taken.add(`${Math.round(e.position.x)},${Math.round(e.position.z)}`);

  for (const rec of (now.orders || [])) {
    const o = rec.order || rec;
    if (o.verb !== 'BUILD' || !o.where) continue;
    const reason = `${rec.reason || ''} ${rec.detail || ''}`.toLowerCase();
    if (!reason) continue;
    if (/insufficient_gold|insufficient/.test(reason)) continue;
    if (/out_of_zone|collision|unreachable|terrain|cap_reached|out_of_reach/.test(reason)) {
      blacklist.add(key(o.what, o.where));
    }
  }

  const need = [];
  const seen = {};
  for (let i = 0; i < LADDER.length; i++) {
    const r = LADDER[i];
    seen[r.id] = (seen[r.id] || 0) + 1;
    if ((standing[r.id] || 0) >= seen[r.id]) continue;
    if (retired.has(i)) continue;
    need.push({ ...r, idx: i });
  }

  const hurt = (hero.maxHp ? hero.hp / hero.maxHp : 1) < 0.92;
  const thin = (standing.turret || 0) < 2;
  const anyWrecked = (now.works?.wrecked || 0) > 0;
  const runway = SECURE_T - t;
  function allowed(cost) {
    if (hurt || thin || anyWrecked) return true;          // never gate survival or mending
    if (runway > 240) return true;
    return (gold - cost) + rate * runway >= cap + 10;
  }

  let cum = 0, emitted = 0;
  for (const r of need) {
    if (emitted >= 3) break;
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
    if (!spot) { retired.add(r.idx); continue; }
    taken.add(`${Math.round(spot.x)},${Math.round(spot.z)}`);
    orders.push({ verb: 'BUILD', what: r.id, where: { x: spot.x, z: spot.z }, when: { goldGte: cum } });
    emitted++;
  }

  // ---- the tier-2 turret sink. Emitted only when the ladder has nothing left to buy, the
  // board is calm and the hero is healthy, because MOVE_HERO owns the tick while it walks
  // (which stops panning) and the Prospector drifts after it. ONE target at a time, dropped
  // the moment the hero is parked -- never a ladder of posts (that is a shuttle).
  if (!need.length && gold >= TIER2_COST && !hurt && (now.threats?.alive ?? 99) < 20) {
    const up = entries.find((e) => e.id === 'turret' && !e.wrecked && (e.tier || 1) < 2);
    if (up && up.position) {
      const px = up.position.x, pz = up.position.z;
      const vx = CLAIM.x - px, vz = CLAIM.z - pz;
      const len = Math.hypot(vx, vz) || 1;
      // interactRadius 1.6, MOVE_HERO arrival radius 0.5 -> park 0.7 out, well inside reach
      const sx = +(px + (vx / len) * 0.7).toFixed(2);
      const sz = +(pz + (vz / len) * 0.7).toFixed(2);
      const d = Math.hypot(hx - px, hz - pz);
      if (d > 1.2) orders.push({ verb: 'MOVE_HERO', pos: { x: sx, z: sz } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: up.index } });
    }
  } else if (Math.hypot(hx - CLAIM.x, hz - CLAIM.z) > 1.0) {
    orders.push({ verb: 'MOVE_HERO', pos: CLAIM });   // come home, above the tail
  }

  const live = (now.seams || [])
    .filter((s) => s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map((s) => ({ ...s, d: Math.hypot(s.x - hx, s.z - hz) }))
    .sort((a, b) => a.d - b.d);

  if (live.length) {
    const BLOCK = 6;
    let i = 0;
    while (orders.length < 32) {
      orders.push({ verb: 'HARVEST', seam: live[Math.floor(i / BLOCK) % live.length].id });
      i++;
      if (i > 40) break;
    }
  }

  const planSig = JSON.stringify(orders.filter((o) => o.verb !== 'HARVEST')) +
    '|' + live.map((s) => s.id).join(',');
  const draftLive = !!(now.pendingOffer && now.pendingOffer.length);
  if (!draftLive && planSig === lastPlanSig && (t - lastSubmitT) < 2.0) return null;
  lastPlanSig = planSig; lastSubmitT = t;

  return orders.slice(0, 32);
}
