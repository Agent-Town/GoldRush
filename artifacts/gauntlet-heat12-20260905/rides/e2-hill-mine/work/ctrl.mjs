// e2-hill-mine controller v1 — heat 12, opus-5.
//
// THE SECURE IS THE RAILCAR. `autoSecureWaveForRun` (HeadlessContractSim:1339) returns
// MAX_SAFE_INTEGER while `twist.baron && !baronBeaten`, and `bossKillSecuresRun` wants
// bossRemaining === 0, i.e. all three components (wheels/boiler/cabin) down.
//
// The railcar rides rail route 0: (-46,-2) (-24,-1) (0,0) (24,-1) (46,-2), railSpeed 1.9,
// pursuitRange 0 — it never deviates. The hero is welded at the claim (0,12); BLAST_AT
// reaches 10m, the rail is ~12 away, so NO HERO WEAPON CAN TOUCH IT (gen-3 finding, re-checked).
// Turrets are therefore the only boss damage, and their coverage of the rail is
// 2*sqrt(16^2 - d^2)/1.9 seconds per pass. build zone base-t1 is z 8..16, so the southern
// edge is worth ~30% more boss damage than the northern one. z=9 for zone safety.

const RAIL_ROW = 9;

// More candidates than slots (gen-14/35). GROUND refusals blacklist; economy refusals never do.
const TURRETS = [
  // gen-3's proven cluster span, moved to the rail-facing row.
  { x: -10, z: RAIL_ROW }, { x: -5, z: RAIL_ROW }, { x: 5, z: RAIL_ROW }, { x: 10, z: RAIL_ROW },
  { x: -15, z: RAIL_ROW }, { x: 15, z: RAIL_ROW }, { x: -10, z: 8 }, { x: 10, z: 8 },
  { x: 0, z: 8 }, { x: -10, z: 11 }, { x: 10, z: 11 }, { x: 0, z: 11 },
];
// The steam_wrecker enters at (0,46) and walks south with buildingDamageScale 2.5.
// A palisade line on base-t1's NORTH face is nearer to that gate than the turret row,
// so it eats the wrecking that took the fort from 8 works to 3 in tune-1.
const PALISADES = [
  { x: 0, z: 16 }, { x: -6, z: 16 }, { x: 6, z: 16 }, { x: -12, z: 16 },
  { x: 12, z: 16 }, { x: -18, z: 16 }, { x: 18, z: 16 }, { x: 3, z: 15 },
  { x: -3, z: 15 }, { x: -9, z: 15 }, { x: 9, z: 15 }, { x: 15, z: 15 },
];
const BEACONS = [
  { x: -7, z: 14 }, { x: 7, z: 14 }, { x: 0, z: 15 }, { x: -15, z: 13 },
  { x: 15, z: 13 }, { x: -7, z: 11 }, { x: 7, z: 11 }, { x: 0, z: 13 },
  { x: -20, z: 15 }, { x: 20, z: 15 }, { x: -3, z: 15 }, { x: 3, z: 15 },
];

const GROUND_REFUSALS = /out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable/i;

