#!/usr/bin/env node
// s1261 — retire `gazette-welcome-newsie-drift-window` as superseded.
//
// Its own run stopped PREMISE-NOT-REPRODUCED (16/16 clean at workers=4). Its leaf then
// named a successor to settle the question: `concurrency-class-failure-rate`. That
// successor has since MERGED (d71f6ea83cabc3cea16c3a900e07da9fd6ae34a8) and measured the
// drift assertion at 0 failures in 48 executions across workers {1,2,4}
// (logs/suite-red-inventory.md:626-627), with the sole gazette failure at :111 — a
// different line. So the leaf reads `stopped` while the question it waits on is answered:
// the stale-stopped shape (Mistake #5 — a ledger line retires with its event).
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'tasks/goals.json';
const raw = readFileSync(path, 'utf8');
const g = JSON.parse(raw);

let hit = null;
const walk = (n) => {
  for (const k of ['subgoals', 'tasks', 'children']) if (Array.isArray(n[k])) n[k].forEach(walk);
  if (n.id === 'gazette-welcome-newsie-drift-window') hit = n;
};
g.goals.forEach(walk);

if (!hit) {
  console.error('leaf not found — NOTHING WRITTEN');
  process.exit(1);
}
if (hit.status !== 'stopped') {
  console.error(`leaf status is "${hit.status}", expected "stopped" — NOTHING WRITTEN`);
  process.exit(1);
}

console.log('before:', JSON.stringify({ status: hit.status, mergeHash: hit.mergeHash ?? null }));

hit.status = 'superseded';
hit.supersededBy = 'concurrency-class-failure-rate';
hit.drainNotes =
  'SUPERSEDED s1261 — the question this leaf waited on has been ANSWERED, twice, and the leaf ' +
  'had gone stale reading `stopped`. (1) Its own run stopped lawfully at the master\'s ' +
  'measure-first gate with PREMISE-NOT-REPRODUCED: serial 12/12 and concurrent 16/16 green, ' +
  'node guards 74/74 (run 20260729-161534, done-move ' +
  '`stopped-premise-not-reproduced-F1215-2-s1215-…`). (2) The successor its own stoppedNote_s1216 ' +
  'named — `concurrency-class-failure-rate`, "which measures the rate this cure would have to ' +
  'beat" — has since MERGED at `d71f6ea83cabc3cea16c3a900e07da9fd6ae34a8`, and its rate table ' +
  '(`logs/suite-red-inventory.md:626-627`) puts `gazette-welcome.spec.ts` at 0/8 · 0/8 · 0/8 ' +
  'desktop and 0/8 · 1/8 · 0/8 mobile across workers {1,2,4} — the drift assertion failed ' +
  '0 times in 48 executions, and `:636-637` records that the single gazette failure in the ' +
  'whole table was at `:111`, NOT the `:87` drift assertion this leaf is about. ' +
  '⚠️ THE CODE SMELL IS REAL AND UNFIXED and must not be lost: `e2e/gazette-welcome.spec.ts:84-88` ' +
  'still asserts a STATE property through a `waitForTimeout(50)` wall-clock window (verified ' +
  'unchanged on main s1261). But it must be authored as test HYGIENE with no flake premise — ' +
  'never re-queued as a cure for a flake that measures 0/48. Retained per the Retention Law.';

// Preserve the file's existing formatting convention (2-space indent + trailing newline).
writeFileSync(path, `${JSON.stringify(g, null, 2)}\n`);
console.log('after: ', JSON.stringify({ status: hit.status, supersededBy: hit.supersededBy }));
