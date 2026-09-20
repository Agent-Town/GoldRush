// Twin Banks controller v1 — claude-opus-5, generation 7.
// World model: sim-import.
//
// Map facts (read from source, not guessed):
//  - The HERO never moves (HeadlessContractSim IDLE_INTENTS); it stands on the loss
//    stake at (0,-12) and every enemy walks at it. The PROSPECTOR is the order actor
//    (Embodiment.ts:131) and is never targeted, so panning far away is free.
//  - River band z in [-5,5] blocks enemies (Balance.pathing.riverBlocksEnemies);
//    the two fords at x=-16 and x=+16 (halfWidth 3) are the only north crossings.
//  - Buildable = zone 'bank' (|z| > 6.25) AND inside a buildZone (z<=-7 or z>=7, |x|<=28).
//  - Sluice needs isWaterSourceAdjacent(pad 2) => |z| <= 7, so z = -7 exactly on the
//    south bank. 3g / 5s each, passive.
//  - HARVEST advances one 1.5s pan tick per ORDER EXECUTION => 5 gold per order,
//    one order per sim tick. Seam capacity 30 => 6 pans, then a 20s respawn.

const CLAIM = { x: 0, z: -12 };

// Defence ladder. Each rung: what, where, price (the buildables[].costs curve).
const LADDER = [
  { what: 'sentry_beacon', where: { x: 0, z: -9 }, cost: 25 },
  { what: 'turret', where: { x: -5, z: -13 }, cost: 50 },
  { what: 'sluice', where: { x: -8, z: -7 }, cost: 40 },
  { what: 'turret', where: { x: 5, z: -13 }, cost: 70 },
  { what: 'sluice', where: { x: 8, z: -7 }, cost: 40 },
  { what: 'sentry_beacon', where: { x: 0, z: -15 }, cost: 35 },
  { what: 'turret', where: { x: 0, z: -8 }, cost: 95 },
  { what: 'sluice', where: { x: 0, z: -7 }, cost: 40 },
  { what: 'sentry_beacon', where: { x: -6, z: -10 }, cost: 45 },
  { what: 'turret', where: { x: 0, z: -18 }, cost: 125 },
  { what: 'sentry_beacon', where: { x: 6, z: -10 }, cost: 55 },
  { what: 'sentry_beacon', where: { x: -4, z: -16 }, cost: 75 },
  { what: 'sentry_beacon', where: { x: 4, z: -16 }, cost: 95 },
];

// Upgrade preference. Healing first when the hero is hurt, then raw hero dps.
const OFFENSE = [
  'split_spark',
  'heavy_spark',
  'double_tap_coil',
  'tinkers_plating',
  'beacon_dynamo',
  'long_resonator',
  'prospectors_luck',
  'sharpen',
  'assay_bonus',
  'pan_legend',
  'spring_heels',
];
const HEALS = ['tinkers_plating', 'field_dressing'];

const built = [];        // ladder rungs already placed, by index
let failedSites = new Set();

function pickUpgrade(now) {
  const offer = now.pendingOffer;
  if (!offer || !offer.length) return null;
  const ids = offer.map((o) => o.id);
  const hurt = now.hero.hp / now.hero.maxHp < 0.6;
  const order = hurt ? [...HEALS, ...OFFENSE] : OFFENSE;
  for (const id of order) if (ids.includes(id)) return id;
  return ids[0];
}

function nextRung(now) {
  const counts = now.works.byKind || {};
  const placed = { sentry_beacon: 0, turret: 0, sluice: 0 };
  for (const k of Object.keys(placed)) placed[k] = counts[k] || 0;
  const used = { sentry_beacon: 0, turret: 0, sluice: 0 };
  for (let i = 0; i < LADDER.length; i += 1) {
    const rung = LADDER[i];
    const key = `${rung.what}:${rung.where.x},${rung.where.z}`;
    if (failedSites.has(key)) continue;
    used[rung.what] += 1;
    if (used[rung.what] <= placed[rung.what]) continue; // already standing
    return rung;
  }
  return null;
}

// Greedy nearest-first chain over the live seams, 6 pans apiece (capacity 30 / 5g).
function harvestChain(now, budget) {
  const live = (now.seams || []).filter((s) => s.active && s.x !== null);
  if (!live.length) return [];
  let from = now.prospector || CLAIM;
  const orders = [];
  const pool = live.map((s) => ({ ...s }));
  while (orders.length < budget && pool.length) {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < pool.length; i += 1) {
      const d = Math.hypot(pool[i].x - from.x, pool[i].z - from.z);
      if (d < bestD) { bestD = d; best = i; }
    }
    const seam = pool.splice(best, 1)[0];
    from = seam;
    const pans = Math.min(6, budget - orders.length);
    for (let i = 0; i < pans; i += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
    if (!pool.length && orders.length < budget) {
      // second sweep: seams refill on a 20s respawn, so revisit in the same array
      for (const s of live) pool.push({ ...s });
    }
  }
  return orders;
}

export default function policy(view) {
  const now = view.now;

  // The secure boundary owns the tick entirely: every other record is skipped while
  // pendingSecure is set (StandingOrders.ts:210).
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  // Record any build that failed so the ladder steps past a bad site.
  for (const rec of now.orders || []) {
    if (rec.status === 'failed' && rec.order && rec.order.verb === 'BUILD') {
      const o = rec.order;
      if (/UNREACHABLE|out_of_zone|collision|cap_reached/.test(rec.reason || '')) {
        failedSites.add(`${o.what}:${o.where.x},${o.where.z}`);
      }
    }
  }

  const orders = [];
  const up = pickUpgrade(now);
  if (up) orders.push({ verb: 'PICK_UPGRADE', id: up });

  const rung = nextRung(now);
  if (rung) orders.push({ verb: 'BUILD', what: rung.what, where: rung.where, when: { goldGte: rung.cost } });

  orders.push({ verb: 'REPAIR_UNDER', pct: 55 });
  orders.push({ verb: 'REPAIR_UNDER', pct: 55 });

  orders.push(...harvestChain(now, 32 - orders.length));
  return orders.slice(0, 32);
}
