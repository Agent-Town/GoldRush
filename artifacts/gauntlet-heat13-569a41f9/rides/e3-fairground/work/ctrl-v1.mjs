// e3-fairground controller v1
// Contract facts (read from source):
//  - secure needs wave>=12 AND ferrisWheel.spinning !== false AND crowdFlocks.allCrossed
//  - ANY damage to the wheel at (0,8) stops it PERMANENTLY -> run unsecurable
//  - wreckers (fevered_saboteur, west/east spawn) walk to the NEAREST building; with no player
//    building the wheel is the nearest -> idle loses the wheel at t~21.5
//  - flocks: 3 lanes at x=-20, 0, +20 from z=-30 to the plaza; any enemy within 7 of a moving
//    flock scatters it. So keep enemy mass in the x ~ +-(6..14) corridors, clear of the lanes.
//  - twist.powerGrid strips turret + lantern_post: arsenal is sentry_beacon(6) + palisade(48).

const HERO = { x: 0, z: -30 };

// Ladder in STRATEGY order. Two 10g palisades first (bait before t~15), then beacons.
const LADDER = [
  { id: 'palisade', at: [-9, -30] },
  { id: 'palisade', at: [9, -30] },
  { id: 'sentry_beacon', at: [-6, -26] },
  { id: 'sentry_beacon', at: [6, -26] },
  { id: 'palisade', at: [-12, -25] },
  { id: 'palisade', at: [12, -25] },
  { id: 'palisade', at: [-12, -35] },
  { id: 'palisade', at: [12, -35] },
  { id: 'sentry_beacon', at: [-6, -34] },
  { id: 'sentry_beacon', at: [6, -34] },
  { id: 'palisade', at: [-14, -30] },
  { id: 'palisade', at: [14, -30] },
  { id: 'palisade', at: [-9, -20] },
  { id: 'palisade', at: [9, -20] },
  { id: 'palisade', at: [-9, -39] },
  { id: 'palisade', at: [9, -39] },
  { id: 'sentry_beacon', at: [-11, -30] },
  { id: 'sentry_beacon', at: [11, -30] },
  { id: 'palisade', at: [-17, -27] },
  { id: 'palisade', at: [17, -27] },
  { id: 'palisade', at: [-17, -33] },
  { id: 'palisade', at: [17, -33] },
];

const GROUND_FAIL = /out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable/i;
const dead = new Set();       // poisoned coordinates (ground refusals only)
const built = new Set();      // rung indices we have seen standing

function key(a) { return `${a[0]},${a[1]}`; }
function d2(ax, az, bx, bz) { const dx = ax - bx, dz = az - bz; return dx * dx + dz * dz; }

function costOf(now, id, standingCount) {
  const b = (now.stable?.buildables || []).find((x) => x.id === id);
  if (!b) return id === 'palisade' ? 10 : 25;
  const arr = b.costs || [b.cost];
  return arr[Math.min(standingCount, arr.length - 1)] ?? arr[arr.length - 1];
}

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name || ''} ${o.effectText || ''}`.toLowerCase();
  if (/plating|health|max hp|maxhp|vitality|hardy|tough/.test(s)) return 100;
  if (/dressing|heal|regen|mend/.test(s)) return 90;
  if (/spark|damage|tap|coil|rate|fire/.test(s)) return 60;
  if (/blast|charge|radius/.test(s)) return 45;
  if (/range/.test(s)) return 30;
  return 10;
}

export default function controller(view, n) {
  const now = view.now;
  if (now.pendingSecure) return null;              // blank line: bank the secure for free

  const sp = view.stablePrefix;
  const buildables = sp?.mechanics?.buildables || [];
  now.stable = { buildables };

  const orders = [];

  // 1. draft first (replace semantics)
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = now.pendingOffer.slice().sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. refusal blacklist from the view's own order records (GROUND only, never economy)
  for (const rec of (now.orders || [])) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || {};
    if (o.verb !== 'BUILD' || !o.where) continue;
    const reason = `${rec.reason || ''} ${rec.detail || ''}`;
    if (GROUND_FAIL.test(reason)) dead.add(key([o.where.x, o.where.z]));
  }

  // 3. which rungs are standing? match by position from works.entries
  const entries = now.works?.entries || [];
  LADDER.forEach((r, i) => {
    for (const e of entries) {
      const p = e.position || e;
      if (p && Math.abs(p.x - r.at[0]) < 1.2 && Math.abs(p.z - r.at[1]) < 1.2) { built.add(i); return; }
    }
  });

  // 4. build batch: next unbuilt, unpoisoned rungs, cumulatively gated
  const counts = { ...(now.works?.byKind || {}) };
  let cum = 0;
  let emitted = 0;
  for (let i = 0; i < LADDER.length && emitted < 5; i++) {
    if (built.has(i)) continue;
    const r = LADDER[i];
    if (dead.has(key(r.at))) continue;
    const c = costOf(now, r.id, counts[r.id] || 0);
    cum += c;
    counts[r.id] = (counts[r.id] || 0) + 1;
    orders.push({ verb: 'BUILD', what: r.id, where: { x: r.at[0], z: r.at[1] }, when: { goldGte: cum } });
    emitted++;
  }

  // 5. free blast into the bait cluster where the besiegers press (within 10 of the hero)
  if (now.blastReadyInMs === 0) {
    const side = (n % 2 === 0) ? -9 : 9;
    orders.push({ verb: 'BLAST_AT', pos: { x: side, z: -30 } });
  }

  // 6. mend anything in the Prospector's sweep (free to carry; falls through when nothing near)
  orders.push({ verb: 'REPAIR_UNDER', pct: 99 });

  // 7. harvest tail: nearest live seam to the Prospector, drained in a block, then the next
  const px = now.prospector?.x ?? HERO.x, pz = now.prospector?.z ?? HERO.z;
  const live = (now.seams || [])
    .filter((s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .sort((a, b) => d2(a.x, a.z, px, pz) - d2(b.x, b.z, px, pz));
  const room = 32 - orders.length;
  if (live.length) {
    for (let k = 0; k < room; k++) {
      const s = live[Math.floor(k / 7) % live.length];
      orders.push({ verb: 'HARVEST', seam: s.id });
    }
  } else {
    // never let the array go empty or carry non-finite numbers
    orders.push({ verb: 'MOVE_HERO', pos: { x: HERO.x, z: HERO.z } });
  }

  return orders.slice(0, 32);
}
