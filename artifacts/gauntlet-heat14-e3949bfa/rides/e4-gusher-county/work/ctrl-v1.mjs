// e4-gusher-county controller, heat 14 (era 6).
// Phase 0: the motor errand (fuel -> grade x3 -> deliver W, N, E), one draining array.
// Phase 1: post in the west lease between the two pinned live seams; ladder + bank gate.
//
// Ranking: secureWave 12 pins waves=12 and timeAlive=360.000s, so GOLD is the only free axis.
// Live cap = 200 + 150 * (standing stockpiles) -> 500 with both.

const CAMP = { x: 0, z: -4 };
const NODES = [{ x: -12, z: -8 }, { x: 0, z: -8 }, { x: 12, z: -8 }];
const COR = {
  west: { id: 'camp-to-west-lease', start: { x: -12, z: -8 }, end: { x: -50, z: -40 } },
  east: { id: 'camp-to-east-lease', start: { x: 12, z: -8 }, end: { x: 48, z: -38 } },
  north: { id: 'camp-to-north-lease', start: { x: 0, z: 8 }, end: { x: 0, z: 46 } },
};
// Tour order: W -> N -> E. Priced against the 36-fuel leash:
//   stage .67 + Wout 2.65 + Wback 2.65 + hop W>N 6.67 + Nout 2.03 + Nback 2.03
//   + hop N>E 6.67 + Eout 2.50 = 25.87 clear. Every other ordering is 27.7-33.7.
const TOUR = ['west', 'north', 'east'];

// Post: midpoint of the two pinned live west seams (-37,-44.7) and (-52.1,-33.8).
const POSTS = [{ x: -44.5, z: -39.2 }, { x: -43, z: -38 }, { x: -46, z: -41 }, { x: -41, z: -36 }];

const LADDER = [
  { id: 'turret', spots: [[-39, -39], [-40, -34], [-38, -43], [-36, -39]] },
  { id: 'turret', spots: [[-50, -39], [-49, -34], [-51, -43], [-53, -39]] },
  { id: 'stockpile', spots: [[-48, -43], [-47, -36], [-52, -41], [-46, -45]] },
  { id: 'turret', spots: [[-44, -34], [-45, -32], [-42, -33], [-47, -33]] },
  { id: 'stockpile', spots: [[-40, -36], [-41, -43], [-38, -35], [-37, -41]] },
  // --- everything below is behind the bank gate / urgency only ---
  { id: 'turret', spots: [[-44, -45], [-46, -47], [-42, -46], [-48, -46]], gated: true },
  { id: 'sentry_beacon', spots: [[-43, -42], [-46, -38], [-42, -40], [-47, -40]], gated: true },
  { id: 'sentry_beacon', spots: [[-46, -38], [-42, -40], [-47, -40], [-43, -36]], gated: true },
];

const SECURE_T = 360;
const HARD_BUILD_STOP = 320;   // no BUILD at all inside the last 40s (gen 85)
const CORE_RUNGS = 5;          // 3 turrets + 2 stockpiles = 335 gold

const S = {
  postIdx: 0,
  badSpots: new Set(),   // GROUND refusals only (gen 51: never blacklist on insufficient_gold)
  panStartT: null,
  panStartG: 0,
};

const d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const mv = (x, z) => ({ verb: 'MOVE_HERO', pos: { x, z } });
const key = (id, s) => `${id}@${s[0]},${s[1]}`;

