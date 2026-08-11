import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { plannedLeaves, resolveRefusal, summarise } from './authorable-candidates.mjs';

const GUARD = fileURLToPath(new URL('./authorable-candidates.mjs', import.meta.url));

function run(goals, extraArgs = []) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'authorable-'));
  fs.mkdirSync(path.join(root, 'tasks'));
  fs.writeFileSync(path.join(root, 'tasks', 'goals.json'), JSON.stringify(goals, null, 2));
  try {
    return spawnSync(process.execPath, [GUARD, '--root', root, ...extraArgs], { encoding: 'utf8' });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const leaf = (extra) => ({ goals: [{ id: 'rung', title: 'A rung', status: 'planned', ...extra }] });

// --- the defect this guard exists for: an unpriced planned leaf reads as free work ---

test('an UNPRICED planned leaf is reported and fails --strict', () => {
  const result = run(leaf({}), ['--strict']);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /UNPRICED {2}rung/);
  assert.match(result.stdout, /no refusal on record/);
  assert.match(result.stdout, /1 planned leaf\/leaves — 0 priced, 1 unpriced/);
});

test('the default stays advisory — an unpriced leaf must not red the board', () => {
  const result = run(leaf({}));
  assert.equal(result.status, 0);
  assert.match(result.stdout, /0 priced, 1 unpriced/);
});

// --- classification: the discriminator that decides WHO is owed ---

test('a structured authoringBlock is classified, cited, and priced', () => {
  const result = run(leaf({
    authoringBlock: {
      class: 'owner-gated', finding: 'F-9999-1', measuredBy: 's9999', reason: 'three ratification questions are open',
    },
  }), ['--strict']);
  assert.equal(result.status, 0, 'a priced leaf must not trip --strict');
  assert.match(result.stdout, /OWNER-GATED {2}rung/);
  assert.match(result.stdout, /cited: F-9999-1 · s9999/);
});

test('attended-owed is reported as its own class, never folded into owner-gated', () => {
  const result = run(leaf({ authoringBlock: { class: 'attended-owed', reason: 'no headless system to attach to' } }));
  assert.match(result.stdout, /ATTENDED-OWED {2}rung/);
  assert.doesNotMatch(result.stdout, /OWNER-GATED/);
});

test('an UNKNOWN declared class degrades to unclassified and says so, rather than being trusted', () => {
  const refusal = resolveRefusal({ id: 'x', status: 'planned', authoringBlock: { class: 'owner-frok', reason: 'typo' } });
  assert.equal(refusal.priced, true);
  assert.equal(refusal.knownClass, false);
  assert.equal(refusal.class, 'unclassified');
  const result = run(leaf({ authoringBlock: { class: 'owner-frok', reason: 'typo' } }));
  assert.match(result.stdout, /declared class "owner-frok" is not a known class/);
});

// --- the many-spellings lesson (F-1582-1): prose reasons must resolve, but not masquerade ---

test('a legacy prose key counts as priced but is marked class-unreadable', () => {
  const result = run(leaf({ blockedReason: 'held pending a design fork' }), ['--strict']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /PROSE-ONLY {2}rung/);
  assert.match(result.stdout, /prose only, key "blockedReason" — class unreadable/);
});

test('the note_sNNNN family resolves — a reason must not be missed for its spelling', () => {
  const refusal = resolveRefusal({ id: 'x', status: 'planned', note_s1475: 'stop recorded, not a failure' });
  assert.equal(refusal.priced, true);
  assert.equal(refusal.proseKey, 'note_s1475');
});

test('an authoringBlock WITHOUT a reason is not a price — it falls through', () => {
  const bare = resolveRefusal({ id: 'x', status: 'planned', authoringBlock: { class: 'owner-gated' } });
  assert.equal(bare.priced, false, 'an empty block must not read as priced');
  const withProse = resolveRefusal({ id: 'x', status: 'planned', authoringBlock: { class: 'owner-gated' }, note: 'real reason' });
  assert.equal(withProse.class, 'prose-only');
});

// --- denominator: only `planned` is a candidate ---

test('non-planned leaves are outside the denominator', () => {
  const goals = {
    goals: [
      { id: 'a', status: 'merged', mergeHash: 'x' },
      { id: 'b', status: 'blocked', blockedReason: 'owner' },
      { id: 'c', status: 'planned' },
    ],
  };
  assert.deepEqual(plannedLeaves(goals).map((l) => l.id), ['c']);
  assert.equal(summarise([{ refusal: resolveRefusal({ id: 'c', status: 'planned' }) }]).unpriced, 1);
});

test('planned leaves are found at any depth, through subgoals AND tasks', () => {
  const goals = {
    goals: [{
      id: 'root',
      status: 'merged',
      subgoals: [{ id: 'mid', status: 'merged', tasks: [{ id: 'deep', status: 'planned' }] }],
    }],
  };
  assert.deepEqual(plannedLeaves(goals).map((l) => l.id), ['deep']);
});
