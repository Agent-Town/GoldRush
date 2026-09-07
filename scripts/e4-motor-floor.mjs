// THE MOTOR FLOOR — one deterministic public-verb policy for ALL FOUR Motor maps, shared by three
// instruments so the same order stream can be ridden in Node (`e4-motor-ride.mjs`, the node
// guard) and in the browser (`e2e/e4-roads-and-convoys.spec.ts`), and their hashes compared.
// Pure: no Node imports, no state outside the view it is handed. A rider reads THE VIEW and
// answers; this is that answer, written down.
//
// The reasoning problem it solves is the era's (CAPABILITY-LADDER L1, E4: distance, roads,
// convoys): fuel first (three tar nodes, a dwell at each), then the corridor stake (GRADE), then
// stage the Hauler at the stake (HAUL), then walk to the stop and call it up the graded road
// (HAUL again) — the road is what makes the last sixty units cost three fuel instead of twenty.
// Everything after that is the ordinary claim floor: pan the nearest seams, ring the hero, mend.
//
// ONE POLICY, FOUR ERRANDS, because the view publishes the errand in one shape: `objective.stop` is
// always "where the Hauler must go NEXT" and `objective.corridorId` is always "the road that leg
// rides". So the haul's railhead, the convoy's far stop, the next OPEN lease head, and the tow's
// hulk-then-gate are all the same three moves to this policy — walk, grade, call it up — and the
// socket is what knows which errand that means. A washed-out lease is never chosen, because
// `MotorSocket.nextCorridor` skips closed roads while any open one is still owed.

const FUEL_HOP = 0.6;
const STAGED_REACH = 3;
/** `validateStandingOrders` refuses more than this many orders; the floor trims its harvests to fit. */
const ORDER_CAP = 32;

export const MOTOR_FLOOR_VARIANTS = ['rig', 'beacons', 'turtle', 'defend-first'];

export function motorFloorOrders(view, variant = 'rig') {
  const now = view.now;
  if (now.pendingSecure) return [{ verb: 'SECURE_CHOICE', choice: 'bank' }];
  const orders = [];
  const offer = now.pendingOffer?.[0] ? pickUpgrade(now.pendingOffer) : null;
  if (offer) orders.push({ verb: 'PICK_UPGRADE', id: offer });
  // defend-first: the haul can wait for the works (it only has to land before the Land-Yacht);
  // the turret cannot wait for the haul. Every other variant hauls in the opening thirty seconds.
  const haulNow = variant !== 'defend-first' || (now.works.byKind.turret ?? 0) >= 1 || now.wave >= 4;
  if (haulNow) orders.push(...motorSteps(now.motor, { x: now.hero.x, z: now.hero.z }));
  orders.push(...claimFloor(view, variant));
  return fitToCap(orders);
}

/**
 * The E4 half. Idempotent against the view: every step already taken is left out, so resubmitting
 * it every turn (which is what a rider does) never re-walks a road it has already walked.
 *
 * ADR-005 (owner, 2026-09-07): every walk below is the HERO'S. The rider positions one body, the
 * same one body a human positions, and the Prospector drifts in behind it with no order at all.
 * `GRADE` and `HAUL` are measured at the hero in both engines since `rider-parity-grammar` stage 1,
 * so a plan that walked the Prospector to a stake now grades nothing at all.
 *
 * ROUTE ORDER IS THE WHOLE GAME HERE. The tar and the corridor stake are visited NEAREST-FIRST from
 * where the hero actually stands, because a fixed order costs runs: on the Long Road the
 * stake is eight units west and the tar is a hundred and seventy east, so "fuel, then grade" walks
 * seven hundred and fifty units and the town never leaves the west end. Nearest-first walks three
 * hundred and ninety for the same two errands.
 */
