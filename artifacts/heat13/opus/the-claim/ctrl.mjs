// the-claim controller — post-ADR-005 grammar (no MOVE_TO / HOLD / FALLBACK_IF).
// Contract: twist.secureWave 10 => waves 10 and timeAlive 300.000s are PINNED.
// Gold (bank cap 200) is therefore the ONLY free ranking axis.
//
// Shape:
//   PICK_UPGRADE (plating-first)  ->  BLAST_AT (free window)  ->  REPAIR_UNDER (gated)
//   -> <=3 ladder rungs, plan-time affordable, ladder order, budget-decremented
//   -> HARVEST tail, one seam drained in a block before walking
// The hero starts on the claim (0,12) and wants to stay: it has no drift, so
// SILENCE is the hold. Zero MOVE_HERO orders are issued.
//
// BANK GATE: allow a spend of C only if (gold - C) + rate*(SECURE_T - t) >= 205,
// so the purse is guaranteed time to refill to the 200 cap by the secure tick.

const SECURE_T = 300;
const BANK_TARGET = 205;
const HARD_STOP_SPEND = 245;
const CLAIM = { x: 0, z: 12 };

const COSTS = {
  turret: [50, 70, 95, 125],
  sentry_beacon: [25, 35, 45, 55, 75, 95],
  sluice: [40, 40, 40],
  palisade: new Array(48).fill(10),
};

// More candidate spots than slots; a refusal blacklist strikes the bad ones.
const SPOTS = {
  turret: [[0, 9], [-6, 10], [6, 10], [0, 16], [-8, 14], [8, 14], [-4, 17], [4, 17], [-9, 11], [9, 11]],
  sentry_beacon: [[0, 15], [-4, 14], [4, 14], [-5, 10], [5, 10], [0, 18], [-6, 16], [6, 16], [-3, 8], [3, 8], [-7, 13], [7, 13]],
  sluice: [[9.5, 6.3], [-11, 6.3], [16, 6.3], [-17, 6.3], [13, 6.3], [-14, 6.3], [20, 6.3], [-20, 6.3]],
  palisade: [[0, 18.5], [4.6, 16.6], [-4.6, 16.6], [6.5, 12], [-6.5, 12], [4.6, 7.4], [-4.6, 7.4], [0, 6.2],
             [9, 17], [-9, 17], [11, 12], [-11, 12], [9, 7.5], [-9, 7.5], [2.5, 19.5], [-2.5, 19.5],
             [13, 16], [-13, 16], [14, 9], [-14, 9], [0, 21], [5, 20.5], [-5, 20.5], [8, 20]],
};

// Ladder: interleave the guns with the sluices (income first pays for the guns),
// then the beacon rungs, then palisades as a pure overflow sink so the purse can
// never pin at the cap mid-run (a full purse REFUSES credits, i.e. stops income).
const LADDER = [
  'turret', 'sluice', 'turret', 'sluice', 'turret', 'sluice',
  'sentry_beacon', 'turret', 'sentry_beacon', 'sentry_beacon',
  'sentry_beacon', 'sentry_beacon', 'sentry_beacon',
  ...new Array(20).fill('palisade'),
];

const GROUND_FAIL = /out_of_zone|collision|cap_reached|unreachable|out_of_reach|not legal|outside/i;
const ECON_FAIL = /insufficient_gold/i;

const strikes = new Map();   // "kind@x,z" -> count
const banned = new Set();
let sawSecure = 0;

function key(kind, x, z) { return `${kind}@${x},${z}`; }

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
  let v = 0;
  if (/plating|max hp|maxhp|health|vitality|tough|hardy/.test(s)) v += 100;
  if (/dressing|heal|regen|mend|patch/.test(s)) v += 80;
  if (/damage|spark|coil|tap|power|bolt|blast/.test(s)) v += 40;
  if (/rate|speed|fire|reload|cadence/.test(s)) v += 30;
  if (/range|reach/.test(s)) v += 20;
  if (/gold|luck|pan|prospect|seam/.test(s)) v += 5;
  return v;
}

