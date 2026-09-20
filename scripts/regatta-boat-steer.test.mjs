// THE REGATTA BOAT-STEER GUARD — slices 1 AND 2 of `specs/agent-play/e5-regatta-steerable-boat.md`
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
//      boat could be steered. Re-stated here as a cheap two-run determinism check on an idle ride.
//      (Slice 2 moved the two Regatta NULL FLOORS on purpose — see the three claims below.)
//
// SLICE 2 added three more, all of them about WHO IS RACING (law 3, "the race counts the boat"):
//
//   6. THE COURSE STOPS BEING WINNABLE BY THE BOAT. A rider sails the five authored marks by
//      `MOVE_HERO` and the race FINISHES, with the closest approach to every mark measured and
//      written to `artifacts/e5-regatta-boat-02/measured-course.json` — the evidence the authored
//      gate radius of 3 is wide enough to round a hull around.
//   7. THE FORFEIT GOES SOFT (Q2, ratified 2026-09-19). Once the start beacon is passed, stepping
//      ashore forfeits the run's race: `forfeited` with its tick, no next mark, and re-boarding
//      does NOT resume it. The secure rule needs no clause of its own — a forfeited race never
//      finishes, and an unfinished race was already a non-secure run.
//   8. THE DISHONEST PATH COMES BACK (F-RB1-1). A body SWIMMING from mark to mark used to pass the
//      gates, and the boat's MOORING used to pass the start beacon on every idle run because the
//      mark stands on it. Both are asserted dead here.
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
/** Slice 2's own evidence directory; slice 1's stays exactly where it is. */
const RACE_ARTIFACT_DIR = fileURLToPath(new URL('../artifacts/e5-regatta-boat-02/', import.meta.url));
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
const raceOf = (sim) => sim.deepwater.diagnostics.race;
const orderOf = (sim) => sim.standingOrdersSnapshot().orders.at(-1);
/** The browser reaches these two positions through `__GR_TEST__.teleport`; this is the same act. */
const placeHero = (sim, { x, z }) => sim.hero.group.position.set(x, sim.hero.group.position.y, z);

/**
 * SLICE 2 — how a rider aims at a mark. A buoy is a SOLID (`landmark-collision-contract.json`
 * mounts a rig or a buoy-line anchor on every one of the five), so `MOVE_HERO` to the mark itself
 * is refused `UNREACHABLE_APPROACH` — measured, not assumed. The public rider grammar therefore
 * steers to open water INSIDE the gate radius, two metres off the mark, which is the same rule
 * `scripts/deepwater-rider-parity.test.mjs` wrote down when the course was walked on foot.
 */
const GATE_APPROACH = 2;

/**
 * The honest race: order the next mark, sail, order the next. Returns what the course did and how
 * close the HULL'S CENTRE came to each mark — the number the "is radius 3 wide enough" question in
 * the master is decided on.
 */
