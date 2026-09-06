// THE PER-CONTRACT BEACON LADDER GUARD (owner ruling 2026-09-06, verbatim: "lets adjust the
// policy so the hard levels can be won").
//
// `twist.economy.beaconLadder` reprices ONE claim's beacons without touching `Balance.beacon`, so
// every other map's build costs stay byte-identical. It is the twin of `twist.economy.bankCap` and
// the same four things can rot, so this file is the shape of `contract-bank-cap-override.test.mjs`
// with the price in place of the purse:
//
//   1. THE ENGINES DISAGREE. Both engines price a build through ONE function — `buildableCostAt`
//      in `src/game/buildables.ts`, reached from `BuildSystem.costFor` — and both must hand it the
//      contract's ladder. The headless half is read off a live sim; the browser half cannot be
//      constructed in node (it needs a canvas), so it is proved at the SOURCE: `Game.ts` must call
//      `setContractBeaconLadder` with the same `twist.economy?.beaconLadder` expression, through
//      the same `resolveBeaconLadder`.
//   2. THE DEFAULT DRIFTS. A contract that authors nothing must be charged EXACTLY
//      `Balance.beacon`'s own rounded curve — the control case, and the reason the override is an
//      ARGUMENT rather than a second base number or module state.
//   3. THE CARD LIES. A rider buys from `mechanics.buildables[].costs`; a human reads the briefing
//      rule. If either drifts from the price the engine charges, a tour is planned against money
//      that does not exist.
//   4. THE DOOR LETS RUBBISH IN. A fractional, negative, descending, off-the-5s, over-long or
//      misspelled ladder must be refused by `describeContract`, not clamped at runtime.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OVERRIDE_CONTRACT = 'e3-canyon-works';
/** Same epoch, same `twist.powerGrid`, no ladder of its own: the controls that must not move. */
const CONTROL_CONTRACTS = ['e3-blackout-ridge', 'e1-dry-gulch'];

async function withVite(run) {
  const location = new URL('http://contract-beacon-ladder.test/?debug');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    return await run(vite);
  } finally {
    await vite.close();
  }
}

function defaultCurve(Balance, rungs) {
  return Array.from({ length: rungs }, (_, index) => Math.ceil((Balance.beacon.costBase * Balance.beacon.costGrowth ** index) / 5) * 5);
}

test('both engines price beacons from twist.economy.beaconLadder, through one function', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { beaconCost, buildableCostAt, getBuildableDef, resolveBeaconLadder } = await vite.ssrLoadModule('/src/game/buildables.ts');

    const authored = loadContract(OVERRIDE_CONTRACT).twist.economy?.beaconLadder;
    assert.ok(Array.isArray(authored), `${OVERRIDE_CONTRACT} must author twist.economy.beaconLadder`);
    const def = getBuildableDef('sentry_beacon');
    assert.equal(authored.length, def.maxCount, 'the authored ladder must price every beacon the claim can raise');
    const fallback = defaultCurve(Balance, def.maxCount);
    assert.notDeepEqual(authored, fallback, 'a ladder identical to the default curve would be a no-op');

    // THE ONE PRICING FUNCTION. Everything below reaches a build cost through this call.
    const ladder = resolveBeaconLadder(authored);
    assert.deepEqual([...ladder], authored);
    assert.deepEqual(Array.from({ length: def.maxCount }, (_, index) => buildableCostAt(def, index, ladder)), authored);
    assert.deepEqual(Array.from({ length: def.maxCount }, (_, index) => buildableCostAt(def, index)), fallback);
    // A rung past the end of a ladder holds the last price rather than falling off it.
    assert.equal(beaconCost(def.maxCount + 4, ladder), authored.at(-1));
    // Only the beacon is repriced: a ladder handed to any other buildable is ignored.
    const palisade = getBuildableDef('palisade');
    assert.equal(buildableCostAt(palisade, 0, ladder), palisade.costCurve(0));

    // HEADLESS. `build` is TypeScript-private, which is a compile-time fence, not a runtime one;
    // reading it here is deliberate, because the only honest proof that the SIM charges the ladder
    // is the sim's own build menu.
    const sim = new HeadlessContractSim({ contractId: OVERRIDE_CONTRACT, seed: 'e3-canyon-works-01', admissionProbe: true });
    const beaconRow = () => sim.build.buildableSnapshots.find((entry) => entry.id === 'sentry_beacon');
    const priceInSim = () => beaconRow()?.cost;
    assert.equal(beaconRow()?.count, 0, 'the Canyon Works opens with no beacon standing, so rung 1 is next');
    assert.equal(priceInSim(), authored[0], 'the sim must open the claim at the first authored rung');
    // `nextCost` is the number the build HUD spends against, read through the same `costFor`.
    assert.equal(sim.build.diagnostics.nextCost, authored[0]);

    // BROWSER, through the shared mechanism: the same setter on a bare BuildSystem is what
    // `Game.applyContractBeaconLadder` calls, and `undefined` restores the default curve.
    const { BuildSystem } = await vite.ssrLoadModule('/src/systems/BuildSystem.ts');
    assert.equal(typeof BuildSystem.prototype.setContractBeaconLadder, 'function');
    sim.build.setContractBeaconLadder(undefined);
    assert.equal(priceInSim(), fallback[0], 'clearing the ladder must restore Balance.beacon exactly');
    sim.build.setContractBeaconLadder(ladder);
    assert.equal(priceInSim(), authored[0]);
  });
});

