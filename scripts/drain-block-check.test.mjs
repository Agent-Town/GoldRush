// drain-block-check.test.mjs — the §3.0 first-command-of-every-drain guard had NO test at all
// until s1248, and it is the only mechanism standing between a fire and F-1104-7 (s1104 merged
// owner-gated rf-34 off a sound-looking runner report, then reversed it the same fire).
//
// WHY THESE ARMS: F-1248-1 measured that the DRAIN path (no --queue) decided on `status === 'blocked'`
// alone, while the SAME file's --queue path also refused TERMINAL_CLOSED_STATUSES. So a leaf whose run
// STOPPED lawfully pending an owner fork printed "✅ CLEAR" at rc=0 on the path fire.md §3.0 calls the
// first command of every drain. Every arm below therefore comes in pairs: the refusal AND the control
// that proves the refusal is driven by the STATUS WORD rather than by the filename or the fixture.

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('./drain-block-check.mjs', import.meta.url));

// One leaf per fixture keeps the "longest match wins" tie-breaker out of the way — these arms are
// about the STATUS word, and a second leaf would test a different thing.
function fixture(leaf) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-drain-block-'));
  fs.mkdirSync(path.join(dir, 'tasks'));
  fs.writeFileSync(
    path.join(dir, 'tasks', 'goals.json'),
    JSON.stringify({
      version: 1,
      goals: [{ id: 'factory-infra', title: 'Factory Infra', subgoals: [{ id: 'guards', title: 'Guards', tasks: [leaf] }] }],
    }),
  );
  return dir;
}

function run(dir, ...args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd: dir, encoding: 'utf8', timeout: 30_000 });
}

const cleanup = (t, dir) => t.after(() => fs.rmSync(dir, { recursive: true, force: true }));

// The real shape that produced the false CLEAR: a lane-c done-move whose leaf STOPPED pending the
// unruled F-1219-1 owner fork, entered by its done-move filename exactly as §3.0 instructs.
const DONE_MOVE = 'stopped-item2-owner-fork-F1219-1-s1219-20260729-184515-lane-c-agent-rung-honest-gate.md';
const leafOf = (status, extra = {}) => ({
  id: 'agent-rung-honest-gate',
  title: 'Make the tool-surface permission gate able to express the rung it already declares',
  taskFile: 'lane-c-agent-rung-honest-gate.md',
  status,
  ...extra,
});

test('drain path REFUSES a terminal-closed leaf (F-1248-1) — and clears the same fixture when live', (t) => {
  const stopped = fixture(leafOf('stopped', { stoppedReason: 'LAWFUL ITEM-2 STOP; the cure is an OWNER design fork (F-1219-1).' }));
  const live = fixture(leafOf('building'));
  cleanup(t, stopped);
  cleanup(t, live);

  const refused = run(stopped, DONE_MOVE);
  assert.equal(refused.status, 1, `expected rc=1, got rc=${refused.status}\n${refused.stdout}${refused.stderr}`);
  assert.match(refused.stdout, /⛔ CLOSED — DO NOT DRAIN/);
  assert.match(refused.stdout, /status="stopped"/);
  // The refusal must state its cause, or it teaches the next fire nothing.
  assert.match(refused.stdout, /stoppedReason: LAWFUL ITEM-2 STOP/);
  // It must NOT borrow the --queue arm's wording: "already shipped" is a lie for a lawful stop.
  assert.doesNotMatch(refused.stdout, /ALREADY SHIPPED/);
  assert.doesNotMatch(refused.stdout, /DO NOT QUEUE/);

  // IN-TEST CONTROL — identical input, only the status word changed. If this also failed, the arm
  // above would be proving something about the filename (it contains "stopped-") rather than the leaf.
  const cleared = run(live, DONE_MOVE);
  assert.equal(cleared.status, 0, `control must CLEAR, got rc=${cleared.status}\n${cleared.stdout}`);
  assert.match(cleared.stdout, /✅ CLEAR/);
  assert.match(cleared.stdout, /status="building"/);
});

test('every TERMINAL_CLOSED word is refused on the drain path, and no other word is', (t) => {
  // Enumerating the vocabulary is the point: a guard that refuses 'stopped' but not 'superseded'
  // just moves the hole. 'void'/'abandoned' are unused in the tree today and are asserted anyway —
  // the set is the contract, not the current data.
  for (const status of ['stopped', 'superseded', 'void', 'abandoned']) {
    const dir = fixture(leafOf(status));
    cleanup(t, dir);
    const r = run(dir, DONE_MOVE);
    assert.equal(r.status, 1, `status="${status}" must refuse the drain, got rc=${r.status}\n${r.stdout}`);
    assert.match(r.stdout, /⛔ CLOSED — DO NOT DRAIN/);
  }
  // The deliberate boundary (see :216): merged/shipped still CLEAR, because /drain §3 re-asserts this
  // command on the merged tree and a unit drained by an earlier fire reads `merged`. Re-draining
  // merged work is caught by the two-dot diff; reddening a lawful re-check would be a false positive.
  for (const status of ['merged', 'shipped', 'planned', 'queued', 'building', 'diagnosed']) {
    const dir = fixture(leafOf(status, status === 'merged' ? { mergeHash: 'a'.repeat(40) } : {}));
    cleanup(t, dir);
    const r = run(dir, DONE_MOVE);
    assert.equal(r.status, 0, `status="${status}" must CLEAR the drain path, got rc=${r.status}\n${r.stdout}`);
    assert.match(r.stdout, /✅ CLEAR/);
  }
});

