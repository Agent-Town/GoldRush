// THE PER-CONTRACT PURSE GUARD (owner ruling 2026-09-06, verbatim: "a per-contract cap override").
//
// `twist.economy.bankCap` raises ONE contract's purse without touching `Balance.economy.bankCap`,
// so every other map's economy stays byte-identical. Four things can rot, and each has a test:
//
//   1. THE ENGINES DISAGREE. The headless sim and the browser must apply the same number from the
//      same field. The headless half is read straight off the sim; the browser half cannot be
//      constructed in node (it needs a canvas), so it is proved at the SOURCE — `Game.ts` must
//      call `setContractBankCap` with the same `twist.economy?.bankCap` expression, and both must
//      go through `Economy`, which stays the sole gold writer.
//   2. THE DEFAULT DRIFTS. A contract that authors nothing must get EXACTLY
//      `Balance.economy.bankCap` — the control case, and the reason the override is a cap SOURCE
//      (a delta) rather than a second base number.
//   3. THE CARD LIES. The agent view carries `now.gold` but no cap, so a rider learns the purse
//      only from the briefing rules and the mechanics manifest. If the authored number and the
//      published one drift apart, income is refused for a reason nothing on the card explains.
//   4. THE DOOR LETS RUBBISH IN. A fractional, negative or misspelled purse must be refused by
//      `describeContract`, not clamped at runtime.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OVERRIDE_CONTRACT = 'e3-canyon-works';
/** Same epoch, same `twist.powerGrid`, no purse of its own: the control that must not move. */
const CONTROL_CONTRACTS = ['e3-blackout-ridge', 'e1-dry-gulch'];

async function withVite(run) {
  const location = new URL('http://contract-bank-cap.test/?debug');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  try {
    return await run(vite);
  } finally {
    await vite.close();
  }
}

test('both engines take the purse from twist.economy.bankCap, and Economy stays the one writer', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { Economy, CONTRACT_BANK_CAP_SOURCE } = await vite.ssrLoadModule('/src/game/Economy.ts');
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');

    const authored = loadContract(OVERRIDE_CONTRACT).twist.economy?.bankCap;
    assert.equal(typeof authored, 'number', `${OVERRIDE_CONTRACT} must author twist.economy.bankCap`);
    assert.ok(authored > Balance.economy.bankCap, 'an override at or below the default would be a no-op');

    // HEADLESS. `economy` is TypeScript-private, which is a compile-time fence, not a runtime one;
    // reading it here is deliberate, because the only honest proof that the SIM applied the
    // override is the sim's own purse.
    const sim = new HeadlessContractSim({ contractId: OVERRIDE_CONTRACT, seed: 'e3-canyon-works-01', admissionProbe: true });
    assert.equal(sim.economy.bankCap, authored, 'HeadlessContractSim must open the run at the authored purse');
    assert.equal(sim.economy.canReceiveIncome(authored), true);
    assert.equal(sim.economy.canReceiveIncome(authored + 1), false, 'income above the purse is refused');

    // BROWSER, through the shared mechanism: the same call on a bare Economy lands on the same
    // number, and it lands as a cap SOURCE so stockpiles and research still stack on top.
    const economy = new Economy();
    assert.equal(economy.bankCap, Balance.economy.bankCap);
    economy.setContractBankCap(authored);
    assert.equal(economy.bankCap, authored);
    economy.addCapSource('upgrade:stockpile_cap', 40);
    assert.equal(economy.bankCap, authored + 40, 'the contract purse is a starting point, not a ceiling');
    economy.removeCapSource(CONTRACT_BANK_CAP_SOURCE);
    assert.equal(economy.bankCap, Balance.economy.bankCap + 40);

    // A contract that authors nothing gets the default back, exactly.
    economy.removeCapSource('upgrade:stockpile_cap');
    economy.setContractBankCap(undefined);
    assert.equal(economy.bankCap, Balance.economy.bankCap);
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, '360']) {
      economy.setContractBankCap(bad);
      assert.equal(economy.bankCap, Balance.economy.bankCap, `a ${String(bad)} purse must fall back to the default`);
    }
  });
});

