import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// F-1274-1 (s1274). WHY THIS GUARD EXISTS: five fires in a row hand-audited the same property.
// s1248 measured the stop-reason spellings across the stopped leaves; s1249 found 3 of 15
// terminal-closed leaves printing "(no reason recorded)" and proved all three DID carry the why
// (F-1249-1); s1261 raised F-1261-4 ("5 stopped leaves carry no drainNotes"); s1273 re-measured it
// and handed it forward as the next fire's top item; s1274 re-measured it AGAIN and refuted it.
//
// F-1261-4 WAS FALSE, AND THE WAY IT WAS FALSE IS THE REASON THIS FILE IS A TEST AND NOT A NOTE:
// it grepped for the literal key `drainNotes` — ONE of six accepted spellings — and read that key's
// absence as absence of the reason. All five leaves it named DO carry a substantive closure reason
// (under stoppedNote_s1263, stoppedNote_s1264, stopNote, stoppedReason, stoppedReason), and
// drain-block-check.mjs prints every one of them. Its recommended remedy — "transcribe the notes
// from BACKLOG" — would have duplicated five long notes into a SEVENTH key spelling, worsening the
// exact schema sprawl that produced the misreading. A property that five fires measure by hand and
// one fire gets wrong is a property that belongs in the battery.
//
// WHAT IS ACTUALLY LOAD-BEARING: a terminal-closed leaf whose reason cannot be resolved teaches the
// next fire nothing — drain-block-check refuses the drain but cannot say why, which is how s1248
// escalated a false alarm about autosprite-trial-gate (see drain-block-check.mjs:66-69).
//
// THIS FILE MIRRORS drain-block-check.mjs's resolver RATHER THAN IMPORTING IT, because that script
// is CLI-only: it has no exports and runs process.exit at top level, so importing it would execute
// it. Driving it as a subprocess was rejected deliberately — its reason line prints AFTER the leaf
// title, and titles on this tree run 400+ chars, so a spawnSync stdout truncation under load would
// drop the sentinel and read as a FALSE GREEN (the dangerous direction). Mirroring buys determinism
// and pays a drift risk, so the drift is locked by the second test below.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECKER = path.join(root, 'scripts/drain-block-check.mjs');
const goals = JSON.parse(fs.readFileSync(path.join(root, 'tasks/goals.json'), 'utf8'));

// Same walker as goal-tracker.test.mjs:19 — root-level goal.tasks included (F-1123-1: a fixed-depth
// walk silently skipped 16% of the tree, which is how the defects it was meant to catch got written).
const collectTasks = (node, out = []) => {
  for (const task of node.tasks ?? []) out.push(task);
  for (const subgoal of node.subgoals ?? []) collectTasks(subgoal, out);
  return out;
};
const leaves = goals.goals.flatMap((goal) => collectTasks(goal));

// --- mirrored from drain-block-check.mjs:50-82 (drift-locked by the second test) ---
const TERMINAL_CLOSED_STATUSES = new Set(['superseded', 'void', 'abandoned', 'stopped']);
const CLOSED_REASON_KEYS = ['closedReason', 'stoppedReason', 'stopNote', 'supersededBy', 'reason', 'drainNotes'];
const REASON_ISH_KEY = /(note|reason|why|outcome|verdict)/i;
const CLOSURE_STEM_KEY = /(superseded|closed|stop|drain|refut|retir|cann)/i;
const NOT_A_CLOSURE_REASON = new Set(['blockedReason', 'priorBlockedReason', 'authorNotes']);

function resolveReasonKey(leaf) {
  for (const key of CLOSED_REASON_KEYS) {
    const value = leaf[key];
    if (typeof value === 'string' && value.trim()) return key;
  }
  const candidates = Object.keys(leaf).filter(
    (key) =>
      !NOT_A_CLOSURE_REASON.has(key) &&
      REASON_ISH_KEY.test(key) &&
      typeof leaf[key] === 'string' &&
      leaf[key].trim(),
  );
  const ranked = [
    ...candidates.filter((key) => CLOSURE_STEM_KEY.test(key)),
    ...candidates.filter((key) => !CLOSURE_STEM_KEY.test(key)),
  ];
  return ranked[0] ?? null;
}

test('every terminal-closed goal leaf can state why it closed', () => {
  const closed = leaves.filter((leaf) => TERMINAL_CLOSED_STATUSES.has(leaf.status));

  // Guard the guard: an empty denominator would make this test pass by vacuity. s1274 measured 16
  // terminal-closed leaves on main; assert the population is non-empty rather than pinning a count
  // (the count legitimately grows every time a leaf closes — a pinned baseline would red on correct
  // bookkeeping, which is how a guard trains fires to edit it instead of heeding it).
  assert.ok(
    closed.length > 0,
    'no terminal-closed leaves found — the walker or the status vocabulary drifted, so this guard is measuring nothing',
  );

  const silent = closed
    .filter((leaf) => resolveReasonKey(leaf) === null)
    .map((leaf) => `${leaf.id} [status=${leaf.status}] keys: ${Object.keys(leaf).join(', ')}`);

  assert.deepEqual(
    silent,
    [],
    `terminal-closed leaf(s) carry no reason-bearing key. A closed leaf that cannot say WHY it closed ` +
      `reads to the next fire as an unexplained refusal. Record the why ON the leaf — any key whose ` +
      `name contains note/reason/why/outcome/verdict is read by drain-block-check.mjs; there is no ` +
      `need to mint a new spelling.\nSilent: ${silent.join(' | ')}`,
  );
});

test('the mirrored resolver vocabulary still matches drain-block-check.mjs', () => {
  // The first test re-implements a resolver that lives in another file. If that file's vocabulary is
  // widened or narrowed and this copy is not, the guard would silently start measuring a DIFFERENT
  // question than the tool fires actually run — passing while the real refusal path goes mute.
  // Pin the source lines so any edit to the vocabulary reds here and forces both to move together.
  const src = fs.readFileSync(CHECKER, 'utf8');
  const pins = [
    `const TERMINAL_CLOSED_STATUSES = new Set(['superseded', 'void', 'abandoned', 'stopped']);`,
    `const CLOSED_REASON_KEYS = ['closedReason', 'stoppedReason', 'stopNote', 'supersededBy', 'reason', 'drainNotes'];`,
    `const REASON_ISH_KEY = /(note|reason|why|outcome|verdict)/i;`,
    `const CLOSURE_STEM_KEY = /(superseded|closed|stop|drain|refut|retir|cann)/i;`,
    `const NOT_A_CLOSURE_REASON = new Set(['blockedReason', 'priorBlockedReason', 'authorNotes']);`,
  ];
  const missing = pins.filter((line) => !src.includes(line));
  assert.deepEqual(
    missing,
    [],
    `drain-block-check.mjs's closure vocabulary changed but scripts/goal-closure-reason.test.mjs still ` +
      `mirrors the old one. Update the mirrored constants at the top of this file to match, then ` +
      `update these pins.\nNo longer found: ${missing.join(' || ')}`,
  );
});
