// ctrl-v1 — the-claim / e1-the-claim-01 / trail
//
// THESIS (the era's signature mechanic, read straight):
//   Balance.economy.bankCap = 200 and Economy refuses a credit once gold is at the cap.
//   The ranked `gold` is cumulative EARNINGS, not the purse. So a full purse does not merely
//   waste surplus, it SWITCHES THE ECONOMY OFF (gen-45). The winning line is therefore:
//   pan at maximum throughput AND keep the purse well under the cap by spending continuously,
//   while raising the cap with stockpiles. Every buildable is a sink; palisades are an
//   effectively unbounded one (10g x 48).
//
// Skeleton: gen-6 -> gen-53. PICK_UPGRADE first (replace semantics); a plan-time-affordable
// cumulatively-gated ladder; more candidates than slots with a GROUND-only refusal blacklist
// (never blacklist on insufficient_gold — gen-51); harvest tail drained one seam at a time in
// blocks; terminal HOLD that cannot be filtered away (gen-42); blank line at the secure boundary.

const CLAIM = { x: 0, z: 12 };
const MAXSLOTS = 32;

// --- fort geometry -------------------------------------------------------
// Hero is welded at the claim; enemies converge from all four edges. River occupies
// z in [-5,5] (halfWidth 5) so the north bank z>5 is the buildable side holding the claim.
// turret range 16, beacon radius 8.
const TURRET_SPOTS = [
  { x: -6, z: 12 }, { x: 6, z: 12 }, { x: 0, z: 18 }, { x: 0, z: 7 },
  { x: -9, z: 16 }, { x: 9, z: 16 }, { x: -9, z: 8 }, { x: 9, z: 8 },
];
const BEACON_SPOTS = [
  { x: 0, z: 15 }, { x: -3, z: 9 }, { x: 3, z: 9 }, { x: -4, z: 16 },
  { x: 4, z: 16 }, { x: 0, z: 11 }, { x: -7, z: 14 }, { x: 7, z: 14 },
  { x: -2, z: 19 }, { x: 2, z: 19 },
];
// sluices want water adjacency (pad ~2 outside the river edge at |z|=5) AND build ground.
const SLUICE_SPOTS = [
  { x: -14, z: 6.5 }, { x: 14, z: 6.5 }, { x: -20, z: 6.5 }, { x: 20, z: 6.5 },
  { x: -14, z: 6 }, { x: 14, z: 6 }, { x: -17, z: 7 }, { x: 17, z: 7 },
];
const STOCKPILE_SPOTS = [
  { x: -12, z: 20 }, { x: 12, z: 20 }, { x: -15, z: 17 }, { x: 15, z: 17 },
];
const ASSAY_SPOTS = [{ x: 0, z: 23 }, { x: -5, z: 22 }, { x: 5, z: 22 }];
// palisade ring: pure gold sink + chaff. Kept off the turret/beacon coordinates.
const PALISADE_SPOTS = [];
for (const r of [21, 23, 25]) {
  for (let a = 0; a < 12; a++) {
    const th = (a / 12) * Math.PI * 2;
    const x = +(Math.cos(th) * (r - 12)).toFixed(2);
    const z = +(12 + Math.sin(th) * (r - 12)).toFixed(2);
    if (z > 6) PALISADE_SPOTS.push({ x, z });
  }
}

// --- the ladder ----------------------------------------------------------
// Defence first (turret 57dps beats beacon ~30dps), sluices early because they ADD income,
// stockpiles to lift the cap, then everything else purely as a sink so the purse never pins.
const LADDER = [
  { id: 'turret', cost: 50, spots: TURRET_SPOTS },
  { id: 'sentry_beacon', cost: 25, spots: BEACON_SPOTS },
  { id: 'turret', cost: 70, spots: TURRET_SPOTS },
  { id: 'sluice', cost: 40, spots: SLUICE_SPOTS },
  { id: 'turret', cost: 95, spots: TURRET_SPOTS },
  { id: 'sentry_beacon', cost: 35, spots: BEACON_SPOTS },
  { id: 'sluice', cost: 40, spots: SLUICE_SPOTS },
  { id: 'turret', cost: 125, spots: TURRET_SPOTS },
  { id: 'sluice', cost: 40, spots: SLUICE_SPOTS },
  { id: 'stockpile', cost: 60, spots: STOCKPILE_SPOTS },
  { id: 'stockpile', cost: 60, spots: STOCKPILE_SPOTS },
  { id: 'sentry_beacon', cost: 45, spots: BEACON_SPOTS },
  { id: 'sentry_beacon', cost: 55, spots: BEACON_SPOTS },
  { id: 'assay_office', cost: 80, spots: ASSAY_SPOTS },
  { id: 'sentry_beacon', cost: 75, spots: BEACON_SPOTS },
  { id: 'sentry_beacon', cost: 95, spots: BEACON_SPOTS },
];
for (let i = 0; i < 40; i++) LADDER.push({ id: 'palisade', cost: 10, spots: PALISADE_SPOTS });

const PLATING = ['tinkers_plating', 'field_dressing', 'iron_lining', 'second_wind'];
const DAMAGE = ['heavy_spark', 'double_tap_coil', 'split_spark', 'quick_coil', 'long_barrel'];