test('a contract without the twist opens at exactly Balance.economy.bankCap', async () => {
  await withVite(async (vite) => {
    const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');

    for (const id of CONTROL_CONTRACTS) {
      const contract = loadContract(id);
      assert.equal(contract.twist.economy, undefined, `${id} must not author a purse`);
      const sim = new HeadlessContractSim({ contractId: id, seed: 'bench-001', admissionProbe: true });
      assert.equal(sim.economy.bankCap, Balance.economy.bankCap, `${id} must keep the default purse`);
      const published = deriveMechanicsManifest(contract).rules.filter((rule) => rule.id === 'contract_bank_cap');
      assert.deepEqual(published, [], `${id} must publish no purse rule`);
    }
  });
});

test('the published purse cannot drift from the authored one', async () => {
  await withVite(async (vite) => {
    const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
    const { loadContract } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const { deriveMechanicsManifest } = await vite.ssrLoadModule('/src/agent/MechanicsManifest.ts');

    const contract = loadContract(OVERRIDE_CONTRACT);
    const authored = contract.twist.economy.bankCap;
    const [rule, ...extra] = deriveMechanicsManifest(contract).rules.filter((entry) => entry.id === 'contract_bank_cap');
    assert.deepEqual(extra, [], 'one purse rule, not several');
    assert.equal(rule.source, 'twist.economy.bankCap');
    assert.equal(rule.data.bankCap, authored);
    assert.equal(rule.data.defaultBankCap, Balance.economy.bankCap);

    // The briefing is the human half of the same fact; a rider reads it on the card.
    const stated = contract.briefing.rules.filter((line) => line.includes(String(authored)));
    assert.equal(stated.length, 1, `exactly one briefing rule must state the ${authored} gold purse`);
    assert.ok(stated[0].includes(String(Balance.economy.bankCap)), 'the rule must contrast with the usual purse');
  });
});

test('the door refuses a purse that is not a positive whole number of gold', async () => {
  await withVite(async (vite) => {
    const { validateContractsBundle } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
    const BUNDLE = new URL('../assets/contracts/epoch-3-voltage/contracts.json', import.meta.url);
    const raw = JSON.parse(readFileSync(BUNDLE, 'utf8'));
    const withPurse = (economy) => {
      const next = JSON.parse(JSON.stringify(raw));
      const row = next.contracts.find((entry) => entry.id === OVERRIDE_CONTRACT);
      if (economy === null) delete row.twist.economy;
      else row.twist.economy = economy;
      return next;
    };

    // Controls: the shipped bundle passes, and so does the same bundle with no purse at all.
    validateContractsBundle(raw, 'epoch-3-voltage');
    validateContractsBundle(withPurse(null), 'epoch-3-voltage');
    validateContractsBundle(withPurse({ bankCap: 360 }), 'epoch-3-voltage');

    for (const bad of [{ bankCap: 0 }, { bankCap: -5 }, { bankCap: 12.5 }, { bankCap: '360' }, {}, { bankCap: 360, cap: 1 }, 360, [360]]) {
      assert.throws(
        () => validateContractsBundle(withPurse(bad), 'epoch-3-voltage'),
        (error) => /twist\.economy/.test(error.message),
        `the door must refuse ${JSON.stringify(bad)} and name twist.economy`,
      );
    }
  });
});

test('the browser applies the same field through the same Economy call', () => {
  const game = readFileSync(new URL('../src/game/Game.ts', import.meta.url), 'utf8');
  const headless = readFileSync(new URL('../src/sim/HeadlessContractSim.ts', import.meta.url), 'utf8');
  assert.match(game, /this\.economy\.setContractBankCap\(this\.activeContract\.twist\.economy\?\.bankCap\)/);
  assert.match(headless, /this\.economy\.setContractBankCap\(this\.manifest\.twist\.economy\?\.bankCap\)/);
  // One writer per surface: nothing outside Economy may set a purse.
  const writers = [game, headless].flatMap((source) => [...source.matchAll(/setContractBankCap\(/g)]);
  assert.equal(writers.length, 2, 'exactly one purse call per engine');
});
