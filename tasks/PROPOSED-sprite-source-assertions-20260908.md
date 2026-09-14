> ⛔ PROPOSAL, NOT A MASTER — DO NOT QUEUE. A design note from Astra's sprite-roster campaign (sol/code-review-20260908, landed by sprites-split-land 2026-09-14); it has no role line, no pre-flight, no goal leaf, and never ran. A fire authors a real master from it only on an owner word (bannered attended 2026-09-14 so task-guard-audit reads it for what it is).

# Replace obsolete source-text assertions in roster tests

Proposal only; not queued. The existing e2e specs are an orchestrator-owned surface under AGENTS.md. This interactive sprite repair leaves them unchanged.

`e2e/e7-roster.spec.ts:107` ("E7 contract rows are era-gated while E1 keeps its untagged outlaws"), `e2e/e8-roster.spec.ts:108` ("E8 contract rows are era-gated while E1 keeps its untagged outlaws"), and `e2e/e9-roster.spec.ts:108` ("E9 contract rows are era-gated while E1 keeps its untagged outlaws") require the literal shared-animation loading guard `if (!animation.active && !presentation.sprites.isLoaded) continue;`. F-SPR-05 replaced the shared mutable animator with per-body ownership, so this source string is no longer a valid behavioral contract. Do not restore shared animation ownership to satisfy the string check.

E7 currently reports4 passed and2 failed solely at that assertion. An isolated evidence copy omitting that one line passes all6 tests, including the following draw-call/error assertions. Existing stats, cure outcomes, era-gating and plain-boot behavior remain checked. `rogue-automaton-directions/preexisting-test-assertion.json` reconstructs the prior c8934045 engine hash using current non-contract source and the backed-up character contract, proving the missing guard predates Rogue integration. E8/E9 matching checks are statically identified; no claim of running their suites here.

Proposed correction: replace the three source-string assertions with a behavior check for unspawned-variant lazy loading and/or per-body ownership, reusing the actual EnemyPool checks in `scripts/review-enemy-sprites.mjs`. Preserve every unrelated assertion. Verify E7–E9 on desktop/mobile. The existing pool probe already covers separate cursors/materials, immutable UVs, tint restoration, recycling and stable warmed textures.

Evidence root: `artifacts/sol/sprite-roster-fixes-20260908/rogue-automaton-directions/` (`e2e.log`, `e7-behavior.spec.ts`, `e7-behavior.config.ts`, `e7-behavior.log`, `preexisting-test-assertion.json`, `enemy-regression/results.json`). No factory dispatch or fire restart is needed for the proposal.
