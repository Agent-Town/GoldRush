import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const SCRIPT = path.join(import.meta.dirname, 'findings-state-guard.mjs');
const ROOT = path.resolve(import.meta.dirname, '..');

function fixture(t, backlog) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gold-rush-findings-state-'));
  fs.mkdirSync(path.join(dir, 'tasks'));
  fs.writeFileSync(path.join(dir, 'tasks', 'BACKLOG.md'), backlog);
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function run(root, ...args) {
  return spawnSync(process.execPath, [SCRIPT, '--root', root, ...args], {
    encoding: 'utf8',
    timeout: 60_000,
  });
}

function offenders(output) {
  return [...output.matchAll(/^(F-\d+-\d+)\s+closed lines/gm)].map((match) => match[1]);
}

test('real history has exactly the four former double-state findings and current BACKLOG has none', (t) => {
  const before = execFileSync('git', ['show', 'eb82969f^:tasks/BACKLOG.md'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  const historical = run(fixture(t, before));
  assert.equal(historical.status, 1, historical.stdout + historical.stderr);
  assert.deepEqual(offenders(historical.stdout), [
    'F-1149-1',
    'F-1149-2',
    'F-1152-2',
    'F-1152-3',
  ]);

  const current = run(ROOT);
  assert.equal(current.status, 0, current.stdout + current.stderr);
  assert.match(current.stdout, /double-state\s+:\s+0/);
});

test('prose citations are not declarations, only struck declarations close, and duplicate opens stay open', (t) => {
  const dir = fixture(
    t,
    [
      '✅ **F-9000-1 — CLOSED.**',
      '🟡 **F-9000-2 — OPEN.** ' + 'prose '.repeat(20) + 'See F-9000-1 for history.',
      '🟡 **F-9000-3 — OPEN.**',
      '🔨 ~~**F-9000-3 — ✅ CLOSED; struck s9000.**~~',
      '🟡 **F-9000-4 — OPEN, first copy.**',
      '🟡 **F-9000-4 — OPEN, second copy.**',
      '✅ **F-9000-5 — CLOSED.**',
      '🟡 **F-9000-5 — OPEN; remove ~~legacy~~ wording.**',
    ].join('\n'),
  );
  const result = run(dir, '--report');

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.deepEqual(offenders(result.stdout), ['F-9000-3', 'F-9000-5']);
  assert.doesNotMatch(result.stdout, /^F-9000-(?:1|4)\s+closed lines/m);
});
