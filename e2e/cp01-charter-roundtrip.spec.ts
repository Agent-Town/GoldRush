import { expect, test } from '@playwright/test';
import {
  contractDescriptorJson,
  listContracts,
  parseContractDescriptor,
} from '../src/meta/ContractFamilies';
import {
  CHARTER_PALETTE_V1,
  charterJson,
  charterLineageRootId,
  charterTemplate,
  compileCharter,
  compiledCharterJson,
  importContract,
  parseCharter,
} from '../src/charter/CharterSchema';

// CP-01 THE ROUND-TRIP GATE: every shipped E1 contract imported as a charter
// and re-compiled must emerge byte-equivalent after canonical serialization,
// including the stricter loop through the descriptor gate — the exact path a
// stamped charter takes at launch. A field that cannot survive this loop is a
// named finding, never a format fork.
const CLOCK = () => '2026-07-17T00:00:00.000Z';
const E1_CONTRACTS = listContracts('epoch-1-frontier');

test.describe('CP-01 round-trip gate', () => {
  test('the epoch ships the five expected fixtures', () => {
    expect(E1_CONTRACTS.map((contract) => contract.id)).toEqual([
      'the-claim',
      'e1-dry-gulch',
      'e1-night-shift',
      'e1-twin-banks',
      'e1-baron',
    ]);
  });

  for (const contract of E1_CONTRACTS) {
    test(`round-trip: ${contract.id}`, () => {
      const source = contractDescriptorJson(contract);
      const charter = importContract(contract, { author: 'Press Engineer', clock: CLOCK });

      const compiled = compileCharter(charter);
      expect(contractDescriptorJson(compiled)).toBe(source);
      expect(compiledCharterJson(charter)).toBe(source);
      expect(compiled).toEqual(JSON.parse(source));

      const gated = parseContractDescriptor(contractDescriptorJson(compiled), contract);
      expect(gated.ok, JSON.stringify(gated)).toBe(true);
      if (gated.ok) expect(contractDescriptorJson(gated.contract)).toBe(source);

      const shelved = parseCharter(charterJson(charter));
      expect(shelved.ok, JSON.stringify(shelved)).toBe(true);
      if (shelved.ok) {
        expect(charterJson(shelved.charter)).toBe(charterJson(charter));
        expect(contractDescriptorJson(compileCharter(shelved.charter))).toBe(source);
      }
    });
  }

  test('the envelope stays outside the contract format', () => {
    const contract = E1_CONTRACTS[0]!;
    const charter = importContract(contract, { author: 'Press Engineer', clock: CLOCK });
    const compiled = compileCharter(charter) as unknown as Record<string, unknown>;
    expect(Object.keys(compiled)).toEqual(Object.keys(contract));
    expect(Object.hasOwn(compiled, 'envelope')).toBe(false);
    expect(charter.envelope).toEqual({
      version: 1,
      provenance: { author: 'Press Engineer', createdAt: '2026-07-17T00:00:00.000Z', lineage: [contract.id] },
      seedPolicy: { mode: 'inherit' },
      paletteId: CHARTER_PALETTE_V1,
    });
    expect(charterLineageRootId(charter)).toBe(contract.id);
    expect(charterTemplate(charter)?.id).toBe(contract.id);
  });

  test('editing the charter contract does not disturb the source contract', () => {
    const contract = E1_CONTRACTS[0]!;
    const source = contractDescriptorJson(contract);
    const charter = importContract(contract, { author: 'Press Engineer', clock: CLOCK });
    charter.contract.name = 'The Claim, Re-pressed';
    expect(contractDescriptorJson(contract)).toBe(source);
    expect(compiledCharterJson(charter)).not.toBe(source);
  });

  test('a damaged shelf record is rejected with prose reasons', () => {
    for (const text of ['not json', '{"envelope":{},"contract":{}}', '[]', '{"contract":{}}']) {
      const parsed = parseCharter(text);
      expect(parsed.ok).toBe(false);
      if (!parsed.ok) {
        expect(parsed.reasons.length).toBeGreaterThan(0);
        for (const reason of parsed.reasons) expect(reason.message).toMatch(/^[A-Z].*\.$/);
      }
    }
    const charter = importContract(E1_CONTRACTS[0]!, { author: 'Press Engineer', clock: CLOCK });
    const orphaned = charterJson({
      ...charter,
      envelope: {
        ...charter.envelope,
        provenance: { ...charter.envelope.provenance, lineage: ['no-such-contract'] },
      },
    });
    const parsed = parseCharter(orphaned);
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.reasons[0]?.code).toBe('charter_lineage_unknown');
  });
});
