// e7-relay-valley controller v2 — the thief-decoy line.
//
// v1 measured w13/398.5s (idle w2; gen-26's best w4). What kills the run is contact attrition on a
// welded 175-hp hero that no building can defend (only buildable ground is the four relay sites at
// z 36..46, >=31.2wu away, against turret range 16).
//
// THE LEVER: half the roster is `data_rustler`, `thief: true`. A thief's target is
// `TargetingSystem.nearestGoldHolding`, and in this engine the ONLY registered holdings are
// STOCKPILES (`HeadlessContractSim.syncStockpileHoldings` -> `build.diagnostics.stockpilesState`).
// With no stockpile the list is empty, `updateThief` returns null, and every thief falls through to
// ordinary hero pursuit — which is exactly what v1 measured (14-17 thieves standing on the hero,
// `goldStolen: 0`). Build a stockpile and each thief instead walks to it, grabs 10 gold and FLEES
// OFF THE MAP: it never touches the hero at all. Stockpiles are legal only in the relay zones, i.e.
// 34-49wu from the claim, which is the whole point. No wrecker is on this roster, so they are safe
// there forever.
//
// Gold is otherwise dead weight here (pinned at the 200 cap from t=150 in v1, nothing to buy), so
// paying the thieves is free; the only thing to protect is that `holding.amount = economy.gold`
// stays above zero, hence the deep HARVEST tail chained across every live seam.

const BEACON = { x: 24, z: 40 };          // relay-site-r3: the E7 objective work
const STOCK_EAST = { x: 45, z: 41 };      // relay-site-r4, 49wu from the claim
const STOCK_WEST = { x: -45, z: 41 };     // relay-site-r1, 49wu the other way

const PICK_SCORE = {
  tinkers_plating: 100,
  field_dressing: 96,
  split_spark: 82,
  heavy_spark: 72,
  double_tap_coil: 66,
  long_resonator: 52,
  sharpen: 46,
  powder_charge: 40,
  wide_ring: 38,
  quick_fuse: 36,
  assay_bonus: 30,
  prospectors_luck: 26,   // +10 seam capacity, -5s respawn: this now feeds the decoy
  pan_legend: 24,         // 30% faster panning: same
  spring_heels: 14,
  beacon_dynamo: 4,
};

function pick(offer) {
  let best = offer[0], bestScore = -1;
  for (const o of offer) {
    const s = PICK_SCORE[o.id] ?? 10;
    if (s > bestScore) { bestScore = s; best = o; }
  }
  return best.id;
}

let usedPlaybook = false;

export default function controller(view) {
  const now = view.now;
  if (now.pendingSecure) return null; // blank line: records no tape entry, banks by default

  const orders = [];
  const kind = now.works?.byKind ?? {};

  if (now.pendingOffer && now.pendingOffer.length) {
    orders.push({ verb: 'PICK_UPGRADE', id: pick(now.pendingOffer) });
  }
  if (now.blastReadyInMs === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: now.hero.x, z: now.hero.z } });
  }

  const beacons = kind.sentry_beacon ?? 0;
  if (!usedPlaybook && beacons >= 1) {
    orders.push({ verb: 'PLAYBOOK_USE', name: 'relay' });
    usedPlaybook = true;
  }
  if (beacons < 1) {
    orders.push({ verb: 'BUILD', what: 'sentry_beacon', where: BEACON, when: { goldGte: 25 } });
  }

  const stock = kind.stockpile ?? 0;
  if (stock < 1) orders.push({ verb: 'BUILD', what: 'stockpile', where: STOCK_EAST, when: { goldGte: 60 } });
  if (stock < 2) orders.push({ verb: 'BUILD', what: 'stockpile', where: STOCK_WEST, when: { goldGte: 140 } });

  // Income tail: chain every live seam, nearest first, so a depleted seam hands off instead of
  // stalling. The holding's amount IS economy.gold, so panning is what keeps the decoy alive.
  const from = now.prospector ?? { x: 0, z: 12 };
  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x))
    .sort((a, b) => Math.hypot(a.x - from.x, a.z - from.z) - Math.hypot(b.x - from.x, b.z - from.z));
  if (live.length) {
    const room = 30 - orders.length;
    for (let i = 0; i < room; i += 1) orders.push({ verb: 'HARVEST', seam: live[i % live.length].id });
  } else {
    orders.push({ verb: 'HOLD', pos: { x: 12, z: 18 } });
  }

  return orders;
}