function sailTheCourse(sim, maxTicks = 12_000) {
  const closest = new Map();
  let ordered = null;
  let ticks = 0;
  while (!sim.isTerminal && ticks < maxTicks) {
    const next = raceOf(sim).nextGate;
    if (!next) break;
    if (ordered !== next.id) {
      assert.equal(sim.submitOrders([{ verb: 'MOVE_HERO', pos: { x: next.x, z: next.z + GATE_APPROACH } }]).outcome.ok, true);
      ordered = next.id;
    }
    sim.advanceOneTick();
    ticks += 1;
    const m = motionOf(sim);
    const gap = Math.hypot(m.x - next.x, m.z - next.z);
    closest.set(next.id, Math.min(closest.get(next.id) ?? Number.POSITIVE_INFINITY, gap));
  }
  return { ticks, seconds: ticks * STEP, closest: Object.fromEntries([...closest].map(([id, d]) => [id, Number(d.toFixed(3))])) };
}

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

    // SLICE 3 PUBLISHED THEM. Slice 1 kept these two OUT of `HERO_ORDER_REFUSALS` on purpose, so
    // that publishing them would be ONE censused act — the view bump, the skill.md fence, the
    // manifest rows and the E5 census pin all moving in the same commit. This assertion is that
    // act's own pin, re-pointed 2026-09-20 with the cause "e5-regatta-boat-03: the boat's refusals
    // published": APPENDED to the four that were always there, so every index in the published
    // list keeps its meaning, and the boat's own pair stays separately declared because only
    // `DeepwaterClaimTile.boatOrderRefusal` can raise it.
    const { BOAT_ORDER_REFUSALS, HERO_ORDER_REFUSALS } = await vite.ssrLoadModule('/src/agent/StandingOrders.ts');
    assert.deepEqual([...BOAT_ORDER_REFUSALS], ['NOT_ABOARD', 'UNREACHABLE_WATER']);
    assert.deepEqual([...HERO_ORDER_REFUSALS], [
      'HERO_NOT_YOURS', 'UNREACHABLE_TERRAIN', 'UNREACHABLE_APPROACH', 'HERO_UNAVAILABLE',
      'NOT_ABOARD', 'UNREACHABLE_WATER',
    ]);
    // The published list must CONTAIN the boat's pair rather than merely resemble it: a later hand
    // edit that retypes the six literals here and drops the spread in the source would pass the
    // line above and quietly un-publish the pair on a map that raises it.
    for (const refusal of BOAT_ORDER_REFUSALS) assert.ok(HERO_ORDER_REFUSALS.includes(refusal), `${refusal} left the published vocabulary`);

    // ADR-005's own clause, at the source, because a steerable boat is exactly the kind of thing a
    // rider could quietly take the human's helm with: the browser's singleton door still binds
    // `riderPiloted: false`, so a rider's MOVE_HERO is refused there and never applied over the
    // keys. `e2e/e5-regatta-boat.spec.ts` drives the rider's half through the `?debug` test seam
    // BECAUSE of this line, so the line is asserted rather than assumed.
    const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8');
    const bind = game.slice(game.indexOf('bindStandingOrderHero({'));
    assert.ok(bind.startsWith('bindStandingOrderHero({'), 'Game.ts must bind a hero channel');
    assert.match(bind.slice(0, 400), /riderPiloted: \(\) => false,/,
      "the browser singleton must bind riderPiloted false: its hero is the human's");
    // And the seam that stands in for the rider there is debug-only and adds no verb.
    assert.match(game, /steerTo: \(x: number, z: number\) => \{ this\.testBoatSteer = \{ x, z \}; \},/);
    assert.ok(game.indexOf('steerTo: (x: number, z: number)') > game.indexOf("new URLSearchParams(window.location.search).has('debug')"),
      'the boat test seam must live inside the ?debug harness');
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

test('SLICE 2 — a rider sails the five buoys and the race is won by the BOAT', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const course = loadContract(CONTRACT).tileParams.raceCourse;

    const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    assert.deepEqual(raceOf(sim).gatesPassed, [], 'a boat nobody has boarded has started nothing');

    // Boarding alone passes the START BEACON, because the mark stands on the boat's own mooring.
    // That is the moment the race becomes this run's to lose (the forfeit clause below).
    boardByWalkingAboard(sim);
    assert.equal(boatOf(sim).aboard, 'hero');
    assert.deepEqual(raceOf(sim).gatesPassed.map(({ id }) => id), ['start-beacon']);

    const raced = sailTheCourse(sim);
    const race = raceOf(sim);
    assert.equal(race.finished, true, `the course ended ${JSON.stringify(race)}`);
    assert.equal(race.forfeited, false, 'a race sailed all the way is not a forfeit');
    assert.deepEqual(
      race.gatesPassed.map(({ id }) => id),
      course.beacons.map(({ id }) => id),
      'all five authored marks, in their authored order',
    );
    assert.equal(race.nextGate, null, 'a finished course has no next mark');
    assert.equal(motionOf(sim).aboard, 'hero', 'the finish requires the boat WITH the hero aboard');

    // THE COURSE AS RACED, for the report: the five marks, then back to the `heroStart` stake the
    // system takes as its finish line. The closest approach to each mark is what decides whether
    // the authored radius of 3 is wide enough for a hull to round a buoy at all.
    const measured = {
      finishedAtSeconds: Number(race.finishedAt.toFixed(3)),
      sailedSeconds: Number(raced.seconds.toFixed(3)),
      closestApproach: raced.closest,
      gateRadii: Object.fromEntries(course.beacons.map(({ id, radius }) => [id, radius])),
      fastWaterMultiplier: race.fastWaterMultiplier,
    };
    console.log(`[regatta-race] ${JSON.stringify(measured)}`);
    mkdirSync(RACE_ARTIFACT_DIR, { recursive: true });
    writeFileSync(`${RACE_ARTIFACT_DIR}measured-course.json`, `${JSON.stringify(measured, null, 2)}\n`);

    // F-RB1-2 CLOSED: one authored fast-water number, and it is the hull's own.
    const physics = loadContract(CONTRACT).tileParams.deepwater.claimBoat.physics;
    assert.equal(race.fastWaterMultiplier, physics.fastWaterMultiplier,
      'the race and the hull must read the same fast-water number');

    // Every mark was rounded inside its authored radius — with the margin printed above, so a
    // later reader can see how much room the hull actually had.
    for (const beacon of course.beacons.slice(1)) {
      assert.ok(raced.closest[beacon.id] <= beacon.radius,
        `${beacon.id} was rounded at ${raced.closest[beacon.id]} against a radius of ${beacon.radius}`);
    }
  });
});

