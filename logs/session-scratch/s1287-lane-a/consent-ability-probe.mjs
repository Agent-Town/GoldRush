import assert from 'node:assert/strict';
import { __probePermissionDenial as permissionDenial } from '../../../src/agent/StandingOrders.ts';

const mode = process.argv[2] ?? 'before';
const order = {
  BUILD: { verb: 'BUILD', what: 'palisade', where: { x: 2, z: 2 }, when: { goldGte: 10 } },
  REPAIR_UNDER: { verb: 'REPAIR_UNDER', pct: 50 },
};
const denial = (verb, allowed) =>
  permissionDenial(
    order[verb],
    {
      consent: {
        rungs: { 3: { earned: true, granted: true }, 2: { earned: true, granted: true } },
        abilities: { place_building: { allowed }, auto_repair: { allowed } },
      },
    },
    3,
  );

const cells = {
  buildRevoked: denial('BUILD', false),
  buildGranted: denial('BUILD', true),
  repairRevoked: denial('REPAIR_UNDER', false),
  repairGranted: denial('REPAIR_UNDER', true),
};

assert.equal(cells.buildGranted, null);
assert.equal(cells.repairRevoked, 'REPAIR_UNDER requires the granted auto_repair ability.');
assert.equal(cells.repairGranted, null);
assert.equal(
  cells.buildRevoked,
  mode === 'before' ? null : 'BUILD requires the granted place_building ability.',
);
console.log(JSON.stringify(cells, null, 2));
