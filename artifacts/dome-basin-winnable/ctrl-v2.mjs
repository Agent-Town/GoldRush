// e9-dome-basin controller v2 — the heat's tune-3 shape with its three measured defects removed.
// v1 taught the fourth fact: EARLY VIEWS ARE ONE PER WAVE (advanceToTurn opens a turn on a wave
// change, a surprise, an offer or a pending secure), so a short array leaves the body idle for
// 30 s. The array must be a whole wave's program, exactly as tune-3 wrote it.
const CLAIM = { x: 0, z: 12 };
const TURRETS = [[28, 8], [30, 8], [28, 4], [30, 4]];
const PALIS = [];
for (let z = 8; z >= -6; z -= 2) for (let x = 32; x <= 42; x += 2) PALIS.push([x, z]);
for (let z = 6; z >= -6; z -= 2) PALIS.push([28, z], [30, z]);
const TURRET_COST = [50, 70, 95, 125];
const BEACON_COST = [25, 35, 45, 55, 75, 95];
const BEACONS = [[34, 4], [30, -2], [38, 0], [34, -4], [30, 6], [38, 6]];
const USE_BEACONS = process.env.GR_BEACONS === '1';
const MAX_PAL = Number(process.env.GR_MAXPAL ?? 48);
const MENDS = Number(process.env.GR_MENDS ?? 6);
const HARVESTS = Number(process.env.GR_HARVESTS ?? 18);

const W = {
  field_dressing: 1000,
  tinkers_plating: 100, heavy_spark: 82, double_tap_coil: 80, split_spark: 76, long_resonator: 72,
  powder_charge: 40, wide_ring: 35, quick_fuse: 30, auto_pan: 26,
  prospectors_luck: 22, pan_legend: 18, spring_heels: 8, beacon_dynamo: 5, assay_bonus: 1,
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
  if (!S.init) { S.init = true; S.dead = {}; }

  // Only a non-collision failure condemns a position. A collision means a frame (often a WRECKED
  // one) already stands there, and the cure is to aim at the next slot, never to abandon the pad:
  // tune-3 blacklisted its whole wall this way and spent its last 90 s failing to rebuild with
  // gold in hand.
  for (const rec of now.orders || []) {
    if (rec.status === 'failed' && rec.order?.verb === 'BUILD' && rec.order.where
      && !/collision/i.test(rec.reason || '')) {
      S.dead[`${rec.order.what}@${rec.order.where.x},${rec.order.where.z}`] = true;
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

  const damaged = entries.filter((e) => e.maxHp > 0 && (e.wrecked || e.hp < e.maxHp * 0.75));
  const mends = damaged.length && gold >= 12 ? Math.min(MENDS, damaged.length) : 0;
  for (let i = 0; i < mends; i += 1) orders.push({ verb: 'REPAIR_UNDER', pct: 75 });

  // THE LADDER, priced per rung and never abandoned at the first unaffordable one. Turrets kill
  // (tune-4 proved 220 g of turret beats 1,320 hp of extra wall), palisades are bait mass at 10 g,
  // and both are worth more than the next turret rung when the purse is thin.
  const reserve = mends ? Math.min(48, 3 * damaged.length) : 0;
  const rungs = [];
  for (let i = byKind.turret || 0; i < 4; i += 1) rungs.push({ what: 'turret', cost: TURRET_COST[i], rank: 0 });
  if (USE_BEACONS) for (let i = byKind.sentry_beacon || 0; i < 6; i += 1) rungs.push({ what: 'sentry_beacon', cost: BEACON_COST[i], rank: 2 });
  if ((byKind.palisade || 0) < MAX_PAL) rungs.push({ what: 'palisade', cost: 10, rank: 1 });
  rungs.sort((a, b) => a.rank - b.rank || a.cost - b.cost);

  let spend = reserve;
  const placed = [];
  for (const rung of rungs) {
    if (placed.length >= 3) break;
    if (gold < spend + rung.cost) continue;
    const slots = rung.what === 'turret' ? TURRETS : rung.what === 'sentry_beacon' ? BEACONS : PALIS;
    let at = null;
    for (const [x, z] of slots) {
      if (S.dead[`${rung.what}@${x},${z}`]) continue;
      if (occupied(entries, x, z) || placed.some((p) => p.where.x === x && p.where.z === z)) continue;
      at = { x, z }; break;
    }
    if (!at) continue;
    spend += rung.cost;
    placed.push({ verb: 'BUILD', what: rung.what, where: at, when: { goldGte: rung.cost } });
  }
  orders.push(...placed);

  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x));
  const p = now.prospector || { x: 34, z: -24 };
  live.sort((a, b) => d2(a, p) - d2(b, p));
  if (live.length) {
    let i = 0;
    while (orders.length < HARVESTS + mends + placed.length && orders.length < 31) {
      orders.push({ verb: 'HARVEST', seam: live[Math.floor(i / 4) % live.length].id }); i += 1;
    }
    orders.push({ verb: 'HOLD', pos: { x: live[0].x, z: live[0].z } });
  } else {
    orders.push({ verb: 'HOLD', pos: { x: 34, z: -24 } });
  }
  return orders.slice(0, 32);
}
