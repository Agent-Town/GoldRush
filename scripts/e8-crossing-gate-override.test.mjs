// THE PER-CONTRACT CROSSING GATE GUARD (owner ruling 2026-09-06 evening, verbatim: "yes, same air
// for all space contracts - but I also never played the levels, so I dont know exactly").
//
// The sibling of `scripts/e8-regolith-gate-override.test.mjs`, for the half of the era's air wall
// that is a CROSSING rather than a ground. `twist.atmosphere.{crossingRequired, crossingWindowWaves}`
// raises the Far Side's and Low Orbit's gate — how many vacuum crossings must be made on suit air
// before the claim may secure, and how often one of them may count — without touching
// `E8AtmosphereSystem` or the Mare Claim's numbers. Six things can rot, and each has a test:
//
//   1. THE NUMBERS ARE NOT READ. The consumer must take both from the contract and the view must
//      publish both, or a rider cannot plan the ride the ruling asked for.
//   2. THE DEFAULT DRIFTS. A contract that authors nothing must keep the PRE-RULING meaning —
//      `required` is the count of authored zones, there is no window, and every zone stood in on
//      air opens the latch. That is the control, and the reason this is an override rather than a
//      second base rule.
//   3. THE WINDOW STOPS BITING. At most ONE crossing may count toward the latch per window;
//      without that the Far Side's four-credit gate is four laps of one turn, which is the exact
//      complaint the ruling was answering (heat 12 secured that map on ONE entry at t = 255.7 s).
//   4. THE RULE GETS WEAKER, NOT STRONGER. The authored latch keeps the zone conjunct: every
//      authored zone must still have been stood in ON AIR. A ride that could not secure before
//      this slice must not be able to secure after it.
//   5. THE CARD LIES. `now.air.crossing` publishes the numbers, but a human reads the briefing and
//      an agent reads the manifest. If the authored numbers and the printed ones drift apart, a
//      secure is refused for a reason nothing on the card explains.
//   6. THE DOOR LETS RUBBISH IN. A fractional gate, a zero-wave window, a window with no gate, a
//      crossing gate on a map with no suit or no crossing rectangle, or a misspelled field must be
//      refused by `describeContract`, not clamped at runtime.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BUNDLE = 'epoch-8-orbital';
/** The two maps whose gate is a crossing. The Eclipse rides the regolith latch instead. */
const CROSSING_MAPS = ['e8-far-side', 'e8-low-orbit'];
const SEED = 'e8-far-side-01';

async function withVite(run) {
  const location = new URL(`http://e8-crossing-gate.test/?debug&contract=e8-far-side&seed=${SEED}`);
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    return await run(vite);
  } finally {
    await vite.close();
  }
}

const centreOf = (zone) => ({ x: (zone.minX + zone.maxX) / 2, z: (zone.minZ + zone.maxZ) / 2 });
const zoneOf = (contract, id) => [
  ...(contract.tileParams.buildZones ?? []),
  ...(contract.tileParams.orbitalScaffoldZones ?? []),
  ...(contract.tileParams.probeRecoveryZones ?? []),
].find((zone) => zone.id === id);

