// THE PER-CONTRACT REGOLITH GATE GUARD (owner ruling 2026-09-06, verbatim: "no, this has to be
// more prevalent, otherwise it makes no sense").
//
// `twist.atmosphere` raises ONE contract's air gate — how many regolith grounds must be worked on
// suit air before the claim may secure, and how often one of them may count — without touching
// `REGOLITH_GROUNDS_FOR_SECURE`, so the Mare Claim's three siblings stay byte-identical. Five
// things can rot, and each has a test:
//
//   1. THE NUMBERS ARE NOT READ. The consumer must take both from the contract, and the view must
//      publish both, or a rider cannot plan the ride the ruling asked for.
//   2. THE DEFAULT DRIFTS. A contract that authors nothing must get EXACTLY
//      `REGOLITH_GROUNDS_FOR_SECURE` and NO window — the control case, and the reason this is an
//      override rather than a second base number. `E8SuitAirSystem` is that control in the wild:
//      the three siblings read the same constant and this slice never touched their file.
//   3. THE WINDOW STOPS BITING. At most ONE ground may count toward the latch per window; without
//      that, four grounds are bought in the opening sortie and the wall costs one order again,
//      which is the exact complaint the ruling was answering.
//   4. THE CARD LIES. `now.air` publishes the numbers, but a human reads the briefing. If the
//      authored numbers and the printed ones drift apart, a secure is refused for a reason nothing
//      on the card explains.
//   5. THE DOOR LETS RUBBISH IN. A fractional gate, a gate larger than the map's own grounds, a
//      zero-wave window or a misspelled field must be refused by `describeContract`, not clamped
//      at runtime.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTRACT = 'e8-mare-claim';
const SEED = 'e8-mare-claim-01';
const BUNDLE = 'epoch-8-orbital';
/** The three siblings: same epoch, same air, their own consumer, no gate of their own. */
const SIBLINGS = ['e8-far-side', 'e8-low-orbit', 'e8-eclipse'];

