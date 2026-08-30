/**
 * F-2363-1 (measured and cured s2363) — the guard for the guard.
 *
 * `collection-guards-cwd-invariance.test.mjs` now DERIVES its subject set from an opt-in marker
 * instead of transcribing two filenames. That cure creates exactly one new way to be silently
 * wrong, and it is the one F-2209-1 named: extracting a decision to make it testable relocates the
 * blind spot to the CALL SITE. Here there are two call sites — the SELECTOR (which files become
 * subjects) and the RUNNER (whether a defective subject actually reds) — and a green on either
 * says nothing about the other.
 *
 * This file exercises both, plus the marker COVERAGE census that makes the derivation fail SAFE:
 * a new collection guard that spawns `playwright --list` without the marker reds HERE, by name,
 * instead of silently sitting outside the invariance guard forever.
 *
 * ⚙️ NO PLAYWRIGHT IS SPAWNED. The invariance guard anchors its subject directory to its own
 * `import.meta.url`, so a COPY of it dropped into a fixture directory derives from the fixture.
 * That lets the runner be exercised against manufactured healthy and defective subjects in
 * milliseconds — and it doubles as proof of the relocation property s2221 had to add by hand
 * elsewhere. The real subjects are slow (~4.9 s) and are covered by the invariance guard itself in
 * `test:node-guards`; re-running them here would buy nothing and cost seconds in the CHEAP battery.
 *
 * 🚫 THE MARKER LITERAL IS NEVER WRITTEN IN THIS FILE — it is imported. A meta-guard that spelled
 * it out would enrol ITSELF as a subject of the guard it tests, and the invariance guard would then
 * spawn this file, which spawns the invariance guard: the tautology this repo already names in "a
 * pgrep liveness probe inside the command it probes". Arm 6 asserts that self-exclusion holds.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Imported from the plain MODULE, never from the guard's test file: `node:test` registers tests at
// module load, so importing the test file here would run its five subject arms (~4.9 s of
// playwright collection, measured s2363) inside this cheap battery.
import { COLLECTION_GUARD_MARKER, collectionGuards } from './collection-guard-subjects.mjs';

const SELF = path.basename(fileURLToPath(import.meta.url));
const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
const GUARD = 'collection-guards-cwd-invariance.test.mjs';
const SUBJECTS_MODULE = 'collection-guard-subjects.mjs';

/**
 * Files that mention playwright's list mode WITHOUT being collection guards: they only quote it in
 * prose or build it into a fixture. Both are exempt BY NAME and deliberately — this is F-2207-1's
 * inversion, enumerating what to SKIP so that anything new fails into the subject set rather than
 * out of it. Adding to this list is a deliberate act a reviewer can see.
 */
const NOT_COLLECTION_GUARDS = new Set([GUARD, SELF]);

const LIST_FLAG = ['--', 'list'].join(''); // built, not written, so this file does not match itself

function spawnsPlaywrightList(source) {
  return source.includes('playwright') && source.includes(LIST_FLAG) && source.includes('spawn');
}

function fixture(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 's2363-collection-'));
  // Both files: the guard imports the selector by relative path, so the copy needs its sibling.
  fs.copyFileSync(path.join(SCRIPTS, GUARD), path.join(dir, GUARD));
  fs.copyFileSync(path.join(SCRIPTS, SUBJECTS_MODULE), path.join(dir, SUBJECTS_MODULE));
  fs.writeFileSync(path.join(dir, 'data.txt'), 'ok\n');
  for (const [name, body] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), body);
  return dir;
}

/** A subject whose corpus root is ANCHORED — the healthy shape. Passes from any cwd. */
const HEALTHY =
  `// ${COLLECTION_GUARD_MARKER}\n` +
  "import assert from 'node:assert/strict';\n" +
  "import fs from 'node:fs';\n" +
  "import test from 'node:test';\n" +
  "import { fileURLToPath } from 'node:url';\n" +
  "test('anchored corpus root', () => {\n" +
  "  const p = fileURLToPath(new URL('./data.txt', import.meta.url));\n" +
  "  assert.equal(fs.readFileSync(p, 'utf8').trim(), 'ok');\n" +
  '});\n';

/** The same subject with a cwd-RELATIVE root — the exact regression the invariance guard exists for. */
const DEFECTIVE =
  `// ${COLLECTION_GUARD_MARKER}\n` +
  "import assert from 'node:assert/strict';\n" +
  "import fs from 'node:fs';\n" +
  "import test from 'node:test';\n" +
  "test('cwd-relative corpus root', () => {\n" +
  "  assert.equal(fs.readFileSync('data.txt', 'utf8').trim(), 'ok');\n" +
  '});\n';

/** Mentions playwright's list mode but carries NO marker — must not be selected. */
const UNMARKED =
  "import { spawnSync } from 'node:child_process';\n" +
  "import test from 'node:test';\n" +
  `test('mentions playwright ${LIST_FLAG} only in a fixture', () => {\n` +
  '  void spawnSync;\n' +
  '});\n';

