// THE REGATTA BOAT-STEER GUARD — slice 1 of `specs/agent-play/e5-regatta-steerable-boat.md`
// (owner, 2026-09-20: "A14 - do it"; 2026-09-14: "A14 - I am not sure, driving a boat sounds like
// fun?"; the parity law it lives under, 2026-09-07: "no, AI and human users have to have the same
// options and tools, otherwise it is unfair. fairness is crucial.").
//
// The measured problem this answers (F-RPG-18/19): every gate of the Regatta course is open water
// no body can stand on, so the race could not be won honestly by either species. The spec's answer
// is that the CLAIM-BOAT is the racing body and the hero rides it, steered by the one intent a
// human's keys and a rider's `MOVE_HERO` both produce.
//
// Five things can rot, and each has a test:
//
//   1. THE BOAT STOPS BEING A BODY. Boarding is a crossing of the deck rail, the hero is carried at
//      the deck anchor while aboard, a course is steered, and a step ashore puts the body back on
//      ground it can stand on. Driven tick by tick on a real `HeadlessContractSim`.
//   2. THE REFUSALS GO SILENT. `NOT_ABOARD` and `UNREACHABLE_WATER` must answer on the standing-order
//      status channel. An order that sits `active` forever is the Silent No-Op wearing a status.
//   3. THE FEEL DRIFTS FROM THE RULING. The owner ratified "turns in about 2 s, crosses the course
//      in about 60 s at top speed, fast water x1.5". Those three are MEASURED here and printed, so
//      the report quotes measurements and not intentions.
//   4. THE TWO ENGINES DISAGREE. `artifacts/e5-regatta-boat/boat-tape.json` pins a tape — a boarding,
//      four steered legs and the sampled boat track — with its hash. This guard replays it on the
//      HEADLESS engine; `e2e/e5-regatta-boat.spec.ts` replays the same tape on the BROWSER engine
//      through `__GR_TEST__.advanceSim` (the same 1/30 fixed step). Both must reach the pinned hash:
//      that equality IS the parity claim of this slice.
//   5. THE IDLE PATH MOVES. A run that never boards must walk the object graph it walked before the
//      boat could be steered. Pinned by the 83 null floors (`scripts/null-floor-anchors.mjs --check`)
//      and re-stated here as a cheap two-run determinism check on an idle ride.
//
// MINTING: `GR_BOAT_TAPE_MINT=1 node --test scripts/regatta-boat-steer.test.mjs` rewrites
// `boat-tape.json` from the headless engine. Minting is a deliberate, reviewed act — the tape is
// this slice's evidence, and a guard that silently re-records its own baseline asserts nothing.
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TAPE_PATH = fileURLToPath(new URL('../artifacts/e5-regatta-boat/boat-tape.json', import.meta.url));
const ARTIFACT_DIR = fileURLToPath(new URL('../artifacts/e5-regatta-boat/', import.meta.url));
const CONTRACT = 'e5-regatta';
const SEED = 'e5-regatta-01';
const STEP = 1 / 30;
const MINT = process.env.GR_BOAT_TAPE_MINT === '1';

/**
 * THE TAPE. Written here rather than in the pinned artifact so the SCRIPT of the ride is reviewable
 * source and only the RESULT is a pin. `boarding` is the pair of positions that puts the hero off
 * the deck and then on it — the browser reaches them through `__GR_TEST__.teleport`, this engine by
 * setting the same field, which is the same act. After the second, the boat is at rest on the
 * start-line anchor in BOTH engines, which is what makes the tracks comparable at all.
 */
export const BOAT_TAPE = Object.freeze({
  boarding: Object.freeze([
    Object.freeze({ x: -40, z: 0 }),
    Object.freeze({ x: -49, z: 6 }),
  ]),
  sampleEveryTicks: 30,
  legs: Object.freeze([
    // North for the fast-water band (z 34..54): a 90 degree turn, a long run, the x1.5 crossing.
    Object.freeze({ seconds: 26, steer: Object.freeze({ x: -49, z: 44 }) }),
    // East inside the band.
    Object.freeze({ seconds: 10, steer: Object.freeze({ x: -10, z: 44 }) }),
    // Helm released: drag alone brings her to rest.
    Object.freeze({ seconds: 6, steer: null }),
  ]),
});

