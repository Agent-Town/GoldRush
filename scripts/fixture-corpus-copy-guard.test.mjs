/**
 * F-2284-1 — a guard-test fixture must not recursively copy its OWN script directory.
 *
 * WHY THIS EXISTS. `authorable-single-read-guard.test.mjs` built each fixture with
 * `cpSync(HERE, dir, { recursive: true })` — the entire live `scripts/` tree (503
 * entries at s2284), on every `run()` call. `cpSync` enumerates the source and then
 * copies entry by entry, so ANY concurrent mutation of `scripts/` inside that window
 * throws ENOENT. Two things make that a real hazard rather than a theoretical one:
 *
 *   1. THE RACING WRITER IS LAWFUL. F-1665-1 measured 38 fires writing one-shot splice
 *      helpers into `scripts/` while doing ordinary STATUS/goals bookkeeping, and 151
 *      of 421 tracked files there are single-fire scratch. A fire doing its job is the
 *      collision.
 *   2. THE ERROR ACCUSES THE WRONG SUBJECT. The path `cpSync` reports is the
 *      DESTINATION (`<tmp>/s2265-single-read-XXXXXX/scripts`), so the failure reads as
 *      "the fixture's own temp directory vanished" when the SOURCE is what moved.
 *      F-2283-4 read that message and concluded a detached §3.0b gate worktree was an
 *      unreliable host for `test:ledger-guards`. s2284's clean-room probe measured that
 *      claim false — same commit, only the root varying, both arms rc=0 in 72.7s/72.8s
 *      — and reproduced the ENOENT 5/5 by churning `scripts/` instead.
 *
 * THE PROPERTY, not the message: a fixture must not make the whole `scripts/` corpus
 * its source. This is deliberately a CLASS assertion over every guard test, not a check
 * on the one file that had the defect — the cure is cheap and the next fixture author
 * has no way to know any of the above.
 *
 * DELIBERATELY NOT a behavioural race arm. Reproducing the ENOENT needs ~300 files
 * churned in the live `scripts/` directory, which a gate battery must never do, and a
 * timing-dependent arm greens on a loaded machine — i.e. it would be excused into
 * uselessness inside a week (F-1460-1, the `cross-engine` fate).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/**
 * Comments are PROSE, not calls. The cured fixture explains the defect by quoting the
 * exact pre-cure line, and this guard's own header does too — matching those would make
 * the cure red itself, which is how a guard gets excused into uselessness (F-1460-1).
 * Strip comments before asking the question.
 */
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/** Every guard/test fixture in scripts/, comments removed. */
function corpus() {
  return readdirSync(HERE)
    .filter((f) => f.endsWith('.test.mjs'))
    .map((f) => ({ name: f, body: stripComments(readFileSync(path.join(HERE, f), 'utf8')) }));
}

/**
 * Build the offending shape at RUNTIME so this file's own source never contains it.
 * The alternative — excluding self from the corpus — would leave the one file most
 * likely to grow the defect unpoliced.
 */
const CP = `cp${'Sync'}`;
const PRE_CURE_LINE = `${CP}(HERE, dir, { recursive: true });`;

/**
 * A recursive copy whose SOURCE is the file's own directory handle (`HERE`, or a bare
 * `__dirname`-alike). Matches the shape regardless of the destination variable's name.
 */
const WHOLE_DIR_COPY = /\bcp(?:Sync)?\s*\(\s*HERE\s*,[^)]*recursive\s*:\s*true/;

test('the corpus is non-empty and contains the file this finding came from', () => {
  // This streak's own central lesson: an empty subject set drives every assertion to
  // vacuous-green, and an empty bucket is the shape of good news. Declare the corpus.
  const files = corpus();
  assert.ok(files.length >= 20, `corpus is ${files.length} test file(s) — too small to be real; the glob broke`);
  assert.ok(
    files.some((f) => f.name === 'authorable-single-read-guard.test.mjs'),
    'the file F-2284-1 was measured on is absent from the corpus — the guard is aimed at nothing',
  );
  console.log(`corpus: ${files.length} guard test file(s) scanned`);
});

test('no guard fixture recursively copies its own script directory (F-2284-1)', () => {
  const offenders = corpus().filter((f) => WHOLE_DIR_COPY.test(f.body)).map((f) => f.name);
  assert.deepEqual(
    offenders,
    [],
    `these fixtures copy the whole scripts/ corpus into a temp dir, which races any ` +
      `concurrent write to scripts/ and reports the failure against the DESTINATION: ` +
      `${offenders.join(', ')}. Copy only what the subject needs — see the block at ` +
      `authorable-single-read-guard.test.mjs run().`,
  );
});

test('DEFECT ARM: the pre-cure shape is what this guard actually detects', () => {
  // Manufacture the defect rather than admire the green. A guard whose violation path
  // is never executed is indistinguishable from one with no teeth.
  const preCure = `  const dir = path.join(base, "scripts");\n  ${PRE_CURE_LINE}\n`;
  assert.ok(WHOLE_DIR_COPY.test(preCure), 'the detector does not match the shape it was built for');
});

test('REVERSE CONTROL: copying a SINGLE named file is permitted, not flagged', () => {
  // An over-general cure ("ban cpSync in fixtures") would break every legitimate
  // single-file copy — e.g. suite-red-inventory's scriptCopies() of one reducer.
  const legitimate = `  ${CP}(path.join(HERE, 'authorable-candidates.mjs'), path.join(dir, 'authorable-candidates.mjs'));\n`;
  assert.equal(WHOLE_DIR_COPY.test(legitimate), false, 'a single-file copy must not be flagged');
});

test('REVERSE CONTROL: the cured fixture still BUILDS its fixture dir and subject', () => {
  // The other over-general cure is to delete the copy and not replace it, leaving the
  // subject with nowhere to be written. Assert the replacement is present.
  const body = readFileSync(path.join(HERE, 'authorable-single-read-guard.test.mjs'), 'utf8');
  assert.match(body, /mkdirSync\(dir, \{ recursive: true \}\)/, 'the fixture dir must still be created');
  assert.match(
    body,
    /writeFileSync\(path\.join\(dir, 'authorable-candidates\.mjs'\), finalBody\)/,
    'the subject must still be written into the fixture dir',
  );
});

test('the detector survives a real file on disk, not just string literals', () => {
  // Guard against a regex that only ever sees hand-written fixtures in this file.
  const d = mkdtempSync(path.join(tmpdir(), 's2284-copy-guard-'));
  try {
    const f = path.join(d, 'sample.test.mjs');
    writeFileSync(f, `import { ${CP} } from "node:fs";\n${PRE_CURE_LINE}\n`);
    assert.ok(
      WHOLE_DIR_COPY.test(stripComments(readFileSync(f, 'utf8'))),
      'detector missed the shape when read from disk',
    );
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
});
