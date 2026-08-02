import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FIRE_SHELL_SKIP_REASON,
  NO_SECOND_ENGINE_REASON,
  crossEngineSkipReason,
} from './cross-engine-skip.mjs';

// F-1408-2 (ruled + landed s1409). This guard pins BOTH directions of the fire-shell skip, for the
// same reason scripts/fire-shell-serialisation.test.mjs pins both directions of `workers:
// isFireShell` (F-1273-1): a one-directional assertion is satisfied just as happily by an
// UNCONDITIONAL skip, which would silently delete the cross-engine guard from the whole factory
// while staying green. The lane arm below is the load-bearing one.

test('fire shell SKIPS the cross-engine guard, with a reason a reader can act on', () => {
  const reason = crossEngineSkipReason({ CLAUDE_CONFIG_DIR: '/Users/robin/.claude-fires' }, 2);
  assert.equal(typeof reason, 'string', 'a fire shell must skip');
  assert.equal(reason, FIRE_SHELL_SKIP_REASON);
  // The printed reason must say it did NOT run, or a `# SKIP` line reads as a pass to a hurried
  // reader — that misreading is the whole failure mode F-1406-1 was about.
  assert.match(reason, /NOT RUN HERE/);
  assert.match(reason, /F-1408-2/);
});

test('lane and attended shells RUN the cross-engine guard', () => {
  // No CLAUDE_CONFIG_DIR: the lane shell (Codex) and attended sessions. This is where sim code is
  // authored, so this is where the guard has to keep costing something.
  assert.equal(crossEngineSkipReason({}, 2), false);
  assert.equal(crossEngineSkipReason({ SHELL: '/bin/zsh', TERM: 'xterm' }, 2), false);
  // An EMPTY CLAUDE_CONFIG_DIR is not a fire shell — it is an unset variable spelled differently.
  assert.equal(crossEngineSkipReason({ CLAUDE_CONFIG_DIR: '' }, 2), false);
});

test('a missing second interpreter still outranks the shell question', () => {
  assert.equal(crossEngineSkipReason({}, 1), NO_SECOND_ENGINE_REASON);
  assert.equal(
    crossEngineSkipReason({ CLAUDE_CONFIG_DIR: '/Users/robin/.claude-fires' }, 1),
    NO_SECOND_ENGINE_REASON,
    'cannot-run-at-all outranks will-not-run-here',
  );
});