async function withVite(run) {
  const location = new URL(`http://regatta-boat.test/?debug&contract=${CONTRACT}`);
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    return await run(vite);
  } finally {
    await vite.close();
    if (previousLocation === undefined) delete globalThis.location; else globalThis.location = previousLocation;
    if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;
  }
}

const boatOf = (sim) => sim.deepwater.tile.boat;
const motionOf = (sim) => sim.deepwater.tile.snapshot().boat.motion;
const orderOf = (sim) => sim.standingOrdersSnapshot().orders.at(-1);
/** The browser reaches these two positions through `__GR_TEST__.teleport`; this is the same act. */
const placeHero = (sim, { x, z }) => sim.hero.group.position.set(x, sim.hero.group.position.y, z);

/** The boarding half of the tape, identical in both engines. Leaves the boat at rest on its anchor. */
function boardByWalkingAboard(sim) {
  for (const spot of BOAT_TAPE.boarding) {
    placeHero(sim, spot);
    sim.advanceOneTick();
  }
  return motionOf(sim);
}

/** The steered half. Returns the sampled track both engines must agree on. */
function sailTape(sim, steerTo) {
  const track = [];
  let tick = 0;
  for (const leg of BOAT_TAPE.legs) {
    steerTo(leg.steer);
    const ticks = Math.round(leg.seconds / STEP);
    for (let i = 0; i < ticks; i += 1) {
      sim.advanceOneTick();
      tick += 1;
      if (tick % BOAT_TAPE.sampleEveryTicks === 0) {
        const m = motionOf(sim);
        track.push([tick, m.x, m.z, m.heading, m.speed, m.aboard ?? '']);
      }
    }
  }
  return track;
}

