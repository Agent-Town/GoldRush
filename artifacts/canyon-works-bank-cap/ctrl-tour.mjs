// THE ONE-DESCENT TOUR. Banks the whole 330 g beacon ladder at the seams, then walks the six
// pylon sites once and raises every beacon on that single descent — the line heat 12 proved the
// 200 g purse forbids (`artifacts/gauntlet-heat12-20260905/blockers/e3-canyon-works.md`).
//
// Three things this policy knows that heat 12's `ctrl-v1` did not, all read out of
// `src/systems/HarvestSystem.ts` rather than guessed:
//
//   1. A seam respawns 20 s after it is drained AT A DIFFERENT ANCHOR (`pickOpenAnchor` excludes
//      its own and every live one), and this map's four anchors sit in two clusters 56 wu apart.
//      So the Prospector must CHASE, and where it waits decides how much of the 20 s is walking.
//   2. Panning is passive: `HarvestSystem.update` channels for any collector within
//      `channelRange` 1.6 wu moving no faster than `slowSpeed` 0.35. Standing on an EMPTY anchor
//      therefore banks a seam that respawns underfoot with no order at all — which matters
//      because the rider only gets a turn on a wave boundary or a surprise.
//   3. A trailing HARVEST on a seam that has just gone dry FAILS, and `StandingOrders.fail`
//      raises `surprise('order_failure')` — the one wake-up a rider can schedule for itself.
//
// Survival is generation 60's recipe (that ride reached the wave-20 ceiling): plating in the
// draft, a free BLAST_AT on every ready view, the beacon ladder doubling as the fort. The blast is
// aimed NEAR THE HERO; gen 60 aimed at (0,-40) beside a hero starting at (0,-44), and a seam-side
// aim 76 wu away burns the order on OUT_OF_RANGE every time.
const SITES = [
  { id: 'w-rim', x: -28, z: 8 },
  { id: 'w-switch', x: -24, z: -20 },
  { id: 'w-base', x: -12, z: -36 },
  { id: 'e-base', x: 12, z: -36 },
  { id: 'e-switch', x: 24, z: -20 },
  { id: 'e-rim', x: 28, z: 8 },
];
const ANCHORS = [{ x: -34, z: 30 }, { x: -22, z: 34 }, { x: 22, z: 34 }, { x: 34, z: 30 }];
const COSTS = [25, 35, 45, 55, 75, 95]; // beaconCost(i) = ceil(25 * 1.3^i / 5) * 5 -> 330 total
// Income first while the latch clock runs: +10 gold of seam capacity and -5 s of respawn is worth
// more to this contract than any weapon. Plating second, because the hero still has to live.
const DRAFT = ['prospectors_luck', 'tinkers_plating', 'field_dressing', 'iron_lungs', 'heavy_spark', 'double_tap_coil', 'split_spark', 'long_resonator', 'quick_fuse'];
const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function pick(offer) {
  for (const id of DRAFT) {
    const found = offer.find((o) => o.id === id);
    if (found) return found.id;
  }
  return offer[0].id;
}

/** Route the unbuilt sites nearest-first from the Prospector, hopping site to site. */
function route(todo, from) {
  const left = todo.slice();
  const out = [];
  let at = from;
  while (left.length) {
    left.sort((a, b) => d(a, at) - d(b, at));
    const next = left.shift();
    out.push(next);
    at = next;
  }
  return out;
}

export default function ctrl(view) {
  const n = view.now;
  if (n.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const out = [];
  if (n.pendingOffer?.length) out.push({ verb: 'PICK_UPGRADE', id: pick(n.pendingOffer) });
  if (n.blastReadyInMs === 0 && n.hero) out.push({ verb: 'BLAST_AT', pos: { x: n.hero.x, z: n.hero.z + 4 } });

  const beacons = (n.works?.entries || []).filter((e) => e.id === 'sentry_beacon' && !e.wrecked);
  const covered = new Set();
  for (const b of beacons) for (const s of SITES) if (d(b.position, s) <= 2.5) covered.add(s.id);
  const todo = SITES.filter((s) => !covered.has(s.id));
  const built = beacons.length;
  const bill = todo.reduce((sum, _s, i) => sum + COSTS[Math.min(COSTS.length - 1, built + i)], 0);

  const live = (n.seams || []).filter((s) => s.active && Number.isFinite(s.x) && Number.isFinite(s.z));
  const pros = n.prospector && Number.isFinite(n.prospector.x) ? n.prospector : { x: 0, z: -44 };

  // ONE DESCENT: only step off the seams once the whole remaining ladder is in the purse.
  if (todo.length && n.gold >= bill) {
    for (const site of route(todo, pros)) {
      out.push({ verb: 'BUILD', what: 'sentry_beacon', where: { x: site.x, z: site.z } });
    }
  }

  live.sort((a, b) => d(a, pros) - d(b, pros));
  for (const s of live) {
    for (let j = 0; j < 7 && out.length < 31; j += 1) out.push({ verb: 'HARVEST', seam: s.id });
  }

  // Wait ON an empty anchor, never between them: a seam that respawns underfoot is banked with no
  // order and no turn. Nearest empty anchor to where the last harvest leaves the Prospector.
  const from = live.length ? live[live.length - 1] : pros;
  const empty = ANCHORS.filter((a) => !live.some((s) => d(s, a) < 2)).sort((a, b) => d(a, from) - d(b, from));
  out.push({ verb: 'HOLD', pos: empty.length ? empty[0] : { x: from.x, z: from.z } });
  return out.slice(0, 32);
}
