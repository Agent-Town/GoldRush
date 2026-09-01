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

/**
 * The spawner FAMILY, not the single token `spawn` (F-2425-1, measured and cured s2425).
 *
 * The promise this detector serves is stated in `collection-guard-subjects.mjs`: "Forgetting the
 * marker is LOUD, not silent ... reds by name if a file spawns playwright list-mode without carrying
 * it." The third conjunct used to be the literal `spawn`, so a collection guard written with
 * `execFileSync` was INVISIBLE to the census and never enrolled — silently, in the one direction
 * this file exists to make loud. Measured s2425 over the 174 `scripts/*.test.mjs`: `execFileSync`
 * appears in 43 of them and 10 carry it with no `spawn` token anywhere, so the idiom is ordinary
 * house style here rather than a hypothetical.
 *
 * ⚖️ ZERO LIVE OFFENDERS when this landed — the widening changes no verdict today, because both
 * real subjects use `spawnSync`. It is future-proofing, and it earns its keep for the reason
 * F-2424-1 gives one guard over: the sibling GREW a new site 93 fires after its guard was written,
 * and was safe only because its author happened to reuse the idiom under test. That is a convention
 * no mechanism enforced.
 *
 * 🚫 TWO TOKENS ARE DELIBERATELY EXCLUDED, and the two exclusions have DIFFERENT standing — stated
 * apart because the teeth sweep repriced what its author was surest of, and collapsing them would
 * hand the next reader a proof that does not exist:
 *   · bare `exec` — MEASURED. Adding it reds arms 2 and 8, because `function-cors-allowlist.test.mjs`
 *     carries the token while spawning nothing. It genuinely over-reaches on the live tree today.
 *   · `fork` — REASONED, NOT MEASURED. Adding it reds NOTHING (swept s2425), so no current file is
 *     saved by excluding it. It stays out on a forward-looking argument: the token appears in 26 of
 *     the 174 test files, because this repo writes "owner-fork" throughout its prose, and a token
 *     that common will eventually meet the other two conjuncts and accuse an honest file — the noise
 *     that gets a guard excused into uselessness (F-1460-1). Do not cite this exclusion as proven.
 *
 * ⓘ DECLARED BOUNDARY, so the next reader inherits a reason and not a verdict. Only the THIRD
 * conjunct was widened. The other two were measured s2425 and are doing real work: of the 6 files
 * carrying the list flag at all, `function-cors-allowlist.test.mjs` is excluded by this conjunct
 * (it only QUOTES `npx playwright test --list` in a comment) and `worker-type-coverage.test.mjs` is
 * excluded by the first (it spawns `tsc --listFiles`, whose flag contains the list flag as a
 * substring). Both exclusions are correct. A collection guard that is not named `*.test.mjs` would
 * also be invisible here — but it is invisible to the SELECTOR too, so the two agree and no false
 * enrolment can result.
 *
 * ✅ THE FIRST CONJUNCT'S BOUNDARY IS NOW MEASURED, AND IT IS EMPTY (s2426, executing the declared
 * limit rather than inheriting it — F-2219-1: a census's declared limit is worth more than the site
 * it names). s2425 left as UNMEASURED "a guard that reaches playwright INDIRECTLY — `npm run
 * test:e2e -- --list` names no `playwright` literal". Re-measured over the same 174
 * `scripts/*.test.mjs`: 6 carry the list flag, and the ONLY one lacking the `playwright` literal is
 * `worker-type-coverage.test.mjs` — the `tsc --listFiles` file s2425 had already classified. ZERO
 * live offenders: no collection guard reaches playwright indirectly today.
 *
 * ⚠️ EMPTY IS NOT IMPOSSIBLE, WHICH IS THE HALF WORTH CARRYING — the idiom is ordinary house style
 * here, so this boundary is forward-live rather than hypothetical: 12 of the 174 test files already
 * spawn `npm`, and 7 `package.json` scripts wrap playwright (`test`, `test:preview`, `test:release`,
 * `test:release-base`, `test:asset-diet`, `census`, `verify:visual`). A future collection guard
 * written as `npm run test:preview -- --list` would satisfy conjuncts 2 and 3 and be invisible to
 * conjunct 1 — silently, in the one direction this file exists to make loud.
 *
 * 🚫 DELIBERATELY NOT WIDENED, on s2425's own `fork` reasoning rather than on inertia, and the
 * restraint is MEASURED: adding `npm` to the first conjunct accuses NOTHING today — the intersection
 * of "spawns npm" and "carries the list flag" is exactly ONE file and it is SELF, already exempt by
 * name — so the widening buys no detection now, while `npm` is common enough in this corpus to
 * eventually meet the other two conjuncts and accuse an honest file: the noise that gets a guard
 * excused into uselessness (F-1460-1). ➡️ THE NUMBER TO WATCH is whether any npm-spawning test file
 * ever gains the list flag. On the day that intersection exceeds SELF, re-measure and widen; until
 * then a red here would fire only on honest work.
 */
