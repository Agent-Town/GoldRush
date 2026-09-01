/**
 * F-2363-1 (measured and cured s2363) — THE ONE GUARD NAMED FOR THIS INVARIANT ASSERTED IT OVER A
 * HARDCODED LIST OF TWO, AND THE LAW RECORDED THE WRONG REASON FOR WHY THAT WAS SAFE.
 *
 * `scripts/fire.md` banked this file as a NEGATIVE RESULT under F-2214-1: ADEQUATE, it said, "by
 * luck of its subject: `npx playwright test --list` fails LOUD from a subdirectory (measured rc=1,
 * `Total: 0 tests in 0 files`), so a regression of either subject's `import.meta.url` anchor reds
 * in tmpdir just as it would in a subdirectory." Its stated exposure was that neither file
 * F-2220-1 cured was ever added to the list.
 *
 * s2363 measured all three claims by MANUFACTURING the defect (replacing each subject's anchored
 * root with `process.cwd()`) and running the variants from three cwds:
 *
 *   subject                  repo-root      os.tmpdir()              scripts/ subdir
 *   whole-suite-collection   PASS (blind)   FAIL: EPERM scandir      FAIL: ENOENT (75.8 s)
 *   town-spec-collection     PASS (blind)   FAIL: EPERM scandir      FAIL: No tests found.
 *
 * ⚖️ THE CONCLUSION HOLDS AND IS RESTATED, NOT OVERTURNED: every non-root arm reds, so the guard
 * really was adequate and nothing was ever falsely green. What is measurably WRONG is the recorded
 * MECHANISM. Of the four non-root defect arms exactly ONE — town-spec from a subdirectory — reds
 * for the reason the law records. The tmpdir arms red on `EPERM: operation not permitted, scandir`,
 * a macOS sandbox refusal that has nothing to do with playwright collection; and the whole-suite
 * subdirectory arm reds on `ENOENT: tasks/goals.json` after 75.8 s, because playwright run from
 * `scripts/` fails to find the config and sweeps `scripts/*.test.mjs` instead. Three accidents and
 * one real mechanism. That matters because s2182 already priced this failure shape: "a hedge that
 * names a MECHANISM invites the next fire to trust the mechanism and stop measuring."
 *
 * ⛔ AND THE STATED EXPOSURE IS NOT ACTIONABLE AS WRITTEN, which is why "widening it" sat unclaimed:
 * `nul-audit.mjs` and `attended-owed-audit.mjs` are NOT test files and cannot be run under
 * `node --test`, so they could never have joined this list. They already carry their own dedicated
 * guards (`nul-audit-corpus-guard.test.mjs`, `attended-owed-anchor-tree-guard.test.mjs`,
 * `lane-usable-pathspec-root-guard.test.mjs`). The real exposure is the HARDCODING itself.
 *
 * 🛠️ CURE, in the shape F-2207-1 established — stop enumerating what to LOOK AT, enumerate what to
 * SKIP, so the set fails SAFE:
 *   1. The subject set is DERIVED from a marker every collection guard carries, not transcribed.
 *      A third collection guard added tomorrow is covered the moment it carries the marker, and
 *      `collection-guards-subject-set-guard.test.mjs` REDS if one spawns `playwright --list`
 *      without it — so forgetting the marker is loud, not silent.
 *   2. Each subject runs from a repo SUBDIRECTORY as well as from `os.tmpdir()`. s2220 measured
 *      that tmpdir is the WRONG parameterisation — outside a repo, tools fail loud for
 *      environmental reasons and score fail-safe by accident, exactly as the EPERM above does —
 *      while "the dangerous cwd is the one that still looks like home". tmpdir is KEPT because it
 *      is the existing coverage and costs ~0.5 s; the subdirectory arm is the principled one.
 *   3. An EMPTY subject set REFUSES instead of passing vacuously. A `for` loop over nothing
 *      registers no tests and reports success — F-2217-1's enumeration lesson, and the one way
 *      this file could go green while checking nothing.
 *
 * 🚫 THE MARKER IS AN OPT-IN AND MUST STAY ONE, for a measured reason rather than a stylistic one:
 * a content-sniffing selector (`/playwright/ && /--list/`) would select this file and the meta-guard
 * that tests it, and the guard would then spawn ITSELF — the tautology this repo already names in
 * "a pgrep liveness probe inside the command it probes". Self-exclusion by basename is belt and
 * braces on top.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { collectionGuards } from './collection-guard-subjects.mjs';

const SELF = path.basename(fileURLToPath(import.meta.url));
const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));

// Derived from THIS FILE's own directory, which is what lets the meta-guard test this end-to-end:
// a COPY of this file placed in a fixture directory derives from the fixture, so the runner can be
// exercised against manufactured healthy and defective subjects without spawning playwright at all.
const { subjects: SUBJECTS, unreadable } = collectionGuards(SCRIPTS, SELF);

// F-2208-1: declare the corpus ALWAYS, including the happy path. A declaration that appears only
// on failure re-creates the ambiguity it removes.
console.log(
  `collection-guard corpus: ${SUBJECTS.length} subject(s) derived from ${SELF}'s own directory` +
    (unreadable.length ? ` — ${unreadable.length} UNREADABLE: ${unreadable.join(', ')}` : ''),
);

function runGuard(file, cwd) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return spawnSync(process.execPath, ['--test', path.join(SCRIPTS, file)], { timeout: 240_000, killSignal: 'SIGKILL',
    cwd,
    encoding: 'utf8',
    env,
  });
}

/**
 * tmpdir is the INHERITED parameterisation and is kept; the subdirectory is the one s2220 proved is
 * dangerous, because git stays healthy there and only the corpus narrows. `SCRIPTS` is always a
 * real subdirectory of the tree under test, including inside the meta-guard's fixture.
 */
const CWDS = [
  ['os.tmpdir()', os.tmpdir()],
  ['a repo subdirectory', SCRIPTS],
];

test('the collection-guard subject set is derived and non-empty', () => {
  assert.equal(unreadable.length, 0, `unreadable subject candidate(s): ${unreadable.join(', ')}`);
  assert.ok(
    SUBJECTS.length > 0,
    `no file in ${SCRIPTS} carries the collection-guard marker. An empty subject set registers no ` +
      'assertions and would report success while checking nothing (F-2217-1) — if a collection ' +
      'guard was renamed or retired, update the marker; do not delete this assertion.',
  );
});

for (const subject of SUBJECTS) {
  for (const [label, cwd] of CWDS) {
    test(`${subject} is cwd-invariant from ${label}`, () => {
      const result = runGuard(subject, cwd);
      assert.equal(
        result.status,
        0,
        `${subject} failed when run from ${label} (${cwd}). Its corpus root is cwd-dependent: ` +
          `anchor it to import.meta.url.\nstderr:\n${result.stderr}\nstdout:\n${result.stdout}`,
      );
    });
  }
}
