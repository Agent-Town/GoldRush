#!/usr/bin/env node
// F-2344-1 (s2344) — the runner's imposed environment must be RECORDED DURABLY at start time.
//
// WHY THIS GUARD EXISTS, and why the obvious alternative does not work:
// a runner's inherited PATH decides which node/npm/npx runs every lane gate for its whole
// lifetime, and macOS makes that UNRECOVERABLE afterwards — `ps -E` shows no environment even
// for a process you spawned yourself (measured s2344 against a marked control child; the
// marker was invisible). So there is no post-hoc probe to write. The only moment the fact
// exists is start time, and start-lane-runner.sh's banners go to STDOUT, which is durable
// only when the caller redirects it. health-watch.sh:151 does; §2.0b/§2.0c tell a FIRE to run
// the helper bare, and that stream dies with the fire.
//
// Measured s2344 over all 23,062 lines of the live runner log: the only two [start-lane-runner]
// lines ever recorded were a single REFUSING pair — followed immediately by two `watching`
// starts with no successful-helper banner between them. The forbidden hand-start path, taken,
// unrecorded, and the merges of 2026-08-26 were produced under it.
//
// Every red arm below was proven by MANUFACTURING the defect on a scratch copy of the helper,
// and each over-general cure is caught by exactly the reverse control built for it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HELPER = path.join(HERE, 'start-lane-runner.sh');
const ENV_KEY = '[start-lane-runner] ENV';

// A variant must assert that its edit MATCHED. A variant that changed nothing is a construction
// refusal wearing a passing grade (the s2221 lesson), so this throws rather than returning.
function variantOf(src, from, to, label) {
  if (!src.includes(from)) throw new Error(`variant "${label}" matched nothing — construction failed`);
  return src.split(from).join(to);
}

function scratchHelper(dir, mutate) {
  const src = fs.readFileSync(HELPER, 'utf8');
  const out = path.join(dir, 'start-lane-runner.sh');
  fs.writeFileSync(out, mutate ? mutate(src) : src);
  fs.chmodSync(out, 0o755);
  return out;
}

// Runs the REAL helper (or a variant) in isolation: stubbed runner_pids so it never sees the
// live runner, an isolated log, and a fake runner script it never reaches on the refusal path.
function run(helper, { check = false, noCodex = false, logPath, logDir } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gr-env-prov-'));
  const stub = path.join(dir, 'processes.sh');
  fs.writeFileSync(stub, 'runner_pids() { :; }\nrunner_inert_commits() { echo 0; }\nrunner_started_at() { echo 0; }\n');
  const fakeRunner = path.join(dir, 'lane-runner-v3.sh');
  fs.writeFileSync(fakeRunner, '#!/bin/bash\nsleep 30\n');
  fs.chmodSync(fakeRunner, 0o755);
  const log = logPath ?? path.join(logDir ?? dir, 'runner-headless.log');

  const env = {
    ...process.env,
    LANE_RUNNER_PROCESSES_SCRIPT: stub,
    LANE_RUNNER_SCRIPT: fakeRunner,
    LANE_RUNNER_LOG: log,
  };
  // noCodex: an empty HOME kills the ~/.nvm glob and a minimal PATH carries no codex, so the
  // helper reaches its floor refusal — the exact moment a hand-start historically followed.
  if (noCodex) {
    env.HOME = dir;
    env.PATH = '/usr/bin:/bin';
  }

  let stdout = '', status = 0;
  try {
    stdout = execFileSync('bash', [helper, ...(check ? ['--check'] : [])],
      { encoding: 'utf8', env, timeout: 120000 });
  } catch (e) {
    status = e.status ?? null;
    stdout = (e.stdout || '') + (e.stderr || '');
  }
  const logText = fs.existsSync(log) ? fs.readFileSync(log, 'utf8') : '';
  return { stdout, status, logText, envLines: logText.split('\n').filter(l => l.includes(ENV_KEY)) };
}

