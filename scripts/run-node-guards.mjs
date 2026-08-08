import { spawnSync } from 'node:child_process';

import {
  FIRE_SHELL_NODE_GUARDS_REASON,
  nodeGuardsConcurrency,
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

    const listed = spawnSync('ps', ['-o', 'pid=,ppid=', '-p', [...pids].join(',')], {
      encoding: 'utf8',
    });
    if (listed.error || listed.status !== 0) return undefined;

    const rows = listed.stdout.trim().split('\n').map((line) => line.match(/^\s*(\d+)\s+(\d+)\s*$/));
    if (rows.some((row) => row === null)) return undefined;

    // npm's matching `sh -c` wrapper parents its matching `node` child, so count only roots in
    // the matching process forest. Directly-launched batteries are already single roots.
    const processes = rows.map((row) => ({ pid: Number(row[1]), ppid: Number(row[2]) }));
    if (processes.length !== pids.size || processes.some(({ pid }) => !pids.has(pid))) return undefined;
    const siblings = processes.filter(({ ppid }) => !pids.has(ppid)).length;
    return siblings > 0 ? `CONTENDED — ${siblings + 1} concurrent batteries` : undefined;
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

args.push(...process.argv.slice(2));

const contention = contentionStamp();
if (contention) console.error(contention);

const child = spawnSync(process.execPath, args, { stdio: 'inherit' });
if (child.error) throw child.error;
if (contention) console.error(contention);
process.exit(child.status ?? 1);
