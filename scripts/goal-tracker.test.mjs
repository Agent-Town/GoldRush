import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const goals = JSON.parse(fs.readFileSync(path.join(root, 'tasks/goals.json'), 'utf8'));
// F-1123-1 (s1123): this used to be `goals.goals.flatMap(g => g.subgoals.flatMap(s => s.tasks))`,
// which silently skipped every ROOT-LEVEL `goal.tasks` entry. Six goals carry them (ten-eras 16,
// world-3d 2, factory-infra 25, art-brand 1, charter-press 7, foundry 8), so 59 of 371 task
// entries — 16% of the tree, including the whole factory-infra ladder — were never validated.
// That blind spot is HOW the defects below got written in the first place: 9 leaves with a status
// this vocabulary rejects, 2 leaves recording evidence under the unread key "mergeCommit", and a
// duplicate id (foundry-book) that :31's uniqueness assert could not see. Walk the tree, never a
// fixed depth. NOTE: scripts/dashboard-gen.sh:358 still has the identical bug (F-1123-2).
const collectTasks = (node, out = []) => {
  for (const task of node.tasks ?? []) out.push(task);
  for (const subgoal of node.subgoals ?? []) collectTasks(subgoal, out);
  return out;
};
const leaves = goals.goals.flatMap((goal) => collectTasks(goal));
const byId = new Map(leaves.map((leaf) => [leaf.id, leaf]));
// 'blocked' added s1097: a leaf whose work is FINISHED and gated on an owner decision has no other
// honest word — 'queued' would claim a queue entry that does not exist. s1096 parked rf-34 that way
// (F-1096-2) and this guard went red on its own bookkeeping commit, so the vocabulary follows the
// practice. A blocked leaf must say WHY, or the state is just a stall with no owner question in it.
// 'shipped', 'diagnosed' and 'superseded' added s1123 — same "vocabulary follows the practice"
// reasoning as 'blocked' above, and they were only invisible until now because of F-1123-1.
// The distinction between the last two is load-bearing for drain-block-check.mjs's --queue arm:
//   diagnosed  = the diagnosis landed and follow-up work is genuinely OWED -> STAYS re-queueable.
//                calibrate-suite-workers is the live example; s1119 deliberately REMOVED its
//                mergeHash so the ancestry arm could not refuse work that is still owed.
//   superseded = the question is dead, carried down by successors that merged -> NOT re-queueable,
//                and it has no mergeHash to refuse it with (its own run was a lawful STOP), so
//                the status word is the ONLY thing that can stop a re-queue. cw-02-wrecker-
//                target-premise is the live example (it read a bare CLEAR before s1123).
// 'stopped' added s1146 — same "vocabulary follows the practice" reasoning again, but note WHICH
// direction the reconciliation ran, because it is the opposite of a guard being widened to suit its
// data: drain-block-check.mjs:46 has listed 'stopped' in TERMINAL_CLOSED_STATUSES all along, and it
// was THIS schema that was missing the word. s1144 recorded a lawful measure-first STOP as the
// near-miss 'stopped-lawful' (F-1146-2) — a value NO consumer reads, exactly the failure mode the
// F-1123-1 rider below already polices for the 'mergeCommit' KEY, one level up at the VALUE.
// It is load-bearing, not cosmetic: a lawful STOP correctly carries no mergeHash, so — per the
// superseded note above — the status word is the ONLY thing that can refuse a re-queue, and while
// the word was unrecognised the master read a bare CLEAR and was re-queueable with its own repair
// live on lane-b (Mistake #8 shape, measured s1146).
//   stopped = the run halted lawfully at its own gate, the question is NOT carried down yet ->
//             NOT re-queueable. Prefer this over 'superseded' while the successor is still in
//             flight; 'superseded' claims a successor that MERGED and would be a lie until it does.
// STILL DIVERGENT, deliberately not papered over (F-1146-3): drain-block-check also knows 'void'
// and 'abandoned', which this set still rejects. Unused today — add them when practice needs them,
// not speculatively.
const statuses = new Set([
  'planned', 'queued', 'building', 'blocked', 'diagnosed',
  'merged', 'shipped', 'superseded', 'stopped', 'verified-by-owner',
]);

