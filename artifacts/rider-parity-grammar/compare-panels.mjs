#!/usr/bin/env node
// rider-parity-grammar: diff two replay panels and attribute every moved hash.
//
// A hash that moves without a named cause is a red (the master's self-check). This prints, for each
// tape, BEFORE, AFTER, whether it moved, and which of this task's verb classes the tape carries —
// which IS the cause, because the classes are disjoint by construction:
//
//   rebased  (stage 1) — CONTEXT_ACTION / CAPTURE / GRADE / HAUL / PLAYBOOK_USE / BOAT_BUILD / REANCHOR
//   repair   (stage 2) — REPAIR_UNDER
//
// A tape carrying NEITHER is the CONTROL: its hash must be unchanged, and that is the strongest
// evidence a slice like this can produce — it shows the change reached exactly the runs it should.
//
// Usage: node artifacts/rider-parity-grammar/compare-panels.mjs <before.json> <after.json> [class]
import { readFileSync } from 'node:fs';

const [beforePath, afterPath, klass = 'rebased'] = process.argv.slice(2);
const load = (p) => JSON.parse(readFileSync(p, 'utf8'));
const before = new Map(load(beforePath).results.map((row) => [`${row.ride}/${row.name}`, row]));
const after = load(afterPath).results;

const carriesFor = (row) => klass === 'repair' ? row.carriesRepair : row.carriesRebased;

const rows = after.map((row) => {
  const key = `${row.ride}/${row.name}`;
  const was = before.get(key);
  const beforeHash = was?.eventLogHash ?? (was?.error ? 'REPLAY-ERROR' : 'MISSING');
  const afterHash = row.eventLogHash ?? (row.error ? 'REPLAY-ERROR' : 'MISSING');
  return {
    key,
    ride: row.ride,
    tape: row.name,
    contract: row.contract,
    seed: row.seed,
    scored: row.scored,
    beforeHash,
    afterHash,
    moved: beforeHash !== afterHash,
    carriesRebased: row.carriesRebased,
    carriesRepair: row.carriesRepair,
    expectedToMove: carriesFor(row).length > 0,
    beforeOutcome: was?.outcome ?? null,
    afterOutcome: row.outcome ?? null,
  };
});

const moved = rows.filter((r) => r.moved && r.beforeHash !== 'REPLAY-ERROR' && r.afterHash !== 'REPLAY-ERROR');
const unmoved = rows.filter((r) => !r.moved && r.beforeHash !== 'REPLAY-ERROR');
const unexpected = moved.filter((r) => !r.expectedToMove);
const missed = rows.filter((r) => r.expectedToMove && !r.moved && r.beforeHash !== 'REPLAY-ERROR');
const errors = rows.filter((r) => r.beforeHash === 'REPLAY-ERROR' || r.afterHash === 'REPLAY-ERROR');

process.stdout.write(`${JSON.stringify({
  before: beforePath,
  after: afterPath,
  attributionClass: klass,
  tapes: rows.length,
  moved: moved.length,
  unmoved: unmoved.length,
  movedWithoutCause: unexpected.map((r) => r.key),
  carriedTheVerbButDidNotMove: missed.map((r) => r.key),
  replayErrors: errors.map((r) => ({ key: r.key, before: r.beforeHash, after: r.afterHash })),
  rows,
}, null, 2)}\n`);
