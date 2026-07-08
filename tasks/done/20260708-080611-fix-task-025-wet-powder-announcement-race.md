# fix-task-025-wet-powder-announcement-race — FIRE-AUTHORED (attended review welcome)

**Slot:** main (repo root) · **Role:** Codex implementer, native Mac, cwd = repo root.
**Pre-flight (tracked-clean main):** `git status --short` shows no tracked src/e2e edits (artifacts/*.png + logs/dashboard.html noise OK); `npm install`; `npm run build` green. If a live main-slot task is running, STOP.

**READ FIRST:** `AGENTS.md`; `e2e/task-025-bandits-dont-swim.spec.ts:145` (the failing test); `src/game/Game.ts:~3012` (Prospector chip announcement source — do NOT change it).

## Why (F-176-1, s176 drain of e2-pressure-economy, 2026-07-07)
`task-025-bandits-dont-swim.spec.ts:145` ("wet powder disables and then restores weapons") is flaky on **desktop-chrome** (~⅔ fail; mobile passes). Proven PRE-EXISTING on main (revert-run-reapply against pre-merge 075a6dc: 2/3 fail without pressure-economy). Root cause is TEST FRAGILITY, not a game bug: at line 186 the test reads `__THREE_GAME_DIAGNOSTICS__.ui.announcement` — a single most-recent-announcement field — and asserts `.toContain('Wet powder')`. The L0 Prospector permission-chip announcement ("the Prospector: follows and observes. Chip by weapon; claim wins grow it.") races and frequently wins the field at read time. The feature is CORRECT: the live Wave-status region shows "Wet powder." (see `reviews/e2-pressure-economy.md` page snapshot).

## Scope
1. In `e2e/task-025-bandits-dont-swim.spec.ts:145`, make the wet-powder assertion robust to the announcement race. Assert against the durable Wave-status DOM that actually renders the disarm message (the `generic "Wave status"` region shows "Wet powder.") — e.g. poll `page.getByRole('generic', { name: 'Wave status' })` / the wave-status text node for `/Wet powder/`, instead of the transient `diagnostics.ui.announcement` field. Keep every other assertion in the test unchanged (bolts===0, disarmed===true, reticle disarmed, restore-after-wade).
2. Confirm the fix is deterministic: run `task-025:145` desktop `--repeat-each=5 --workers=1` → 5/5 pass. Run mobile too (must stay green).

## Firewall
Touch ONLY: `e2e/task-025-bandits-dont-swim.spec.ts` (the :145 wet-powder assertion). **NO** game/src changes — the mechanic works; this is a test-assertion hardening. NO changes to the Prospector announcement. NO other tests.

## Self-check
tsc/build green; `task-025-bandits-dont-swim` full file green both projects `--repeat-each=3 --workers=1` (all 5 tests, no flake); zero console errors. Commit on the main slot with prefix `fix:`. End: READY-FOR-GATES + the repeat-each pass counts.
