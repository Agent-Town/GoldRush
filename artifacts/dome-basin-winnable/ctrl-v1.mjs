// e9-dome-basin controller v1 — the two levers heat 12 named but never rode, plus the two the
// baseline's own trace exposes.
//
// BASELINE (ctrl-baseline.mjs, the heat's tune-3, reproduced byte-identical here at
// fnv1a32:2b4a09b5): w16 / 499.200 s. Its trace says the run ends when the bait wall does:
//   t=395.7  26 works standing, 0 wrecked, 2002/2024 hp, 13 wreckers alive
//   t=456.3   0 works standing, 26 wrecked,    0/2024 hp, 30 wreckers alive
//   t=499.2  hero 0/175 after 43 s of undefended contact, gold 80 UNSPENT
// Two defects in that controller, both visible in the trace:
//  (1) It blacklists a build position after two failures, and a WRECKED frame keeps occupying its
//      position, so every late BUILD returned "FAILED (collision)" and the pad could never be
//      rebuilt. The last eight views are that failure repeating with gold in hand.
//  (2) It answers ~265 of 437 views because it is budgeting reel bytes against the pretty-printed
//      file size on disk (`run.mjs` measured `fs.statSync(tape).size`, and `gr-sim.mjs:326` writes
//      the tape with two-space indent). The door measures the COMPACT form, ~2.9x smaller.
// This controller answers every view with a SHORT array, because `StandingOrdersExecutor.tick`
// (src/agent/StandingOrders.ts:233) runs the first record with work to do and returns, so a long
// array is mostly unread: the array is a priority list re-decided each view, not a program.

const CLAIM = { x: 0, z: 12 };
// East rim pad, x 28..42 / z -6..8. Its NW corner is 4.5 wu from the east spawn ring point against
// the claim's 26, so a wrecker spawning east walks to the wall instead of the body.
const TURRETS = [[28, 8], [30, 8], [28, 4], [30, 4]];
const PALIS = [];
for (let z = 8; z >= -6; z -= 2) for (let x = 32; x <= 42; x += 2) PALIS.push([x, z]);
for (let z = 6; z >= -6; z -= 2) PALIS.push([28, z], [30, z]);
// Sentry beacons slow what they touch inside 8 wu (mechanics card, `sentry_beacon`). Six are
// permitted and the heat built none. They sit inside the wall so their radius covers it.
const BEACONS = [[34, 4], [30, -2], [38, 0], [34, -4], [30, 6], [38, 6]];

const W = {
  field_dressing: 1000,
  tinkers_plating: 120, heavy_spark: 82, double_tap_coil: 80, split_spark: 76, long_resonator: 72,
  powder_charge: 40, wide_ring: 35, quick_fuse: 30, auto_pan: 26,
  prospectors_luck: 22, pan_legend: 24, spring_heels: 12, beacon_dynamo: 5, assay_bonus: 1,
};
const MAXST = {
  heavy_spark: 3, double_tap_coil: 3, long_resonator: 2, split_spark: 2, tinkers_plating: 3,
  spring_heels: 3, pan_legend: 2, auto_pan: 1, prospectors_luck: 2, beacon_dynamo: 2,
  powder_charge: 2, wide_ring: 2, quick_fuse: 2,
};
const d2 = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;
const occupied = (entries, x, z) => entries.some((e) => e.position
  && Math.abs(e.position.x - x) < 1.6 && Math.abs(e.position.z - z) < 1.6);

export default function controller(view, S) {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  if (!S.init) { S.init = true; S.fails = {}; }

  // A BUILD that fails for anything but a collision is dead ground; a collision is just a frame
  // standing (or wrecked) where we aimed, and the cure is to aim elsewhere, never to give up.
  for (const rec of now.orders || []) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || {};
    if (o.verb === 'BUILD' && o.where && !/collision/i.test(rec.reason || '')) {
      S.fails[`${o.what}@${o.where.x},${o.where.z}`] = 2;
    }
  }

  const gold = now.gold;
  const entries = now.works?.entries || [];
  const byKind = now.works?.byKind || {};
  const orders = [];

  if (now.pendingOffer && now.pendingOffer.length) {
    let best = null; let bestScore = -1;
    const stacks = now.hero?.upgradesTaken || {};
    for (const o of now.pendingOffer) {
      const have = stacks[o.id] || 0;
      const max = MAXST[o.id] ?? 99;
      let sc = (W[o.id] ?? 20) + 14 * have + (max - have === 1 ? 25 : 0);
      if (/heal/i.test(o.effectText || '')) sc += 1000;
      if (sc > bestScore) { bestScore = sc; best = o; }
    }
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }
  if (now.blastReadyInMs === 0) orders.push({ verb: 'BLAST_AT', pos: CLAIM });

  // --- the wall, in rungs: four turrets, then palisades and beacons interleaved.
  const want = [];
  for (const [i, pos] of TURRETS.entries()) want.push({ what: 'turret', pos, cost: [50, 70, 95, 125][i] });
  for (let i = 0; i < 24; i += 1) want.push({ what: 'palisade', pos: PALIS[i], cost: 10 });
  for (const [i, pos] of BEACONS.entries()) want.push({ what: 'sentry_beacon', pos, cost: [25, 35, 45, 55, 75, 95][i] });
  for (let i = 24; i < PALIS.length; i += 1) want.push({ what: 'palisade', pos: PALIS[i], cost: 10 });

  const damaged = entries.filter((e) => e.maxHp > 0 && (e.wrecked || e.hp < e.maxHp * 0.75));
  // Mending is the cheap way to re-arm bait: 30% of cost (Balance.wreck.repairCostFrac) against
  // full price to rebuild, and a wrecked frame blocks its own ground until it is mended.
  const mendReserve = damaged.length ? Math.min(60, 3 * damaged.length) : 0;

  let build = null;
  for (const w of want) {
    if (!w.pos) continue;
    const key = `${w.what}@${w.pos[0]},${w.pos[1]}`;
    if ((S.fails[key] || 0) >= 2) continue;
    if (occupied(entries, w.pos[0], w.pos[1])) continue;
    if ((byKind[w.what] || 0) >= ({ turret: 4, sentry_beacon: 6, palisade: 48 })[w.what]) continue;
    if (gold < w.cost + mendReserve) break;
    build = { verb: 'BUILD', what: w.what, where: { x: w.pos[0], z: w.pos[1] }, when: { goldGte: w.cost } };
    break;
  }

  // PRIORITY. Repair leads once the wall is being eaten, because a standing wall is the only thing
  // between 60 wreckers and a body that cannot be defended (nearest build ground 28.28 wu, turret
  // range 16). It yields to panning when the purse cannot pay for the mend.
  const canMend = damaged.length > 0 && gold >= 12;
  const mends = canMend ? Math.min(6, damaged.length) : 0;
  for (let i = 0; i < mends; i += 1) orders.push({ verb: 'REPAIR_UNDER', pct: 75 });
  if (build) orders.push(build);

  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x));
  const p = now.prospector || { x: 34, z: -24 };
  live.sort((a, b) => d2(a, p) - d2(b, p));
  if (live.length) {
    for (const s of live) orders.push({ verb: 'HARVEST', seam: s.id });
    orders.push({ verb: 'HOLD', pos: { x: live[0].x, z: live[0].z } });
  } else {
    orders.push({ verb: 'HOLD', pos: { x: 34, z: -24 } });
  }
  return orders;
}