export function motorSteps(motor, from = null) {
  if (!motor) return [];
  const steps = [];
  const vehicle = motor.vehicle;
  let at = from ?? { x: vehicle.x, z: vehicle.z };
  const corridor = motor.objective.arrived ? null : motor.roads.corridors.find(({ id }) => id === motor.objective.corridorId);

  // Errand one: the tar, and the stake if this leg's road still needs grading. Both are "stand
  // there for a moment" jobs, so they share one nearest-first walk.
  const chores = motor.fuel.nodes
    .filter((node) => !node.harvested)
    .map((node) => ({ kind: 'fuel', pos: { x: node.x, z: node.z } }));
  if (corridor && !corridor.graded && !corridor.closed) chores.push({ kind: 'grade', pos: corridor.start });
  while (chores.length > 0) {
    let best = 0;
    for (let index = 1; index < chores.length; index += 1) {
      if (distance(at, chores[index].pos) < distance(at, chores[best].pos)) best = index;
    }
    const [chore] = chores.splice(best, 1);
    if (chore.kind === 'grade') {
      steps.push({ verb: 'MOVE_HERO', pos: { x: chore.pos.x, z: chore.pos.z } }, { verb: 'GRADE' });
    } else {
      // Arrive, step aside, come back: the harvest needs half a second within reach, and a MOVE_HERO
      // completes the instant it arrives, so the dwell is written as three short walks. The hop is
      // 0.6 wu, wider than `HERO_ARRIVE_RADIUS` (0.5) so it is a real walk, and narrower than
      // `Balance.e4Fuel.harvestRange` (1.35) so the node stays in reach for every step of it.
      steps.push(
        { verb: 'MOVE_HERO', pos: { x: chore.pos.x, z: chore.pos.z } },
        { verb: 'MOVE_HERO', pos: { x: chore.pos.x + FUEL_HOP, z: chore.pos.z } },
        { verb: 'MOVE_HERO', pos: { x: chore.pos.x, z: chore.pos.z } },
      );
    }
    at = chore.pos;
  }
  if (!corridor) return steps;

  const stop = motor.objective.stop;
  const near = (point, target) => point !== null && point !== undefined && distance(point, target) <= STAGED_REACH;
  // Called: the Hauler is already driving to the stop, so the only thing left is to let it arrive.
  if (vehicle.state !== 'idle' && near(vehicle.dispatch, stop)) return steps;

  // Errand two, first half: if the Hauler rests on a graded road that is NOT this leg's road, call
  // it home down that road before striking out. `HAUL` drives straight lines, so a Hauler left at
  // the head of one lease crosses open county to the next one at three fuel a second, while the
  // grade it already paid for would carry it back to the camp end for one-and-a-fifth. This is the
  // difference between Gusher County delivering one lease and delivering all three.
  const ridden = motor.roads.corridors.find((entry) => entry.id !== corridor.id && onCorridor(vehicle, entry));
  if (ridden) {
    const exit = distance(ridden.start, corridor.start) <= distance(ridden.end, corridor.start) ? ridden.start : ridden.end;
    const heading = vehicle.state !== 'idle' && near(vehicle.dispatch, exit);
    if (distance(vehicle, exit) > STAGED_REACH && !heading) {
      steps.push({ verb: 'MOVE_HERO', pos: { x: exit.x, z: exit.z } }, { verb: 'HAUL' });
      return steps;
    }
  }

  // Errand two: put the Hauler ON the road before the long call. `HAUL` is a straight-line drive to
  // where the Prospector stands, so a Hauler called from off-road crosses country at 9/s and 3
  // fuel/s while the graded corridor beside it would carry it at 22.5/s for 1.2. Skipped when the
  // Hauler already rides this leg's road (the Long Road's lead Hauler starts on it) and when the
  // stake IS the stop (the tow comes back down the road it went up), so no leg walks itself twice.
  const staged = onCorridor(vehicle, corridor) || near(vehicle, corridor.start)
    || (vehicle.state !== 'idle' && near(vehicle.dispatch, corridor.start));
  if (!staged && !near(corridor.start, stop)) {
    steps.push({ verb: 'MOVE_HERO', pos: { x: corridor.start.x, z: corridor.start.z } }, { verb: 'HAUL' });
  }
  steps.push(...aimLadder(stop, corridor), { verb: 'HAUL' });
  return steps;
}

/**
 * THE AIM LADDER (ADR-005, measured 2026-09-07). `HAUL` drives the Hauler to where the HERO stands,
 * and three of the four errand stops are ground no hero can stand on: the Dust Flats railhead
 * (0,72) and the Long Road's far railhead (190,0) sample `walkable:false`, and the Boneyard's hulk
 * blocks a disc about two units wide around its own stake. The Prospector never cared — nothing
 * bounded where a work target could be — so the plans that walked it aimed straight at the stop.
 * A rider that positions the human's body has to do what a human does: walk AT the stop, and step
 * along the road when the ground refuses.
 *
 * The ladder is that, written as orders rather than as retries: aim at the stop, then one unit
 * past it, one short, two past, two short. `MOVE_HERO` refuses an unwalkable target outright
 * (`UNREACHABLE_TERRAIN`) and a failed order yields the tick to the next one, so the first
 * standable rung wins on the same tick and no rung is ever re-tried. Every rung is inside
 * `objective.stopReach` (2.5) with half a unit to spare, so the Hauler that comes to the hero is
 * a Hauler at the stop. Measured nearest standable ground: the Dust Flats 0.25 short, the Long
 * Road 0.75 past, Gusher County's three lease heads 0 (the ladder's first rung), the Boneyard 2.0
 * short of its hulk and 0 at its gate.
 */
function aimLadder(stop, corridor) {
  const axis = unit(stop, corridor.start) ?? unit(corridor.end, stop) ?? { x: 0, z: 1 };
  return [0, 1, -1, 2, -2].map((offset) => ({
    verb: 'MOVE_HERO',
    pos: { x: round3(stop.x + axis.x * offset), z: round3(stop.z + axis.z * offset) },
  }));
}

