/**
 * node-guards-watchdog.test.mjs — the battery runner KILLS a file that stops producing TAP, and
 * only such a file (F-POC-8, 2026-09-19).
 *
 * WHY. `scripts/repair-under-radius.test.mjs` ran at 100 % CPU for 4 h 46 min inside a gating
 * battery, ignored SIGTERM and ended by a hand-kill; retried alone it passed in 10.6 s. The 300 s
 * `--test-timeout` cannot reach it: that bound is a timer on the test child's OWN event loop, and a
 * synchronous spin never lets the loop run it. node's runner has no wall-clock bound of its own, so
 * before this arm the battery could hang for as long as a fire's window lasted, with no diagnostic
 * and no partial report.
 *
 * The three arms below pin the edges an operator would otherwise have to take on trust, and each
 * MANUFACTURES its case rather than asserting on source text (the s1299/s1300 standard):
 *   1. A file that spins forever is sampled, SIGKILLed, handed to the F-NCB-10 signal-death arm,
 *      killed again when it hangs again, and reported red — with the sample path on stderr and a
 *      real sample at the end of it. A retry the watchdog did not cover would restore the very
 *      unbounded wait this exists to end.
 *   2. A battery whose TAP keeps growing is NOT killed, even when every file outlives the bound
 *      between starts. The predicate is PROGRESS, not elapsed time; a watchdog that reds a healthy
 *      slow battery is worse than none (F-1460-1).
 *   3. `GR_NODE_GUARDS_STALL_MS` can LOWER the bound (this file needs seconds; the battery needs
 *      minutes) and can never RAISE it. F-1410-2 forbids relaxing a hang bound, and an env knob
 *      that could do it silently is that defect with extra steps.
 *
 * The shipped bound is 45 min because the slowest HEALTHY unit in the last three batteries is
 * `fixture-teardown.test.mjs`'s single synchronous test at 880.1 s and 973.5 s — itself TAP-silent
 * for ~16 min under the gating fire arrangement. See the WHY block in run-node-guards.mjs.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const HARNESS = fileURLToPath(new URL('./run-node-guards.mjs', import.meta.url));
const SHIPPED_BOUND_S = 2700;

function cleanEnv(extra = {}) {
  // NODE_TEST_CONTEXT marks a nested node:test child; left in place the runner's own `node --test`
  // prints "run() is being called recursively" and runs nothing. CLAUDE_CONFIG_DIR is SET here on
  // purpose in the hang arms: it is the gating fire arrangement (file concurrency 1), the one where
  // a single hung file silences the whole transcript.
  const { NODE_TEST_CONTEXT: _nested, CLAUDE_CONFIG_DIR: _fire, ...env } = process.env;
  return { ...env, ...extra };
}

function fixture(dir, name, body) {
  const file = join(dir, name);
  writeFileSync(file, `import test from 'node:test';\n${body}\n`);
  return file;
}

function launch(files, env) {
  const started = Date.now();
  const run = spawnSync(process.execPath, [HARNESS, ...files], {
    timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8', env,
  });
  return { ...run, out: `${run.stdout}${run.stderr}`, ms: Date.now() - started };
}

/** The runner keeps a stalled run's TAP + sample deliberately; this guard's own litter is its own. */
function sweepKeptEvidence(out) {
  for (const [, dir] of out.matchAll(/HANG EVIDENCE KEPT: (.+?) \(partial TAP/g)) {
    if (dir.startsWith(tmpdir()) && /node-guards-tap-/.test(dir)) rmSync(dir, { recursive: true, force: true });
  }
}

test('a file that stops producing TAP is sampled, killed, retried once, and reported red', { timeout: 180_000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'node-guards-watchdog-'));
  let run;
  try {
    // Ordered: the first file lands a TAP record (so the clock starts from real progress), the
    // second blocks its event loop forever — SIGTERM-proof, timeout-proof, the F-POC-8 shape.
    const ok = fixture(dir, 'aaa-ok.test.mjs', "test('a record lands', () => {});");
    const spins = fixture(dir, 'zzz-spin.test.mjs',
      "test('spins forever', () => { const t = Date.now(); while (true) { if (Date.now() - t < 0) break; } });");

    run = launch([ok, spins], cleanEnv({ CLAUDE_CONFIG_DIR: dir, GR_NODE_GUARDS_STALL_MS: '4000' }));
    const out = run.out;

    // 1. It fired, it named the hung FILE, and it said what it did.
    assert.match(out, /TAP-STALL WATCHDOG \(F-POC-8\)/, out);
    assert.match(out, /SIGKILLed .*zzz-spin\.test\.mjs \(pid \d+\)/, out);
    assert.doesNotMatch(out, /SIGKILLed .*aaa-ok\.test\.mjs/, `the file that finished must never be a target:\n${out}`);
    assert.doesNotMatch(out, /SIGKILLed the node --test PARENT/, `a live file child was the correct target:\n${out}`);

    // 2. The sample path on stderr points at a REAL sample, with a real call graph in it. A path
    //    an operator cannot open is the F-POC-8 post-mortem's exact complaint ("the stack was not
    //    sampled before the kill").
    const named = [...out.matchAll(/sample: (.+?\.txt)\./g)].map(([, path]) => path);
    assert.ok(named.length > 0, `no sample path was named:\n${out}`);
    for (const path of named) {
      assert.ok(existsSync(path), `named a sample that does not exist: ${path}\n${out}`);
      assert.ok(statSync(path).size > 1024, `sample is too small to be a stack: ${path}`);
      assert.match(readFileSync(path, 'utf8'), /Call graph:/, `sample carries no call graph: ${path}`);
    }

    // 3. The kill is handed to the F-NCB-10 arm as an ordinary signal death — no second mechanism.
    assert.match(out, /SIGNAL-DEATH RETRY \(F-NCB-10\): .*zzz-spin\.test\.mjs died by SIGKILL/, out);

    // 4. The RETRY is watched too: the file hangs again, is killed again, and stays red.
    assert.match(out, /TAP-STALL WATCHDOG \(F-POC-8\) \[retry\]/, `an unwatched retry is an unbounded wait:\n${out}`);
    assert.match(out, /SIGNAL-DEATH RETRY: failed again/, out);
    assert.notEqual(run.status, 0, `a hang that survives isolation must stay red:\n${out}`);

    // 5. The evidence survives the run (CLAUDE.md §4.10b) and is announced.
    assert.match(out, /HANG EVIDENCE KEPT: .+ \(partial TAP \+ sample\)/, out);

    // 6. The whole cycle is BOUNDED. Two 4 s stalls plus two 3 s samples plus process churn; the
    //    number that matters is that it ended at all, far inside the harness's own 240 s cap.
    assert.ok(run.ms < 120_000, `the watchdog cycle took ${run.ms}ms, which is not a bound`);
  } finally {
    if (run) sweepKeptEvidence(run.out);
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a battery that keeps producing TAP is never killed, however long it runs', { timeout: 120_000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'node-guards-watchdog-'));
  let run;
  try {
    // Four files, serial (fire arrangement), each asleep for a quarter of the bound: the run
    // outlives the bound while no single silence between TAP records ever reaches it.
    const files = ['a', 'b', 'c', 'd'].map((name) => fixture(dir, `${name}.test.mjs`,
      `test('${name} sleeps', async () => { await new Promise((r) => setTimeout(r, 1200)); });`));

    run = launch(files, cleanEnv({ CLAUDE_CONFIG_DIR: dir, GR_NODE_GUARDS_STALL_MS: '5000' }));
    const out = run.out;

    assert.equal(run.status, 0, `a progressing battery must stay green:\n${out}`);
    assert.doesNotMatch(out, /TAP-STALL WATCHDOG/, `progress, not elapsed time, is the predicate:\n${out}`);
    assert.doesNotMatch(out, /HANG EVIDENCE KEPT/, out);

    const quiet = /TAP-QUIET MAX: ([\d.]+)s of (\d+)s bound/.exec(out);
    assert.ok(quiet, `every run must report its longest TAP silence:\n${out}`);
    assert.ok(Number(quiet[1]) < Number(quiet[2]), `the measured silence must sit under the bound:\n${out}`);
    assert.ok(run.ms > 4_000, `the fixtures must actually outlive a third of the bound; ran ${run.ms}ms`);
  } finally {
    if (run) sweepKeptEvidence(run.out);
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the stall bound is finite, reported, and can only be LOWERED from the environment', { timeout: 120_000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'node-guards-watchdog-'));
  try {
    const ok = fixture(dir, 'ok.test.mjs', "test('ok', () => {});");
    const boundOf = (env) => {
      const run = launch([ok], env);
      const match = /TAP-QUIET MAX: [\d.]+s of (\d+)s bound \(F-POC-8 watchdog\)/.exec(run.out);
      assert.ok(match, `the harness must print its bound:\n${run.out}`);
      assert.equal(run.status, 0, run.out);
      return Number(match[1]);
    };

    // The shipped number, asserted by EXECUTION. It is a measured ceiling (2.8x the slowest healthy
    // TAP-silent stretch in the last three batteries, 973.5 s), not a budget: raising it is the
    // F-1410-2 defect, and lowering it below that measurement reds healthy batteries.
    assert.equal(boundOf(cleanEnv()), SHIPPED_BOUND_S);
    assert.equal(boundOf(cleanEnv({ GR_NODE_GUARDS_STALL_MS: '3000' })), 3);
    assert.equal(
      boundOf(cleanEnv({ GR_NODE_GUARDS_STALL_MS: String(SHIPPED_BOUND_S * 1000 * 10) })),
      SHIPPED_BOUND_S,
      'the environment must never be able to RAISE a hang bound',
    );
    // Garbage does not disarm it either.
    assert.equal(boundOf(cleanEnv({ GR_NODE_GUARDS_STALL_MS: 'soon' })), SHIPPED_BOUND_S);
    assert.equal(boundOf(cleanEnv({ GR_NODE_GUARDS_STALL_MS: '0' })), SHIPPED_BOUND_S);
    assert.equal(boundOf(cleanEnv({ GR_NODE_GUARDS_STALL_MS: '-1' })), SHIPPED_BOUND_S);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
