// e3-moth-season controller v1 — heat 12, the rewritten light-circuit contract.
//
// What changed vs my generation-14 ride: the contract row now declares twist.powerGrid,
// which (a) adds a connect objective (one gallery powered by wave 12, one-way latch,
// missedDeadline => run-unsecurable) and (b) FILTERS `turret` out of the buildable roster
// (MechanicsManifest.ts:828 -> mechanicsBuildableIds -> the sim's own build gate).
// Gen-14 secured this map with FOUR TURRETS. That plan is dead. Beacons + palisades only.
//
// Objective discharge: a sentry_beacon within 2.5wu of the pylon site (0,-14) brings the
// relay online (HeadlessContractSim.syncContractPowerGrid:2370), which powers
// corridor-gallery, which latches canyonConnect complete FOREVER
// (syncCanyonConnectObjective:2442). So it only has to stand for one step.

const CLAIM = { x: 0, z: 12 };
const PYLON = { x: 0, z: -14 };

// ladder: strategy order, NOT price order (gen-39). Objective first, then the ring.
const LADDER = [
  { what: 'sentry_beacon', spots: [{ x: 0, z: -14 }, { x: 1, z: -14 }, { x: 0, z: -13 }, { x: -1, z: -14 }], tag: 'pylon' },
  { what: 'sentry_beacon', spots: [{ x: 0, z: 5 }, { x: 1, z: 4 }, { x: -1, z: 4 }, { x: 0, z: 3 }] },
  { what: 'sentry_beacon', spots: [{ x: -5, z: 11 }, { x: -5, z: 13 }, { x: -6, z: 11 }, { x: -4, z: 9 }] },
  { what: 'sentry_beacon', spots: [{ x: 5, z: 11 }, { x: 5, z: 13 }, { x: 6, z: 11 }, { x: 4, z: 9 }] },
  { what: 'sentry_beacon', spots: [{ x: -4, z: 18 }, { x: -5, z: 19 }, { x: -3, z: 19 }, { x: -6, z: 17 }] },
  { what: 'sentry_beacon', spots: [{ x: 4, z: 18 }, { x: 5, z: 19 }, { x: 3, z: 19 }, { x: 6, z: 17 }] },
];
// palisade chaff: bait the wreckers off the beacons, and block the corridor approach.
const PAL = [
  { x: 0, z: 20 }, { x: 0, z: 4 }, { x: -3, z: 20 }, { x: 3, z: 20 },
  { x: -3, z: 4 }, { x: 3, z: 4 }, { x: 0, z: 23 }, { x: 0, z: 1 },
  { x: -5, z: 22 }, { x: 5, z: 22 }, { x: -5, z: 2 }, { x: 5, z: 2 },
  { x: 0, z: 26 }, { x: 0, z: -2 }, { x: -3, z: 24 }, { x: 3, z: 24 },
];
const PAL_COST = 10;

const blacklist = new Set();      // "x,z" coords the view has refused
const attempts = new Map();       // coord -> tries (patience budget, gen-33)
const key = p => `${p.x},${p.z}`;
const d2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name || ''} ${o.effectText || ''}`.toLowerCase();
  let v = 0;
  if (/plating|max hp|maxhp|health|vitality|tough/.test(s)) v += 100;
  if (/dressing|heal|regen|mend|recover/.test(s)) v += 80;
  if (/spark|damage|coil|tap|volley|power/.test(s)) v += 40;
  if (/blast|charge|radius/.test(s)) v += 25;
  if (/beacon|turret|work/.test(s)) v += 20;
  if (/speed|heels|move/.test(s)) v += 5;
  if (/luck|pan|gold|seam/.test(s)) v += 3;
  return v;
}

export function decide(view, ctx) {
  const now = view.now;

  // pendingSecure accepts EXACTLY one order and refuses anything else (gen-9).
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];

  // harvest refusal / build refusal blacklist, fed from the view's own order records (gen-35).
  for (const rec of (now.orders || [])) {
    const o = rec.order || rec;
    if (o && o.verb === 'BUILD' && rec.status === 'failed' && o.where) {
      const det = String(rec.reason || rec.detail || '');
      if (!/insufficient_gold/.test(det)) {
        const k = key(o.where);
        attempts.set(k, (attempts.get(k) || 0) + 1);
        if ((attempts.get(k) || 0) >= 2) blacklist.add(k);
      }
    }
  }

  const out = [];

  // 1. the draft, first in the array under replace semantics (gen-5).
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. what is standing, read from works.entries (gen-10: byKind cannot tell you WHICH slot).
  const entries = (now.works && now.works.entries) || [];
  const standing = entries.filter(e => !e.wrecked && (e.hp === undefined || e.hp > 0));
  const beaconPos = standing.filter(e => e.id === 'sentry_beacon').map(e => e.position || e);
  const palPos = standing.filter(e => e.id === 'palisade').map(e => e.position || e);
  const nBeacon = beaconPos.length;
  const costs = [25, 35, 45, 55, 75, 95];

  // 3. the ladder: emit the next unbuilt rungs as a plan-time-affordable, non-decreasing
  //    price prefix (gen-9 + gen-28). One rung per built beacon; skip filled slots.
  let gold = now.gold || 0;
  let rung = 0;
  for (const step of LADDER) {
    // is this rung already satisfied? (a standing beacon within 3wu of any of its spots)
    const filled = step.spots.some(sp => beaconPos.some(b => d2(b, sp) < 3));
    if (filled) { rung++; continue; }
    const cost = costs[Math.min(nBeacon, costs.length - 1)];
    if (gold < cost) break;
    const spot = step.spots.find(sp => !blacklist.has(key(sp)));
    if (!spot) { rung++; continue; }
    out.push({ verb: 'BUILD', what: 'sentry_beacon', where: spot, when: { goldGte: cost } });
    gold -= cost;
    break; // one beacon trip in flight (gen-33) — the pylon walk is 26wu.
  }

  // 4. palisade chaff, only with surplus, only when the beacon ladder is not starved.
  if (nBeacon >= 2) {
    let placed = 0;
    for (const p of PAL) {
      if (placed >= 3) break;
      if (blacklist.has(key(p))) continue;
      if (palPos.some(q => d2(q, p) < 2.5)) continue;
      if (gold < PAL_COST) break;
      out.push({ verb: 'BUILD', what: 'palisade', where: p, when: { goldGte: PAL_COST } });
      gold -= PAL_COST; placed++;
    }
  }

  // 5. mend what stands. Falls through for free when nothing qualifies.
  if (entries.some(e => e.wrecked || (e.hp !== undefined && e.maxHp && e.hp < e.maxHp * 0.6))) {
    out.push({ verb: 'REPAIR_UNDER', pct: 60 });
  }

  // 6. the tail: stack HARVEST on live seams near the claim, chained by mutual distance
  //    (gen-38). Seams here sit 9-19wu out, so chaining is cheap and buys decision points.
  const live = (now.seams || []).filter(s => s.active !== false)
    .map(s => ({ id: s.id, x: s.x, z: s.z, d: d2(s, CLAIM) }))
    .sort((a, b) => a.d - b.d);
  const chain = [];
  for (const s of live) {
    if (chain.length === 0) { chain.push(s); continue; }
    if (chain.length >= 3) break;
    if (d2(s, chain[chain.length - 1]) < 26) chain.push(s);
  }
  const room = 32 - out.length;
  if (chain.length) {
    for (let i = 0; i < room; i++) {
      out.push({ verb: 'HARVEST', seam: chain[i % chain.length].id });
    }
  }
  return out.slice(0, 32);
}
