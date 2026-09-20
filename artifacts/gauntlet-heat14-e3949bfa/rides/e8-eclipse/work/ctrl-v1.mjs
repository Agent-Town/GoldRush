// e8-eclipse controller — gen 110.
// Board facts (measured this heat, not inherited):
//   suit.body = hero; reserve dome = dome-cluster-pad-center (contains the origin);
//   regolith required 4, windowWaves 4 (one fresh ground per 120s window), requiredAfter 1;
//   eclipse lands wave 10 (ceil(secureWave/2)) and takes west+east pads offline;
//   roster has NO wrecker and NO thief -> nothing attackable, nothing stealable,
//     so stockpile is safe: cap 200 -> 500, and 500 is the ranked ceiling.
// Ranked axis: waves and timeAlive are pinned by the wave-20 secure. GOLD IS THE ONLY FREE AXIS.

const POST = { x: 0, z: 3 };          // inside dome-cluster-pad-center = the eclipse reserve
const SECURE_T = 600;
const HARD_BUILD_FLOOR = 400;          // no BUILD after this; purse must refill to the cap
const BASE_CAP = 200, STOCK_BONUS = 150;

// Ladder: strategy order, not price order. Core is unconditional (survival + the cap).
const CORE = [
  { id: 'turret', cost: 50 },
  { id: 'turret', cost: 70 },
  { id: 'stockpile', cost: 60 },
  { id: 'turret', cost: 95 },
  { id: 'stockpile', cost: 60 },
];
// Surplus: only when income is provably ahead of the cap, or when the hero is actually hurt.
const SURPLUS = [
  { id: 'turret', cost: 125 },
  { id: 'sentry_beacon', cost: 25 },
  { id: 'sentry_beacon', cost: 35 },
  { id: 'sentry_beacon', cost: 45 },
  { id: 'sentry_beacon', cost: 55 },
];

const SPOTS = {
  turret: [[-4, 4], [4, 4], [-4, 0], [4, 0], [-4, -4], [4, -4], [0, -4], [-6, 2], [6, 2], [0, 6], [-2, -6], [2, -6]],
  stockpile: [[0, -4], [-3, -5], [3, -5], [0, -6], [-5, -3], [5, -3], [-6, -6], [6, -6]],
  sentry_beacon: [[0, 6], [-3, 6], [3, 6], [-6, 4], [6, 4], [0, 0], [-2, 2], [2, 2], [-6, 0], [6, 0]],
};

const GROUND = /out_of_zone|collision|cap_reached|UNREACHABLE|outside buildable/i;
const ECONOMY = /insufficient_gold/i;

