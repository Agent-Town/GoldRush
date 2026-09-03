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
  if (haulNow) orders.push(...motorSteps(now.motor));
  orders.push(...claimFloor(view, variant));
  return fitToCap(orders);
}

/** The E4 half. Idempotent against the view: every step already taken is left out. */
export function motorSteps(motor) {
  if (!motor) return [];
  const steps = [];
  for (const node of motor.fuel.nodes) {
    if (node.harvested) continue;
    // Arrive, step aside, come back: the harvest needs half a second within reach, and a MOVE_TO
    // completes the instant it arrives, so the dwell is written as three short walks.
    steps.push(
      { verb: 'MOVE_TO', pos: { x: node.x, z: node.z } },
      { verb: 'MOVE_TO', pos: { x: node.x + FUEL_HOP, z: node.z } },
      { verb: 'MOVE_TO', pos: { x: node.x, z: node.z } },
    );
  }
  if (motor.objective.arrived) return steps;
  const corridor = motor.roads.corridors.find(({ id }) => id === motor.objective.corridorId);
  if (!corridor) return steps;
  const stop = motor.objective.stop;
  const vehicle = motor.vehicle;
  const near = (point, target) => point && Math.hypot(point.x - target.x, point.z - target.z) <= STAGED_REACH;
  // Staged: the Hauler already rests at the stake, or is on its way there. Called: it is already
  // driving to the stop, so the only thing left is to let it arrive.
  const staged = near(vehicle, corridor.start) || (vehicle.state !== 'idle' && near(vehicle.dispatch, corridor.start));
  const called = vehicle.state !== 'idle' && near(vehicle.dispatch, stop);
  if (called) return steps;
  // The stake is worth a detour only while it still buys something: an ungraded road to grade, or a
  // Hauler to put on it. When the stop IS the stake (the tow's second leg comes back down the road
  // it went up) the detour collapses into the call below, and the policy stays idempotent.
  const stakeIsStop = near(corridor.start, stop);
  if ((!corridor.graded || !staged) && !stakeIsStop && !corridor.closed) {
    steps.push({ verb: 'MOVE_TO', pos: { x: corridor.start.x, z: corridor.start.z } });
    if (!corridor.graded) steps.push({ verb: 'GRADE' });
    if (!staged) steps.push({ verb: 'HAUL' });
  } else if (!corridor.graded && stakeIsStop && !corridor.closed) {
    steps.push({ verb: 'MOVE_TO', pos: { x: corridor.start.x, z: corridor.start.z } }, { verb: 'GRADE' });
  }
  steps.push({ verb: 'MOVE_TO', pos: { x: stop.x, z: stop.z } });
  steps.push({ verb: 'HAUL' });
  return steps;
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
  orders.push({ verb: 'HOLD', pos: home });
  return orders;
}

const UPGRADE_PREFERENCE = ['prospectors_luck', 'heavy_spark', 'double_tap_coil', 'long_resonator', 'tinkers_plating', 'spring_heels', 'pan_legend'];

function pickUpgrade(offer) {
  const ids = offer.map(({ id }) => id);
  return UPGRADE_PREFERENCE.find((id) => ids.includes(id)) ?? ids[0] ?? null;
}