test('SLICE 2 — leaving the boat after the start beacon forfeits the race for the run', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    boardByWalkingAboard(sim);
    assert.deepEqual(raceOf(sim).gatesPassed.map(({ id }) => id), ['start-beacon'], 'the race has started');

    // One plank off the port rail: the rim beyond the hull's clamp is ground a body can stand on
    // that the hull cannot float in — slice 1's step ashore, unchanged.
    const afloat = motionOf(sim);
    const ashore = { x: afloat.x - 4.4 - 1, z: afloat.z };
    assert.equal(sim.submitOrders([{ verb: 'MOVE_HERO', pos: ashore }]).outcome.ok, true);
    for (let i = 0; i < 300 && !sim.isTerminal; i += 1) {
      sim.advanceOneTick();
      if (raceOf(sim).forfeited) break;
    }
    const forfeited = raceOf(sim);
    assert.equal(motionOf(sim).aboard, null, 'the hero stepped ashore');
    assert.equal(forfeited.forfeited, true, `the race did not forfeit: ${JSON.stringify(forfeited)}`);
    assert.ok(Number.isFinite(forfeited.forfeitedAt), 'the forfeit must name its tick');
    assert.equal(forfeited.nextGate, null, 'a forfeited course has no next mark');

    // AND IT CANNOT BE RESUMED. Back aboard, sail the whole course again: the gates stay where the
    // forfeit left them and the race never finishes. One body races, and this run left it.
    placeHero(sim, { x: ashore.x, z: ashore.z });
    boardByWalkingAboard(sim);
    const resumed = raceOf(sim);
    assert.equal(resumed.forfeited, true, 're-boarding must not un-forfeit the race');
    assert.equal(resumed.finished, false);
    assert.deepEqual(resumed.gatesPassed.map(({ id }) => id), forfeited.gatesPassed.map(({ id }) => id),
      'a forfeited course passes no further gate');
    // The secure rule is the one that was already there: an unfinished race is a non-secure run.
    assert.equal(resumed.finished, false, 'a forfeited run cannot secure, because it never finishes');
  });
});

