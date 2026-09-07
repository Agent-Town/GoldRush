// THE HUMAN-SUIT GUARD (owner directive 2026-09-07, verbatim: "I want space experiences of humans
// to need them having air. It has to be logical. If that means we have to change something ok").
//
// The third guard on the era's air, beside `e8-regolith-gate-override` (how many grounds) and
// `e8-crossing-gate-override` (how many crossings). Those two guard the OBJECTIVE. This one guards
// the SURVIVAL half the directive added, and the six things that can rot in it each have a test:
//
//   1. THE WRONG BODY COMES BACK. The suit was measured against the PROSPECTOR until this slice, a
//      made agent that does not breathe (`lore/STORYBOOK.md:453`, `:681`). If `suit.body` ever
//      reads anything but 'hero' again, the era has quietly stopped being about humans.
//   2. THE NUMBERS ARE NOT READ. `twist.atmosphere.suitSeconds` and `harmPerSecond` must reach BOTH
//      consumers and the view, or a card promises a dial the run does not hold.
//   3. HARM STOPS GOING THROUGH `CombatSystem`. The consumer must RETURN hp and never apply it —
//      one damage resolver (`CLAUDE.md` §4.4) — and the door must actually deliver it: a hero left
//      in vacuum must lose hit points and emit `hero_damaged`.
//   4. THE REFILL LEAKS. Air comes back INSIDE pressurised ground and nowhere else. A suit that
//      refilled in vacuum would make the whole rule decorative.
//   5. A CONTRACT WITHOUT THE NUMBERS CHANGES. Silence must keep the pre-2026-09-07 behaviour
//      exactly: a 60 s suit and no harm at all. That is the control every other assertion leans on.
//   6. A CROSSING HOLDS AIR. F-EAWA-2's cure, as data: no rectangle may be both a crossing and a
//      shelter, because a crossing that cannot be made breathless is a schedule, not an air budget.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
/** Every Orbital map, because the directive is about all four and the rule is one rule. */
const E8_MAPS = ['e8-mare-claim', 'e8-far-side', 'e8-low-orbit', 'e8-eclipse'];
const BUNDLE = 'epoch-8-orbital';

async function withVite(run) {
  const location = new URL('http://e8-air-suit.test/?debug&contract=e8-mare-claim&seed=e8-mare-claim-01');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    return await run(vite);
  } finally {
    await vite.close();
  }
}

/** The consumer this contract arms — the two are mutually exclusive by construction. */
function consumerFor(contract, { E8AtmosphereSystem, E8SuitAirSystem }) {
  const wall = E8AtmosphereSystem.create(contract);
  return wall.isDeclared ? wall : E8SuitAirSystem.create(contract);
}

test('the body that breathes is the hero, on every Orbital map and on the view', async () => {
  await withVite(async (vite) => {
    const systems = {
      ...(await vite.ssrLoadModule('/src/systems/E8PhysicsSystem.ts')),
      ...(await vite.ssrLoadModule('/src/systems/E8SuitAirSystem.ts')),
    };
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');

    for (const id of E8_MAPS) {
      const contract = loadContract(id);
      const consumer = consumerFor(contract, systems);
      assert.equal(consumer.isDeclared, true, `${id} must arm an air consumer`);
      assert.equal(consumer.diagnostics.suit.body, 'hero', `${id}: the suit is the human's`);

      const sim = new HeadlessContractSim({ contractId: id, seed: `${id}-01`, admissionProbe: true });
      const air = sim.currentTurn().view.now.air;
      assert.equal(air.suit.body, 'hero', `${id}: the view must publish the human's dial`);
    }
  });
});

