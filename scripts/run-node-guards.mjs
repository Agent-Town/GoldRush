import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import {
  FIRE_SHELL_NODE_GUARDS_REASON,
  nodeGuardsConcurrency,
  runsNodeGuardsBattery,
} from './node-guards-concurrency.mjs';

// WHY A DEFAULT PER-TEST BOUND EXISTS (F-1400-4, cured s1479): `node --test` defaults to no test
// timeout, so ONE non-terminating sim hung this whole battery with no bound, no diagnostic and no
// partial report — measured twice at s1400 (12 min, then 300 s) and only ended by a hand-kill. An
// unattended fire that hits that burns its entire window looking merely slow.
//
// The finding's own REC was per-test timeouts. Measured s1479, that is the wrong shape: this
// battery is 47 files / 268 test declarations and only 3 carry an explicit timeout, so the
// per-test cure is 265 edits that decay the moment anyone adds test 269. One default at the
// harness bounds all of them and covers new tests for free.
//
// 300 s is a CEILING, not a budget: the slowest test in the gating arrangement (fire shell,
// file concurrency 1) is fixture-teardown at 34.2 s, then 15.1 s and 14.9 s — so this is ~8.8x
// the measured worst, chosen so it can only ever catch a hang and never a slow-but-working test.
// A red board nobody trusts is worse than no bound (F-1460-1).
//
// This RAISES nothing. A per-test `{ timeout }` overrides the CLI default (proven by execution,
// s1479: with --test-timeout=1000 an unbounded test was cancelled at 1003 ms while a
// `{ timeout: 10_000 }` test passed at 3003 ms), so the three declared budgets are untouched —
// including the escort test's 120 s, which F-1410-2 explicitly forbids raising. Every other test
// moves from unbounded to bounded, which is strictly tighter.
//
// ⚠️ If this ever fires, it is a HANG — diagnose the arrangement, do NOT raise the number
// (F-1410-2's standing prohibition applies here too: a repeatedly-raised timeout is a hang with
// extra steps).
// Deliberately NOT exported: this module spawns the battery at import time, so anything that
// imported it to read the constant would re-launch `node --test` — with no file arguments, which
// is whole-repo discovery. The guard asserts this value by EXECUTING the harness, not importing it.
const NODE_GUARDS_TEST_TIMEOUT_MS = 300_000;

