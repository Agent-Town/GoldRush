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
 *
 * ────────────────────────────────────────────────────────────────────────────────
 * F-2421-1 — WIDENED s2421: THIS GUARD CLAIMED A CLASS AND ENUMERATED ONE SYNTAX.
 *
 * Everything above states the property correctly — "a fixture must not make the whole
 * scripts/ corpus its source... deliberately a CLASS assertion over every guard test".
 * The DETECTOR did not. `WHOLE_DIR_COPY` matches exactly one spelling, `cpSync(HERE,
 * …, recursive: true)`, so the SAME hazard written as an explicit enumerate-and-copy
 * loop passed this guard green.
 *
 * MEASURED s2421, not inferred. `desk-birth-gateless-row-guard.test.mjs` was born at
 * 601e7deb3 (2026-08-29) carrying, TWICE:
 *
 *     for (const f of fs.readdirSync(HERE)) {
 *       if (f.endsWith('.mjs') && !f.endsWith('.test.mjs')) {
 *         fs.copyFileSync(path.join(HERE, f), path.join(dir, f));
 *       }
 *     }
 *
 * — four days AFTER this guard landed (71aeb96ad, 2026-08-25). It sat green here for
 * ~3 days until s2420 reproduced the race BY HAND (10/10 crashes beside the two shadow
 * writers, 0/10 after the cure) and extracted `guard-source-snapshot.mjs`. Running
 * this file's own pre-cure detector against that shape returns FALSE.
 *
 * That is F-2358-1's lesson landing on this guard: when a finding names N members of a
 * class and its guard enumerates one, the guard is not a partial cure — IT CERTIFIES
 * THE UNCOVERED MEMBERS AS CLEAN.
 *
 * SEVERITY, STATED HONESTLY AND NOT INFLATED. Live offenders today: ZERO, over all
 * 173 .test.mjs files. Nothing is broken and no fixture is racing right now. This is a
 * FALSE RED hazard, never a false green — nothing was ever certified wrongly. What
 * earns the widening is that the realised cost was already paid once (F-2420-1, an
 * intermittent red on a REVERSE CONTROL inside the mandated last-act battery), and
 * that the next fixture author writing shape 2 gets a green from a guard whose own
 * words promise the class.
 *
 * IT ALSO GIVES THE F-2420-1 CURE ITS ADOPTION GUARD, which it did not have:
 * `copyGuardSources` had exactly ONE caller and nothing required a second. Accepting
 * it as the sanctioned route means a fixture may still snapshot the shared directory —
 * it just has to do it through the helper that skips ENOENT and only ENOENT.
 *
 * PROVENANCE IS THE WHOLE DISCRIMINATOR, and it was paid for. The obvious selector —
 * "copyFileSync whose source joins HERE" — flags two LEGITIMATE live fixtures:
 * `collection-guards-subject-set-guard` copies two NAMED constants, and
 * `desk-status-single-read-guard` copies import deps resolved from the subject's own
 * `from './x.mjs'` statements. Neither enumerates the shared directory, so neither can
 * race. A guard that reds on those would be excused into uselessness inside a week.
 * The defect requires the copied basename to be BOUND BY enumerating the shared dir.
 *
 * DECLARED BOUNDARY. The binder patterns cover `for (const x of readdirSync(H))` and a
 * `readdirSync(H)…(x) =>` callback chain — the measured shape and its obvious sibling.
 * A fixture could still evade this by binding the entry name through a construct
 * neither pattern reaches. That is a stated limit, not a claim of completeness.
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

/** The handles a fixture uses for the REAL, SHARED scripts/ directory. */
const H = String.raw`(?:HERE|SCRIPTS)`;