function scoreOffer(o) {
  const id = (o.id || '').toLowerCase();
  const txt = ((o.name || '') + ' ' + (o.effectText || '')).toLowerCase();
  if (PLATING.includes(id)) return 100;
  if (/health|hp|plating|armor|armour|heal|dressing|vitality/.test(txt)) return 90;
  if (DAMAGE.includes(id)) return 60;
  if (/damage|spark|bolt|fire rate|pierce|coil/.test(txt)) return 55;
  if (/gold|pan|seam|assay|prospect/.test(txt)) return 40;
  return 10;
}

const GROUND_REFUSALS = ['out_of_zone', 'collision', 'out_of_reach', 'cap_reached', 'unreachable', 'buildable terrain'];

export default function controller(view, S, viewNo) {
  const now = view.now || {};

  // --- secure boundary: answer with a blank line. The configured default is `bank`,
  //     it costs no tape entry, and it keeps the last accepted order inside the envelope.
  if (now.pendingSecure) return null;

  S.blacklist ||= new Set();
  S.tries ||= {};

  // harvest a GROUND-class refusal into the blacklist; never blacklist on money (gen-51).
  for (const rec of (now.orders || [])) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || rec;
    if (o.verb !== 'BUILD' || !o.where) continue;
    const why = ((rec.reason || '') + ' ' + (rec.detail || '')).toLowerCase();
    const key = `${o.what}@${o.where.x},${o.where.z}`;
    if (GROUND_REFUSALS.some((g) => why.includes(g))) S.blacklist.add(key);
    else { S.tries[key] = (S.tries[key] || 0) + 1; if (S.tries[key] > 8) S.blacklist.add(key); }
  }

  const orders = [];

  // 1. draft first — replace semantics mean the pick must own the array's head.
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreOffer(b) - scoreOffer(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. the ladder: walk it in order, count what already stands, emit only rungs we can
  //    already pay for, cumulatively gated so a cheap rung can never steal from an
  //    expensive one waiting behind it.
  const byKind = now.works?.byKind || {};
  const entries = now.works?.entries || [];
  const standing = {};
  for (const [k, v] of Object.entries(byKind)) standing[k] = v;
  const used = new Set(entries.map((e) => `${e.x ?? e.position?.x},${e.z ?? e.position?.z}`));
  const placed = {};
  let cum = 0;
  let emitted = 0;
  const gold = now.gold ?? 0;

  for (const rung of LADDER) {
    if (emitted >= 8) break;
    const have = (standing[rung.id] || 0) + (placed[rung.id] || 0);
    const idx = have;
    placed[rung.id] = (placed[rung.id] || 0) + 1;
    // this rung is already standing -> skip, do not spend a slot
    if (idx < (standing[rung.id] || 0)) continue;
    // pick the first candidate spot not blacklisted and not already occupied
    let spot = null;
    for (const s of rung.spots) {
      const key = `${rung.id}@${s.x},${s.z}`;
      if (S.blacklist.has(key)) continue;
      if (used.has(`${s.x},${s.z}`)) continue;
      spot = s; break;
    }
    if (!spot) continue;
    cum += rung.cost;
    if (gold < cum) break;               // plan-time affordability: stop at the first rung we cannot pay for
    used.add(`${spot.x},${spot.z}`);
    orders.push({ verb: 'BUILD', what: rung.id, where: { x: spot.x, z: spot.z }, when: { goldGte: cum } });
    emitted++;
  }

  // 3. tier upgrades — a live sink for a purse that would otherwise pin at the cap.
  //    CONTEXT_ACTION does not travel, so pair it with a MOVE_TO (gen-35/48).
  if (gold >= 150 && emitted === 0) {
    const t = entries.find((e) => e.id === 'turret' && (e.tier ?? 1) < 2);
    if (t) {
      const px = t.x ?? t.position?.x, pz = t.z ?? t.position?.z;
      if (Number.isFinite(px)) {
        orders.push({ verb: 'MOVE_TO', pos: { x: px, z: pz } });
        orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: t.index ?? 0 } });
      }
    }
  }

  // 4. the harvest tail — the whole income. Drain one seam in a block before walking to
  //    the next (gen-15/47). Emitted UNCONDITIONALLY: a failing HARVEST costs nothing where
  //    the Prospector already stands and buys the decision point (gen-2/gen-51).
  const p = now.prospector || CLAIM;
  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x));
  const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const ranked = live.slice().sort((a, b) => d(p, a) - d(p, b));
  const chain = ranked.length ? ranked : (now.seams || []).slice(0, 3);
  let from = p;
  const room = MAXSLOTS - orders.length - 1;
  outer:
  for (let pass = 0; pass < 4; pass++) {
    const order = chain.slice().sort((a, b) => d(from, a) - d(from, b));
    for (const s of order) {
      for (let k = 0; k < 6; k++) {
        if (orders.length >= MAXSLOTS - 1) break outer;
        orders.push({ verb: 'HARVEST', seam: s.id });
      }
      if (Number.isFinite(s.x)) from = s;
      if (orders.length >= MAXSLOTS - 1) break outer;
    }
  }

  // 5. terminal anchor that cannot be filtered away — park on the income, not the claim.
  const park = ranked[0] || chain[0];
  orders.push({
    verb: 'HOLD',
    pos: Number.isFinite(park?.x) ? { x: park.x, z: park.z } : { x: CLAIM.x, z: CLAIM.z },
  });

  return orders.slice(0, MAXSLOTS);
}
