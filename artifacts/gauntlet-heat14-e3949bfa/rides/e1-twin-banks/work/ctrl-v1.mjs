// e1-twin-banks controller — gen-99, the gen-6->98 skeleton retargeted.
// Contract: twist.secureWave 20 => waves and timeAlive PINNED (20 / 600.000s).
// Gold is therefore the ONLY free ranking axis, and the bank cap is the ceiling on it.
// cap = 200 + sum over UNWRECKED stockpiles of 150 * capMult[tier-1]  (capMult 1 / 1.6 / 2.4)
// A wrecked stockpile REMOVES its cap source while the purse keeps the gold (gen 82) -> ungated mend.

const SECURE_T = 600;
const HARD_BUILD_STOP = 556;      // no BUILD at all in the last ~44s (gen 85)
const CLAIM = { x: 0, z: -12 };

const TIER = { // Balance.tiers
  stockpile: [{ cost: 0, capMult: 1 }, { cost: 110, capMult: 1.6 }, { cost: 260, capMult: 2.4 }],
  turret: [{ cost: 0 }, { cost: 150 }, { cost: 300 }],
  sluice: [{ cost: 0 }, { cost: 120 }, { cost: 240 }],
};

// Candidate spots. More candidates than slots; vary BOTH axes (gen 98).
// Sluice ground is EXACT: z=-7, |x| in [11,20] (computed from the waterMask x riverPad 2).
const SPOTS = {
  turret: [[-8, -10], [8, -10], [-8, -15], [8, -15], [0, -9], [0, -17], [-13, -11], [13, -11], [-4, -9], [4, -9], [-12, -16], [12, -16]],
  sentry_beacon: [[-4, -10], [4, -10], [-4, -14], [4, -14], [0, -8], [-6, -12], [6, -12], [-2, -8], [2, -8], [0, -19], [-6, -16], [6, -16]],
  stockpile: [[-3, -17], [3, -17], [-2, -20], [2, -20], [0, -21], [-6, -19], [6, -19]],
  sluice: [[11, -7], [14, -7], [-11, -7], [17, -7], [-14, -7], [20, -7], [-17, -7], [-20, -7], [12, -7], [-12, -7], [18, -7], [15, -7]],
};

