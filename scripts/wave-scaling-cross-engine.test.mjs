import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { crossEngineSkipReason } from './cross-engine-skip.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PROBE = fileURLToPath(new URL('./twin-banks-hash-probe.mjs', import.meta.url));
const run = promisify(execFile);
const interpreters = [
  '/opt/homebrew/bin/node',
  join(homedir(), '.nvm/versions/node/v23.11.1/bin/node'),
].filter(existsSync);

const contracts = [
  ['e1-dry-gulch', 'e1-dry-gulch-01'],
  ['the-claim', 'e1-the-claim-01'],
  ['e1-night-shift', 'e1-night-shift-01'],
];

// TIMEOUT BUDGET — DO NOT TIGHTEN THESE WITHOUT RE-MEASURING IN A FIRE SHELL (F-1408-2, s1408).
// These numbers are sized for the FIRE shell, not the lane shell, because `test:node-guards` is a
// battery that fires run. The two shells are not the same instrument (F-1269-1): this guard was
// delivered green at 42.09 s total in the lane shell, and went RED in the fire shell at 95 s —
// `code: null`, i.e. the child was killed by its own timeout, NOT a hash divergence.
// MEASURED s1408 in the fire shell, SERIALLY (so concurrency is not the cause and cannot be blamed):
// `e1-night-shift` alone costs 56.7 s on v26.4.0 and 61.5 s on v23.11.1 — already over a 60 s child
// budget with nothing else running. Both engines returned the same hash (fnv1a32:30373c0b), so the
// f1405-1 cure holds and only the budget was wrong.
const CHILD_TIMEOUT_MS = 180_000; // ~3x the measured fire-shell worst case (61.5 s)
const TEST_TIMEOUT_MS = 300_000; // must exceed CHILD_TIMEOUT_MS so the child's own bound reports first

// F-1408-2 (ruled + landed s1409, recommendation (a)): this guard does not run in a FIRE shell —
// it is red there at every budget measured, on its own timeout, with no hash disagreement anywhere.
// The reason is a STRING so node:test prints `# SKIP <reason>` and a fire's green never reads as
// coverage it did not perform. See scripts/cross-engine-skip.mjs for the measurements, and
// scripts/cross-engine-skip.test.mjs, which pins BOTH directions of this decision.
const skipReason = crossEngineSkipReason(process.env, interpreters.length);

for (const [contract, seed] of contracts) {
  test(`${contract} hash is identical across installed Node engines`, {
    skip: skipReason,
    timeout: TEST_TIMEOUT_MS,
  }, async () => {
    // SERIAL, one engine at a time — NOT an accident, and NOT to be "optimised" back into
    // Promise.all (F-1408-2, s1408). The fire shell has a per-job CPU ceiling (F-1269-1), so two
    // concurrent probes starve each other: MEASURED in the fire shell, one child alone finishes
    // e1-night-shift in 61.5 s on v23.11.1, while the same child run concurrently with its sibling
    // did not finish inside 180 s. Hash identity is timing-independent, so serialising costs only
    // wall-clock and buys a green that means something. This is the same lesson as the playwright
    // `--workers=1` law (F-1270-1) one level up: in a fire shell, concurrency manufactures the red.
    const hashes = [];
    for (const node of interpreters) {
      const { stdout } = await run(node, [PROBE, '--contract', contract, '--seed', seed], {
        cwd: ROOT,
        encoding: 'utf8',
        timeout: CHILD_TIMEOUT_MS,
      });
      const hash = stdout.match(/^HASH\s+:\s+(fnv1a32:[0-9a-f]+)$/m)?.[1];
      assert.ok(hash, `${node}: hash missing from probe output`);
      hashes.push(hash);
    }
    assert.equal(new Set(hashes).size, 1, hashes.join(' !== '));
  });
}
