// e8-mare-claim controller v2 — v1 + turret tier-2 sink + beacons on the z=6 line.
// v1 reached w17/525s with 200 gold pinned and unspent from w14. The gold is the margin.

const TURRET_SPOTS = [
  { x: -6, z: 6 }, { x: 6, z: 6 }, { x: -2, z: 6 }, { x: 2, z: 6 },
  { x: -4, z: 4 }, { x: 4, z: 4 }, { x: 0, z: 4 }, { x: 0, z: 6 },
];
// Beacon radius is 8 and the hero is welded at (0,12): only the z=6 line reaches it.
const BEACON_SPOTS = [
  { x: -4, z: 6 }, { x: 4, z: 6 }, { x: 0, z: 6 }, { x: -5, z: 4 }, { x: 5, z: 4 },
  { x: 0, z: 4 }, { x: -2, z: 4 }, { x: 2, z: 4 }, { x: -12, z: 6 }, { x: 12, z: 6 },
  { x: -6, z: 2 }, { x: 6, z: 2 },
];

const PLATING = /plating|armor|armour|hp|health|hearty|vital|tough/i;
const DAMAGE = /spark|damage|coil|tap|volley|power|bolt|shot/i;
const TURRET_TIER2_COST = 150;

function scoreOffer(o) {
  const t = ((o.id || '') + ' ' + (o.name || '') + ' ' + (o.effectText || '')).toLowerCase();
  let s = 0;
  if (PLATING.test(t)) s += 100;
  if (DAMAGE.test(t)) s += 60;
  if (/range|reach/.test(t)) s += 30;
  if (/speed|swift|haste/.test(t)) s += 20;
  if (/seam|gold|pan|assay/.test(t)) s += 15;
  return s;
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

function costsFor(view, id) {
  const b = (view.stablePrefix.mechanics.buildables || []).find(b => b.id === id);
  return b ? b.costs : null;
}

function priceOf(costs, n) {
  if (!costs || costs.length === 0) return Infinity;
  if (n < costs.length) return costs[n];
  return Math.ceil((costs[costs.length - 1] * Math.pow(1.3, n - costs.length + 1)) / 5) * 5;
}

export default function controller(view, state) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];

  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    let best = now.pendingOffer[0], bs = -1;
    for (const o of now.pendingOffer) { const s = scoreOffer(o); if (s > bs) { bs = s; best = o; } }
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  orders.push({ verb: 'REPAIR_UNDER', pct: 55 });

  const entries = (now.works && now.works.entries) || [];
  const byKind = (now.works && now.works.byKind) || {};
  const nT = byKind.turret || 0;
  const nB = byKind.sentry_beacon || 0;
  const tCosts = costsFor(view, 'turret');
  const bCosts = costsFor(view, 'sentry_beacon');

  const taken = entries.map(e => e.position).filter(p => p && typeof p.x === 'number');
  const freeSpots = (spots) => spots.filter(s => !taken.some(p => dist(p, s) < 1.9));

  const queue = [];
  const pattern = ['T', 'T', 'B', 'T', 'B', 'T', 'B', 'B', 'B', 'B'];
  let ti = nT, bi = nB, tLeft = Math.max(0, 4 - nT), bLeft = Math.max(0, 6 - nB);
  const tFree = freeSpots(TURRET_SPOTS);
  const bFree = freeSpots(BEACON_SPOTS);
  let tSlot = 0, bSlot = 0;
  for (const p of pattern) {
    if (p === 'T' && tLeft > 0 && tSlot < tFree.length) {
      queue.push({ what: 'turret', price: priceOf(tCosts, ti), where: tFree[tSlot++] });
      ti++; tLeft--;
    } else if (p === 'B' && bLeft > 0 && bSlot < bFree.length) {
      queue.push({ what: 'sentry_beacon', price: priceOf(bCosts, bi), where: bFree[bSlot++] });
      bi++; bLeft--;
    }
  }
  let cum = 0, emitted = 0;
  for (const q of queue) {
    cum += q.price;
    if (emitted >= 4) break;
    orders.push({ verb: 'BUILD', what: q.what, where: q.where, when: { goldGte: cum } });
    emitted++;
  }

  // Tier-2 turret sink: only once the ladder is done and the gold is already in hand.
  // CONTEXT_ACTION does not travel, so walk the Prospector onto the turret first.
  if (queue.length === 0 && now.gold >= TURRET_TIER2_COST) {
    const t1 = entries.find(e => e.id === 'turret' && !e.wrecked && (e.tier || 1) < 2);
    if (t1 && t1.position) {
      orders.push({ verb: 'MOVE_TO', pos: { x: t1.position.x, z: t1.position.z } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: t1.index } });
    }
  }

  const pros = now.prospector || { x: 0, z: 12 };
  const live = (now.seams || []).filter(s => s.active && typeof s.x === 'number');
  live.sort((a, b) => dist(pros, a) - dist(pros, b));
  const room = 32 - orders.length;
  if (live.length > 0 && room > 0) {
    const per = 7;
    let added = 0, i = 0;
    while (added < room) {
      const s = live[i % live.length]; i++;
      for (let k = 0; k < per && added < room; k++) { orders.push({ verb: 'HARVEST', seam: s.id }); added++; }
    }
  }

  return orders.slice(0, 32);
}
