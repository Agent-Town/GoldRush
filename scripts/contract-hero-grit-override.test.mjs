// THE CLAIM GRIT GUARD (owner ruling 2026-09-06, verbatim: "lets adjust the policy so the hard
// levels can be won").
//
// `twist.hero.maxHpBonus` raises ONE contract's hero ceiling without touching `Balance.hero.maxHp`,
// so every other map's hero stays byte-identical. Five things can rot, and each has a test:
//
//   1. THE ENGINES DISAGREE. The sim and the browser must apply the same number from the same
//      field. Both call ONE exported reader, `contractHeroMaxHpBonus`; the headless half is read
//      off a live sim, and the browser half cannot be constructed in node (it needs a canvas), so
//      it is proved at the SOURCE — `Game.applyStats` must call the same reader on
//      `this.activeContract` and hand the sum to `actor.applyStats`.
//   2. THE DEFAULT DRIFTS. A contract that authors nothing must open at EXACTLY
//      `Balance.hero.maxHp`, publish no rule, and be byte-unchanged.
//   3. THE GRIT RATCHETS. This is not hypothetical: `HeadlessContractSim` clamps the hero's bonus
//      with `Math.max(stats.maxHpBonus, hero.maxHp - Balance.hero.maxHp)`, so a grit folded INSIDE
//      that clamp is re-read on every stat change and compounds. Measured during authoring: a
//      +70 grit reached a 1990 ceiling by wave 20 (F-RVW-1). The test drives real level-ups and
//      asserts the ceiling is base + grit + upgrade bonus and nothing more.
//   4. THE CARD LIES. The agent view carries `now.hero.maxHp` but no basis, so a rider cannot tell
//      an authored ceiling from three `tinkers_plating` stacks. If the authored number and the
//      published one drift apart, the rider's whole survival budget is wrong.
//   5. THE DOOR LETS RUBBISH IN. A fractional, negative, oversized or misspelled grit must be
//      refused by the door, not clamped at runtime.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OVERRIDE_CONTRACT = 'e7-relay-valley';
/** Same epoch, same signal composition, no grit of their own: the controls that must not move. */
const CONTROL_CONTRACTS = ['e7-echo-canyon', 'e7-dead-band', 'e1-dry-gulch'];

async function withVite(run) {
  const location = new URL('http://contract-hero-grit.test/?debug');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  try {
    return await run(vite);
  } finally {
    await vite.close();
  }
}

test('one reader serves both engines, and the sim opens the run at the authored ceiling', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { contractHeroMaxHpBonus, loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');

    const contract = loadContract(OVERRIDE_CONTRACT);
    const authored = contract.twist.hero?.maxHpBonus;
    assert.equal(typeof authored, 'number', `${OVERRIDE_CONTRACT} must author twist.hero.maxHpBonus`);
    assert.ok(authored > 0, 'a grit at or below zero would be a no-op');
    assert.equal(contractHeroMaxHpBonus(contract), authored, 'the shared reader must return the authored grit');

    // The reader is the whole contract between the engines, so it must refuse rubbish by itself:
    // a run can be booted from a tape or a room whose manifest never passed the door.
    for (const bad of [0, -1, 12.5, 1001, Number.NaN, Number.POSITIVE_INFINITY, '300', null]) {
      assert.equal(contractHeroMaxHpBonus({ twist: { hero: { maxHpBonus: bad } } }), 0, `a ${String(bad)} grit must read as 0`);
    }
    assert.equal(contractHeroMaxHpBonus({ twist: {} }), 0, 'no twist section reads as 0');

    // HEADLESS. `hero` is TypeScript-private, which is a compile-time fence, not a runtime one;
    // reading it here is deliberate, because the only honest proof that the SIM applied the grit
    // is the sim's own hero — and it must stand up at FULL hit points, not at 100 of 400.
    const sim = new HeadlessContractSim({ contractId: OVERRIDE_CONTRACT, seed: 'e7-relay-valley-01', admissionProbe: true });
    assert.equal(sim.hero.maxHp, Balance.hero.maxHp + authored, 'the sim must open at base + grit');
    assert.equal(sim.hero.hp, sim.hero.maxHp, 'the grit is paid in hit points at run start, not only in ceiling');
  });
});

test('the grit does not ratchet as upgrades land, and upgrades still raise the ceiling', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { contractHeroMaxHpBonus, loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { effectiveStats } = await vite.ssrLoadModule('/src/game/StatSheet.ts');
    const { upgradeDefById } = await vite.ssrLoadModule('/src/game/Upgrades.ts');

    const grit = contractHeroMaxHpBonus(loadContract(OVERRIDE_CONTRACT));
    const plating = upgradeDefById.tinkers_plating;
    const sim = new HeadlessContractSim({ contractId: OVERRIDE_CONTRACT, seed: 'e7-relay-valley-01', admissionProbe: true });

    // Re-sync ten times with no upgrades at all. A grit folded inside the never-shrink clamp
    // compounds here; this one must not move by a single hit point.
    for (let i = 0; i < 10; i += 1) sim.applyProgressionStats(effectiveStats({}), null);
    assert.equal(sim.hero.maxHp, Balance.hero.maxHp + grit, 'ten idle re-syncs must leave the ceiling exactly where it was');

    // Now stack the one upgrade that raises the ceiling, and re-sync between each. The ceiling
    // must be base + grit + upgrade bonus — the grit neither swallows the upgrade nor doubles.
    for (let stacks = 1; stacks <= plating.maxStacks; stacks += 1) {
      const stats = effectiveStats({ tinkers_plating: stacks });
      sim.applyProgressionStats(stats, 'tinkers_plating');
      sim.applyProgressionStats(stats, null);
      assert.equal(
        sim.hero.maxHp,
        Balance.hero.maxHp + grit + stats.maxHpBonus,
        `with ${stacks} plating stacks the ceiling must be base + grit + ${stats.maxHpBonus}`,
      );
    }
  });
});

