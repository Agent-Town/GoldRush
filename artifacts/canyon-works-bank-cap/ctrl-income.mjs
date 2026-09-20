// INCOME PROBE. Pans and NEVER builds, and — unlike heat 12's `ctrl-v2` — holds at the seam
// cluster instead of walking home to the claim when both seams go dry, so the 20 s respawn is
// spent standing on the anchors rather than commuting. It measures the map's real gold-per-second
// against the wave-6 latch clock, which is the number the cap override has to be chosen against.
//
// The trailing HARVEST on each seam is deliberate: it FAILS the instant that seam is dry, and an
// order failure raises a `surprise`, which is what wakes the rider between wave boundaries
// (`StandingOrders.fail` -> `surprise('order_failure')`). Without it the policy would sleep
// through the respawn until the next 30 s wave turn.
const SURV = ['tinkers_plating', 'field_dressing', 'iron_lungs'];
const DMG = ['heavy_spark', 'double_tap_coil', 'split_spark', 'long_resonator', 'quick_fuse'];
const HOLD = { x: -28, z: 32 }; // between gold-seam-1 (-34,30) and gold-seam-2 (-22,34)

export function pickUpgrade(offer) {
  for (const list of [SURV, DMG]) {
    const found = offer.find((o) => list.includes(o.id));
    if (found) return found.id;
  }
  return offer[0].id;
}

export function panBlock(n, budget) {
  const out = [];
  const live = (n.seams || []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  for (const s of live) {
    for (let j = 0; j < 7 && out.length < budget; j += 1) out.push({ verb: 'HARVEST', seam: s.id });
  }
  return out;
}

export default function ctrl(view) {
  const n = view.now;
  if (n.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const out = [];
  if (n.pendingOffer?.length) out.push({ verb: 'PICK_UPGRADE', id: pickUpgrade(n.pendingOffer) });
  if (n.blastReadyInMs === 0) out.push({ verb: 'BLAST_AT', pos: HOLD });
  out.push(...panBlock(n, 31 - out.length));
  out.push({ verb: 'HOLD', pos: HOLD });
  return out.slice(0, 32);
}
