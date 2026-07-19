# Task fix-town-spec-flow: town blender specs learn the new create→enter flow — ALL GREEN (LADDER, lane-c, commit prefix "fix:")
CODEX: model=gpt-5.6-sol effort=high
# ATTEMPT 2 — FIRE-AUTHORED (attended review welcome). Attempt 1 (`save/fix-town-spec-flow-partial` = 7f0bdb62) fixed ONLY the initial openTown helper and shipped READY-FOR-GATES WITHOUT running the specs green — 8/12 town-dynamo-hall RED. See reviews/lane-fix-town-spec-flow.md for the full gate evidence. This attempt must land the specs ACTUALLY GREEN.
READ FIRST:
- reviews/lane-fix-town-spec-flow.md (the gate finding: root cause F-1, the exact failing tests).
- e2e/town-tavern-blender.spec.ts `installSeedAndWebglCounter` (lines ~20-65: seeds localStorage PROFILE_KEY + town name + META_PROGRESS territory:3 = T2, guide flag) + its `openTown`.
- e2e/town-dynamo-hall-blender.spec.ts — the reference failure: `openTown` (~52), `walkToHall` (~73-78: keyboard walk → `expect.poll(__GR_TOWN_DIAGNOSTICS__.activePrompt).toBe('dynamo-hall')`), and the MID-TEST re-entry at :84-85 (`town-exit` click → replaceState pilot params → `start-menu-enter-town` click). Test :107 = pre-T2 gating via `seed(page, false)`.
- src/ui/menu/StartMenu.ts:142 (`start-menu-enter-town` button STILL EXISTS — it just isn't shown when a seeded profile auto-continues straight into town) + the CURRENT boot path that flows a seeded/created profile STRAIGHT into town.
- e2e/menu-safe-params.spec.ts (green precedent for driving the current menu/boot flow).

## Why (2026-07-20, s751 gate of attempt 1): the initial openTown rewrite is directionally right (a seeded profile boots straight into town, so no `Enter Town` click on first entry). But the walk/prompt tests ALSO re-enter town mid-test (town-exit → set params → re-enter) and that re-entry is still stale, so the prospector/interaction state is never established → `walkToHall` sees `activePrompt: null` and 8/12 dynamo-hall tests fail on both projects; the pre-T2 test (:107) also fails through the synthetic direct-boot.

## Scope:
1. Make EVERY town-*-blender spec drive the CURRENT create→enter flow faithfully — for BOTH the initial entry AND every mid-test re-entry (the `town-exit` → params → re-enter sequences). The re-entered town must establish the same interactive state the real flow does (prospector spawned + input wired) so `walkToHall`-style walks reach the building and `__GR_TOWN_DIAGNOSTICS__.activePrompt` becomes the expected building id. Prefer driving the REAL flow (seed/create profile → let it boot into town, or use whatever testid the current flow exposes on re-entry) over a synthetic `history.replaceState` that skips session setup — the synthetic boot is what failed.
2. Keep the pre-T2 path correct: `seed(page,false)` + the pilot params must still assert `data-town3d-pilot-state='off'` / render-source `facade` / `dynamoHall.visible=false` (test :107).
3. Firewall: spec helpers + spec bodies ONLY (the 10 e2e/town-*-blender.spec.ts). NO src changes. If a spec assertion can only pass via a src change, STOP and report it as a finding (do not touch src).

## Self-check (REQUIRED — attempt 1 skipped this and that is the whole reason it bounced):
- Run ALL 10 town-*-blender specs, BOTH projects (desktop-chrome + mobile-chrome), and paste the per-spec passed/failed counts. The task is NOT done until every one is GREEN (or a residue is a proven pre-existing main-side red with a fingerprint, not this flow).
- `npx tsc --noEmit` clean. (build unaffected — test-only.)
END: READY-FOR-GATES + the per-spec green/red TABLE (spec · desktop N/N · mobile N/N · notes). No table = not done.