test('a contract without the twist opens at exactly Balance.hero.maxHp and publishes no rule', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { contractHeroMaxHpBonus, loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');

    for (const id of CONTROL_CONTRACTS) {
      const contract = loadContract(id);
      assert.equal(contract.twist.hero, undefined, `${id} must not author a grit`);
      assert.equal(contractHeroMaxHpBonus(contract), 0, `${id} must read as 0`);
      const sim = new HeadlessContractSim({ contractId: id, seed: 'bench-001', admissionProbe: true });
      assert.equal(sim.hero.maxHp, Balance.hero.maxHp, `${id} must keep the default hero ceiling`);
      assert.equal(sim.hero.hp, Balance.hero.maxHp, `${id} must keep the default starting hit points`);
      const published = deriveMechanicsManifest(contract).rules.filter((entry) => entry.id === 'contract_hero_grit');
      assert.deepEqual(published, [], `${id} must publish no grit rule`);
    }
  });
});

test('the published grit cannot drift from the authored one', async () => {
  await withVite(async (vite) => {
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');

    const contract = loadContract(OVERRIDE_CONTRACT);
    const authored = contract.twist.hero.maxHpBonus;
    const [rule, ...extra] = deriveMechanicsManifest(contract).rules.filter((entry) => entry.id === 'contract_hero_grit');
    assert.deepEqual(extra, [], 'one grit rule, not several');
    assert.equal(rule.source, 'twist.hero.maxHpBonus');
    assert.equal(rule.data.maxHpBonus, authored);
    assert.equal(rule.data.heroMaxHp, Balance.hero.maxHp + authored);
    assert.equal(rule.data.defaultHeroMaxHp, Balance.hero.maxHp);

    // The briefing is the human half of the same fact; a rider reads it on the card. It states the
    // CEILING, not the bonus, because that is the number the view shows back as `hero.maxHp`.
    const ceiling = String(Balance.hero.maxHp + authored);
    const stated = contract.briefing.rules.filter((line) => line.includes(ceiling));
    assert.equal(stated.length, 1, `exactly one briefing rule must state the ${ceiling} hit-point ceiling`);
    assert.ok(stated[0].includes(String(Balance.hero.maxHp)), 'the rule must contrast with the usual ceiling');
  });
});

test('the door refuses a grit that is not a positive whole number of hit points', async () => {
  await withVite(async (vite) => {
    const { validateContractsBundle } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const BUNDLE = new URL('../assets/contracts/epoch-7-signal/contracts.json', import.meta.url);
    const raw = JSON.parse(readFileSync(BUNDLE, 'utf8'));
    const withGrit = (hero) => {
      const next = JSON.parse(JSON.stringify(raw));
      const row = next.contracts.find((entry) => entry.id === OVERRIDE_CONTRACT);
      if (hero === null) delete row.twist.hero;
      else row.twist.hero = hero;
      return next;
    };

    // Controls: the shipped bundle passes, and so does the same bundle with no grit at all.
    validateContractsBundle(raw, 'epoch-7-signal');
    validateContractsBundle(withGrit(null), 'epoch-7-signal');
    validateContractsBundle(withGrit({ maxHpBonus: 300 }), 'epoch-7-signal');

    const rubbish = [
      { maxHpBonus: 0 }, { maxHpBonus: -5 }, { maxHpBonus: 12.5 }, { maxHpBonus: 1001 },
      { maxHpBonus: '300' }, {}, { maxHpBonus: 300, hp: 1 }, 300, [300],
    ];
    for (const bad of rubbish) {
      assert.throws(
        () => validateContractsBundle(withGrit(bad), 'epoch-7-signal'),
        (error) => /twist\.hero/.test(error.message),
        `the door must refuse ${JSON.stringify(bad)} and name twist.hero`,
      );
    }
  });
});

test('both engines apply the same field through the same reader', () => {
  const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8');
  const headless = readFileSync(new URL('../src/sim/HeadlessContractSim.ts', import.meta.url), 'utf8');
  assert.match(game, /const grit = contractHeroMaxHpBonus\(this\.activeContract\);/);
  assert.match(game, /actor\.applyStats\(stats\.maxHpBonus \+ grit, stats\.moveSpeedMult\);/);
  assert.match(headless, /const grit = contractHeroMaxHpBonus\(this\.manifest\);/);
  assert.match(headless, /this\.hero\.applyStats\(Math\.max\(stats\.maxHpBonus, this\.hero\.maxHp - Balance\.hero\.maxHp - grit\) \+ grit, stats\.moveSpeedMult\);/);
  // One reader per surface: nothing else may compute a contract hero ceiling.
  const readers = [game, headless].flatMap((source) => [...source.matchAll(/contractHeroMaxHpBonus\(/g)]);
  assert.equal(readers.length, 2, 'exactly one grit read per engine');
  // And `Balance.hero.maxHp` itself is untouched — the grit is a per-contract delta, never a
  // new global base.
  const balance = readFileSync(new URL('../src/game/Balance.ts', import.meta.url), 'utf8');
  assert.match(balance, /^ {4}maxHp: 100,$/m, 'Balance.hero.maxHp must stay 100');
});
