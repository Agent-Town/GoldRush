// Guard for scripts/gate-battery.mjs — the permanent gate-battery driver (F-1255-3, s1275).
//
// WHY THIS FILE EXISTS. The defect it guards is ONE CHARACTER of difference: an unguarded
// `writeFileSync(out, ...)` truncates the transcript on every invocation, so a multi-battery
// drain keeps only its last arm; the `existsSync(out)` guard makes it append-only. That
// difference is invisible in a passing run — the driver looks identical, exits 0, and prints
// the same tail either way. It only shows up as MISSING EVIDENCE, later, in a review nobody
// can now reconstruct. s1254 shipped the truncating version, s1255 fixed it in its own copy
// and asked for it to be folded somewhere permanent, and `tmp-s1146-gate.mjs:51` shows the
// same bug independently re-minted at a fixed path (F-1275-1). Prose could not stop the
// second instance; this test can stop the third.
//
// It asserts BEHAVIOUR by running the real driver in a temp dir — not by grepping the source
// for `existsSync`, which would pass for a rewrite that kept the string and lost the property.
//
// Verdicts come from exit codes and from the transcript's CONTENT, never from parsing the
// driver's stdout: spawnSync can silently truncate stdout under load, and this whole file is
// about not trusting a possibly-truncated stream.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
// realpathSync because macOS `os.tmpdir()` is /var/folders/... — a symlink into /private/var.
// `pwd` in the child prints the RESOLVED path, so comparing against the unresolved one would
// fail for a driver that is working perfectly.
import { mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

import { withSerialWorkers } from './gate-battery.mjs';

const DRIVER = fileURLToPath(new URL('./gate-battery.mjs', import.meta.url));

function runDriver(transcript, jobs, label) {
  const args = [DRIVER, '--transcript', transcript];
  if (label) args.push('--label', label);
  args.push(JSON.stringify(jobs));
  return spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 120_000 });
}