export default function controller(view, state) {
  const now = view.now || {};
  const t = now.timers?.runSeconds ?? 0;
  const gold = now.gold ?? 0;
  const panned = now.score?.goldPanned ?? 0;

  // --- secure boundary: blank line lets the configured `bank` default fire, and
  // keeps the last accepted order well inside the tick envelope.
  if (now.pendingSecure) {
    sawSecure++;
    if (sawSecure === 1) return null;
    return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  }

  // --- refusal blacklist, fed from the view's own order records.
  for (const rec of (now.orders || [])) {
    const o = rec?.order || rec;
    if (!o || o.verb !== 'BUILD' || !o.where) continue;
    const st = String(rec?.status || '');
    const why = `${rec?.reason || ''} ${rec?.detail || ''}`;
    if (!/fail|reject|refus/i.test(st) && !GROUND_FAIL.test(why)) continue;
    if (ECON_FAIL.test(why)) continue;               // economy: retry, poison nothing
    const k = key(o.what, o.where.x, o.where.z);
    const n = (strikes.get(k) || 0) + 1;
    strikes.set(k, n);
    if (n >= 3 || GROUND_FAIL.test(why)) banned.add(k);
  }

  const orders = [];

  // 1. draft first (replace semantics: it must own the array's head)
  if (Array.isArray(now.pendingOffer) && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    if (best?.id) orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. free blast window — costs no gold, returns {} either way, owns no tick.
  if ((now.blastReadyInMs ?? 1) === 0 && (now.threats?.alive ?? 0) > 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: 0, z: 15 } });
  }

  // 3. mend, only when there is something to mend AND money to do it with
  const wrecked = now.works?.wrecked ?? 0;
  const hp = now.works?.hp ?? 0, maxHp = now.works?.maxHp ?? 0;
  if (gold >= 25 && (wrecked > 0 || (maxHp > 0 && hp < maxHp * 0.7))) {
    orders.push({ verb: 'REPAIR_UNDER', pct: 65 });
  }

  // 4. ladder — plan-time affordable, ladder order, budget decremented so a cheap
  //    rung can never steal gold an expensive one is still waiting for.
  const byKind = now.works?.byKind || {};
  const built = { turret: 0, sentry_beacon: 0, sluice: 0, palisade: 0 };
  for (const k of Object.keys(built)) built[k] = byKind[k] || 0;

  const rate = Math.max(1.6, panned / Math.max(t, 12));
  const runway = rate * Math.max(0, SECURE_T - t);
  const placed = { ...built };
  let budget = gold;
  let emitted = 0;

  if (t < HARD_STOP_SPEND) {
    for (const kind of LADDER) {
      if (emitted >= 3) break;
      const idx = placed[kind];
      const curve = COSTS[kind];
      if (idx >= curve.length) continue;             // this kind's ladder is capped
      const cost = curve[idx];
      if (budget < cost) break;                      // ladder order: wait, don't skip ahead
      // BANK GATE — the purse must still be able to reach the cap by the secure tick.
      if ((gold - (gold - budget) - cost) + runway < BANK_TARGET) break;
      const spot = SPOTS[kind].find((p) => !banned.has(key(kind, p[0], p[1])));
      if (!spot) { placed[kind] = curve.length; continue; }   // no legal ground left
      orders.push({ verb: 'BUILD', what: kind, where: { x: spot[0], z: spot[1] }, when: { goldGte: cost } });
      banned.add(key(kind, spot[0], spot[1]) + '#inflight');   // no-op marker
      placed[kind] = idx + 1;
      budget -= cost;
      emitted++;
    }
  }

  // 5. harvest tail — the throughput AND the clock. Failures here are free
  //    (the Prospector already stands where it pans) and buy decision points.
  const seams = (now.seams || [])
    .filter((s) => s && s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map((s) => ({ id: s.id, d: Math.hypot(s.x - CLAIM.x, s.z - CLAIM.z) }))
    .sort((a, b) => a.d - b.d);

  const slots = Math.max(0, 31 - orders.length);
  if (seams.length) {
    const per = 7;
    let n = 0;
    for (const s of seams) {
      for (let i = 0; i < per && n < slots; i++, n++) orders.push({ verb: 'HARVEST', seam: s.id });
      if (n >= slots) break;
    }
    // top up from the nearest seam if slots remain
    let i = 0;
    while (orders.length < 31) orders.push({ verb: 'HARVEST', seam: seams[i++ % seams.length].id });
  } else {
    // never ship an empty array: [] wipes the order set.
    orders.push({ verb: 'BLAST_AT', pos: { x: 0, z: 15 } });
  }

  state.dbg = { t: +t.toFixed(1), gold, panned, rate: +rate.toFixed(2), runway: +runway.toFixed(0), built, emitted, banned: banned.size };
  return orders.slice(0, 32);
}
