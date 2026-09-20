// e9-dome-basin controller v3
// tune-2 (w15/451.7s, 589 kills, reel admissible at 197,790 B) proved the shape: the hero cannot be
// defended (no build zone within 28.28wu of a welded hero, turret range 16) but it CAN be spared,
// because a wrecker seeks the nearest building and the east rim pad sits 4.5wu from the east spawn
// ring point against the claim's 26. 18 palisades + 4 turrets held the hero flat at 153-164/175 from
// t=270 to t=420 while the wall was eaten. It died when the wall did.
// Two measured faults in tune-2, both fixed here:
//  (1) REPAIR_UNDER with no gold failed NINETY times, and every failure was a 22wu round trip, so
//      goldPanned FROZE at 630 from t=360 to t=420. Repairs are now gated on gold and on there
//      actually being something damaged.
//  (2) One mend per array cannot keep up with ~0.24 works/s of wrecking. Four REPAIR_UNDER orders
//      ride one rim trip, and a wrecked frame mends for 25% of cost (2.5g a palisade) against 10g
//      to rebuild, so mending is the cheap way to re-arm the bait.

const CLAIM = { x: 0, z: 12 };
const SUB_BUDGET = 190;          // ~2.0 KB an entry against the 592,544-byte ceiling

// East rim pad is x 28..42, z -6..8; its NW corner is the closest legal ground to the east lane.
const CANDS = {
  turret: [[28, 8], [30, 8], [28, 4], [30, 4], [32, 8], [28, 0], [32, 4], [34, 8], [30, 0], [28, -4]],
  palisade: [],
};
for (let z = 8; z >= -6; z -= 2) for (let x = 32; x <= 42; x += 2) CANDS.palisade.push([x, z]);
for (let z = 6; z >= -6; z -= 2) CANDS.palisade.push([28, z], [30, z]);

const PLAN = [
  { what: 'turret', cost: 50 },
  { what: 'turret', cost: 70 },
  ...Array.from({ length: 46 }, () => ({ what: 'palisade', cost: 10 })),
];

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

export default function controller(view, S) {
  const now = view.now;
  if (!S.init) { S.init = true; S.black = new Set(); S.tries = {}; S.subs = 0; S.lastSeams = ''; }

  if (now.pendingSecure) return 'BLANK';

  for (const rec of now.orders || []) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || {};
    if (o.verb === 'BUILD' && o.where) {
      const k = `${o.what}@${o.where.x},${o.where.z}`;
      S.tries[k] = (S.tries[k] || 0) + 1;
      if (S.tries[k] >= 2) S.black.add(k);
    }
  }

  const byKind = now.works?.byKind || {};
  const entries = now.works?.entries || [];
  const gold = now.gold;

  // ---- is anything worth a rim trip to mend?
  const damaged = (now.works?.wrecked || 0) > 0
    || entries.some((e) => e.wrecked || (e.hp !== undefined && e.maxHp && e.hp < e.maxHp * 0.7));
  const canRepair = damaged && gold >= 25;

  // ---- next affordable BUILD rungs (keep a 25g mend reserve once a wall exists)
  const reserve = (byKind.palisade || 0) >= 6 ? 25 : 0;
  const builds = [];
  const done = {};
  for (const p of PLAN) {
    done[p.what] = done[p.what] || 0;
    if (done[p.what] < (byKind[p.what] || 0)) { done[p.what]++; continue; }
    if (builds.length >= 3) break;
    const spend = builds.reduce((a, b) => a + b.cost, 0) + p.cost + reserve;
    if (gold < spend) break;
    let placed = null;
    for (const [x, z] of CANDS[p.what] || []) {
      const k = `${p.what}@${x},${z}`;
      if (S.black.has(k)) continue;
      if (entries.some((e) => e.position && Math.abs(e.position.x - x) < 1.6 && Math.abs(e.position.z - z) < 1.6)) continue;
      if (builds.some((b) => b.where.x === x && b.where.z === z)) continue;
      placed = { x, z }; break;
    }
    if (!placed) break;
    builds.push({ verb: 'BUILD', what: p.what, where: placed, when: { goldGte: p.cost }, cost: p.cost });
    done[p.what] = (done[p.what] || 0) + 1;
  }

  const live = (now.seams || []).filter((s) => s.active && Number.isFinite(s.x));
  const p = now.prospector || { x: 28, z: -24 };
  live.sort((a, b) => d2(a, p) - d2(b, p));
  const seamKey = live.map((s) => s.id).join(',');

  const hasOffer = !!(now.pendingOffer && now.pendingOffer.length);
  const blastReady = now.blastReadyInMs === 0;
  const mustSpeak = hasOffer || builds.length > 0 || canRepair || seamKey !== S.lastSeams;
  if (!mustSpeak && !(blastReady && S.subs < SUB_BUDGET)) return 'BLANK';
  if (S.subs >= SUB_BUDGET + 60) return 'BLANK';   // hard reel guard

  const orders = [];
  if (hasOffer) {
    const stacks = now.hero?.upgradesTaken || {};
    let best = null, bestScore = -1;
    for (const o of now.pendingOffer) {
      const have = stacks[o.id] || 0;
      const max = MAXST[o.id] ?? 99;
      let sc = (W[o.id] ?? 20) + 14 * have + (max - have === 1 ? 25 : 0);
      if (/heal/i.test(o.effectText || '')) sc += 1000;
      if (sc > bestScore) { bestScore = sc; best = o; }
    }
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }
  if (blastReady) orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z } });
  // mends ride one rim trip; four per array against ~0.24 works/s of wrecking
  if (canRepair) for (let i = 0; i < 4; i++) orders.push({ verb: 'REPAIR_UNDER', pct: 75 });
  for (const b of builds) orders.push({ verb: b.verb, what: b.what, where: b.where, when: b.when });

  if (live.length) {
    let i = 0;
    while (orders.length < 16) { orders.push({ verb: 'HARVEST', seam: live[Math.floor(i / 4) % live.length].id }); i++; }
    orders.push({ verb: 'HOLD', pos: { x: live[0].x, z: live[0].z } });
  } else {
    orders.push({ verb: 'HOLD', pos: { x: 28, z: -24 } });
  }

  S.subs++;
  S.lastSeams = seamKey;
  return orders;
}
