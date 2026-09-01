#!/usr/bin/env node
/**
 * authorable-unpriced-block-guard.test.mjs — F-2264-1.
 *
 * `authorable-candidates`' UNPRICED branch printed two facts demanding OPPOSITE
 * acts byte-identically, and named the wrong one:
 *
 *   (a) the leaf records NOTHING                  -> measure it yourself
 *   (b) the leaf records a refusal this reader     -> go READ it, and repair
 *       cannot parse (an `authoringBlock` with a
 *       class / finding / measuredBy but no
 *       `reason`)
 *
 * Both printed `no refusal on record — a refilling fire must measure this one
 * itself`. §2E reads this tool to decide what a fire may author, so told "nothing
 * is on record" about a leaf whose block already says `owner-gated`, a fire
 * measures, concludes the work is available, and authors work the owner reserved.
 * The erased evidence is exactly the evidence that forbids it.
 *
 * TESTED FROM WHERE THE CALLER STANDS (F-2209-1 / F-2210-1): the pure resolver is
 * exercised directly AND the CLI is spawned against a fixture root, because this
 * tool's default mode is advisory and its real interface is stdout — asserting
 * only the resolver tests the half nobody reads.
 *
 * TEETH. Restoring the pre-cure `resolveRefusal` + print site verbatim reds the
 * conflation arms; each over-general cure is caught by exactly the reverse
 * control built for it:
 *   - inventing a new class for the unreadable branch  -> the counts arm ALONE
 *   - making the unreadable branch REFUSE (exit != 0)  -> the advisory arm ALONE
 *   - declaring only on the unreadable branch          -> the absent-branch arm
 *   - re-typing the readability predicate inline       -> the derivation arm
 *   - breaking the readable path                       -> the priced arm
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import {
  resolveRefusal,
  blockIsReadable,
  blockState,
  summarise,
} from './authorable-candidates.mjs';

const TOOL = path.join(path.dirname(fileURLToPath(import.meta.url)), 'authorable-candidates.mjs');

const UNREADABLE = {
  id: 'recorded-but-unreadable',
  title: 'block declares a class and a finding, but omits reason',
  status: 'planned',
  authoringBlock: { class: 'owner-gated', finding: 'F-1313-3', measuredBy: 's1336' },
};
const ABSENT = {
  id: 'nothing-recorded',
  title: 'no authoringBlock and no prose key at all',
  status: 'planned',
};
const READABLE = {
  id: 'properly-priced',
  title: 'a normal, fully-recorded refusal',
  status: 'planned',
  authoringBlock: { class: 'owner-gated', finding: 'F-9-9', measuredBy: 's9', reason: 'Robin owes a word.' },
};

/** Spawn the CLI against a throwaway root holding exactly these leaves. */
function runCli(leaves, args = []) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's2264-'));
  try {
    fs.mkdirSync(path.join(dir, 'tasks'), { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'tasks', 'goals.json'),
      JSON.stringify({ id: 'root', children: leaves }, null, 2),
    );
    const r = spawnSync('node', [TOOL, '--root', dir, ...args], { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8' });
    return { out: r.stdout ?? '', err: r.stderr ?? '', rc: r.status };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** The block of stdout describing one leaf, so arms assert on the right leaf. */
function sectionFor(out, id) {
  const blocks = out.split('\n\n').filter((b) => b.includes(id));
  assert.ok(blocks.length, `no stdout section for ${id} — the arm did not reach its subject`);
  return blocks.join('\n');
}

// ---------------------------------------------------------------- conflation

test('the two UNPRICED branches are not byte-identical — the conflation itself', () => {
  const out = runCli([UNREADABLE, ABSENT]).out;
  assert.ok(out.length, 'CLI produced nothing — the arm never ran');
  const unreadable = sectionFor(out, 'recorded-but-unreadable');
  const absent = sectionFor(out, 'nothing-recorded');
  assert.notEqual(
    unreadable.replace('recorded-but-unreadable', '').replace(UNREADABLE.title, ''),
    absent.replace('nothing-recorded', '').replace(ABSENT.title, ''),
    'a leaf that records owner-gated and a leaf that records nothing printed the same thing',
  );
});

test('an unreadable block names the evidence it still carries', () => {
  const out = runCli([UNREADABLE]).out;
  const section = sectionFor(out, 'recorded-but-unreadable');
  assert.match(section, /owner-gated/, 'the declared class was erased from the report');
  assert.match(section, /F-1313-3/, 'the declared finding was erased from the report');
  assert.match(section, /s1336/, 'the declared measuredBy was erased from the report');
});

test('an unreadable block does NOT tell the reader to measure it themselves', () => {
  const section = sectionFor(runCli([UNREADABLE]).out, 'recorded-but-unreadable');
  assert.doesNotMatch(
    section,
    /must measure this one itself/,
    'told a fire to re-measure a leaf whose block already declares a refusal',
  );
  assert.match(section, /PRESENT/, 'never said the block is present');
});

test('the ABSENT branch is declared too, not left silent (F-2208-1)', () => {
  const section = sectionFor(runCli([ABSENT]).out, 'nothing-recorded');
  assert.match(section, /nothing is recorded to read/, 'the absent branch does not say what it found');
  assert.match(section, /measure this one itself/, 'the absent branch lost its owed act');
  // The legacy pin in authorable-candidates.test.mjs must survive: this cure adds
  // a declaration, it does not rewrite a message that was already true.
  assert.match(section, /no refusal on record/, 'the legacy wording was rewritten rather than extended');
});

test('an unreadable block with nothing salvageable says repair, not re-measure', () => {
  const leaf = { id: 'empty-block', title: 'block present but empty', status: 'planned', authoringBlock: {} };
  const section = sectionFor(runCli([leaf]).out, 'empty-block');
  assert.match(section, /repair the block/, 'gave no owed act for an empty block');
  assert.doesNotMatch(section, /must measure this one itself/, 'told the reader to re-measure a present block');
});

// ------------------------------------------------------------- reverse controls

test('REVERSE CONTROL: verdict and counts are unchanged — no new class invented', () => {
  const rows = [UNREADABLE, ABSENT].map((leaf) => ({ id: leaf.id, refusal: resolveRefusal(leaf) }));
  const counts = summarise(rows);
  assert.equal(counts.priced, 0);
  assert.equal(counts.unpriced, 2);
  assert.deepEqual(counts.byClass, { UNPRICED: 2 }, 'the cure invented a class and moved the headline');
  const out = runCli([UNREADABLE, ABSENT]).out;
  assert.match(out, /0 priced, 2 unpriced \(UNPRICED 2\)/, 'the printed headline moved');
});

test('REVERSE CONTROL: a readable block is still priced, with its class and reason', () => {
  const refusal = resolveRefusal(READABLE);
  assert.equal(refusal.priced, true);
  assert.equal(refusal.class, 'owner-gated');
  assert.equal(refusal.structured, true);
  assert.match(sectionFor(runCli([READABLE]).out, 'properly-priced'), /Robin owes a word/);
});

test('REVERSE CONTROL: it DECLARES and does not refuse — advisory still exits 0', () => {
  const advisory = runCli([UNREADABLE, ABSENT]);
  assert.equal(advisory.rc, 0, 'the unreadable branch was made to refuse; advisory must stay advisory');
  const strict = runCli([UNREADABLE, ABSENT], ['--strict']);
  assert.equal(strict.rc, 1, '--strict lost its red on unpriced leaves');
});

test('REVERSE CONTROL: a prose key still wins over an unreadable block', () => {
  const leaf = {
    id: 'prose-wins',
    title: 'unreadable block, but a legacy prose reason exists',
    status: 'planned',
    authoringBlock: { class: 'needs-spec' },
    blockedReason: 'the spec slice does not exist yet',
  };
  const refusal = resolveRefusal(leaf);
  assert.equal(refusal.priced, true, 'prose evidence was lost to the new branch');
  assert.equal(refusal.class, 'prose-only');
});

// ------------------------------------------------------------- drift protection

test('the readability predicate is DERIVED, not re-typed (F-2227-1)', () => {
  const source = fs.readFileSync(TOOL, 'utf8');
  const body = source.slice(source.indexOf('export function resolveRefusal'));
  assert.match(body.slice(0, 400), /blockIsReadable\(/, 'resolveRefusal stopped using the shared predicate');
  assert.equal(blockIsReadable(READABLE.authoringBlock), true);
  assert.equal(blockIsReadable(UNREADABLE.authoringBlock), false);
  assert.equal(blockIsReadable(null), false);
});

test('blockState is a STRING, so a careless truthiness test errs toward noticing (F-2212-1)', () => {
  assert.equal(typeof blockState(UNREADABLE), 'string');
  assert.equal(blockState(UNREADABLE), 'unreadable');
  assert.equal(blockState(ABSENT), 'absent');
  assert.ok(blockState(UNREADABLE), 'the unreadable state must be truthy');
});

test('a non-object authoringBlock is PRESENT, not absent', () => {
  const leaf = { id: 'string-block', title: 'block is a bare string', status: 'planned', authoringBlock: 'owner-gated' };
  assert.equal(blockState(leaf), 'unreadable');
  assert.equal(resolveRefusal(leaf).priced, false);
  assert.doesNotMatch(sectionFor(runCli([leaf]).out, 'string-block'), /nothing is on record/);
});
