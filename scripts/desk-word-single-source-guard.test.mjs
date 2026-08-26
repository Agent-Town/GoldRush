#!/usr/bin/env node
/**
 * desk-word-single-source-guard — there is ONE desk-word pattern in this repo,
 * and all three desk parsers reach the SAME one. (F-2322-1, s2322.)
 *
 * WHY THIS EXISTS
 * ---------------
 * "Where on line-1 does the desk tail begin?" was implemented THREE times:
 * desk-declaration-guard.mjs, desk-birth-guard.mjs and desk-carryforward-guard.mjs
 * each carried a private, byte-identical `const DESK_WORD`, under a written
 * instruction to keep them in step. Nothing enforced that instruction, and one
 * of the three could not even count its own siblings ("Keep these two literals
 * identical" — there were three).
 *
 * That is the same shape twice already measured in these very files: F-2227-1
 * (isLockLine, four copies, one silently retired for hundreds of fires) and
 * F-2228-1 (the F-ID pattern, seven copies in three variants).
 *
 * THE DRIFT IS ASYMMETRIC, WHICH IS WHY THE COMMENTS WERE NOT ENOUGH.
 * Proven by manufacturing on the pre-cure tree (s2322), not by reading:
 *   - NARROWING one copy is CAUGHT. Dropping the backtick spelling from
 *     desk-carryforward or desk-birth reds the battery (rc=1, both arms).
 *   - WIDENING one copy is INVISIBLE. Adding a sixth spelling to
 *     desk-declaration alone left all 14 desk guards AND all three bare tools at
 *     rc=0, stdout unchanged.
 * The blind direction is the one the corpus's own maintenance note sends you in:
 * "Add the variant when a fire writes one." And the test nearest the hole is
 * literally named "the three desk parsers stay in step" — it asserts that ONE
 * file's copy reads the five spellings, and never that the three agree. A guard
 * that asserts a principle where it holds and never where it fails certifies its
 * own blind spot (F-2208-1).
 *
 * WHAT THIS ASSERTS — AND THE REVERSE CONTROLS THAT BOUND IT
 * ----------------------------------------------------------
 * Collapsing copies is only half the job (F-2228-1): you must also pin that the
 * survivor still behaves correctly at BOTH ends. So this guard bounds the cure
 * in three directions, and each bound exists because an over-general cure would
 * otherwise pass:
 *   - RELAXING the separator to a wildcard would make every copy agree while
 *     letting "OWNER-DESK" (41 occurrences, all prose) supply the tail. Arm 4.
 *   - SHARING a /g regex is a hazard THIS CURE INTRODUCED: a consumer that
 *     reaches it with .test()/.exec() instead of matchAll advances a lastIndex
 *     the other two modules then read. That cross-module bug could not exist
 *     while the copies were private. Arm 5.
 *   - Collapsing to a pattern that takes the FIRST match rather than the LAST
 *     would let a prose mention earlier in line-1 supply the tail. Arm 6.
 *
 * Run: node --test scripts/desk-word-single-source-guard.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));

const declaration = await import(path.join(SCRIPTS, 'desk-declaration-guard.mjs'));
const birth = await import(path.join(SCRIPTS, 'desk-birth-guard.mjs'));
const carry = await import(path.join(SCRIPTS, 'desk-carryforward-guard.mjs'));

/** The three files that ask this question. Named, so a rename fails loud. */
const PARSERS = [
  'desk-declaration-guard.mjs',
  'desk-birth-guard.mjs',
  'desk-carryforward-guard.mjs',
];

const isScratch = (f) => /^_/.test(f) || /^tmp-s\d/.test(f);
const liveScripts = fs
  .readdirSync(SCRIPTS)
  .filter((f) => f.endsWith('.mjs') && !f.includes('.test.') && !isScratch(f));

/**
 * A handoff-shaped line-1. It must NOT read as a lock, or deskIds short-circuits
 * to {kind:'lock'} and every arm below would pass having compared nothing.
 */
const handoff = (tail) =>
  `Last updated: 2026-08-26T04:33Z s2322 handoff, lock CLEARED — work landed. ${tail}`;

/** All FIVE spellings the factory has actually written (s1472 + F-1542-1). */
const SPELLINGS = [
  'OWNER DESK',
  "OWNER'S DESK",
  'OWNER’S DESK', // curly
  'OWNERS DESK',
  'OWNER`S DESK', // backtick, U+0060 — F-1542-1
];

const deskLine = (word) => handoff(`\u{1F53A} **${word} — 1 awaiting a word.** \u{1F53A} **F-2322-1** open`);

/** The three parsers' observable answer to "is there a desk, and where?" */
function tailsFor(line) {
  return {
    birth: birth.deskTail(line),
    carry: carry.deskTail(line),
    declarationKind: declaration.deskIds(`${line}\nsecond line`).kind,
  };
}

