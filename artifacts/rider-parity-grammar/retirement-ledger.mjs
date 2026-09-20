#!/usr/bin/env node
// rider-parity-grammar stage 3 — THE RETIREMENT LEDGER (ADR-004 clause 2/3, ADR-005 consequence 3,
// owner ruling 2026-09-07 D2 verbatim: "re-ride it yes").
//
// Removing `MOVE_TO`, `HOLD` and `FALLBACK_IF` from the `StandingOrder` union does not make a tape
// DIVERGE; it makes it stop VALIDATING. `validateOrder`'s tail already refuses an unknown verb with
// `orders[i].verb "<VERB>" is unknown.` (src/agent/StandingOrders.ts, the `return` after the last
// verb branch), and `submit` rejects the WHOLE array on the first refusal because order arrays
// replace. So a retired tape fails at SUBMISSION, in the turn it is offered, with a message that
// names the verb and the index — the clean failure ADR-004 retirement wants.
//
// This ledger writes that fact down for every heat-12 tape, WITHOUT replaying anything: the refusal
// is a function of the submission text alone. For each tape it records the ride, the tape identity
// (id / contract / seed / difficulty / recorded engineHash), the recorded terminal hash the ride
// banked, the FIRST submission that would be refused, its index, the exact refusal message, and how
// many of the tape's submissions carry a removed verb at all.
//
// RETIRED, NEVER DELETED (CLAUDE.md §4.10b, the Retention Law): nothing here removes a tape, a ride
// directory or a board row. The ledger is the record that the row no longer replays and why, so the
// drain can author the heat-12 re-ride from it.
//
// Usage: node artifacts/rider-parity-grammar/retirement-ledger.mjs > <out.json>
import { readFileSync } from 'node:fs';

const TASK = 'rider-parity-grammar';
const RULING = '2026-09-07';
// The task that LANDED the removal this ledger predicts, and the day it landed. The prediction was
// computed before the verbs were gone; `scripts/rider-parity-retirement.test.mjs` replays every row
// below against the landed door and holds the two to the same words.
const LANDED_BY = 'rider-parity-grammar-stage3';
const LANDED_ON = '2026-09-07';
const REMOVED = ['MOVE_TO', 'HOLD', 'FALLBACK_IF'];

const inventory = JSON.parse(readFileSync('artifacts/rider-parity-grammar/tape-inventory.json', 'utf8'));

/** Exactly `validateOrder`'s unknown-verb tail, quoted so the ledger and the door say one thing. */
const refusal = (index, verb) => `orders[${index}].verb "${verb}" is unknown.`;

function firstRefusal(tapePath) {
  const tape = JSON.parse(readFileSync(tapePath, 'utf8'));
  let submissions = 0;
  let refused = 0;
  let first = null;
  for (const entry of tape?.inputLog?.entries ?? []) {
    for (const action of Array.isArray(entry?.a) ? entry.a : []) {
      if (action?.kind !== 'agent_orders' || !Array.isArray(action.orders)) continue;
      submissions += 1;
      const at = action.orders.findIndex((order) => REMOVED.includes(order?.verb));
      if (at === -1) continue;
      refused += 1;
      first ??= {
        tick: entry?.t ?? null,
        orderIndex: at,
        verb: action.orders[at].verb,
        message: refusal(at, action.orders[at].verb),
        submissionLength: action.orders.length,
      };
    }
  }
  return { submissions, refusedSubmissions: refused, first };
}

const rows = inventory.rows
  .filter((row) => row.carriesRemoved.length > 0)
  .map((row) => {
    const { submissions, refusedSubmissions, first } = firstRefusal(row.file);
    return {
      ride: row.ride,
      tape: row.name,
      file: row.file,
      scored: row.scored,
      tapeId: row.tapeId,
      contract: row.contract,
      seed: row.seed,
      difficulty: row.difficulty,
      recordedEngineHash: row.engineHash,
      recordedEra: row.era,
      // The ride's own banked terminal hash — the BEFORE for a scored row, straight off summary.json.
      recordedEventLogHash: row.recordedEventLogHash,
      removedVerbs: row.carriesRemoved,
      removedVerbOrders: Object.fromEntries(REMOVED.filter((v) => v in row.verbs).map((v) => [v, row.verbs[v]])),
      submissions,
      refusedSubmissions,
      firstRefusal: first,
      // The AFTER is not a hash: the door never accepts the plan, so the run never happens.
      afterGrammar: 'REFUSED_AT_SUBMISSION',
      retiredBy: TASK,
      retiredUnder: `ADR-004 clause 3 · ADR-005 consequence 3 · owner ruling ${RULING} ("re-ride it yes")`,
      retiredAt: RULING,
      disposition: 'RETIRED — kept on disk and in git as history; re-ridden on the new grammar, never repaired.',
    };
  });

const scored = rows.filter((row) => row.scored);
process.stdout.write(`${JSON.stringify({
  generatedFrom: 'artifacts/rider-parity-grammar/retirement-ledger.mjs',
  task: TASK,
  ruling: RULING,
  landedBy: LANDED_BY,
  landedOn: LANDED_ON,
  removedVerbs: REMOVED,
  board: 'artifacts/gauntlet-heat12-20260905',
  tapesOnBoard: inventory.tapes,
  scoredRowsOnBoard: inventory.scoredTapes,
  retiredTapes: rows.length,
  retiredScoredRows: scored.length,
  retiredRides: [...new Set(rows.map((row) => row.ride))].sort(),
  retiredScoredRides: [...new Set(scored.map((row) => row.ride))].sort(),
  survivingScoredRows: inventory.summary.survivingScored,
  rows,
}, null, 2)}\n`);
