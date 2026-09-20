// e2-trestle controller v2.
// THE SECURE IS THE RAILCAR, not the clock: HeadlessContractSim:1095 pins
// autoSecureWaveForRun at MAX_SAFE_INTEGER while `twist.baron && !baronBeaten`.
// So the fort must (a) still be standing at wave 12 and (b) sit on the rail line
// (x = 0, z -46..46, railRouteIndex 0) so four turrets engage the railcar early.

const MAXO = 32;
const HERO = { x: 12, z: -12 };

// Turrets: every one within 16 wu of the rail AND of the stake.
const TURRETS = [
  { x: 4, z: -10 }, { x: 4, z: -16 }, { x: -3, z: -13 }, { x: 9, z: -13 },
];
// Beacons: slow ring over the stake and the rail mouth.
const BEACONS = [
  { x: 12, z: -9 }, { x: 16, z: -14 }, { x: 12, z: -18 },
  { x: 0, z: -19 }, { x: 0, z: -8 }, { x: 8, z: -21 },
];
const TURRET_COSTS = [50, 70, 95, 125];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];

// Palisades: the cheapest HP in the county (10 g, ~108 hp at wave 12) and the
// swarm chews them before the hero. Two rings over the pocket, clipped to zone.
const FIXED = [...TURRETS, ...BEACONS];
const PALISADES = [];
for (const [r, n] of [[5, 14], [8, 20], [11, 26]]) {
  for (let i = 0; i < n; i += 1) {
    const a = (Math.PI * 2 * i) / n;
    const x = Math.round(HERO.x + r * Math.cos(a));
    const z = Math.round(HERO.z + r * Math.sin(a));
    if (z > -8 || z < -29 || x < -29 || x > 29) continue;
    if (FIXED.some((f) => Math.hypot(f.x - x, f.z - z) < 2.2)) continue;
    if (PALISADES.some((p) => Math.hypot(p.x - x, p.z - z) < 2)) continue;
    PALISADES.push({ x, z });
  }
}

const UP_RANK = [
  'tinkers_plating', 'heavy_spark', 'split_spark', 'double_tap_coil',
  'beacon_dynamo', 'long_resonator', 'prospectors_luck', 'pan_legend',
];

function pickUpgrade(offer) {
  for (const want of UP_RANK) {
    const hit = offer.find((o) => o.id === want);
    if (hit) return hit.id;
  }
  return offer[0].id;
}

const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export default function policy(view) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];
  if (now.pendingOffer && now.pendingOffer.length) {
    orders.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer) });
  }
  orders.push({ verb: 'REPAIR_UNDER', pct: 70 });

  const kinds = now.works.byKind || {};
  const nT = kinds.turret || 0;
  const nB = kinds.sentry_beacon || 0;
  const nP = kinds.palisade || 0;

  // One phase at a time: prices inside a phase never fall, so no cheap rung
  // can starve an expensive one (the generation-6 bug).
  if (nT < 4) {
    for (let i = nT; i < 4 && orders.length < 8; i += 1) {
      orders.push({ verb: 'BUILD', what: 'turret', where: TURRETS[i], when: { goldGte: TURRET_COSTS[i] } });
    }
  } else if (nB < 6) {
    for (let i = nB; i < 6 && orders.length < 8; i += 1) {
      orders.push({ verb: 'BUILD', what: 'sentry_beacon', where: BEACONS[i], when: { goldGte: BEACON_COSTS[i] } });
    }
  } else {
    // Surplus sink. Gold pinned at the 200 cap for three waves in v1 was the
    // whole margin thrown away; wood is 10.8 hp per gold at wave 12.
    const standing = new Set((now.works.entries || [])
      .filter((e) => e.id === 'palisade')
      .map((e) => `${Math.round(e.position.x)},${Math.round(e.position.z)}`));
    let emitted = 0;
    for (const p of PALISADES) {
      if (emitted >= 10 || nP >= PALISADES.length) break;
      if (standing.has(`${p.x},${p.z}`)) continue;
      orders.push({ verb: 'BUILD', what: 'palisade', where: p, when: { goldGte: 10 } });
      emitted += 1;
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
