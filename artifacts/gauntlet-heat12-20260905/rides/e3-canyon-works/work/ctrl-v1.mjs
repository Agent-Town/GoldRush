// v1: race the connect latch. Beacon ladder in two batches (bank cap 200 < 330 total),
// plating-first draft, free BLAST_AT, deep HARVEST tail.
const CLAIM = { x: 0, z: -44 };
// pylon sites in route order: down the west chain, across, up the east chain
const SITES = [
  { id: 'w-rim', x: -28, z: 8 },
  { id: 'w-switch', x: -24, z: -20 },
  { id: 'w-base', x: -12, z: -36 },
  { id: 'e-base', x: 12, z: -36 },
  { id: 'e-switch', x: 24, z: -20 },
  { id: 'e-rim', x: 28, z: 8 },
];
const COSTS = [25, 35, 45, 55, 75, 95];
const SURV = ['tinkers_plating', 'field_dressing', 'iron_lungs'];
const DMG = ['heavy_spark', 'double_tap_coil', 'split_spark', 'long_resonator', 'quick_fuse'];

function scorePick(offer) {
  for (const id of SURV) { const o = offer.find(x => x.id === id); if (o) return o.id; }
  for (const id of DMG) { const o = offer.find(x => x.id === id); if (o) return o.id; }
  return offer[0].id;
}
const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export default function ctrl(view) {
  const n = view.now;
  if (n.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const out = [];
  if (n.pendingOffer?.length) out.push({ verb: 'PICK_UPGRADE', id: scorePick(n.pendingOffer) });
  if (n.blastReadyInMs === 0) out.push({ verb: 'BLAST_AT', pos: { x: 0, z: -40 } });

  // which pylon sites already carry a standing beacon
  const beacons = (n.works.entries || []).filter(e => e.id === 'sentry_beacon' && !e.wrecked);
  const covered = new Set();
  for (const b of beacons) for (const s of SITES) if (d(b.position, s) <= 2.5) covered.add(s.id);
  const todo = SITES.filter(s => !covered.has(s.id));
  const built = beacons.length;

  // batch = the longest prefix of todo whose cumulative cost fits under the bank cap
  const CAP = 200;
  let batch = [], sum = 0;
  for (let i = 0; i < todo.length; i++) {
    const c = COSTS[Math.min(COSTS.length - 1, built + i)];
    if (sum + c > CAP) break;
    sum += c; batch.push({ site: todo[i], cost: c });
  }
  // suffix gate: rung i waits for the cost of rungs i..end of the batch, so one trip buys the batch
  let suffix = sum;
  for (const rung of batch) {
    out.push({ verb: 'BUILD', what: 'sentry_beacon', where: { x: rung.site.x, z: rung.site.z }, when: { goldGte: suffix } });
    suffix -= rung.cost;
  }

  // harvest tail: live seams nearest-first, each drained in a block of 6 (capacity 30 / 5 per tick)
  const live = (n.seams || []).filter(s => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const pros = n.prospector && Number.isFinite(n.prospector.x) ? n.prospector : CLAIM;
  live.sort((a, b) => d(a, pros) - d(b, pros));
  const slots = 31 - out.length;
  let k = 0;
  outer: while (k < slots) {
    if (!live.length) break;
    for (const s of live) for (let j = 0; j < 6; j++) { if (k >= slots) break outer; out.push({ verb: 'HARVEST', seam: s.id }); k++; }
  }
  out.push({ verb: 'HOLD', pos: { x: CLAIM.x, z: CLAIM.z } });
  return out.slice(0, 32);
}
