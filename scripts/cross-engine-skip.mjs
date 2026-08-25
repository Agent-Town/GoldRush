// cross-engine-skip — decides whether the cross-engine determinism guard may run HERE,
// and owns the engine list that decision is made from (F-2321-1).
//
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

//
// WHY THIS EXISTS (F-1408-2, measured s1408, ruled + landed s1409 as recommendation (a)):
// `scripts/wave-scaling-cross-engine.test.mjs` runs the same E1 contract on two Node engines and
// asserts the event-log hashes agree. Widening it from one contract to all three (f1406-1) made it
// affordable in the LANE shell — the runner delivered 3 pass / 0 fail in 42.09 s — and RED in the
// FIRE shell at every budget s1408 could justify: concurrent@60 s rc=1 95.0 s (`code: null`, i.e.
// the child was killed by its own timeout, NOT caught diverging), concurrent@180 s rc=1 230.5 s,
// serialised@180 s rc=1 697.2 s. No hash disagreement appeared in ANY of those runs — every probe
// allowed to finish returned fnv1a32:30373c0b on both engines. The f1405-1 cure holds; the budget
// was the only thing wrong. This is the F-1269-1 fire-shell CPU ceiling, one level up from the
// playwright `--workers=1` law (F-1270-1): in a fire shell, this workload cannot be bought.
//
// s1409 re-measured the cost in a fire shell to price the alternatives before ruling:
//   the-claim       10 waves /  545 replay events →  4.4 s
//   e1-night-shift  25 waves / 1541 replay events → 35.8 s   ← the whole cost, and the ONLY
//                                                              contract that discriminates
// Cost is super-linear in waves (2.5x the waves, 8x the time), so no cheap trim of `e1-night-shift`
// was available that would obviously keep its discriminating power, and dropping it would recreate
// F-1406-1 exactly: a guard kept green by testing only subjects that cannot fail.
//
// THE RULING: the guard keeps all three contracts and does not run in the fire shell. It still runs
// wherever sim code is actually AUTHORED (lane + attended shells), which is where the risk enters.
//
// TWO PROPERTIES THIS MODULE EXISTS TO MAKE ASSERTABLE — see scripts/cross-engine-skip.test.mjs,
// which pins BOTH directions, because a one-directional guard would pass just as happily if someone
// "simplified" this to an unconditional skip (the F-1270-3 belt-and-braces lesson):
//   1. in a fire shell it returns a REASON STRING, so node:test prints `# SKIP <reason>` and a green
//      can never be misread as coverage it did not perform;
//   2. outside a fire shell it returns `false`, so lanes and attended sessions still pay for it.
//
// `CLAUDE_CONFIG_DIR` is the same discriminator `playwright.config.ts` uses for `isFireShell`:
// launchd sets it to ~/.claude-fires and scripts/fire-runner.sh to ~/.claude-alt, while lane and
// attended shells never set it.
//
// F-2321-1 (s2321). This module owned the DECISION but not the INPUT the decision is made from:
// `crossEngineSkipReason` takes `interpreterCount` as an argument, and each cross-engine guard
// computed that count for itself from its own verbatim copy of the candidate list. That is
// F-2209-1's rule one argument out — extracting a decision to make it testable creates a new
// untested seam, and here the seam is the ARGUMENT. cross-engine-skip.test.mjs pins both
// directions of the decision for FABRICATED counts and never touches the real engine list, so
// the two consumers could drift apart (or silently lose their second engine to an nvm upgrade)
// with every guard in the repo still green. The candidate list now lives HERE, once, and
// scripts/cross-engine-engine-source-guard.test.mjs asserts both consumers read it from here.
//
// The list is still WRITTEN DOWN rather than globbed, and that is deliberate: the guards assert
// determinism ACROSS TWO NAMED ENGINES, so which two is part of the claim. `assay-replay-agent.mjs`
// makes the same choice with CANONICAL_ASSAY_NODE_VERSION. What is cured is the DUPLICATION, not
// the pinning — an nvm upgrade is now one edit in one file instead of two edits nothing checks.

/** The engines the cross-engine determinism guards compare, whether installed or not. */
export const NODE_ENGINE_CANDIDATES = [
  '/opt/homebrew/bin/node',
  join(homedir(), '.nvm/versions/node/v23.11.1/bin/node'),
];

/**
 * The subset of `candidates` actually present on this disk.
 * Resolved at CALL time, never at import time, so a guard can measure it directly. `candidates` is
 * a parameter for the same reason `crossEngineSkipReason` takes `env`: the existence FILTER is the
 * load-bearing behaviour, and on a machine where every candidate happens to be installed there is
 * no other way to exercise it. A guard that could only observe the happy path would be decoration.
 * @param {string[]} [candidates]
 * @returns {string[]}
 */
export function installedNodeEngines(candidates = NODE_ENGINE_CANDIDATES) {
  return candidates.filter((engine) => existsSync(engine));
}

export const FIRE_SHELL_SKIP_REASON =
  'FIRE SHELL — cross-engine guard NOT RUN HERE, so this green is NOT coverage (F-1408-2): the ' +
  'e1-night-shift probe costs ~36 s per engine in a fire shell and goes red on its own timeout ' +
  'under the F-1269-1 CPU ceiling. It runs in lane/attended shells, where sim changes are authored.';

export const NO_SECOND_ENGINE_REASON = 'a second Node interpreter is not installed';

/**
 * @param {Record<string, string | undefined>} env  process.env (or a fabricated one, in tests)
 * @param {number} interpreterCount  how many installed Node interpreters were found
 * @returns {string | false}  a reason to skip, or false to RUN
 */
export function crossEngineSkipReason(env, interpreterCount) {
  // Order is deliberate: "cannot run at all" outranks "will not run here". In a fire shell both
  // interpreters are present anyway, so this ordering never changes a fire's outcome.
  if (interpreterCount < 2) return NO_SECOND_ENGINE_REASON;
  if (env.CLAUDE_CONFIG_DIR) return FIRE_SHELL_SKIP_REASON;
  return false;
}