// WHY A WALL-CLOCK WATCHDOG EXISTS ON TOP OF THAT BOUND (F-POC-8, measured 2026-09-19).
// `--test-timeout` is enforced INSIDE the test-file child, by a timer on that child's event loop.
// A test that blocks the loop synchronously therefore outlives it: `repair-under-radius.test.mjs`
// ran at 100 % CPU for 4 h 46 min inside a gating battery (its three tests take milliseconds),
// ignored SIGTERM — a blocked loop never reaches a JS signal handler — and ended by a hand-kill.
// node's runner never kills a file child by wall clock, so before this the battery had NO bound at
// all against that class: a fire that hits it burns its whole window looking merely slow.
//
// The predicate is TAP PROGRESS, not elapsed time: the harness already writes a TAP transcript to a
// file, and that file grows as records land. No growth for the budget below = nothing in the whole
// battery finished. The watchdog then finds the `--test` child's OWN children (a pid tree from
// `child.pid` via `ps -Ao pid=,ppid=`; NEVER a pattern match — a pattern kill has killed a fire
// before), keeps only those alive since the stall began, `sample`s each for 3 s into the preserved
// transcript directory, and SIGKILLs it. That death is exactly what the F-NCB-10 arm below reads:
// the file is re-run ALONE, once, and a file that hangs again stays red.
//
// WHY 45 MINUTES, AND WHY NOT THE 10 THE TASK PROPOSED (measured, not chosen).
// The task's N = 10 min came with the premise "~30x the slowest healthy file". That premise is
// FALSE on this battery, and the measurement is what settles it: in the three most recent batteries
// the slowest HEALTHY unit is `fixture-teardown.test.mjs`'s single test at 880.1 s
// (artifacts/post-open-maps-correctives/attended-battery-node26.log, 149 subjects) and 973.5 s
// (artifacts/needs-cells-art-batch/attended-battery-node26.log, 148 subjects). It is slow for the
// same reason the hang is invisible: it is ONE synchronous test that spawnSync's `node --test` over
// every fixture-owning guard in turn, so it blocks its own loop, survives the 300 s per-test bound,
// and — in the gating fire arrangement, file concurrency 1 — emits NO TAP record for ~16 minutes.
// A 10-minute bound would SIGKILL that healthy guard on every fire battery. A red board nobody
// trusts is worse than no bound (F-1460-1).
// THE INSTRUMENT BELOW THEN MEASURED THE QUANTITY DIRECTLY, which is better evidence than any
// proxy: a full green-class battery on this tree reported TAP-QUIET MAX 1085.3 s — 18.1 minutes
// with no TAP record at all — while three other batteries shared the box (2026-09-19,
// artifacts/battery-robustness/battery-1-before-watchnull.log). The proposed 10 min is 0.55x that.
// 45 min = 2.5x the largest silence ever measured here, with headroom for fixture-teardown's growth
// (148 -> 152 subjects moved it from 973 s to 1262 s) and for load (this box measured load averages
// of 20 and 138 within one hour), while bounding the F-POC-8 class at 45 min instead of the
// 4 h 46 min it replaced — 6.4x tighter. A false kill is also largely self-healing: the file is
// re-run ALONE by the arm below, where contention is gone, and a pass there turns the battery green
// with the kill still named on stderr. Every battery PRINTS its own longest TAP silence, so the
// margin behind this number stays measured instead of remembered.
//
// ⚠️ If this ever fires, it is a HANG. Read the preserved sample, do NOT raise the number:
// F-1410-2's standing prohibition applies here exactly as it does to the per-test bound above.
const NODE_GUARDS_TAP_STALL_MS = 45 * 60_000;
const NODE_GUARDS_SAMPLE_SECONDS = 3;

/**
 * The effective stall budget. `GR_NODE_GUARDS_STALL_MS` can only LOWER it — the guard needs seconds
 * where the battery needs minutes, and an env knob that could RAISE a hang bound is F-1410-2's
 * defect with extra steps. Clamped, never relaxed; the chosen value is printed on every run.
 */
function stallBudgetMs(env) {
  const raw = Number(env.GR_NODE_GUARDS_STALL_MS);
  if (!Number.isFinite(raw) || raw <= 0) return NODE_GUARDS_TAP_STALL_MS;
  return Math.min(NODE_GUARDS_TAP_STALL_MS, Math.round(raw));
}

