// e8-eclipse controller v2 — gen 110, scored attempt.
// ONE CAUSE, measured in tune-1: the purse pinned at the 500 cap from t=460 with `goldPanned`
// frozen at 995, while `works.byKind` sat at {turret:3, sentry_beacon:4, stockpile:2} from t=290
// to the death at w18/548.5s. The ladder was EXHAUSTED, not gated — and worse, turret #4 was
// silently deleted by my own ordinal accounting (a second rung list restarted `seen` at 1 while
// `byKind.turret` already read 3, so `standing >= ordinal` skipped it forever).
// The fix: ONE ladder with ONE ordinal, priced off the view's own cost curve, extended to the
// roster caps (6 beacons, 4 turrets), plus the turret tier-2 sink so a pinned purse becomes dps.

const POST = { x: 0, z: 3 };          // inside dome-cluster-pad-center = the eclipse reserve
const SECURE_T = 600;
const CORE_FLOOR = 420;                // core may land late if income was slow
const SURPLUS_FLOOR = 540;             // defence bought at t=500 beats gold banked into a death
const BASE_CAP = 200, STOCK_BONUS = 150;
const TIER2_COST = 150;

// ONE ladder, ONE ordinal. `core` rungs are unconditional; the rest answer the surplus gate.
const LADDER = [
  { id: 'turret', core: true },
  { id: 'turret', core: true },
  { id: 'stockpile', core: true },
  { id: 'turret', core: true },
  { id: 'stockpile', core: true },
  { id: 'turret' },
  { id: 'sentry_beacon' }, { id: 'sentry_beacon' }, { id: 'sentry_beacon' },
  { id: 'sentry_beacon' }, { id: 'sentry_beacon' }, { id: 'sentry_beacon' },
];

const SPOTS = {
  turret: [[-4, 4], [4, 4], [-4, 0], [4, 0], [-4, -4], [4, -4], [0, -4], [-6, 2], [6, 2], [0, 6], [-2, -6], [2, -6]],
  stockpile: [[0, -4], [-3, -5], [3, -5], [0, -6], [-5, -3], [5, -3], [-6, -6], [6, -6]],
  sentry_beacon: [[0, 6], [-3, 6], [3, 6], [-6, 4], [6, 4], [-2, 2], [2, 2], [-6, 0], [6, 0], [-2, -2], [2, -2], [0, 0]],
};

const ECONOMY = /insufficient_gold/i;