test('control: the subjects exist, export what this guard drives, and the corpus is real', () => {
  // A census that silently reads nothing reports agreement it never observed
  // (F-2215-1). Assert the subject set before believing any verdict about it.
  assert.ok(liveScripts.length > 100, `live script corpus looks empty: ${liveScripts.length}`);
  for (const f of PARSERS) {
    assert.ok(fs.existsSync(path.join(SCRIPTS, f)), `parser missing: ${f}`);
  }
  assert.equal(typeof birth.deskTail, 'function');
  assert.equal(typeof carry.deskTail, 'function');
  assert.equal(typeof declaration.deskIds, 'function');
  assert.ok(declaration.DESK_WORD instanceof RegExp, 'the pattern must be exported to be shared');
});

test('the copies have COLLAPSED — exactly one desk-word declaration in the corpus', () => {
  const declarers = [];
  for (const f of liveScripts) {
    const src = fs.readFileSync(path.join(SCRIPTS, f), 'utf8');
    for (const line of src.split('\n')) {
      // A declaration, not a use: `const DESK_WORD = /.../` in any export shape.
      if (/^\s*(export\s+)?const\s+DESK_WORD\s*=/.test(line)) declarers.push(f);
    }
  }
  assert.deepEqual(
    declarers,
    ['desk-declaration-guard.mjs'],
    `the desk-word pattern must be declared exactly once. Found: ${declarers.join(', ') || '(none)'}`,
  );
});

test('all three parsers AGREE on every spelling — the direction that was invisible', () => {
  for (const word of SPELLINGS) {
    const line = deskLine(word);
    const { birth: b, carry: c, declarationKind } = tailsFor(line);
    assert.notEqual(b, null, `desk-birth went blind to ${JSON.stringify(word)}`);
    assert.notEqual(c, null, `desk-carryforward went blind to ${JSON.stringify(word)}`);
    assert.equal(
      declarationKind,
      'desk',
      `desk-declaration went blind to ${JSON.stringify(word)} — it would REFUSE on a real header`,
    );
    assert.equal(b, c, `the two deskTail implementations disagree on ${JSON.stringify(word)}`);
    assert.ok(b.startsWith(word), `tail must begin at the desk word, got ${JSON.stringify(b.slice(0, 40))}`);
  }
});

test('REVERSE CONTROL: the separator is not a wildcard — prose "OWNER-DESK" supplies no tail', () => {
  // The corpus names this hazard at the declaration site: 41 occurrences, all
  // prose. A cure that relaxed the separator would make all three copies agree
  // and pass every arm above while feeding them a prose fragment.
  for (const prose of ['OWNER-DESK', 'OWNER_DESK', "owner's desk", 'OWNERXDESK']) {
    const line = handoff(`a note about the ${prose} process, with no header.`);
    const { birth: b, carry: c, declarationKind } = tailsFor(line);
    assert.equal(b, null, `desk-birth took prose ${JSON.stringify(prose)} as a desk header`);
    assert.equal(c, null, `desk-carryforward took prose ${JSON.stringify(prose)} as a desk header`);
    assert.equal(declarationKind, 'none', `desk-declaration took prose ${JSON.stringify(prose)} as a desk`);
  }
});

test('REVERSE CONTROL: the shared /g pattern is STATELESS across consumers', () => {
  // The hazard this cure INTRODUCED. While the copies were private, a stray
  // .test()/.exec() could only corrupt its own file's lastIndex; now all three
  // modules read one instance. Every consumer must reach it through matchAll,
  // which clones the regex. Driving each parser twice, interleaved, is the
  // cheapest observable proof that nobody advances it.
  const line = deskLine("OWNER'S DESK");
  const first = tailsFor(line);
  const second = tailsFor(line);
  const third = tailsFor(line);
  assert.deepEqual(second, first, 'a second call disagreed with the first — lastIndex is being advanced');
  assert.deepEqual(third, first, 'a third call disagreed — the shared regex is stateful');
  assert.equal(declaration.DESK_WORD.lastIndex, 0, 'the shared instance must come to rest at lastIndex 0');
});

test('REVERSE CONTROL: the LAST desk word wins, so an earlier prose mention loses', () => {
  // Collapsing to a FIRST-match rule would agree across all three parsers and
  // pass arms 3 and 4, while quietly truncating every desk that mentions the
  // words in its own prose.
  const line = handoff(
    "I explain why the OWNER'S DESK convention exists, then write it: " +
      "\u{1F53A} **OWNER'S DESK — 1 awaiting a word.** \u{1F53A} **F-2322-1** open",
  );
  const { birth: b, carry: c, declarationKind } = tailsFor(line);
  assert.equal(declarationKind, 'desk');
  assert.equal(b, c, 'the two deskTail implementations disagree about which mention wins');
  assert.ok(
    b.includes('1 awaiting a word'),
    'the tail must start at the LAST desk word — an earlier prose mention must not win',
  );
  assert.ok(
    !b.includes('I explain why'),
    'the tail reached back to a prose mention: prose mentions must lose',
  );
});
