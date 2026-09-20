// e4-dust-flats controller. worldModel: sim-import.
// Secure = boss kill (Land-Yacht w14) AND motor haul arrived at the railhead (0,72).

const HAUL_STOP = { x: 0, z: 72 };
const ROAD_START = { x: 0, z: 12 };
const CORRIDOR = 'camp-to-railhead';

const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const mv = (x, z) => ({ verb: 'MOVE_TO', pos: { x, z } });

// Turrets ringed to cover the Land-Yacht's orbit (centre 0,0 radius 24) and the claim (0,8).
const TURRETS = [
  { x: 13, z: 13 }, { x: -13, z: 13 }, { x: 13, z: -13 }, { x: -13, z: -13 },
  { x: 18, z: 4 }, { x: -18, z: 4 }, { x: 6, z: 18 }, { x: -6, z: 18 },
  { x: 8, z: -17 }, { x: -8, z: -17 },
];
const TURRET_COST = [50, 70, 95, 125];

const BEACONS = [
  { x: 4, z: 16 }, { x: -4, z: 16 }, { x: 15, z: 0 }, { x: -15, z: 0 },
  { x: 6, z: -14 }, { x: -6, z: -14 }, { x: 0, z: 20 }, { x: 10, z: 8 }, { x: -10, z: 8 },
];
const BEACON_COST = [25, 35, 45, 55, 75, 95];

const PALIS = [];
for (const a of [0, 45, 90, 135, 180, 225, 270, 315]) {
  const r = 7, t = (a * Math.PI) / 180;
  PALIS.push({ x: Math.round(r * Math.cos(t)), z: 8 + Math.round(r * Math.sin(t)) });
}

function occupied(entries, kind, p) {
  return entries.some((e) => e.id === kind && Math.hypot(e.position.x - p.x, e.position.z - p.z) < 2.0);
}

function upgradePick(offer) {
  const score = (o) => {
    const s = ((o.name || '') + ' ' + (o.effectText || '') + ' ' + (o.id || '')).toLowerCase();
    let v = 0;
    if (/plating|health|max hp|maxhp|vigou|hearty|tough|armor|armour/.test(s)) v += 100;
    if (/heal|regen|mend/.test(s)) v += 60;
    if (/damage|spark|coil|tap|power|bolt/.test(s)) v += 40;
    if (/range|reach/.test(s)) v += 25;
    if (/turret|beacon|works|structure/.test(s)) v += 30;
    if (/speed|haste/.test(s)) v += 10;
    return v;
  };
  let best = offer[0];
  for (const o of offer) if (score(o) > score(best)) best = o;
  return best;
}

// Dwell over a tar node: approach, nudge, return — buys >0.5s inside harvestRange 1.35.
function dwell(n) {
  return [mv(n.x, n.z), mv(n.x + 0.9, n.z), mv(n.x, n.z), mv(n.x, n.z + 0.9), mv(n.x, n.z)];
}

function motorOrders(now, state) {
  const m = now.motor;
  if (!m || m.objective.arrived) return [];
  const out = [];
  const pro = now.prospector;
  const have = m.fuel.stored + m.fuel.tar * 4;
  const un = m.fuel.nodes.filter((n) => !n.harvested);
  // 20 fuel covers the staged + graded run (~13) with margin for a storm.
  if (have < 20 && un.length) {
    const sorted = [...un].sort((a, b) => d(pro, a) - d(pro, b));
    let projected = have;
    for (const n of sorted) {
      if (projected >= 20) break;
      out.push(...dwell(n));
      projected += 12;
    }
  }
  const graded = (m.roads.graded || []).includes(CORRIDOR);
  const v = m.vehicle;
  const staged = d(v, ROAD_START) <= 3.0;
  if (!graded || !staged) {
    out.push(mv(ROAD_START.x, ROAD_START.z));
    if (!graded) out.push({ verb: 'GRADE' });
    if (!staged) out.push({ verb: 'HAUL' });
  }
  if (state.fuelReady || have >= 12) {
    out.push(mv(HAUL_STOP.x, HAUL_STOP.z));
    out.push({ verb: 'HAUL' });
  }
  return out;
}

function buildOrders(now) {
  const w = now.works;
  const entries = w.entries || [];
  const nT = w.byKind.turret || 0;
  const nB = w.byKind.sentry_beacon || 0;
  const nP = w.byKind.palisade || 0;
  const out = [];
  // Turrets first: 57 dps at 16wu is the only thing that reaches the orbit ring.
  if (nT < 4) {
    let slot = nT;
    let placed = 0;
    for (const p of TURRETS) {
      if (slot >= 4 || placed >= 3) break;
      if (occupied(entries, 'turret', p)) continue;
      out.push({ verb: 'BUILD', what: 'turret', where: p, when: { goldGte: TURRET_COST[slot] } });
      slot += 1; placed += 1;
    }
  }
  if (nT >= 2 && nB < 6) {
    let slot = nB, placed = 0;
    for (const p of BEACONS) {
      if (slot >= 6 || placed >= 2) break;
      if (occupied(entries, 'sentry_beacon', p)) continue;
      out.push({ verb: 'BUILD', what: 'sentry_beacon', where: p, when: { goldGte: BEACON_COST[slot] + (nT < 4 ? TURRET_COST[nT] : 0) } });
      slot += 1; placed += 1;
    }
  }
  if (nT >= 3 && nP < 10) {
    let placed = 0;
    for (const p of PALIS) {
      if (placed >= 3) break;
      if (occupied(entries, 'palisade', p)) continue;
      out.push({ verb: 'BUILD', what: 'palisade', where: p, when: { goldGte: 140 } });
      placed += 1;
    }
  }
  return out;
}

function harvestOrders(now, budget) {
  const live = (now.seams || []).filter((s) => s.active && s.x !== null && s.remaining > 0);
  if (!live.length || budget <= 0) return [];
  const pro = now.prospector;
  live.sort((a, b) => d(pro, a) - d(pro, b));
  const seam = live[0];
  const out = [];
  for (let i = 0; i < budget; i += 1) out.push({ verb: 'HARVEST', seam: seam.id });
  return out;
}

export function decide(view, state, idx) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const out = [];
  if (now.pendingOffer && now.pendingOffer.length) {
    out.push({ verb: 'PICK_UPGRADE', id: upgradePick(now.pendingOffer).id });
  }
  const motor = motorOrders(now, state);
  out.push(...motor.slice(0, 22));
  const done = !now.motor || now.motor.objective.arrived;
  if (done) {
    out.push(...buildOrders(now));
    out.push({ verb: 'REPAIR_UNDER', pct: 55 });
  }
  const budget = Math.max(0, 32 - out.length);
  out.push(...harvestOrders(now, Math.min(budget, done ? 12 : 6)));
  return out.slice(0, 32);
}
