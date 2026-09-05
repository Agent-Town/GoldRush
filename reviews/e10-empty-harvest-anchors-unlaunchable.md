# Review: e10-empty-harvest-anchors-unlaunchable — the three Deep Sky maps open as themselves (scratch worktree, Claude Opus 5 implementer, attended drain 2026-09-06 early)

**Slice/branch/tip:** `e10-empty-harvest-anchors-unlaunchable` · `fix/e10-harvest-anchors` · commit `8753a5e7b` on base `97add828`'s tree (cut before the E7/E8/E9 story merges) · merged to main: see the ledger row (first-parent merge; no `src/` collision with the story merges).
**Verdict:** MERGED, with two attended review fixes in the drain commit (F-E10L-2's audit pin and the boot-guard spec that pinned the old behaviour). `e10-ember-shore`, `e10-archive-world` and `e10-river` launch plain as themselves on both projects, with **zero harvest anchors authored**: no board contract is refused by the browser any more (F-SMOKE-1 closed).

## What it does
One array carried two meanings (F-E10L-1): `harvestAnchors: []` means "not admitted to the benchmark" and must stay empty until a prover earns admission, but `src/meta/ContractFamilies.ts:1349` read the same emptiness as "unfinished map, send the player to The Claim". The three maps now DECLARE `twist.harvestFreeObjective { description }` in `assets/contracts/epoch-10-deepsky/contracts.json` (the exemption path; the anchor path is forbidden by the landed F-2165-1 corrective, `tasks/e10s-1c-ember-shore-inert-landing.md:27`), and the door refuses only a seamless map that does NOT declare it. Each declaration cites its spec: `specs/epoch-saga/e10-deepsky-bundle.md:17` + `specs/agent-play/e10-ember-shore-preserve.md:18` (Ember Shore, "keep the last warm vent alight"), `specs/agent-play/e10-archive-world-restoration.md:24` ("the wings themselves yield nothing"), `specs/agent-play/door-completion-sheet.md:36` (the River, RATIFIED 2026-08-20 as "permanently door-exempt-by-design"). `scripts/board-launchable-guard.test.mjs` (new, 5 tests, in `test:node-guards`) pins the clause shape, which is load-bearing: `scripts/same-game-audit.mjs:104` lifts the door expression by regex and re-evaluates it.

## Evidence
| Gate | Where | Result |
|---|---|---|
| Launch proof, the owner's own harness (`GR_SMOKE_ONLY`, own dev server on 5306, `--workers=1`, no `?debug`) | worktree, both projects | 36/36 cells true (6 rows × boots/briefing/HUD/moves/wave 2/clean): every map boots as itself with `fallbackReason=null`, 0 console + 0 page errors; two first-run reds on `pause-meta-panel` were the spec's documented flake class and re-ran green single-cell |
| Guards | worktree | `board-launchable-guard` 5/5 · `law-pointer-guard` 58/58 (zero lines inserted above `ContractFamilies.ts:1345`, the coordinate the e10s-1b leaf cites) · `door-admission-ratchet` 1/1 · `null-floor-anchors` 1/1 · `e3-mask-tables` 30/30 · lexicon, terrain-contract-scope, view-schema, same-game-report guards green · `test:findings-state`, `test:citations` green · tsc 0 · build 0 |
| Teeth | worktree | deleting `e10-river`'s declaration reds 2 of 5 naming `e10-river`; file restored byte-identical |
| Determinism | worktree | `assets/contracts/null-floors.json`, `assets/rotations/winnability-receipts.json`, `epoch-10-deepsky/mask-tables/**` byte-identical (0 files in the diff); no other contract file changed |
| Engine era | worktree hash `3641cb32ec719bca05d9478c58bb1364fc953a09c21b91eaa549b23e8f18626b` on the pre-story-merge tree | re-measured on the merged tree by the drain and pinned there (same era per F-1441-3: a declaration field and a door refusal path, no sim change) |
| Attended on the merged tree | see the drain commit | tsc, build, `board-launchable-guard` + `same-game-audit.test.mjs` + `bench-seeds` + `engine-era-guard`, the rewritten `e2e/e10-river-boot-guard.spec.ts`, and the playability smoke cells for the three maps |

Screenshots: `artifacts/e10-launchable/shots/` (6, 268 KB total), rows in `artifacts/e10-launchable/rows.jsonl`.

## Merge classification
Base: the worktree's branch point before `642f0ae9e`. `assets/contracts/epoch-10-deepsky/contracts.json`, `src/meta/ContractFamilies.ts`, `package.json`: LANE-TOUCHED (main did not move them since the base). `scripts/board-launchable-guard.test.mjs`, `artifacts/e10-launchable/*`: NEW. `tasks/BACKLOG.md`: MAIN-MOVED, unioned. Attended review fixes in the same drain commit: `scripts/same-game-audit.test.mjs` not-offered pin 3 → 0 with the eleventh stack comment (F-E10L-2, attributed by the implementer's revert-and-reproduce), `e2e/e10-river-boot-guard.spec.ts` rewritten to assert the River opens as itself, `docs/bench/same-game-audit.md` regenerated.

## Findings
- **F-E10L-1 (root cause, cured):** one array, two meanings; the declaration field separates them.
- **F-E10L-2 (cured here):** `same-game-audit.test.mjs` pinned not-offered = 3; the audit now reports 0 (rows 1602 → 1719; `measurements` 10 and `exemptions` 3 unmoved).
- **F-E10L-3 (pre-existing, non-blocking):** `gate-caller-audit` reports `npm:test:playability` with no caller; the script shipped with playability-smoke-36 and is absent from `scripts/gate-caller-baseline.json`. One baseline row, fire-authorable.
- **Design note for E10S-2/3:** `twist.emberShore.preserve.stoke.goldCost` is 15 and the map has no seams, so STOKE has no income until E10S-4 lands anchors; the map is walkable and defensible today, not yet stokable.
