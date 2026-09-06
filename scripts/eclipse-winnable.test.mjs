// THE ECLIPSE-IS-WON-BY-PLAY GUARD (owner rulings 2026-09-06, verbatim: "lets adjust the policy so
// the hard levels can be won" and "yes! please! rider has to be able to move, I did not know that
// was not possible before").
//
// THE FINDING THIS PINS. `reviews/e8-air-wall-all-maps.md` (F-EAWA-1) recorded that the Eclipse had
// never been secured by any rider and named its fort caps as the cause. Re-measured on this tree
// (`artifacts/eclipse-winnable/MEASUREMENT.md`), the map secures on BOTH bench seeds with no change
// to the map at all: seed -02 secures under the air-wall prover's own unmodified policy, and seed
// -01 secures the moment the rider spends ONE `MOVE_HERO` walking the hero from where the run drops
// it, at (0, 12), into the middle of the fort it is allowed to build, at (0, 4). Six authored
// levers were measured and every one of them secured too — so the map was 11.3 s short of a 600 s
// gate, not broken — and NONE of them shipped, because tuning a map a rider can already win is
// exactly the thing the slice was told not to do.
//
// So the thing worth guarding is not a new number. It is that the Eclipse stays UNTUNED and keeps
// the one published verb the win rests on. Five things can rot, and each has a test:
//
//   1. THE MAP GETS TUNED. A later hand reaches for the easy fix — a claim grit, a bigger purse, a
//      softer roster, a wider fort — and the map quietly stops being hard. Every one of those was
//      measured here and rejected; the row must stay clean.
//   2. THE GLOBALS MOVE INSTEAD. The same fix applied one level up is worse, because it moves every
//      other map with it. The four `Balance` numbers the measured arms would have raised are
//      asserted at the values the measurement was taken at.
//   3. THE AIR WALL SOFTENS. The Eclipse's winnability must never be bought by weakening the air
//      ruling it shipped with two commits ago; `{4, 4}` is the owner's number.
//   4. THE VERB STOPS BEING PUBLISHED. A rider can only stand its hero in its fort if the manifest
//      tells it `MOVE_HERO` exists and that a headless rider pilots the hero. Unpublished, the map
//      is unwinnable-by-ignorance for every rider that reads the door rather than the source.
//   5. THE VERB STOPS WORKING HERE. Published is not the same as live: this drives a real
//      `HeadlessContractSim` on `e8-eclipse` and asserts the hero actually crosses the ground to the
//      post — and that a hero told nothing does not move at all, which is the `IDLE_INTENTS`
//      identity the null floors depend on.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTRACT = 'e8-eclipse';
const SEED = 'e8-eclipse-01';
/** The measured post: the centroid of the ten works `dome-cluster-pad-center` can hold. */
const HERO_POST = { x: 0, z: 4 };
/** 30 s of sim at the fixed 1/30 step, for a walk the measurement takes about two seconds over. */
const STEP_BUDGET = 900;

const readJson = (relative) => JSON.parse(readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8'));

async function withVite(run) {
  const location = new URL(`http://eclipse-winnable.test/?debug&contract=${CONTRACT}&seed=${SEED}`);
  const previousLocation = globalThis.location;
  const previousWindow = globalThis.window;
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    return await run(vite);
  } finally {
    await vite.close();
    globalThis.location = previousLocation;
    globalThis.window = previousWindow;
  }
}

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

test('the Eclipse row authors no balance lever, and its idle floors still lose', async () => {
  await withVite(async (vite) => {
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const contract = loadContract(CONTRACT);
    const twist = contract.twist;

    // Each of these was BUILT AND MEASURED on this map and each of them secured; each is listed
    // here with the ride it bought, so a later reader can see the rejection was priced rather than
    // assumed (`artifacts/eclipse-winnable/LADDER.log`).
    assert.equal(twist.hero, undefined, 'a claim grit secured (+100: w20, 71.8 hp left) and was rejected: the map does not need it');
    assert.equal(twist.economy, undefined, 'a purse override changed nothing at all (400 and 1200 both replayed byte-identical)');
    assert.equal(twist.seamYieldMult, undefined, 'a richer seam did not secure (+40%: w19, 589.333 s) and is not the lever either way');
    assert.equal(twist.waveCadenceMult, undefined, 'the wave clock is the default one');
    assert.equal(twist.secureWave, undefined, 'the gate is the default wave 20; lowering it would be moving the goalposts, not fixing the map');
    for (const variant of twist.enemyRoster ?? []) {
      assert.deepEqual(Object.keys(variant).sort(), ['id', 'label'],
        `${variant.id} must carry no scaling: hpScale 0.8 secured with the hero untouched at 175 hp, and was rejected`);
    }
    // The seven grounds the Mare Claim's terrain authors, unchanged. An eighth around the hero (a
    // "claim apron") was measured and secured with 115 hp left, and was rejected for the same
    // reason: the rider can walk to the fort instead of the fort being moved to the rider.
    assert.deepEqual(contract.tileParams.buildZones.map((zone) => zone.id), [
      'rim-premium-pad-west', 'rim-premium-pad-east',
      'dome-cluster-pad-west', 'dome-cluster-pad-center', 'dome-cluster-pad-east',
      'launch-pad', 'mass-driver-rail-footing',
    ], 'the Eclipse builds on the Mare Claim\'s own seven grounds');

    // Idle still loses, and loses early: the map is hard, and this slice did not make it kind.
    const floors = readJson('assets/contracts/null-floors.json').floors[CONTRACT];
    for (const [seed, floor] of Object.entries(floors)) {
      assert.equal(floor.secured, false, `${seed} must still lose from idle`);
      assert.ok(floor.waves <= 3, `${seed} idle floor drifted to wave ${floor.waves}`);
    }
  });
});