function withTmp(fn) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'gate-battery-guard-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// THE F-1255-3 PROPERTY. This is the assertion the whole file exists for.
test('a second battery APPENDS — it never destroys the first arm evidence', () => {
  withTmp((dir) => {
    const transcript = path.join(dir, 'transcript.txt');

    const first = runDriver(transcript, [['arm-one', process.execPath, '-e', "console.log('FIRST-ARM-MARKER')"]]);
    assert.equal(first.status, 0, `first battery should pass: ${first.stderr}`);
    assert.match(readFileSync(transcript, 'utf8'), /FIRST-ARM-MARKER/, 'first arm never reached the transcript');

    const second = runDriver(transcript, [['arm-two', process.execPath, '-e', "console.log('SECOND-ARM-MARKER')"]]);
    assert.equal(second.status, 0, `second battery should pass: ${second.stderr}`);

    const text = readFileSync(transcript, 'utf8');
    assert.match(
      text,
      /FIRST-ARM-MARKER/,
      'F-1255-3 REGRESSION: the second battery DESTROYED the first arm. The transcript must be ' +
        'opened append-only (create-if-absent), never with a bare truncating writeFileSync — ' +
        'otherwise a multi-battery drain keeps only its last arm as evidence.',
    );
    assert.match(text, /SECOND-ARM-MARKER/, 'second arm never reached the transcript');

    // Each battery must be separable in the record, or "append" just makes one unreadable blob.
    assert.equal((text.match(/######## BATTERY /g) || []).length, 2, 'each battery needs its own stamp');
  });
});

// scripts/fire.md §3.1 — a correctness requirement in the fire shell, not an optimisation.
test('playwright jobs get --workers=1 injected', () => {
  assert.deepEqual(
    withSerialWorkers('npx', ['playwright', 'test', 'e2e/foo.spec.ts']),
    ['playwright', 'test', 'e2e/foo.spec.ts', '--workers=1'],
    'F-1270-1 REGRESSION: a playwright job ran without --workers=1. In the fire shell the ' +
      'per-job CPU ceiling (F-1269-1) starves each chromium at the default 6 workers and ' +
      'manufactures drift reds (17/18 vs 0/18, s1270).',
  );
});

test('an explicit --workers is respected, so a deliberate parallelism control is not overridden', () => {
  assert.deepEqual(
    withSerialWorkers('npx', ['playwright', 'test', '--workers=6']),
    ['playwright', 'test', '--workers=6'],
    'the injection must be idempotent — a control arm measuring parallelism must survive it',
  );
});

test('non-playwright jobs are left exactly as given', () => {
  assert.deepEqual(withSerialWorkers('npx', ['tsc', '--noEmit']), ['tsc', '--noEmit']);
});

// A driver that reports green for a failed gate is worse than no driver.
test('a failing job produces a non-zero overall verdict', () => {
  withTmp((dir) => {
    const transcript = path.join(dir, 'transcript.txt');
    const r = runDriver(transcript, [
      ['ok', process.execPath, '-e', 'process.exit(0)'],
      ['bad', process.execPath, '-e', 'process.exit(3)'],
    ]);
    assert.equal(r.status, 1, 'a failed job must make the battery exit non-zero');
    assert.match(readFileSync(transcript, 'utf8'), /rc=3/, 'the failing arm rc must be in the record');
  });
});

// A command that does not exist must not read as success — the s1254-lineage driver used
// r.status directly, which is null on a spawn error and would compare != 0 only by luck.
test('a command that cannot spawn is recorded as a failure, not a pass', () => {
  withTmp((dir) => {
    const transcript = path.join(dir, 'transcript.txt');
    const r = runDriver(transcript, [['missing', 'gr-no-such-binary-xyz', '--version']]);
    assert.equal(r.status, 1, 'ENOENT must not read as rc=0');
    assert.match(readFileSync(transcript, 'utf8'), /SPAWN-ERROR/, 'the spawn failure must be in the record');
  });
});

// Misuse must never exit 0: a driver that measured nothing and returned success is exactly
// the vacuous-green failure mode the repo has now hit five times on other guards.
test('misuse exits 2 rather than reporting a vacuous green', () => {
  const noArgs = spawnSync(process.execPath, [DRIVER], { encoding: 'utf8', timeout: 30_000 });
  assert.equal(noArgs.status, 2, 'no jobs spec must exit 2');

  const badJson = spawnSync(process.execPath, [DRIVER, 'not-json'], { encoding: 'utf8', timeout: 30_000 });
  assert.equal(badJson.status, 2, 'unparseable jobs spec must exit 2');

  const empty = spawnSync(process.execPath, [DRIVER, '[]'], { encoding: 'utf8', timeout: 30_000 });
  assert.equal(empty.status, 2, 'an empty battery measured nothing and must not exit 0');
});

// ---------------------------------------------------------------------------------------
// (6) THE --cwd / --env PROPERTIES (F-1481-1, s1481).
//
// These exist because their ABSENCE is what kept fires re-minting this driver AFTER it was
// made permanent — s1455 and s1480 each hand-rolled a 19-line untracked `run-gate.mjs` for
// exactly these two capabilities (§3.0b needs a detached gate worktree; the port law needs
// GR_CAPTURE_BASE_URL, and a fire cannot set it inline because the bash allowlist refuses
// that form). A driver that silently ran in the WRONG tree would still print a verdict, so
// every assertion below checks the OBSERVED subject, not the flag's presence.

test('--cwd actually runs the job in that directory', () => {
  withTmp((dir) => {
    const transcript = path.join(dir, 'transcript.txt');
    const r = spawnSync(
      process.execPath,
      [DRIVER, '--transcript', transcript, '--cwd', dir, JSON.stringify([['pwd', 'pwd']])],
      { encoding: 'utf8', timeout: 60_000 },
    );
    assert.equal(r.status, 0, 'the job itself must succeed');
    const body = readFileSync(transcript, 'utf8');
    // `pwd` prints the real cwd — this is the observation, not `--cwd` echoed back at us.
    assert.match(body, new RegExp(realpathSync(dir).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(body, /^cwd=/m, 'the transcript must NAME the tree it measured');
  });
});

test('--env reaches the child process', () => {
  withTmp((dir) => {
    const transcript = path.join(dir, 'transcript.txt');
    const r = spawnSync(
      process.execPath,
      [
        DRIVER,
        '--transcript', transcript,
        '--env', 'GR_GUARD_PROBE=marker-8842',
        JSON.stringify([['echo-env', process.execPath, '-e', 'console.log("SAW=" + process.env.GR_GUARD_PROBE)']]),
      ],
      { encoding: 'utf8', timeout: 60_000 },
    );
    assert.equal(r.status, 0);
    const body = readFileSync(transcript, 'utf8');
    // `SAW=` PREFIX, DELIBERATELY. A bare /marker-8842/ is ALSO matched by the `env+` header
    // this driver writes itself — so it passes for a driver that records the arrangement and
    // then never passes it to the child. Caught s1481 by deleting `env: childEnv` and watching
    // the test stay green: the assertion was reading my own bookkeeping, not the observation.
    assert.match(body, /SAW=marker-8842/, 'the child must actually SEE the injected variable');
    assert.match(body, /^env\+ GR_GUARD_PROBE=marker-8842$/m, 'the arrangement must be in the record');
  });
});

// MERGED OVER, never replacing: a battery that lost PATH/HOME/CLAUDE_CONFIG_DIR would break
// the fire-shell serialisation keyed on the last of those (F-1270-3).
test('--env is merged over the inherited environment, not a replacement', () => {
  withTmp((dir) => {
    const transcript = path.join(dir, 'transcript.txt');
    const r = spawnSync(
      process.execPath,
      [
        DRIVER,
        '--transcript', transcript,
        '--env', 'GR_GUARD_PROBE=x',
        JSON.stringify([['inherit', process.execPath, '-e', 'console.log("PATH_PRESENT=" + Boolean(process.env.PATH))']]),
      ],
      { encoding: 'utf8', timeout: 60_000, env: { ...process.env, GR_GUARD_INHERITED: 'yes' } },
    );
    assert.equal(r.status, 0);
    assert.match(readFileSync(transcript, 'utf8'), /PATH_PRESENT=true/);
  });
});

// FAIL CLOSED. A silent fallback to REPO_ROOT would gate main's tree while the reviewer
// believed a worktree was measured — a real verdict about the wrong subject.
test('a non-existent --cwd exits 2 rather than falling back to the repo root', () => {
  const r = spawnSync(
    process.execPath,
    [DRIVER, '--cwd', '/gr-no-such-dir-8842', JSON.stringify([['pwd', 'pwd']])],
    { encoding: 'utf8', timeout: 30_000 },
  );
  assert.equal(r.status, 2, 'a missing gate worktree must measure NOTHING');
});

test('a malformed --env exits 2 rather than dropping the variable silently', () => {
  for (const bad of ['NOEQUALS', '=novalue']) {
    const r = spawnSync(
      process.execPath,
      [DRIVER, '--env', bad, JSON.stringify([['pwd', 'pwd']])],
      { encoding: 'utf8', timeout: 30_000 },
    );
    assert.equal(r.status, 2, `--env ${bad} must exit 2`);
  }
});

// The positional filter has to know EVERY value-consuming flag, or a flag's VALUE gets read
// as the jobs spec. This is the one-character-class of bug the whole file guards against.
test('the jobs spec is still found when the new flags precede it', () => {
  withTmp((dir) => {
    const transcript = path.join(dir, 'transcript.txt');
    const r = spawnSync(
      process.execPath,
      [
        DRIVER,
        '--cwd', dir,
        '--env', 'A=1',
        '--env', 'B=2',
        '--label', 'flag ordering',
        '--transcript', transcript,
        JSON.stringify([['ok', process.execPath, '-e', 'process.exit(0)']]),
      ],
      { encoding: 'utf8', timeout: 60_000 },
    );
    assert.equal(r.status, 0, `flag values must not be mistaken for the jobs spec: ${r.stderr}`);
    const body = readFileSync(transcript, 'utf8');
    assert.match(body, /env\+ A=1 B=2/, '--env must be REPEATABLE, not first-wins');
  });
});