test('a contract without the twist is charged exactly Balance.beacon, in both engines and on the card', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { getBuildableDef } = await vite.ssrLoadModule('/src/game/buildables.ts');
    const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');

    const rungs = getBuildableDef('sentry_beacon').maxCount;
    const fallback = defaultCurve(Balance, rungs);
    for (const id of CONTROL_CONTRACTS) {
      const contract = loadContract(id);
      assert.equal(contract.twist.economy?.beaconLadder, undefined, `${id} must not author a ladder`);
      const sim = new HeadlessContractSim({ contractId: id, seed: 'bench-001', admissionProbe: true });
      const menu = sim.build.buildableSnapshots.find((entry) => entry.id === 'sentry_beacon');
      // Priced at the NEXT rung, because a claim may open with pre-placed beacons already standing
      // (`e3-blackout-ridge` opens with two, so its next beacon is the third rung, 45).
      assert.equal(menu?.cost, fallback[menu?.count ?? 0], `${id} must keep the default curve at rung ${menu?.count}`);
      const manifest = deriveMechanicsManifest(contract);
      const beacon = manifest.buildables?.find((entry) => entry.id === 'sentry_beacon');
      if (beacon) assert.deepEqual([...beacon.costs], fallback.slice(0, beacon.costs.length), `${id} must publish the default curve`);
      assert.deepEqual(manifest.rules.filter((entry) => entry.id === 'contract_beacon_ladder'), [], `${id} must publish no ladder rule`);
    }
  });
});

test('the published ladder cannot drift from the authored one, or from the card a human reads', async () => {
  await withVite(async (vite) => {
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { getBuildableDef } = await vite.ssrLoadModule('/src/game/buildables.ts');
    const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');

    const contract = loadContract(OVERRIDE_CONTRACT);
    const authored = contract.twist.economy.beaconLadder;
    const rungs = getBuildableDef('sentry_beacon').maxCount;
    const fallback = defaultCurve(Balance, rungs);
    const manifest = deriveMechanicsManifest(contract);

    // The rider's pricing truth (`public/skill.md`: "buildables[].costs is the pricing truth").
    const beacon = manifest.buildables.find((entry) => entry.id === 'sentry_beacon');
    assert.deepEqual([...beacon.costs], authored);
    assert.equal(beacon.cost, authored[0]);
    assert.equal(beacon.costRule, 'ceil-to-5', 'every authored rung is a multiple of 5, so the published rule stays true');

    const [rule, ...extra] = manifest.rules.filter((entry) => entry.id === 'contract_beacon_ladder');
    assert.deepEqual(extra, [], 'one ladder rule, not several');
    assert.equal(rule.source, 'twist.economy.beaconLadder');
    assert.deepEqual(rule.data.ladder.map((row) => row.cost), authored);
    assert.deepEqual(rule.data.ladder.map((row) => row.defaultCost), fallback);
    assert.deepEqual(rule.data.ladder.map((row) => row.rung), authored.map((_price, index) => index + 1));
    assert.equal(rule.data.total, authored.reduce((sum, price) => sum + price, 0));
    assert.equal(rule.data.defaultTotal, fallback.reduce((sum, price) => sum + price, 0));

    // The briefing is the human half of the same fact; a first-timer reads it on the card, and it
    // must state the prices, their total, and the deadline they are priced against.
    const total = String(rule.data.total);
    const stated = contract.briefing.rules.filter((line) => line.includes(total));
    assert.equal(stated.length, 1, `exactly one briefing rule must state the ${total} gold tour`);
    for (const price of authored) assert.ok(stated[0].includes(String(price)), `the rule must state the ${price} gold rung`);
    assert.ok(
      stated[0].includes(`wave ${contract.twist.powerGrid.connect.byWave}`),
      'the rule must state the deadline the prices are set against',
    );
    assert.ok(stated[0].includes(String(contract.twist.economy.bankCap)), 'the rule must state the purse the tour is banked in');
    assert.ok(
      contract.briefing.goals.some((line) => line.includes(`wave ${contract.twist.powerGrid.connect.byWave}`)),
      'the connect goal must state the authored deadline',
    );
    // The tour must fit the purse it is banked in, or the card promises a descent income refuses.
    assert.ok(rule.data.total <= contract.twist.economy.bankCap, 'the whole ladder must fit inside the contract purse');
  });
});

