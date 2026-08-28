#!/usr/bin/env node
/**
 * source-pointer-guard.test.mjs — F-2338-1, s2338.
 *
 * Every red arm is PROVEN BY MANUFACTURING THE DEFECT on a fixture root, never by
 * admiring a green: a passing guard does not execute its violation path, so its
 * green is not evidence about its red (the s1299/s1300 standard).
 *
 * The arms are spawned through the CLI with `--root`, not by importing scanFile.
 * F-2209-1's rule: exporting a decision to make it testable creates a NEW untested
 * seam at the call site, and F-2210-1's: the observable a caller reads here is
 * BOTH the exit code and stdout, so both are asserted. Testing scanFile alone would
 * pass while main() ignored its result entirely.
 *
 * The FALSE-POSITIVE controls (arms 5, 6, 8) are the ones that matter most. This
 * guard's whole design bet is that a narrow, identifier-anchored key beats the wide
 * one that scored four false positives out of five extras (list markers, counts, a
 * cross-file pointer). If those arms ever go red the key has widened, and a guard
 * that cries wolf gets routed around and then protects nothing (F-1460-1).
 */
import { test } from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const GUARD = join(dirname(fileURLToPath(import.meta.url)), 'source-pointer-guard.mjs');

/** A fixture root holding the given {name: contents} files. */
function rootWith(files) {
  const dir = mkdtempSync(join(tmpdir(), 'sourceptr-'));
  for (const [name, body] of Object.entries(files)) writeFileSync(join(dir, name), body);
  return dir;
}