test('both consumers read twist.atmosphere.suitSeconds and harmPerSecond, and the view publishes them', async () => {
  await withVite(async (vite) => {
    const systems = {
      ...(await vite.ssrLoadModule('/src/systems/E8PhysicsSystem.ts')),
      ...(await vite.ssrLoadModule('/src/systems/E8SuitAirSystem.ts')),
    };
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');

    for (const id of E8_MAPS) {
      const contract = loadContract(id);
      const authored = contract.twist.atmosphere;
      assert.equal(typeof authored?.suitSeconds, 'number', `${id} must author twist.atmosphere.suitSeconds`);
      assert.equal(typeof authored?.harmPerSecond, 'number', `${id} must author twist.atmosphere.harmPerSecond`);

      const { suit } = consumerFor(contract, systems).diagnostics;
      assert.equal(suit.capacity, authored.suitSeconds, `${id}: the consumer must take the authored capacity`);
      assert.equal(suit.harmPerSecond, authored.harmPerSecond, `${id}: the consumer must take the authored harm`);
      assert.equal(suit.seconds, authored.suitSeconds, `${id}: a fresh suit is full`);
      assert.equal(suit.harmDealt, 0);
      assert.equal(suit.harmTicks, 0);

      const sim = new HeadlessContractSim({ contractId: id, seed: `${id}-01`, admissionProbe: true });
      const air = sim.currentTurn().view.now.air;
      assert.equal(air.suit.capacity, authored.suitSeconds, `${id}: the view must publish the authored capacity`);
      assert.equal(air.suit.harmPerSecond, authored.harmPerSecond, `${id}: the view must publish the authored harm`);
    }
  });
});

test('the consumer RETURNS its harm and never applies it, one whole second at a time', async () => {
  await withVite(async (vite) => {
    const physics = await vite.ssrLoadModule('/src/systems/E8PhysicsSystem.ts');
    const { E8HumanSuit, SUIT_HARM_TICK_SECONDS, SUIT_REFILL_PER_SECOND } = physics;

    // Six seconds of air, five hit points a second, on the sim's own fixed step.
    const suit = new E8HumanSuit(6, 5);
    const step = 1 / 30;
    let charged = 0;
    // 181 rather than 180: thirty steps of 1/30 s sum to 5.999999999999998 in binary floating
    // point, and the sim's own clock has the same rounding, so a suit is empty on the tick AFTER
    // its last whole second rather than on it. Asserting the exact tick would be asserting the
    // float, not the rule.
    for (let tick = 0; tick < 30 * 6 + 1; tick += 1) charged += suit.update(step, null);
    assert.equal(charged, 0, 'a suit that still holds air charges nothing');
    assert.equal(suit.empty, true, 'six seconds of vacuum empties a six-second suit');

    // The first whole second of an empty suit is the first charge, and it arrives ONCE.
    let ticks = 0;
    let firstCharge = 0;
    while (firstCharge === 0 && ticks < 30 * 3) {
      firstCharge = suit.update(step, null);
      ticks += 1;
    }
    assert.equal(firstCharge, 5, 'one charge is harmPerSecond x the tick length');
    assert.ok(ticks >= 30 && ticks <= 31, `the charge lands on the first whole second, got ${ticks} ticks`);
    assert.equal(suit.diagnostics.harmTicks, 1);
    assert.equal(suit.diagnostics.harmDealt, 5);
    assert.equal(SUIT_HARM_TICK_SECONDS, 1, 'the cadence must clear the hero iframe window twice over');

    // REACHING AIR ENDS IT, and a part-second of suffocation is forgiven rather than banked.
    for (let tick = 0; tick < 15; tick += 1) assert.equal(suit.update(step, 'dome-cluster-pad-center'), 0);
    assert.equal(suit.empty, false, `a shelter refills at ${SUIT_REFILL_PER_SECOND}/s`);
    assert.equal(suit.diagnostics.harmTicks, 1, 'nothing is charged inside air');
    assert.equal(suit.diagnostics.inDome, 'dome-cluster-pad-center');
  });
});