/** Direct children of `pid`, by pid tree. Never a pattern: `pgrep -f` has killed a fire before. */
function childPidsOf(pid) {
  try {
    const listed = spawnSync('ps', ['-Ao', 'pid=,ppid='], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    if (listed.error || listed.status !== 0) return [];
    const kids = [];
    for (const line of listed.stdout.split('\n')) {
      const row = /^\s*(\d+)\s+(\d+)\s*$/.exec(line);
      if (row && Number(row[2]) === pid) kids.push(Number(row[1]));
    }
    return kids;
  } catch {
    return [];
  }
}

/** The test file a child is running, for the REPORT only (node puts it last on the command line). */
function fileOf(pid) {
  try {
    const listed = spawnSync('ps', ['-o', 'command=', '-p', String(pid)], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    if (listed.error || listed.status !== 0) return undefined;
    return listed.stdout.trim().split(/\s+/).reverse().find((arg) => /\.(?:mjs|js|cjs|ts)$/.test(arg));
  } catch {
    return undefined;
  }
}

function sampleTo(pid, path) {
  for (const bin of ['sample', '/usr/bin/sample']) {
    const run = spawnSync(bin, [String(pid), String(NODE_GUARDS_SAMPLE_SECONDS), '-f', path], {
      encoding: 'utf8', timeout: 60_000, killSignal: 'SIGKILL',
    });
    if (!run.error && run.status === 0) return { ok: true };
    if (run.error?.code !== 'ENOENT') {
      return { ok: false, why: run.error?.message ?? run.stderr?.trim() ?? `sample exited ${run.status}` };
    }
  }
  return { ok: false, why: 'sample(1) not found on PATH or at /usr/bin/sample (non-macOS host?)' };
}

/**
 * Run one `node --test` child, watched. Resolves with its exit status, the longest stretch its TAP
 * transcript did not grow, and how many stalls were killed. Never rejects on a child that hangs:
 * that is the whole point.
 */
async function runWatched(argv, { tapPath, evidenceDir, label }) {
  const budget = stallBudgetMs(process.env);
  const child = spawn(process.execPath, argv, { stdio: 'inherit' });
  const firstSeen = new Map();
  let lastSize = -1;
  let lastProgress = Date.now();
  let quietMax = 0;
  let stalls = 0;
  let inStall = false;

  const tick = () => {
    if (inStall) return;
    const now = Date.now();
    // PID REUSE IS FAST ON THIS BOX — measured 2026-09-19: pid 11025 was two unrelated processes
    // four minutes apart while four batteries shared the machine. A stale entry would make a
    // freshly-spawned sibling look old enough to blame for a stall it could not have caused, so
    // pids that are no longer children are FORGOTTEN and a returning pid is timed from now.
    const live = new Set(childPidsOf(child.pid));
    for (const pid of firstSeen.keys()) if (!live.has(pid)) firstSeen.delete(pid);
    for (const pid of live) if (!firstSeen.has(pid)) firstSeen.set(pid, now);

    let size = -1;
    try { size = statSync(tapPath).size; } catch { /* not written yet: that is silence, not an error */ }
    if (size !== lastSize) {
      lastSize = size;
      lastProgress = now;
      return;
    }

    const quiet = now - lastProgress;
    if (quiet > quietMax) quietMax = quiet;
    if (quiet < budget) return;

    inStall = true;
    try {
      const stallStart = lastProgress;
      // Only children that were already running when the silence began. A sibling that started
      // during the stall cannot be the cause of it, and must not be collateral.
      const suspects = childPidsOf(child.pid).filter((pid) => (firstSeen.get(pid) ?? now) <= stallStart);
      const targets = suspects.length > 0 ? suspects : [child.pid];
      const parentIsTarget = suspects.length === 0;
      for (const pid of targets) {
        const file = fileOf(pid) ?? 'unknown file';
        const samplePath = join(evidenceDir, `hang-sample-${pid}.txt`);
        const sampled = sampleTo(pid, samplePath);
        try { process.kill(pid, 'SIGKILL'); } catch { /* already gone */ }
        const where = sampled.ok ? `sample: ${samplePath}` : `sample FAILED (${sampled.why})`;
        console.error(
          `⚠️ TAP-STALL WATCHDOG (F-POC-8)${label ? ` [${label}]` : ''}: no TAP record for ` +
          `${Math.round(quiet / 1000)}s (bound ${Math.round(budget / 1000)}s) — SIGKILLed ` +
          `${parentIsTarget ? 'the node --test PARENT' : file} (pid ${pid}); ${where}. ` +
          'A blocked event loop cannot be timed out from inside itself; read the sample, do not raise the bound.',
        );
      }
      stalls += 1;
      lastProgress = Date.now();
      lastSize = -1;
    } finally {
      inStall = false;
    }
  };

  const timer = setInterval(tick, Math.max(250, Math.min(5_000, Math.floor(budget / 4))));
  try {
    const ended = await new Promise((settle, fail) => {
      child.once('error', fail);
      child.once('exit', (status, signal) => settle({ status, signal }));
    });
    return { ...ended, quietMax, stalls, budget };
  } finally {
    clearInterval(timer);
  }
}

function quietStamp({ quietMax, budget }, label) {
  return `ℹ TAP-QUIET MAX${label ? ` (${label})` : ''}: ${(quietMax / 1000).toFixed(1)}s of ${Math.round(budget / 1000)}s bound (F-POC-8 watchdog)`;
}

function contentionStamp() {
  try {
    const found = spawnSync('pgrep', ['-f', 'run-node-guards'], { encoding: 'utf8' });
    if (found.error || found.status !== 0) return undefined;

    const pids = new Set(found.stdout.trim().split(/\s+/).map(Number));
    if (pids.size === 0 || [...pids].some((pid) => !Number.isSafeInteger(pid) || pid < 1)) {
      return undefined;
    }

    const listed = spawnSync('ps', ['-o', 'pid=,ppid=,command=', '-p', [...pids].join(',')], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    if (listed.error || listed.status !== 0) return undefined;

    const rows = listed.stdout.trim().split('\n').map((line) => line.match(/^\s*(\d+)\s+(\d+)\s+(.+)$/));
    if (rows.some((row) => row === null)) return undefined;

    // npm's matching `sh -c` wrapper parents its matching `node` child, so count only roots in
    // the matching process forest. Directly-launched batteries are already single roots.
    const processes = rows.map((row) => ({ pid: Number(row[1]), ppid: Number(row[2]), command: row[3] }));
    if (processes.length !== pids.size || processes.some(({ pid }) => !pids.has(pid))) return undefined;
    const batteries = processes.filter(({ command }) => runsNodeGuardsBattery(command));
    const batteryPids = new Set(batteries.map(({ pid }) => pid));
    const roots = batteries.filter(({ ppid }) => !batteryPids.has(ppid)).length;
    const count = roots + (batteryPids.has(process.pid) ? 0 : 1);
    return count > 1 ? `CONTENDED — ${count} concurrent batteries` : undefined;
  } catch {
    return undefined;
  }
}

const concurrency = nodeGuardsConcurrency(process.env);
const args = ['--test', `--test-timeout=${NODE_GUARDS_TEST_TIMEOUT_MS}`];

if (concurrency !== undefined) {
  console.error(FIRE_SHELL_NODE_GUARDS_REASON);
  args.push(`--test-concurrency=${concurrency}`);
}

const files = process.argv.slice(2);

// WHY A SIGNAL DEATH IS RE-RUN ONCE (F-NCB-10, measured 2026-09-18 attended). A node:test child
// that dies by a SIGNAL never reached a verdict: node reports the whole FILE as one failure whose
// only text is 'test failed', and the spec reporter shows nothing else. On this host the measured
// cause is vite's rolldown native binding (`rolldown-binding.darwin-arm64.node` 1.0.1 under vite
// 8.0.13) crashing at server teardown — SIGBUS in `ReferenceWithFinalizer::New` from
// `ThreadSafeFunction::AsyncCb`, SIGSEGV in `EnqueueFinalizer` during GC — under Node 26.4.0 AND
// Node 24.19.0 alike, 2 of 3 direct runs while an implementer's playwright shares the box, and on
// plain main. 71 guard files open an in-process vite server, so any of them can die this way, and a
// fire reading the red as a code verdict inherits a mystery it cannot attribute (the F-BATT class).
// The arm below re-runs ONLY files whose TAP record carries a `signal:`, ONLY when every failure
// in the run was such a death, ONCE, alone, and says so on stderr. An assertion failure anywhere
// disables it; a file that dies again stays red. A non-zero EXIT CODE is still propagated exactly.
//
// ROOT CAUSE FOUND AND CURED 2026-09-19 (the "still owed" half of F-NCB-10's ledger row): the
// crash is a VERSION defect, not a guard-shape one. Measured 20 direct runs per file per arm on
// this host — vite 8.0.13 / rolldown binding 1.0.1: rider-parity-retirement 19/20 dead (SIGBUS and
// SIGSEGV; it already sets watch: null and closes after its awaits settle, so no teardown reorder
// could have reached it), open-sea-water 0/20. On vite 8.3.0 / binding 1.2.9, under a load average
// of 133-140 rather than 39: 0/20 and 0/20. The arm STAYS — it is cheap, it covers any future
// native death, and it is the only thing that tells a fire a red was never a verdict.
function signalDeaths(tapPath) {
  let tap = '';
  try { tap = readFileSync(tapPath, 'utf8'); } catch { return { only: false, files: [] }; }
  const failMatch = /^# fail (\d+)$/m.exec(tap);
  const failCount = failMatch ? Number(failMatch[1]) : Number.NaN;
  const found = [];
  const block = /^not ok \d+ - (.+)\n([\s\S]*?)^  \.\.\.$/gm;
  let m;
  while ((m = block.exec(tap))) {
    const sig = /^\s+signal: '([A-Z0-9]+)'/m.exec(m[2]);
    if (!sig) continue;
    const name = m[1].trim();
    const arg = files.find((f) => f === name || resolve(f) === resolve(name));
    if (arg) found.push({ arg, file: name, signal: sig[1] });
  }
  return { only: found.length > 0 && failCount === found.length, files: found };
}

const contention = contentionStamp();
if (contention) console.error(contention);

const tapDir = mkdtempSync(join(tmpdir(), 'node-guards-tap-'));
const tapPath = join(tapDir, 'battery.tap');
const retryTapPath = join(tapDir, 'retry.tap');
const reportersTo = (destination) => [
  '--test-reporter=spec', '--test-reporter-destination=stdout',
  '--test-reporter=tap', `--test-reporter-destination=${destination}`,
];
const reporters = reportersTo(tapPath);
let status;
// A stall leaves EVIDENCE: the partial TAP plus the sample(s). It is never swept — CLAUDE.md
// §4.10b, and F-1400-4's complaint was precisely "no bound, no diagnostic and no partial report".
let hung = false;
try {
  const run = await runWatched([...args, ...reporters, ...files], { tapPath, evidenceDir: tapDir });
  status = run.status ?? 1;
  hung ||= run.stalls > 0;
  console.error(quietStamp(run));
  if (status !== 0) {
    const deaths = signalDeaths(tapPath);
    if (deaths.only) {
      const named = deaths.files.map(({ file, signal }) => `${file} died by ${signal}`).join(', ');
      console.error(`⚠️ SIGNAL-DEATH RETRY (F-NCB-10): ${named} — a signal death of the node child is not a test verdict (measured cause on this host: vite's rolldown native binding crashing at server teardown). Re-running ${deaths.files.length} file(s) alone, once.`);
      // The retry is WATCHED too, and carries its own TAP transcript to be watched by: a file the
      // watchdog killed for hanging will hang again, and an unwatched retry would restore exactly
      // the unbounded wait this guard exists to end.
      const retry = await runWatched(
        [...args, ...reportersTo(retryTapPath), ...deaths.files.map(({ arg }) => arg)],
        { tapPath: retryTapPath, evidenceDir: tapDir, label: 'retry' },
      );
      hung ||= retry.stalls > 0;
      console.error(quietStamp(retry, 'retry'));
      if (retry.status === 0) {
        console.error(`✅ SIGNAL-DEATH RETRY: passed alone — ${deaths.files.map(({ file }) => file).join(', ')}. The battery is green; the crash is recorded above, not hidden.`);
        status = 0;
      } else {
        console.error(`❌ SIGNAL-DEATH RETRY: failed again (rc=${retry.status ?? 'signal ' + retry.signal}) — a real red, or a crash that survives isolation.`);
      }
    }
  }
} finally {
  if (hung) {
    console.error(`ℹ HANG EVIDENCE KEPT: ${tapDir} (partial TAP + sample). Nothing deletes it; read it before re-running.`);
  } else {
    rmSync(tapDir, { recursive: true, force: true });
  }
}
if (contention) console.error(contention);
process.exit(status);