test('a REFUSED start is recorded durably in the runner log, not just on stdout', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gr-env-a-'));
  const r = run(scratchHelper(dir), { noCodex: true });
  assert.equal(r.status, 1, 'the floor refusal still exits 1');
  assert.match(r.stdout, /REFUSING — no codex client/, 'control: the refusal arm really ran');
  assert.equal(r.envLines.length, 1, 'exactly one ENV record reached the durable log');
  assert.match(r.envLines[0], /verdict=refused/);
});

test('the record names the facts that decide every lane gate', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gr-env-b-'));
  const line = run(scratchHelper(dir), { noCodex: true }).envLines[0] ?? '';
  assert.match(line, /node=/, 'the interpreter under every lane gate is named');
  assert.match(line, /codex=/, 'the client is named');
  assert.match(line, /CLAUDE_CONFIG_DIR=/, 'the playwright-worker marker is named (F-1270-3)');
  assert.match(line, /floor=\d+\.\d+\.\d+/, 'the floor it judged against is named');
});

// REVERSE CONTROL. --check is documented as "reports the environment and starts nothing"; it
// must stay side-effect-free, or the one command that is safe to run on a healthy factory
// starts writing non-events into the runner's provenance history.
test('--check records NOTHING: it started no runner, so there is no provenance to write', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gr-env-c-'));
  const r = run(scratchHelper(dir), { check: true });
  assert.match(r.stdout, /--check: environment is READY|--check: continuing/,
    'control: --check really reached its report');
  assert.equal(r.envLines.length, 0, '--check must not append an ENV record');
});

// REVERSE CONTROL. A provenance record is bookkeeping; it must never be able to block a
// restart. An unwritable log degrades to a stdout note and leaves the exit code alone.
test('an unwritable log degrades to a WARN and never changes the exit code', (t) => {
  if (typeof process.getuid === 'function' && process.getuid() === 0) {
    return t.skip('running as root: chmod 000 is not enforced, so this arm cannot be built');
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gr-env-d-'));
  const locked = fs.mkdtempSync(path.join(os.tmpdir(), 'gr-env-locked-'));
  fs.chmodSync(locked, 0o000);
  try {
    const r = run(scratchHelper(dir), { noCodex: true, logPath: path.join(locked, 'x.log') });
    assert.equal(r.status, 1, 'the refusal keeps its own exit code — the record cannot veto it');
    assert.match(r.stdout, /could not record the environment/, 'it says so out loud');
  } finally {
    fs.chmodSync(locked, 0o755);
  }
});

// The point of the whole cure: stdout is NOT redirected here, exactly as §2.0b/§2.0c tell a
// fire to invoke it, and the fact must still survive in the log.
test('the record survives an un-redirected stdout — the prescribed fire invocation', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gr-env-e-'));
  const r = run(scratchHelper(dir), { noCodex: true });
  assert.ok(r.envLines.length >= 1, 'the durable channel carries it independently of stdout');
  assert.ok(!r.stdout.includes(ENV_KEY),
    'and it is not merely the stdout banner being counted twice');
});

// ---- Manufactured defects: each must red exactly the arm built for it. ----

test('PRE-CURE: stripping the record_env calls loses the refusal provenance entirely', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gr-env-pre-'));
  const helper = scratchHelper(dir, s =>
    variantOf(s, '\n  record_env refused', '', 'strip refusal record'));
  const r = run(helper, { noCodex: true });
  assert.equal(r.status, 1, 'control: the pre-cure helper still ran and still refused');
  assert.match(r.stdout, /REFUSING — no codex client/, 'control: it reached the same branch');
  assert.equal(r.envLines.length, 0,
    'PRE-CURE REPRODUCED: the refusal leaves no durable trace — this is what shipped');
});

test('OVER-GENERAL: recording on --check pollutes provenance with non-events', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gr-env-over-'));
  const helper = scratchHelper(dir, s => variantOf(s,
    '  echo "[start-lane-runner] --check: environment is READY; started nothing."',
    '  record_env started\n  echo "[start-lane-runner] --check: environment is READY; started nothing."',
    'record on --check'));
  const r = run(helper, { check: true });
  assert.ok(r.envLines.length >= 1,
    'the over-general cure is caught by the --check side-effect arm, and by nothing else');
});
