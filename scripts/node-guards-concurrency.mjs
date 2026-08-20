// node-guards-concurrency — bounds node:test FILE concurrency only in a fire shell.
//
// WHY THIS EXISTS (F-1409-1/F-1410-1): `test:node-guards` runs many files concurrently. In the
// fire shell's CPU-limited process context that load makes unrelated determinism tests time out,
// manufacturing reds that do not reproduce in lane shells. Running a file alone is not a reliable
// escape hatch: F-1410-1 measured the same load-sensitive variance there.
//
// The value is deliberately one integer in this pure function so the draining fire can tune it
// from fire-side measurements without rebuilding the launcher. `1` is the conservative default,
// not a tuned result. Lanes and attended shells keep Node's default file concurrency.
//
// `CLAUDE_CONFIG_DIR` mirrors playwright.config.ts: launchd and fire-runner set it, while lane and
// attended shells do not. Presence is the discriminator; the particular value is not.

export const FIRE_SHELL_NODE_GUARDS_CONCURRENCY = 1;

export const FIRE_SHELL_NODE_GUARDS_REASON =
  'FIRE SHELL — test:node-guards ran with reduced file concurrency 1 (F-1409-1/F-1410-1); ' +
  'this is the conservative default pending fire-side measurement.';

const NODE_GUARDS_INVOCATION =
  /^(?:(?:\S*\/)?(?:ba|da|z)?sh\s+-c\s+)?["']?(?:.*\/)?node["']?\s+["']?(?:.*\/)?run-node-guards\.mjs["']?(?:\s|$)/;

export function runsNodeGuardsBattery(command) {
  return NODE_GUARDS_INVOCATION.test(command);
}

/**
 * @param {Record<string, string | undefined>} env process.env (or a fabricated env, in tests)
 * @returns {number | undefined} a file-concurrency limit, or undefined for Node's default
 */
export function nodeGuardsConcurrency(env) {
  return env.CLAUDE_CONFIG_DIR !== undefined ? FIRE_SHELL_NODE_GUARDS_CONCURRENCY : undefined;
}
