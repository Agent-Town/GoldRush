import assert from 'node:assert/strict';
import test from 'node:test';
import benchSeeds from '../assets/contracts/bench-seeds.json' with { type: 'json' };
import atomicContracts from '../assets/contracts/epoch-6-atomic/contracts.json' with { type: 'json' };
import deepwaterContracts from '../assets/contracts/epoch-5-deepwater/contracts.json' with { type: 'json' };
import deepskyContracts from '../assets/contracts/epoch-10-deepsky/contracts.json' with { type: 'json' };
import frontierContracts from '../assets/contracts/epoch-1-frontier/contracts.json' with { type: 'json' };
import motorContracts from '../assets/contracts/epoch-4-motor/contracts.json' with { type: 'json' };
import orbitalContracts from '../assets/contracts/epoch-8-orbital/contracts.json' with { type: 'json' };
import redfieldsContracts from '../assets/contracts/epoch-9-redfields/contracts.json' with { type: 'json' };
import signalContracts from '../assets/contracts/epoch-7-signal/contracts.json' with { type: 'json' };
import steamworksContracts from '../assets/contracts/epoch-2-steamworks/contracts.json' with { type: 'json' };
import voltageContracts from '../assets/contracts/epoch-3-voltage/contracts.json' with { type: 'json' };

const bundles = [
  frontierContracts,
  steamworksContracts,
  voltageContracts,
  motorContracts,
  deepwaterContracts,
  atomicContracts,
  signalContracts,
  orbitalContracts,
  redfieldsContracts,
  deepskyContracts,
];
const allContractIds = bundles.flatMap((bundle) => bundle.contracts.map((contract) => contract.id));
const knownContractIds = new Set(allContractIds);

// F-1222-2 (s1222). bench-seeds.json keys on `contractId` ALONE, but the server validates
// with knownContract(epochId, contractId) — a PAIR. That lookup is only sound because no
// contract id appears in two epochs (measured s1222: 41 ids, 0 duplicated). Nothing asserted
// it, and the Set above *assumes* the property rather than checking it: if a later epoch ever
// reuses an id, two epochs would silently share one frozen seed set — exactly the
// comparability property specs/agent-play/README.md:61 exists to protect — and every other
// assertion here would stay green. So the assumption becomes a guard.
test('contract ids are globally unique across the ten epoch bundles', () => {
  const duplicates = allContractIds.filter((id, index) => allContractIds.indexOf(id) !== index);
  assert.deepEqual(
    duplicates,
    [],
    `bench-seeds.json keys on contractId alone; these ids appear in more than one epoch: ${duplicates.join(', ')}`,
  );
  assert.equal(knownContractIds.size, allContractIds.length);
});

test('bench seed sets cover Frontier and contain only valid known-contract seeds', () => {
  for (const { id: contractId } of frontierContracts.contracts) {
    assert.ok(Object.hasOwn(benchSeeds, contractId), `${contractId} needs a bench seed set`);
  }
  for (const [contractId, seeds] of Object.entries(benchSeeds)) {
    assert.ok(knownContractIds.has(contractId), `${contractId} is not a known contract`);
    assert.ok(Array.isArray(seeds) && seeds.length > 0, `${contractId} needs at least one seed`);
    assert.equal(new Set(seeds).size, seeds.length, `${contractId} has duplicate seeds`);
    for (const seed of seeds) {
      assert.equal(typeof seed, 'string', `${contractId} contains a non-string seed`);
      assert.ok(seed.length > 0 && seed.length <= 256, `${contractId} contains an invalid seed`);
    }
  }
});
