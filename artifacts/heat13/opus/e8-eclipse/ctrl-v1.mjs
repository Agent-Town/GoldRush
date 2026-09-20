// gen 69 — e8-eclipse controller.
// THE CONTRACT: secure needs 4 distinct regolith grounds worked while THE HERO'S suit holds air,
// at most 1 credit per 120s window; plus (after the eclipse lands at wave 10) >=1 further pan on air.
// The hero starts at (0,12), OUTSIDE every dome, and suffocates at t=76 (idle floor).
// So: MOVE_HERO into dome-cluster-pad-center (x -6..6, z -6..6) and LIVE there. The center pad is
// the eclipse reserve, the only dome that keeps breathing after wave 10. It is also a build zone,
// so the whole fort rings the body that must live, and every tier-2 upgrade is an in-dome errand.

const HOME = { x: 0, z: 0 };            // centre of the reserve pad: max margin against knockback
const PAD = { minX: -6, maxX: 6, minZ: -6, maxZ: 6 };

// Interleaved re-arm offsets (gen 61): a done MOVE_HERO record stops steering, so several distinct
// records down the array each get a fresh chance to notice the hero was flung out of her air.
const REARM = [
  { x: 0, z: 0 }, { x: 0.4, z: 0 }, { x: 0, z: 0.4 }, { x: -0.4, z: 0 },
  { x: 0, z: -0.4 }, { x: 0.4, z: 0.4 }, { x: -0.4, z: 0.4 }, { x: 0.4, z: -0.4 },
  { x: -0.4, z: -0.4 }, { x: 0.8, z: 0 }, { x: 0, z: 0.8 }, { x: -0.8, z: 0 },
];

// Ladder: turrets and beacons INTERLEAVED (gen 67: on a map where the HERO is what dies, the
// radius-8 beacon inside her own footprint outranks pure dps-per-gold), cumulatively gated so a
// cheap rung can never steal gold an expensive one is waiting for.
const LADDER = [
  { id: 'turret', cost: 50 }, { id: 'sentry_beacon', cost: 25 },
  { id: 'turret', cost: 70 }, { id: 'sentry_beacon', cost: 35 },
  { id: 'turret', cost: 95 }, { id: 'sentry_beacon', cost: 45 },
  { id: 'turret', cost: 125 }, { id: 'sentry_beacon', cost: 55 },
  { id: 'sentry_beacon', cost: 75 }, { id: 'sentry_beacon', cost: 95 },
];

// Candidates, all inside the reserve pad first (in-dome upgrades, tight ring around the hero),
// then the two outboard dome pads as overflow. More candidates than slots, always.
const TURRET_SPOTS = [
  { x: -5, z: -5 }, { x: 5, z: -5 }, { x: -5, z: 5 }, { x: 5, z: 5 },
  { x: 0, z: 5 }, { x: 0, z: -5 }, { x: -5, z: 0 }, { x: 5, z: 0 },
  { x: -2, z: 5 }, { x: 2, z: 5 }, { x: -14, z: 0 }, { x: 14, z: 0 },
];
const BEACON_SPOTS = [
  { x: 0, z: 4 }, { x: -4, z: 0 }, { x: 4, z: 0 }, { x: 0, z: -4 },
  { x: -3, z: 3 }, { x: 3, z: 3 }, { x: -3, z: -3 }, { x: 3, z: -3 },
  { x: -5, z: 2 }, { x: 5, z: 2 }, { x: -5, z: -2 }, { x: 5, z: -2 },
  { x: 2, z: 5 }, { x: -2, z: 5 }, { x: 2, z: -5 }, { x: -2, z: -5 },
];
const TIER_COST = { turret: [0, 150, 300], sentry_beacon: [0, 999999] };

const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const inPad = (p) => p.x >= PAD.minX && p.x <= PAD.maxX && p.z >= PAD.minZ && p.z <= PAD.maxZ;
const fin = (n) => typeof n === 'number' && Number.isFinite(n);

