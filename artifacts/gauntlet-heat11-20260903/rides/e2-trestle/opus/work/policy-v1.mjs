// e2-trestle controller v1 — the pocket at the south boiler site.
// Stake/hero (12,-12); south buildZone x[-30,30] z[-30,-7]; nearest gold anchor (24,-20).

const MAXO = 32;

// Ladder: strictly non-decreasing price so no cheap rung can starve an expensive one.
// Turrets first (57 dps / 50 g) then the beacon ring (slow + fill).
const LADDER = [
  { what: 'turret',        where: { x: 16, z: -12 }, cost: 50 },
  { what: 'turret',        where: { x: 8,  z: -12 }, cost: 70 },
  { what: 'turret',        where: { x: 12, z: -16 }, cost: 95 },
  { what: 'turret',        where: { x: 12, z: -8  }, cost: 125 },
  { what: 'sentry_beacon', where: { x: 16, z: -16 }, cost: 25 },
  { what: 'sentry_beacon', where: { x: 8,  z: -16 }, cost: 35 },
  { what: 'sentry_beacon', where: { x: 16, z: -8  }, cost: 45 },
  { what: 'sentry_beacon', where: { x: 8,  z: -8  }, cost: 55 },
  { what: 'sentry_beacon', where: { x: 20, z: -12 }, cost: 75 },
  { what: 'sentry_beacon', where: { x: 4,  z: -12 }, cost: 95 },
];

const UP_RANK = ['tinkers_plating', 'heavy_spark', 'double_tap_coil'];

function pickUpgrade(offer) {
  for (const want of UP_RANK) {
    const hit = offer.find((o) => o.id === want);
    if (hit) return hit.id;
  }
  const byText = offer.find((o) => /max hp|health|damage/i.test(o.effectText || ''));
  return (byText ?? offer[0]).id;
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

export default function policy(view) {
  const now = view.now;

  // The secure window takes exactly one order and refuses anything beside it.
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];

  // The draft first: replace semantics apply to it too, so it must own the tick.
  if (now.pendingOffer && now.pendingOffer.length) {
    orders.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(now.pendingOffer) });
  }

  // Conditional worker: falls through for free when nothing qualifies.
  orders.push({ verb: 'REPAIR_UNDER', pct: 60 });

  // Ladder: count what stands, emit the remaining prefix while prices do not fall.
  const built = { ...(now.works.byKind || {}) };
  const remaining = [];
  for (const rung of LADDER) {
    if (built[rung.what] > 0) { built[rung.what] -= 1; continue; }
    remaining.push(rung);
  }
  let last = -1;
  for (const rung of remaining) {
    if (rung.cost < last) break;
    last = rung.cost;
    orders.push({ verb: 'BUILD', what: rung.what, where: rung.where, when: { goldGte: rung.cost } });
    if (orders.length >= 6) break;
  }

  // Income: a worklist of pan ticks over the nearest live seams, south bank preferred.
  const p = now.prospector;
  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const south = live.filter((s) => s.z < 0);
  const pool = (south.length ? south : live).sort((a, b) => dist(p, a) - dist(p, b));
  if (pool.length) {
    const chain = [];
    const rounds = 6;
    for (let r = 0; r < rounds; r += 1) {
      const seam = pool[r % pool.length];
      for (let k = 0; k < 6; k += 1) chain.push({ verb: 'HARVEST', seam: seam.id });
    }
    for (const o of chain) {
      if (orders.length >= MAXO) break;
      orders.push(o);
    }
  }

  return orders.slice(0, MAXO);
}
