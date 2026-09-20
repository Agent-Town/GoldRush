// e8-mare-claim controller v1 — deterministic, no clock/random.
// Shape: SECURE branch → PICK_UPGRADE (scored) → REPAIR_UNDER → gated BUILD prefix → HARVEST tail.

const TURRET_SPOTS = [
  { x: -6, z: 6 }, { x: 6, z: 6 }, { x: -2, z: 6 }, { x: 2, z: 6 },
  { x: -6, z: 2 }, { x: 6, z: 2 }, { x: 0, z: 6 }, { x: 0, z: 2 },
];
const BEACON_SPOTS = [
  { x: -4, z: 4 }, { x: 4, z: 4 }, { x: 0, z: 4 }, { x: -6, z: -1 },
  { x: 6, z: -1 }, { x: 0, z: -2 }, { x: -12, z: 6 }, { x: 12, z: 6 },
  { x: -3, z: 0 }, { x: 3, z: 0 },
];

const PLATING = /plating|armor|armour|hp|health|hearty|vital|tough/i;
const DAMAGE = /spark|damage|coil|tap|volley|power|bolt|shot/i;

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

  // 1. Secure boundary owns the whole array.
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  const orders = [];

  // 2. Upgrade draft first in the array (replace semantics).
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    let best = now.pendingOffer[0], bs = -1;
    for (const o of now.pendingOffer) { const s = scoreOffer(o); if (s > bs) { bs = s; best = o; } }
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 3. Repair falls through free when nothing qualifies.
  orders.push({ verb: 'REPAIR_UNDER', pct: 55 });

  // 4. Build ladder: read placement from works.entries, skip refused slots.
  const entries = (now.works && now.works.entries) || [];
  const byKind = (now.works && now.works.byKind) || {};
  const nT = byKind.turret || 0;
  const nB = byKind.sentry_beacon || 0;
  const tCosts = costsFor(view, 'turret');
  const bCosts = costsFor(view, 'sentry_beacon');

  const taken = entries.map(e => e.position || { x: e.x, z: e.z }).filter(p => p && typeof p.x === 'number');
  const freeSpots = (spots) => spots.filter(s => !taken.some(p => dist(p, s) < 3.2));

  // blacklist positions that refused repeatedly
  state.refused = state.refused || {};
  const key = (kind, s) => kind + ':' + s.x + ',' + s.z;
  const ok = (kind, s) => (state.refused[key(kind, s)] || 0) < 3;

  const queue = [];
  const wantT = Math.max(0, 4 - nT);
  const wantB = Math.max(0, 6 - nB);
  // turret-heavy order: T T B T B T B B B B
  const pattern = ['T', 'T', 'B', 'T', 'B', 'T', 'B', 'B', 'B', 'B'];
  let ti = nT, bi = nB, tLeft = wantT, bLeft = wantB;
  const tFree = freeSpots(TURRET_SPOTS).filter(s => ok('turret', s));
  const bFree = freeSpots(BEACON_SPOTS).filter(s => ok('sentry_beacon', s));
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
  // cumulative gating: one trip buys the whole affordable batch
  let cum = 0, emitted = 0;
  for (const q of queue) {
    cum += q.price;
    if (emitted >= 4) break;
    orders.push({ verb: 'BUILD', what: q.what, where: q.where, when: { goldGte: cum } });
    emitted++;
    state.lastBatch = state.lastBatch || [];
  }

  // 5. Harvest tail — stack on nearest active seams, alternating in blocks.
  const pros = now.prospector || { x: 0, z: 12 };
  const live = (now.seams || []).filter(s => s.active && typeof s.x === 'number');
  live.sort((a, b) => dist(pros, a) - dist(pros, b));
  const room = 32 - orders.length;
  if (live.length > 0 && room > 0) {
    const blocks = [];
    const per = 7;
    let i = 0;
    while (blocks.length * per < room + per) {
      blocks.push(live[i % live.length]);
      i++;
      if (blocks.length > 8) break;
    }
    let added = 0;
    for (const s of blocks) {
      for (let k = 0; k < per && added < room; k++) { orders.push({ verb: 'HARVEST', seam: s.id }); added++; }
      if (added >= room) break;
    }
  }

  return orders.slice(0, 32);
}