test('the hero boards by walking aboard, is carried at the deck anchor, and steps ashore again', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    const boat = boatOf(sim);

    assert.equal(boat.steerable, true, 'the Regatta must author boat physics');
    assert.deepEqual(boat.water, { minX: -49.75, maxX: 49.75, minZ: -49.75, maxZ: 49.75 },
      'the hull clamp is the boat-travelling water inset by the hull radius');

    // The Regatta's `heroStart` stake IS the start-line anchor, so the hero boots STANDING ON THE
    // DECK. That is not aboard: boarding is a crossing, and nothing has crossed. If this ever flips
    // to true, every idle run is suddenly aboard a boat nobody boarded and the null floors move.
    sim.advanceOneTick();
    assert.equal(boat.aboard, null, 'a hero that boots on the deck has not boarded anything');
    assert.equal(motionOf(sim).x, -49);
    assert.equal(motionOf(sim).z, 0);

    const moored = boardByWalkingAboard(sim);
    assert.equal(moored.aboard, 'hero', 'walking onto the deck boards the boat');
    assert.deepEqual(
      { x: moored.x, z: moored.z, heading: moored.heading, speed: moored.speed },
      { x: -49, z: 0, heading: 0, speed: 0 },
      'boarding must not move the boat: both engines start the tape from this state',
    );
    // Read off the body, not the view: `view.now.hero` rounds for the door.
    assert.equal(sim.hero.group.position.x, moored.x, 'the hero rides at the deck anchor');
    assert.equal(sim.hero.group.position.z, moored.z, 'the hero rides at the deck anchor');

    // A rider's MOVE_HERO to a water point sails the boat there — the verb positions the BODY, and
    // while aboard the body is the boat.
    const target = { x: -20, z: 6 };
    assert.equal(sim.submitOrders([{ verb: 'MOVE_HERO', pos: target }]).outcome.ok, true);
    for (let i = 0; i < 3_000 && !sim.isTerminal; i += 1) {
      sim.advanceOneTick();
      if (orderOf(sim)?.status === 'done' || orderOf(sim)?.status === 'failed') break;
    }
    const sailed = motionOf(sim);
    assert.equal(orderOf(sim).status, 'done', `the sailing order ended ${orderOf(sim).status}: ${orderOf(sim).reason ?? ''}`);
    assert.ok(Math.hypot(sailed.x - target.x, sailed.z - target.z) <= 1,
      `the boat stopped ${Math.hypot(sailed.x - target.x, sailed.z - target.z).toFixed(3)} from the water target`);
    assert.equal(sailed.aboard, 'hero', 'sailing does not put anyone overboard');
    assert.equal(sim.hero.group.position.x, sailed.x, 'the hero still rides the deck anchor after the crossing');
    assert.equal(sim.hero.group.position.z, sailed.z, 'the hero still rides the deck anchor after the crossing');

    // Back to the start-line rim, then a step ashore: the ground beyond the hull's clamp is ground a
    // body can stand on that the hull cannot float in. On a course that is all open water, that rim
    // IS the shore — it is also exactly where the boat would run aground.
    assert.equal(sim.submitOrders([{ verb: 'MOVE_HERO', pos: { x: -49.5, z: 6 } }]).outcome.ok, true);
    for (let i = 0; i < 3_000 && !sim.isTerminal; i += 1) {
      sim.advanceOneTick();
      if (orderOf(sim)?.status === 'done' || orderOf(sim)?.status === 'failed') break;
    }
    const atRim = motionOf(sim);
    // One metre off the port rail: off the deck, inside the plank, outside the water the hull may use.
    const ashore = { x: atRim.x - 4.4 - 1, z: atRim.z };
    assert.equal(boat.navigable(ashore.x, ashore.z), false, 'the step-ashore point must be water the hull cannot use');
    assert.equal(boat.contains(ashore.x, ashore.z), false, 'the step-ashore point must be off the deck');
    assert.equal(boat.withinGangplank(ashore.x, ashore.z), true, 'the step-ashore point must be inside the plank');
    assert.equal(sim.submitOrders([{ verb: 'MOVE_HERO', pos: ashore }]).outcome.ok, true);
    sim.advanceOneTick();
    sim.advanceOneTick();
    const off = motionOf(sim);
    assert.equal(off.aboard, null, `a step ashore must leave the boat (order: ${JSON.stringify(orderOf(sim))})`);
    assert.equal(off.speed, 0, 'a boat nobody is aboard is not under way');
    const stepped = sim.hero.group.position;
    assert.ok(Math.hypot(stepped.x - ashore.x, stepped.z - ashore.z) < 1e-9,
      `the hero must stand on the shore point it named, not near it (${stepped.x}, ${stepped.z})`);
  });
});

test('the boat refuses on the status channel: NOT_ABOARD ashore, UNREACHABLE_WATER at the helm', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');

    // NOT_ABOARD — standing on the rim where the hull cannot float, ordered out into open water.
    const ashore = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    placeHero(ashore, { x: -54, z: 0 });
    assert.equal(ashore.submitOrders([{ verb: 'MOVE_HERO', pos: { x: -10, z: 6 } }]).outcome.ok, true);
    ashore.advanceOneTick();
    const refusedAshore = orderOf(ashore);
    assert.equal(refusedAshore.status, 'failed');
    assert.match(refusedAshore.reason, /^NOT_ABOARD: /);

    // UNREACHABLE_WATER — aboard, ordered to a point the hull cannot reach that is no step ashore.
    const aboard = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    boardByWalkingAboard(aboard);
    assert.equal(boatOf(aboard).aboard, 'hero');
    assert.equal(aboard.submitOrders([{ verb: 'MOVE_HERO', pos: { x: -60, z: 30 } }]).outcome.ok, true);
    aboard.advanceOneTick();
    const refusedAfloat = orderOf(aboard);
    assert.equal(refusedAfloat.status, 'failed');
    assert.match(refusedAfloat.reason, /^UNREACHABLE_WATER: /);

    // And the two live OUTSIDE the published `HERO_ORDER_REFUSALS` vocabulary on purpose: slice 3
    // publishes them with the view bump, the fence and the census pin, all in one censused act.
    const { BOAT_ORDER_REFUSALS, HERO_ORDER_REFUSALS } = await vite.ssrLoadModule('/src/agent/StandingOrders.ts');
    assert.deepEqual([...BOAT_ORDER_REFUSALS], ['NOT_ABOARD', 'UNREACHABLE_WATER']);
    assert.deepEqual([...HERO_ORDER_REFUSALS], ['HERO_NOT_YOURS', 'UNREACHABLE_TERRAIN', 'UNREACHABLE_APPROACH', 'HERO_UNAVAILABLE']);
  });
});

