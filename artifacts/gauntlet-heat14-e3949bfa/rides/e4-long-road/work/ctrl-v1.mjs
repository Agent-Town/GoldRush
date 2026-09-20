// e4-long-road controller, heat 14 (era 6).
// The errand is a state machine over the view: emit only the REMAINING legs,
// never the whole chain (re-emitting a phase-gated array walks the hero backwards).
//
// Phases:
//   A grade   walk to the west stake (within gradeReach 2.5 of (-190,0)) and GRADE
//   B fuel    dwell-zig each unharvested tar node (3 per node keeps the body in harvestRange 1.35)
//   C stop    walk to a point inside stopReach 2.5 of (190,0), then HAUL
//   D hold    errand latched: park, kite if hurt, pan for the only free ranking axis

const STOP = { x: 190, z: 0 };
const GRADE_STAKE = { x: -190, z: 0 };
const GRADE_POST = { x: -188, z: 0 };          // 2.0 from the stake, inside gradeReach 2.5

// Candidate rests, all inside stopReach 2.5 of (190,0). The first is the point
// generation 70 measured the hero actually coming to rest on; the rest are fallbacks
// in case the re-surveyed railhead moved its footprint.
const STOP_LADDER = [
  { x: 191.07, z: -0.36 },
  { x: 191.6, z: 0.9 },
  { x: 191.6, z: -0.9 },
  { x: 190.0, z: 2.1 },
  { x: 190.0, z: -2.1 },
  { x: 188.2, z: 0 },
  { x: 192.2, z: 0 },
];

const KITE = [{ x: 191.07, z: -0.36 }, { x: 177, z: -0.36 }];

function mv(p) { return { verb: 'MOVE_HERO', pos: { x: +p.x.toFixed(3), z: +p.z.toFixed(3) } }; }

function pickUpgrade(now) {
  const offer = now.pendingOffer;
  if (!offer || !offer.length) return null;
  const score = o => {
    const s = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
    if (/plating|armor|armour|max hp|maxhp|vitality|tough/.test(s)) return 100;
    if (/dressing|heal|regen|mend|recover/.test(s)) return 90;
    if (/speed|heels|swift|boots/.test(s)) return 60;   // a walking hero likes speed here
    if (/spark|damage|coil|tap|volley/.test(s)) return 50;
    return 10;
  };
  const best = offer.slice().sort((a, b) => score(b) - score(a))[0];
  return { verb: 'PICK_UPGRADE', id: best.id };
}

function liveSeams(now, from) {
  return (now.seams || [])
    .filter(s => s && s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map(s => ({ ...s, d: Math.hypot(s.x - from.x, s.z - from.z) }))
    .sort((a, b) => a.d - b.d);
}

export default function decide(view, state, n) {
  const now = view.now || {};
  if (now.pendingSecure) return '';            // silence banks the default and cannot be rejected

  const m = now.motor || {};
  const obj = m.objective || {};
  const roads = m.roads || {};
  const fuel = m.fuel || {};
  const hero = now.hero || {};
  const H = { x: hero.x ?? 0, z: hero.z ?? 0 };

  const orders = [];
  const up = pickUpgrade(now);
  if (up) orders.push(up);

  // --- track stop-ladder refusals so a blocked rest yields to the next candidate
  state.stopIdx = state.stopIdx || 0;
  for (const rec of (now.orders || [])) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || {};
    if (o.verb !== 'MOVE_HERO' || !o.pos) continue;
    if (!/UNREACHABLE/.test(String(rec.reason || ''))) continue;
    const i = STOP_LADDER.findIndex(p => Math.abs(p.x - o.pos.x) < 0.01 && Math.abs(p.z - o.pos.z) < 0.01);
    if (i >= 0 && i >= state.stopIdx) state.stopIdx = i + 1;
  }

  const graded = (roads.corridors || []).some(c => c.id === 'the-long-road' && c.graded);
  const nodes = fuel.nodes || [];
  const unharvested = nodes.filter(nd => !nd.harvested);
  const arrived = obj.arrived === true;

  // ---- PHASE A: grade the long road. 380 ungraded units cost ~123 fuel against a 36-fuel run.
  if (!graded) {
    orders.push(mv(GRADE_POST));
    orders.push({ verb: 'GRADE' });
  }

  // ---- PHASE B: harvest the remaining tar nodes with a 3-waypoint dwell
  if (!arrived) {
    for (const nd of unharvested) {
      orders.push(mv({ x: nd.x, z: nd.z }));
      orders.push(mv({ x: nd.x, z: nd.z - 1.1 }));
      orders.push(mv({ x: nd.x, z: nd.z + 1.0 }));
    }
  }

  // ---- PHASE C: walk to the railhead's reachable edge, then call the Hauler up the graded road
  if (!arrived) {
    const rest = STOP_LADDER.slice(Math.min(state.stopIdx, STOP_LADDER.length - 1));
    for (const p of rest.slice(0, 4)) orders.push(mv(p));
    orders.push({ verb: 'HAUL' });
  } else {
    // ---- PHASE D: errand latched (one-way). Hold the east end; kite only if actually hurt.
    const frac = (hero.maxHp ? hero.hp / hero.maxHp : 1);
    if (frac < 0.70) {
      state.kite = ((state.kite || 0) + 1) % 2;
      orders.push(mv(KITE[state.kite]));
    } else {
      const post = STOP_LADDER[Math.min(state.stopIdx, STOP_LADDER.length - 1)];
      if (Math.hypot(H.x - post.x, H.z - post.z) > 1.0) orders.push(mv(post));
    }
  }

  // ---- tail: gold is the only free ranking axis once waves and time are pinned by the gate.
  // A failing HARVEST costs nothing (the Prospector already stands where it pans) and buys views.
  const seams = liveSeams(now, H);
  if (seams.length) {
    const chain = [seams[0], seams[0], seams[0], seams[0], seams[0], seams[0], seams[1] || seams[0]];
    for (const s of chain) {
      if (orders.length >= 31) break;
      orders.push({ verb: 'HARVEST', seam: s.id });
    }
  }

  return orders.slice(0, 32);
}
