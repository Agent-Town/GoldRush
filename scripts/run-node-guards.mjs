import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
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
const reporters = [
  '--test-reporter=spec', '--test-reporter-destination=stdout',
  '--test-reporter=tap', `--test-reporter-destination=${tapPath}`,
];
let status;
try {
  const child = spawnSync(process.execPath, [...args, ...reporters, ...files], { stdio: 'inherit' });
  if (child.error) throw child.error;
  status = child.status ?? 1;
  if (status !== 0) {
    const deaths = signalDeaths(tapPath);
    if (deaths.only) {
      const named = deaths.files.map(({ file, signal }) => `${file} died by ${signal}`).join(', ');
      console.error(`⚠️ SIGNAL-DEATH RETRY (F-NCB-10): ${named} — a signal death of the node child is not a test verdict (measured cause on this host: vite's rolldown native binding crashing at server teardown). Re-running ${deaths.files.length} file(s) alone, once.`);
      const retry = spawnSync(process.execPath, [...args, ...deaths.files.map(({ arg }) => arg)], { stdio: 'inherit' });
      if (retry.error) throw retry.error;
      if (retry.status === 0) {
        console.error(`✅ SIGNAL-DEATH RETRY: passed alone — ${deaths.files.map(({ file }) => file).join(', ')}. The battery is green; the crash is recorded above, not hidden.`);
        status = 0;
      } else {
        console.error(`❌ SIGNAL-DEATH RETRY: failed again (rc=${retry.status ?? 'signal ' + retry.signal}) — a real red, or a crash that survives isolation.`);
      }
    }
  }
} finally {
  rmSync(tapDir, { recursive: true, force: true });
}
if (contention) console.error(contention);
process.exit(status);
