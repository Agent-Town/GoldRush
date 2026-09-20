// e1-twin-banks controller v2 — one changed CAUSE from v1, several faces:
//   v1's tier sink outranked the fort. It fired whenever the ladder emitted nothing
//   this view, whitelisted turret+sluice+stockpile, and drove all three to tier 3 —
//   ~2,000 gold — so the ladder stalled at 8 of 15 works and the fort collapsed from
//   wave 16 (standing 8 -> 3, wrecked 0 -> 5) and the hero died at t=586.7, 13.3s short.
//
// The arithmetic the fix rests on:
//   BUILD stockpile   60g -> +150 cap  => net +90   ALWAYS WIN
//   tier2 stockpile  110g ->  +90 cap  => net -20   only if surplus > cap + 110
//   tier3 stockpile  260g -> +120 cap  => net -140  only if surplus > cap + 260
//   turret/sluice tiers raise NO cap at all -> they are pure score loss unless the
//   purse would otherwise pin with the fort already complete.
//
// twist.secureWave 20 pins waves at 20 and timeAlive at 600.000s, so GOLD IS THE ONLY
// FREE RANKING AXIS and the bank cap is the ceiling on it. Measured income ~4.5 g/s,
// so the purse refills 500 in ~110s: stop ALL spending at t=470.

const SECURE_T = 600;
const SPEND_STOP = 470;           // arithmetic, not a guess: cap(500) / measured rate(~4.5) = ~110s
const CLAIM = { x: 0, z: -12 };

const TIER = {
  stockpile: [{ cost: 0, capMult: 1 }, { cost: 110, capMult: 1.6 }, { cost: 260, capMult: 2.4 }],
  turret: [{ cost: 0 }, { cost: 150 }, { cost: 300 }],
};
const SINKABLE = new Set(['stockpile', 'turret']);   // NEVER sluice; its tier buys no cap and no defence

const SPOTS = {
  turret: [[-8, -10], [8, -10], [-8, -15], [8, -15], [0, -9], [0, -17], [-13, -11], [13, -11], [-4, -9], [4, -9], [-12, -16], [12, -16]],
  sentry_beacon: [[-4, -10], [4, -10], [-4, -14], [4, -14], [0, -8], [-6, -12], [6, -12], [-2, -8], [2, -8], [0, -19], [-6, -16], [6, -16]],
  stockpile: [[-3, -17], [3, -17], [-2, -20], [2, -20], [0, -21], [-6, -19], [6, -19]],
  sluice: [[11, -7], [14, -7], [-11, -7], [17, -7], [-14, -7], [20, -7], [-17, -7], [-20, -7], [12, -7], [-12, -7], [18, -7], [15, -7]],
  palisade: [[-6, -8], [6, -8], [-10, -12], [10, -12], [-6, -18], [6, -18], [0, -6.5], [-11, -9], [11, -9], [-11, -15], [11, -15], [0, -22]],
};

