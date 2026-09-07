// THE REPAIR_UNDER RADIUS GUARD (ADR-005 stage 2; `docs/bench/rider-parity-audit.md` §3a change 3).
//
// The POLICY NAME was already 1:1 — a human sets "repair under N% HP" in the Prospector panel and a
// rider submits `{ verb: 'REPAIR_UNDER', pct: N }`. The REACH was not. The order's target search was
// `state.buildings.find(...)` with no distance term at all, so it selected the first work anywhere
// on the map below the threshold and its travel clause carried the Prospector there. The human's
// sweep considers only works within `Balance.sparkRig.range` of the Prospector — which drifts to the
// hero and is therefore bounded by where the human walked — and it takes the NEAREST, not the first
// (`Game.nearestProspectorRepairTarget`).
//
// That was the second unfair advantage after `MOVE_TO`, and the bigger one in traffic: 2,561 orders
// across heat 12 against `MOVE_TO`'s 372.
//
// Three things can rot and each has a test:
//   1. THE RADIUS DISAPPEARS. A work outside `Balance.sparkRig.range` must not be selected at all —
//      not selected-and-walked-to, not selected-and-refused: the order simply has no target, exactly
//      as the human's sweep has none.
//   2. THE ORDER STOPS PREFERRING THE NEAREST. Two damaged works in range must select the closer
//      one, because that is what the browser does and a first-match rule is order-dependent.
//   3. THE RADIUS IS RE-TYPED RATHER THAN READ. `Balance.sparkRig.range` is read, never copied: a
//      literal 10 in `StandingOrders.ts` would silently fork the two engines the next time the
//      balance number moves.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (relative) => readFileSync(path.resolve(ROOT, relative), 'utf8');

// ONE vite server for the whole file, loaded at module scope and closed immediately —
// `scripts/skillmd-guard.test.mjs:18-24` does exactly this. A per-test `createServer`/`close` pair
// was tried first and made the FILE fail at process level, non-deterministically and without
// naming a test ('test failed' at :1:1, 2 of 3 runs), while every assertion inside it passed.
// Three servers opened and closed inside one `node --test` process is the defect; one is not.
globalThis.location = new URL('http://repair-under-radius.test/?debug&contract=the-claim');
globalThis.window = { location: globalThis.location };
const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
let StandingOrdersExecutor;
let Balance;
try {
  ({ StandingOrdersExecutor } = await vite.ssrLoadModule('/src/agent/StandingOrders.ts'));
  ({ Balance } = await vite.ssrLoadModule('/src/game/Balance.ts'));
} finally {
  await vite.close();
}

/**
 * The smallest surface that exercises the executor's REPAIR_UNDER branch: a tool surface whose
 * `repair` records what it was asked for, and a state whose `build.hp` carries the damaged works.
 * Nothing here boots a contract — the branch reads `state.buildings` and the actor point and
 * nothing else, so a real sim would only add 600 seconds and a hash to a question about a radius.
 */
function harness(buildings) {
  const repairs = [];
  const surface = {
    permissionLevel: () => 3,
    buildTargetReachable: () => true,
    buildPlacementRadius: () => 1,
    tools: {
      repair: (ref) => {
        repairs.push(ref);
        return { outcome: { ok: true } };
      },
      place_building: () => ({ outcome: { ok: true } }),
      pan_at: () => ({ outcome: { ok: true } }),
    },
  };
  const state = {
    timeAlive: 10,
    runState: 'playing',
    hp: 100,
    maxHp: 100,
    enemiesAlive: 0,
    wave: 3,
    nextWaveInSim: 30,
    spawnDisabled: true,
    economy: { gold: 500 },
    wreck: { hitsResolved: 0 },
    build: { hp: buildings, sluicePositions: [] },
    harvest: { activeNodes: [] },
    agent: { embodiment: { moving: false, drifting: false } },
    progression: { offer: [] },
    run: { pendingSecure: false, secureWindowOpen: false },
  };
  return { surface, state, repairs };
}

const damaged = (id, index, x, z) => ({ id, index, hp: 10, maxHp: 100, wrecked: false, position: { x, z } });

test('REPAIR_UNDER ignores a work outside Balance.sparkRig.range, exactly as the human sweep does', () => {
  {
    const range = Balance.sparkRig.range;

    // One work, just outside the radius measured from the Prospector at the origin.
    const far = harness([damaged('turret', 0, range + 0.5, 0)]);
    const executor = new StandingOrdersExecutor(far.surface, () => far.state);
    assert.equal(executor.submit([{ verb: 'REPAIR_UNDER', pct: 60 }], 10).ok, true);
    for (let step = 0; step < 20; step += 1) executor.tick(10 + step, { x: 0, z: 0 });
    assert.deepEqual(far.repairs, [], 'a work outside the human radius was repaired anyway');
    const record = executor.snapshot().orders[0];
    assert.equal(record.status, 'pending', `an out-of-range REPAIR_UNDER must stay pending, not ${record.status}`);

    // The same work, just inside it: the order must find and repair it.
    const near = harness([damaged('turret', 0, range - 0.5, 0)]);
    const inRange = new StandingOrdersExecutor(near.surface, () => near.state);
    assert.equal(inRange.submit([{ verb: 'REPAIR_UNDER', pct: 60 }], 10).ok, true);
    for (let step = 0; step < 40; step += 1) inRange.tick(10 + step, { x: range - 0.5, z: 0 });
    assert.deepEqual(near.repairs, [{ id: 'turret', index: 0 }], 'a work inside the human radius was not repaired');
  }
});

test('REPAIR_UNDER takes the NEAREST match, not the first in the list', () => {
  {
    // Declared far-first so a `find()` would take the far one; the browser takes the near one.
    const world = harness([damaged('turret', 0, 8, 0), damaged('sentry_beacon', 1, 1.0, 0)]);
    const executor = new StandingOrdersExecutor(world.surface, () => world.state);
    assert.equal(executor.submit([{ verb: 'REPAIR_UNDER', pct: 60 }], 10).ok, true);
    for (let step = 0; step < 40; step += 1) executor.tick(10 + step, { x: 1.0, z: 0 });
    assert.equal(world.repairs.length > 0, true, 'the nearest damaged work was never repaired');
    assert.deepEqual(world.repairs[0], { id: 'sentry_beacon', index: 1 },
      'REPAIR_UNDER repaired the first match rather than the nearest');
  }
});

test('the radius is READ off Balance, never re-typed into the door', () => {
  const source = read('src/agent/StandingOrders.ts');
  const branch = source.slice(source.indexOf("if (order.verb === 'REPAIR_UNDER')"), source.indexOf("if (order.verb === 'MOVE_HERO')"));
  assert.ok(branch.includes('Balance.sparkRig.range'),
    'the REPAIR_UNDER branch must read Balance.sparkRig.range — the human sweep reads the same field');
  assert.doesNotMatch(branch, /\b10(\.0+)?\b/,
    'the REPAIR_UNDER branch carries a bare number where the balance field belongs');
});
