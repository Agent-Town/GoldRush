import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const goals = JSON.parse(fs.readFileSync(path.join(root, 'tasks/goals.json'), 'utf8'));
const leaves = goals.goals.flatMap((goal) => goal.subgoals.flatMap((subgoal) => subgoal.tasks));
const byId = new Map(leaves.map((leaf) => [leaf.id, leaf]));
// 'blocked' added s1097: a leaf whose work is FINISHED and gated on an owner decision has no other
// honest word — 'queued' would claim a queue entry that does not exist. s1096 parked rf-34 that way
// (F-1096-2) and this guard went red on its own bookkeeping commit, so the vocabulary follows the
// practice. A blocked leaf must say WHY, or the state is just a stall with no owner question in it.
const statuses = new Set(['planned', 'queued', 'building', 'blocked', 'merged', 'verified-by-owner']);

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

  for (const goal of goals.goals) {
    assert.match(goal.id, /^[a-z0-9-]+$/);
    assert.ok(goal.title && goal.subgoals.length);
    for (const subgoal of goal.subgoals) {
      assert.match(subgoal.id, /^[a-z0-9-]+$/);
      assert.ok(subgoal.title && subgoal.tasks.length);
      for (const leaf of subgoal.tasks) {
        assert.match(leaf.id, /^[a-z0-9-]+$/);
        assert.ok(leaf.title);
        assert.ok(statuses.has(leaf.status), `${leaf.id}: invalid status ${leaf.status}`);
        if (leaf.taskFile) assert.match(leaf.taskFile, /^[a-zA-Z0-9_-]+\.md$/);
        if (leaf.mergeHash) assert.match(leaf.mergeHash, /^[0-9a-f]{40}$/);
        if (leaf.status === 'merged') assert.ok(leaf.mergeHash, `${leaf.id}: merged without Git evidence`);
        if (leaf.status === 'blocked') assert.ok(leaf.blockedReason, `${leaf.id}: blocked without a reason`);
      }
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
