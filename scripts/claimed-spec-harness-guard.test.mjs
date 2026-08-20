// F-1398-1 (s1482) — GUARD TEST: a task master must not order a runner to run a spec that the
// harness it names cannot collect.
//
// EVERY assertion here that matters is proved by MANUFACTURING the defect on a synthetic corpus,
// not by observing a green. A passing guard never executes its violation path, so its green is
// not evidence about its red (the s1299/s1300/s1481 standard). The synthetic roots below exist
// so the violation path runs on every battery, forever — not just once in the fire that built it.
import test, { after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { deriveHarnessMap, GRANDFATHERED } from './claimed-spec-harness-guard.mjs';

const GUARD = path.resolve('scripts/claimed-spec-harness-guard.mjs');

const DEFAULT_CFG = `
const claimedByAnotherConfig = [
  '**/release-build.spec.ts',
];
export default { testDir: './e2e', testIgnore: [...claimedByAnotherConfig] };
`;
const OWNING_CFG = `export default { testMatch: /release-build\\.spec\\.ts/ };`;
const PKG = JSON.stringify({
  scripts: { 'test:release': 'playwright test --config playwright.release.config.ts' },
});

// Every synthetic root is registered and removed. `scripts/fixture-teardown.test.mjs` enforces
// this across all mkdtemp-using guards, and it caught this file leaking 8 directories on its
// first battery run — the leak was invisible to this file's own 11 greens.
const ROOTS = [];
after(() => {
  for (const r of ROOTS) fs.rmSync(r, { recursive: true, force: true });
});

function makeRoot(masters) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gr-f1398-'));
  ROOTS.push(root);
  fs.writeFileSync(path.join(root, 'playwright.config.ts'), DEFAULT_CFG);
  fs.writeFileSync(path.join(root, 'playwright.release.config.ts'), OWNING_CFG);
  fs.writeFileSync(path.join(root, 'package.json'), PKG);
  fs.mkdirSync(path.join(root, 'tasks'));
  for (const [name, body] of Object.entries(masters)) {
    fs.writeFileSync(path.join(root, 'tasks', name), body);
  }
  return root;
}

// F-2090-2: every spawn in this file MUST be bounded. These calls used to pass neither
// `timeout` nor `maxBuffer`, so a child that blocked for any reason blocked its
// `node --test` worker FOREVER — and because a fire's battery is reparented to launchd
// when the fire exits, the corpse then outlived its author and sat at 0% CPU indefinitely.
// Measured s2090 on the live machine: THREE orphaned `--report` children, all PPID 1, all
// 0% CPU, aged 58 min, 1 h 14 min and 5 h 55 min, every one of them stuck at this exact
// leaf — and the two youngest were holding up the `test:ledger-guards` battery that
// F-1300-4 makes the mandatory LAST ACT of every fire. An unbounded call in the factory's
// own gate is a starvation mechanism, not a slow test.
// (Ruled out by measurement, so nobody re-chases it: git is NOT the blocker —
// `core.fsmonitor` is unset and `git ls-files` over this repo returns in 10 ms.)
// SPAWN_LIMITS is deliberately generous: the point is a LOUD failure with a name on it,
// never a tighter gate. A timeout here should be read as "this guard hung", not as a red board.
const SPAWN_LIMITS = { encoding: 'utf8', timeout: 120_000, maxBuffer: 1 << 26 };

// A bounded spawn can fail in a way the old unbounded one could not, so say so out loud
// rather than letting `undefined` stdout surface as a confusing assertion three lines later.
function spawnGuard(args) {
  const r = spawnSync('node', [GUARD, ...args], SPAWN_LIMITS);
  if (r.error && r.error.code === 'ETIMEDOUT') {
    throw new Error(
      `claimed-spec-harness-guard ${args.join(' ')} exceeded ${SPAWN_LIMITS.timeout} ms and was killed (F-2090-2). ` +
        'This guard has hung three times on this machine; it is the hang, not the board, that is red.'
    );
  }
  return r;
}

function run(root) {
  return spawnGuard(['--root', root]);
}

// ---------------------------------------------------------------- derivation

test('the claimed-spec -> owning-config map is DERIVED, not tabulated', () => {
  const h = deriveHarnessMap(process.cwd());
  assert.ok(h.claimed.includes('release-build.spec.ts'), 'release-build must be derived as claimed');
  assert.strictEqual(h.owner['release-build.spec.ts'], 'playwright.release.config.ts');
  assert.ok(
    (h.alias['playwright.release.config.ts'] || []).includes('test:release'),
    'the npm alias must be derived from package.json, so naming the script counts as naming the config'
  );
});

test('derivation REFUSES rather than silently measuring nothing if the array is renamed', () => {
  const root = makeRoot({});
  fs.writeFileSync(path.join(root, 'playwright.config.ts'), 'export default { testDir: "./e2e" };');
  assert.throws(() => deriveHarnessMap(root), /claimedByAnotherConfig/);
});