export function makeController() {
  const dead = new Set();
  const retired = new Set();
  let panRate = 1.2;

  function score(o) {
    const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
    if (/plating|dressing|vital|health|hp|tough|armor|armour|grit/.test(s)) return 3;
    if (/damage|spark|coil|tap|power|blast/.test(s)) return 2;
    return 1;
  }

  return {
    respond(view) {
      const n = view.now || {};
      if (n.pendingSecure) return null;   // silence: banks the default and cannot be rejected

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

      // price off the view's own cost curve, indexed by what is already standing
      const costTable = {};
      for (const b of (view.stablePrefix?.mechanics?.buildables || [])) costTable[b.id] = b.costs || [];
      const priceOf = (id, standing) => {
        const c = costTable[id] || [];
        return c.length ? (c[Math.min(standing, c.length - 1)] ?? c[c.length - 1]) : 9e9;
      };

      for (const rec of (n.orders || [])) {
        if (rec.status !== 'failed') continue;
        const o = rec.order || {};
        if (o.verb !== 'BUILD' || !o.where) continue;
        const why = `${rec.reason || ''} ${rec.detail || ''}`;
        if (ECONOMY.test(why)) continue;
        if (why.trim()) dead.add(`${o.what}:${o.where.x},${o.where.z}`);
      }

      const out = [];
      if (n.pendingOffer?.length) {
        const best = [...n.pendingOffer].sort((a, b) => score(b) - score(a))[0];
        out.push({ verb: 'PICK_UPGRADE', id: best.id });
      }
      if ((n.blastReadyInMs ?? 1) === 0) out.push({ verb: 'BLAST_AT', pos: { x: 0, z: 14 } });

      const dx = (hero.x ?? 0) - POST.x, dz = (hero.z ?? 0) - POST.z;
      const displaced = Math.hypot(dx, dz) > 1.2;
      const needHome = displaced || air.suit?.inDome == null;
      if (needHome) out.push({ verb: 'MOVE_HERO', pos: POST });

      const liveCap = BASE_CAP + STOCK_BONUS * entries.filter(e => e.id === 'stockpile' && !e.wrecked).length;
      const hurt = hpFrac < 0.72;
      // A purse AT the cap refuses further credit, so spending there is free income already lost.
      const pinning = gold >= liveCap - 15;
      const surplusOk = (c) =>
        hurt || pinning || (gold - c) + panRate * Math.max(0, SECURE_T - t) >= liveCap + 20;

      // --- ONE ladder, ONE ordinal across every rung of the same id
      let built = null;
      const seen = {};
      for (let i = 0; i < LADDER.length && !built; i++) {
        const r = LADDER[i];
        seen[r.id] = (seen[r.id] || 0) + 1;
        const key = `${r.id}#${seen[r.id]}`;
        if (retired.has(key)) continue;
        const standing = byKind[r.id] || 0;
        if (standing >= seen[r.id]) continue;
        const cost = priceOf(r.id, standing);
        const floor = r.core ? CORE_FLOOR : SURPLUS_FLOOR;
        if (t >= floor) continue;
        if (gold < cost) break;                       // cannot afford the head rung: wait
        if (!r.core && !surplusOk(cost)) break;
        const spot = (SPOTS[r.id] || []).find(([x, z]) => !dead.has(`${r.id}:${x},${z}`));
        if (!spot) { retired.add(key); continue; }
        built = { verb: 'BUILD', what: r.id, where: { x: spot[0], z: spot[1] }, when: { goldGte: cost } };
      }
      if (built) out.push(built);

      // --- the sink: once the ladder can buy nothing, a pinned purse becomes dps.
      // CONTEXT_ACTION does not travel and reaches 1.6, so it needs MOVE_HERO in front of it —
      // and on this board every turret is an in-dome walk from the post.
      if (!built && !needHome && t < SURPLUS_FLOOR && gold >= TIER2_COST && (pinning || hurt)) {
        const up = entries.find(e => e.id === 'turret' && !e.wrecked && (e.tier ?? 1) < 2);
        if (up && up.position) {
          const px = up.position.x, pz = up.position.z;
          const L = Math.hypot(px - POST.x, pz - POST.z) || 1;
          const stand = { x: +(px - ((px - POST.x) / L) * 0.7).toFixed(2), z: +(pz - ((pz - POST.z) / L) * 0.7).toFixed(2) };
          out.push({ verb: 'MOVE_HERO', pos: stand });
          out.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: 'turret', index: up.index } });
        }
      }

      // --- harvest tail: income, the regolith gate, and the clock
      const live = (n.seams || []).filter(s =>
        s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z) && Number.isInteger(s.anchorIndex));
      const worked = new Set(reg.worked || []);
      const owedWindow = (reg.creditedThisWindow ?? 0) === 0 && !reg.complete;
      const byDist = [...live].sort((a, b) =>
        Math.hypot(a.x - POST.x, a.z - POST.z) - Math.hypot(b.x - POST.x, b.z - POST.z));
      const fresh = byDist.filter(s => !worked.has(s.anchorIndex));
      const chain = [];
      if (owedWindow && fresh.length) chain.push(fresh[0]);
      for (const s of byDist) if (!chain.includes(s)) chain.push(s);

      const slots = 32 - out.length;
      if (chain.length && slots > 0) {
        const block = Math.max(6, Math.floor(slots / chain.length));
        let i = 0;
        outer: for (const s of chain) {
          for (let k = 0; k < block; k++) {
            if (i++ >= slots) break outer;
            out.push({ verb: 'HARVEST', seam: s.id });
          }
        }
      }
      if (!out.length) out.push({ verb: 'MOVE_HERO', pos: POST });
      return out.slice(0, 32);
    },
  };
}
