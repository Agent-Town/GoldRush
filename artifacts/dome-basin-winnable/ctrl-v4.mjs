// e9-dome-basin controller v3 — heat 12's tune-3 with its three measured defects removed and
// nothing else changed. v1 and v2 rebuilt the policy from scratch and lost two and six waves; the
// tune-3 shape is right and its faults are local.
//
//  (1) COLLISION IS NOT A DEAD SLOT. tune-3 blacklists a position after two failures of any kind,
//      and a WRECKED frame keeps occupying its ground, so from t = 425 every BUILD returned
//      "FAILED (collision)" and the pad could not be rebuilt. Its last eight views are that
//      failure repeating with 80 gold in hand. Here a collision marks the slot TAKEN (the ladder
//      moves to the next free one) and only a non-collision failure condemns it.
//  (2) THE PALISADE LADDER STOPPED AT 44 OF 48 PERMITTED, and the blacklist meant it only ever
//      placed 24. The full pad is walked.
//  (3) THE REEL BUDGET IT WAS DEFENDING WAS MEASURED ON THE WRONG ARTIFACT. `run.mjs` compared
//      `fs.statSync(tape).size` against maxTapeBytes, and `gr-sim.mjs:326` writes the tape with
//      two-space indent: 621,674 bytes on disk is 217,452 bytes compact, which is what the door
//      measures (`standings.ts:1250` re-serialises with JSON.stringify). SUB_BUDGET 205 was
//      throttling decisions to defend a ceiling the reel was never near.
const CLAIM = { x: 0, z: 12 };
const MENDS = Number(process.env.GR_MENDS ?? 6);
const BEACON_AFTER = Number(process.env.GR_BEACON_AFTER ?? 12);
const INCOME_TILT = process.env.GR_INCOME === '1';
const MAX_PAL = Number(process.env.GR_MAXPAL ?? 48);

const CANDS = {
  turret: [[28, 8], [30, 8], [28, 4], [30, 4], [32, 8], [28, 0], [32, 4], [34, 8], [30, 0], [28, -4]],
  sentry_beacon: [[34, 4], [30, -2], [38, 0], [34, -4], [36, 6], [40, 2]],
  palisade: [],
};
for (let z = 8; z >= -6; z -= 2) for (let x = 32; x <= 42; x += 2) CANDS.palisade.push([x, z]);
for (let z = 6; z >= -6; z -= 2) CANDS.palisade.push([28, z], [30, z]);

// Sentry beacons slow what they touch inside 8 wu and the heat built none of the six permitted.
// They land after the first rungs of bait so the wall exists before it is made slippery.
const BEACON_COST = [25, 35, 45, 55, 75, 95];
const BEACON_N = Number(process.env.GR_BEACONS ?? 0);
const PLAN = [
  { what: 'turret', cost: 50 },
  { what: 'turret', cost: 70 },
  { what: 'turret', cost: 95 },
  { what: 'turret', cost: 125 },
  ...Array.from({ length: BEACON_AFTER }, () => ({ what: 'palisade', cost: 10 })),
  ...BEACON_COST.slice(0, BEACON_N).map((cost) => ({ what: 'sentry_beacon', cost })),
  ...Array.from({ length: Math.max(0, MAX_PAL - BEACON_AFTER) }, () => ({ what: 'palisade', cost: 10 })),
];

const W = {
  field_dressing: 1000,
  tinkers_plating: 100, heavy_spark: 82, double_tap_coil: 80, split_spark: 76, long_resonator: 72,
  powder_charge: 40, wide_ring: 35, quick_fuse: 30, auto_pan: 26,
  prospectors_luck: 22, pan_legend: 18, spring_heels: 8, beacon_dynamo: 5, assay_bonus: 1,
};
// The wall is bought with gold and the purse is the binding constraint from wave 13 on (v3 held
// 26 of 48 permitted palisades with gold oscillating 30-60), so an income tilt is a lever too.
const W_INCOME = { ...W, pan_legend: 140, auto_pan: 130, prospectors_luck: 120, spring_heels: 90 };
const MAXST = {
  heavy_spark: 3, double_tap_coil: 3, long_resonator: 2, split_spark: 2, tinkers_plating: 3,
  spring_heels: 3, pan_legend: 2, auto_pan: 1, prospectors_luck: 2, beacon_dynamo: 2,
  powder_charge: 2, wide_ring: 2, quick_fuse: 2,
};
const d2 = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;