function scoreUpgrade(o) {
  const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
  let v = 0;
  if (/plating|max hp|maxhp|health|vitality|hearty|tough/.test(s)) v += 100;
  if (/dressing|heal|mend|regen|recover/.test(s)) v += 80;
  if (/damage|spark|coil|tap|power|bolt/.test(s)) v += 30;
  if (/fire rate|rate|speed of fire|cadence/.test(s)) v += 25;
  if (/blast|charge/.test(s)) v += 15;
  return v;
}

export default function controller(view, ctx) {
  const now = view.now;
  const t = now.timers?.runSeconds ?? 0;

  if (ctx.blacklist === undefined) {
    ctx.blacklist = new Set();
    ctx.attempts = new Map();
    ctx.lastSubmitT = -99;
    ctx.lastSig = '';
  }

  // --- the secure boundary: answer with SILENCE. gr-sim records no entry, the default `bank`
  // fires, the last accepted order stays well inside the tick envelope. ---
  if (now.pendingSecure) return null;

  // --- learn from the view's own refusals (gen 51: GROUND poisons the coordinate, ECONOMY never) ---
  for (const rec of now.orders || []) {
    const o = rec.order || rec;
    if (o.verb !== 'BUILD' || !o.where) continue;
    const key = `${o.what}@${o.where.x},${o.where.z}`;
    if (rec.status === 'failed') {
      const r = `${rec.reason || ''} ${rec.detail || ''}`.toLowerCase();
      if (/insufficient_gold|gold/.test(r)) continue;              // transient: retry, poison nothing
      if (/zone|reach|collision|terrain|unreachable|cap_reached|legal/.test(r)) ctx.blacklist.add(key);
      else {
        const n = (ctx.attempts.get(key) || 0) + 1;
        ctx.attempts.set(key, n);
        if (n >= 4) ctx.blacklist.add(key);
      }
    }
  }

  const orders = [];
  const gold = now.gold ?? 0;
  const air = now.air || {};
  const reg = air.regolith || {};
  const worked = new Set(reg.worked || []);
  const hero = { x: now.hero?.x ?? 0, z: now.hero?.z ?? 0 };

  // 1. the draft, first, under replace semantics
  if (now.pendingOffer && now.pendingOffer.length) {
    const best = [...now.pendingOffer].sort((a, b) => scoreUpgrade(b) - scoreUpgrade(a))[0];
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. AIR BEFORE EVERYTHING. If she is out of the pad this blocks the tick until she is back in it,
  // which is exactly right: nothing else on this board matters while she is suffocating.
  orders.push({ verb: 'MOVE_HERO', pos: { ...HOME } });

  // 3. free damage: BLAST_AT returns {} either way, so it never owns a tick it cannot use.
  if ((now.blastReadyInMs ?? 1) === 0) {
    orders.push({ verb: 'BLAST_AT', pos: { x: +(hero.x).toFixed(2), z: +(hero.z + 3).toFixed(2) } });
  }

  // 4. the ladder: plan-time affordable, cumulatively gated, skipping poisoned ground.
  const byKind = now.works?.byKind || {};
  const built = { turret: byKind.turret || 0, sentry_beacon: byKind.sentry_beacon || 0 };
  const placed = new Set((now.works?.entries || []).map(e => `${e.id}@${Math.round(e.position?.x)},${Math.round(e.position?.z)}`));
  const seen = { turret: 0, sentry_beacon: 0 };
  let cum = 0;
  let emitted = 0;
  let ladderDone = true;
  for (const rung of LADDER) {
    const idx = seen[rung.id]++;
    if (idx < built[rung.id]) continue;         // already standing
    ladderDone = false;
    cum += rung.cost;
    if (emitted >= 3) break;
    const spots = rung.id === 'turret' ? TURRET_SPOTS : BEACON_SPOTS;
    const spot = spots.find(s => !ctx.blacklist.has(`${rung.id}@${s.x},${s.z}`)
      && !placed.has(`${rung.id}@${Math.round(s.x)},${Math.round(s.z)}`)
      && !orders.some(o => o.verb === 'BUILD' && o.where.x === s.x && o.where.z === s.z));
    if (!spot) continue;
    if (gold < cum) break;                       // cumulative gate: nothing fires early
    orders.push({ verb: 'BUILD', what: rung.id, where: { x: spot.x, z: spot.z }, when: { goldGte: cum } });
    emitted++;
  }

  // 5. the only remaining gold sink once the ladder caps: turret tier 2, 150g each.
  // Every turret we placed lives inside the reserve pad, so the errand never leaves her air.
  // CONTEXT_ACTION does not travel and reaches 1.6 from the hero: park 0.8 short of the work.
  if (ladderDone && gold >= 150) {
    const ents = now.works?.entries || [];
    const target = ents.find(e => e.id === 'turret' && (e.tier ?? 1) < 2 && !e.wrecked
      && e.position && fin(e.position.x) && inPad(e.position));
    if (target) {
      const d = Math.max(0.001, dist(HOME, target.position));
      const park = {
        x: +(target.position.x + (HOME.x - target.position.x) / d * 0.8).toFixed(2),
        z: +(target.position.z + (HOME.z - target.position.z) / d * 0.8).toFixed(2),
      };
      if (fin(park.x) && fin(park.z)) {
        orders.push({ verb: 'MOVE_HERO', pos: park });
        orders.push({ verb: 'CONTEXT_ACTION', action: 'upgrade', target: { id: target.id, index: target.index } });
      }
    }
  }

  // 6. the economy AND the era gate in one tail.
  // The regolith latch counts DISTINCT anchorIndex values, credited at most one per 120s window,
  // and only while HER suit holds air. So: while this window has not yet credited, pan a FRESH
  // ground; once it has, pan whatever is nearest. Inactive seams publish null x/z/anchorIndex —
  // one non-finite number refuses the whole array, so filter on Number.isFinite first.
  const live = (now.seams || []).filter(s => s.active === true && fin(s.x) && fin(s.z));
  const needFresh = (reg.creditedThisWindow ?? 1) === 0 && worked.size < (reg.required ?? 4);
  const pros = { x: now.prospector?.x ?? hero.x, z: now.prospector?.z ?? hero.z };
  const ranked = [...live].sort((a, b) => {
    if (needFresh) {
      const af = worked.has(a.anchorIndex) ? 1 : 0, bf = worked.has(b.anchorIndex) ? 1 : 0;
      if (af !== bf) return af - bf;
    }
    return dist(pros, a) - dist(pros, b);
  });

  const slots = 32 - orders.length;
  const tail = [];
  if (ranked.length) {
    // Drain one seam in a block before walking to the next (gen 47), but keep every live seam in
    // the chain so a depletion mid-array does not leave the worklist empty.
    const chain = [];
    for (const s of ranked) for (let i = 0; i < 7; i++) chain.push(s.id);
    for (let i = 0; i < chain.length && tail.length < slots; i++) {
      tail.push({ verb: 'HARVEST', seam: chain[i] });
      // re-arm her ground every other order: the correction has to be able to fire mid-array
      if (i % 2 === 1 && tail.length < slots) {
        tail.push({ verb: 'MOVE_HERO', pos: { ...REARM[(i >> 1) % REARM.length] } });
      }
    }
  }
  while (tail.length < slots) tail.push({ verb: 'MOVE_HERO', pos: { ...REARM[tail.length % REARM.length] } });
  for (const o of tail) { if (orders.length < 32) orders.push(o); }

  // reel discipline: a view that changes nothing and arrives on top of the last one gets silence.
  const sig = JSON.stringify(orders);
  const heroHome = dist(hero, HOME) < 1.0;
  if (sig === ctx.lastSig && heroHome && (t - ctx.lastSubmitT) < 2.0 && !now.pendingOffer) return null;
  ctx.lastSig = sig;
  ctx.lastSubmitT = t;
  return orders;
}
