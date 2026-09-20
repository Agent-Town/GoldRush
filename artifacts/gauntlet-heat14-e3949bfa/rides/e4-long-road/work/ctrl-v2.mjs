// e4-long-road controller v2, heat 14 (era 6).
//
// tune-1 measured the whole errand working (graded, 9 tar, 365.25 units on 20.68 fuel)
// and still missed the latch: the hero is WALLED at x ~= 185.26, so the Hauler rested
// 4.75 from the stop against stopReach 2.5. MOVE_HERO walks straight lines and the hero
// has no pathfinder, so v2 ROUTES AROUND the railhead footprint (south, then east, then
// back west onto the stop) instead of walking into its west face.
//
// It also kites: tune-1's hero died 92 -> 0 in five seconds standing still at the east end.

const STOP = { x: 190, z: 0 };
const GRADE_POST = { x: -188, z: 0 };

// Approach routes, tried in order. Each is a straight-line chain; a refused leg is skipped.
// Every terminal point is inside stopReach 2.5 of (190,0).
const ROUTES = [
  // 0: straight down the road (cheapest if the footprint moved in the re-survey)
  [{ x: 186, z: 0 }, { x: 188.4, z: 0 }],
  // 1: swing south, come at the stop from the south-east
  [{ x: 184, z: -13 }, { x: 196, z: -13 }, { x: 196, z: -2 }, { x: 191.8, z: -1.2 }],
  // 2: swing north, come at the stop from the north-east
  [{ x: 184, z: 13 }, { x: 196, z: 13 }, { x: 196, z: 2 }, { x: 191.8, z: 1.2 }],
  // 3: shallow south shoulder
  [{ x: 184, z: -6 }, { x: 190, z: -6 }, { x: 190.2, z: -2.2 }],
  // 4: shallow north shoulder
  [{ x: 184, z: 6 }, { x: 190, z: 6 }, { x: 190.2, z: 2.2 }],
];

// Post-latch patrol: a long chain keeps the hero moving between sparse views.
// Hero 6.0 against motor_gang 2.7 * 1.18 = 3.19 is a shutout while it keeps walking.
const PATROL = [];
for (let k = 0; k < 5; k++) { PATROL.push({ x: 150, z: 0 }); PATROL.push({ x: 184, z: 0 }); }

function mv(p) { return { verb: 'MOVE_HERO', pos: { x: +p.x.toFixed(3), z: +p.z.toFixed(3) } }; }
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

function pickUpgrade(now) {
  const offer = now.pendingOffer;
  if (!offer || !offer.length) return null;
  const score = o => {
    const s = `${o.id} ${o.name} ${o.effectText || ''}`.toLowerCase();
    if (/plating|armor|armour|max hp|maxhp|vitality|tough/.test(s)) return 100;
    if (/dressing|heal|regen|mend|recover/.test(s)) return 90;
    if (/speed|heels|swift|boots/.test(s)) return 70;
    if (/spark|damage|coil|tap|volley/.test(s)) return 50;
    return 10;
  };
  return { verb: 'PICK_UPGRADE', id: offer.slice().sort((a, b) => score(b) - score(a))[0].id };
}

export default function decide(view, state, n) {
  const now = view.now || {};
  if (now.pendingSecure) return '';

  const m = now.motor || {};
  const obj = m.objective || {};
  const roads = m.roads || {};
  const fuel = m.fuel || {};
  const hero = now.hero || {};
  const H = { x: hero.x ?? 0, z: hero.z ?? 0 };
  const veh = m.vehicle || {};

  state.route = state.route ?? 0;
  state.leg = state.leg ?? 0;
  state.patrol = state.patrol ?? 0;

  // a refused leg retires that waypoint; a route that runs out retires the route
  for (const rec of (now.orders || [])) {
    if (rec.status !== 'failed') continue;
    const o = rec.order || {};
    if (o.verb !== 'MOVE_HERO' || !o.pos) continue;
    if (!/UNREACHABLE/.test(String(rec.reason || ''))) continue;
    const R = ROUTES[state.route] || [];
    const i = R.findIndex(p => Math.abs(p.x - o.pos.x) < 0.01 && Math.abs(p.z - o.pos.z) < 0.01);
    if (i >= 0) {
      if (i >= R.length - 1) { state.route++; state.leg = 0; }   // terminal refused -> next route
      else if (i >= state.leg) state.leg = i + 1;
    }
  }
  if (state.route >= ROUTES.length) { state.route = ROUTES.length - 1; }

  const orders = [];
  const up = pickUpgrade(now);
  if (up) orders.push(up);

  const graded = (roads.corridors || []).some(c => c.id === 'the-long-road' && c.graded);
  const nodes = fuel.nodes || [];
  const unharvested = nodes.filter(nd => !nd.harvested);
  const arrived = obj.arrived === true;

  if (!graded) {
    orders.push(mv(GRADE_POST));
    orders.push({ verb: 'GRADE' });
  }

  if (!arrived) {
    for (const nd of unharvested) {
      orders.push(mv({ x: nd.x, z: nd.z }));
      orders.push(mv({ x: nd.x, z: nd.z - 1.1 }));
      orders.push(mv({ x: nd.x, z: nd.z + 1.0 }));
    }

    const R = ROUTES[state.route];
    // advance the leg index past waypoints the hero already stands on
    while (state.leg < R.length - 1 && dist(H, R[state.leg]) < 1.0) state.leg++;
    for (let i = state.leg; i < R.length; i++) orders.push(mv(R[i]));

    // dispatch only from the terminal point, and only while the Hauler is still short
    const term = R[R.length - 1];
    const vehShort = !(Number.isFinite(veh.x) && dist({ x: veh.x, z: veh.z }, STOP) <= 2.4);
    if (dist(H, term) < 1.2 && vehShort) orders.push({ verb: 'HAUL' });
  } else {
    // latched (one-way). Keep the body moving; standing still is what killed tune-1.
    state.patrol = (state.patrol + 1) % 2;
    const chain = state.patrol ? PATROL : PATROL.slice().reverse();
    for (const p of chain) { if (orders.length >= 24) break; orders.push(mv(p)); }
  }

  const seams = (now.seams || [])
    .filter(s => s && s.active !== false && Number.isFinite(s.x) && Number.isFinite(s.z))
    .map(s => ({ ...s, d: Math.hypot(s.x - H.x, s.z - H.z) }))
    .sort((a, b) => a.d - b.d);
  if (seams.length) {
    for (let k = 0; k < 6 && orders.length < 31; k++) orders.push({ verb: 'HARVEST', seam: seams[0].id });
  }

  return orders.slice(0, 32);
}
