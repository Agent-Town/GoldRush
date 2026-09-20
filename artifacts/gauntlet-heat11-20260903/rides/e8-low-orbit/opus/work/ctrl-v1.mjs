// Generation 35 — e8-low-orbit controller v1.
// The gen 6->31 skeleton: pick first (replace semantics), one non-decreasing-price BUILD batch,
// slot-skipper with more candidates than slots, plating-first upgrade scorer, stacked HARVEST tail,
// blank-line secure (the manifest declares no twist.secureWave -> wave 20 / 18000-tick envelope).

const HERO = { x: 0, z: 12 };

// claw-carcass-yard is x -18..18, z -14..14 and the claim sits inside it. 5wu grid, well clear of
// every overlapRadius (turret 2.4 / beacon 2.2), so a refusal means zone or reach, never spacing.
const TURRET_SPOTS = [
  { x: -10, z: 12 }, { x: 10, z: 12 }, { x: -15, z: 12 }, { x: 15, z: 12 },
  { x: -5, z: 7 }, { x: 5, z: 7 }, { x: 0, z: 7 }, { x: -10, z: 7 }, { x: 10, z: 7 }, { x: 0, z: 2 },
];
const BEACON_SPOTS = [
  { x: -5, z: 12 }, { x: 5, z: 12 }, { x: 0, z: 7 }, { x: -10, z: 7 }, { x: 10, z: 7 },
  { x: 0, z: 2 }, { x: -15, z: 7 }, { x: 15, z: 7 }, { x: -5, z: 2 }, { x: 5, z: 2 },
];

// One early beacon, then the turret ladder, then the rest of the beacons. Prices are
// non-decreasing inside each batch, so a cheap rung can never steal an expensive rung's tick.
const LADDER = [
  { what: 'sentry_beacon', cost: 25 },
  { what: 'turret', cost: 50 },
  { what: 'turret', cost: 70 },
  { what: 'turret', cost: 95 },
  { what: 'turret', cost: 125 },
  { what: 'sentry_beacon', cost: 35 },
  { what: 'sentry_beacon', cost: 45 },
  { what: 'sentry_beacon', cost: 55 },
  { what: 'sentry_beacon', cost: 75 },
  { what: 'sentry_beacon', cost: 95 },
];

const PLATING = /plating|vitality|hearty|tough|armor|armour|health|hp|constitution/i;
const DAMAGE = /spark|damage|coil|tap|volley|bolt|power|heavy/i;

function scorePick(offer) {
  let best = offer[0], bestScore = -1;
  for (const o of offer) {
    const text = `${o.id} ${o.name} ${o.effectText || ''}`;
    let s = 0;
    if (PLATING.test(text)) s += 10;
    if (DAMAGE.test(text)) s += 5;
    if (/repair|regen/i.test(text)) s += 3;
    if (s > bestScore) { bestScore = s; best = o; }
  }
  return best.id;
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

// A spot is taken if any standing work sits within 3wu of it.
function occupied(entries, spot) {
  return entries.some((e) => e.position && dist(e.position, spot) < 3);
}

export default function controller(view) {
  const now = view.now;
  // Blank line at the secure boundary: gr-sim records no entry, so durationTicks stays at the
  // envelope instead of one tick over it (gens 30/31).
  if (now.pendingSecure) return null;

  const orders = [];
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length > 0) {
    orders.push({ verb: 'PICK_UPGRADE', id: scorePick(now.pendingOffer) });
  }

  const works = now.works || {};
  const entries = Array.isArray(works.entries) ? works.entries : [];
  const byKind = works.byKind || {};
  const built = { turret: byKind.turret || 0, sentry_beacon: byKind.sentry_beacon || 0 };

  // Walk the ladder to the first unbuilt rung, then emit a non-decreasing-price prefix.
  const seen = { turret: 0, sentry_beacon: 0 };
  const batch = [];
  let lastCost = -1;
  for (const rung of LADDER) {
    seen[rung.what] += 1;
    if (seen[rung.what] <= built[rung.what]) continue; // already standing
    if (rung.cost < lastCost) break;                   // cut at the first price decrease
    lastCost = rung.cost;
    const pool = rung.what === 'turret' ? TURRET_SPOTS : BEACON_SPOTS;
    const spot = pool.find((s) => !occupied(entries, s) && !batch.some((b) => dist(b.where, s) < 3));
    if (!spot) continue;
    batch.push({ verb: 'BUILD', what: rung.what, where: { x: spot.x, z: spot.z }, when: { goldGte: rung.cost } });
    if (batch.length >= 5) break;
  }
  orders.push(...batch);

  // Falls through for free when nothing qualifies; the only thing that can hurt a work here is a
  // returning lob of my own (no enemy on this roster carries `wrecker`).
  orders.push({ verb: 'REPAIR_UNDER', pct: 60 });

  // Income tail. Seams re-anchor between waves, so recompute nearest live each view; stack deep on
  // the nearest (gen-15: stack when the commute is real), then spill onto the next two.
  const prospector = now.prospector || HERO;
  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  live.sort((a, b) => dist(prospector, a) - dist(prospector, b));
  const slots = 32 - orders.length;
  const plan = [];
  if (live.length > 0) {
    const share = [Math.ceil(slots * 0.6), Math.ceil(slots * 0.25), slots];
    for (let i = 0; i < live.length && plan.length < slots; i += 1) {
      const n = Math.min(share[Math.min(i, 2)], slots - plan.length);
      for (let k = 0; k < n; k += 1) plan.push({ verb: 'HARVEST', seam: live[i].id });
    }
  }
  orders.push(...plan.slice(0, slots));

  return orders.slice(0, 32);
}
