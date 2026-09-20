// Guard for F-1270-1's MECHANISM (landed s1270 `20fda8a5`, guarded s1273 — F-1273-1).
//
// `scripts/fire.md` §3.1 makes `--workers=1` a CORRECTNESS requirement of every fire-side
// playwright command: the fire's launchd process context carries a per-job CPU ceiling
// (F-1269-1), so at the default 6 obtained workers each chromium is starved and
// timing-sensitive assertions go red — 17 drift reds / 18 at default vs 0 / 18 at w=1,
// interleaved in the same shell (s1270). `playwright.config.ts:30` mechanises that law with
// `workers: isFireShell ? 1 : undefined`, keyed on CLAUDE_CONFIG_DIR being PRESENT.
//
// WHY THIS FILE EXISTS: the mechanism was a single unguarded line, and §3.1's own prose read
// "playwright.config.ts sets no workers key" plus a flat "Do NOT fix this by setting workers in
// playwright.config.ts" — written BEFORE the mechanism landed, in the same fire. A later session
// obeying that sentence literally would delete line 30 as a law violation and silently re-open
// F-1270-1, with every fire-side gate quietly reverting to a known-unreliable instrument. Prose
// cannot defend a line of code; this test can.
//
// It asserts BEHAVIOUR (the resolved config value), not the presence of a string, so a rewrite
// that preserves the semantics passes and a rewrite that loses them reds.
//
// BOTH DIRECTIONS ARE LOAD-BEARING and the second is the easy one to forget: lanes must KEEP
// full parallelism (the lane shell runs 6 workers ~3.5x FASTER — F-1267-1). A "fix" that pins
// workers globally would pass a fire-only check while taxing every lane run, so the unset arm
// is what stops the over-broad cure.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Resolve `workers` in a CHILD process. Two reasons: the config reads process.env at module
// evaluation time, and ESM caches modules — so both arms cannot share one process.
//
// The child performs its OWN assertion and encodes the verdict in its EXIT CODE. stdout is used
// only for diagnostics, never for the verdict: spawnSync can silently truncate stdout under
// load, and a guard whose pass/fail depends on parsing a possibly-truncated stream would report
// green for the wrong reason on exactly the busy box this law exists for.
//
// exit 0 = value matched · exit 3 = value mismatched (real red) · anything else = harness fault
function resolveWorkers(fireShellPresent, expected) {
  const child = `
    const want = ${JSON.stringify(expected === undefined ? '__undefined__' : expected)};
    ${fireShellPresent
      ? "process.env.CLAUDE_CONFIG_DIR = '/Users/robin/.claude-fires';"
      : 'delete process.env.CLAUDE_CONFIG_DIR;'}
    import('./playwright.config.ts')
      .then((m) => {
        const got = m.default.workers;
        const norm = got === undefined ? '__undefined__' : got;
        console.log('workers=' + String(got));
        process.exit(norm === want ? 0 : 3);
      })
      .catch((e) => { console.error('IMPORT-FAILED: ' + e.message); process.exit(9); });
  `;
  const res = spawnSync(process.execPath, ['--experimental-strip-types', '-e', child], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: 60_000,
  });
  return {
    status: res.status,
    stdout: (res.stdout || '').trim(),
    stderr: (res.stderr || '').trim(),
  };
}

test('fire shell (CLAUDE_CONFIG_DIR present) resolves playwright workers to 1', () => {
  const r = resolveWorkers(true, 1);
  assert.notEqual(
    r.status,
    9,
    `playwright.config.ts failed to import — the guard could not measure anything: ${r.stderr}`,
  );
  assert.equal(
    r.status,
    0,
    'F-1270-1 REGRESSION: the fire shell no longer serialises playwright. ' +
      'playwright.config.ts must resolve `workers` to 1 when CLAUDE_CONFIG_DIR is set ' +
      '(see scripts/fire.md §3.1). ' +
      `Got ${r.stdout || '(no output)'}. ${r.stderr}`,
  );
});

test('non-fire shell (CLAUDE_CONFIG_DIR absent) keeps playwright parallelism', () => {
  const r = resolveWorkers(false, undefined);
  assert.notEqual(
    r.status,
    9,
    `playwright.config.ts failed to import — the guard could not measure anything: ${r.stderr}`,
  );
  assert.equal(
    r.status,
    0,
    'OVER-BROAD CURE: workers is now pinned for lanes and attended sessions too. ' +
      'The lane shell runs 6 workers ~3.5x faster (F-1267-1) and must not pay for a ' +
      'fire-only defect — `workers` must be left undefined when CLAUDE_CONFIG_DIR is absent. ' +
      `Got ${r.stdout || '(no output)'}. ${r.stderr}`,
  );
});
