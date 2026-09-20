// e6-picnic controller v1 — generation 119
// Contract facts, all read from source/view before riding:
//  - loss = ALL THREE stakes claimed; a stake is held by ANY standing structure within r3 (or the
//    hero inside r3 within 5s of landing a hit). PicnicHoldSystem.contested().
//  - roster = contract twist {feral_toaster, lawn_shepherd} INTERSECTED with Balance mix; glowjack
//    (the only thief) is not in the contract roster so it can never spawn. Neither variant is a
//    wrecker => nothing can be attacked or stolen => palisades at the stakes are PERMANENT.
//  - no twist.secureWave => Balance default 20 waves / 600s. Waves+time pinned => GOLD is the axis.
//  - bankCap 200 + 150 per standing stockpile (max 2) => 500.
//  - only 2-3 seams live of five anchors; an inactive seam publishes x/z/anchorIndex as null.

const STAKES = [
  { id: 'sandwich-east', x: 16, z: 18, spots: [[16, 16], [17, 17], [15, 16], [18, 18], [14, 17]] },
  { id: 'sandwich-center', x: 0, z: 26, spots: [[0, 24], [1, 25], [-1, 25], [0, 28], [2, 26]] },
  { id: 'sandwich-west', x: -16, z: 18, spots: [[-16, 16], [-15, 17], [-17, 17], [-18, 18], [-14, 17]] },
];

const FORT = { x: 0, z: 10 };
const WEST_POST = [[-15, 19], [-14, 18], [-16, 20], [-17, 19]];

// ladder after the objective: stockpiles are the SCORE (+150 cap each for 60), then an
// interleaved turret/beacon fort around the post.
const LADDER = [
  { id: 'stockpile', spots: [[8, 4], [-8, 4], [12, 6], [-12, 6], [10, 16], [-10, 16], [6, 3]] },
  { id: 'turret', spots: [[6, 6], [-6, 6], [6, 14], [-6, 14], [10, 10], [-10, 10], [0, 4], [0, 16]] },
  { id: 'sentry_beacon', spots: [[3, 7], [-3, 7], [3, 13], [-3, 13], [5, 10], [-5, 10], [0, 6], [0, 14], [4, 4], [-4, 4]] },
  { id: 'stockpile', spots: [[-8, 4], [12, 6], [-12, 6], [10, 16], [-10, 16], [6, 3], [8, 4]] },
  { id: 'turret', spots: [[-6, 6], [6, 14], [-6, 14], [10, 10], [-10, 10], [0, 4], [0, 16], [6, 6]] },
  { id: 'sentry_beacon', spots: [[-3, 7], [3, 13], [-3, 13], [5, 10], [-5, 10], [0, 6], [0, 14], [4, 4], [-4, 4], [3, 7]] },
  { id: 'turret', spots: [[6, 14], [-6, 14], [10, 10], [-10, 10], [0, 4], [0, 16], [6, 6], [-6, 6]] },
  { id: 'sentry_beacon', spots: [[3, 13], [-3, 13], [5, 10], [-5, 10], [0, 6], [0, 14], [4, 4], [-4, 4]] },
  { id: 'turret', spots: [[-6, 14], [10, 10], [-10, 10], [0, 4], [0, 16], [6, 6], [-6, 6], [6, 14]] },
  { id: 'sentry_beacon', spots: [[-3, 13], [5, 10], [-5, 10], [0, 6], [0, 14], [4, 4], [-4, 4]] },
  { id: 'sentry_beacon', spots: [[5, 10], [-5, 10], [0, 6], [0, 14], [4, 4], [-4, 4]] },
  { id: 'sentry_beacon', spots: [[-5, 10], [0, 6], [0, 14], [4, 4], [-4, 4], [7, 12], [-7, 12]] },
];

const SECURE_T = 600;
const HARD_BUILD_FLOOR = 500; // no BUILD at all after this, bypasses included
const GROUND_REASONS = /out_of_zone|collision|out_of_reach|cap_reached|UNREACHABLE|outside buildable/i;

