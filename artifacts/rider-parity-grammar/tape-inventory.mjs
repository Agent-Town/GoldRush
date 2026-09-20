#!/usr/bin/env node
// rider-parity-grammar: the tape inventory the retirement and the hash re-pins are built from.
//
// One row per heat-12 run tape: where it lives, which ride owns it, whether that ride's own
// summary.json names it as the SCORED attempt, its recorded identity (id / contract / seed /
// difficulty / engineHash / eventLogHash), and which of this task's three verb CLASSES it carries:
//
//   removed  — MOVE_TO / HOLD / FALLBACK_IF (stage 3): the tape stops VALIDATING, so it retires.
//   rebased  — CONTEXT_ACTION / CAPTURE / GRADE / HAUL / PLAYBOOK_USE / BOAT_BUILD / REANCHOR
//              (stage 1): the acting body moves, so the tape still validates and its hash moves.
//   repair   — REPAIR_UNDER (stage 2): the target search gains the human's radius, so its hash
//              moves too.
//
// Read-only. Writes nothing; prints one JSON document.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename, relative } from 'node:path';

const RIDES = process.argv[2] ?? 'artifacts/gauntlet-heat12-20260905/rides';

const REMOVED = new Set(['MOVE_TO', 'HOLD', 'FALLBACK_IF']);
const REBASED = new Set(['CONTEXT_ACTION', 'CAPTURE', 'GRADE', 'HAUL', 'PLAYBOOK_USE', 'BOAT_BUILD', 'REANCHOR']);
const REPAIR = new Set(['REPAIR_UNDER']);

const readJson = (path) => { try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return null; } };

function tapeSubmissions(value) {
  const entries = value?.inputLog?.entries;
  if (!Array.isArray(entries)) return null;
  const submissions = [];
  for (const entry of entries) {
    for (const action of Array.isArray(entry?.a) ? entry.a : []) {
      if (action?.kind === 'agent_orders' && Array.isArray(action.orders)) submissions.push(action.orders);
    }
  }
  return submissions;
}

function walkJson(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walkJson(path, out);
    else if (name.endsWith('.json')) out.push(path);
  }
  return out;
}

const rows = [];
for (const ride of readdirSync(RIDES).sort()) {
  const dir = join(RIDES, ride);
  if (!statSync(dir).isDirectory()) continue;
  const summary = readJson(join(dir, 'summary.json'));
  const scoredName = summary?.outcome?.tape ? basename(summary.outcome.tape)
    : summary?.promotedTapeName ? `${summary.promotedTapeName}.json` : null;
  const rideEventHash = summary?.outcome?.eventLogHash ?? null;
  for (const path of walkJson(dir)) {
    const tape = readJson(path);
    const submissions = tapeSubmissions(tape);
    if (!submissions) continue;
    const verbs = new Map();
    for (const orders of submissions) {
      for (const order of orders) {
        const verb = typeof order?.verb === 'string' ? order.verb : '(malformed)';
        verbs.set(verb, (verbs.get(verb) ?? 0) + 1);
      }
    }
    const names = [...verbs.keys()];
    const scored = scoredName !== null && basename(path) === scoredName;
    rows.push({
      ride,
      file: relative(process.cwd(), path),
      name: basename(path),
      scored,
      tapeId: tape?.id ?? null,
      contract: tape?.contract ?? null,
      seed: tape?.seed ?? null,
      difficulty: tape?.difficulty ?? null,
      engineHash: tape?.meta?.engineHash ?? null,
      era: tape?.meta?.era ?? null,
      // The ride's own recorded terminal hash, present only on the scored tape's ride row.
      recordedEventLogHash: scored ? rideEventHash : null,
      durationTicks: tape?.inputLog?.durationTicks ?? null,
      submissions: submissions.length,
      verbs: Object.fromEntries([...verbs].sort((a, b) => b[1] - a[1])),
      carriesRemoved: names.filter((v) => REMOVED.has(v)).sort(),
      carriesRebased: names.filter((v) => REBASED.has(v)).sort(),
      carriesRepair: names.filter((v) => REPAIR.has(v)).sort(),
    });
  }
}

const count = (pred) => rows.filter(pred).length;
const scoredRows = rows.filter((r) => r.scored);
const report = {
  source: RIDES,
  generatedFrom: 'artifacts/rider-parity-grammar/tape-inventory.mjs',
  tapes: rows.length,
  scoredTapes: scoredRows.length,
  ridesWithTapes: new Set(rows.map((r) => r.ride)).size,
  ridesWithScoredTape: new Set(scoredRows.map((r) => r.ride)).size,
  summary: {
    removed: { tapes: count((r) => r.carriesRemoved.length > 0), scored: scoredRows.filter((r) => r.carriesRemoved.length > 0).length },
    rebased: { tapes: count((r) => r.carriesRebased.length > 0), scored: scoredRows.filter((r) => r.carriesRebased.length > 0).length },
    repair: { tapes: count((r) => r.carriesRepair.length > 0), scored: scoredRows.filter((r) => r.carriesRepair.length > 0).length },
    survivingScored: scoredRows.filter((r) => r.carriesRemoved.length === 0).map((r) => `${r.ride}/${r.name}`),
  },
  rows,
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