test('the gate and the window come from twist.atmosphere, and the view publishes both', async () => {
  await withVite(async (vite) => {
    const { E8SuitAirSystem } = await vite.ssrLoadModule('/src/systems/E8SuitAirSystem.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');

    for (const id of CROSSING_MAPS) {
      const contract = loadContract(id);
      const authored = contract.twist.atmosphere;
      assert.equal(typeof authored?.crossingRequired, 'number', `${id} must author twist.atmosphere.crossingRequired`);
      assert.equal(typeof authored?.crossingWindowWaves, 'number', `${id} must author twist.atmosphere.crossingWindowWaves`);
      const zones = [
        ...(contract.tileParams.probeRecoveryZones ?? []),
        ...(contract.tileParams.orbitalScaffoldZones ?? []),
      ];
      assert.ok(
        authored.crossingRequired > zones.length || zones.length === 1,
        `${id}: a gate at or below the count of authored zones would be the wall it replaced`,
      );

      // THE CONSUMER. One read of the contract, and the numbers come back on the dials.
      const { crossing } = E8SuitAirSystem.create(contract).diagnostics;
      assert.equal(crossing.required, authored.crossingRequired);
      assert.equal(crossing.windowWaves, authored.crossingWindowWaves);
      assert.equal(crossing.credited, 0);
      assert.equal(crossing.window, 0);
      assert.equal(crossing.creditedThisWindow, 0);
      assert.equal(crossing.windowHeldEntries, 0);
      assert.equal(crossing.complete, false, 'an uncrossed map cannot be complete');

      // THE VIEW. A rider reads these fields and nothing else about the window.
      const sim = new HeadlessContractSim({ contractId: id, seed: `${id}-01`, admissionProbe: true });
      const air = sim.currentTurn().view.now.air;
      assert.equal(air.crossing.required, authored.crossingRequired, 'the view must publish the authored gate');
      assert.equal(air.crossing.windowWaves, authored.crossingWindowWaves, 'the view must publish the authored window');
      assert.equal(air.crossing.credited, 0);
      assert.equal(air.crossing.window, 0);
      assert.equal(air.crossing.creditedThisWindow, 0);
      assert.equal(air.crossing.windowHeldEntries, 0);
      // ONE AIR SHAPE ACROSS THE ERA: the regolith row's four window fields are present here too,
      // as nulls and zeros, exactly as they are on the Mare Claim.
      assert.equal(air.regolith.windowWaves, null, 'a crossing map authors no regolith window');
      assert.equal(air.regolith.creditedThisWindow, 0);
    }
  });
});

test('a contract that authors no crossing gate keeps the pre-ruling wall and gets no window', async () => {
  await withVite(async (vite) => {
    const { E8SuitAirSystem } = await vite.ssrLoadModule('/src/systems/E8SuitAirSystem.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');

    for (const id of CROSSING_MAPS) {
      // THE CONTROL, built from the map's own manifest with the twist removed: same rectangles,
      // same suit, no authored numbers.
      const contract = loadContract(id);
      const bare = { ...contract, twist: { ...contract.twist, atmosphere: undefined } };
      const air = E8SuitAirSystem.create(bare);
      assert.equal(air.isDeclared, true, `${id}: removing the gate must not disarm the air wall`);
      const zones = air.diagnostics.crossing.zones;
      assert.equal(air.diagnostics.crossing.required, zones.length, `${id} must default to its authored zones`);
      assert.equal(air.diagnostics.crossing.windowWaves, null, 'no authored window means no window at all');
      assert.equal(air.objectiveAllowsSecure, false);
      // With no window, every zone stood in on air counts whenever it is stood in — the
      // pre-ruling behaviour, intact.
      for (const zone of zones) {
        air.update(1, centreOf(zoneOf(contract, zone)), [], 1);
        air.update(1, { x: 0, z: 0.5 }, [], 1);
      }
      assert.deepEqual(air.diagnostics.crossing.reached, zones);
      assert.equal(air.diagnostics.crossing.windowHeldEntries, 0);
      assert.equal(air.objectiveAllowsSecure, true, `${id}: the old wall opens on the old terms`);
    }
  });
});

