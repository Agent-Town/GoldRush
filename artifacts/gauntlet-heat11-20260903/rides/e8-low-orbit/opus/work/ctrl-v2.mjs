// Generation 35 — e8-low-orbit controller v2.
// v1 reached wave 18/550.9s with the ladder finished at wave 10 and gold PINNED at the 200 cap
// from wave 12: eight waves of income poured into a ceiling while the hero bled out from wave 16.
// v2 spends that surplus on the only sink the board offers — turret tier 2 (150g, x1.4 damage
// x1.18 fire rate = x1.65 dps) — via MOVE_TO + CONTEXT_ACTION, because CONTEXT_ACTION does not
// travel (gen-29). Also: a failed-coordinate blacklist, because (0,2) is outside buildable
// terrain here and v1's sixth beacon parked on it for eight waves.

const HERO = { x: 0, z: 12 };

const TURRET_SPOTS = [
  { x: -10, z: 12 }, { x: 10, z: 12 }, { x: -15, z: 12 }, { x: 15, z: 12 },
  { x: -5, z: 7 }, { x: 5, z: 7 }, { x: 0, z: 7 }, { x: -10, z: 7 }, { x: 10, z: 7 },
  { x: -5, z: 14 }, { x: 5, z: 14 }, { x: -15, z: 7 }, { x: 15, z: 7 },
];
const BEACON_SPOTS = [
  { x: -5, z: 12 }, { x: 5, z: 12 }, { x: 0, z: 7 }, { x: -10, z: 7 }, { x: 10, z: 7 },
  { x: 0, z: 14 }, { x: -15, z: 7 }, { x: 15, z: 7 }, { x: -5, z: 14 }, { x: 5, z: 14 },
  { x: -10, z: 14 }, { x: 10, z: 14 },
];

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

const TURRET_TIER_COST = [0, 150, 300];

const PLATING = /plating|vitality|hearty|tough|armor|armour|health|hp|constitution/i;
const DAMAGE = /spark|damage|coil|tap|volley|bolt|power|heavy/i;

const blacklist = new Set();
const key = (s) => `${s.x},${s.z}`;

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

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const occupied = (entries, spot) => entries.some((e) => e.position && dist(e.position, spot) < 3);

function learnRefusals(now) {
  for (const rec of now.orders || []) {
    if (rec.status !== 'failed') continue;
    const o = rec.order;
    if (!o || o.verb !== 'BUILD' || !o.where) continue;
    blacklist.add(key(o.where));
  }
}

export default function controller(view) {
  const now = view.now;
  if (now.pendingSecure) return null; // blank line: default the bank, keep durationTicks at the cap

  learnRefusals(now);

  const orders = [];
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length > 0) {
    orders.push({ verb: 'PICK_UPGRADE', id: scorePick(now.pendingOffer) });
  }

  const works = now.works || {};
  const entries = Array.isArray(works.entries) ? works.entries : [];
  const byKind = works.byKind || {};
  const built = { turret: byKind.turret || 0, sentry_beacon: byKind.sentry_beacon || 0 };

  const seen = { turret: 0, sentry_beacon: 0 };
  const batch = [];
  let lastCost = -1;
  for (const rung of LADDER) {
    seen[rung.what] += 1;
    if (seen[rung.what] <= built[rung.what]) continue;
    if (rung.cost < lastCost) break;
    lastCost = rung.cost;
    const pool = rung.what === 'turret' ? TURRET_SPOTS : BEACON_SPOTS;
    const spot = pool.find((s) => !blacklist.has(key(s)) && !occupied(entries, s)
      && !batch.some((b) => dist(b.where, s) < 3));
    if (!spot) continue;
    batch.push({ verb: 'BUILD', what: rung.what, where: { x: spot.x, z: spot.z }, when: { goldGte: rung.cost } });
    if (batch.length >= 5) break;
  }
  orders.push(...batch);

  // The surplus sink. CONTEXT_ACTION fires the instant the record is reached and never travels,
  // so it is always paired with a MOVE_TO onto the work, and only emitted when the gold is
  // already in hand (plan-time affordability — a pending gate would fire at an arbitrary tick).
  const prospector = now.prospector || HERO;
  const upgradable = entries
    .filter((e) => e.id === 'turret' && !e.wrecked && e.tier < 3
      && now.gold >= TURRET_TIER_COST[e.tier])
    .sort((a, b) => (a.tier - b.tier) || (dist(prospector, a.position) - dist(prospector, b.position)));
  if (upgradable.length > 0) {
    const t = upgradable[0];
    orders.push({ verb: 'MOVE_TO', pos: { x: t.position.x, z: t.position.z } });
    orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: t.index } });
  }

  orders.push({ verb: 'REPAIR_UNDER', pct: 60 });

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