test('the authored physics turn her in about two seconds and cross the course in about a minute', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const physics = loadContract(CONTRACT).tileParams.deepwater.claimBoat.physics;
    assert.equal(physics.fastWaterMultiplier, 1.5, 'the owner ratified the fast-water bonus at x1.5');

    // THE TURN. Boarded, the boat lies on the start line at rest with heading 0 (east); steered at a
    // point due north she swings towards +Z. The RATE is what the ruling is about, so the rate is
    // what is measured — the per-step sweep over the first ten steps, every one of them a full
    // helm-over (a quarter turn needs fifteen). The full turn is that rate's own arithmetic, which
    // is why it can be quoted as a time rather than guessed at.
    const turning = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    boardByWalkingAboard(turning);
    assert.equal(motionOf(turning).heading, 0, 'the boat lies pointing down the course');
    turning.submitOrders([{ verb: 'MOVE_HERO', pos: { x: -49, z: 44 } }]);
    const sweeps = [];
    let previousHeading = motionOf(turning).heading;
    for (let i = 0; i < 10 && !turning.isTerminal; i += 1) {
      turning.advanceOneTick();
      const heading = motionOf(turning).heading;
      sweeps.push(Math.abs(heading - previousHeading));
      previousHeading = heading;
    }
    const turnRate = Math.max(...sweeps) / STEP;
    const fullTurnSeconds = (2 * Math.PI) / turnRate;
    const halfTurnSeconds = fullTurnSeconds / 2;

    // THE CROSSING. West clamp to east clamp along z = 6, outside the fast-water band, from rest:
    // the 98 m between the start-line and finish-line anchors, ramp included.
    const crossing = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    boardByWalkingAboard(crossing);
    crossing.submitOrders([{ verb: 'MOVE_HERO', pos: { x: 49, z: 6 } }]);
    let startedAt = null;
    let crossingTicks = 0;
    let topSpeed = 0;
    for (let i = 0; i < 6_000 && !crossing.isTerminal; i += 1) {
      crossing.advanceOneTick();
      const m = motionOf(crossing);
      topSpeed = Math.max(topSpeed, m.speed);
      if (startedAt === null && m.x >= -49) startedAt = i;
      if (startedAt !== null) crossingTicks = i - startedAt;
      if (m.x >= 49) break;
    }
    const crossingSeconds = crossingTicks * STEP;
    const atTopSpeedSeconds = 98 / topSpeed;

    // THE FAST WATER. The same helm inside the band must run half again as fast.
    const fast = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    boardByWalkingAboard(fast);
    fast.submitOrders([{ verb: 'MOVE_HERO', pos: { x: -49, z: 44 } }]);
    let fastSpeed = 0;
    for (let i = 0; i < 4_000 && !fast.isTerminal; i += 1) {
      fast.advanceOneTick();
      const m = motionOf(fast);
      if (m.z >= 36) fastSpeed = Math.max(fastSpeed, m.speed);
      if (m.z >= 43) break;
    }

    const measured = {
      turnRateRadPerSecMeasured: Number(turnRate.toFixed(4)),
      fullTurnSeconds: Number(fullTurnSeconds.toFixed(3)),
      halfTurnSeconds: Number(halfTurnSeconds.toFixed(3)),
      crossingSeconds: Number(crossingSeconds.toFixed(3)),
      crossingAtTopSpeedSeconds: Number(atTopSpeedSeconds.toFixed(3)),
      topSpeed: Number(topSpeed.toFixed(4)),
      fastWaterSpeed: Number(fastSpeed.toFixed(4)),
      physics,
    };
    console.log(`[regatta-boat] ${JSON.stringify(measured)}`);
    mkdirSync(ARTIFACT_DIR, { recursive: true });
    writeFileSync(`${ARTIFACT_DIR}measured-physics.json`, `${JSON.stringify(measured, null, 2)}\n`);

    // "about 2 s" and "about 60 s" are the owner's words; +/- 15 % is what "about" is allowed to mean
    // before the feel has drifted from the ruling.
    assert.ok(fullTurnSeconds >= 1.7 && fullTurnSeconds <= 2.3, `a full turn took ${fullTurnSeconds.toFixed(2)} s`);
    assert.ok(atTopSpeedSeconds >= 51 && atTopSpeedSeconds <= 69, `the 98 m crossing at top speed is ${atTopSpeedSeconds.toFixed(2)} s`);
    assert.ok(Math.abs(fastSpeed / topSpeed - 1.5) < 0.01, `fast water ran at x${(fastSpeed / topSpeed).toFixed(3)}`);
  });
});