test('goal tree schema is valid', () => {
  assert.equal(goals.version, 1);
  assert.deepEqual(goals.goals.map((goal) => goal.title), [
    'The Ten Eras', 'The 3D World', 'The Stream', 'Marketing', 'Factory Infra',
    'Art Style & Brand (interface, backgrounds, laws of the look)',
    'Laws & Framework (the constitution)',
    'Story & Canon (storybook, arc, the Fever)',
    'Multiplayer',
    'The Charter Press (level editor → the capstone product)',
    'The Foundry (extract the factory+engine as a reusable product)',
  ]); // expanded per owner order 2026-07-16 (+charter-press/foundry same week)
  assert.equal(goals.goals[0].subgoals.length, 14); // +era-doors +release-e1 (ratified 2026-07-22)
  assert.equal(new Set(leaves.map((leaf) => leaf.id)).size, leaves.length);

  const checkLeaf = (leaf) => {
    assert.match(leaf.id, /^[a-z0-9-]+$/);
    assert.ok(leaf.title);
    assert.ok(statuses.has(leaf.status), `${leaf.id}: invalid status ${leaf.status}`);
    if (leaf.taskFile) assert.match(leaf.taskFile, /^[a-zA-Z0-9_-]+\.md$/);
    if (leaf.mergeHash) assert.match(leaf.mergeHash, /^[0-9a-f]{40}$/);
    if (leaf.status === 'merged') assert.ok(leaf.mergeHash, `${leaf.id}: merged without Git evidence`);
    if (leaf.status === 'blocked') assert.ok(leaf.blockedReason, `${leaf.id}: blocked without a reason`);
    // F-1123-1 rider: two leaves recorded their evidence as "mergeCommit", a key NO consumer reads
    // (this test asserts leaf.mergeHash; drain-block-check.mjs's isMainAncestor reads
    // leaf.mergeHash). Such a leaf is simultaneously "merged without evidence" here and "not
    // shipped" to the queue guard — a Mistake-#8 shape. Reject the near-miss key by name.
    assert.equal(leaf.mergeCommit, undefined, `${leaf.id}: use "mergeHash", not "mergeCommit"`);
  };

  for (const goal of goals.goals) {
    assert.match(goal.id, /^[a-z0-9-]+$/);
    assert.ok(goal.title && goal.subgoals.length);
    // Root-level goal.tasks are validated too — see F-1123-1 at the top of this file.
    for (const leaf of goal.tasks ?? []) checkLeaf(leaf);
    for (const subgoal of goal.subgoals) {
      assert.match(subgoal.id, /^[a-z0-9-]+$/);
      assert.ok(subgoal.title && subgoal.tasks.length);
      for (const leaf of subgoal.tasks) checkLeaf(leaf);
    }
  }
});

test('ten sampled merged leaves have a done receipt and ancestral merge', () => {
  const samples = new Map([
    ['e1-engine', '7af56d62392e5f9976075039d0b0a8d88eca7ca9'],
    ['e1-contracts', '22af8fd9a3320145496dfbe8859f256b75e7972b'],
    ['e1-boss', '0bb7c071460fbb82ff6105733328b982729d2ccc'],
    ['e1-art', '3c749607d0e6e5668ee3232e62e875b8af9fac50'],
    ['e1-town', '7eb62f41757f7034d46db26958e21eb2553ec2d6'],
    ['e1-maps', 'e84997d689e214bf66f1c32e95442e0b924c62a4'],
    ['e2-engine', '08b336fadb9faa0cc5d0e779814ff5321b042197'],
    ['e2-contracts', 'a21821ada94448b6fe1a66047c1dfc46c502f92f'],
    ['e2-town', '08b336fadb9faa0cc5d0e779814ff5321b042197'],
    ['e2-maps', 'fcfdcd76304b69d85ab8c09e84cc140c1ca4e738'],
  ]);
  const doneFiles = fs.readdirSync(path.join(root, 'tasks/done'));

  for (const [id, expectedHash] of samples) {
    const leaf = byId.get(id);
    assert.ok(leaf, `${id}: missing leaf`);
    assert.ok(doneFiles.some((file) => file.endsWith(`-${leaf.taskFile}`)), `${id}: missing done receipt`);
    assert.equal(leaf.mergeHash, expectedHash, `${id}: merge receipt changed`);
    assert.equal(
      spawnSync('git', ['merge-base', '--is-ancestor', leaf.mergeHash, 'main'], { cwd: root }).status,
      0,
      `${id}: ${leaf.mergeHash} is not ancestral to main`,
    );
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-goals-'));
  try {
    const dashboard = path.join(tempDir, 'dashboard.html');
    execFileSync('bash', ['scripts/dashboard-gen.sh'], {
      cwd: root,
      env: {
        ...process.env,
        GOLD_RUSH_ROOT: root,
        GOLD_RUSH_DASHBOARD_OUT: dashboard,
        GOLD_RUSH_GOAL_TREE_TMP: path.join(tempDir, 'goal-tree.html'),
        GOLD_RUSH_BLOCKED_SEEN: path.join(tempDir, 'blocked-seen'),
        GOLD_RUSH_HEALTH_LOG: path.join(tempDir, 'health.log'),
      },
      stdio: 'pipe',
    });
    const html = fs.readFileSync(dashboard, 'utf8');
    for (const id of samples.keys()) {
      assert.match(html, new RegExp(`data-task-id="${id}" data-status="merged"`));
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
