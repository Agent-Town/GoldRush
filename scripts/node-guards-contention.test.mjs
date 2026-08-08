import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const HARNESS = join(ROOT, 'scripts/run-node-guards.mjs');
const STAMP = 'CONTENDED — 2 concurrent batteries';

function cleanEnv() {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return env;
}

function runHarness(file, env = cleanEnv()) {
  return spawnSync(process.execPath, [HARNESS, file], {
    cwd: ROOT,
    encoding: 'utf8',
    env,
  });
}

function assertNoStamp(child) {
  assert.doesNotMatch(`${child.stdout}${child.stderr}`, /CONTENDED/);
}

function assertTwoStamps(child) {
  assert.deepEqual(child.stderr.match(/^CONTENDED — \d+ concurrent batteries$/gm), [STAMP, STAMP]);
}

async function waitForQuietBoard() {
  const deadline = Date.now() + 5_000;
  let quietSince = Date.now();
  while (Date.now() < deadline) {
    const found = spawnSync('pgrep', ['-f', 'run-node-guards']);
    if (found.error || (found.status !== 0 && found.status !== 1)) {
      assert.fail(`could not measure node-guards contention: ${found.error?.message ?? found.stderr}`);
    }
    if (found.status === 0) quietSince = Date.now();
    else if (Date.now() - quietSince >= 300) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  assert.fail('node-guards board did not stay quiet for 300ms');
}

async function waitForReady(child) {
  let output = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  await new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      child.stdout.off('data', check);
      child.stderr.off('data', check);
      child.off('exit', exited);
    };
    const check = (chunk) => {
      output += chunk;
      if (output.includes('SIBLING_READY')) {
        cleanup();
        resolve();
      }
    };
    const exited = (code) => {
      cleanup();
      reject(new Error(`sibling exited ${code} before ready:\n${output}`));
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`timed out waiting for sibling:\n${output}`));
    }, 5_000);
    child.stdout.on('data', check);
    child.stderr.on('data', check);
    child.once('exit', exited);
  });
}

function waitForExit(child, timeout) {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve(true);
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      resolve(true);
    };
    const timer = setTimeout(() => {
      child.off('exit', done);
      resolve(false);
    }, timeout);
    child.once('exit', done);
  });
}

async function stopGroup(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  try { process.kill(-child.pid, 'SIGTERM'); } catch {}
  if (!(await waitForExit(child, 1_000))) {
    try { process.kill(-child.pid, 'SIGKILL'); } catch {}
    await waitForExit(child, 1_000);
  }
}

test('contention is advisory, correctly counted, and absent when alone', { timeout: 30_000 }, async () => {
  const dir = mkdtempSync(join(tmpdir(), 'node-guards-contention-'));
  let sibling;
  try {
    const passing = join(dir, 'passing.test.mjs');
    const failing = join(dir, 'failing.test.mjs');
    const slow = join(dir, 'slow.test.mjs');
    writeFileSync(passing, "import test from 'node:test'; test('pass', () => {});\n");
    writeFileSync(failing, "import test from 'node:test'; test('fail', () => { throw new Error('MANUFACTURED_FAILURE'); });\n");
    writeFileSync(slow, "import test from 'node:test'; test('slow sibling', async () => { console.log('SIBLING_READY'); await new Promise((r) => setTimeout(r, 20_000)); });\n");

    // Other files in the full node-guards battery also launch this harness briefly. Measure their
    // absence so these are genuinely no-sibling arms, not assertions racing the battery itself.
    await waitForQuietBoard();
    const alonePass = runHarness(passing);
    const aloneFail = runHarness(failing);
    assertNoStamp(alonePass);
    assertNoStamp(aloneFail);

    const noPgrep = runHarness(passing, { ...cleanEnv(), PATH: '' });
    assert.equal(noPgrep.status, alonePass.status, `${noPgrep.stdout}${noPgrep.stderr}`);
    assertNoStamp(noPgrep);

    // Keep the shell wrapper alive so the guard proves that its matching shell and node child
    // collapse into one battery, matching the process shape produced by npm run.
    sibling = spawn('/bin/sh', ['-c', '"$NODE_BIN" "$HARNESS_PATH" "$FIXTURE_PATH"'], {
      cwd: ROOT,
      detached: true,
      env: { ...cleanEnv(), NODE_BIN: process.execPath, HARNESS_PATH: HARNESS, FIXTURE_PATH: slow },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    await waitForReady(sibling);

    const siblingPass = runHarness(passing);
    const siblingFail = runHarness(failing);
    assertTwoStamps(siblingPass);
    assertTwoStamps(siblingFail);
    assert.equal(siblingPass.status, alonePass.status);
    assert.equal(siblingFail.status, aloneFail.status);
    assert.equal(alonePass.status, 0);
    assert.notEqual(aloneFail.status, 0);

    console.log('MANUFACTURED_DETECTION: shell + node sibling collapsed to 1 battery; reported 2 total');
    console.log(`EXIT_CODES: passing alone=${alonePass.status} sibling=${siblingPass.status}; failing alone=${aloneFail.status} sibling=${siblingFail.status}`);
  } finally {
    if (sibling) await stopGroup(sibling);
    rmSync(dir, { recursive: true, force: true });
  }
});
