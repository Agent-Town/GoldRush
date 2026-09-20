#!/usr/bin/env node
// s1261 — register the authored master's leaf (Goal Registration Law: same commit as the master)
// and append its QUEUED row to BACKLOG.
import { readFileSync, writeFileSync } from 'node:fs';

// --- goal leaf ---------------------------------------------------------------
const gp = 'tasks/goals.json';
const g = JSON.parse(readFileSync(gp, 'utf8'));

let parent = null;
const walk = (n) => {
  for (const k of ['subgoals', 'tasks', 'children']) if (Array.isArray(n[k])) n[k].forEach(walk);
  if (n.id === 'factory-truth') parent = n;
};
g.goals.forEach(walk);
if (!parent) {
  console.error('parent factory-truth not found — NOTHING WRITTEN');
  process.exit(1);
}
parent.tasks ??= [];
if (parent.tasks.some((t) => t.id === 'gazette-welcome-release-state-probe')) {
  console.error('leaf already present — NOTHING WRITTEN');
  process.exit(1);
}
parent.tasks.push({
  id: 'gazette-welcome-release-state-probe',
  title:
    'Make the newsie-release assertion observe a STATE, not a 50 ms wall-clock window — ' +
    'e2e/gazette-welcome.spec.ts:84-88 infers "the newsie stopped following" from a displacement ' +
    'sampled after waitForTimeout(50), while TownWelcome.followsPlayer (:44) is the property itself. ' +
    'Test hygiene only: the assertion measures 0 failures in 48 executions (987df988), so the flake ' +
    'premise is dead (F-1261-6) and scope 1 is a mandatory observe-first STOP.',
  taskFile: 'lane-b-gazette-welcome-release-state-probe.md',
  mergeHash: null,
  status: 'queued',
});
writeFileSync(gp, `${JSON.stringify(g, null, 2)}\n`);
console.log('leaf registered under factory-truth');

// --- BACKLOG row -------------------------------------------------------------
const bp = 'tasks/BACKLOG.md';
const lines = readFileSync(bp, 'utf8').split('\n');
const row =
  '🔨 **QUEUED (s1261, FIRE-AUTHORED)** — `lane-b-gazette-welcome-release-state-probe` → `tasks/queue/lane-b/`: ' +
  'make the newsie-release assertion observe a **state** instead of a 50 ms wall-clock window. ' +
  'Discharges the one fire-authorable item left by **F-1261-6** after that finding retired ' +
  '`gazette-welcome-newsie-drift-window` as `superseded`. ⚠️ **Authored explicitly as TEST HYGIENE WITH NO FLAKE PREMISE:** ' +
  'the assertion at `e2e/gazette-welcome.spec.ts:84-88` ("the Gazette welcome fires once, walks skippably, and retriggers ' +
  'through the newsie") measures **0 failures in 48 executions** across workers {1,2,4} per the merged rate table ' +
  '`987df9889da24857bf1472121b249f4d8621b20f` (`logs/suite-red-inventory.md:626-627`), so the master forbids re-opening ' +
  'the concurrency question its predecessor died on. **The subject is that the test infers a state property from a ' +
  'displacement measured over wall clock**, while `src/town/TownWelcome.ts:44` `get followsPlayer()` *is* that property ' +
  'and `src/town/TownScene.ts:556` already reads it every frame. Scope 2 exposes it as one `TownDiagnostics` field ' +
  '(two sites in `TownScene.ts`, behaviour-neutral — a read-only getter over `phase`); scope 3 swaps the `waitForTimeout(50)` ' +
  'for an `expect.poll` on that field and **keeps** the displacement bound after the state settles. ' +
  '⛔ **Scope 1 is a mandatory observe-first STOP with TWO exit conditions:** if `followsPlayer` never goes `false` the ' +
  'release does not happen and the green was luck (a game finding that outranks the test change, and reporting it is a ' +
  'SUCCESS); if peak displacement across 10 frames exceeds the asserted bound while already released, the bound is wrong ' +
  'on its own terms and re-choosing it is a drain question. Scope 4 gates on **default workers + `--repeat-each=3` on both ' +
  'projects, plus a deliberate-load arm** — a `--workers=1` arm has produced false GREENs on this family three times. ' +
  'Leaf `gazette-welcome-release-state-probe` registered in the same commit. ' +
  '**GATE: lane-b is a SAFE DUPE, not an ancestor — `main..lane/m4` is 1 ahead via the `d50e2887` tip-graft whose content ' +
  'landed as `637e156e`, and `git diff --name-status --diff-filter=A main..lane/m4` was EMPTY at authoring; the master ' +
  'orders a STOP if the run\'s own re-measurement finds any `A` line.**';

let at = lines.findIndex((l, i) => i > 8 && /^🔨/.test(l));
if (at === -1) at = 44;
lines.splice(at, 0, row, '');
writeFileSync(bp, lines.join('\n'));
console.log(`BACKLOG row inserted at L${at + 1}`);