async function withVite(run) {
  const location = new URL(`http://e8-regolith-gate.test/?debug&contract=${CONTRACT}&seed=${SEED}`);
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

test('the gate and the window come from twist.atmosphere, and the view publishes both', async () => {
  await withVite(async (vite) => {
    const { E8AtmosphereSystem, REGOLITH_GROUNDS_FOR_SECURE } = await vite.ssrLoadModule('/src/systems/E8PhysicsSystem.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');

    const contract = loadContract(CONTRACT);
    const authored = contract.twist.atmosphere;
    assert.equal(typeof authored?.regolithRequired, 'number', `${CONTRACT} must author twist.atmosphere.regolithRequired`);
    assert.equal(typeof authored?.regolithWindowWaves, 'number', `${CONTRACT} must author twist.atmosphere.regolithWindowWaves`);
    assert.ok(authored.regolithRequired > REGOLITH_GROUNDS_FOR_SECURE, 'a gate at or below the default would be a no-op');
    assert.ok(
      authored.regolithRequired <= contract.tileParams.harvestAnchors.length,
      'a gate above the authored grounds would be unwinnable by construction',
    );

    // THE CONSUMER. One read of the contract, and the numbers come back on the dials.
    const { regolith } = E8AtmosphereSystem.create(contract).diagnostics;
    assert.equal(regolith.required, authored.regolithRequired);
    assert.equal(regolith.windowWaves, authored.regolithWindowWaves);
    assert.equal(regolith.grounds, contract.tileParams.harvestAnchors.length);
    assert.equal(regolith.window, 0);
    assert.equal(regolith.creditedThisWindow, 0);
    assert.equal(regolith.windowHeldPans, 0);

    // THE VIEW. A rider reads these four fields and nothing else about the window.
    const sim = new HeadlessContractSim({ contractId: CONTRACT, seed: SEED, admissionProbe: true });
    const air = sim.currentTurn().view.now.air;
    assert.equal(air.regolith.required, authored.regolithRequired, 'the view must publish the authored gate');
    assert.equal(air.regolith.windowWaves, authored.regolithWindowWaves, 'the view must publish the authored window');
    assert.equal(air.regolith.window, 0);
    assert.equal(air.regolith.creditedThisWindow, 0);
    assert.equal(air.regolith.windowHeldPans, 0);
    assert.equal(air.regolith.complete, false, 'an unworked claim cannot be complete');
  });
});

test('a contract that authors no atmosphere twist keeps the default gate and gets no window', async () => {
  await withVite(async (vite) => {
    const { E8AtmosphereSystem, E8SuitAirSystem, REGOLITH_GROUNDS_FOR_SECURE } = {
      ...(await vite.ssrLoadModule('/src/systems/E8PhysicsSystem.ts')),
      ...(await vite.ssrLoadModule('/src/systems/E8SuitAirSystem.ts')),
    };
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');

    // THE CONTROL, built from the Mare Claim's own manifest with the twist removed: same map, same
    // domes, same six grounds, no authored numbers.
    const contract = loadContract(CONTRACT);
    const bare = { ...contract, twist: { ...contract.twist, atmosphere: undefined } };
    const plain = E8AtmosphereSystem.create(bare);
    assert.equal(plain.isDeclared, true, 'removing the gate must not disarm the air wall');
    assert.equal(plain.diagnostics.regolith.required, REGOLITH_GROUNDS_FOR_SECURE);
    assert.equal(plain.diagnostics.regolith.windowWaves, null, 'no authored window means no window at all');
    assert.equal(plain.objectiveAllowsSecure, false);
    // With no window, grounds count whenever they are worked — the pre-ruling behaviour, intact.
    assert.equal(plain.notePan(0), true);
    assert.equal(plain.notePan(1), true);
    assert.deepEqual(plain.diagnostics.regolith.worked, [0, 1]);
    assert.equal(plain.diagnostics.regolith.windowHeldPans, 0);
    assert.equal(plain.objectiveAllowsSecure, true);

    // THE CONTROL IN THE WILD, RE-POINTED 2026-09-06 (`tasks/e8-air-wall-all-maps.md`, owner
    // ruling: "yes, same air for all space contracts"). The three siblings now author their own
    // gates, so the control is each sibling's OWN manifest with `twist.atmosphere` stripped — the
    // same move the Mare Claim control above makes, on the consumer that runs those maps. The line
    // this replaces asserted `sibling.twist.atmosphere === undefined`, which was true only while
    // the ruling had reached one map of four.
    for (const id of SIBLINGS) {
      const sibling = loadContract(id);
      assert.equal(E8AtmosphereSystem.create(sibling).isDeclared, false, `${id} must not arm the Mare Claim consumer`);
      const bareSibling = { ...sibling, twist: { ...sibling.twist, atmosphere: undefined } };
      const own = E8SuitAirSystem.create(bareSibling);
      assert.equal(own.isDeclared, true, `${id} must arm its own consumer with no gate authored`);
      const { regolith, crossing } = own.diagnostics;
      // A crossing map (the Far Side, Low Orbit) gates on its authored zones instead of grounds, so
      // its regolith gate is zero by construction; the Eclipse keeps the shared default. Either way
      // the number here is the CONSUMER's, never an authored override, and never above the default.
      assert.equal(
        regolith.required,
        crossing ? 0 : Math.min(REGOLITH_GROUNDS_FOR_SECURE, regolith.grounds),
        `${id} must keep the default gate when it authors none`,
      );
      assert.ok(regolith.required <= REGOLITH_GROUNDS_FOR_SECURE, `${id} must never carry a raised gate by default`);
      assert.equal(regolith.windowWaves, null, `${id} must publish no window when it authors none`);
      if (crossing) {
        // The pre-ruling crossing meaning, kept verbatim: the count of authored zones, no window.
        assert.equal(crossing.required, crossing.zones.length, `${id} must default to its authored zones`);
        assert.equal(crossing.windowWaves, null);
      }
    }
  });
});

test('the window credits at most one ground per window, and holds the rest without paying them', async () => {
  await withVite(async (vite) => {
    const { E8AtmosphereSystem } = await vite.ssrLoadModule('/src/systems/E8PhysicsSystem.ts');
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');

    const contract = loadContract(CONTRACT);
    const { regolithRequired, regolithWindowWaves } = contract.twist.atmosphere;
    const inside = centreOf(contract.tileParams.buildZones.find((zone) => zone.id === 'dome-cluster-pad-center'));
    // The window in SECONDS, derived exactly as the consumer derives it: the authored waves times
    // this contract's own wave interval. Standing inside a dome keeps the suit full, so nothing
    // here is refused for want of air and the window is the only thing under test.
    const windowSeconds = regolithWindowWaves * (Balance.waves.waveInterval / (contract.twist.waveCadenceMult ?? 1));
    const air = E8AtmosphereSystem.create(contract);
    const rollForward = () => { for (let second = 0; second < windowSeconds; second += 1) air.update(1, inside, []); };

    // WINDOW 0: three fresh grounds panned on full air; one counts, two are held.
    assert.equal(air.notePan(0), true, 'the first fresh ground in a window counts');
    assert.equal(air.notePan(1), false, 'a second fresh ground in the same window is held');
    assert.equal(air.notePan(2), false);
    // A ground ALREADY banked still counts as work on suit air, and does not spend the window.
    assert.equal(air.notePan(0), true, 'panning a banked ground is still work on air');
    let dials = air.diagnostics.regolith;
    assert.deepEqual(dials.worked, [0]);
    assert.equal(dials.creditedThisWindow, 1);
    assert.equal(dials.windowHeldPans, 2, 'the two refusals are counted, and credited to nothing');
    assert.equal(dials.runsOnAir, 4, 'every pan on air is still a pan on air');
    assert.equal(air.objectiveAllowsSecure, false);

    // THE ROLL-OVER: the run clock crosses a window boundary and the credit comes back.
    rollForward();
    dials = air.diagnostics.regolith;
    assert.equal(dials.window, 1, 'the window index follows the run clock');
    assert.equal(dials.creditedThisWindow, 0, 'a new window opens with its credit unspent');
    assert.equal(air.notePan(1), true);
    assert.deepEqual(air.diagnostics.regolith.worked, [0, 1]);
    assert.equal(air.objectiveAllowsSecure, false, `${regolithRequired} grounds, not two`);

    // THE LATCH: one credit per window until the authored count is met, and not one window sooner.
    for (let banked = 2; banked < regolithRequired; banked += 1) {
      rollForward();
      assert.equal(air.notePan(banked), true, `window ${banked} must credit ground ${banked}`);
      assert.equal(
        air.objectiveAllowsSecure,
        banked + 1 >= regolithRequired,
        `the latch opens only on the ${regolithRequired}th ground`,
      );
    }
    const closed = air.diagnostics.regolith;
    assert.equal(closed.worked.length, regolithRequired);
    assert.equal(closed.complete, true);
    assert.equal(closed.window, regolithRequired - 1, 'the earliest possible finish is one window per ground');

    // A BREATHLESS PAN IS STILL REFUSED FIRST, window or no window: the air is the wall.
    const starved = E8AtmosphereSystem.create(contract);
    const outside = { x: 40, z: 40 };
    for (let second = 0; second < 61; second += 1) starved.update(1, outside, []);
    assert.equal(starved.diagnostics.suit.empty, true);
    assert.equal(starved.notePan(0), false);
    assert.deepEqual(
      {
        worked: starved.diagnostics.regolith.worked,
        breathless: starved.diagnostics.regolith.breathlessPans,
        held: starved.diagnostics.regolith.windowHeldPans,
      },
      { worked: [], breathless: 1, held: 0 },
    );
  });
});

test('the published gate cannot drift from the authored one', async () => {
  await withVite(async (vite) => {
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');

    const contract = loadContract(CONTRACT);
    const { regolithRequired, regolithWindowWaves } = contract.twist.atmosphere;
    const [rule, ...extra] = deriveMechanicsManifest(contract).rules.filter((entry) => entry.id === 'air_wall_regolith');
    assert.deepEqual(extra, [], 'one air rule, not several');
    assert.equal(rule.source, 'E8AtmosphereSystem.notePan');
    assert.equal(rule.data.required, regolithRequired);
    assert.equal(rule.data.windowWaves, regolithWindowWaves);
    assert.equal(rule.data.windowSeconds, regolithWindowWaves * Balance.waves.waveInterval);
    assert.equal(rule.data.grounds, contract.tileParams.harvestAnchors.length);
    assert.equal(rule.data.gatesSecure, true);
    assert.equal(rule.data.damages, false);

    // The briefing is the human half of the same fact; a rider reads it on the card. Both numbers
    // are spelled in words there, so the check is that each number is STATED, not how.
    const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const rules = contract.briefing.rules.join(' ').toLowerCase();
    assert.ok(rules.includes(words[regolithRequired]), `the card must state the ${regolithRequired}-ground gate`);
    assert.ok(rules.includes(`${words[regolithWindowWaves]}-wave`), `the card must state the ${regolithWindowWaves}-wave window`);
    assert.ok(rules.includes('air'), 'the card must say the grounds are worked on air');

    // NO CONTRACT PUBLISHES THIS ROW FROM THE MARE CLAIM'S CONSUMER BUT THE MARE CLAIM — the
    // consumer is id-scoped and so is this. RE-POINTED 2026-09-06 (`tasks/e8-air-wall-all-maps.md`):
    // the Eclipse now publishes an `air_wall_regolith` row of its own, sourced from
    // `E8SuitAirSystem.notePan`, because it enforces the same rule; the two crossing maps publish
    // `air_wall_crossing` instead. So the check is on the SOURCE, which is what says which engine
    // a rider's row came from, rather than on the row's absence.
    for (const id of [...SIBLINGS, 'the-claim']) {
      for (const published of deriveMechanicsManifest(loadContract(id)).rules.filter((entry) => entry.id === 'air_wall_regolith')) {
        assert.notEqual(published.source, 'E8AtmosphereSystem.notePan', `${id} must not publish the Mare Claim consumer's row`);
        assert.equal(published.source, 'E8SuitAirSystem.notePan', `${id}'s air row must name its own consumer`);
      }
    }
    assert.deepEqual(
      deriveMechanicsManifest(loadContract('the-claim')).rules.filter((entry) => entry.id.startsWith('air_wall')),
      [],
      'a contract with no air at all publishes no air rule',
    );
  });
});

test('the door refuses a regolith gate that is not a reachable whole number of grounds', async () => {
  await withVite(async (vite) => {
    const { validateContractsBundle } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const raw = JSON.parse(readFileSync(new URL(`../assets/contracts/${BUNDLE}/contracts.json`, import.meta.url), 'utf8'));
    const withGate = (atmosphere, mutate) => {
      const next = JSON.parse(JSON.stringify(raw));
      const row = next.contracts.find((entry) => entry.id === CONTRACT);
      if (atmosphere === null) delete row.twist.atmosphere;
      else row.twist.atmosphere = atmosphere;
      mutate?.(row);
      return next;
    };

    // Controls: the shipped bundle passes, so does the same bundle with no gate, and so does a
    // gate with no window (a raised count on its own is lawful).
    validateContractsBundle(raw, BUNDLE);
    validateContractsBundle(withGate(null), BUNDLE);
    validateContractsBundle(withGate({ regolithRequired: 2 }), BUNDLE);
    validateContractsBundle(withGate({ regolithRequired: 6, regolithWindowWaves: 1 }), BUNDLE);

    const refused = [
      { regolithRequired: 0 },
      { regolithRequired: -1 },
      { regolithRequired: 2.5 },
      { regolithRequired: '4' },
      { regolithRequired: 7 }, // the map authors six grounds; a seventh can never be worked.
      { regolithWindowWaves: 4 },
      { regolithRequired: 4, regolithWindowWaves: 0 },
      { regolithRequired: 4, regolithWindowWaves: 1.5 },
      { regolithRequired: 4, regolithWindowWaves: '4' },
      { regolithRequired: 4, windowWaves: 4 },
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

    // And a gate on a map with no air wall is refused: nothing would ever read it there.
    assert.throws(
      () => validateContractsBundle(withGate({ regolithRequired: 4 }, (row) => { delete row.tileParams.atmosphere; }), BUNDLE),
      (error) => /twist\.atmosphere/.test(error.message),
      'a regolith gate without an air wall must be refused',
    );
  });
});

test('one reader, and the browser composes survival and objectives through the same resolver', () => {
  const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8');
  const headless = readFileSync(new URL('../src/sim/HeadlessContractSim.ts', import.meta.url), 'utf8');
  const consumer = readFileSync(new URL('../src/systems/E8PhysicsSystem.ts', import.meta.url), 'utf8');
  // A new run must discard the previous run's suit and objective state.
  assert.equal([...game.matchAll(/E8AtmosphereSystem\.create\(/g)].length, 2, 'initial composition and new-run reset');
  assert.equal([...headless.matchAll(/E8AtmosphereSystem\.create\(/g)].length, 1, 'exactly one composition, in the sim');
  const airStep = game.slice(game.indexOf('private applyE8SuitAir('), game.indexOf('private suitAirState('));
  assert.match(airStep, /this\.e8Atmosphere\.updateActors\(fixedDelta, humans,/);
  assert.match(airStep, /this\.e8SuitAir\.updateActors\(fixedDelta, humans,/);
  assert.match(airStep, /this\.combat\.damageActor\(chip, -1, this\.actors\[human\.id\]\)/, 'each suit routes harm through CombatSystem');
  assert.doesNotMatch(airStep, /this\.localActor/, 'shared air simulation cannot depend on the viewing peer');
  assert.match(game, /!this\.e8Atmosphere\.objectiveAllowsSecure/, 'atmosphere objectives gate browser secure');
  assert.match(game, /!this\.e8SuitAir\.objectiveAllowsSecure/, 'sibling air objectives gate browser secure');
  // The authored numbers are read in ONE FILE, so the gate cannot drift between two modules.
  // RE-POINTED 2026-09-07 (`tasks/e8-air-logical.md`, owner directive 2026-09-07) from 1 to 4: the human-suit half added three more authored
  // fields (`suitSeconds`, `harmPerSecond`, `pressurisedZoneIds`) and each has its own named
  // reader beside the gate's — `authoredSuitSeconds`, `authoredHarmPerSecond`,
  // `authoredPressurisedZoneIds`. Four readers in one file is still one place; what this line
  // guards is that `E8SuitAirSystem` calls THOSE rather than re-reading the contract itself.
  assert.equal([...consumer.matchAll(/contract\.twist\.atmosphere/g)].length, 4, 'four named readers, all in one file');
  const siblings = readFileSync(new URL('../src/systems/E8SuitAirSystem.ts', import.meta.url), 'utf8');
  assert.equal(
    [...siblings.matchAll(/contract\.twist\.atmosphere/g)].length,
    1,
    'the siblings read the gate once and take the suit numbers from the shared readers',
  );
});