test('the window credits at most one crossing per window, and holds the rest without paying them', async () => {
  await withVite(async (vite) => {
    const { E8SuitAirSystem } = await vite.ssrLoadModule('/src/systems/E8SuitAirSystem.ts');
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');

    // The Far Side is the sharp case: it authors ONE crossing rectangle, so a four-credit gate is
    // reachable only because a RE-ENTRY in a later window credits again.
    const contract = loadContract('e8-far-side');
    const { crossingRequired, crossingWindowWaves } = contract.twist.atmosphere;
    const crater = centreOf(zoneOf(contract, 'listening-probe-crater'));
    const yard = centreOf(zoneOf(contract, 'far-side-landing-yard'));
    // The window in SECONDS, derived exactly as the consumer derives it: the authored waves times
    // this contract's own wave interval. Waiting inside the yard keeps the suit full, so nothing
    // here is refused for want of air and the window is the only thing under test.
    const windowSeconds = crossingWindowWaves * (Balance.waves.waveInterval / (contract.twist.waveCadenceMult ?? 1));
    const air = E8SuitAirSystem.create(contract);
    const trip = () => {
      air.update(1, crater, [], 1);
      air.update(1, yard, [], 1);
    };
    const waitOneWindow = () => {
      for (let second = 0; second < windowSeconds; second += 1) air.update(1, yard, [], 1);
    };

    // WINDOW 0: three trips out to the crater on full air; one counts, two are held.
    trip();
    trip();
    trip();
    let dials = air.diagnostics.crossing;
    assert.equal(dials.credited, 1, 'the first entry in a window counts');
    assert.equal(dials.windowHeldEntries, 2, 'the rest are counted, and credited to nothing');
    assert.equal(dials.creditedThisWindow, 1);
    assert.equal(dials.breathlessEntries, 0, 'a held entry is not a breathless one');
    assert.equal(air.objectiveAllowsSecure, false);

    // THE ROLL-OVER: the run clock crosses a window boundary and the credit comes back.
    waitOneWindow();
    dials = air.diagnostics.crossing;
    assert.equal(dials.window, 1, 'the window index follows the run clock');
    assert.equal(dials.creditedThisWindow, 0, 'a new window opens with its credit unspent');
    trip();
    assert.equal(air.diagnostics.crossing.credited, 2);
    assert.equal(air.objectiveAllowsSecure, false, `${crossingRequired} crossings, not two`);

    // THE LATCH: one credit per window until the authored count is met, and not one window sooner.
    for (let banked = 2; banked < crossingRequired; banked += 1) {
      waitOneWindow();
      trip();
      assert.equal(
        air.objectiveAllowsSecure,
        banked + 1 >= crossingRequired,
        `the latch opens only on the ${crossingRequired}th crossing`,
      );
    }
    const closed = air.diagnostics.crossing;
    assert.equal(closed.credited, crossingRequired);
    assert.equal(closed.complete, true);
    assert.equal(closed.window, crossingRequired - 1, 'the earliest possible finish is one window per crossing');

    // A BREATHLESS ENTRY IS STILL REFUSED FIRST, window or no window: the air is the wall.
    const starved = E8SuitAirSystem.create(contract);
    for (let second = 0; second < 61; second += 1) starved.update(1, { x: 0, z: 10 }, [], 1);
    assert.equal(starved.diagnostics.suit.empty, true);
    starved.update(1, crater, [], 1);
    assert.deepEqual(
      {
        credited: starved.diagnostics.crossing.credited,
        reached: starved.diagnostics.crossing.reached,
        breathless: starved.diagnostics.crossing.breathlessEntries,
        held: starved.diagnostics.crossing.windowHeldEntries,
      },
      { credited: 0, reached: [], breathless: 1, held: 0 },
    );
  });
});

test('the authored latch is strictly stricter: every zone still has to be stood in on air', async () => {
  await withVite(async (vite) => {
    const { E8SuitAirSystem } = await vite.ssrLoadModule('/src/systems/E8SuitAirSystem.ts');
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');

    // Low Orbit authors TWO crossing zones and asks for FOUR credits, so the two halves of the
    // latch can be told apart: bank every credit on ONE deck and the other is still owed, which
    // under the old rule (every zone, no count) was also a refusal. Neither half alone is the
    // gate; a ride that fails the old one cannot pass the new one.
    //
    // RE-POINTED 2026-09-07 (`tasks/e8-air-logical.md`, owner directive): this test used to
    // bounce between the first two of THREE decks with the third left owed. `claw-carcass-yard`
    // is no longer a crossing at all — it is the map's only pressurised ground
    // (`twist.atmosphere.pressurisedZoneIds`), and a rectangle that holds air cannot be crossed
    // breathless, which was F-EAWA-2. The shape of the proof is unchanged: bank the count on the
    // zones the ride has visited, and show the unvisited one still shuts the latch.
    const contract = loadContract('e8-low-orbit');
    const { crossingRequired, crossingWindowWaves } = contract.twist.atmosphere;
    const windowSeconds = crossingWindowWaves * (Balance.waves.waveInterval / (contract.twist.waveCadenceMult ?? 1));
    const air = E8SuitAirSystem.create(contract);
    const decks = air.diagnostics.crossing.zones;
    assert.equal(decks.length, 2, 'the carcass yard holds air and is not a crossing');
    const spine = { x: 22, z: 0 };  // between the yard and the east deck; vacuum, and no zone at all

    // The window is rolled from inside the CABIN rather than from inside the deck: since
    // 2026-09-07 a deck is vacuum, and waiting out a 120-second window in one empties a
    // sixty-second suit — which would make this a test of suffocation rather than of the latch.
    const cabin = centreOf(zoneOf(contract, 'claw-carcass-yard'));
    for (let credit = 0; credit < crossingRequired; credit += 1) {
      const deck = decks[0];  // only the first, on purpose
      air.update(1, centreOf(zoneOf(contract, deck)), [], 1);
      air.update(1, spine, [], 1);
      for (let second = 0; second < windowSeconds; second += 1) air.update(1, cabin, [], 1);
    }
    assert.equal(air.diagnostics.crossing.credited, crossingRequired, 'the count is met');
    assert.deepEqual(air.diagnostics.crossing.reached, decks.slice(0, 1), 'the second deck is still owed');
    assert.equal(air.objectiveAllowsSecure, false, 'the count alone cannot open the latch');
    assert.equal(air.diagnostics.crossing.complete, false);

    air.update(1, centreOf(zoneOf(contract, decks[1])), [], 1);
    assert.equal(air.objectiveAllowsSecure, true, 'the last zone closes it');
  });
});