test('the same tape reaches the same boat track and the same hash on this engine', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { stableHash } = await vite.ssrLoadModule('/src/mp/LockstepClient.ts');

    const ride = () => {
      const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
      const moored = boardByWalkingAboard(sim);
      assert.equal(moored.aboard, 'hero');
      const track = sailTape(sim, (steer) => {
        sim.submitOrders(steer ? [{ verb: 'MOVE_HERO', pos: steer }] : []);
      });
      assert.equal(sim.isTerminal, false, 'the tape must finish inside the run');
      return track;
    };

    const track = ride();
    assert.deepEqual(ride(), track, 'two identical rides must produce the identical track');
    const hash = stableHash(track);

    if (MINT) {
      mkdirSync(ARTIFACT_DIR, { recursive: true });
      writeFileSync(TAPE_PATH, `${JSON.stringify({
        note: 'E5 Regatta slice 1 — the tape both engines replay. Minted by scripts/regatta-boat-steer.test.mjs with GR_BOAT_TAPE_MINT=1.',
        contract: CONTRACT,
        seed: SEED,
        stepSeconds: STEP,
        tape: BOAT_TAPE,
        headless: { hash, track },
      }, null, 2)}\n`);
    }

    const pinned = JSON.parse(readFileSync(TAPE_PATH, 'utf8'));
    assert.deepEqual(pinned.tape, JSON.parse(JSON.stringify(BOAT_TAPE)), 'the pinned tape must be the tape this guard rides');
    assert.equal(hash, pinned.headless.hash, 'the headless ride must reach the pinned tape hash');
    assert.deepEqual(track, pinned.headless.track, 'the headless ride must reach the pinned track');
    // The claim the browser half completes: `e2e/e5-regatta-boat.spec.ts` replays this same tape
    // through `__GR_TEST__.advanceSim` and asserts this same hash.
    console.log(`[regatta-boat] tape hash ${hash} over ${track.length} samples`);
  });
});

test('a ride that never boards is the idle ride it always was', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const idle = () => {
      const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
      const hashes = [];
      for (let step = 0; step < 900 && !sim.isTerminal; step += 1) {
        sim.advanceOneTick();
        if (step % 300 === 0) hashes.push(sim.tickHash(step));
      }
      return { hashes, aboard: motionOf(sim).aboard, motion: motionOf(sim) };
    };
    const first = idle();
    assert.deepEqual(idle(), first, 'two idle rides must be identical');
    assert.equal(first.aboard, null, 'an idle ride boards nothing');
    assert.equal(first.motion.x, -49, 'an idle ride leaves the boat on its anchor');
    assert.equal(first.motion.z, 0, 'an idle ride leaves the boat on its anchor');
    assert.equal(first.motion.speed, 0, 'an idle ride leaves the boat moored');
  });
});