test('the globals the measured arms would have raised are unmoved', async () => {
  await withVite(async (vite) => {
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    // The fort ceiling heat 12's promoted ride actually reached — four turrets, all at tier 2, six
    // beacons — and died at 585.2 s with 190 gold it could not spend, because the last rung costs
    // 300 and the purse holds 200. Raising ANY of these four to make one map winnable would move
    // all forty-two.
    assert.equal(Balance.turret.maxCount, 4, 'the turret cap is the number the Eclipse was measured against');
    assert.equal(Balance.beacon.maxCount, 6, 'the beacon cap is the number the Eclipse was measured against');
    assert.equal(Balance.hero.maxHp, 100, 'the hero ceiling is the default; the Eclipse buys none');
    assert.equal(Balance.economy.bankCap, 200, 'the purse is the default; the Eclipse buys none');
    assert.equal(Balance.tiers.turret[1].cost, 150, 'the tier-2 rung the ride can reach');
    assert.equal(Balance.tiers.turret[2].cost, 300, 'the tier-3 rung the default purse cannot hold: the measured dead end');
  });
});

test('the air wall the Eclipse ships is still the ruled one', async () => {
  await withVite(async (vite) => {
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    assert.deepEqual(loadContract(CONTRACT).twist.atmosphere, { regolithRequired: 4, regolithWindowWaves: 4 },
      'winnability must never be bought by softening the air ruling (owner 2026-09-06: "same air for all space contracts")');
  });
});

test('the Eclipse publishes the verb its win rests on', async () => {
  await withVite(async (vite) => {
    const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
    const manifest = deriveMechanicsManifest(CONTRACT);
    const rule = manifest.rules.find((entry) => entry.id === 'hero_orders');
    assert.ok(rule, 'a rider that cannot read MOVE_HERO off the door cannot win this map');
    assert.equal(rule.source, 'StandingOrders.MOVE_HERO');
    assert.equal(rule.data.verb, 'MOVE_HERO');
    assert.equal(rule.data.body, 'hero');
    assert.match(rule.data.pilots.headless, /rider pilots/, 'the headless pilot line is what tells a rider the hero is its own');
    // The wall is on the same card, so a rider plans both in one read.
    assert.ok(manifest.rules.some((entry) => entry.id === 'air_wall_regolith'), 'the air wall must stay published beside it');
  });
});

test('MOVE_HERO walks the Eclipse hero to the fort, and a hero told nothing stays put', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { HERO_ARRIVE_RADIUS, snapshotStandingOrders } = await vite.ssrLoadModule('/src/agent/StandingOrders.ts');

    const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    const start = { ...sim.currentTurn().view.now.hero };
    assert.ok(distance(start, HERO_POST) > 6, 'the run must still drop the hero away from its guns; that is the whole finding');
    assert.equal(sim.submitOrders([{ verb: 'MOVE_HERO', pos: HERO_POST }]).outcome.ok, true);

    let steps = 0;
    let record = null;
    while (steps < STEP_BUDGET && !sim.isTerminal) {
      sim.advanceOneTick();
      steps += 1;
      record = snapshotStandingOrders().orders.find(({ order }) => order.verb === 'MOVE_HERO');
      if (record?.status === 'done' || record?.status === 'failed') break;
    }
    assert.ok(record, 'the submitted order must reach the executor');
    assert.equal(record.status, 'done',
      `MOVE_HERO ended ${record.status}${record.reason ? `: ${record.reason}` : ''} — an Eclipse hero that cannot be steered is an unwinnable map again`);
    const hero = sim.currentTurn().view.now.hero;
    assert.ok(distance(hero, HERO_POST) <= HERO_ARRIVE_RADIUS + 0.05,
      `hero stopped ${distance(hero, HERO_POST).toFixed(3)} from the post`);

    // THE CONTROL, and it is load-bearing rather than decorative: with no steering the sim must
    // return the `IDLE_INTENTS` object itself, so an idle ride walks the graph it walked before the
    // verb existed and the recorded null floors stay byte-identical.
    const idle = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED });
    const idleStart = { ...idle.currentTurn().view.now.hero };
    for (let tick = 0; tick < steps && !idle.isTerminal; tick += 1) idle.advanceOneTick();
    const idleHero = idle.currentTurn().view.now.hero;
    assert.ok(distance(idleHero, idleStart) < 0.001,
      `an unsteered hero moved ${distance(idleHero, idleStart).toFixed(4)} wu on its own`);
  });
});