function dist(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

function scoreUpgrade(u) {
  const s = ((u.name || '') + ' ' + (u.effectText || '') + ' ' + (u.id || '')).toLowerCase();
  let v = 0;
  if (/plating|armor|armour|max health|maxhp|vigor|hearty|toughness/.test(s)) v += 100;
  if (/dressing|heal|regen|mend|recover/.test(s)) v += 80;
  if (/damage|spark|coil|tap|power|bolt/.test(s)) v += 40;
  if (/rate|speed|reload|fire/.test(s)) v += 30;
  if (/range/.test(s)) v += 20;
  if (/gold|pan|luck|seam/.test(s)) v += 5;
  return v;
}

export function decide(view, state) {
  const now = view.now || {};
  const sp = view.stablePrefix || {};

  if (!state.init) {
    state.init = true;
    state.blacklist = new Set();
    state.tries = new Map();
    const bs = sp.mechanics?.buildables || [];
    const find = (id) => bs.find(b => b.id === id) || null;
    const t = find('turret'), b = find('sentry_beacon');
    state.turretCosts = t?.costs || [50, 70, 95, 125];
    state.beaconCosts = b?.costs || [25, 35, 45, 55, 75, 95];
    state.turretMax = t?.maxCount ?? 4;
    state.beaconMax = b?.maxCount ?? 6;
    state.haveTurret = !!t;
    state.haveBeacon = !!b;
    const p = find('palisade');
    state.havePalisade = !!p;
    state.palisadeCosts = p?.costs || [10];
    // MEASURED tune-2: 8 palisades of chaff cost two beacons of gun and were all wrecked
    // (works 2, wrecked 11 at w12 vs w13/416.7s without them). Bait is a net loss here.
    state.palisadeWant = 0;
  }

  // Learn from refusals: GROUND reasons poison the coordinate, economy reasons never do.
  for (const rec of (now.orders || [])) {
    const o = rec.order || rec;
    if (rec.status !== 'failed' || !o || o.verb !== 'BUILD' || !o.where) continue;
    const key = `${o.what}@${o.where.x},${o.where.z}`;
    const reason = String(rec.reason || rec.detail || '');
    if (/insufficient_gold/i.test(reason)) continue;
    if (GROUND_REFUSALS.test(reason)) { state.blacklist.add(key); continue; }
    const n = (state.tries.get(key) || 0) + 1;
    state.tries.set(key, n);
    if (n >= 5) state.blacklist.add(key);
  }

  // The secure boundary: answer with a blank line so the default banks and the last
  // accepted order stays inside the tape envelope (F-HEAT11-1).
  if (now.pendingSecure) return null;

  const orders = [];
  const gold = now.gold ?? 0;

  // 1. The draft owns the tick first, under replace semantics.
  const offer = now.pendingOffer;
  if (Array.isArray(offer) && offer.length) {
    const best = offer.slice().sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    if (best && best.id) orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. Free supplementary damage on the scrum standing on the hero.
  if ((now.blastReadyInMs ?? 1) === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: 0, z: 10 } });
  }

  // 3. The build ladder: turrets to the rail row first (the ONLY boss damage), then beacons.
  //    Plan-time affordability with cumulative gating, so a cheap rung can never steal
  //    gold an expensive one is waiting for.
  const byKind = now.works?.byKind || {};
  const standing = new Set();
  for (const e of (now.works?.entries || [])) {
    if (e?.position) standing.add(`${Math.round(e.position.x)},${Math.round(e.position.z)}`);
    else if (typeof e?.x === 'number') standing.add(`${Math.round(e.x)},${Math.round(e.z)}`);
  }
  const occupied = (p) => {
    for (const s of standing) {
      const [sx, sz] = s.split(',').map(Number);
      if (Math.hypot(sx - p.x, sz - p.z) < 2.5) return true;
    }
    return false;
  };

  const ladder = [];
  const nT = byKind.turret || 0;
  const nB = byKind.sentry_beacon || 0;
  const nP = byKind.palisade || 0;
  const turretRung = (i) => ({ what: 'turret', cost: state.turretCosts[i] ?? 200, pool: TURRETS });
  const beaconRung = (i) => ({ what: 'sentry_beacon', cost: state.beaconCosts[i] ?? 120, pool: BEACONS });
  const palisadeRung = (i) => ({ what: 'palisade', cost: state.palisadeCosts[i] ?? 10, pool: PALISADES });
  // Turrets first (the ONLY boss damage and the best dps), then two cheap beacons,
  // then the chaff shield, then the rest of the beacon ladder.
  if (state.haveTurret) for (let i = nT; i < state.turretMax; i++) ladder.push(turretRung(i));
  if (state.haveBeacon) for (let i = nB; i < Math.min(2, state.beaconMax); i++) ladder.push(beaconRung(i));
  if (state.havePalisade) for (let i = nP; i < state.palisadeWant; i++) ladder.push(palisadeRung(i));
  if (state.haveBeacon) for (let i = Math.max(nB, 2); i < state.beaconMax; i++) ladder.push(beaconRung(i));

  const used = new Set();
  let cum = 0;
  for (const rung of ladder) {
    cum += rung.cost;
    if (cum > gold) break;                 // affordable RIGHT NOW, cumulatively
    const spot = rung.pool.find(p => {
      const key = `${rung.what}@${p.x},${p.z}`;
      return !state.blacklist.has(key) && !used.has(key) && !occupied(p);
    });
    if (!spot) break;
    used.add(`${rung.what}@${spot.x},${spot.z}`);
    orders.push({
      verb: 'BUILD', what: rung.what,
      where: { x: spot.x, z: spot.z },
      when: { goldGte: Math.max(0, Math.round(cum)) },
    });
    if (orders.length > 8) break;
  }

  // 4. Mend — only when it can actually pay on arrival (a travelling verb that fails
  //    for money is a commute, not a decision point).
  const wr = now.works?.wrecked ?? 0;
  const hp = now.works?.hp ?? 0, mhp = now.works?.maxHp ?? 0;
  if (gold >= 30 && (wr > 0 || (mhp > 0 && hp < mhp * 0.7))) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 65 });
  }

  // 5. The economy tail. Seams re-anchor live and sit behind the cliff (|x|>17 detour),
  //    so chain the two nearest LIVE seams in drain-sized blocks rather than round-robin.
  const pros = now.prospector || now.hero || { x: 0, z: 12 };
  const live = (now.seams || []).filter(s => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z));
  live.sort((a, b) => dist(pros, a) - dist(pros, b));
  const chain = live.slice(0, 3);
  const budget = Math.max(0, 30 - orders.length - 1);
  const per = chain.length ? Math.max(4, Math.floor(budget / chain.length)) : 0;
  outer:
  for (const s of chain) {
    for (let k = 0; k < per; k++) {
      if (orders.length >= 30) break outer;
      orders.push({ verb: 'HARVEST', seam: s.id });
    }
  }

  // 6. A terminal anchor that cannot be filtered away ([] is a wipe; an empty tail
  //    freezes the worker and stops emitting surprise views).
  const anchor = chain[0] || { x: 0, z: 14 };
  orders.push({ verb: 'HOLD', pos: { x: Number(anchor.x) || 0, z: Number(anchor.z) || 14 } });

  return orders.slice(0, 32).filter(o => o && typeof o.verb === 'string');
}