function runGuardIn(dir, { file = GUARD } = {}) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return spawnSync(process.execPath, ['--test', path.join(dir, file)], {
    cwd: dir,
    encoding: 'utf8',
    env,
  });
}

test('1. the live subject set is derived, non-empty, and holds both known collection guards', () => {
  const { subjects, unreadable } = collectionGuards(SCRIPTS, GUARD);
  assert.deepEqual(unreadable, [], `unreadable subject candidate(s): ${unreadable.join(', ')}`);
  assert.ok(subjects.length > 0, 'derived subject set is empty — the invariance guard is vacuous');
  assert.ok(
    subjects.includes('whole-suite-collection.test.mjs'),
    `whole-suite-collection.test.mjs lost its marker; derived: ${subjects.join(', ')}`,
  );
  assert.ok(
    subjects.includes('town-spec-collection.test.mjs'),
    `town-spec-collection.test.mjs lost its marker; derived: ${subjects.join(', ')}`,
  );
});

test('2. every file that spawns playwright list-mode carries the marker, or is exempt by name', () => {
  const missing = fs
    .readdirSync(SCRIPTS)
    .filter((f) => f.endsWith('.test.mjs'))
    .filter((f) => !NOT_COLLECTION_GUARDS.has(f))
    .filter((f) => {
      const source = fs.readFileSync(path.join(SCRIPTS, f), 'utf8');
      return spawnsPlaywrightList(source) && !source.includes(COLLECTION_GUARD_MARKER);
    });

  assert.deepEqual(
    missing,
    [],
    `these spawn playwright list-mode but carry no collection-guard marker, so ` +
      `${GUARD} never runs them: ${missing.join(', ')}. Add the marker, or — if the file only ` +
      'quotes list-mode rather than being a collection guard — add it to NOT_COLLECTION_GUARDS ' +
      'with a reason.',
  );
});

test('3. self-extension: a NEW marked subject is picked up with no edit to the guard', () => {
  const dir = fixture({ 'brand-new-collection.test.mjs': HEALTHY });
  const result = runGuardIn(dir);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /collection-guard corpus: 1 subject\(s\)/);
  // BOTH parameterisations must actually run. s2363 measured that tmpdir catches the live subjects'
  // anchor regression only by a macOS `EPERM: scandir` accident, while the subdirectory arm catches
  // it by the real mechanism — so dropping the subdirectory would quietly return this guard to the
  // parameterisation s2220 proved is the wrong one, and no defect fixture here would notice.
  assert.match(result.stdout, /brand-new-collection\.test\.mjs is cwd-invariant from os\.tmpdir\(\)/);
  assert.match(
    result.stdout,
    /brand-new-collection\.test\.mjs is cwd-invariant from a repo subdirectory/,
  );
  fs.rmSync(dir, { recursive: true, force: true });
});

test('4. TEETH: a marked subject with a cwd-relative corpus root REDS the guard', () => {
  const dir = fixture({ 'broken-collection.test.mjs': DEFECTIVE });
  const result = runGuardIn(dir);
  assert.notEqual(
    result.status,
    0,
    `the invariance guard passed a subject whose corpus root is cwd-dependent — it has no ` +
      `teeth:\n${result.stdout}\n${result.stderr}`,
  );
  assert.match(result.stdout + result.stderr, /corpus root is cwd-dependent/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('5. reverse control: an UNMARKED playwright-mentioning file is not selected, and the empty set REFUSES', () => {
  const dir = fixture({ 'mentions-only.test.mjs': UNMARKED });
  const result = runGuardIn(dir);
  assert.match(result.stdout, /collection-guard corpus: 0 subject\(s\)/);
  assert.notEqual(
    result.status,
    0,
    `an empty subject set registered no assertions and reported success — the exact vacuous green ` +
      `F-2217-1 names:\n${result.stdout}`,
  );
  fs.rmSync(dir, { recursive: true, force: true });
});

test('6. a marked file is excluded from its OWN subject set — no guard can spawn itself', () => {
  // The live guard does not carry the marker (it imports the constant), so self-exclusion cannot be
  // observed on the real tree. Manufacture the dangerous case instead: a MARKED file asking for its
  // own directory. Without the `f !== selfBasename` filter it would enrol itself, and running it
  // would spawn itself recursively until the battery's 300 s bound killed it.
  const dir = fixture({ 'self-marked.test.mjs': HEALTHY, 'other-marked.test.mjs': HEALTHY });
  const { subjects } = collectionGuards(dir, 'self-marked.test.mjs');
  assert.ok(
    !subjects.includes('self-marked.test.mjs'),
    `a marked file selected itself: ${subjects.join(', ')}`,
  );
  assert.deepEqual(
    subjects,
    ['other-marked.test.mjs'],
    'self-exclusion must remove only the caller, not its marked siblings',
  );
  fs.rmSync(dir, { recursive: true, force: true });
});