export default function controller(view) {
  const n = view.now;
  const t = n.timers?.runSeconds ?? 0;
  const out = [];

  // --- secure boundary: answer with SILENCE. Records no entry, cannot be rejected,
  // banks the configured default, and keeps the replay from diverging (gen 84).
  if (n.pendingSecure) return null;

  // 1) draft first, under replace semantics, plating-first scorer
  if (Array.isArray(n.pendingOffer) && n.pendingOffer.length) {
    const score = (o) => {
      const s = `${o.id} ${o.name} ${o.effectText}`.toLowerCase();
      let v = 0;
      if (/plating|max hp|maxhp|health|vitality|tough/.test(s)) v += 100;
      if (/dressing|heal|regen|mend/.test(s)) v += 60;
      if (/spark|damage|coil|tap|rate|fire/.test(s)) v += 30;
      if (/range|reach/.test(s)) v += 10;
      return v;
    };
    const best = [...n.pendingOffer].sort((a, b) => score(b) - score(a))[0];
    out.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2) free supplementary damage; returns {} either way so it never owns the tick
  if ((n.blastReadyInMs ?? 1) === 0) {
    out.push({ verb: 'BLAST_AT', pos: { x: +(n.hero.x + 4).toFixed(2), z: +(n.hero.z + 4).toFixed(2) } });
  }

  // record GROUND refusals from the view's own order records (gen 51 partition)
  for (const rec of n.orders || []) {
    const o = rec.order || rec;
    if (rec.status === 'failed' && o.verb === 'BUILD' && o.where) {
      const reason = `${rec.reason || ''}`.toLowerCase();
      if (!/insufficient_gold|gold/.test(reason)) {
        S.badSpots.add(key(o.what, [o.where.x, o.where.z]));
      }
    }
  }

  const mo = n.motor || {};
  const obj = mo.objective || {};
  const fuel = mo.fuel || { nodes: [] };
  const roads = mo.roads || { corridors: [] };
  const veh = mo.vehicle || { x: 0, z: 0 };
  const delivered = new Set(obj.delivered || []);
  const gradedOf = (cid) => (roads.corridors || []).find((c) => c.id === cid)?.graded === true;

  // The leash is spent and deliveries remain: the errand can no longer complete.
  // NEVER gate the fort behind the errand (gen 72) - fall through and play the board.
  const nodesLeft = (fuel.nodes || []).some((x) => !x.harvested);
  const stranded = !obj.arrived && !nodesLeft && (fuel.tar ?? 0) === 0 && (fuel.stored ?? 0) < 1.5;

  // ================= PHASE 0: the errand =================
  if (!obj.arrived && !stranded) {
    const steps = [];

    // fuel + grade, skipping anything already done (idempotent re-emission)
    NODES.forEach((p, i) => {
      if (fuel.nodes?.[i]?.harvested) return;
      // three-waypoint dwell: harvestSeconds 0.5 against arrival radius 0.5,
      // every waypoint inside harvestRange 1.35 of the node
      steps.push(mv(p.x, p.z), mv(p.x, p.z - 1.1), mv(p.x, p.z + 1.0));
    });
    // west stake == node 0, east stake == node 2: grade where we already stand
    if (!gradedOf(COR.west.id)) {
      if (fuel.nodes?.[0]?.harvested) steps.push(mv(COR.west.start.x, COR.west.start.z));
      steps.push({ verb: 'GRADE' });
    }
    if (!gradedOf(COR.east.id)) {
      if (fuel.nodes?.[2]?.harvested) steps.push(mv(COR.east.start.x, COR.east.start.z));
      steps.push({ verb: 'GRADE' });
    }
    if (!gradedOf(COR.north.id)) {
      steps.push(mv(COR.north.start.x, COR.north.start.z), { verb: 'GRADE' });
    }

    // ONE delivery per array. Queueing the next lease behind this one lets a later HAUL
    // re-target the Hauler in flight (gen 15); the next view re-plans from the real world.
    const nextName = TOUR.find((name) => !delivered.has(COR[name].id));
    if (nextName) {
      const c = COR[nextName];
      // If the Hauler is resting at some OTHER corridor's head, call it home down the road
      // it is already on before striking out - open country is 6x graded per unit and the
      // straight line from a head to the next stake is 69 units of it (door doc; measured
      // here as 23 of 36 fuel on tune-1).
      const atHead = Object.values(COR).find((k) => k.id !== c.id && d(veh, k.end) <= 3);
      if (atHead) steps.push(mv(atHead.start.x, atHead.start.z), { verb: 'HAUL' });
      // stage onto this corridor's stake, unless already there
      if (d(veh, c.start) > 3 || atHead) steps.push(mv(c.start.x, c.start.z), { verb: 'HAUL' });
      // deliver: walk the hero to the head, call the Hauler up the graded road.
      // Two HAULs: a re-issue costs ~0 fuel and catches a closure that has lifted.
      steps.push(mv(c.end.x, c.end.z), { verb: 'HAUL' }, { verb: 'HAUL' });
    }

    for (const s of steps) { if (out.length >= 31) break; out.push(s); }
    return out;
  }

  // ================= PHASE 1: post, ladder, pan =================
  if (S.panStartT == null) { S.panStartT = t; S.panStartG = n.score?.goldPanned ?? 0; }

  // hero post: emitted ONCE and dropped when parked (gen 79 - never a ladder of posts)
  const post = POSTS[Math.min(S.postIdx, POSTS.length - 1)];
  for (const rec of n.orders || []) {
    const o = rec.order || rec;
    if (rec.status === 'failed' && o.verb === 'MOVE_HERO' && /TERRAIN/i.test(`${rec.reason || ''}`)) {
      S.postIdx = Math.min(S.postIdx + 1, POSTS.length - 1);
    }
  }
  if (d(n.hero, post) > 1.0) out.push(mv(post.x, post.z));

  // --- ladder: ordinal accounting (gen 102), head rung only, plan-time affordable
  const byKind = n.works?.byKind || {};
  const costsOf = (id) => (view.stablePrefix.mechanics.buildables.find((b) => b.id === id)?.costs) || [];
  const maxOf = (id) => view.stablePrefix.mechanics.buildables.find((b) => b.id === id)?.maxCount ?? 0;
  const seen = {};
  let rung = null, rungIdx = -1;
  for (let i = 0; i < LADDER.length; i++) {
    const r = LADDER[i];
    seen[r.id] = (seen[r.id] || 0) + 1;              // this is the ordinal-th rung of that id
    const standing = byKind[r.id] || 0;
    if (standing >= seen[r.id]) continue;             // already satisfied by a standing instance
    if (standing >= maxOf(r.id)) continue;            // cap reached: retire, do not stall (gen 81)
    const spot = r.spots.find((s) => !S.badSpots.has(key(r.id, s)));
    if (!spot) continue;                              // out of ground: retire the rung, advance
    rung = { ...r, spot, cost: costsOf(r.id)[standing] ?? 1e9 };
    rungIdx = i;
    break;
  }

  const stock = byKind['stockpile'] || 0;
  const cap = 200 + 150 * stock;
  const panned = n.score?.goldPanned ?? 0;
  const elapsed = Math.max(1, t - S.panStartT);
  // bias the rate LOW on purpose: it errs toward stopping early, i.e. toward banking (gen 98)
  const rate = Math.max(0.2, (panned - S.panStartG) / elapsed);
  const runway = Math.max(0, SECURE_T - t);
  const hpFrac = (n.hero?.maxHp ?? 1) > 0 ? n.hero.hp / n.hero.maxHp : 1;
  const urgent = hpFrac < 0.72;

  if (rung && t < HARD_BUILD_STOP && n.gold >= rung.cost) {
    const isCore = rungIdx < CORE_RUNGS;
    // beyond the core, a purchase is only allowed when it is FREE: the purse must still
    // be able to refill to the live cap by the secure tick.
    const free = (n.gold - rung.cost) + rate * runway >= cap;
    if (isCore || free || urgent) {
      out.push({
        verb: 'BUILD', what: rung.id,
        where: { x: rung.spot[0], z: rung.spot[1] },
        when: { goldGte: rung.cost },
      });
    }
  }

  // --- harvest tail: the two pinned live west seams, alternating blocks of six.
  // Null-safe: an inactive seam publishes x/z/anchorIndex as null and one non-finite
  // number refuses the WHOLE array silently (gen 59).
  const live = (n.seams || [])
    .filter((s) => s.active === true && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map((s) => ({ ...s, dp: d(s, post) }))
    .sort((a, b) => a.dp - b.dp);

  const near = live.filter((s) => s.dp < 30);
  const chain = near.length ? near : live.slice(0, 1);
  if (chain.length) {
    const blocks = chain.length >= 2 ? [chain[0], chain[1], chain[0], chain[1]] : [chain[0], chain[0], chain[0], chain[0]];
    for (const s of blocks) {
      for (let i = 0; i < 6; i++) {
        if (out.length >= 32) break;
        out.push({ verb: 'HARVEST', seam: s.id });
      }
    }
  }

  return out.slice(0, 32);
}
