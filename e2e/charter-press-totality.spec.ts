import { expect, test } from '@playwright/test';
import { listContracts } from '../src/meta/ContractFamilies';
import { importContract } from '../src/charter/CharterSchema';
import { CHARTER_FUZZ_CLOCK, charterMutationArmsForTest } from './charter-press.rig';

const template = listContracts('epoch-1-frontier')[0]!;
const freshCharter = () => importContract(template, { author: 'Fuzz Press', clock: CHARTER_FUZZ_CLOCK });
const fixedRng = () => 0;

test('every ordered pair of charter mutation arms is total', () => {
  const armCount = charterMutationArmsForTest(freshCharter(), fixedRng).length;
  for (let first = 0; first < armCount; first += 1) {
    for (let second = 0; second < armCount; second += 1) {
      const arms = charterMutationArmsForTest(freshCharter(), fixedRng);
      expect(() => {
        arms[first]!();
        arms[second]!();
      }, `mutation arms ${first} then ${second}`).not.toThrow();
    }
  }
});

test('blank briefing goal fires with a briefing and noops after missing briefing', () => {
  let charter = freshCharter();
  let arms = charterMutationArmsForTest(charter, fixedRng);
  expect(arms[3]!()).toBe('blank:briefing.goal');
  expect(charter.contract.briefing.goals[0]).toBe('   ');

  charter = freshCharter();
  arms = charterMutationArmsForTest(charter, fixedRng);
  expect(arms[9]!()).toBe('illegal:missing-briefing');
  expect(arms[3]!()).toBe('noop');
});
