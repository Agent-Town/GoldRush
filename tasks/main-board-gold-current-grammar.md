CODEX: model=gpt-5.6-sol effort=high
# Task main-board-gold-current-grammar: restore positive gold checks under ADR-005 (MAIN, prefix "test:")

FIRE-AUTHORED s2541, 2026-09-07. One fixture corrective for F-2541-1. Read AGENTS.md, `docs/decisions/ADR-005-rider-parity.md`, `specs/agent-play/README.md`, STATUS verification lessons, `scripts/board-tape-gold.test.mjs`, `scripts/rider-parity-retirement.test.mjs`, and `artifacts/s2541-fire/tape-diagnosis.json` plus `base-board-gold.txt`. The existing board-gold guard's header defines the invariant: the declared score, replayed outcome, and secure snapshot agree on the purse HELD, while lifetime panning differs.

## Measured defect

On unchanged main c03903e3a1905e26d91914532154fc014b699781, all three headless cases fail at the assay seam with `assay replay failed: malformed tape` (0/3, 4.06 s). The current grammar correctly refuses their historical orders: Mare Claim MOVE_TO at tick 0; Moth Season HOLD at tick 1820; Relay Rush HOLD at tick 0. The chapter writer candidate changes none of this and fails identically. The browser gold arm passes in the full fixture sweep. The complete Node command stops at its first group (742 tests: 736 pass, one fixture-sweep failure, five explicit skips), so its chained tail is not covered. This is not a timeout, contention excuse, or runtime gold regression.

## Implement

1. Reproduce the three refusals and hash all three original submission fixtures before editing. Keep those historical tapes and verdict slips byte-identical. Do not re-enable retired verbs, weaken tape validation, alter scores by hand, bless new hashes without replay, or replace positive gold assertions with retirement assertions/skips.
2. Re-point the three headless positive cases to fresh, current-grammar recordings for the same contracts. First look for completed, committed securing reels or current prover policies already in this repository; reuse them when they independently replay. Never read or mutate an in-flight heat's working output. If no suitable committed reel exists, record locally using the current engine and existing floor/prover policies. Keep the historic corpora intact; place new fixtures under `artifacts/board-tape-gold/current-grammar/`. Do not POST to the live county or change a live standing.
3. Preserve the assay seam and the substantive checks: secured run; same recorded/replayed event hash; declared outcome equals replay; secure snapshot equals declared purse/waves/time at the bank tick; purse differs from measured lifetime panning. Derive every changed pin and panned figure from the actual new recording. New local fixtures must not pretend to have a live verified slip. Preserve the existing browser arm and its local request interception.
4. Prove the regression check bites: on an isolated scratch variant, replace the held-gold secure snapshot with lifetime panning at its existing source site; confirm a positive headless case fails specifically on gold equality. Restore the source byte-identical afterward. This mutation is evidence only, never proposed runtime code. If a securing current-grammar fixture cannot be obtained within scope, retain the measured result and report HOLD; never tune gameplay or manufacture success.

## Scope and validation

Touch ONLY `scripts/board-tape-gold.test.mjs` and `artifacts/board-tape-gold/current-grammar/**`. Any temporary helper lives outside the repo; no new dependency or general fixture framework. Keep each retained artifact below 5 MB; exclude browser traces, videos and full view streams. Record source lineage, commands, counts, timings, exact hashes and the measured panning/purse distinction in a short report in the new directory.

Run all four board-gold cases with Node 26.4.0, plus the existing retirement guard, tsc and build. Then run `npm run test:node-guards` ALONE, with fire serialization if appropriate; preserve the full output and state whether the fixture sweep actually visited all subjects and whether the chained tail ran. Do not excuse a failure merely because an older handoff called it contention. No full Playwright regression is required by this implementer task; the browser gold arm is mandatory.

MAIN preflight: verify branch main, the ADR-005 removal present, and no foreign uncommitted src/e2e/scripts changes. Preserve disjoint factory telemetry/artifacts. Never reset, switch branch, clean another tree, or edit STATUS, BACKLOG, goals, specs or reviews. Do not copy the separately held chapter evidence-path patch. A task claimed by the runner is not revoked by a later FIRE lock. Use the repository's native Node version, an owned checked-free browser port and private Vite cache; stop only PIDs you started. No main commit; the fire drains the completed output.

End READY-FOR-GATES with exact base, results, artifact paths and limitations. A measured HOLD is valid; a silent no-op is not.
