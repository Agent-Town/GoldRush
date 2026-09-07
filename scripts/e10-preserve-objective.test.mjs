import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const seed = 'e10-preserve-gate';
const harvest = (seam, count) => Array.from({ length: count }, () => ({ verb: 'HARVEST', seam }));

async function loadSim() {
  const location = new URL(`http://e10-preserve-objective.test/?debug&contract=e10-last-claim&seed=${seed}`);
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  return { HeadlessContractSim, close: () => vite.close() };
}

function submit(sim, orders) {
  const receipt = sim.submitOrders(orders);
  assert.equal(receipt.outcome.ok, true, receipt.outcome.message);
}

function ride(HeadlessContractSim, orders) {
  const sim = new HeadlessContractSim({ contractId: 'e10-last-claim', seed });
  submit(sim, orders);
  let turn = sim.currentTurn();
  for (let decisions = 0; decisions < 500 && !turn.terminal; decisions += 1) {
    turn = sim.advanceToTurn();
    if (turn.view.now.pendingSecure) {
      submit(sim, [{ verb: 'SECURE_CHOICE', choice: 'bank' }]);
    }
  }
  assert.equal(turn.terminal, true, 'ride did not terminate');
  return { outcome: sim.outcome(), view: turn.view };
}

/**
 * RE-DERIVED 2026-09-07 (`rider-parity-grammar-stage3` B, ADR-005). Both plans used to end with
 * `HOLD` at the preserve, a verb that pinned the PROSPECTOR on the monument while the hero stayed
 * where it spawned. No human has that control, so both plans now end with `MOVE_HERO` at the same
 * point: the RIDER stands on the preserve and the Prospector drifts in behind it. Same seed, same
 * two plans, same verdicts — the extract ride still loses the monument and the defend ride still
 * secures at wave 8. Only the bodies moved, so only the hashes moved, and each carries that cause.
 */
test('the Last Claim flips extraction into a preserve objective', async () => {
  const { HeadlessContractSim, close } = await loadSim();
  try {
    const extractOrders = [
      ...harvest('gold-seam-2', 6),
      ...harvest('gold-seam-1', 6),
      { verb: 'MOVE_HERO', pos: { x: 0, z: 50 } },
    ];
    const extract = ride(HeadlessContractSim, extractOrders);
    assert.equal(extract.outcome.secured, false);
    assert.equal(extract.outcome.endReason, 'preserve_fell');
    assert.equal(extract.outcome.eventLogHash, 'fnv1a32:9b133c8d');
    assert.deepEqual(extract.view.now.preserve, { hp: 0, maxHp: 360, alive: false });
    assert.deepEqual(ride(HeadlessContractSim, extractOrders).outcome, extract.outcome);

    const defendOrders = [
      { verb: 'BUILD', what: 'turret', where: { x: 0, z: 46 }, when: { goldGte: 50 } },
      { verb: 'BUILD', what: 'turret', where: { x: -6, z: 48 }, when: { goldGte: 70 } },
      { verb: 'BUILD', what: 'turret', where: { x: 6, z: 48 }, when: { goldGte: 95 } },
      { verb: 'REPAIR_UNDER', pct: 70 },
      ...harvest('gold-seam-2', 10),
      ...harvest('gold-seam-1', 10),
      { verb: 'MOVE_HERO', pos: { x: 0, z: 50 } },
    ];
    const defend = ride(HeadlessContractSim, defendOrders);
    assert.equal(defend.outcome.secured, true);
    assert.equal(defend.outcome.waves, 8);
    assert.equal(defend.outcome.eventLogHash, 'fnv1a32:3eec9b2b');
    assert.equal(defend.view.now.preserve?.alive, true);
    assert.deepEqual(ride(HeadlessContractSim, defendOrders).outcome, defend.outcome);

    console.log(JSON.stringify({ extract: extract.outcome, defend: defend.outcome }));
  } finally {
    await close();
  }
});