const state = {
  stakeSpot: [0, 0, 0],
  rungSpot: LADDER.map(() => 0),
  rungRetired: LADDER.map(() => false),
  heroSpot: 0,
  lastSubmitT: -99,
  lastSig: '',
  picks: 0,
};

const d2 = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name || ''} ${o.effectText || ''}`.toLowerCase();
  if (/plating|max hp|maxhp|vitality|tough/.test(s)) return 100;
  if (/heal|regen|mend|dressing|patch/.test(s)) return 80;
  if (/damage|spark|coil|tap|power|blast/.test(s)) return 50;
  if (/rate|speed|reload|cool/.test(s)) return 40;
  return 10;
}

export default function controller(view) {
  const now = view.now || {};
  const sp = view.stablePrefix || {};
  const t = (now.timers && (now.timers.runSeconds ?? now.timers.simTimeSeconds)) ?? 0;
  const gold = now.gold ?? 0;
  const hero = now.hero || { x: 0, z: 12, hp: 100, maxHp: 100 };
  const works = now.works || {};
  const entries = works.entries || [];
  const byKind = works.byKind || {};
  const buildables = (sp.mechanics && sp.mechanics.buildables) || [];

  // --- refusal blacklist, partitioned GROUND (poison the coordinate) vs ECONOMY (retry) ---
  for (const rec of now.orders || []) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || {};
    if (o.verb === 'BUILD' && GROUND_REASONS.test(`${rec.reason || ''} ${rec.detail || ''}`)) {
      const w = o.where || {};
      for (let i = 0; i < STAKES.length; i += 1) {
        const c = STAKES[i].spots[state.stakeSpot[i]];
        if (c && c[0] === w.x && c[1] === w.z) state.stakeSpot[i] = Math.min(state.stakeSpot[i] + 1, STAKES[i].spots.length);
      }
      for (let i = 0; i < LADDER.length; i += 1) {
        const c = LADDER[i].spots[state.rungSpot[i]];
        if (c && c[0] === w.x && c[1] === w.z && LADDER[i].id === o.what) {
          state.rungSpot[i] += 1;
          if (state.rungSpot[i] >= LADDER[i].spots.length) state.rungRetired[i] = true; // RETIRE, never stall
        }
      }
    }
    if (o.verb === 'MOVE_HERO' && /UNREACHABLE/i.test(`${rec.reason || ''}`)) {
      state.heroSpot = Math.min(state.heroSpot + 1, WEST_POST.length - 1);
    }
  }

  // --- which stakes carry a standing structure within r3 (the ONLY thing the latch reads) ---
  const standing = entries.filter((e) => !e.wrecked);
  const fenced = STAKES.map((s) => standing.some((e) => {
    const p = e.position || {};
    return d2(p.x ?? 1e9, p.z ?? 1e9, s.x, s.z) <= 3;
  }));
  const pic = (now.atomic && now.atomic.picnicHold) || [];
  const claimed = STAKES.map((s) => {
    const row = pic.find((p) => p.id === s.id);
    return row ? row.claimed === true : false;
  });
  const objectiveDone = STAKES.every((_, i) => fenced[i] || claimed[i]);

  // --- live cap and income rate (biased LOW on purpose: the error direction is protective) ---
  const stockpiles = standing.filter((e) => e.id === 'stockpile').length;
  const cap = 200 + 150 * stockpiles;
  const panned = (now.score && now.score.goldPanned) || 0;
  const rate = t > 20 ? Math.max(0.4, (panned / t) * 0.9) : 1.2;

  const orders = [];

  // 1. draft first, under replace semantics
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
    state.picks += 1;
  }

  // 2. free blast, above every traveller (returns {} on success AND failure)
  if ((now.blastReadyInMs ?? 1) === 0) orders.push({ verb: 'BLAST_AT', pos: { x: Math.round(hero.x), z: Math.round(hero.z) } });

  // 3. hero: west stake while the objective is open (the map's own "active_hero" defender),
  //    then home to the fort. Emit ONCE, drop when parked; advance only on a real refusal.
  const target = objectiveDone ? [FORT.x, FORT.z] : WEST_POST[state.heroSpot];
  if (d2(hero.x, hero.z, target[0], target[1]) > 1.0) {
    orders.push({ verb: 'MOVE_HERO', pos: { x: target[0], z: target[1] } });
  }

  // 4. THE OBJECTIVE: three palisades, cumulative descending gates so ONE trip buys all three
  //    (10g flat each; equal prices mean no rung can starve another).
  const owed = [];
  for (let i = 0; i < STAKES.length; i += 1) {
    if (fenced[i] || claimed[i]) continue;
    const c = STAKES[i].spots[state.stakeSpot[i]];
    if (c) owed.push([i, c]);
  }
  owed.forEach(([, c], k) => {
    orders.push({ verb: 'BUILD', what: 'palisade', where: { x: c[0], z: c[1] }, when: { goldGte: 10 * (owed.length - k) } });
  });

  // 5. the ladder, ONE rung at a time, priced at its live instance, with a bank gate + hard floor
  let emittedBuild = false;
  if (objectiveDone && t < HARD_BUILD_FLOOR) {
    const seen = {};
    for (let i = 0; i < LADDER.length; i += 1) {
      const rung = LADDER[i];
      seen[rung.id] = (seen[rung.id] || 0) + 1;
      if (state.rungRetired[i]) continue;
      const have = standing.filter((e) => e.id === rung.id).length;
      if (have >= seen[rung.id]) continue; // this rung is already satisfied by one I built
      const def = buildables.find((b) => b.id === rung.id);
      if (!def) { state.rungRetired[i] = true; continue; }
      const total = (byKind[rung.id] || 0);
      if (def.maxCount !== undefined && total >= def.maxCount) { state.rungRetired[i] = true; continue; }
      const cost = (def.costs && (def.costs[total] ?? def.costs[def.costs.length - 1])) ?? 9999;
      const spot = rung.spots[state.rungSpot[i]];
      if (!spot) { state.rungRetired[i] = true; continue; }
      const urgent = hero.hp / hero.maxHp < 0.75 || (works.standing ?? 0) < 2;
      const banked = (gold - cost) + rate * Math.max(0, SECURE_T - t) >= cap + 5;
      if (gold >= cost && (urgent || banked || !stockpiles)) {
        orders.push({ verb: 'BUILD', what: rung.id, where: { x: spot[0], z: spot[1] }, when: { goldGte: cost } });
        emittedBuild = true;
      }
      break; // one rung in flight
    }
  }

  // 6. CAPTURE — free, targetless, at the hero; the map's compounding economy.
  //    Each record owns one tick then is spent, so stacking is safe and correct.
  for (let i = 0; i < 8; i += 1) orders.push({ verb: 'CAPTURE' });

  // 7. harvest tail: nearest live seams to the hero, drained in blocks; Number.isFinite FIRST
  //    (an inactive seam publishes x/z as null and one non-finite number refuses the whole array)
  const live = (now.seams || []).filter((s) => s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z));
  live.sort((a, b) => d2(a.x, a.z, hero.x, hero.z) - d2(b.x, b.z, hero.x, hero.z));
  const chain = live.length ? live : (now.seams || []).slice(0, 1);
  const slots = 32 - orders.length;
  if (chain.length) {
    const per = Math.max(1, Math.floor(slots / Math.min(2, chain.length)));
    outer: for (let c = 0; c < Math.min(2, chain.length); c += 1) {
      for (let k = 0; k < per; k += 1) {
        if (orders.length >= 32) break outer;
        orders.push({ verb: 'HARVEST', seam: chain[c].id });
      }
    }
  }
  while (orders.length > 32) orders.pop();

  // --- submission floor: keep the draining worklist fed, but cap reel entries ---
  const sig = JSON.stringify(orders.map((o) => [o.verb, o.what, o.where, o.seam, o.id, o.pos]));
  const mustSend = (now.pendingOffer && now.pendingOffer.length) || emittedBuild || owed.length
    || now.pendingSecure || sig !== state.lastSig || (t - state.lastSubmitT) >= 2.5;
  if (now.pendingSecure) return null; // silence banks the default and cannot be rejected
  if (!mustSend) return null;
  state.lastSubmitT = t;
  state.lastSig = sig;
  return orders;
}