// STRATEGY order. Sluices decay with the clock; stockpiles are +90 net each; then the fort.
const LADDER = [
  'turret', 'sluice', 'sluice', 'sluice', 'turret', 'stockpile', 'stockpile',
  'sentry_beacon', 'sentry_beacon', 'turret', 'sentry_beacon', 'turret',
  'sentry_beacon', 'sentry_beacon', 'sentry_beacon',
  'palisade', 'palisade', 'palisade', 'palisade', 'palisade', 'palisade',
];
const CORE_RUNGS = 15;            // everything before the palisade chaff is the fort proper

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name || ''} ${o.effectText || ''}`.toLowerCase();
  let v = 0;
  if (/plating|dressing|vigor|health|hit point|max hp|maxhp|tough|hardy|constitution/.test(s)) v += 100;
  if (/heal|regen|mend|recover/.test(s)) v += 70;
  if (/damage|spark|coil|tap|power|volley|pierce/.test(s)) v += 40;
  if (/rate|fire|reload|cadence/.test(s)) v += 30;
  if (/gold|pan|luck|prospect|yield/.test(s)) v += 22;
  if (/range|radius/.test(s)) v += 15;
  if (/speed|heel|stride/.test(s)) v += 8;
  return v;
}

export default function make() {
  const state = { ground: new Set(), retired: new Set(), rungTries: new Map(), lastSig: null, lastSubT: -99, diag: {}, peakEarned: 0 };

  function buildable(view, id) { return (view.stablePrefix.mechanics.buildables || []).find(x => x.id === id); }
  function costOf(view, id, builtCount) {
    const b = buildable(view, id); if (!b) return null;
    if (builtCount >= (b.maxCount ?? b.costs.length)) return null;
    return b.costs[Math.min(builtCount, b.costs.length - 1)] ?? null;
  }
  function fortValue(view, n) {
    let v = 0;
    for (const [id, cnt] of Object.entries(n.works?.byKind || {})) {
      const b = buildable(view, id); if (!b) continue;
      for (let i = 0; i < cnt; i++) v += b.costs[Math.min(i, b.costs.length - 1)] ?? 0;
    }
    for (const e of (n.works?.entries || [])) {
      const t = TIER[e.id]; if (!t) continue;
      for (let k = 1; k < Math.max(1, e.tier ?? 1); k++) v += t[k]?.cost ?? 0;
    }
    return v;
  }
  function liveCap(n) {
    let cap = 200;
    for (const e of (n.works?.entries || [])) {
      if (e.id !== 'stockpile' || e.wrecked) continue;
      cap += 150 * (TIER.stockpile[Math.max(1, e.tier ?? 1) - 1]?.capMult ?? 1);
    }
    return Math.round(cap);
  }

  function respond(view) {
    const n = view.now;
    const t = n.timers?.runSeconds ?? n.timers?.simTimeSeconds ?? 0;
    if (n.pendingSecure) { state.lastSubT = t; return '\n'; }   // silence: cannot be rejected (gen 84)

    const orders = [];
    if (Array.isArray(n.pendingOffer) && n.pendingOffer.length) {
      const best = n.pendingOffer.slice().sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
      orders.push({ verb: 'PICK_UPGRADE', id: best.id });
    }
    if ((n.blastReadyInMs ?? 1) === 0) orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z + 3 } });
    orders.push({ verb: 'REPAIR_UNDER', pct: 99 });

    const gold = n.gold ?? 0;
    const earned = gold + fortValue(view, n) + (n.score?.goldStolen ?? 0);
    state.peakEarned = Math.max(state.peakEarned, earned);
    const rate = t > 20 ? (state.peakEarned / t) * 0.95 : 0;
    const remaining = Math.max(0, SECURE_T - t);
    const cap = liveCap(n);
    const projected = gold + rate * remaining;

    // ---- the ladder: the fort outranks every sink -------------------------
    const byKind = n.works?.byKind || {};
    const used = new Set();
    for (const e of (n.works?.entries || [])) if (e.position) used.add(`${Math.round(e.position.x)},${Math.round(e.position.z)}`);

    const counts = {};
    let emitted = 0, budget = gold, coreIncomplete = false;
    for (let i = 0; i < LADDER.length; i++) {
      if (state.retired.has(i)) continue;
      const id = LADDER[i];
      counts[id] = counts[id] ?? 0;
      if ((byKind[id] ?? 0) > counts[id]) { counts[id]++; continue; }
      const c = costOf(view, id, (byKind[id] ?? 0) + counts[id]);
      if (c == null) { state.retired.add(i); continue; }
      const spot = (SPOTS[id] || []).find(([x, z]) => !state.ground.has(`${id}@${x},${z}`) && !used.has(`${Math.round(x)},${Math.round(z)}`));
      if (!spot) {
        const tries = (state.rungTries.get(i) ?? 0) + 1; state.rungTries.set(i, tries);
        if (tries >= 3) state.retired.add(i);         // RETIRE, never stall the ladder behind it (gen 81)
        continue;
      }
      if (i < CORE_RUNGS) coreIncomplete = true;
      // the fort proper buys while the clock allows, full stop: a dead run banks nothing.
      // the chaff tail buys only when it cannot cost the score.
      const allowed = t < SPEND_STOP && (i < CORE_RUNGS || (projected - c) >= cap + 20);
      if (!allowed) { counts[id]++; continue; }
      if (emitted >= 6) { counts[id]++; continue; }
      if (budget < c) break;                           // plan-time affordability; no pending gates
      orders.push({ verb: 'BUILD', what: id, where: { x: spot[0], z: spot[1] }, when: { goldGte: c } });
      used.add(`${Math.round(spot[0])},${Math.round(spot[1])}`);
      budget -= c; counts[id]++; emitted++;
    }

    // ---- the sink: STRICTLY after the fort proper stands ------------------
    let errand = null;
    if (!coreIncomplete && t < SPEND_STOP) {
      const cands = (n.works?.entries || [])
        .filter(e => SINKABLE.has(e.id) && !e.wrecked && Math.max(1, e.tier ?? 1) < TIER[e.id].length)
        .sort((a, b) => (a.id === 'stockpile' ? 0 : 1) - (b.id === 'stockpile' ? 0 : 1));
      for (const e of cands) {
        const tier = Math.max(1, e.tier ?? 1);
        const cost = TIER[e.id][tier]?.cost;
        if (cost == null || gold < cost) continue;
        let pays;
        if (e.id === 'stockpile') {
          const capAfter = cap - 150 * TIER.stockpile[tier - 1].capMult + 150 * TIER.stockpile[tier].capMult;
          pays = (projected - cost) >= capAfter;       // exact: only when the purse would otherwise pin
        } else {
          pays = (projected - cost) >= cap + 20;       // turret dps as pure overflow, never at the score's expense
        }
        if (!pays) continue;
        errand = { e, cost }; break;
      }
    }

    const hx = n.hero?.x ?? CLAIM.x, hz = n.hero?.z ?? CLAIM.z;
    if (errand) {
      const p = errand.e.position;
      const dx = CLAIM.x - p.x, dz = CLAIM.z - p.z, L = Math.hypot(dx, dz) || 1;
      orders.push({ verb: 'MOVE_HERO', pos: { x: +(p.x + dx / L * 0.7).toFixed(2), z: +(p.z + dz / L * 0.7).toFixed(2) } });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: errand.e.id, index: errand.e.index } });
    } else if (Math.hypot(hx - CLAIM.x, hz - CLAIM.z) > 1.2) {
      orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
    }

    state.diag = { cap, rate: +rate.toFixed(2), phase: coreIncomplete ? 'fort' : (t < SPEND_STOP ? 'sink' : 'bank') };

    // ---- the harvest tail: the throughput AND the clock -------------------
    const px = n.prospector?.x ?? hx, pz = n.prospector?.z ?? hz;
    const live = (n.seams || [])
      .filter(s => s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z))
      .map(s => ({ ...s, d: Math.hypot(s.x - px, s.z - pz) }))
      .sort((a, b) => a.d - b.d);
    const slots = Math.max(0, 31 - orders.length);
    if (live.length) {
      const A = live[0].id, B = (live[1] || live[0]).id;
      const chain = [];
      while (chain.length < slots) {
        for (let k = 0; k < 7 && chain.length < slots; k++) chain.push(A);
        for (let k = 0; k < 7 && chain.length < slots; k++) chain.push(B);
      }
      for (const id of chain) orders.push({ verb: 'HARVEST', seam: id });
    }

    const sig = JSON.stringify(orders);
    if (sig === state.lastSig && (t - state.lastSubT) < 2.5) return '\n';
    state.lastSig = sig; state.lastSubT = t;
    return JSON.stringify(orders.slice(0, 32)) + '\n';
  }
  return { respond, get diag() { return state.diag; } };
}
