// generation 126 — e3-fairground controller.
//
// THE MAP, measured:
//   flock lanes are VERTICAL at x = -20, 0, +20, z from -30 to the plaza (+8/+10).
//   A flock's z is NEVER below -30, so anything at z <= -37.1 is safe from every flock.
//   Fright radius 7. A scattered flock earns nothing; a clean out-and-back earns 1 crossing.
//   Nights launch at t = 24N + 12; a round trip is ~21-22 s. 15 nights, need 1 clean each.
//   The wheel stops FOREVER on its first hit -> a standing work must always out-bait it.
//   The north runner gate is (-12,-4): a hero at x=-10 keeps every runner in the corridor.
//
// THE PLAN: post the hero at (-10,-37) and keep PHASE A's whole footprint on the x = -10
// column, so besiegers stay inside |x| in [7,13] (>= 7.3 from both neighbouring lanes) and
// every approach path crosses the lanes deep south where the flocks are not. Once all three
// have crossed, the latch is permanent -> PHASE B spends everything on the fort.

const POST = { x: -10, z: -37 };
const BLAST_AT_PT = { x: -10, z: -31 };

// ONE ladder, ONE ordinal per id. `b` marks a rung that may only be emitted once the escort
// latch is closed (phase B), because a wide footprint frightens the lanes.
const LADDER = [
  { id: 'palisade', cost: 10, spots: [[-10, -33], [-10, -34], [-11, -33]] },
  { id: 'palisade', cost: 10, spots: [[-10, -30], [-10, -31], [-9, -30]] },
  { id: 'sentry_beacon', cost: 25, spots: [[-10, -36], [-11, -36], [-9, -36]] },
  { id: 'palisade', cost: 10, spots: [[-10, -27], [-10, -28], [-9, -27]] },
  { id: 'sentry_beacon', cost: 35, spots: [[-12, -35], [-12, -36], [-13, -35]] },
  { id: 'palisade', cost: 10, spots: [[-12, -32], [-12, -33], [-13, -32]] },
  { id: 'sentry_beacon', cost: 45, spots: [[-8, -35], [-8, -36], [-7, -35]] },
  { id: 'palisade', cost: 10, spots: [[-8, -32], [-8, -33], [-7, -32]] },
  // ---- phase B: wide footprint, only once the flocks have all crossed ----
  { id: 'sentry_beacon', cost: 55, b: 1, spots: [[-15, -34], [-15, -35], [-16, -34]] },
  { id: 'sentry_beacon', cost: 75, b: 1, spots: [[-5, -34], [-5, -35], [-4, -34]] },
  { id: 'palisade', cost: 10, b: 1, spots: [[-15, -31], [-15, -32], [-16, -31]] },
  { id: 'palisade', cost: 10, b: 1, spots: [[-5, -31], [-5, -32], [-4, -31]] },
  { id: 'sentry_beacon', cost: 95, b: 1, spots: [[-10, -24], [-11, -24], [-9, -24]] },
  { id: 'palisade', cost: 10, b: 1, spots: [[-18, -34], [-18, -35], [-19, -34]] },
  { id: 'palisade', cost: 10, b: 1, spots: [[-2, -34], [-2, -35], [-1, -34]] },
  { id: 'palisade', cost: 10, b: 1, spots: [[-13, -29], [-14, -29], [-13, -28]] },
  { id: 'palisade', cost: 10, b: 1, spots: [[-7, -29], [-6, -29], [-7, -28]] },
  { id: 'stockpile', cost: 60, b: 1, spots: [[-10, -38], [-11, -38], [-9, -38]] },
  { id: 'palisade', cost: 10, b: 1, spots: [[-16, -37], [-16, -36], [-17, -37]] },
  { id: 'palisade', cost: 10, b: 1, spots: [[-4, -37], [-4, -36], [-3, -37]] },
  { id: 'stockpile', cost: 60, b: 1, spots: [[-13, -38], [-14, -38], [-12, -38]] },
  { id: 'palisade', cost: 10, b: 1, spots: [[-19, -31], [-20, -31], [-19, -30]] },
  { id: 'palisade', cost: 10, b: 1, spots: [[-1, -31], [0, -31], [-1, -30]] },
  { id: 'palisade', cost: 10, b: 1, spots: [[-10, -21], [-11, -21], [-9, -21]] },
];

const HARD_BUILD_STOP = 320;