test('the door refuses a ladder that is not 1..maxCount non-decreasing whole multiples of 5', async () => {
  await withVite(async (vite) => {
    const { validateContractsBundle } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { getBuildableDef } = await vite.ssrLoadModule('/src/game/buildables.ts');
    const rungs = getBuildableDef('sentry_beacon').maxCount;
    const BUNDLE = new URL('../assets/contracts/epoch-3-voltage/contracts.json', import.meta.url);
    const raw = JSON.parse(readFileSync(BUNDLE, 'utf8'));
    const withLadder = (ladder) => {
      const next = JSON.parse(JSON.stringify(raw));
      const row = next.contracts.find((entry) => entry.id === OVERRIDE_CONTRACT);
      if (ladder === null) delete row.twist.economy.beaconLadder;
      else row.twist.economy.beaconLadder = ladder;
      return next;
    };

    // Controls: the shipped bundle passes, so does the same bundle with no ladder, a short ladder,
    // and a flat one.
    validateContractsBundle(raw, 'epoch-3-voltage');
    validateContractsBundle(withLadder(null), 'epoch-3-voltage');
    validateContractsBundle(withLadder([25, 30, 35, 45, 50, 55]), 'epoch-3-voltage');
    validateContractsBundle(withLadder([25]), 'epoch-3-voltage');
    validateContractsBundle(withLadder([25, 25, 25]), 'epoch-3-voltage');

    const bad = [
      [],                                       // an empty ladder prices nothing
      [25, 30, 35, 45, 50, 55, 60],             // more rungs than beacons: the last is unreachable
      [25, 30, 35, 45, 50, 52],                 // off the 5s, against the published `ceil-to-5`
      [25, 30, 35, 45, 50, 55.5],               // gold is whole
      [25, 30, 35, 45, 50, 0],                  // a free beacon is a different mechanic
      [25, 30, 35, 45, 50, -55],                // and a negative one is not a price at all
      [25, 35, 30, 45, 50, 55],                 // a price curve that goes down
      ['25', '30'],                             // strings
      25,                                       // not a list
      { 0: 25 },                                // not a list, the other way
      [25, null, 35],                           // a hole
    ];
    for (const ladder of bad) {
      assert.throws(
        () => validateContractsBundle(withLadder(ladder), 'epoch-3-voltage'),
        (error) => /twist\.economy/.test(error.message),
        `the door must refuse ${JSON.stringify(ladder)} and name twist.economy`,
      );
    }
    // A misspelled field is refused by the section's own allowlist, not silently ignored.
    const misspelled = JSON.parse(JSON.stringify(raw));
    misspelled.contracts.find((entry) => entry.id === OVERRIDE_CONTRACT).twist.economy.beaconLadders = [25];
    assert.throws(() => validateContractsBundle(misspelled, 'epoch-3-voltage'), (error) => /twist\.economy/.test(error.message));
    assert.equal(typeof rungs, 'number');
  });
});

test('the browser applies the same field through the same one call', () => {
  const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8');
  const headless = readFileSync(new URL('../src/sim/HeadlessContractSim.ts', import.meta.url), 'utf8');
  assert.match(game, /this\.buildSystem\.setContractBeaconLadder\(resolveBeaconLadder\(this\.activeContract\.twist\.economy\?\.beaconLadder\)\)/);
  assert.match(headless, /this\.build\.setContractBeaconLadder\(resolveBeaconLadder\(this\.manifest\.twist\.economy\?\.beaconLadder\)\)/);
  // One writer per surface: nothing outside BuildSystem may set a beacon price.
  const writers = [game, headless].flatMap((source) => [...source.matchAll(/setContractBeaconLadder\(/g)]);
  assert.equal(writers.length, 2, 'exactly one ladder call per engine');
  // And `Balance.beacon`'s own numbers stay untouched: the override is per contract, never global.
  const balance = readFileSync(new URL('../src/game/Balance.ts', import.meta.url), 'utf8');
  assert.match(balance, /beacon: \{\n\s*costBase: 25,\n\s*costGrowth: 1\.3,\n\s*maxCount: 6,/);
});
