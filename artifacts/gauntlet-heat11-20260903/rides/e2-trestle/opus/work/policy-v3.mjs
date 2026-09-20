// e2-trestle controller v3 — v2's ladder stalled forever on one bad turret slot
// (9,-13 never placed), so the phase gate is now count-or-wave and every kind
// carries spare candidate positions.

const MAXO = 32;
const HERO = { x: 12, z: -12 };

const TURRETS = [
  { x: 4, z: -10 }, { x: 4, z: -16 }, { x: -3, z: -13 }, { x: 8, z: -19 },
  { x: 7, z: -9 }, { x: 0, z: -22 }, { x: 10, z: -17 }, { x: -6, z: -17 },
];
const BEACONS = [
  { x: 12, z: -9 }, { x: 16, z: -14 }, { x: 12, z: -18 }, { x: 0, z: -19 },
  { x: 0, z: -8 }, { x: 8, z: -22 }, { x: 16, z: -9 }, { x: 15, z: -18 },
  { x: -6, z: -10 }, { x: 4, z: -25 },
];
const TURRET_COSTS = [50, 70, 95, 125];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];

const FIXED = [...TURRETS, ...BEACONS];
const PALISADES = [];
for (const [r, n] of [[5, 14], [8, 20], [11, 26]]) {
  for (let i = 0; i < n; i += 1) {
    const a = (Math.PI * 2 * i) / n;
    const x = Math.round(HERO.x + r * Math.cos(a));
    const z = Math.round(HERO.z + r * Math.sin(a));
    if (z > -8 || z < -29 || x < -29 || x > 29) continue;
    if (FIXED.some((f) => Math.hypot(f.x - x, f.z - z) < 2.4)) continue;
    if (PALISADES.some((p) => Math.hypot(p.x - x, p.z - z) < 2)) continue;
    PALISADES.push({ x, z });
  }
}

const UP_RANK = [
  'tinkers_plating', 'heavy_spark', 'split_spark', 'double_tap_coil',
  'beacon_dynamo', 'long_resonator', 'prospectors_luck', 'pan_legend',
];
const pickUpgrade = (offer) => (UP_RANK.map((w) => offer.find((o) => o.id === w)).find(Boolean) ?? offer[0]).id;
const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const key = (p) => `${Math.round(p.x)},${Math.round(p.z)}`;

export default function policy(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (now.pendingOffer && now.pendingOffer.length) {
    orders.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer) });
  }
  orders.push({ verb: 'REPAIR_UNDER', pct: 70 });

  const entries = now.works.entries || [];
  const taken = new Set(entries.map((e) => key(e.position)));
  const count = (id) => entries.filter((e) => e.id === id).length;
  const nT = count('turret');
  const nB = count('sentry_beacon');
  const wave = now.wave;

  // One kind at a time so no cheap rung starves an expensive one, but the gate
  // is count OR wave: a slot that refuses placement can no longer stall the run.
  const free = (list) => list.filter((p) => !taken.has(key(p)));
  if (nT < 4 && wave < 7) {
    for (const p of free(TURRETS).slice(0, 3)) {
      orders.push({ verb: 'BUILD', what: 'turret', where: p, when: { goldGte: TURRET_COSTS[Math.min(nT, 3)] } });
    }
  } else if (nB < 6 && wave < 10) {
    for (const p of free(BEACONS).slice(0, 3)) {
      orders.push({ verb: 'BUILD', what: 'sentry_beacon', where: p, when: { goldGte: BEACON_COSTS[Math.min(nB, 5)] } });
    }
    if (nT < 4) {
      for (const p of free(TURRETS).slice(0, 2)) {
        orders.push({ verb: 'BUILD', what: 'turret', where: p, when: { goldGte: TURRET_COSTS[Math.min(nT, 3)] } });
      }
    }
  } else {
    // Surplus sink: 10 g of wood is the cheapest hp in the county and the swarm
    // chews it before the hero.
    for (const p of free(PALISADES).slice(0, 10)) {
      orders.push({ verb: 'BUILD', what: 'palisade', where: p, when: { goldGte: 10 } });
    }
    if (nT < 4) {
      for (const p of free(TURRETS).slice(0, 2)) {
        orders.push({ verb: 'BUILD', what: 'turret', where: p, when: { goldGte: TURRET_COSTS[Math.min(nT, 3)] } });
      }
    }
    if (nB < 6) {
      for (const p of free(BEACONS).slice(0, 2)) {
        orders.push({ verb: 'BUILD', what: 'sentry_beacon', where: p, when: { goldGte: BEACON_COSTS[Math.min(nB, 5)] } });
      }
    }
  }

  const p = now.prospector;
  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const south = live.filter((s) => s.z < 0);
  const pool = (south.length ? south : live).sort((a, b) => d(p, a) - d(p, b));
  if (pool.length) {
    for (let r = 0; r < 8 && orders.length < MAXO; r += 1) {
      const seam = pool[r % pool.length];
      for (let k = 0; k < 6 && orders.length < MAXO; k += 1) {
        orders.push({ verb: 'HARVEST', seam: seam.id });
      }
    }
  }
  return orders.slice(0, MAXO);
}