test('SLICE 2 — a hero who never boards never advances the course', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const beacons = loadContract(CONTRACT).tileParams.raceCourse.beacons;

    // THE DISHONEST PATH THIS SLICE CLOSES (F-RB1-1). Before it, a body swimming from mark to mark
    // passed the gates — this is that exact ride, and now it scores nothing at all.
    const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    for (const beacon of beacons.slice(1)) {
      assert.equal(sim.submitOrders([{ verb: 'MOVE_HERO', pos: { x: beacon.x, z: beacon.z + GATE_APPROACH } }]).outcome.ok, true);
      for (let i = 0; i < 2_000 && !sim.isTerminal; i += 1) {
        sim.advanceOneTick();
        const status = orderOf(sim)?.status;
        if (status === 'done' || status === 'failed') break;
      }
      const hero = sim.hero.group.position;
      assert.ok(Math.hypot(hero.x - beacon.x, hero.z - beacon.z) <= beacon.radius,
        `the swimmer must actually reach ${beacon.id} (${hero.x.toFixed(2)}, ${hero.z.toFixed(2)})`);
      assert.equal(boatOf(sim).aboard, null, 'the swimmer never boards');
    }
    const race = raceOf(sim);
    assert.deepEqual(race.gatesPassed, [], `a swimming hero passed ${JSON.stringify(race.gatesPassed)}`);
    assert.equal(race.finished, false, 'a swimming hero cannot win the Regatta');
    assert.equal(race.forfeited, false, 'a hero who never started cannot forfeit — a non-starter is not a forfeit');
    assert.equal(motionOf(sim).x, -49, 'the mooring stayed on its anchor while the body swam');
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

/**
 * SLICE 2, F-RB2-2 — WHY THE AUTHORED GATE RADIUS MOVED FROM 3 TO 6, measured rather than argued.
 *
 * Slice 1's ratified rule: a move intent towards standable ground within a plank of the rail is a
 * step ashore, and `ClaimBoat.gangplankPoint` measures that plank from the HULL CENTRE out through
 * whichever rail the intent leaves by. Over the bow of a 28.5 m hull that is 16.25 m (14.25 + the
 * 2 m plank); over the beam it is 6.4 m. On a course that is all open water, "shore" is the water
 * beyond the hull's own clamp (+/-49.75), so a racer HOLDING A KEY AT A MARK NEAR THE RIM steps
 * off the bow into the sea — and after slice 2 that is a forfeit rather than a swim.
 *
 * At the authored radius of 3 that made the north marks unroundable on a straight approach: the
 * band starts at z = 33.5 and the mark scores at z = 35. At 6 the mark scores at z = 32, two
 * metres of sea BEFORE the band. That is the whole reason for the data change, and it is asserted
 * here so nobody can quietly put it back.
 */
test('SLICE 2 — the marks score before the bow-probe reaches the rim (the radius-6 reason)', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const beacons = loadContract(CONTRACT).tileParams.raceCourse.beacons;
    const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    const boat = boatOf(sim);

    // THE TWO PROBES, off the boat's own geometry.
    boardByWalkingAboard(sim);
    const overTheBow = boat.gangplankPoint({ x: 0, y: 1 });
    const overTheBeam = boat.gangplankPoint({ x: 1, y: 1 });
    assert.equal(Number((overTheBow.z - motionOf(sim).z).toFixed(2)), 16.25, 'the bow probe is the hull half-length plus a plank');
    assert.equal(Number((overTheBeam.z - motionOf(sim).z).toFixed(2)), 5.81, 'the beam probe is barely a third of it');

    // THE BAND. North of this line a pure-north key intent lands the body outside the hull's water.
    const band = boat.water.maxZ - (overTheBow.z - motionOf(sim).z);
    assert.equal(Number(band.toFixed(2)), 33.50);

    // THE MARKS. Every authored mark must score before its own nearest band, or a racer who points
    // the bow at it goes overboard instead of rounding it.
    const north = beacons.filter(({ z }) => z > 0);
    assert.ok(north.length >= 2, 'the course has marks up by the north rim');
    for (const mark of north) {
      assert.ok(mark.z - mark.radius < band,
        `${mark.id} scores at z ${mark.z - mark.radius} but the bow is over the rim from z ${band}`);
    }
    // The finish beacon is the tight one, and it is tight because it stands 0.75 m off the hull's
    // own east clamp — a residual of F-RB2-2 that no radius fully cures. Stated, not hidden.
    const finish = beacons.find(({ id }) => id === 'finish-beacon');
    const eastBand = boat.water.maxX - (boat.gangplankPoint({ x: 1, y: 0 }).x - motionOf(sim).x);
    assert.equal(Number(eastBand.toFixed(2)), 43.35);
    assert.ok(finish.x - finish.radius <= eastBand,
      `the finish beacon scores at x ${finish.x - finish.radius} but the bow is over the rim from x ${eastBand}`);
  });
});
