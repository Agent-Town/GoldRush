import { expect, test } from '@playwright/test';
import { listContracts } from '../src/meta/ContractFamilies';
import { importContract } from '../src/charter/CharterSchema';
import { CHARTER_FUZZ_CLOCK, charterMutationArmsForTest } from './charter-press.rig';

const templates = listContracts('epoch-1-frontier');
const freshCharter = (template: (typeof templates)[number]) =>
  importContract(template, { author: 'Fuzz Press', clock: CHARTER_FUZZ_CLOCK });
const rngDraws = [0, 0.5, 0.999] as const;
const fixedRng = () => rngDraws[0];

function mutationArmIndices(): Map<string, number[]> {
  const template = templates.find((candidate) => (candidate.tileParams.buildZones?.length ?? 0) > 0);
  expect(template, 'mutation arm label "illegal:zone-outside-claim" needs a fresh charter with build zones').toBeDefined();
  const armCount = charterMutationArmsForTest(freshCharter(template!), fixedRng).length;
  const indices = new Map<string, number[]>();
  for (let index = 0; index < armCount; index += 1) {
    const label = charterMutationArmsForTest(freshCharter(template!), fixedRng)[index]!();
    indices.set(label, [...(indices.get(label) ?? []), index]);
  }
  for (const [label, matches] of indices) {
    expect(matches, `mutation arm label "${label}" must map to exactly one index`).toHaveLength(1);
  }
  return indices;
}

test('every ordered pair of charter mutation arms is total', () => {
  for (const template of templates) {
    for (const draw of rngDraws) {
      const rng = () => draw;
      const armCount = charterMutationArmsForTest(freshCharter(template), rng).length;
      for (let first = 0; first < armCount; first += 1) {
        for (let second = 0; second < armCount; second += 1) {
          const arms = charterMutationArmsForTest(freshCharter(template), rng);
          expect(() => {
            arms[first]!();
            arms[second]!();
          }, `mutation arms ${first} then ${second}, draw ${draw}, template ${template.id}`).not.toThrow();
        }
      }
    }
  }
});

test('blank briefing goal fires with a briefing and noops after missing briefing', () => {
  const indices = mutationArmIndices();
  const armIndex = (label: string) => {
    const matches = indices.get(label) ?? [];
    expect(matches, `mutation arm label "${label}" must map to exactly one index`).toHaveLength(1);
    return matches[0]!;
  };
  const blankBriefingGoal = armIndex('blank:briefing.goal');
  const missingBriefing = armIndex('illegal:missing-briefing');
  expect(indices.get('noop') ?? [], 'mutation arm label "noop" must not occur on a fresh charter').toHaveLength(0);
  let charter = freshCharter(templates[0]!);
  let arms = charterMutationArmsForTest(charter, fixedRng);
  expect(arms[blankBriefingGoal]!()).toBe('blank:briefing.goal');
  expect(charter.contract.briefing.goals[0]).toBe('   ');

  charter = freshCharter(templates[0]!);
  arms = charterMutationArmsForTest(charter, fixedRng);
  expect(arms[missingBriefing]!()).toBe('illegal:missing-briefing');
  expect(arms[blankBriefingGoal]!()).toBe('noop');
});
