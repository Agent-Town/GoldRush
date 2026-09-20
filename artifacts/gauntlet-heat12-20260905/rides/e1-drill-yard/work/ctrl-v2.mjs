// e1-drill-yard controller v2 — generation 41.
//
// v1 measured 180 gold and exposed one bug worth the whole run: when every seam was
// drained, `live` was empty and the controller emitted `[]` — which under REPLACE
// semantics WIPES THE ORDER SET and stands the claim down. That cost 34 of 60 seconds
// (t=12.6->30 and t=43->60, both flat at 90 and 180 gold respectively).
//
// v2 rules:
//   1. NEVER emit an empty array. If nothing is live, sweep every known seam id anyway:
//      a HARVEST on a dead seam fails honestly, which both keeps the worklist alive and
//      buys a surprise view to re-plan on (gen 2 / gen 9).
//   2. Drain live seams in blocks of 6 (capacity 30 / 5 gold per pan), nearest-first,
//      so each block's travel is paid once.
//   3. Append a respawn sweep over ALL seam ids — seams here re-anchor between waves
//      (gold-seam-1 walked (-22,-6.8) -> (7.5,6.5)), so naming ids beats naming places.
//   4. Tail HOLD at the near-anchor cluster, never at the claim, so the worker is already
//      standing where the next respawn lands.
//
// The contract still cannot be secured (twist.secureWave = 0). This plays the only axis
// an unsecured row ranks on: gold, then time alive.

const MAX_ORDERS = 32;
const PANS_PER_SEAM = 6;
// Centre of the observed near-anchor cluster ((-9,6.7),(7.5,6.5),(18,-7),(25,6.9)).
const CLUSTER = { x: 6, z: 4 };

const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function scoreUpgrade(u) {
  const s = `${u.id} ${u.name} ${u.effectText || ''}`.toLowerCase();
  let v = 0;
  if (/plating|armor|armour|max hp|maxhp|health|dressing|heal|regen/.test(s)) v += 100;
  if (/gold|pan|luck|prospect|seam/.test(s)) v += 60; // gold IS the score here
  if (/damage|spark|coil|tap|power/.test(s)) v += 40;
  if (/rate|speed|reload|fire/.test(s)) v += 30;
  return v;
}

export default function controller(view) {
  const now = view.now;
  const orders = [];

  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  const seams = now.seams || [];
  const allIds = seams.map((s) => s.id);
  const worker = now.prospector || CLUSTER;
  const live = seams.filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));

  // --- drain blocks over the live seams, greedy nearest-neighbour tour
  const remaining = [...live];
  const tour = [];
  let at = worker;
  while (remaining.length) {
    remaining.sort((a, b) => d(at, a) - d(at, b));
    const next = remaining.shift();
    tour.push(next);
    at = next;
  }
  for (const seam of tour) {
    for (let p = 0; p < PANS_PER_SEAM && orders.length < MAX_ORDERS - 1; p++) {
      orders.push({ verb: 'HARVEST', seam: seam.id });
    }
  }

  // --- respawn sweep: keep naming every seam id so a returning seam is caught, and so
  //     a dead board still fails honestly into a fresh decision point instead of []
  let guard = 0;
  while (orders.length < MAX_ORDERS - 1 && allIds.length && guard < 64) {
    orders.push({ verb: 'HARVEST', seam: allIds[guard % allIds.length] });
    guard++;
  }

  // --- park in the cluster, never at the claim
  if (orders.length < MAX_ORDERS) {
    orders.push({ verb: 'HOLD', pos: CLUSTER });
  }

  // Absolute guarantee: never stand the claim down.
  if (!orders.length) orders.push({ verb: 'HOLD', pos: CLUSTER });

  return orders.slice(0, MAX_ORDERS);
}
