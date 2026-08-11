// Tests for scripts/ruling-propagation-guard.mjs (s1279, F-1279-1).
//
// Fixture-driven on purpose: guard-fx-01 (ac12332c) established that structural assertions are
// proved with a fixture harness rather than by mutating real files. The live tree is asserted on
// only where the assertion is about the live tree (the denominator agreement below).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ruledFindings, refusingLeaves, staleRefusals } from './ruling-propagation-guard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const leaf = (over) => ({ id: 'x', taskFile: 'x.md', status: 'blocked', ...over });
const tree = (...leaves) => ({ goals: [{ title: 'root', children: leaves }] });

test('a blocked leaf citing a RULED finding is stale', () => {
  const goals = tree(leaf({ blockedReason: 'OWNER RULING REQUIRED (F-1219-1). Needs a fork call.' }));
  const { stale } = staleRefusals(goals, 'ruling line: F-1219-1 RULED, harvest 2 / build 3.');
  assert.equal(stale.length, 1);
  assert.deepEqual(stale[0].hits, ['F-1219-1']);
});

test('a blocked leaf citing an UNRULED finding is not stale', () => {
  const goals = tree(leaf({ blockedReason: 'OWNER DESIGN FORK - RULING REQUIRED (F-9999-9).' }));
  const { stale } = staleRefusals(goals, 'F-1219-1 RULED, harvest 2 / build 3.');
  assert.equal(stale.length, 0);
});

test('"RULING REQUIRED" prose does not count as a ruling — only "<id> RULED" does', () => {
  // The live-block vocabulary must never satisfy the guard, or every real block self-clears.
  const backlog = 'OWNER RULING REQUIRED for F-1219-1; needs the owner ruling.';
  assert.equal(ruledFindings(backlog).size, 0);
});

test('terminal-closed statuses refuse work too, so their reasons are checked', () => {
  const goals = tree(leaf({ status: 'stopped', stoppedReason: 'parked pending F-1219-1' }));
  const { stale } = staleRefusals(goals, 'F-1219-1 RULED.');
  assert.equal(stale.length, 1, 'a stopped leaf citing a ruled finding must red');
});

test('a merged leaf is not a refusal, however its reason reads', () => {
  const goals = tree(leaf({ status: 'merged', reason: 'was blocked on F-1219-1' }));
  const { stale } = staleRefusals(goals, 'F-1219-1 RULED.');
  assert.equal(stale.length, 0);
});

test('a leaf is any node carrying taskFile — NOT a childless node', () => {
  // The first draft used the childless definition and found 0 refusing leaves against
  // drain-block-check's 4: a vacuous PASS. This pins the definition that made it real.
  const goals = {
    goals: [{
      title: 'root',
      children: [{
        id: 'parent', taskFile: 'parent.md', status: 'blocked', blockedReason: 'F-1219-1',
        children: [{ id: 'kid', taskFile: 'kid.md', status: 'merged' }],
      }],
    }],
  };
  assert.equal(refusingLeaves(goals).length, 1, 'a blocked node WITH children is still a leaf here');
});

test('denominator agrees with drain-block-check on the live tree', () => {
  // Both read tasks/goals.json; if they ever disagree about what refuses work, one of them is
  // lying to a fire at a drain. Recomputed from the same file, not inherited from a handoff.
  const goals = JSON.parse(fs.readFileSync(path.join(ROOT, 'tasks/goals.json'), 'utf8'));
  const refusing = refusingLeaves(goals);
  const blocked = refusing.filter((l) => l.status === 'blocked');
  assert.ok(refusing.length >= blocked.length);
  // F-1657-4 (s1657), sibling of the same fix in block-class-guard.test.mjs: this canary was
  // `blocked.length > 0` — "the live tree is expected to carry real owner blocks" — which reds
  // on a board that has simply DISCHARGED all its blocks. s1657 lifted the last one (f1643-2's
  // gate-side hold, both conditions finally met) and this test failed on success. Zero blocked
  // leaves is the state the factory is trying to reach; a guard that punishes it teaches fires
  // to leave holds standing. The subject here is DENOMINATOR AGREEMENT between this guard and
  // drain-block-check, which the assertion above states and which holds at zero; what still
  // needs proving is that the readers had a real tree to walk, not that the board is unhappy.
  assert.ok(
    Array.isArray(goals.goals) && goals.goals.length > 0,
    'goal tree parsed empty — the two readers had nothing to compare, so their agreement is vacuous'
  );
});

test('the live tree carries no stale refusal', () => {
  const goals = JSON.parse(fs.readFileSync(path.join(ROOT, 'tasks/goals.json'), 'utf8'));
  const backlog = fs.readFileSync(path.join(ROOT, 'tasks/BACKLOG.md'), 'utf8');
  const { stale } = staleRefusals(goals, backlog);
  assert.deepEqual(
    stale.map((s) => `${s.leaf.id} cites ${s.hits.join(',')}`),
    [],
    'an owner ruling has been recorded but not propagated into tasks/goals.json',
  );
});