// Ladder in STRATEGY order (never price order). Sluices decay with the clock -> early.
const LADDER = [
  'turret', 'sluice', 'sluice', 'sluice', 'turret', 'sentry_beacon', 'stockpile',
  'sentry_beacon', 'turret', 'stockpile', 'sentry_beacon', 'turret', 'sentry_beacon',
  'sentry_beacon', 'sentry_beacon',
];

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
  const state = {
    ground: new Set(),          // coordinate blacklist: GROUND refusals only
    retired: new Set(),         // ladder indices with no candidates left
    rungTries: new Map(),
    lastSig: null,
    lastSubT: -99,
    diag: {},
    peakEarned: 0,
  };

  function costOf(view, id, builtCount) {
    const b = (view.stablePrefix.mechanics.buildables || []).find(x => x.id === id);
    if (!b) return null;
    const cs = b.costs || [];
    if (builtCount >= (b.maxCount ?? cs.length)) return null;
    return cs[Math.min(builtCount, cs.length - 1)] ?? null;
  }

  function fortValue(view, n) {
    // exact spend on standing+wrecked works, from the view's own price table
    let v = 0;
    const byKind = n.works?.byKind || {};
    for (const [id, cnt] of Object.entries(byKind)) {
      const b = (view.stablePrefix.mechanics.buildables || []).find(x => x.id === id);
      if (!b) continue;
      for (let i = 0; i < cnt; i++) v += b.costs[Math.min(i, b.costs.length - 1)] ?? 0;
    }
    for (const e of (n.works?.entries || [])) {
      const t = TIER[e.id];
      if (!t) continue;
      const tier = Math.max(1, e.tier ?? 1);
      for (let k = 1; k < tier; k++) v += t[k]?.cost ?? 0;
    }
    return v;
  }

  function liveCap(n) {
    let cap = 200;
    for (const e of (n.works?.entries || [])) {
      if (e.id !== 'stockpile' || e.wrecked) continue;
      const tier = Math.max(1, e.tier ?? 1);
      cap += 150 * (TIER.stockpile[tier - 1]?.capMult ?? 1);
    }
    return Math.round(cap);
  }

  function respond(view) {
    const n = view.now;
    const t = n.timers?.runSeconds ?? n.timers?.simTimeSeconds ?? 0;

    // pendingSecure: answer with SILENCE. Cannot be rejected; banks the default;
    // a rejected array inside the choice window is invisible to the tape and visible
    // to the sim, which diverges the replay (gen 84).
    if (n.pendingSecure) { state.lastSubT = t; return '\n'; }

    const orders = [];

    // 1. draft first, under replace semantics
    if (Array.isArray(n.pendingOffer) && n.pendingOffer.length) {
      const best = n.pendingOffer.slice().sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
      orders.push({ verb: 'PICK_UPGRADE', id: best.id });
    }

    // 2. free supplementary damage; returns {} either way, safe above travellers
    if ((n.blastReadyInMs ?? 1) === 0) {
      orders.push({ verb: 'BLAST_AT', pos: { x: CLAIM.x, z: CLAIM.z + 3 } });
    }

    // 3. ungated mend. Bounded to the rig radius around the Prospector since ADR-005
    //    stage 2, so it can no longer walk the worker off the map. A wrecked stockpile
    //    strands the purse above a fallen cap, so this is an ECONOMY order here.
    orders.push({ verb: 'REPAIR_UNDER', pct: 99 });

    // ---- economics -------------------------------------------------------
    const gold = n.gold ?? 0;
    const fv = fortValue(view, n);
    const stolen = n.score?.goldStolen ?? 0;
    const earned = gold + fv + stolen;           // undercounts repairs => rate biased LOW (protective)
    state.peakEarned = Math.max(state.peakEarned, earned);
    const rate = t > 20 ? (state.peakEarned / t) * 0.95 : 0;
    const remaining = Math.max(0, SECURE_T - t);
    const cap = liveCap(n);
    const projected = gold + rate * remaining;

    const wrecked = n.works?.wrecked ?? 0;
    const standing = n.works?.standing ?? 0;
    const hpFrac = (n.hero?.maxHp ?? 100) > 0 ? (n.hero?.hp ?? 0) / n.hero.maxHp : 1;
    const urgent = hpFrac < 0.75 || wrecked > 0 || standing < 4;

    state.diag = { cap, rate: +rate.toFixed(2), phase: t < 200 ? 'early' : (t > HARD_BUILD_STOP ? 'stop' : 'late') };

    // A rung is affordable-in-plan if paying for it does not cost the score.
    // Early: always (the fort must exist). Late: only if the purse still reaches the cap.
    const canSpend = (c) => {
      if (t >= HARD_BUILD_STOP) return false;            // hard floor, bypasses included
      if (t < 200) return true;
      if (urgent) return true;
      return (projected - c) >= cap + 10;
    };
    // A CAP-RAISER pays for itself exactly when the purse would otherwise pin.
    const capRaiserPays = (c) => t < HARD_BUILD_STOP && (projected - c) > cap + 5;

    // ---- the build ladder ------------------------------------------------
    const byKind = n.works?.byKind || {};
    const used = new Set();
    for (const e of (n.works?.entries || [])) {
      if (e.position) used.add(`${Math.round(e.position.x)},${Math.round(e.position.z)}`);
    }
    const counts = {};
    let emitted = 0;
    let budget = gold;
    for (let i = 0; i < LADDER.length && emitted < 6; i++) {
      if (state.retired.has(i)) continue;
      const id = LADDER[i];
      counts[id] = (counts[id] ?? 0);
      const already = byKind[id] ?? 0;
      // this rung is the (counts[id])'th of its kind beyond what stands
      if (already > counts[id]) { counts[id]++; continue; }
      const c = costOf(view, id, already + counts[id]);
      if (c == null) { state.retired.add(i); continue; }
      const spot = (SPOTS[id] || []).find(([x, z]) => !state.ground.has(`${id}@${x},${z}`) && !used.has(`${x},${z}`));
      if (!spot) {
        const tries = (state.rungTries.get(i) ?? 0) + 1;
        state.rungTries.set(i, tries);
        if (tries >= 3) state.retired.add(i);   // RETIRE the rung, never stall the ladder (gen 81)
        continue;
      }
      const gate = (id === 'stockpile') ? capRaiserPays(c) : canSpend(c);
      if (!gate) { counts[id]++; continue; }
      if (budget < c) break;                     // plan-time affordability; no pending gates
      orders.push({ verb: 'BUILD', what: id, where: { x: spot[0], z: spot[1] }, when: { goldGte: c } });
      used.add(`${spot[0]},${spot[1]}`);
      budget -= c;
      counts[id]++;
      emitted++;
    }

    // ---- the cap sink: stockpile tier upgrades ---------------------------
    // CONTEXT_ACTION does not travel and reaches 1.6, so it needs a MOVE_HERO park.
    let errand = null;
    if (emitted === 0 && t < HARD_BUILD_STOP) {
      const cands = (n.works?.entries || [])
        .map((e, idx) => ({ e, idx }))
        .filter(({ e }) => TIER[e.id] && !e.wrecked && Math.max(1, e.tier ?? 1) < TIER[e.id].length);
      // cap-raisers first, then turret dps as an overflow sink
      const rank = (e) => (e.id === 'stockpile' ? 0 : e.id === 'turret' ? 1 : 2);
      cands.sort((a, b) => rank(a.e) - rank(b.e));
      for (const { e } of cands) {
        const tier = Math.max(1, e.tier ?? 1);
        const cost = TIER[e.id][tier]?.cost;
        if (cost == null || gold < cost) continue;
        const pays = e.id === 'stockpile' ? capRaiserPays(cost) : canSpend(cost);
        if (!pays) continue;
        errand = { e, cost };
        break;
      }
    }

    const hx = n.hero?.x ?? CLAIM.x, hz = n.hero?.z ?? CLAIM.z;
    if (errand) {
      const p = errand.e.position;
      const dx = CLAIM.x - p.x, dz = CLAIM.z - p.z;
      const L = Math.hypot(dx, dz) || 1;
      const park = { x: +(p.x + (dx / L) * 0.7).toFixed(2), z: +(p.z + (dz / L) * 0.7).toFixed(2) };
      orders.push({ verb: 'MOVE_HERO', pos: park });
      orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: errand.e.id, index: errand.e.index } });
    } else if (Math.hypot(hx - CLAIM.x, hz - CLAIM.z) > 1.2) {
      orders.push({ verb: 'MOVE_HERO', pos: { x: CLAIM.x, z: CLAIM.z } });
    }

    // ---- the harvest tail: the throughput AND the clock -------------------
    // Inactive seams publish x/z/anchorIndex as null; one non-finite number refuses
    // the WHOLE array silently (gen 59). Filter before any sort.
    const px = n.prospector?.x ?? hx, pz = n.prospector?.z ?? hz;
    const live = (n.seams || [])
      .filter(s => s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z))
      .map(s => ({ ...s, d: Math.hypot(s.x - px, s.z - pz) }))
      .sort((a, b) => a.d - b.d);
    const slots = Math.max(0, 31 - orders.length);
    if (live.length) {
      const A = live[0].id, B = (live[1] || live[0]).id;
      const chain = [];
      // drain one seam in a BLOCK before walking (gen 47/98), alternating blocks (gen 76)
      while (chain.length < slots) {
        for (let k = 0; k < 7 && chain.length < slots; k++) chain.push(A);
        for (let k = 0; k < 7 && chain.length < slots; k++) chain.push(B);
      }
      for (const id of chain) orders.push({ verb: 'HARVEST', seam: id });
    }

    // ---- reel budget: blank-line an unchanged plan on a rapid surprise view
    const sig = JSON.stringify(orders);
    if (sig === state.lastSig && (t - state.lastSubT) < 2.5) return '\n';
    state.lastSig = sig; state.lastSubT = t;
    return JSON.stringify(orders.slice(0, 32)) + '\n';
  }

  return { respond, get diag() { return state.diag; } };
}
