# town-T6 — surfaces-move-home (LAST town-v1 slice)

- **Slice/branch/tip:** town-T6 surfaces-move-home · `lane/m4` `541dac8` "town: move menu surfaces into town" · lane base `fe470f5` · salvaged `save/town-t6` `541dac8`
- **Verdict:** ⛔ **HOLD — do NOT merge this fire.** Code is correct + owner-intended, but it reds adjacent town-t1/town-t3 whose alignment needs the town-v1 nav model (attended/spec-owner). See F-t6-1.

## What it does (verified from lane/m4)
Thins the StartMenu to Continue / Enter Town / Profile / Settings and **removes `start-menu-new-claim`** (New Claim now launches via Enter Town → T3 board). Promotes two town shells from "opens soon" placeholders to live surfaces: **Schoolhouse → Research chart** ("Elder's Survey Chart") and **Assay Office → crafting order-status porch**. Touches `src/ui/menu/StartMenu.ts`, `src/town/TownScene.ts`, `src/town/town.css`, updates `e2e/044-start-screen.spec.ts`, adds `e2e/town-t6-surfaces.spec.ts` + 12 artifacts. Firewall respected (StartMenu + src/town/* + 044 + new e2e + artifacts only).

## Gate result (run on the town-T6 merged tree, onto main `db76f50`)
- tsc clean · build green.
- `town-t6-surfaces.spec.ts` — pass (both projects).
- `044-start-screen.spec.ts` — 12/12 (both) — updated to the thinned menu, asserts `start-menu-new-claim` `toHaveCount(0)`.
- town-t2/t4/t5, m1-01, m2-01 — green.
- **74 passed, 6 FAILED** (both projects) → drain gate NOT satisfied (adjacent suites must be green).

## F-t6-1 (BLOCKING — stale adjacent specs, not a code bug)
town-T6 changed two shared UI contracts and updated 044 + added town-t6-surfaces to match, but **did NOT update `town-t1-square` and `town-t3-board`**, which still assert the pre-T6 behavior:

1. **`town-t1-square.spec.ts:65`** ("menu enters town square, prompts at four shells, exits, then starts normal run"), both projects. The generic `approach()` helper (line 57) asserts every shell prompt `toContainText('opens soon')`. town-T6 made Schoolhouse (line 79) live → prompt is now "Schoolhouse … Elder's Survey Chart / Chart", so the `'opens soon'` assert fails. Assay Office (line 80) is now live too. Also the tail (line 84) clicks `start-menu-new-claim`, now removed.
2. **`town-t3-board.spec.ts:175` & `:197`**, both projects. Both do `getByTestId('start-menu-new-claim').click()` (lines 186, 201) → 30s timeout waiting for the removed locator.

These are **new, deterministic** reds (both projects, not load-flake, not pre-existing — the affordances existed before town-T6). Root cause = incomplete contract migration in the lane deliverable.

## Recommended fix (attended, or a carefully-authored corrective — NOT a blind fire fix)
Align `town-t1-square` + `town-t3-board` to the town-v1 nav model, mirroring the already-passing patterns in `044-start-screen.spec.ts` + `town-t6-surfaces.spec.ts`:
- **town-t1:** make `approach()`'s `'opens soon'` assertion conditional (live shells Schoolhouse/Assay assert their real surface text instead), and replace the closing `start-menu-new-claim` launch with the new Enter-Town→board (or the idiom 044 now uses).
- **town-t3:** replace the two `start-menu-new-claim.click()` launches with the new run-launch flow (the tests use `?debug` boots — confirm the intended launch idiom from town-T6's code, e.g. board-launch or debug auto-enter).
This needs the town-v1 navigation model to keep the assertions **meaningful** (Mistake #10 — prove the player-facing surface), so it is attended/spec-owner work or a Codex corrector reading the town-T6 code — not a headless guess.

## Why not queued as a lane corrective this fire
lane/m4 holds the **undrained** town-T6 (`541dac8`). Queuing any task to lane-b would trigger the runner's reset-to-main pre-flight and **massacre** town-T6 ([[runner-queue-advance-reset-massacres-undrained-lane]]). Any corrector must build ON `save/town-t6`/`lane/m4` (stacked / re-land), not reset it. Left for attended to author with a non-resetting base. **DO NOT refill lane-b until town-T6 is drained or re-landed.**