export function decide(view, state) {
  const n = view.now;

  // The secure boundary: silence. It takes the `bank` default, cannot be REJECTED, and so the
  // replay cannot diverge the way a refused in-window submission makes it (gen 84).
  if (n.pendingSecure) return '\n';

  if (!state.init) {
    state.init = true;
    state.ground = new Set();      // coordinates the terrain refused: poison these
    state.placed = [];             // what I have actually stood up, by ladder index
    state.spotIdx = {};            // which candidate each rung is trying
    state.retired = new Set();
    state.heroBad = new Set();
  }

  // Learn from the last array's refusals. GROUND reasons poison the coordinate;
  // ECONOMY reasons (insufficient_gold) poison nothing and retry (gen 51).
  for (const rec of n.orders ?? []) {
    if (rec.status !== 'failed') continue;
    const o = rec.order ?? {};
    const why = String(rec.reason ?? '') + ' ' + String(rec.detail ?? '');
    if (o.verb === 'BUILD' && o.where && !/insufficient_gold/i.test(why)) {
      state.ground.add(`${o.where.x},${o.where.z}`);
    }
    if (o.verb === 'MOVE_HERO' && /UNREACHABLE/i.test(why)) state.heroBad.add('post');
  }

  const t = n.timers?.runSeconds ?? 0;
  const gold = n.gold ?? 0;
  const fg = n.fairground ?? {};
  const allCrossed = fg.objective?.allCrossed === true;
  const orders = [];

  // 1. The draft, first, under replace semantics. Plating, then heal, then damage.
  if (Array.isArray(n.pendingOffer) && n.pendingOffer.length) {
    let best = n.pendingOffer[0], bestScore = -1;
    for (const off of n.pendingOffer) {
      const s = `${off.id} ${off.name} ${off.effectText}`.toLowerCase();
      let sc = 0;
      if (/plating|max health|maximum health|toughness|vigor/.test(s)) sc = 100;
      else if (/dressing|heal|regen|mend|recover/.test(s)) sc = 90;
      else if (/spark|damage|coil|tap|volley|power/.test(s)) sc = 60;
      else if (/rate|speed|reload|cool/.test(s)) sc = 40;
      else sc = 10;
      if (sc > bestScore) { bestScore = sc; best = off; }
    }
    orders.push({ verb: 'PICK_UPGRADE', id: best.id });
  }

  // 2. Blast, above the traveller: it returns {} on success AND failure, so it never
  //    owns the tick and is safe anywhere above a walking order.
  if ((n.blastReadyInMs ?? 1) === 0) orders.push({ verb: 'BLAST_AT', pos: BLAST_AT_PT });

  // 3. The post. Emitted once and dropped when parked — never a ladder of candidates,
  //    which is a shuttle that ping-pongs the hero and freezes the economy (gen 68).
  const hx = n.hero?.x ?? 0, hz = n.hero?.z ?? 0;
  const off = Math.hypot(hx - POST.x, hz - POST.z);
  if (off > 1.0 && !state.heroBad.has('post')) {
    orders.push({ verb: 'MOVE_HERO', pos: { x: POST.x, z: POST.z } });
  }

  // 4. The ladder: one ordinal per id, priced at its live instance, rungs whose candidates
  //    are all poisoned RETIRED rather than stalling the rungs behind them (gen 81).
  const byKind = n.works?.byKind ?? {};
  const seen = {};
  const emitted = [];
  if (t < HARD_BUILD_STOP) {
    for (let i = 0; i < LADDER.length; i++) {
      const rung = LADDER[i];
      seen[rung.id] = (seen[rung.id] ?? 0) + 1;
      if (state.retired.has(i)) continue;
      const standing = byKind[rung.id] ?? 0;
      if (standing >= seen[rung.id]) continue;          // this rung is already satisfied
      if (rung.b && !allCrossed) continue;              // phase B is gated on the latch
      let idx = state.spotIdx[i] ?? 0;
      while (idx < rung.spots.length && state.ground.has(`${rung.spots[idx][0]},${rung.spots[idx][1]}`)) idx++;
      state.spotIdx[i] = idx;
      if (idx >= rung.spots.length) { state.retired.add(i); continue; }
      const [bx, bz] = rung.spots[idx];
      emitted.push({ verb: 'BUILD', what: rung.id, where: { x: bx, z: bz }, when: { goldGte: rung.cost } });
      if (emitted.length >= 8) break;
    }
  }
  orders.push(...emitted);

  // 5. Mend, ungated: bounded to the rig radius around the Prospector since ADR-005 stage 2,
  //    so it can no longer walk the worker off the map, and the fort is what is dying here.
  orders.push({ verb: 'REPAIR_UNDER', pct: 99 });

  // 6. The harvest tail. An INACTIVE seam publishes x/z/anchorIndex as null and one
  //    non-finite number refuses the whole array silently (gen 59) — filter first.
  const live = (n.seams ?? []).filter((s) => s.active !== false
    && Number.isFinite(s.x) && Number.isFinite(s.z) && typeof s.id === 'string');
  live.sort((a, b) => Math.hypot(a.x - POST.x, a.z - POST.z) - Math.hypot(b.x - POST.x, b.z - POST.z));
  const chain = [];
  if (live.length) {
    const near = live.slice(0, 2);
    for (let block = 0; block < 2; block++) {
      for (const s of near) for (let k = 0; k < 6; k++) chain.push({ verb: 'HARVEST', seam: s.id });
    }
  }
  const room = Math.max(0, 31 - orders.length);
  orders.push(...chain.slice(0, room));

  // A terminal order that cannot be filtered away: never ship an array that could be empty.
  if (!orders.length) orders.push({ verb: 'MOVE_HERO', pos: { x: POST.x, z: POST.z } });

  return JSON.stringify(orders.slice(0, 32)) + '\n';
}
