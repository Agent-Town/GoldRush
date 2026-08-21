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
import { deriveHarnessMap, GRANDFATHERED, runnerless } from './claimed-spec-harness-guard.mjs';

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

// ------------------------------------------------- F-2117-1: runnerless harnesses (WARN only)

// A root where ONE claimed spec's owning config has an npm caller and the other's has none —
// the live board's own shape (test:release exists; release-base and accounts have no caller).
// Proven by MANUFACTURING the split rather than by asserting the live board, so the test still
// means something on the day somebody wires those two harnesses up.
function makeSplitRoot() {
  const root = makeRoot({});
  fs.writeFileSync(
    path.join(root, 'playwright.config.ts'),
    `
const claimedByAnotherConfig = [
  '**/release-build.spec.ts',
  '**/orphan-harness.spec.ts',
];
export default { testDir: './e2e', testIgnore: [...claimedByAnotherConfig] };
`
  );
  fs.writeFileSync(
    path.join(root, 'playwright.orphan.config.ts'),
    `export default { testMatch: /orphan-harness\\.spec\\.ts/ };`
  );
  return root;
}

test('MANUFACTURED: a claimed spec whose owning config has NO npm caller is named', () => {
  const h = deriveHarnessMap(makeSplitRoot());
  const orphans = runnerless(h);
  assert.deepStrictEqual(
    orphans.map((o) => o.spec),
    ['orphan-harness.spec.ts'],
    'only the config with no npm script may be reported — a runnered one is not a finding'
  );
  assert.strictEqual(orphans[0].cfg, 'playwright.orphan.config.ts');
});

test('a runnerless harness WARNS and never changes the exit code', () => {
  const r = run(makeSplitRoot());
  assert.strictEqual(r.status, 0, 'WARN must never red the board — F-1460-1, the cross-engine lesson');
  assert.match(r.stdout, /WARN: 1 of 2 claimed spec\(s\)/);
  assert.match(r.stdout, /orphan-harness\.spec\.ts -> playwright\.orphan\.config\.ts -> no npm script/);
  assert.ok(
    !/release-build\.spec\.ts -> playwright\.release\.config\.ts -> no npm script/.test(r.stdout),
    'the spec WITH a runner must not appear in the WARN block'
  );
});

test('NO package.json is not the same as no caller — a synthetic root must stay silent', () => {
  const root = makeSplitRoot();
  fs.rmSync(path.join(root, 'package.json'));
  const h = deriveHarnessMap(root);
  assert.strictEqual(h.aliasesReadable, false);
  assert.deepStrictEqual(runnerless(h), [], 'an unreadable package.json must never manufacture a finding');
  assert.ok(!/WARN: /.test(run(root).stdout), 'and the fixture arms of this very file must stay quiet');
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

// ---------------------------------------------------------------- F-2098-1: exit discipline

// s2098 sampled a 9 h 39 m orphan of this guard and found it deadlocked INSIDE V8 on the way
// out: the main thread in process.exit() -> DisposePlatform -> pthread_join, waiting on a
// concurrent-baseline-compiler worker that was itself parked in CollectionBarrier awaiting a
// GC only the main thread could service. The scan had already finished; it simply failed to
// die. That is why the corpses hold no file and burn no CPU, and it is what F-2090-2's
// timeout was bounding. main() is fully synchronous with zero pending handles, so setting
// process.exitCode and returning is behaviour-identical and lets V8 drain its in-flight jobs.
//
// This test exists because the cure is a DELETION of something that looks idiomatic, and the
// three rc assertions above stay green whichever way it is written — so nothing else in this
// file would notice someone 'tidying' process.exit() back in.
test('the guard sets process.exitCode and never force-exits (F-2098-1)', () => {
  const src = fs.readFileSync(GUARD, 'utf8');
  const code = src
    .split('\n')
    .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
    .join('\n');
  assert.ok(
    !/process\.exit\s*\(/.test(code),
    'claimed-spec-harness-guard.mjs calls process.exit() again. It force-disposes the V8 ' +
      'platform while a baseline-compiler job can be parked on the collection barrier, which ' +
      'deadlocks the process forever (F-2098-1, sampled stack). Set process.exitCode and ' +
      'return instead — main() is synchronous, so the exit code is identical.'
  );
  assert.match(code, /process\.exitCode\s*=/, 'the guard must still set an explicit exit code');
});
