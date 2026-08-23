#!/usr/bin/env node
/**
 * desk-birth-row-denominator-guard.test.mjs — F-2259-1.
 *
 * desk-birth-guard's PASS says "every owner-gated row filed this window reached
 * the desk". That claim ranges over whatever `addedRows()` admitted, and that
 * parser takes a line only if it LEADS with one of four glyphs after whitespace,
 * or contains the literal `**F-`. A row contributing to neither cannot enter
 * `qualifying`, so it is structurally incapable of failing the gate.
 *
 * The two admission tests each cover the other's blind spot, which is why this
 * survived: a row escapes ONLY when it uses BOTH house conventions at once — a
 * markdown bullet before the glyph AND the bracketed `**[F-id]` key.
 *
 * PROVEN BY MANUFACTURING, not by a green (arm 7): a fixture window whose ground
 * truth is an UNDESKED owner fork written in the escaping shape returns
 * `PASS — every owner-gated row filed this window reached the desk` at rc=0,
 * byte-identical in verdict and rc to a genuinely clean board.
 *
 * THE CURE DECLARES AND DOES NOT WIDEN MEMBERSHIP, and the restraint is MEASURED:
 * replaying all 1,133 real handoff windows, the obvious widening admits 168 extra
 * rows and produces exactly THREE new verdicts, ALL THREE FALSE (closure and
 * drain records). Arm 7 is the reverse control that pins this: an escaping row
 * must be NAMED and must still exit 0.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GUARD = path.join(HERE, 'desk-birth-guard.mjs');
const { unexaminedRows } = await import(pathToUrl(GUARD));

function pathToUrl(p) { return new URL(`file://${p.split(path.sep).map(encodeURIComponent).join('/')}`).href; }

const OWNER_GATE = 'GATE: OWNER decides the fork.';
const diffOf = (...lines) => ['--- a/tasks/BACKLOG.md', '+++ b/tasks/BACKLOG.md', ...lines.map((l) => `+${l}`)].join('\n');

test('1 — a row using BOTH house conventions at once escapes the parser and is NAMED', () => {
  const row = `- 🔺 **[F-9003-1] the fork. ${OWNER_GATE}`;
  const out = unexaminedRows(diffOf(row));
  assert.equal(out.length, 1, 'the escaping row must be reported');
  assert.match(out[0], /F-9003-1/);
});

test('2 — a bare-glyph row is ADMITTED, so it must NOT be reported (reverse control)', () => {
  assert.deepEqual(unexaminedRows(diffOf(`🔺 **[F-9003-1] the fork. ${OWNER_GATE}`)), []);
});

test('3 — a bullet row with a BARE **F- key is ADMITTED too (the other convention)', () => {
  assert.deepEqual(unexaminedRows(diffOf(`- 🔺 **F-9003-1** the fork. ${OWNER_GATE}`)), []);
});

test('4 — an excluded row with NO owner gate is NOT reported (qualifying set, not corpus)', () => {
  // s2230: price on the QUALIFYING set. Reporting every excluded line would be
  // inflation dressed as diligence — 168 rows across the live history.
  assert.deepEqual(unexaminedRows(diffOf('- 🔺 **[F-9004-1] a note. GATE: drain when lane-b reports.')), []);
});

test('5 — an excluded row with an owner gate but NO key is NOT reported', () => {
  // With no key there is nothing to desk and nothing to match, so naming it
  // would send a fire looking for an id that does not exist.
  assert.deepEqual(unexaminedRows(diffOf(`- 🔺 a fork with no id at all. ${OWNER_GATE}`)), []);
});

test('6 — a glyph outside the admitted four escapes and is reported', () => {
  const out = unexaminedRows(diffOf(`🔵 **[F-9005-1] pick a sky. ${OWNER_GATE}`));
  assert.equal(out.length, 1);
  assert.match(out[0], /F-9005-1/);
});

test('7 — CLI: an escaping UNDESKED owner fork is NAMED and still exits 0 (declare, do not refuse)', () => {
  const root = fixture([`- 🔺 **[F-9003-1] the fork. ${OWNER_GATE}`], '');
  const r = run(root);
  assert.equal(r.rc, 0, 'declaring must not turn into a refusal — widening was measured and is false 3/3');
  assert.match(r.out, /unexamined by the parser {2}: 1/);
  assert.match(r.out, /F-9003-1/, 'a count is not a name');
  assert.match(r.out, /ADVISORY, not a failure/);
});

test('8 — CLI: the denominator is declared on the HAPPY path too (F-2208-1)', () => {
  const root = fixture([`🔺 **F-9001-1** the fork. ${OWNER_GATE}`], '🔺 **F-9001-1**');
  const r = run(root);
  assert.equal(r.rc, 0);
  assert.match(r.out, /unexamined by the parser {2}: 0/,
    'a declaration that appears only on failure re-creates the ambiguity it removes');
  assert.doesNotMatch(r.out, /ADVISORY, not a failure/, 'no advisory when there is nothing to advise');
});

test('9 — CLI: the VERDICT is unchanged — an admitted undesked owner row still FAILS', () => {
  const root = fixture([`🔺 **F-9002-1** the fork. ${OWNER_GATE}`], '');
  const r = run(root);
  assert.equal(r.rc, 1, 'the declaration must not soften the gate it sits beside');
  assert.match(r.err, /F-9002-1/);
});

test('10 — CLI: an escaping row does not inflate the owner-gated count it sits under', () => {
  const root = fixture([`- 🔺 **[F-9003-1] the fork. ${OWNER_GATE}`], '');
  assert.match(run(root).out, /owner-gated rows filed {4}: 0/);
});

// --- fixture plumbing -------------------------------------------------------
function fixture(rows, deskTail) {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 's2259-birth-')));
  fs.mkdirSync(path.join(d, 'tasks'));
  const g = (a) => execFileSync('git', a, { cwd: d, encoding: 'utf8' });
  g(['init', '-q', '-b', 'main']);
  g(['config', 'user.email', 'f@x']);
  g(['config', 'user.name', 'fixture']);
  fs.writeFileSync(path.join(d, 'tasks/BACKLOG.md'), '# BACKLOG\n');
  fs.writeFileSync(path.join(d, 'STATUS.md'),
    "Last updated: 2026-01-01T00:00Z s1 handoff, lock CLEARED — base. 🔺 **OWNER'S DESK — 0 awaiting a word.**\n");
  g(['add', '-A']);
  g(['commit', '-qm', 's1 handoff: base']);
  fs.appendFileSync(path.join(d, 'tasks/BACKLOG.md'), `${rows.join('\n')}\n`);
  fs.writeFileSync(path.join(d, 'STATUS.md'),
    `Last updated: 2026-01-02T00:00Z s2 handoff, lock CLEARED — window. 🔺 **OWNER'S DESK — n awaiting a word.** ${deskTail}\n`);
  g(['add', '-A']);
  g(['commit', '-qm', 's2 handoff: window']);
  return d;
}

function run(root) {
  const r = spawnSync('node', [GUARD, '--root', root], { encoding: 'utf8' });
  return { rc: r.status, out: r.stdout || '', err: r.stderr || '' };
}
