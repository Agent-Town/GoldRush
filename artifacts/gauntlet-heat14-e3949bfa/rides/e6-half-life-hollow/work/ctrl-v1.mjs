// Generation 118 — e6-half-life-hollow, era 6.
// The gen-6..117 skeleton, plus the ONE thing this board does differently:
//   the hollow crossing is a HERO errand now (F-RPG-3, cured 2026-09-07), and
//   the economy is CAPTURE/pen decay output, not panning.
//
// Board facts read before the first order:
//   - twist declares no secureWave  -> Balance.run.secureWave = 20, 600 s, clockTicks 18000
//   - roster {feral_toaster, lawn_shepherd, glowjack}: NO WRECKER, glowjack thief:true
//       => works cannot be attacked (REPAIR_UNDER / palisade bait are dead weight)
//       => stockpile is the thief switch (gen 106 measured 435 g) -> DECLINED, cap stays 200
//   - crossing gate: launch shelf -> route -> within 6 of (0,48); measured at the HERO
//   - causeway x[-7,7] is radiation-free; glow bridges x[-34,-22] and x[22,34], z[-34,34]
//   - north-extraction-shelf x[-28,28] z[40,54] contains BOTH the errand terminus and seam (24,47)

const POST = { x: 21, z: 46 };          // in the shelf, off the glow bridge (x<22), 3.2 from the seam
const WP_LAUNCH = { x: 0, z: -44 };     // deep inside launch shelf z[-54,-40]: no knife-edge on z=-40
const WP_EXTRACT = { x: 0, z: 44 };     // 4.0 from the extraction stake (0,48), radius 6

const SECURE_T = 600;
const HARD_BUILD_STOP = 505;            // flat floor; a bank gate can be argued with, a floor cannot
const BANK_CAP = 200;                   // no stockpile on a thief roster

// ONE ladder, ONE ordinal per id, strategy order (not price order).
const LADDER = [
  'turret', 'sentry_beacon', 'turret', 'sentry_beacon',
  'turret', 'sentry_beacon', 'turret', 'sentry_beacon',
  'sentry_beacon', 'sentry_beacon',
];

// More candidate spots than slots. Integer lattice (builds snap). Spread on BOTH axes.
const SPOTS = {
  turret: [[15, 43], [27, 43], [15, 50], [27, 50], [21, 41], [21, 52], [12, 46], [28, 46], [24, 41], [18, 52]],
  sentry_beacon: [[18, 44], [24, 44], [18, 49], [24, 49], [21, 43], [21, 49], [19, 47], [23, 43], [16, 46], [26, 46], [21, 45], [25, 47]],
};

const ground = new Set();   // poisoned coordinates (GROUND refusals only)
const retired = new Set();  // ladder rungs with no candidates left
let postIdx = 0;
const POSTS = [POST, { x: 20, z: 45 }, { x: 18, z: 46 }, { x: 24, z: 45 }];
let lastSubmitT = -99;
let lastSig = '';

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  if (/plating|armou?r|max ?hp|vital|tough|hardy|constitution/.test(s)) return 100;
  if (/heal|regen|mend|dressing|recover|bandage/.test(s)) return 80;
  if (/damage|spark|coil|tap|power|volley|pierce/.test(s)) return 60;
  if (/rate|speed|reload|cool/.test(s)) return 50;
  return 10;
}