test('a hero left in vacuum loses hit points through CombatSystem, and one kept in air does not', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');

    // The Far Side is the clean case: its hero starts INSIDE the one pressurised rectangle
    // (`far-side-landing-stake`, heroStart, inside `far-side-landing-yard`), so an idle hero there
    // never suffocates and any hp she loses is somebody else's doing.
    const air = loadContract('e8-far-side').twist.atmosphere;
    const sim = new HeadlessContractSim({ contractId: 'e8-far-side', seed: 'e8-far-side-01', admissionProbe: true });
    const seconds = air.suitSeconds + 20;
    for (let tick = 0; tick < 30 * seconds; tick += 1) sim.step();
    const inside = sim.currentTurn().view.now.air;
    assert.equal(inside.suit.inDome, 'far-side-landing-yard', 'the Far Side hero starts in the lander yard');
    assert.equal(inside.suit.seconds, air.suitSeconds, 'a hero in air keeps a full suit');
    assert.equal(inside.suit.harmDealt, 0, 'and is charged nothing');

    // The Mare Claim is the other case, and it is the map the directive was measured on: its hero
    // is dropped at (0, 12), six world units NORTH of the dome cluster, in vacuum.
    const mare = loadContract('e8-mare-claim').twist.atmosphere;
    const out = new HeadlessContractSim({ contractId: 'e8-mare-claim', seed: 'e8-mare-claim-01', admissionProbe: true });
    for (let tick = 0; tick < 30 * (mare.suitSeconds + 5); tick += 1) out.step();
    const vacuum = out.currentTurn().view.now.air;
    assert.equal(vacuum.suit.inDome, null, 'the Mare Claim drops its hero outside the domes');
    assert.equal(vacuum.suit.empty, true, `${mare.suitSeconds}s of vacuum empties the suit`);
    assert.ok(vacuum.suit.harmTicks >= 4, `an empty suit charges every second, got ${vacuum.suit.harmTicks}`);
    assert.ok(
      vacuum.suit.harmDealt >= mare.harmPerSecond * 4,
      `charged ${vacuum.suit.harmDealt} hp, expected at least ${mare.harmPerSecond * 4}`,
    );
    // THE RESOLVER MOVED THE HP. `CombatSystem.damageActor` is the only thing in this engine that
    // may, and the view's own hero row is what it moved: a hero that has been charged for
    // `harmTicks` seconds is below her maximum by at least what those charges cost, minus the
    // half-second iframe another source may have eaten (`Balance.hero.iframes`, and the reason
    // this asserts a floor rather than an equality).
    const hero = out.currentTurn().view.now.hero;
    assert.ok(hero.hp < hero.maxHp, 'a suffocating hero must lose hit points');
    assert.ok(
      hero.maxHp - hero.hp >= mare.harmPerSecond,
      `hero lost ${hero.maxHp - hero.hp} hp against an authored ${mare.harmPerSecond}/s charge`,
    );
  });
});

test('a contract that authors no suit numbers keeps the pre-directive behaviour exactly', async () => {
  await withVite(async (vite) => {
    const systems = {
      ...(await vite.ssrLoadModule('/src/systems/E8PhysicsSystem.ts')),
      ...(await vite.ssrLoadModule('/src/systems/E8SuitAirSystem.ts')),
    };
    const { SUIT_AIR_SECONDS } = systems;
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');

    for (const id of E8_MAPS) {
      const contract = loadContract(id);
      // The control, built from the map's own manifest with only the two new numbers struck.
      const bare = {
        ...contract,
        twist: {
          ...contract.twist,
          atmosphere: {
            ...contract.twist.atmosphere,
            suitSeconds: undefined,
            harmPerSecond: undefined,
            pressurisedZoneIds: undefined,
          },
        },
      };
      const { suit } = consumerFor(bare, systems).diagnostics;
      assert.equal(suit.capacity, SUIT_AIR_SECONDS, `${id}: silence keeps the ratified 60-second suit`);
      assert.equal(suit.harmPerSecond, null, `${id}: silence means an empty suit costs nothing`);

      // And it charges nothing, however long it is left out.
      const consumer = consumerFor(bare, systems);
      for (let tick = 0; tick < 30 * (SUIT_AIR_SECONDS + 30); tick += 1) {
        const charged = consumer.update(1 / 30, { x: 999, z: 999 }, [], 1);
        assert.equal(charged, 0, `${id}: an unauthored contract must never charge harm`);
      }
      assert.equal(consumer.diagnostics.suit.empty, true, `${id}: the dial still empties, it just costs nothing`);
    }
  });
});