/** The sanctioned route: guard-source-snapshot.mjs (F-2420-1). */
const SANCTIONED = /\bcopyGuardSources\s*\(/;

/**
 * F-2421-1 shape 2: a per-entry copy whose SOURCE basename was BOUND BY enumerating the
 * shared directory. Returns the offending variable names (empty = clean).
 *
 * Two steps on purpose. Step 1 finds what the enumeration BINDS; step 2 asks whether
 * that same binding is used as a copy source. Collapsing them into one pattern is what
 * produces the two false positives named in the header — provenance is the discriminator,
 * so the variable has to be carried between the two questions.
 */
function racyPerEntryCopy(body) {
  const binders = [
    new RegExp(String.raw`for\s*\(\s*(?:const|let|var)\s+(\w+)\s+of\s+[^)]*readdirSync\s*\(\s*${H}\s*\)`, 'g'),
    new RegExp(String.raw`readdirSync\s*\(\s*${H}\s*\)[\s\S]{0,200}?\(\s*\(?\s*(\w+)\s*\)?\s*=>`, 'g'),
  ];
  const bound = new Set();
  for (const re of binders) for (const m of body.matchAll(re)) bound.add(m[1]);

  const offenders = [];
  for (const v of bound) {
    const copiesIt = new RegExp(
      String.raw`\b(?:copyFileSync|cpSync)\s*\(\s*(?:path\.)?join\s*\(\s*${H}\s*,\s*${v}\s*\)`,
    );
    if (copiesIt.test(body)) offenders.push(v);
  }
  return offenders;
}

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

test('no guard fixture enumerate-and-copies the shared scripts/ dir unaided (F-2421-1)', () => {
  const offenders = corpus()
    .filter((f) => racyPerEntryCopy(f.body).length > 0 && !SANCTIONED.test(f.body))
    .map((f) => f.name);
  assert.deepEqual(
    offenders,
    [],
    `these fixtures enumerate the REAL scripts/ dir and copy its entries without ` +
      `guard-source-snapshot.mjs, so an entry that vanishes mid-copy (the two lawful ` +
      `tmp-*-shadow-* writers, or a concurrent fire's bookkeeping) throws ENOENT and ` +
      `reds the battery: ${offenders.join(', ')}. Route it through ` +
      `copyGuardSources(HERE, dest, SUBJECT) — see guard-source-snapshot.mjs.`,
  );
});

test('DEFECT ARM: the enumerate-and-copy shape is what the widened detector detects', () => {
  // Built at runtime so this file's own source never carries the shape it bans — the
  // same reason PRE_CURE_LINE is assembled above. Excluding self from the corpus would
  // leave the one file most likely to grow the defect unpoliced.
  const COPY = `copy${'File'}Sync`;
  const READDIR = `readdir${'Sync'}`;
  const preCure =
    `  for (const f of fs.${READDIR}(HERE)) {\n` +
    `    if (f.endsWith('.mjs') && !f.endsWith('.test.mjs')) {\n` +
    `      fs.${COPY}(path.join(HERE, f), path.join(dir, f));\n` +
    `    }\n  }\n`;
  assert.deepEqual(
    racyPerEntryCopy(preCure),
    ['f'],
    'the detector does not match the shape measured at 601e7deb3, which it exists for',
  );
});

test('REVERSE CONTROL: copying NAMED constants out of scripts/ is permitted', () => {
  // collection-guards-subject-set-guard.test.mjs:62-63 does exactly this, legitimately:
  // a fixed pair of files the subject needs. No enumeration, so nothing can vanish.
  const COPY = `copy${'File'}Sync`;
  const legitimate =
    `  fs.${COPY}(path.join(SCRIPTS, GUARD), path.join(dir, GUARD));\n` +
    `  fs.${COPY}(path.join(SCRIPTS, SUBJECTS_MODULE), path.join(dir, SUBJECTS_MODULE));\n`;
  assert.deepEqual(racyPerEntryCopy(legitimate), [], 'a named-constant copy must not be flagged');
});

test('REVERSE CONTROL: copying RESOLVED IMPORT DEPS out of scripts/ is permitted', () => {
  // desk-status-single-read-guard.test.mjs:292-301 walks the subject's own `from './x'`
  // statements. The name comes from the SOURCE TEXT, not from a directory listing, so
  // the set is closed and cannot race.
  const COPY = `copy${'File'}Sync`;
  const legitimate =
    `  for (const m of readFileSync(file, 'utf8').matchAll(DEP_RE)) {\n` +
    `    const dep = m[1].slice(2);\n` +
    `    ${COPY}(path.join(SCRIPTS, dep), path.join(dir, dep));\n  }\n`;
  assert.deepEqual(racyPerEntryCopy(legitimate), [], 'a resolved-import copy must not be flagged');
});

test('REVERSE CONTROL: enumerating scripts/ to READ is permitted; only copying races', () => {
  // fixture-teardown, finding-id-pattern, desk-word-single-source and others all scan
  // the corpus this way. Banning the enumeration itself would red the whole census
  // family — the over-general cure this arm exists to catch.
  const READDIR = `readdir${'Sync'}`;
  const legitimate =
    `  const subjects = ${READDIR}(SCRIPTS)\n` +
    `    .filter((name) => name.endsWith('.test.mjs'))\n` +
    `    .map((file) => ({ file, source: readFileSync(file, 'utf8') }));\n`;
  assert.deepEqual(racyPerEntryCopy(legitimate), [], 'an enumerate-and-read census must not be flagged');
});

test('REVERSE CONTROL: enumerate-and-copy of a SCRATCH dir is permitted', () => {
  // The hazard is the SHARED directory, not the act. A fixture copying its own temp
  // tree has no concurrent writer and must stay legal.
  const COPY = `copy${'File'}Sync`;
  const READDIR = `readdir${'Sync'}`;
  const legitimate =
    `  for (const f of fs.${READDIR}(scratchDir)) {\n` +
    `    fs.${COPY}(path.join(scratchDir, f), path.join(dest, f));\n  }\n`;
  assert.deepEqual(racyPerEntryCopy(legitimate), [], 'a scratch-dir copy must not be flagged');
});

test('REVERSE CONTROL: the sanctioned helper route is accepted, not flagged', () => {
  // Otherwise the cure for F-2420-1 would be reported as the defect, and the only way
  // to satisfy this guard would be to stop snapshotting at all.
  const body = readFileSync(path.join(HERE, 'desk-birth-gateless-row-guard.test.mjs'), 'utf8');
  assert.ok(SANCTIONED.test(body), 'the cured fixture must still route through copyGuardSources');
  assert.deepEqual(
    racyPerEntryCopy(stripComments(body)),
    [],
    'the cured fixture must no longer carry a raw enumerate-and-copy loop',
  );
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
