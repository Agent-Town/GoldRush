import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  plannedLeaves,
  resolveRefusal,
  summarise,
  unresolvedStatuses,
  RESOLVED_BY_DRAIN_BLOCK_CHECK,
} from './authorable-candidates.mjs';

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

// --- F-2180-1 (filed s2180, cured s2181): the census must STATE its denominator ---
//
// The defect was an over-claim, not a wrong number: the header called `planned`
// "the factory's whole authorable-candidate surface", so a fire that read the
// footer was told the question was covered and never looked further. Measured
// s2181, `building` (5 leaves) and `verified-by-owner` (11) are resolved by NO
// instrument — this tool filters `planned`, and drain-block-check resolves only
// `blocked` plus its two terminal sets.

test('a leaf in a status NO instrument resolves is named in the residue', () => {
  const result = run({
    goals: [
      { id: 'rung', title: 'A rung', status: 'planned', authoringBlock: { class: 'owner-gated', reason: 'owner' } },
      { id: 'half-built', title: 'Mid-flight', status: 'building' },
    ],
  });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /RESIDUE: 1 leaf\/leaves in 1 status\(es\) NO instrument resolves/);
  assert.match(result.stdout, /building {2}1/);
  assert.match(result.stdout, /· half-built/);
});

test('the residue is ADVISORY — an unresolved status must not trip --strict', () => {
  // Reding the board on legacy statuses would repeat the mistake --strict's
  // narrow scope exists to avoid. Only an UNPRICED planned leaf gates.
  const result = run({
    goals: [
      { id: 'rung', title: 'A rung', status: 'planned', authoringBlock: { class: 'owner-gated', reason: 'owner' } },
      { id: 'half-built', title: 'Mid-flight', status: 'building' },
      { id: 'seen', title: 'Owner saw it', status: 'verified-by-owner' },
    ],
  }, ['--strict']);
  assert.equal(result.status, 0, 'residue must not gate');
  assert.match(result.stdout, /RESIDUE: 2 leaf\/leaves in 2 status\(es\)/);
});

test('statuses SOME instrument resolves stay out of the residue', () => {
  const result = run({
    goals: [
      { id: 'a', status: 'merged', mergeHash: 'x' },
      { id: 'b', status: 'blocked', blockedReason: 'owner', blockClass: 'owner-fork' },
      { id: 'c', status: 'superseded', reason: 'replaced' },
      { id: 'd', title: 'A rung', status: 'planned', authoringBlock: { class: 'owner-gated', reason: 'owner' } },
    ],
  });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /RESIDUE: none/);
});

test('the mirrored status set does not drift from drain-block-check own literals', () => {
  // MIRRORED, NOT IMPORTED: drain-block-check calls main() unconditionally at its
  // foot, so importing it would EXECUTE the drain guard as a side effect of asking
  // this question. The mirror is therefore the "hardcoded list git already knows"
  // defect, and this is its mitigation — the same shape as the CODEX_FLOOR drift
  // guard in runner-restart-recipe.test.sh, and for the same reason.
  const src = fs.readFileSync(fileURLToPath(new URL('./drain-block-check.mjs', import.meta.url)), 'utf8');
  const literal = (name) => {
    const m = src.match(new RegExp('const ' + name + ' = new Set\\(\\[([^\\]]*)\\]\\)'));
    assert.ok(m, name + ' not found in drain-block-check.mjs — the mirror cannot be checked');
    return m[1].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  };
  const theirs = new Set([
    ...literal('TERMINAL_SHIPPED_STATUSES'),
    ...literal('TERMINAL_CLOSED_STATUSES'),
    'blocked',
  ]);
  assert.deepEqual(
    [...RESOLVED_BY_DRAIN_BLOCK_CHECK].sort(),
    [...theirs].sort(),
    'RESOLVED_BY_DRAIN_BLOCK_CHECK has drifted from drain-block-check own status sets',
  );
  // The `blocked` arm is not a Set literal — assert it by the code that reads it.
  assert.match(
    src,
    /node\.status === 'blocked'/,
    "drain-block-check no longer resolves 'blocked' the way the mirror assumes",
  );
});

test('unresolvedStatuses finds residue at any depth and sorts by count', () => {
  const goals = {
    goals: [{
      id: 'root',
      status: 'merged',
      subgoals: [{
        id: 'mid',
        status: 'building',
        tasks: [{ id: 'x', status: 'verified-by-owner' }, { id: 'y', status: 'verified-by-owner' }],
      }],
    }],
  };
  assert.deepEqual(unresolvedStatuses(goals), [
    { status: 'verified-by-owner', count: 2, ids: ['x', 'y'] },
    { status: 'building', count: 1, ids: ['mid'] },
  ]);
});