test('the published gate cannot drift from the authored one', async () => {
  await withVite(async (vite) => {
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');

    const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    for (const id of CROSSING_MAPS) {
      const contract = loadContract(id);
      const { crossingRequired, crossingWindowWaves } = contract.twist.atmosphere;
      const [rule, ...extra] = deriveMechanicsManifest(contract).rules.filter((entry) => entry.id === 'air_wall_crossing');
      assert.deepEqual(extra, [], `${id}: one air rule, not several`);
      assert.equal(rule.source, 'E8SuitAirSystem.noteCrossings');
      assert.equal(rule.data.required, crossingRequired);
      assert.equal(rule.data.windowWaves, crossingWindowWaves);
      assert.equal(rule.data.windowSeconds, crossingWindowWaves * Balance.waves.waveInterval);
      assert.equal(rule.data.gatesSecure, true);
      assert.equal(rule.data.damages, false);
      // The two rows are mutually exclusive: a crossing map publishes no regolith row and the
      // Eclipse publishes no crossing row.
      assert.deepEqual(deriveMechanicsManifest(contract).rules.filter((entry) => entry.id === 'air_wall_regolith'), []);

      // The briefing is the human half of the same fact; a rider reads it on the card. Both
      // numbers are spelled in words there, so the check is that each number is STATED, not how.
      const rules = contract.briefing.rules.join(' ').toLowerCase();
      assert.ok(rules.includes(words[crossingRequired]), `${id}: the card must state the ${crossingRequired}-crossing gate`);
      assert.ok(rules.includes(`${words[crossingWindowWaves]}-wave`), `${id}: the card must state the window`);
      assert.ok(rules.includes('air'), `${id}: the card must say the crossings are made on air`);
    }

    // THE ECLIPSE IS THE OTHER HALF OF THE RULING, and it publishes the regolith row instead —
    // from its OWN consumer, so a rider can tell which engine wrote it.
    const eclipse = deriveMechanicsManifest(loadContract('e8-eclipse')).rules;
    assert.deepEqual(eclipse.filter((entry) => entry.id === 'air_wall_crossing'), [], 'the Eclipse declares no crossing');
    const [regolith] = eclipse.filter((entry) => entry.id === 'air_wall_regolith');
    assert.equal(regolith.source, 'E8SuitAirSystem.notePan');
    assert.equal(regolith.data.required, loadContract('e8-eclipse').twist.atmosphere.regolithRequired);
    assert.equal(regolith.data.windowWaves, loadContract('e8-eclipse').twist.atmosphere.regolithWindowWaves);
  });
});

