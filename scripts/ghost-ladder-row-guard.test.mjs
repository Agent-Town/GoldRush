import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const GUARD = fileURLToPath(new URL('./ghost-ladder-row-guard.mjs', import.meta.url));

function run(backlog, status = 'merged') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ghost-ladder-'));
  fs.mkdirSync(path.join(root, 'tasks'));
  fs.writeFileSync(path.join(root, 'tasks', 'BACKLOG.md'), `${backlog}\n`);
  fs.writeFileSync(path.join(root, 'tasks', 'lane-example.md'), '# Example\n');
  fs.writeFileSync(path.join(root, 'tasks', 'goals.json'), JSON.stringify({
    goals: [{ id: 'example', taskFile: 'lane-example.md', status, mergeHash: 'abc1234' }],
  }));
  try {
    return spawnSync(process.execPath, [GUARD, '--root', root, '--strict'], { encoding: 'utf8' });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('a lead-📋 row naming a SHIPPED master is a strict failure', () => {
  const result = run('- 📋 **example** `tasks/lane-example.md`');
  assert.equal(result.status, 1);
  assert.match(result.stdout, /GHOST line 1 tasks\/lane-example\.md .*abc1234/);
});

test('a lead-📋 row naming an open master passes', () => {
  const result = run('7. 📋 master QUEUED `tasks/lane-example.md`', 'queued');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /0 ghost ladder row/);
});

test('a finding that merely cites a shipped master is not a master row', () => {
  const result = run('- 📋 **F-9000-1 WATCH.** Scope 4 cites `tasks/lane-example.md`.');
  assert.equal(result.status, 0);
  assert.doesNotMatch(result.stdout, /GHOST/);
});

test('a mid-line 📋 does not make the row a ladder row', () => {
  const result = run('- ✍️ **authoring event** 📋 `tasks/lane-example.md`');
  assert.equal(result.status, 0);
  assert.doesNotMatch(result.stdout, /GHOST/);
});