test('an owner BLOCK still outranks everything and still names the owner (unchanged by F-1248-1)', (t) => {
  const dir = fixture(leafOf('blocked', { blockedReason: 'OWNER DESIGN FORK - RULING REQUIRED (F-1219-1).' }));
  cleanup(t, dir);
  const r = run(dir, DONE_MOVE);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /⛔ BLOCKED — DO NOT DRAIN/);
  assert.match(r.stdout, /OWNER DESIGN FORK/);
  assert.match(r.stdout, /lifted by the OWNER/);
  // A block is a different animal from a closed question; the two must not print the same headline.
  assert.doesNotMatch(r.stdout, /⛔ CLOSED/);
});

test('--queue keeps its own wording and its own reason line', (t) => {
  const dir = fixture(leafOf('stopped', { stopNote: 'STOPPED LAWFULLY AT SCOPE 3; no mergeHash by design.' }));
  cleanup(t, dir);
  const r = run(dir, 'lane-c-agent-rung-honest-gate.md', '--queue');
  assert.equal(r.status, 1);
  assert.match(r.stdout, /⛔ CLOSED — DO NOT QUEUE/);
  assert.match(r.stdout, /left no commit to refuse it with/);
  assert.match(r.stdout, /stopNote: STOPPED LAWFULLY AT SCOPE 3/);
});

test('a closed leaf whose reason sits under a session-stamped key is still explained', (t) => {
  // Measured s1248: the six status:"stopped" leaves on main spelled their reason FIVE different ways
  // and `reason` was undefined on all six. "stoppedNote_s1216" is a real one — the near-miss-KEY
  // shape the F-1123-1 rider polices for "mergeCommit", one level up at the field name.
  const dir = fixture(leafOf('stopped', { stoppedNote_s1216: 'Premise not reproduced; do not re-queue as-is (F-1215-2).' }));
  cleanup(t, dir);
  const r = run(dir, DONE_MOVE);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /stoppedNote_s1216: Premise not reproduced/);

  // And when there is genuinely no reason anywhere, it must say so rather than print an empty line.
  const bare = fixture(leafOf('stopped'));
  cleanup(t, bare);
  const r2 = run(bare, DONE_MOVE);
  assert.equal(r2.status, 1);
  assert.match(r2.stdout, /no reason recorded on the leaf/);
});

test('--all reports terminal-closed leaves but its exit code still tracks BLOCKED alone', (t) => {
  const closedOnly = fixture(leafOf('stopped'));
  cleanup(t, closedOnly);
  const r = run(closedOnly, '--all');
  assert.equal(r.status, 0, `--all must not fail on a merely-closed board, got rc=${r.status}\n${r.stdout}`);
  // The headline counts BLOCKED only — a closed question is not owner debt and must not inflate it.
  assert.match(r.stdout, /Scanned 1 goal leaves — 0 BLOCKED\./);
  assert.match(r.stdout, /ALSO 1 TERMINAL-CLOSED/);
  assert.match(r.stdout, /agent-rung-honest-gate/);

  const blocked = fixture(leafOf('blocked', { blockedReason: 'OWNER DESIGN FORK.' }));
  cleanup(t, blocked);
  const r2 = run(blocked, '--all');
  assert.equal(r2.status, 1);
  assert.match(r2.stdout, /1 BLOCKED/);
  assert.doesNotMatch(r2.stdout, /ALSO \d+ TERMINAL-CLOSED/);
});

test('a missing leaf is still UNKNOWN-not-a-clearance, and --strict still escalates it', (t) => {
  const dir = fixture(leafOf('stopped'));
  cleanup(t, dir);
  const r = run(dir, 'stopped-s9999-20260730-000000-lane-z-no-such-slice.md');
  assert.equal(r.status, 0);
  assert.match(r.stdout, /\? UNKNOWN/);
  assert.match(r.stdout, /not a clearance/);
  const strict = run(dir, 'stopped-s9999-20260730-000000-lane-z-no-such-slice.md', '--strict');
  assert.equal(strict.status, 2);
});
