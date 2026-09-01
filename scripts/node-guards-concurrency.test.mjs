import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  FIRE_SHELL_NODE_GUARDS_CONCURRENCY,
  FIRE_SHELL_NODE_GUARDS_REASON,
  nodeGuardsConcurrency,
} from './node-guards-concurrency.mjs';

test('fire shell bounds node-guard file concurrency and explains the reduced run', () => {
  assert.equal(
    nodeGuardsConcurrency({ CLAUDE_CONFIG_DIR: '/Users/robin/.claude-fires' }),
    FIRE_SHELL_NODE_GUARDS_CONCURRENCY,
  );
  assert.equal(nodeGuardsConcurrency({ CLAUDE_CONFIG_DIR: '' }), FIRE_SHELL_NODE_GUARDS_CONCURRENCY);
  assert.ok(FIRE_SHELL_NODE_GUARDS_REASON.length > 0);
  assert.match(FIRE_SHELL_NODE_GUARDS_REASON, /reduced file concurrency/);
  assert.match(FIRE_SHELL_NODE_GUARDS_REASON, /F-1409-1\/F-1410-1/);
});

test("lane and attended shells keep Node's default file concurrency", () => {
  assert.equal(nodeGuardsConcurrency({}), undefined);
  assert.equal(nodeGuardsConcurrency({ SHELL: '/bin/zsh', TERM: 'xterm' }), undefined);
});

test('launcher propagates a non-zero node:test child exit code exactly', () => {
  const launcher = fileURLToPath(new URL('./run-node-guards.mjs', import.meta.url));
  const missing = fileURLToPath(new URL('./node-guards-missing-fixture.test.mjs', import.meta.url));
  const { CLAUDE_CONFIG_DIR: _fire, ...laneEnv } = process.env;
  const options = { timeout: 240_000, killSignal: 'SIGKILL', encoding: 'utf8', env: laneEnv };
  const child = spawnSync(process.execPath, ['--test', missing], options);
  const launched = spawnSync(process.execPath, [launcher, missing], options);

  assert.notEqual(child.status, 0, 'manufactured child failure must be non-zero');
  assert.equal(launched.status, child.status, launched.stdout + launched.stderr);
});
