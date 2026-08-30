/**
 * F-2363-1 (s2363) — the ONE implementation of "which files are cwd-invariant collection guards".
 *
 * Extracted as a plain module rather than left inside `collection-guards-cwd-invariance.test.mjs`
 * for a measured reason, not a stylistic one: `node:test` registers tests at MODULE LOAD, so a
 * meta-guard that imported the selector from the test file would also register and run that file's
 * five subject arms — ~4.9 s of playwright collection — inside the CHEAP `test:ledger-guards`
 * battery. Measured s2363 before the extraction: the meta-guard reported 11 tests in 5.26 s, of
 * which 5 tests and 4.87 s belonged to the guard it was only trying to read a function from.
 *
 * F-1261-1's rule is the other half: there is now one implementation of this predicate in the repo,
 * so the guard and the meta-guard cannot drift apart in what they consider a subject.
 */
import fs from 'node:fs';
import path from 'node:path';

/**
 * The opt-in marker a collection guard carries to enrol itself. Deliberately an OPT-IN rather than
 * a content sniff (`/playwright/ && /--list/`): a sniff would select the invariance guard and its
 * meta-guard, both of which merely quote list-mode, and the guard would then spawn ITSELF — the
 * tautology this repo already names in "a pgrep liveness probe inside the command it probes".
 *
 * Forgetting the marker is LOUD, not silent: `collection-guards-subject-set-guard.test.mjs` reds
 * by name if a file spawns playwright list-mode without carrying it.
 */
export const COLLECTION_GUARD_MARKER = '@cwd-invariant-collection-guard';

/**
 * @param {string} dir           directory to derive from — the CALLER's own directory, so a copy of
 *                               the guard placed in a fixture derives from that fixture.
 * @param {string} selfBasename  the calling file's own basename, always excluded.
 * @returns {{subjects: string[], unreadable: string[]}}
 *
 * `unreadable` is returned rather than swallowed: `readdirSync` has already succeeded by that
 * point, so a per-file read failure is a genuine hole in the denominator and the caller declares
 * it. It does not silently shrink the subject set the way a bare `catch` would (F-2218-1).
 */
export function collectionGuards(dir, selfBasename) {
  const unreadable = [];
  const subjects = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.test.mjs'))
    .filter((f) => f !== selfBasename)
    .filter((f) => {
      try {
        return fs.readFileSync(path.join(dir, f), 'utf8').includes(COLLECTION_GUARD_MARKER);
      } catch {
        unreadable.push(f);
        return false;
      }
    })
    .sort();
  return { subjects, unreadable };
}
