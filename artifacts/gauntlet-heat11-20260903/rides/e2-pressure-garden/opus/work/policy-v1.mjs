// The Pressure Garden controller, v1.
// Skeleton carried from gen-5..8: PICK_UPGRADE first (replace semantics), conditional
// orders above the unconditional worker, a price-ordered ladder emitted as one
// non-decreasing prefix so a cheap rung can never starve an expensive one, then the
// remaining slots stacked with HARVEST on the nearest live seam.

const MAX_ORDERS = 32;

// The loss stake / fixed hero sits at (-12,12) inside buildZone `boiler-terrace`
// (x -36..36, z 7..16). Everything is placed in that one pocket.
const TURRETS = [
  { x: -12, z: 9 },
  { x: -17, z: 13 },
  { x: -7, z: 13 },
  { x: -12, z: 16 },
];
const BEACONS = [
  { x: -15, z: 10 },
  { x: -9, z: 10 },
  { x: -15, z: 15 },
  { x: -9, z: 15 },
  { x: -20, z: 12 },
  { x: -2, z: 12 },
];

const TURRET_COSTS = [50, 70, 95, 125];
const BEACON_COSTS = [25, 35, 45, 55, 75, 95];

// Survival is the binding constraint on a map whose idle hero dies in wave 1.
const UPGRADE_PREF = [
  'tinkers_plating', 'heavy_spark', 'double_tap_coil', 'split_spark',
  'quick_hands', 'long_resonator', 'seam_sense', 'prospectors_luck',
];

function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

function ladder(byKind) {
  const t = byKind.turret ?? 0;
  const b = byKind.sentry_beacon ?? 0;
  const rungs = [];
  for (let i = t; i < TURRETS.length; i += 1) {
    rungs.push({ what: 'turret', where: TURRETS[i], cost: TURRET_COSTS[i] });
  }
  for (let i = b; i < BEACONS.length; i += 1) {
    rungs.push({ what: 'sentry_beacon', where: BEACONS[i], cost: BEACON_COSTS[i] });
  }
  // Truncate at the first price decrease: within one array the rungs must be
  // non-decreasing, or the cheap one fires first and starves the dear one.
  const out = [];
  for (const rung of rungs) {
    if (out.length && rung.cost < out[out.length - 1].cost) break;
    out.push(rung);
  }
  return out;
}

export default function policy(view) {
  const now = view.now;

  // The secure window accepts EXACTLY one order and nothing else.
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];

  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const ids = now.pendingOffer.map((o) => o.id);
    const pick = UPGRADE_PREF.find((id) => ids.includes(id)) ?? ids[0];
    orders.push({ verb: 'PICK_UPGRADE', id: pick });
  }

  for (const rung of ladder(now.works?.byKind ?? {})) {
    if (orders.length >= MAX_ORDERS - 2) break;
    orders.push({ verb: 'BUILD', what: rung.what, where: rung.where, when: { goldGte: rung.cost } });
  }

  orders.push({ verb: 'REPAIR_UNDER', pct: 60 });

  const from = now.prospector ?? now.hero;
  const live = (now.seams ?? []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  live.sort((a, b) => dist(from, a) - dist(from, b));
  const chain = live.length ? live : [];
  let i = 0;
  while (orders.length < MAX_ORDERS && chain.length) {
    orders.push({ verb: 'HARVEST', seam: chain[Math.min(i, 0)].id });
    i += 1;
  }

  return orders;
}
