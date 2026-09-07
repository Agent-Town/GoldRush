// THE SUB-WAVE MOTOR DIGEST — the both-engine proof that the browser harness can actually carry.
//
// A live `HeadlessContractSim` cannot be ridden to its terminal inside the browser harness page:
// the first wave boundary throws in `RunSuspend.captureSnapshot` (`deepClone` -> `JSON.parse` of an
// undefined snapshot field, `src/game/RunSuspend.ts:3101`), on EVERY contract including `the-claim`,
// which is a pre-existing harness limitation outside this slice's firewall. Under that boundary the
// two engines can be compared exactly, and that is what this digest does: one scripted order stream,
// a fixed tick budget, and the motor state read at fixed marks. Node and the browser run the SAME
// function (this module is imported by both `scripts/e4-roads-and-convoys.test.mjs` and
// `e2e/e4-roads-and-convoys.spec.ts`), so the comparison has one author and no transcription.

/** Well under the first wave boundary (wave 1 lands near tick 900 on these maps). */
export const DIGEST_TICKS = 780;
export const DIGEST_MARKS = [120, 300, 480, 660, 780];

/** The scripted stream: fuel at every tar node, grade the errand's road, then call the Hauler up it. */
// ADR-005 stage 3 (owner 2026-09-07): every walk below is the HERO'S, and the Prospector drifts
// in behind it. `MOVE_TO` and `HOLD` positioned the Prospector, which no human can do; a hero that
// arrives and is then left alone STAYS where it stopped, so the old trailing HOLD needs no
// replacement at all — arriving is the hold.
export function digestOrders(motor, phase) {
  const node = motor.fuel.nodes.find((entry) => !entry.harvested);
  if (node) return [{ verb: 'MOVE_HERO', pos: { x: node.x, z: node.z } }];
  const corridor = motor.roads.corridors.find(({ id }) => id === motor.objective.corridorId);
  if (!corridor) return [{ verb: 'MOVE_HERO', pos: { x: 0, z: 0 } }];
  if (!corridor.graded) {
    return [{ verb: 'MOVE_HERO', pos: { x: corridor.start.x, z: corridor.start.z } }, { verb: 'GRADE' }];
  }
  if (phase.hauled) return [{ verb: 'MOVE_HERO', pos: { x: corridor.start.x, z: corridor.start.z } }];
  phase.hauled = true;
  return [{ verb: 'HAUL' }, { verb: 'MOVE_HERO', pos: { x: corridor.start.x, z: corridor.start.z } }];
}

/** One line per mark: everything the socket owns, rounded exactly as the view rounds it. */
export function digestLine(tick, motor) {
  const vehicle = motor.vehicle;
  const fuel = motor.fuel;
  return [
    `t${tick}`,
    `veh=${vehicle.x},${vehicle.z},${vehicle.state},${vehicle.distanceTravelled},${vehicle.roadDistance}`,
    `fuel=${fuel.tar},${fuel.stored},${fuel.harvestedNodes},${fuel.drawn}`,
    `roads=${motor.roads.graded.join('+') || '-'},${motor.roads.length}`,
    `weather=${motor.weather.phase},${motor.weather.cycle}`,
    `obj=${motor.objective.kind},${motor.objective.arrived},${motor.objective.arrivedAt ?? '-'}`,
    `events=${motor.eventCount}`,
  ].join('|');
}

/** Rides one contract for `DIGEST_TICKS` and returns the marks. `sim` is a live HeadlessContractSim. */
export function motorDigest(sim) {
  const phase = { hauled: false };
  const lines = [];
  for (let tick = 1; tick <= DIGEST_TICKS; tick += 1) {
    const motor = sim.currentTurn().view.now.motor;
    if (tick % 30 === 1) sim.submitOrders(digestOrders(motor, phase));
    sim.advanceOneTick();
    if (DIGEST_MARKS.includes(tick)) lines.push(digestLine(tick, sim.currentTurn().view.now.motor));
  }
  return lines;
}

// `--all`: the Node half of the both-engine comparison, printed as one JSON line for the e2e.
// Node-only entry point. Guarded on `process` because the browser imports this same module for
// the other half of the comparison, and a bare `process.argv` there is a ReferenceError at import.
if (typeof process !== 'undefined' && process.argv?.includes('--all')) {
  const { createServer } = await import('vite');
  const digests = {};
  for (const id of ['e4-dust-flats', 'e4-long-road', 'e4-gusher-county', 'e4-boneyard']) {
    const location = new URL(`http://e4-digest.local/?debug&contract=${id}&seed=${id}-01`);
    globalThis.location = location;
    globalThis.window = { location };
    const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
    try {
      const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
      digests[id] = motorDigest(new HeadlessContractSim({ contractId: id, seed: `${id}-01` }));
    } finally {
      await vite.close();
    }
  }
  process.stdout.write(`${JSON.stringify(digests)}\n`);
}
