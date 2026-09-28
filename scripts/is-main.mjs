/**
 * is-main.mjs: is the module that calls this the process entry point? (F-LS1-2, small-fixes-1, 2026-09-25)
 *
 * THE DEFECT IT REPLACES. Thirteen scripts answered "am I the main module?" by comparing
 * `import.meta.url` with `pathToFileURL(process.argv[1]).href`. Node resolves the ENTRY POINT
 * through symlinks before it loads it, so `import.meta.url` carries the REAL path, while
 * `process.argv[1]` keeps the caller's spelling. Under any symlinked path (every macOS `mkdtemp`,
 * where /var is a symlink to /private/var; a symlinked checkout; a linked scripts directory) the
 * two disagree, main() never runs, and the tool exits 0 having printed nothing. A guard run that
 * way is a silent pass: Mistake #1 arriving through a path idiom. Measured by ledger-shape-1's
 * manufactured-defect arm, which expected rc 2 and got rc 0 (reviews/ledger-shape-1.md).
 *
 * THE RULE: compare REAL paths, on both sides.
 *   - `fs.realpathSync` on argv[1] and on the caller's file, so every spelling of one file agrees.
 *   - `fileURLToPath`, never a `file://${process.argv[1]}` template: this repo's root contains a
 *     space ("Gold Rush"), which import.meta.url percent-encodes (the s1334 trap).
 *   - no argv[1] (`node -e "import(...)"`, `node --input-type=module`, some harnesses) is
 *     "not main", never a throw (the s1533 half): importing a guard for its exports must work.
 *   - a path that cannot be resolved (a deleted entry, a URL that is not a file) is "not main".
 *
 * usage, at module top level:
 *   import { isMain } from './is-main.mjs';
 *   if (isMain(import.meta.url)) main();
 * Keep the import in exactly that form (single quotes, `from './is-main.mjs'`): fixtures that copy
 * a guard into a scratch tree find its siblings with /from\s+'(\.\/[^']+)'/.
 *
 * TWO SCRIPTS CARRY A VERBATIM COPY INSTEAD OF THE IMPORT: authorable-candidates.mjs and
 * dry-board-probe.mjs. A guard fixture relocates each of them ALONE into a bare temp directory,
 * where any relative import dies ERR_MODULE_NOT_FOUND (the constraint dry-board-probe.mjs records
 * above headDetached). scripts/is-main.test.mjs asserts both copies still match the function
 * below byte for byte, so the three change together or the test reds.
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * @param {string} importMetaUrl the caller's own `import.meta.url`
 * @returns {boolean} true only when process.argv[1] names the caller's file, by any spelling
 */
export function isMain(importMetaUrl) {
  const entry = process.argv[1];
  if (!entry || !importMetaUrl) return false;
  try {
    return fs.realpathSync(entry) === fs.realpathSync(fileURLToPath(importMetaUrl));
  } catch {
    return false;
  }
}
