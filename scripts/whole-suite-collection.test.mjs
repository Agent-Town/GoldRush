// @cwd-invariant-collection-guard — enrols this file in `collection-guards-cwd-invariance.test.mjs`,
// which runs it from os.tmpdir() and from a repo subdirectory and asserts it still passes. The
// marker is what makes that subject set DERIVED rather than transcribed (F-2363-1); dropping it
// silently removes this file from that guard, so `collection-guards-subject-set-guard.test.mjs`
// reds if a file spawning `playwright --list` does not carry it.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { closeSync, mkdtempSync, openSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

async function collect(args, cwd) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'gold-rush-collection-'));
  const stdoutPath = path.join(dir, 'stdout');
  const stderrPath = path.join(dir, 'stderr');
  const stdoutFd = openSync(stdoutPath, 'w');
  const stderrFd = openSync(stderrPath, 'w');
  let status = 1;
  try {
    status = await new Promise((resolve, reject) => {
      const child = spawn('npx', args, { cwd, stdio: ['ignore', stdoutFd, stderrFd] });
      child.once('error', reject);
      child.once('close', resolve);
    });
  } catch (error) {
    status = error.code ?? 1;
  } finally {
    closeSync(stdoutFd);
    closeSync(stderrFd);
  }
  const result = { status, stdout: readFileSync(stdoutPath, 'utf8'), stderr: readFileSync(stderrPath, 'utf8') };
  rmSync(dir, { recursive: true });
  return result;
}

test('whole suite collects without loading Vite-only modules', async () => {
  const result = await collect(['playwright', 'test', '--list'], fileURLToPath(new URL('../', import.meta.url)));
  const tail = (text) => text.split(/\r?\n/).slice(-20).join('\n').slice(-4000);

  assert.equal(result.status, 0, `child exit ${result.status}\nstderr:\n${tail(result.stderr)}\nstdout:\n${tail(result.stdout)}`);
  assert.match(result.stdout.trimEnd().split(/\r?\n/).at(-1) ?? '', /^Total: [1-9]\d* tests in [1-9]\d* files$/, 'stdout capture is truncated: Total summary is not the last non-empty line');
  assert.match(result.stdout, /Total: [1-9]\d* tests/);
  assert.doesNotMatch(result.stderr, /needs an import attribute|glob is not a function/);
});