test('the door refuses a crossing gate that no map could pay', async () => {
  await withVite(async (vite) => {
    const { validateContractsBundle } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const raw = JSON.parse(readFileSync(new URL(`../assets/contracts/${BUNDLE}/contracts.json`, import.meta.url), 'utf8'));
    const withGate = (atmosphere, mutate, contractId = 'e8-far-side') => {
      const next = JSON.parse(JSON.stringify(raw));
      const row = next.contracts.find((entry) => entry.id === contractId);
      if (atmosphere === null) delete row.twist.atmosphere;
      else row.twist.atmosphere = atmosphere;
      mutate?.(row);
      return next;
    };

    // Controls: the shipped bundle passes, so does the same bundle with no gate, and so does a
    // gate with no window (a raised count on its own is lawful).
    validateContractsBundle(raw, BUNDLE);
    validateContractsBundle(withGate(null), BUNDLE);
    validateContractsBundle(withGate({ crossingRequired: 2 }), BUNDLE);
    validateContractsBundle(withGate({ crossingRequired: 9, crossingWindowWaves: 1 }), BUNDLE);

    const refused = [
      { crossingRequired: 0 },
      { crossingRequired: -1 },
      { crossingRequired: 2.5 },
      { crossingRequired: '4' },
      { crossingWindowWaves: 4 },                              // a window with no gate of its own
      { crossingRequired: 4, crossingWindowWaves: 0 },
      { crossingRequired: 4, crossingWindowWaves: 1.5 },
      { crossingRequired: 4, crossingWindowWaves: '4' },
      { crossingRequired: 4, windowWaves: 4 },                 // a field no engine reads
      { regolithWindowWaves: 4, crossingRequired: 4 },         // a regolith window with no regolith gate
      {},                                                      // a twist that gates nothing
      4,
      [4],
    ];
    for (const bad of refused) {
      assert.throws(
        () => validateContractsBundle(withGate(bad), BUNDLE),
        (error) => /twist\.atmosphere/.test(error.message),
        `the door must refuse ${JSON.stringify(bad)} and name twist.atmosphere`,
      );
    }

    // A crossing gate on a map with no suit at all: nothing would ever read it there.
    assert.throws(
      () => validateContractsBundle(withGate({ crossingRequired: 4 }, (row) => { delete row.tileParams.atmosphere; }), BUNDLE),
      (error) => /twist\.atmosphere/.test(error.message),
      'a crossing gate without a suit must be refused',
    );
    // And a crossing gate on a map that authors no crossing rectangle: unwinnable by construction.
    assert.throws(
      () => validateContractsBundle(withGate({ crossingRequired: 4 }, (row) => { delete row.tileParams.probeRecoveryZones; }), BUNDLE),
      (error) => /twist\.atmosphere\.crossingRequired/.test(error.message),
      'a crossing gate with no crossing must be refused',
    );
    // The Mare Claim's own numbers are untouched by any of this, and its map has no crossing at
    // all — so a crossing gate there is refused for the same reason.
    assert.throws(
      () => validateContractsBundle(withGate({ crossingRequired: 4 }, undefined, 'e8-mare-claim'), BUNDLE),
      (error) => /twist\.atmosphere\.crossingRequired/.test(error.message),
      'the Mare Claim authors no crossing rectangle',
    );
  });
});

test('one law, one definition: both consumers enforce the window from the same file', () => {
  const window = readFileSync(new URL('../src/systems/E8AirWindow.ts', import.meta.url), 'utf8');
  const suitAir = readFileSync(new URL('../src/systems/E8SuitAirSystem.ts', import.meta.url), 'utf8');
  const atmosphere = readFileSync(new URL('../src/systems/E8PhysicsSystem.ts', import.meta.url), 'utf8');
  // The rollover arithmetic exists ONCE. A second copy is how the number in the briefing and the
  // number the latch enforces drift apart.
  assert.equal([...window.matchAll(/Math\.floor\(this\.elapsedSeconds/g)].length, 1);
  for (const [name, source] of [['E8SuitAirSystem', suitAir], ['E8PhysicsSystem', atmosphere]]) {
    assert.match(source, /from '\.\/E8AirWindow'/, `${name} must take the window from the shared file`);
    assert.doesNotMatch(source, /Math\.floor\(this\.elapsedSeconds/, `${name} must not carry its own copy`);
  }
  // The authored numbers are read in ONE place per consumer, so a gate cannot drift between two
  // readers of the same contract.
  assert.equal([...suitAir.matchAll(/contract\.twist\.atmosphere/g)].length, 1, 'exactly one authored read');
});
