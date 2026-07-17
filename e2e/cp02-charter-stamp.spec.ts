import { expect, test } from '@playwright/test';
import { contractDescriptorJson, listContracts } from '../src/meta/ContractFamilies';
import { importContract, parseCharter, charterJson } from '../src/charter/CharterSchema';
import { stampCharter } from '../src/charter/CharterStamp';
import { CHARTER_FUZZ_CLOCK, charterMutants } from './charter-press.rig';

// CP-02 THE VALIDATOR GATE: stampCharter's preflight is property-tested, not
// example-tested. Every seeded mutant either stamps (and the boot spec proves
// it boots) or is rejected with a human-readable reason.
const E1 = listContracts('epoch-1-frontier');
const CLOCK = CHARTER_FUZZ_CLOCK;
const FUZZ_COUNT = 200;
const PROSE = /^[A-Z].*\.$/;

function freshCharter(contractId: string) {
  const contract = E1.find((entry) => entry.id === contractId)!;
  return importContract(contract, { author: 'Press Engineer', clock: CLOCK });
}

test('every shipped E1 contract stamps clean and byte-identical', () => {
  for (const contract of E1) {
    const result = stampCharter(importContract(contract, { author: 'Press Engineer', clock: CLOCK }));
    expect(result.ok, contract.id).toBe(true);
    if (result.ok) expect(result.document).toBe(contractDescriptorJson(contract));
  }
});

test('a stamped document re-stamps to the same bytes', () => {
  const charter = freshCharter('e1-twin-banks');
  charter.contract.name = 'Twin Banks, Re-pressed';
  const first = stampCharter(charter);
  expect(first.ok).toBe(true);
  if (!first.ok) return;
  const again = stampCharter({ envelope: charter.envelope, contract: first.contract });
  expect(again.ok).toBe(true);
  if (again.ok) expect(again.document).toBe(first.document);
});

const REJECTIONS: Array<{ name: string; code: string; mutate: (charter: ReturnType<typeof freshCharter>) => void }> = [
  {
    name: 'closing every spawn edge',
    code: 'spawn_edge_required',
    mutate: (charter) => {
      charter.contract.tileParams.lanes.spawnEdges = [];
    },
  },
  {
    name: 'blanking a briefing goal',
    code: 'briefing_blank',
    mutate: (charter) => {
      charter.contract.briefing.goals[0] = '   ';
    },
  },
  {
    name: 'moving a build zone beyond the claim stakes',
    code: 'build_zone_outside_claim',
    mutate: (charter) => {
      const zone = charter.contract.tileParams.buildZones![0]!;
      zone.minX += 100;
      zone.maxX += 100;
    },
  },
  {
    name: 'carrying an unknown field',
    code: 'field_unknown',
    mutate: (charter) => {
      (charter.contract as unknown as Record<string, unknown>).pressMark = 'unknown';
    },
  },
  {
    name: 'forking the contract id',
    code: 'contract_id',
    mutate: (charter) => {
      (charter.contract as unknown as { id: string }).id = 'e1-twin-banks-forked';
    },
  },
  {
    name: 'pressing without an author',
    code: 'envelope_author',
    mutate: (charter) => {
      charter.envelope.provenance = { ...charter.envelope.provenance, author: '  ' };
    },
  },
  {
    name: 'pressing an unopened palette',
    code: 'palette_unopened',
    mutate: (charter) => {
      charter.envelope.paletteId = 'epoch-9-redfields';
    },
  },
  {
    name: 'pressing with a torn date',
    code: 'envelope_created',
    mutate: (charter) => {
      charter.envelope.provenance = { ...charter.envelope.provenance, createdAt: 'not a date' };
    },
  },
  {
    name: 'pressing with no lineage',
    code: 'envelope_lineage',
    mutate: (charter) => {
      charter.envelope.provenance = { ...charter.envelope.provenance, lineage: [] };
    },
  },
  {
    name: 'pressing a lawless seed policy',
    code: 'envelope_seed',
    mutate: (charter) => {
      (charter.envelope as unknown as Record<string, unknown>).seedPolicy = { mode: 'chaos' };
    },
  },
];

for (const rejection of REJECTIONS) {
  test(`rejects ${rejection.name}`, () => {
    const charter = freshCharter('e1-twin-banks');
    rejection.mutate(charter);
    const result = stampCharter(charter);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reasons.map((reason) => reason.code)).toContain(rejection.code);
    for (const reason of result.reasons) expect(reason.message, reason.code).toMatch(PROSE);
  });
}

test(`property fuzz: ${FUZZ_COUNT} seeded mutants all stamp or carry prose reasons`, () => {
  const mutants = charterMutants(E1, FUZZ_COUNT);
  expect(mutants).toHaveLength(FUZZ_COUNT);
  let stamped = 0;
  let rejected = 0;
  const verdicts: string[] = [];
  for (const mutant of mutants) {
    const result = stampCharter(mutant.charter);
    verdicts.push(`${mutant.index}:${result.ok ? 'ok' : result.reasons.map((reason) => reason.code).join(',')}`);
    if (result.ok) {
      stamped += 1;
      expect(result.document.endsWith('\n'), `${mutant.index} document canonical`).toBe(true);
      continue;
    }
    rejected += 1;
    expect(result.reasons.length, `${mutant.index} ${mutant.labels.join(' ')}`).toBeGreaterThan(0);
    for (const reason of result.reasons) {
      expect(reason.message, `${mutant.index} ${reason.code}`).toMatch(PROSE);
      expect(reason.message).not.toContain('undefined');
    }
  }
  expect(stamped, 'the mutation menu must exercise the stamped class').toBeGreaterThan(0);
  expect(rejected, 'the mutation menu must exercise the rejected class').toBeGreaterThan(0);

  const rerun = charterMutants(E1, FUZZ_COUNT);
  expect(rerun.map((mutant) => charterJson(mutant.charter))).toEqual(mutants.map((mutant) => charterJson(mutant.charter)));
  const rerunVerdicts = rerun.map((mutant) => {
    const result = stampCharter(mutant.charter);
    return `${mutant.index}:${result.ok ? 'ok' : result.reasons.map((reason) => reason.code).join(',')}`;
  });
  expect(rerunVerdicts).toEqual(verdicts);
  test.info().annotations.push({ type: 'fuzz-distribution', description: `stamped=${stamped} rejected=${rejected} of ${FUZZ_COUNT}` });
});

test('a stamped mutant survives the shelf round-trip', () => {
  const mutants = charterMutants(E1, FUZZ_COUNT);
  const first = mutants.find((mutant) => stampCharter(mutant.charter).ok);
  expect(first).toBeTruthy();
  if (!first) return;
  const parsed = parseCharter(charterJson(first.charter));
  expect(parsed.ok).toBe(true);
  if (parsed.ok) expect(charterJson(parsed.charter)).toBe(charterJson(first.charter));
});
