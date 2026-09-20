// e3-moth-season controller v2 — heat 12.
//
// tune-1 measurements that drove every change here:
//  * the connect objective LATCHED at t=30 for 25 gold (one sentry_beacon on the pylon site
//    (0,-14)); `canyonConnect.complete` stayed true afterwards even when `powered` fell to 0
//    with the beacon wrecked. So the era's objective is a 25-gold, one-order errand.
//  * `score.goldPanned` FROZE at 180 from t=110 to t=200. Cause: REPAIR_UNDER is a TRAVELLING
//    verb that was re-issued every view with 0 gold, so it walked, failed, walked back, forever
//    (gen-40's lesson, paid again). REMOVED.
//  * palisades ate 120 gold in 10-gold bites and every one of them was wrecked by wave 7 —
//    the classic cheap-rung-starves-the-expensive-one bug. Only 2 beacons ever stood. With
//    turrets filtered out by twist.powerGrid, beacons are the ONLY damage on this board.
//    REMOVED; every gold now goes down the beacon ladder.
//  * 437,836 bytes at wave 8 against a 576,176-byte ceiling => a wave-12 ride on that policy
//    is refused reel_too_large (F-HEAT12-2). Cured with the blank-line rule: gr-sim's
//    readOrders returns on an empty line WITHOUT recording an entry, so a view that needs no
//    new order set costs nothing.

const CLAIM = { x: 0, z: 12 };

// Beacon ladder, strategy order (gen-39): the objective rung first at 25g, then the ring.
// Radius 8 against a hero welded at (0,12), so every ring spot is inside 8wu of the claim.
const LADDER = [
  { spots: [{ x: 0, z: -14 }, { x: 1, z: -14 }, { x: 0, z: -13 }, { x: -1, z: -14.5 }] }, // pylon site
  { spots: [{ x: 0, z: 5 }, { x: 1, z: 4 }, { x: -1, z: 4 }, { x: 0, z: 3 }] },
  { spots: [{ x: -5, z: 11 }, { x: -5, z: 13 }, { x: -6, z: 11 }, { x: -4, z: 9 }] },
  { spots: [{ x: 5, z: 11 }, { x: 5, z: 13 }, { x: 6, z: 11 }, { x: 4, z: 9 }] },
  { spots: [{ x: -4, z: 18 }, { x: -5, z: 19 }, { x: -3, z: 19 }, { x: -6, z: 17 }] },
  { spots: [{ x: 4, z: 18 }, { x: 5, z: 19 }, { x: 3, z: 19 }, { x: 6, z: 17 }] },
];
const COSTS = [25, 35, 45, 55, 75, 95];

const blacklist = new Set();
const attempts = new Map();
const key = p => `${p.x},${p.z}`;
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

let lastSig = null;

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name || ''} ${o.effectText || ''}`.toLowerCase();
  let v = 0;
  if (/plating|max hp|maxhp|vitality|tough/.test(s)) v += 100;
  if (/dressing|heal|regen|mend|patch/.test(s)) v += 90;
  if (/spark|coil|tap|volley|damage/.test(s)) v += 45;
  if (/dynamo|beacon|sentry/.test(s)) v += 30;
  if (/blast|powder|charge/.test(s)) v += 25;
  if (/speed|heels/.test(s)) v += 5;
  if (/luck|pan|gold|seam|assay/.test(s)) v += 2;
  return v;
}

export function decide(view, ctx) {
  const now = view.now;

  // exactly one order at the secure boundary (gen-9).
  if (now.pendingSecure) { lastSig = null; return [{ verb: 'SECURE_CHOICE', choice: 'bank' }]; }

  // let the view name the coordinates that refuse (gen-35).
  let pendingHarvest = 0;
  for (const rec of (now.orders || [])) {
    const o = rec.order || rec;
    if (!o) continue;
    if (o.verb === 'HARVEST' && (rec.status === 'pending' || rec.status === 'active')) pendingHarvest++;
    if (o.verb === 'BUILD' && rec.status === 'failed' && o.where) {
      const det = String(rec.reason || rec.detail || '');
      if (!/insufficient_gold|INSUFFICIENT/i.test(det)) {
        const k = key(o.where);
        attempts.set(k, (attempts.get(k) || 0) + 1);
        if (attempts.get(k) >= 2) blacklist.add(k);
      }
    }
  }

  const entries = (now.works && now.works.entries) || [];
  // A wrecked frame still holds its ground and still counts against maxCount and the cost
  // curve, so slot occupancy is read from ALL placed beacons, not just the standing ones.
  const beaconAll = entries.filter(e => e.id === 'sentry_beacon').map(e => e.position || e);
  const nBeacon = beaconAll.length;

  const out = [];
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // the ladder: one trip in flight, emitted only when the gold is already in hand (gen-17/28).
  const gold = now.gold || 0;
  let nextSpot = null;
  for (const step of LADDER) {
    if (step.spots.some(sp => beaconAll.some(b => dist(b, sp) < 3))) continue;
    const spot = step.spots.find(sp => !blacklist.has(key(sp)));
    if (!spot) continue;
    nextSpot = spot; break;
  }
  const cost = COSTS[Math.min(nBeacon, COSTS.length - 1)];
  if (nextSpot && gold >= cost) {
    out.push({ verb: 'BUILD', what: 'sentry_beacon', where: nextSpot, when: { goldGte: cost } });
  }

  // free supplementary damage into the scrum standing on the welded hero. One per array;
  // the record is consumed either way, so it never eats a later tick.
  if ((now.blastReadyInMs ?? 1) === 0) out.push({ verb: 'BLAST_AT', pos: { x: 0, z: 14 } });

  // the tail. Seams here sit 9-20wu from the claim but 47wu apart end to end, so the chain is
  // filtered by MUTUAL distance as well as by distance to the claim (gen-38); a loose chain is
  // a commute generator and it is what froze tune-1's purse.
  const live = (now.seams || []).filter(s => s.active !== false)
    .map(s => ({ id: s.id, x: s.x, z: s.z, d: dist(s, CLAIM) }))
    .filter(s => s.d <= 24)
    .sort((a, b) => a.d - b.d);
  const chain = [];
  for (const s of live) {
    if (chain.length >= 3) break;
    if (chain.length === 0 || dist(s, chain[chain.length - 1]) <= 18) chain.push(s);
  }
  const use = chain.length ? chain : live.slice(0, 1);
  const room = Math.min(32 - out.length, 26);
  for (let i = 0; i < room && use.length; i++) out.push({ verb: 'HARVEST', seam: use[i % use.length].id });

  const arr = out.slice(0, 32);

  // THE REEL BUDGET. Only pay for an entry when the order set actually has to change, or when
  // the worklist is close to drained. Everything else is answered with a blank line, which
  // gr-sim accepts and does NOT record (gen-40).
  const sig = JSON.stringify([nBeacon, nextSpot, use.map(s => s.id), !!now.pendingOffer, blacklist.size]);
  const mustSpeak = !!now.pendingOffer || pendingHarvest < 8 || sig !== lastSig || ctx.views.length === 1;
  if (!mustSpeak) return 'BLANK';
  lastSig = sig;
  return arr;
}