/** The unit vector from `from` to `to`, or null where the two coincide. */
function unit(to, from) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const length = Math.hypot(dx, dz);
  return length > 1e-6 ? { x: dx / length, z: dz / length } : null;
}

/** Order text is hashed into tapes, so the rungs are written to a fixed precision, never raw floats. */
function round3(value) {
  return Math.round(value * 1000) / 1000;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

/**
 * Is the Hauler riding this corridor already? Point-to-segment, with a tolerance a shade over the
 * road's own `Balance.e4Road.halfWidth` (1.5) because this is a policy heuristic, not a game rule:
 * being wrong by half a unit costs one redundant call, never a wrong answer.
 */
function onCorridor(point, corridor) {
  if (!corridor.graded) return false;
  const dx = corridor.end.x - corridor.start.x;
  const dz = corridor.end.z - corridor.start.z;
  const lengthSq = dx * dx + dz * dz;
  if (lengthSq <= 0) return false;
  const t = Math.min(1, Math.max(0, ((point.x - corridor.start.x) * dx + (point.z - corridor.start.z) * dz) / lengthSq));
  return Math.hypot(point.x - (corridor.start.x + dx * t), point.z - (corridor.start.z + dz * t)) <= 2;
}

function fitToCap(orders) {
  const fitted = [...orders];
  while (fitted.length > ORDER_CAP) {
    const last = fitted.map((order) => order.verb).lastIndexOf('HARVEST');
    if (last < 0) break;
    fitted.splice(last, 1);
  }
  return fitted.slice(0, ORDER_CAP);
}

function claimFloor(view, variant) {
  const hero = view.now.hero;
  const home = { x: hero.x, z: hero.z };
  const seams = view.now.seams
    .filter((seam) => seam.active && seam.x !== null && seam.z !== null)
    .map((seam) => ({ id: seam.id, distance: Math.hypot(seam.x - hero.x, seam.z - hero.z) }))
    .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id))
    .slice(0, 2);
  // Builds BEFORE harvests: a BUILD whose gold condition is unmet yields the tick, so the works go
  // up the moment the purse allows while the harvest walks continue in between. Written the other
  // way round, twelve far-seam harvests own every tick of a thirty-second wave and nothing is built.
  const ring = [
    { verb: 'BUILD', what: 'palisade', where: { x: home.x - 3, z: home.z + 3 }, when: { goldGte: 10 } },
    { verb: 'BUILD', what: 'palisade', where: { x: home.x, z: home.z + 3 }, when: { goldGte: 10 } },
    { verb: 'BUILD', what: 'palisade', where: { x: home.x + 3, z: home.z + 3 }, when: { goldGte: 10 } },
    { verb: 'BUILD', what: 'palisade', where: { x: home.x, z: home.z - 3 }, when: { goldGte: 10 } },
  ];
  const guns = variant === 'beacons'
    ? [
        { verb: 'BUILD', what: 'sentry_beacon', where: { x: home.x - 3, z: home.z }, when: { goldGte: 25 } },
        { verb: 'BUILD', what: 'sentry_beacon', where: { x: home.x + 3, z: home.z }, when: { goldGte: 35 } },
        { verb: 'BUILD', what: 'turret', where: { x: home.x, z: home.z - 6 }, when: { goldGte: 50 } },
      ]
    : [
        { verb: 'BUILD', what: 'turret', where: { x: home.x - 3, z: home.z }, when: { goldGte: 50 } },
        { verb: 'BUILD', what: 'turret', where: { x: home.x + 3, z: home.z }, when: { goldGte: 70 } },
      ];
  // turtle: timber first, then guns; everything else buys guns first and timber with the change.
  const orders = variant === 'turtle' ? [...ring, ...guns] : [...guns, ...ring];
  orders.push({ verb: 'REPAIR_UNDER', pct: variant === 'turtle' ? 80 : 60 });
  for (const seam of seams) for (let count = 0; count < 6; count += 1) orders.push({ verb: 'HARVEST', seam: seam.id });
  // The plan once ended with `HOLD` at the hero's feet, which is the one thing the human's surface
  // never offered (ADR-005). It was also redundant: `Embodiment.driftNearHero` walks an unemployed
  // Prospector back to the hero every step, so "stand by the hero" is what silence already means.
  return orders;
}

const UPGRADE_PREFERENCE = ['prospectors_luck', 'heavy_spark', 'double_tap_coil', 'long_resonator', 'tinkers_plating', 'spring_heels', 'pan_legend'];

function pickUpgrade(offer) {
  const ids = offer.map(({ id }) => id);
  return UPGRADE_PREFERENCE.find((id) => ids.includes(id)) ?? ids[0] ?? null;
}
