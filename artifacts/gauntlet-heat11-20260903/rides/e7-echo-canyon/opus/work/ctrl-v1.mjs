// e7-echo-canyon controller v1 — the proven survival skeleton.
// Claim/hero welded at (0,12). Build zone canyon-floor-yard x[-30,30] z[-42,10].
// Roster: rogue_automaton (no wrecker flag) + data_rustler (thief) => nothing wrecks works.
// No twist.secureWave => secure at wave 20 (600.000s = 18000 ticks) => answer pendingSecure
// with a BLANK line so no tape entry lands at tick 18000 (durationTicks stays 18000).

const TURRETS = [
  { x: 0, z: 10 }, { x: -10, z: 9 }, { x: 10, z: 9 },
  { x: -19, z: 6 }, { x: 19, z: 6 }, { x: 0, z: 2 },
  { x: -6, z: 3 }, { x: 6, z: 3 },
];
const BEACONS = [
  { x: -5, z: 10 }, { x: 5, z: 10 }, { x: 0, z: 6 },
  { x: -14, z: 10 }, { x: 14, z: 10 }, { x: -10, z: 1 },
  { x: 10, z: 1 }, { x: 0, z: -3 }, { x: -20, z: 10 }, { x: 20, z: 10 },
];
const TURRET_COSTS = [50, 70, 95, 125];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];

const GOOD = ['plating', 'tinker', 'dressing', 'health', 'hp', 'vital', 'armor', 'armour', 'mend', 'regen', 'heal'];
const OK = ['spark', 'coil', 'tap', 'damage', 'rate', 'volley', 'bolt', 'range'];

function scoreUpgrade(o) {
  const s = ((o.id || '') + ' ' + (o.name || '') + ' ' + (o.effectText || '')).toLowerCase();
  let v = 0;
  for (const k of GOOD) if (s.includes(k)) v += 10;
  for (const k of OK) if (s.includes(k)) v += 3;
  if (s.includes('gold') || s.includes('pan') || s.includes('seam')) v += 1;
  return v;
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

export default function decide(view, state, n) {
  const now = view.now;

  // 1. Terminal secure boundary: blank line, no tape entry, default banks.
  if (now.pendingSecure) return 'BLANK';

  if (!state.init) {
    state.init = true;
    state.bad = new Set();
    state.stall = {};
    state.prevCounts = {};
  }

  const orders = [];

  // 2. Upgrade draft owns the tick (replace semantics: pick first, resend the rest).
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    let best = now.pendingOffer[0], bs = -1;
    for (const o of now.pendingOffer) { const s = scoreUpgrade(o); if (s > bs) { bs = s; best = o; } }
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 3. Ladder: turrets first, then beacons; emitted as a non-decreasing price prefix.
  const entries = (now.works && now.works.entries) || [];
  const byKind = (now.works && now.works.byKind) || {};
  const nT = byKind.turret || 0;
  const nB = byKind.sentry_beacon || 0;

  // stall detection: if a kind's count did not move across views while gold covered its
  // price, blacklist the candidate we were aiming at and try the next one.
  for (const kind of ['turret', 'sentry_beacon']) {
    const c = byKind[kind] || 0;
    if (state.prevCounts[kind] === undefined) state.prevCounts[kind] = c;
    if (c > state.prevCounts[kind]) { state.stall[kind] = 0; state.prevCounts[kind] = c; }
  }

  const occupied = entries.map(e => e.position || e).filter(p => p && typeof p.x === 'number');
  const freeSlots = (cands, want) => {
    const out = [];
    for (const c of cands) {
      if (out.length >= want) break;
      const key = c.x + ',' + c.z;
      if (state.bad.has(key)) continue;
      if (occupied.some(p => dist(p, c) < 3.2)) continue;
      out.push(c);
    }
    return out;
  };

  const ladder = [];
  const tWant = Math.min(4 - nT, 4);
  if (tWant > 0) {
    const slots = freeSlots(TURRETS, tWant);
    for (let i = 0; i < slots.length; i++) {
      ladder.push({ what: 'turret', where: slots[i], cost: TURRET_COSTS[Math.min(nT + i, 3)] });
    }
  }
  const bWant = Math.min(6 - nB, 6);
  if (bWant > 0) {
    const slots = freeSlots(BEACONS, bWant);
    for (let i = 0; i < slots.length; i++) {
      ladder.push({ what: 'sentry_beacon', where: slots[i], cost: BEACON_COSTS[Math.min(nB + i, 5)] });
    }
  }
  // truncate at the first price decrease so a cheap rung can never starve an expensive one
  let last = -1;
  for (const rung of ladder) {
    if (rung.cost < last) break;
    last = rung.cost;
    orders.push({ verb: 'BUILD', what: rung.what, where: { x: rung.where.x, z: rung.where.z }, when: { goldGte: rung.cost } });
    if (orders.length >= 14) break;
  }

  // stall bookkeeping: after 3 views with the money and no new work of that kind, retire slot 0
  if (tWant > 0 && now.gold >= TURRET_COSTS[Math.min(nT, 3)]) {
    state.stall.turret = (state.stall.turret || 0) + 1;
    if (state.stall.turret > 3) {
      const s = freeSlots(TURRETS, 1)[0];
      if (s) state.bad.add(s.x + ',' + s.z);
      state.stall.turret = 0;
    }
  }
  if (tWant <= 0 && bWant > 0 && now.gold >= BEACON_COSTS[Math.min(nB, 5)]) {
    state.stall.sentry_beacon = (state.stall.sentry_beacon || 0) + 1;
    if (state.stall.sentry_beacon > 3) {
      const s = freeSlots(BEACONS, 1)[0];
      if (s) state.bad.add(s.x + ',' + s.z);
      state.stall.sentry_beacon = 0;
    }
  }

  // 4. Economy: stack HARVEST on the nearest active seam with real coordinates.
  const pros = now.prospector || { x: 0, z: 12 };
  const live = (now.seams || []).filter(s => s.active !== false && typeof s.x === 'number' && typeof s.z === 'number');
  live.sort((a, b) => dist(pros, a) - dist(pros, b));
  const seam = live[0];
  if (seam) {
    const room = Math.min(32 - orders.length, 16);
    for (let i = 0; i < room; i++) orders.push({ verb: 'HARVEST', seam: seam.id });
  }

  return orders.slice(0, 32);
}