export default function controller(view, S) {
  const now = view.now;
  // 'rush' is the MARGIN probe only: it declines the bank and rides on into overtime, so the
  // seconds survived past the wave-20 gate are a measured number rather than an impression.
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: process.env.GR_SECURE === 'rush' ? 'rush' : 'bank' }];
  if (!S.init) { S.init = true; S.black = new Set(); S.taken = new Set(); S.tries = {}; S.lastSeams = ''; }

  for (const rec of now.orders || []) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || {};
    if (o.verb !== 'BUILD' || !o.where) continue;
    const k = `${o.what}@${o.where.x},${o.where.z}`;
    if (/collision/i.test(rec.reason || '')) { S.taken.add(k); continue; }
    S.tries[k] = (S.tries[k] || 0) + 1;
    if (S.tries[k] >= 2) S.black.add(k);
  }

  const byKind = now.works?.byKind || {};
  const entries = now.works?.entries || [];
  const gold = now.gold;

  const damaged = (now.works?.wrecked || 0) > 0
    || entries.some((e) => e.wrecked || (e.hp !== undefined && e.maxHp && e.hp < e.maxHp * 0.7));
  const canRepair = damaged && gold >= 25;

  const reserve = (byKind.palisade || 0) >= 6 ? 25 : 0;
  const builds = [];
  const done = {};
  for (const p of PLAN) {
    done[p.what] = done[p.what] || 0;
    if (done[p.what] < (byKind[p.what] || 0)) { done[p.what] += 1; continue; }
    if (builds.length >= 3) break;
    const spend = builds.reduce((a, b) => a + b.cost, 0) + p.cost + reserve;
    if (gold < spend) break;
    let placed = null;
    for (const [x, z] of CANDS[p.what] || []) {
      const k = `${p.what}@${x},${z}`;
      if (S.black.has(k) || S.taken.has(k)) continue;
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
  if (!(hasOffer || builds.length > 0 || canRepair || seamKey !== S.lastSeams || blastReady)) return 'BLANK';

  const orders = [];
  if (hasOffer) {
    const stacks = now.hero?.upgradesTaken || {};
    let best = null; let bestScore = -1;
    for (const o of now.pendingOffer) {
      const have = stacks[o.id] || 0;
      const max = MAXST[o.id] ?? 99;
      const WT = INCOME_TILT ? W_INCOME : W;
      let sc = (WT[o.id] ?? 20) + 14 * have + (max - have === 1 ? 25 : 0);
      if (/heal/i.test(o.effectText || '')) sc += 1000;
      if (sc > bestScore) { bestScore = sc; best = o; }
    }
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }
  if (blastReady) orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z } });
  if (canRepair) for (let i = 0; i < MENDS; i += 1) orders.push({ verb: 'REPAIR_UNDER', pct: 75 });
  for (const b of builds) orders.push({ verb: b.verb, what: b.what, where: b.where, when: b.when });

  if (live.length) {
    let i = 0;
    while (orders.length < 18) { orders.push({ verb: 'HARVEST', seam: live[Math.floor(i / 4) % live.length].id }); i += 1; }
    orders.push({ verb: 'HOLD', pos: { x: live[0].x, z: live[0].z } });
  } else {
    orders.push({ verb: 'HOLD', pos: { x: 28, z: -24 } });
  }
  S.lastSeams = seamKey;
  return orders.slice(0, 32);
}