const SPAWNER_TOKENS = ['spawn', 'execFile', 'execSync'];

function spawnsPlaywrightList(source) {
  return (
    source.includes('playwright') &&
    source.includes(LIST_FLAG) &&
    SPAWNER_TOKENS.some((token) => source.includes(token))
  );
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

/**
 * Detector fixtures as SOURCE STRINGS, not files: these arms ask what the census can SEE, which is a
 * question about text. No temp dir, no spawn, microseconds. The list flag is built rather than
 * written for the same reason it is at the top of this file.
 */
const SPAWNS_VIA_EXEC_FILE =
  "import { execFileSync } from 'node:child_process';\n" +
  `execFileSync('npx', ['playwright', 'test', '${LIST_FLAG}']);\n`;

const QUOTES_LIST_MODE_ONLY = `// a comment mentioning npx playwright test ${LIST_FLAG}, and nothing else\n`;

test('7. TEETH: the census sees a guard that spawns via execFileSync, not only via `spawn`', () => {
  assert.ok(
    spawnsPlaywrightList(SPAWNS_VIA_EXEC_FILE),
    'a file spawning playwright list-mode via execFileSync is invisible to the census, so it would ' +
      'never be enrolled and arm 2 would never name it — the silent direction this file exists to close',
  );
  // The PRE-CURE detector, restored inline: it must MISS the same source. Without this the arm would
  // pass identically against the narrow third conjunct and would prove nothing about the widening —
  // a variant that reddens nothing is a report about the instrument, not about the defect.
  const preCure = (s) => s.includes('playwright') && s.includes(LIST_FLAG) && s.includes('spawn');
  assert.equal(
    preCure(SPAWNS_VIA_EXEC_FILE),
    false,
    'the pre-cure detector already saw this source, so arm 7 is not measuring the widening',
  );
});

test('8. reverse control: widening did not reach into prose that merely QUOTES list-mode', () => {
  assert.equal(
    spawnsPlaywrightList(QUOTES_LIST_MODE_ONLY),
    false,
    'the widening over-reached into prose: a file that only quotes `npx playwright test --list` in ' +
      'a comment must never be accused, or arm 2 becomes noise and gets excused (F-1460-1)',
  );
  // Grounded on the real tree, not only on a fixture: this live file quotes list-mode in a comment
  // and spawns nothing. It is the shape the third conjunct exists to exclude, and it must stay out.
  const proseOnly = 'function-cors-allowlist.test.mjs';
  const source = fs.readFileSync(path.join(SCRIPTS, proseOnly), 'utf8');
  assert.equal(
    spawnsPlaywrightList(source),
    false,
    `${proseOnly} only quotes list-mode in prose but the census now accuses it — the widening is too broad`,
  );
});

test('9. reverse control: the by-name exemption is load-bearing and swallows no real subject', () => {
  // LOAD-BEARING: every exempt file must actually match the detector. An exemption that exempts
  // nothing is decoration, and it would silently outlive the reason it was added (s2226's duty:
  // an assertion no defect can reach is indistinguishable from a correct one).
  for (const exempt of NOT_COLLECTION_GUARDS) {
    const source = fs.readFileSync(path.join(SCRIPTS, exempt), 'utf8');
    assert.ok(
      spawnsPlaywrightList(source),
      `${exempt} is exempt from arm 2 but no longer matches the detector, so the exemption is ` +
        'decoration — drop it from NOT_COLLECTION_GUARDS rather than leaving it to mask a future match',
    );
  }
  // AND it must never be used to silence a red on a REAL collection guard. That would drop the file
  // from the census while leaving it out of the subject set — precisely the silent state this guard
  // exists to prevent, and the one way the exemption can be abused as the detector's key widens.
  const { subjects } = collectionGuards(SCRIPTS, SELF);
  const swallowed = subjects.filter((f) => NOT_COLLECTION_GUARDS.has(f));
  assert.deepEqual(
    swallowed,
    [],
    `a MARKED collection guard is also exempt by name: ${swallowed.join(', ')}. The exemption is for ` +
      'files that merely quote list-mode, never for silencing a subject.',
  );
});