export default function controller(view) {
  const n = view.now;
  const t = (n.timers?.runSeconds) ?? (n.timers?.simTimeSeconds) ?? 0;

  // --- the secure boundary: SILENCE. It banks the default, it cannot be REJECTED
  //     (a refused in-window submission is invisible to the tape and visible to the
  //     sim, which desynchronises the replay), and it keeps the last order inside the envelope.
  if (n.pendingSecure) return null;

  const orders = [];

  // 1) draft first, under replace semantics
  if (n.pendingOffer && n.pendingOffer.length) {
    const best = [...n.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2) free supplementary damage; BLAST_AT returns {} on success AND failure,
  //    so it is safe above the traveller and never blocks the errand.
  if (n.blastReadyInMs === 0 && (n.threats?.alive ?? 0) > 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: n.hero.x, z: n.hero.z + 6 } });
  }

  // 3) THE ERRAND — a view-derived state machine, never my own clock.
  //    One array drives the whole thing: each MOVE_HERO blocks its tick while walking,
  //    goes done on arrival, and hands the tick to the next record.
  const stage = n.hollowCrossing?.stage;
  const failedOrders = (n.orders || []).filter((o) => o.status === 'failed');
  if (stage && stage !== 'complete') {
    if (stage === 'launch') orders.push({ verb: 'MOVE_HERO', pos: WP_LAUNCH });
    orders.push({ verb: 'MOVE_HERO', pos: WP_EXTRACT });
    orders.push({ verb: 'MOVE_HERO', pos: POST });
  } else {
    // parked: emit ONCE and drop when there, advancing only on a real refusal
    const unreachable = failedOrders.some((o) =>
      o.order?.verb === 'MOVE_HERO' && /UNREACHABLE/.test(o.reason || ''));
    if (unreachable && postIdx < POSTS.length - 1) postIdx++;
    const p = POSTS[postIdx];
    const d = Math.hypot((n.hero.x ?? 0) - p.x, (n.hero.z ?? 0) - p.z);
    if (d > 1.0) orders.push({ verb: 'MOVE_HERO', pos: p });
  }

  // 4) ONE ladder rung, plan-time affordable, with a GROUND/ECONOMY refusal partition.
  //    GROUND (out_of_zone / collision / UNREACHABLE / cap_reached) poisons the coordinate;
  //    ECONOMY (insufficient_gold) poisons NOTHING and retries.
  for (const o of failedOrders) {
    if (o.order?.verb !== 'BUILD') continue;
    const r = `${o.reason || ''} ${o.detail || ''}`.toLowerCase();
    if (/insufficient_gold/.test(r)) continue;
    if (o.order.where) ground.add(`${o.order.what}:${o.order.where.x},${o.order.where.z}`);
  }
  const byKind = n.works?.byKind || {};
  const seen = {};
  let rung = null;
  for (let i = 0; i < LADDER.length; i++) {
    const id = LADDER[i];
    seen[id] = (seen[id] || 0) + 1;
    if (retired.has(i)) continue;
    const standing = byKind[id] || 0;
    if (standing >= seen[id]) continue;          // this rung is already satisfied
    const spot = (SPOTS[id] || []).find(([x, z]) => !ground.has(`${id}:${x},${z}`));
    if (!spot) { retired.add(i); continue; }      // no candidates left -> RETIRE, never stall
    rung = { id, spot, price: priceOf(view, id, standing) };
    break;
  }
  const hurt = (n.hero.hp ?? 100) / (n.hero.maxHp ?? 100) < 0.55;
  if (rung && t < HARD_BUILD_STOP && (n.gold ?? 0) >= rung.price) {
    const rate = t > 40 ? Math.max(0.6, ((n.score?.goldPanned ?? 0) + (n.atomic?.wrangle?.pen?.incomeGranted ?? 0)) / t) * 0.9 : 99;
    const fortThin = (n.works?.standing ?? 0) < 4;
    const canRefill = (n.gold - rung.price) + rate * (SECURE_T - t) >= BANK_CAP + 5;
    if (fortThin || hurt || canRefill) {
      orders.push({ verb: 'BUILD', what: rung.id, where: { x: rung.spot[0], z: rung.spot[1] }, when: { goldGte: rung.price } });
    }
  }

  // 5) CAPTURE — the economy. Owns exactly one tick, then the record is spent,
  //    so stacking is safe and correct, and the misses buy decision points.
  const cap = 16;
  for (let i = 0; i < cap; i++) orders.push({ verb: 'CAPTURE' });

  // 6) harvest tail: nearest live seams only. An INACTIVE seam publishes x/z/anchorIndex
  //    as null, and one non-finite number refuses the WHOLE array silently.
  const live = (n.seams || [])
    .filter((s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map((s) => ({ ...s, d: Math.hypot(s.x - (n.hero.x ?? 0), s.z - (n.hero.z ?? 0)) }))
    .sort((a, b) => a.d - b.d);
  const near = live.filter((s) => s.d <= 30);
  const chain = near.length ? near : live.slice(0, 1);
  let slots = 32 - orders.length;
  if (chain.length) {
    for (let i = 0; i < slots; i++) orders.push({ verb: 'HARVEST', seam: chain[Math.floor(i / 6) % chain.length].id });
  }

  const trimmed = orders.slice(0, 32);

  // submission floor: the array carries a DRAINING worklist (CAPTURE/HARVEST), so it must
  // be resubmitted to re-arm; dedupe only on an unchanged signature with nothing pending.
  const sig = JSON.stringify(trimmed.slice(0, 4));
  const mustSend = !!n.pendingOffer || (stage && stage !== 'complete') || sig !== lastSig;
  if (!mustSend && t - lastSubmitT < 1.6) return null;
  lastSubmitT = t; lastSig = sig;
  return trimmed;
}

function priceOf(view, id, standing) {
  const b = (view.stablePrefix?.mechanics?.buildables || []).find((x) => x.id === id);
  if (!b || !b.costs || !b.costs.length) return 1e9;
  return b.costs[Math.min(standing, b.costs.length - 1)];
}