test('no rectangle is both a crossing and a shelter, and Low Orbit names its cabin', async () => {
  await withVite(async (vite) => {
    const { E8SuitAirSystem } = await vite.ssrLoadModule('/src/systems/E8SuitAirSystem.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');

    for (const id of E8_MAPS) {
      const contract = loadContract(id);
      const air = E8SuitAirSystem.create(contract);
      if (!air.isDeclared) continue;
      const { domes, crossing } = air.diagnostics;
      const shelters = new Set(domes.map(({ id: zone }) => zone));
      for (const zone of crossing?.zones ?? []) {
        assert.equal(shelters.has(zone), false, `${id}: ${zone} cannot be both a crossing and a shelter (F-EAWA-2)`);
      }
    }

    // LOW ORBIT IS THE CURE'S OWN CASE. Before 2026-09-07 all three authored decks were shelters
    // AND crossings, so `breathlessEntries` could only ever read 0.
    const lowOrbit = loadContract('e8-low-orbit');
    assert.deepEqual(
      lowOrbit.twist.atmosphere.pressurisedZoneIds,
      ['claw-carcass-yard'],
      'the Claw carcass is the only cabin in the orbital yard',
    );
    const { domes, crossing } = E8SuitAirSystem.create(lowOrbit).diagnostics;
    assert.deepEqual(domes.map(({ id }) => id), ['claw-carcass-yard']);
    assert.deepEqual(crossing.zones, ['west-scaffold-deck', 'east-scaffold-deck'], 'the outboard decks are vacuum');

    // AND THE DOOR ADMITS THE SHIPPED BUNDLE, so the geography a rider is told about is the
    // geography it rides.
    const { validateContractsBundle } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    validateContractsBundle(
      JSON.parse(readFileSync(new URL(`../assets/contracts/${BUNDLE}/contracts.json`, import.meta.url), 'utf8')),
      BUNDLE,
    );
  });
});

test('the door refuses a suit number, a harm number or a pressurised list that would print a lie', async () => {
  await withVite(async (vite) => {
    const { validateContractsBundle } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const raw = JSON.parse(readFileSync(new URL(`../assets/contracts/${BUNDLE}/contracts.json`, import.meta.url), 'utf8'));
    const withAir = (patch, contractId = 'e8-low-orbit') => {
      const next = JSON.parse(JSON.stringify(raw));
      const row = next.contracts.find((entry) => entry.id === contractId);
      row.twist.atmosphere = { ...row.twist.atmosphere, ...patch };
      for (const [key, value] of Object.entries(patch)) if (value === undefined) delete row.twist.atmosphere[key];
      return next;
    };

    // Controls: the shipped bundle passes, and so does the same bundle with the three new fields
    // struck — silence is lawful, and it is the pre-directive behaviour.
    validateContractsBundle(raw, BUNDLE);
    validateContractsBundle(withAir({ suitSeconds: undefined, harmPerSecond: undefined, pressurisedZoneIds: undefined }), BUNDLE);
    validateContractsBundle(withAir({ suitSeconds: 30 }), BUNDLE);
    validateContractsBundle(withAir({ harmPerSecond: 1 }), BUNDLE);

    const refused = [
      [{ suitSeconds: 12.5 }, /twist\.atmosphere\.suitSeconds/, 'a fractional suit'],
      [{ suitSeconds: 0 }, /twist\.atmosphere\.suitSeconds/, 'a zero suit'],
      [{ suitSeconds: '60' }, /twist\.atmosphere\.suitSeconds/, 'a suit written as a string'],
      [{ harmPerSecond: -1 }, /twist\.atmosphere\.harmPerSecond/, 'a negative harm'],
      [{ harmPerSecond: 2.5 }, /twist\.atmosphere\.harmPerSecond/, 'a fractional harm'],
      [{ pressurisedZoneIds: [] }, /twist\.atmosphere\.pressurisedZoneIds/, 'a map with no air on it'],
      [{ pressurisedZoneIds: 'claw-carcass-yard' }, /twist\.atmosphere\.pressurisedZoneIds/, 'a bare string'],
      [{ pressurisedZoneIds: ['no-such-deck'] }, /twist\.atmosphere\.pressurisedZoneIds/, 'a rectangle the map does not author'],
      [
        { pressurisedZoneIds: ['west-scaffold-deck', 'claw-carcass-yard', 'east-scaffold-deck'] },
        /twist\.atmosphere\.pressurisedZoneIds/,
        'a list covering every crossing is F-EAWA-2 authored back in',
      ],
      [{ suitOxygen: 60 }, /twist\.atmosphere/, 'a misspelled field, refused rather than ignored'],
    ];
    for (const [patch, field, why] of refused) {
      assert.throws(
        () => validateContractsBundle(withAir(patch), BUNDLE),
        (error) => field.test(error.message),
        `the door must refuse ${why}`,
      );
    }
  });
});

