// e1-drill-yard controller v1 — generation 41.
//
// The contract cannot be secured (twist.secureWave = 0 -> RunManager.maybeSecureRun
// early-returns at :300, so `run_secured` never fires and `now.pendingSecure` never
// appears; the wave ceiling is secureWave+2 = 2). So this controller plays the ONLY
// axis the county still ranks on an unsecured row: gold, then time alive.
//
// The era's signature mechanic is the E1 bank cap (200). The open question this ride
// answers is whether 60 seconds of practice-yard panning can actually reach it.
//
// Shape (the gen 6->31 skeleton, trimmed to what this 60-second board can use):
//   1. PICK_UPGRADE first under REPLACE semantics (gen 5: a lone pick wipes the set).
//   2. Stacked HARVEST chained over the NEAR seams in blocks that drain each one
//      (capacity 30 = 6 pans of 5 gold), so travel is paid once per block.
//      Seams here sit 9-21wu out -> "chain when near" (gen 15).
//   3. Tail HOLD on the last seam so a drained chain parks the worker there
//      instead of drifting home (gen 38).

const CLAIM = { x: 0, z: 12 };
const MAX_ORDERS = 32;
const PANS_PER_SEAM = 6; // capacity 30 / 5 gold per pan

const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// Prefer plating/sustain so the hero survives to the ceiling; damage second.
function scoreUpgrade(u) {
  const s = `${u.id} ${u.name} ${u.effectText || ''}`.toLowerCase();
  let v = 0;
  if (/plating|armor|armour|max hp|maxhp|health|dressing|heal|regen/.test(s)) v += 100;
  if (/damage|spark|coil|tap|power/.test(s)) v += 40;
  if (/rate|speed|reload|fire/.test(s)) v += 30;
  if (/gold|pan|luck|prospect/.test(s)) v += 20;
  return v;
}

export default function controller(view) {
  const now = view.now;
  const orders = [];

  // 1. The draft is free margin and costs no gold. Always first in the array.
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. Live seams, nearest-to-the-worker first, then chained by mutual distance.
  const worker = now.prospector || CLAIM;
  const live = (now.seams || [])
    .filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));

  if (live.length) {
    // Greedy nearest-neighbour tour from the worker, so each block's travel is minimal.
    const remaining = [...live];
    const tour = [];
    let at = worker;
    while (remaining.length) {
      remaining.sort((a, b) => d(at, a) - d(at, b));
      const next = remaining.shift();
      tour.push(next);
      at = next;
    }

    // Fill the array with drain-blocks, cycling the tour until the cap is reached.
    let i = 0;
    while (orders.length < MAX_ORDERS - 1) {
      const seam = tour[i % tour.length];
      for (let p = 0; p < PANS_PER_SEAM && orders.length < MAX_ORDERS - 1; p++) {
        orders.push({ verb: 'HARVEST', seam: seam.id });
      }
      i++;
      if (i > 12) break;
    }

    // 3. Park on the last seam so a fully drained chain does not walk the worker home.
    const last = tour[(i - 1) % tour.length];
    if (orders.length < MAX_ORDERS) {
      orders.push({ verb: 'HOLD', pos: { x: last.x, z: last.z } });
    }
  }

  return orders.slice(0, MAX_ORDERS);
}