// ---------------------------------------------------------------- it BITES

test('MANUFACTURED: a bare playwright command naming a claimed spec FAILS the guard', () => {
  const root = makeRoot({
    'offender.md': 'SELF-CHECK:\n- `npx playwright test e2e/release-build.spec.ts --workers=1`\n',
  });
  const r = run(root);
  assert.strictEqual(r.status, 1, `expected rc=1, got ${r.status}. stdout:\n${r.stdout}`);
  assert.match(r.stderr, /offender\.md/);
  assert.match(r.stderr, /command/, 'the verdict must name WHICH form it caught');
  assert.match(r.stderr, /playwright\.release\.config\.ts/, 'it must name the config that WOULD work');
});

// This is the assertion that justifies choosing predicate arm (b) over arm (a). A checklist line
// is not command-shaped, so a command-only regex never sees it — yet it sends the runner to the
// same unrunnable harness. If this test ever goes green-by-passing-nothing, arm (b) has decayed
// back to arm (a) and 4 of 6 known offenders would stop being caught.
test('MANUFACTURED: a CHECKLIST-form adjacent-suite line FAILS the guard (why arm (b), not (a))', () => {
  const root = makeRoot({
    'checklist.md': '- [ ] Adjacent unmodified-green: `e2e/release-build.spec.ts`, both projects\n',
  });
  const r = run(root);
  assert.strictEqual(r.status, 1, `expected rc=1, got ${r.status}. stdout:\n${r.stdout}`);
  assert.match(r.stderr, /checklist\.md/);
  assert.match(r.stderr, /checklist/, 'the verdict must name the checklist form');
});

test('MANUFACTURED: a mention inside the SELF-CHECK region FAILS the guard', () => {
  const root = makeRoot({
    'gateform.md': 'READ-FIRST:\n- background prose\n\nSELF-CHECK: the 15 migrated specs green, including `e2e/release-build.spec.ts`\n',
  });
  const r = run(root);
  assert.strictEqual(r.status, 1, `expected rc=1, got ${r.status}. stdout:\n${r.stdout}`);
  assert.match(r.stderr, /gate/, 'the verdict must name the gate form');
});

// ---------------------------------------------------------------- it does NOT over-bite

// This is the assertion that justifies rejecting arm (c). All six files arm (c) adds over arm (b)
// were verified s1482 by reading to be descriptive only. A guard that flags description trains
// authors to paste boilerplate, which is a different way of being useless.
test('a DESCRIPTIVE mention outside any gate region is NOT an offender (why not arm (c))', () => {
  const root = makeRoot({
    'prose.md': 'WHY: it is adjacent to the F-1296-3 standing order about `release-build.spec.ts`.\n',
  });
  const r = run(root);
  assert.strictEqual(r.status, 0, `expected rc=0, got ${r.status}. stderr:\n${r.stderr}`);
  assert.match(r.stdout, /0 LIVE/);
});

test('naming the owning CONFIG clears the master', () => {
  const root = makeRoot({
    'ok-config.md':
      'SELF-CHECK:\n- `npx playwright test --config playwright.release.config.ts e2e/release-build.spec.ts`\n',
  });
  assert.strictEqual(run(root).status, 0);
});

test('naming the npm ALIAS clears the master', () => {
  const root = makeRoot({
    'ok-alias.md': 'SELF-CHECK:\n- run `npm run test:release` for `e2e/release-build.spec.ts`\n',
  });
  assert.strictEqual(run(root).status, 0);
});

// ---------------------------------------------------------------- the live board

test('the guard actually RUNS when invoked as a script (entrypoint is not a silent no-op)', () => {
  const r = spawnGuard(['--report']);
  assert.ok(
    /claimed specs \(derived\)/.test(r.stdout),
    'the guard produced no output — the import.meta.url entrypoint check is broken again. ' +
      'This repo\'s path contains a space, which import.meta.url percent-encodes and ' +
      'process.argv[1] does not; compare via pathToFileURL, never string interpolation.'
  );
});

test('the live board has no LIVE offender', () => {
  const r = spawnGuard([]);
  assert.strictEqual(r.status, 0, `guard failed on the live board:\n${r.stderr}`);
});

// A grandfather entry that no longer describes a real offender is stale bookkeeping: it would
// silently excuse that file if it regressed. The guard prints a note; this keeps the list honest.
test('every grandfathered file is still a real offender (no stale excuses)', () => {
  const r = spawnGuard(['--report']);
  for (const f of GRANDFATHERED.keys()) {
    assert.match(
      r.stdout,
      new RegExp(`\\[GRANDFATHERED\\] ${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
      `${f} is grandfathered but is no longer an offender — delete its entry, the debt is paid.`
    );
  }
});
