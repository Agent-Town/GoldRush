// F-2371-1 (s2371): the em-dash guard's src subject set was selected with the git pathspec
// `src/**/*.ts`, copied verbatim out of the master's PROSE. Git's default pathspec matching is
// wildmatch WITHOUT WM_PATHNAME, so `*` already crosses `/` and the literal slash between `**`
// and `*` becomes a REQUIREMENT: only paths with two or more slashes after `src` matched, and
// every file directly at `src/<name>.ts` was never a subject. Measured: 271 selected against a
// true tracked set of 273, silently omitting `src/main.ts` and `src/vite-env.d.ts`.
//
// The declaration could not reveal it: `263 scanned, 8 skipped` was TRUE over the glob's 271,
// and the denominator came FROM the narrowed selection, so no amount of declaring could surface
// the narrowing. That is the point this guard exists to hold — a scan space is only as good as
// the corpus it is drawn from, so the corpus itself is what gets asserted here.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { SRC_EXCEPTIONS, srcScanSpace, trackedSrcTs } from './no-emdash-scan-space.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const GUARD = path.join(ROOT, 'scripts/no-emdash-guard.test.mjs');

/** Independent of the subject: asks git for the whole src tree and filters here. */
function trueSrcTs() {
  return execFileSync('git', ['ls-files', '-z', '--', 'src'], { cwd: ROOT, maxBuffer: 64 << 20 })
    .toString().split('\0').filter(Boolean).filter((f) => f.endsWith('.ts'))
    .sort();
}

test('the scan space covers EVERY tracked src TypeScript file, at every depth', () => {
  const truth = trueSrcTs();
  // Assert the control's own validity before believing what it says (F-2215-1): a comparison
  // between two empty sets passes while measuring nothing.
  assert.ok(truth.length > 100, `control invalid: only ${truth.length} tracked src TS files found`);
  assert.deepEqual([...srcScanSpace(ROOT).all].sort(), truth);
});

test('files sitting DIRECTLY under src/ are subjects — the exact class the `src/**/*.ts` pathspec dropped', () => {
  const depthOne = trueSrcTs().filter((f) => f.split('/').length === 2);
  // Self-extending and non-vacuous: if the repo ever has no depth-1 src file this arm must fail
  // loudly rather than pass over an empty set (F-2217-1).
  assert.ok(depthOne.length > 0, 'control invalid: no depth-1 src TS file exists to test with');
  const all = new Set(srcScanSpace(ROOT).all);
  const missing = depthOne.filter((f) => !all.has(f));
  assert.deepEqual(missing, [], `depth-1 src files absent from the scan space: ${missing.join(', ')}`);
});

test('the declared numbers account for the WHOLE corpus — scanned + skipped === all', () => {
  const { all, scanned, skipped } = srcScanSpace(ROOT);
  assert.equal(scanned.length + skipped, all.length);
  assert.ok(skipped > 0, 'control invalid: no exceptions are being skipped, so the arithmetic is untested');
});

test('an empty corpus REFUSES rather than certifying — a loop over nothing reports success', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'no-emdash-scan-space-'));
  try {
    execFileSync('git', ['init', '-q'], { cwd: dir });
    // A real git repo with no src/ at all: git exits 0 and returns nothing, which is exactly the
    // silent-empty shape. It must throw, not hand back a clean-looking zero.
    assert.throws(() => srcScanSpace(dir), /ZERO tracked src TypeScript files/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('every SRC_EXCEPTIONS entry is a real tracked file — a rotted allowlist quietly mis-states the skip count', () => {
  const tracked = new Set(trueSrcTs());
  const stale = [...SRC_EXCEPTIONS].filter((f) => !tracked.has(f));
  assert.deepEqual(stale, [], `exceptions naming files that are not tracked src TS: ${stale.join(', ')}`);
});

test('the guard consumes the shared selector and carries no second implementation of it', () => {
  const source = fs.readFileSync(GUARD, 'utf8');
  assert.match(source, /from '\.\/no-emdash-scan-space\.mjs'/, 'the guard must import the shared selector');
  // One implementation of a predicate (F-1261-1). A re-introduced pathspec here is how the
  // original defect was written, and how it would come back.
  assert.doesNotMatch(source, /'src\/\*\*/, 'the guard must not re-introduce a `src/**` git pathspec');
  assert.doesNotMatch(source, /ls-files/, 'the guard must not select its own src corpus');
});

test('the selector reads the same corpus from a subdirectory — the dangerous cwd, not tmpdir', () => {
  // F-2220-1: a corpus that narrows with the process cwd still prints a healthy-looking count,
  // and the dangerous cwd is the one that still looks like home — outside the repo git fails
  // loudly, but from a subdirectory everything resolves and only the corpus shrinks.
  //
  // Spawned as a PLAIN node process on purpose. A nested `node --test` inherits NODE_TEST_CONTEXT
  // and switches the child to a serialized reporter, which swallows the console.log this arm
  // reads — the arm then fails on its own harness rather than on the subject, which is a control
  // that measures the runner instead of the code.
  const count = (cwd) => {
    const out = execFileSync('node', [
      '--input-type=module', '-e',
      `import { srcScanSpace } from ${JSON.stringify(path.join(ROOT, 'scripts/no-emdash-scan-space.mjs'))};` +
      `process.stdout.write(String(srcScanSpace(${JSON.stringify(ROOT)}).all.length));`,
    ], { cwd, encoding: 'utf8', maxBuffer: 64 << 20 });
    return Number(out.trim());
  };
  const fromRoot = count(ROOT);
  assert.ok(fromRoot > 100, `control invalid: root read came back at ${fromRoot}`);
  assert.equal(count(path.join(ROOT, 'scripts')), fromRoot);
  assert.equal(count(os.tmpdir()), fromRoot);
});

test('the guard anchors its ROOT to import.meta.url, never to the process cwd', () => {
  // The arm above proves the selector honours the root it is handed; this one proves the guard
  // hands it a root that does not move. Both are needed: a correct selector called with
  // `process.cwd()` is the same defect one level up.
  const source = fs.readFileSync(GUARD, 'utf8');
  assert.match(source, /const ROOT = fileURLToPath\(new URL\('\.\.', import\.meta\.url\)\)/);
  assert.doesNotMatch(source, /process\.cwd\(\)/, 'the guard must not root its corpus at the process cwd');
});