function run(root, extra = []) {
  const r = spawnSync('node', [GUARD, '--root', root, ...extra], {
    encoding: 'utf8', timeout: 60000,
  });
  return { rc: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

/**
 * A subject file whose `target` function sits at a KNOWN line, with a comment
 * citing `cited`. Line 1 is the comment, so `target` lands on line 4.
 */
function subject(cited) {
  return [
    `// the declaration is \`target\` at :${cited} and this is the citation`,
    '',
    '',
    'export function target() { return 1; }',
    '',
  ].join('\n');
}

test('1. a rotted same-file pointer REDS and names the file, symbol and both lines', () => {
  const root = rootWith({ 'a.mjs': subject(99) });
  const { rc, out } = run(root);
  assert.equal(rc, 1, 'a rotted pointer must exit 1');
  assert.match(out, /FAIL/);
  assert.match(out, /a\.mjs:1/);
  assert.match(out, /`target`/);
  assert.match(out, /:99/, 'must name the cited line');
  assert.match(out, /:4/, 'must name the real declaration line');
  rmSync(root, { recursive: true, force: true });
});

test('2. REVERSE CONTROL — a correct pointer PASSES', () => {
  const root = rootWith({ 'a.mjs': subject(4) });
  const { rc, out } = run(root);
  assert.equal(rc, 0, 'a correct pointer must exit 0');
  assert.match(out, /PASS/);
  rmSync(root, { recursive: true, force: true });
});

test('3. TOLERANCE — a pointer aimed at the docstring above the declaration is NOT rot', () => {
  // :2 is two lines above the declaration at :4 — a legitimate aim at the comment
  // block, and reding it would be the false-positive direction.
  const root = rootWith({ 'a.mjs': subject(2) });
  const { rc } = run(root);
  assert.equal(rc, 0, 'a within-tolerance aim must not red');
  rmSync(root, { recursive: true, force: true });
});

test('4. a CROSS-FILE citation is counted and named, never silently dropped or redded', () => {
  const root = rootWith({
    'a.mjs': '// see `somewhereElse` at :4210 for the real implementation\nexport const x = 1;\n',
    'b.mjs': subject(4), // keeps the corpus non-empty so arm 7 is not what fires
  });
  const { rc, out } = run(root);
  assert.equal(rc, 0, 'an undecidable cross-file pointer must not red');
  assert.match(out, /cross-file citations \(not checkable here\): 1/,
    'it must be COUNTED — the third bucket, not a silent drop');
  rmSync(root, { recursive: true, force: true });
});

test('5. FALSE-POSITIVE CONTROL — a list marker beside a backticked local symbol is not a citation', () => {
  const root = rootWith({
    // "(1)" is a list marker. The wide key read this as a coordinate and reported
    // art-staging-audit.mjs:83 as rot; it is not.
    'a.mjs': '// (1) tracking ref BEHIND the wire -> `target` too SMALL -> false ALARM\nexport function target() {}\n',
    'b.mjs': subject(4),
  });
  const { rc, out } = run(root);
  assert.equal(rc, 0, 'a list marker must never be read as a coordinate');
  assert.match(out, /same-file citations checked: 1/,
    'only b.mjs may be counted — a.mjs contributes no citation at all');
  rmSync(root, { recursive: true, force: true });
});

test('6. FALSE-POSITIVE CONTROL — a count in prose is not a coordinate', () => {
  const root = rootWith({
    // Modelled verbatim on authorable-candidates.mjs:9, which the wide key misread.
    'a.mjs': '// Measured s2181 at the goal tree (874 nodes carrying `target`+`status`):\nexport function target() {}\n',
    'b.mjs': subject(4),
  });
  const { rc, out } = run(root);
  assert.equal(rc, 0, 'a bare count must never be read as a coordinate');
  assert.match(out, /same-file citations checked: 1/);
  rmSync(root, { recursive: true, force: true });
});

test('7. THE RUNG — an EMPTY subject set REFUSES rc=2, it does not PASS', () => {
  // "nothing to check" and "everything checks out" must not print the same green.
  const root = rootWith({ 'a.mjs': 'export const x = 1;\n' });
  const { rc, out } = run(root);
  assert.equal(rc, 2, 'zero checkable citations is "could not answer" (2), not a refusal (1) and not a pass (0)');
  assert.match(out, /CANNOT VERIFY/);
  // The BANNER, not the bare word: both refusals explain themselves with the
  // sentence "A PASS here would be a claim about a corpus this run never read", so
  // a /PASS/ blob test fails on the guard's own honesty. Assert the OBSERVABLE.
  assert.doesNotMatch(out, /PASS — every checkable/, 'an unread corpus must never print the pass banner');
  rmSync(root, { recursive: true, force: true });
});

test('8. FALSE-POSITIVE CONTROL — the citation shape in real CODE is not a comment pointer', () => {
  // The string below carries the citation shape EXACTLY — backticked symbol, then
  // " at :99" — so it is indistinguishable from a real pointer to the key. Only the
  // comment test keeps it out of the subject set. An earlier draft of this arm used
  // code that the key rejected anyway, so it passed without discriminating anything
  // and the reverse-control sweep exposed it: the "scan every line" variant
  // reddened NOTHING. A fixture the key already refuses proves nothing about where
  // the key is applied.
  const root = rootWith({
    'a.mjs': 'const doc = "`target` at :99";\nexport function target() {}\n',
    'b.mjs': subject(4),
  });
  const { rc, out } = run(root);
  assert.equal(rc, 0);
  assert.match(out, /same-file citations checked: 1/, 'only comment lines are subjects');
  rmSync(root, { recursive: true, force: true });
});

test('9. the corpus declaration prints on the HAPPY PATH, not only on failure', () => {
  // F-2208-1: a declaration that appears only on failure re-creates the ambiguity
  // it removes. This line is what separates "checked 1 and it agreed" from
  // "checked nothing".
  const root = rootWith({ 'a.mjs': subject(4) });
  const { rc, out } = run(root);
  assert.equal(rc, 0);
  assert.match(out, /corpus\s+: \d+ source file\(s\)/);
  assert.match(out, /same-file citations checked: 1/);
  rmSync(root, { recursive: true, force: true });
});

test('10. an unenumerable root REFUSES rc=2 rather than reporting a clean corpus', () => {
  const root = mkdtempSync(join(tmpdir(), 'sourceptr-'));
  const missing = join(root, 'does-not-exist');
  const { rc, out } = run(missing);
  assert.equal(rc, 2, 'an unreadable corpus is an instrument failure, not a verdict');
  // The DISTINCT refusal, not merely rc=2. The empty-subject refusal (arm 7) also
  // exits 2, so an unenumerable root that quietly degrades to an empty corpus would
  // still satisfy a bare rc test — measured: the sweep's "report an empty corpus
  // instead of refusing" variant reddened NOTHING until this line named the cause.
  // Two refusals that owe different acts must be told apart (F-2225-1's rule: a
  // declaration must name the state the verdict actually came from).
  assert.match(out, /could not enumerate/, 'must name the enumeration failure, not fall through to the empty-corpus refusal');
  assert.doesNotMatch(out, /PASS — every checkable/, 'an unread corpus must never print the pass banner');
  rmSync(root, { recursive: true, force: true });
});

test('11. a .sh comment carries pointers too — the corpus is mixed by design', () => {
  const root = rootWith({
    'a.sh': ['# the helper `resolve_it` at :9 does the work', '', '', '', '', '', '',
      '', 'resolve_it() {', '  echo hi', '}', ''].join('\n'),
  });
  const { rc, out } = run(root);
  assert.equal(rc, 0, 'a shell function declaration must satisfy its own citation');
  assert.match(out, /same-file citations checked: 1/);
  rmSync(root, { recursive: true, force: true });
});

test('13. a corpus the FILE key emptied names the file key, not the citation key', () => {
  // F-2341-1. Arm 7 covers the OTHER empty: files were read, no citation matched.
  // This is the case where the root is perfectly readable and the SOURCE extension
  // list simply selects nothing — measured live at `--root src`, which holds only
  // .ts. Both exit 2, so a bare rc test cannot tell them apart (arm 10's lesson,
  // one level in). Accusing the citation key here sends the next fire hunting a key
  // regression that never happened, which is the F-1425-2 shape: a refusal whose
  // message accuses the wrong subject.
  const root = rootWith({ 'a.ts': subject(4), 'notes.md': 'not source\n' });
  const { rc, out } = run(root);
  assert.equal(rc, 2, 'an empty file selection is "could not answer", not a pass');
  assert.match(out, /corpus\s+: 0 source file\(s\)/, 'the discriminating number must still print');
  assert.match(out, /FILE key selected nothing/, 'must name the key that actually emptied the set');
  assert.doesNotMatch(out, /CITATION key matched nothing/, 'must not accuse the citation key for a file-key empty');
  assert.doesNotMatch(out, /PASS — every checkable/, 'an unread corpus must never print the pass banner');
  rmSync(root, { recursive: true, force: true });
});

test('14. REVERSE CONTROL — files read but no citations still names the CITATION key', () => {
  // Guards the over-general cure: collapsing both empties into the file-key wording
  // would make arm 7's real case lie in the opposite direction.
  const root = rootWith({ 'a.mjs': 'export const x = 1;\n' });
  const { rc, out } = run(root);
  assert.equal(rc, 2);
  assert.match(out, /corpus\s+: 1 source file\(s\)/);
  assert.match(out, /CITATION key matched nothing across 1 file\(s\)/, 'files WERE read — the citation key is the right subject here');
  assert.doesNotMatch(out, /FILE key selected nothing/);
  rmSync(root, { recursive: true, force: true });
});

test('12. a nested directory is NOT walked — the corpus claim is one directory deep', () => {
  // Stated as a test rather than left implicit: the declaration says "N source
  // file(s) under <dir>", and a reader must be able to trust that the number is the
  // whole subject set at that level rather than a partial walk.
  const root = rootWith({ 'a.mjs': subject(4) });
  mkdirSync(join(root, 'nested'));
  writeFileSync(join(root, 'nested', 'b.mjs'), subject(99));
  const { rc, out } = run(root);
  assert.equal(rc, 0, 'a rot in an unscanned subdirectory must not red — it is out of scope');
  assert.match(out, /corpus\s+: 1 source file\(s\)/);
  rmSync(root, { recursive: true, force: true });
});
