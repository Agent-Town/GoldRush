# s101 drain — fix-037-pangold-flake (main-slot) — VERDICT: BLOCKED (not merged)

**Date:** 2026-07-06T22:xxZ (s101 fire)
**Task:** `tasks/done/20260707-050110-fix-037-pangold-flake.md` (FIRE-AUTHORED by s100)
**Codex output:** working-tree diff to `e2e/task-037-assay-bench-ungate.spec.ts` ONLY (firewall respected — no product diff). REVERTED to clean HEAD (`git checkout HEAD -- …`); NOT committed.

## Verdict
**BLOCK.** Neither the original test nor Codex's fix passes a clean repeat-gate, and the master's authored premise (use the `grantGold` seam) is impossible for this test. A corrective with a corrected brief is queued to `tasks/queue/main/`.

## Evidence gathered (all desktop-chrome, `-g "normal play"`, real runs this fire)
1. **Codex's committed version** (`?timescale=8`→`2`, added `assay-text` fill, assertion `assay-log/arrived`→`assay-queue-pending`): `--repeat-each=3` → **1 failed / 3**; `--repeat-each=5 --workers=1` → **2 failed / 5**. Failure at `buildAssayOfficeWithUi` line ~88 `build.assayOffices … .toBe(1)` — the office isn't placed on ~40% of runs.
2. **grantGold experiment** (Claude applied the master's *preferred* fix — `window.__GR_TEST__?.grantGold(120)` + poll): **6 failed / 6**, deterministic. `gold()` stays **0** because `window.__GR_TEST__` is assigned **only** `if (URLSearchParams.has('debug'))` — see `src/game/Game.ts:454`. This test deliberately runs **without** `?debug` ("normal play … without debug"), so the seam is undefined and grantGold is a no-op. **grantGold is categorically impossible here, and using it would defeat the test's entire purpose.** Reverted.
3. **Original main version** (`?timescale=8`, `panGold(80)`, `assay-log/arrived`): `--repeat-each=4` → **0 / 4 pass**. Two distinct failure modes:
   - **Line 134** (3×): `assay-pending-status` `toHaveText(/Posted|JSON ready/)` → **Received "Write an order first"**. The product now REQUIRES order text in `assay-text` before a post is accepted; the original test fills only `assay-profile`, never `assay-text`. **→ Codex's added `assay-text.fill(...)` + `assay-queue-pending` assertion were CORRECT and necessary; the master's diagnosis (only a flaky `panGold` channeling poll) missed this hard break.**
   - **Line 126** (1×): `assay-office-prompt` `toBeVisible` → hidden. Intermittent build/prompt-positioning race (office not placed, or hero didn't reach prompt range under fast timescale).

## Root-cause facts (VERIFIED)
- Assay office cost = **60 gold** (`src/game/Balance.ts:203` `assay_office: 60`). `panGold(80)` provides ample gold — **the build-step flake is NOT gold-sufficiency**; it's placement/positioning timing (`ghostValid`→`Enter`→`assayOffices==1`) under fast sim, and hero-position precision after `panGold`'s walk-to-node loop.
- `__GR_TEST__` (incl. `grantGold`) is `?debug`-gated (`Game.ts:454`). Real panning is mandatory for the non-debug test.
- Product changed: assay post is rejected with "Write an order first" unless `assay-text` is non-empty (testids all real: `AssayBench.ts:72/87/91`).

## What the corrective must do (queued: `tasks/queue/main/fix-037-pangold-flake-v2.md`)
1. KEEP Codex's assertion fix: fill `assay-text` before post; assert the order lands in `assay-queue-pending` (NOT the stale `assay-log/arrived`).
2. Real panning only (NO grantGold — debug-gated, defeats purpose). `panGold(80)` gold target is fine (cost 60).
3. Make the build + prompt-approach robust against the residual positioning race (the actual remaining flake): e.g. re-assert `ghostValid` immediately before `Enter` with bounded retry; ensure hero fully stopped before build; tighten `walkTo` tolerance for the (0,7) prompt approach; consider `?timescale=4` compromise. Acceptance: `--repeat-each=8 --workers=1` GREEN on desktop-chrome, plus both-project run green (mobile test unaffected). Firewall: `e2e/task-037-assay-bench-ungate.spec.ts` ONLY.