export function makeController() {
  const dead = new Set();            // poisoned coordinates (GROUND refusals only)
  const retired = new Set();         // ladder rungs with no candidates left
  let panRate = 1.2;                 // measured live, biased LOW on purpose (errs toward banking)

  function score(o) {
    const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
    if (/plating|dressing|vital|health|hp|tough|armor|armour|grit/.test(s)) return 3;
    if (/damage|spark|coil|tap|power|blast/.test(s)) return 2;
    return 1;
  }

  return {
    respond(view) {
      const n = view.now || {};
      // pendingSecure accepts exactly one order and refuses anything else -> answer with SILENCE.
      // A blank line records no entry, takes the `bank` default, and CANNOT be rejected,
      // so the replay cannot diverge on refused submissions inside the choice window.
      if (n.pendingSecure) return null;

      const t = n.timers?.runSeconds ?? 0;
      const gold = n.gold ?? 0;
      const pan = n.score?.goldPanned ?? 0;
      const hero = n.hero || {};
      const hpFrac = hero.maxHp ? hero.hp / hero.maxHp : 1;
      const air = n.air || {};
      const reg = air.regolith || {};
      const entries = n.works?.entries || [];
      const byKind = n.works?.byKind || {};
      if (t > 20) panRate = Math.max(0.5, pan / t);

      // --- refusal blacklist, partitioned: GROUND poisons the coordinate, ECONOMY poisons nothing
      for (const rec of (n.orders || [])) {
        if (rec.status !== 'failed') continue;
        const o = rec.order || {};
        if (o.verb !== 'BUILD' || !o.where) continue;
        const why = `${rec.reason || ''} ${rec.detail || ''}`;
        if (ECONOMY.test(why)) continue;
        if (GROUND.test(why) || why.trim()) dead.add(`${o.what}:${o.where.x},${o.where.z}`);
      }

      const out = [];

      // 1. draft first, under replace semantics
      if (n.pendingOffer?.length) {
        const best = [...n.pendingOffer].sort((a, b) => score(b) - score(a))[0];
        out.push({ verb: 'PICK_UPGRADE', id: best.id });
      }

      // 2. free damage: BLAST_AT returns {} either way, so it is safe above the traveller.
      //    orbitalReturn is false here; aim north, where the lanes converge.
      if ((n.blastReadyInMs ?? 1) === 0) out.push({ verb: 'BLAST_AT', pos: { x: 0, z: 14 } });

      // 3. keep the body in the reserve dome. knockbackScale 1.3 can fling her out, and an
      //    empty suit is 5 hp/s. Emitted ONCE and dropped when parked (never a ladder: a ladder
      //    of posts is a shuttle that ping-pongs the body and freezes the economy).
      const dx = (hero.x ?? 0) - POST.x, dz = (hero.z ?? 0) - POST.z;
      const displaced = Math.hypot(dx, dz) > 1.2;
      if (displaced || air.suit?.inDome == null) out.push({ verb: 'MOVE_HERO', pos: POST });

      // 4. the ladder: one rung at a time, priced at its live instance, plan-time affordable.
      const liveCap = BASE_CAP + STOCK_BONUS * entries.filter(e => e.id === 'stockpile' && !e.wrecked).length;
      const projected = gold + panRate * Math.max(0, SECURE_T - t);
      const hurt = hpFrac < 0.60;

      function rungOrder(list, gate) {
        const seen = {};
        for (let i = 0; i < list.length; i++) {
          const r = list[i];
          seen[r.id] = (seen[r.id] || 0) + 1;
          const key = `${r.id}#${seen[r.id]}`;
          if (retired.has(key)) continue;
          const standing = byKind[r.id] || 0;
          if (standing >= seen[r.id]) continue;         // this rung is already satisfied
          if (gold < r.cost) return null;               // plan-time affordability
          if (!gate(r.cost)) return null;
          const spot = (SPOTS[r.id] || []).find(([x, z]) => !dead.has(`${r.id}:${x},${z}`));
          if (!spot) { retired.add(key); continue; }    // retire a rung with no ground left
          return { verb: 'BUILD', what: r.id, where: { x: spot[0], z: spot[1] }, when: { goldGte: r.cost } };
        }
        return null;
      }

      if (t < HARD_BUILD_FLOOR) {
        const core = rungOrder(CORE, () => true);
        if (core) out.push(core);
        else {
          const extra = rungOrder(SURPLUS, (c) => hurt || (gold - c) + panRate * Math.max(0, SECURE_T - t) >= liveCap + 20);
          if (extra) out.push(extra);
        }
      }

      // 5. the harvest tail: income, the regolith gate, AND the clock (failing pans buy views).
      const live = (n.seams || []).filter(s =>
        s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z) && Number.isInteger(s.anchorIndex));
      const worked = new Set(reg.worked || []);
      const owedWindow = (reg.creditedThisWindow ?? 0) === 0 && !reg.complete;

      const byDist = [...live].sort((a, b) =>
        Math.hypot(a.x - POST.x, a.z - POST.z) - Math.hypot(b.x - POST.x, b.z - POST.z));
      // A fresh ground only counts one per window; chase it only while a credit is owed.
      const fresh = byDist.filter(s => !worked.has(s.anchorIndex));
      const chain = [];
      if (owedWindow && fresh.length) chain.push(fresh[0]);
      for (const s of byDist) if (!chain.includes(s)) chain.push(s);

      const slots = 32 - out.length;
      if (chain.length) {
        const block = Math.max(6, Math.floor(slots / chain.length));
        let i = 0;
        outer: for (const s of chain) {
          for (let k = 0; k < block; k++) {
            if (i++ >= slots) break outer;
            out.push({ verb: 'HARVEST', seam: s.id });
          }
        }
      }
      // Terminal anchor that cannot be filtered away: never ship an empty array.
      if (!out.length) out.push({ verb: 'MOVE_HERO', pos: POST });
      return out.slice(0, 32);
    },
  };
}