test('the manifest publishes air_suit_human on every Orbital map, and it is the row that says damages', async () => {
  await withVite(async (vite) => {
    const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');

    for (const id of E8_MAPS) {
      const contract = loadContract(id);
      const rules = deriveMechanicsManifest(contract).rules;
      const suit = rules.find((rule) => rule.id === 'air_suit_human');
      assert.ok(suit, `${id} must publish air_suit_human`);
      assert.equal(suit.data.body, 'hero');
      assert.equal(suit.data.suitSeconds, contract.twist.atmosphere.suitSeconds);
      assert.equal(suit.data.harmPerSecond, contract.twist.atmosphere.harmPerSecond);
      assert.equal(suit.data.damages, true, 'the survival row is the one that kills');
      assert.equal(suit.data.gatesSecure, false, 'and it is not the row that gates the secure');
      // The objective rows are still objectives, and still say so.
      for (const rule of rules.filter((entry) => entry.id.startsWith('air_wall_'))) {
        assert.equal(rule.data.damages, false, `${id}: ${rule.id} is an objective, not a hazard`);
        assert.equal(rule.data.gatesSecure, true);
      }
    }
  });
});

test('the dial is on the HUD a plain boot draws, and it is contract-scoped', async () => {
  // MISTAKE #10, AS A GUARD: "where does the PLAYER see this, in a plain boot?" A rule that can
  // kill her in silence is the worst version of a mechanic that did not ship. The visual proof is
  // `artifacts/e8-air-logical/dial-*-390.png` (four plain boots at 390 px, zero console errors,
  // re-shootable with `shoot-dial.mjs`); this asserts the seams those shots ride, so a later
  // refactor cannot quietly unplug the meter and leave the screenshots as the only record.
  const hud = readFileSync(new URL('../src/ui/Hud.ts', import.meta.url), 'utf8');
  const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8');

  // The markup, its three states, and the setter that drives them.
  assert.match(hud, /data-testid="hud-suit-air"/, 'the HUD must carry the suit panel');
  assert.match(hud, /data-hud-suit-air-fill/, 'and the fill the meter turns');
  assert.match(hud, /setSuitAir\(suit: SuitAirState \| null\): void/, 'pushed on the setVentWarmth seam');
  for (const state of ['empty', 'breathing', 'draining']) {
    assert.ok(hud.includes(`'${state}'`), `the dial must be able to read ${state}`);
  }
  // CONTRACT-SCOPED, exactly as the vent meter is: `null` hides it, and every map outside the
  // Orbital bundle passes null because `suitAirState` answers null where no consumer is declared.
  assert.match(hud, /this\.elements\.suitPanel\.hidden = !suit;/, 'null must hide the panel');
  assert.match(game, /private suitAirState\(\): SuitAirState \| null/, 'the browser must derive the dial');
  assert.match(game, /this\.hud\.setSuitAir\(this\.suitAirState\(\)\);/, 'and push it every HUD sync');
  await Promise.resolve();
});
