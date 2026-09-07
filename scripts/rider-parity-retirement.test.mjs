import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

/**
 * ADR-005 STAGE 3 — THE THREE POSITIONING VERBS ARE GONE, AND THE TAPES THAT USED THEM RETIRE.
 *
 * Owner ruling 2026-09-07, verbatim (`docs/decisions/ADR-005-rider-parity.md`): "Humans cannot
 * control the positioning of the Prospector, just the rider, for the Prospector they can give
 * 'policies' like repair. This has to be 1:1 the same for the AI. There cannot be an unfair
 * advantage here of it being able to control the Prospector like the rider and the human cant."
 *
 * `MOVE_TO`, `HOLD` and `FALLBACK_IF` positioned the Prospector. They are removed from the
 * `StandingOrder` union, from `validateOrder`, from `standingOrderIdentity` and from the executor.
 * This guard holds two things a reader would otherwise have to take on trust:
 *
 * 1. THE DOOR REFUSES THEM, and refuses them the ORDINARY way. No special case was added for a
 *    retired tape (the master forbids one): the union's tail already answers
 *    `orders[i].verb "<VERB>" is unknown.` for anything it does not know, and `submit` rejects the
 *    WHOLE array on the first refusal because order arrays replace rather than merge. So a retired
 *    tape does not diverge mid-run — the run never starts.
 *
 * 2. THE LEDGER IS TRUE. `artifacts/rider-parity-grammar/retirement-ledger.json` was computed
 *    BEFORE the removal landed, from the submission text alone, and it records for each of the 57
 *    retired heat-12 tapes the first submission that would be refused, its tick, the offending
 *    order's index and the message verbatim. This guard replays that prediction against the LANDED
 *    door: it takes every retired row, hands `validateStandingOrders` the exact submission the
 *    ledger points at, and asserts the door answers the exact message the ledger recorded. A ledger
 *    that quietly stopped matching the door would be a retirement nobody could audit.
 *
 * RETENTION LAW (CLAUDE.md 4.10b): nothing here deletes a tape, a ride directory or a board row.
 * The tapes stay on disk exactly as they were; what changed is that the door no longer accepts them.
 */

const root = fileURLToPath(new URL('..', import.meta.url));
const LEDGER = JSON.parse(readFileSync(path.join(root, 'artifacts/rider-parity-grammar/retirement-ledger.json'), 'utf8'));
const REMOVED = ['MOVE_TO', 'HOLD', 'FALLBACK_IF'];

async function door() {
  const location = new URL('http://rider-parity-retirement.test/?debug&contract=the-claim&seed=e1-the-claim-01');
  globalThis.location = location;
  globalThis.window = { location };
  const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
  const quiet = { log: console.log, info: console.info, debug: console.debug };
  console.log = console.info = console.debug = () => undefined;
  try {
    return { orders: await vite.ssrLoadModule('/src/agent/StandingOrders.ts'), close: () => vite.close() };
  } finally {
    Object.assign(console, quiet);
  }
}

/** The submission the ledger says is refused first, read back out of the tape it names. */
function firstRefusedSubmission(row) {
  const tape = JSON.parse(readFileSync(path.join(root, row.file), 'utf8'));
  const entry = tape.inputLog.entries.find(({ t }) => t === row.firstRefusal.tick);
  assert.ok(entry, `${row.ride}/${row.tape}: the ledger names tick ${row.firstRefusal.tick}, which the tape does not carry`);
  const orders = entry.a.map(({ orders: submitted }) => submitted).find((submitted) => Array.isArray(submitted));
  assert.ok(orders, `${row.ride}/${row.tape}: no order array at tick ${row.firstRefusal.tick}`);
  return orders;
}

test('the three positioning verbs are unknown to the landed door', async () => {
  const { orders, close } = await door();
  try {
    const { validateStandingOrders } = orders;
    // The ordinary refusal, one verb at a time, with the ordinary message.
    for (const verb of REMOVED) {
      const submission = verb === 'FALLBACK_IF'
        ? [{ verb, threat: { enemiesGte: 3 }, pos: { x: 1, z: 2 } }]
        : [{ verb, pos: { x: 1, z: 2 } }];
      const result = validateStandingOrders(submission);
      assert.equal(result.ok, false, `${verb} is still accepted by the door`);
      assert.equal(result.message, `orders[0].verb "${verb}" is unknown.`);
    }
    // THE WHOLE ARRAY, not just the bad order: order arrays replace, so a plan carrying one retired
    // verb is refused entire. This is what makes the retirement a clean stop rather than a drift.
    const mixed = validateStandingOrders([
      { verb: 'REPAIR_UNDER', pct: 60 },
      { verb: 'MOVE_HERO', pos: { x: 0, z: 0 } },
      { verb: 'HOLD', pos: { x: 0, z: 0 } },
    ]);
    assert.equal(mixed.ok, false);
    assert.equal(mixed.message, 'orders[2].verb "HOLD" is unknown.');
    // The survivor, asserted beside them so this guard cannot pass by refusing everything.
    assert.deepEqual(validateStandingOrders([{ verb: 'MOVE_HERO', pos: { x: 1, z: 2 } }]),
      { ok: true, orders: [{ verb: 'MOVE_HERO', pos: { x: 1, z: 2 } }] });
  } finally {
    await close();
  }
});

test('every retired tape in the ledger fails at submission with the message the ledger recorded', async () => {
  const { orders, close } = await door();
  try {
    const { validateStandingOrders } = orders;
    // The ledger's own headline, pinned: a re-run that retires a different number of tapes is a
    // different retirement and must be re-read, not re-blessed.
    assert.deepEqual(
      { tapes: LEDGER.retiredTapes, scored: LEDGER.retiredScoredRows, rides: LEDGER.retiredRides.length, verbs: LEDGER.removedVerbs },
      { tapes: 57, scored: 22, rides: 22, verbs: REMOVED },
    );
    assert.equal(LEDGER.rows.length, LEDGER.retiredTapes);

    let checked = 0;
    for (const row of LEDGER.rows) {
      assert.equal(row.afterGrammar, 'REFUSED_AT_SUBMISSION', `${row.ride}/${row.tape}`);
      assert.ok(row.removedVerbs.every((verb) => REMOVED.includes(verb)), `${row.ride}/${row.tape} names a verb outside the removal`);
      const submission = firstRefusedSubmission(row);
      const result = validateStandingOrders(submission);
      assert.equal(result.ok, false, `${row.ride}/${row.tape}: the door still accepts the submission the ledger says it refuses`);
      assert.equal(result.message, row.firstRefusal.message, `${row.ride}/${row.tape}: the door's refusal is not the one the ledger recorded`);
      assert.equal(submission.length, row.firstRefusal.submissionLength, `${row.ride}/${row.tape}: submission length`);
      assert.equal(submission[row.firstRefusal.orderIndex].verb, row.firstRefusal.verb, `${row.ride}/${row.tape}: offending order index`);
      checked += 1;
    }
    // The measured-subject control (F-2215-1): an empty ledger would pass every loop above.
    assert.equal(checked, 57, 'the ledger measured no tapes');
  } finally {
    await close();
  }
});
