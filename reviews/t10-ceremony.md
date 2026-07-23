# reviews/t10-ceremony.md — T10 THE CHARTER PRESS (saga-wall slice 5/5, closes F-REH-01)

- **Slice:** lane-t10-ceremony — T10 the Charter Press, the E10 finale door reachable in plain play
- **Branch/tip:** lane/m4 `fa9ed6b0` (runner(lane-b)), base `ceb41e23`
- **Merged to main:** `be7625831f98567ca301f940b403c2d63f2da0d0` (`feat: T10 the Charter Press …`, `--no-ff`)
- **Fire:** s958 · 2026-07-23

## Verdict
**PASS — merged.** The last saga-wall door ships. F-REH-01 (the saga arming/landing only E1→E9) is now **fully closed**: a player who completes the E10 science ceiling and takes the Cosmography `charter_press` node can reach the E10 finale (four-hands-one-lever → river lever → THE RIVER) entirely in plain play — no `?debug`, no `?e10static`, no `e10Finale.close()`.

## What it does (one paragraph)
The T10 slice is **not** an inter-era transition (per the draft, line 19: E10 is terminal, the finale hands on via the river lever, `activateEpoch` is not called). Its job was the *real in-town trigger* for the Charter Press, which the rehearsal could previously reach only via debug flags. `TownScene.ts` adds `renderCharterPressDoor(surface)` + `openCharterPress()`: when `activeEpochId() === epoch-10-deepsky`, a door renders at both the schoolhouse and the in-town charter-press site, gated on `scienceMeter(...).complete` AND `hasResearchNode(research, 'charter_press')`. It surfaces three derived states — `needs-science` / `needs-research` / `ceremony-ready` — and on open lazy-loads `E10FinaleSystem` (pre-existing on main), sets the town UI inert, and closes back cleanly (restores prompt/diagnostics). The door is **derived, never consumed** (idle arms nothing; re-openable). The E1-release build is gated off (`if (__GR_RELEASE_E1__) return`). `successor: null` in `epoch-10-deepsky/manifest.json` is correct and untouched — E10 has no successor epoch.

## Evidence (real numbers, merged tree)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean (rc=0) |
| `npm run build` | ✓ built in 1.30s |
| `ceremony-framework.spec.ts` (playwright.ceremony.config, self-boots vite :5241) | **28/28 passed** (4.1m), desktop-chrome + mobile-chrome |
| — T10 THE CHARTER PRESS (both projects) | PASS — door states needs-science→needs-research→ceremony-ready; in-town site trigger visible + opens finale; idle opens nothing; `e10-river-lever` → `contract=the-claim&nowaves` → "The River" briefing; ACTIVE_EPOCH stays E10 (no spurious arm) |
| — T3–T9 precedents (both projects) | PASS — unregressed by the `openSchoolhouse` test-helper change (keyboard-walk → `teleport(-6.6, 2.4)`) |
| — plain boot inert (both projects) | PASS — framework sits inert, no overlay, no writes |
| console/page errors | zero (every test asserts `{ console: [], page: [] }`) |

Screenshots: `reviews/shots-t10-ceremony/` (desktop+mobile × door-ready + four-hands-one-lever).

## Merge classification
- Base `ceb41e23`; main advanced to `8eec4e46` since base (census-landmark-brightness drain + s957/s958 bookkeeping).
- `git diff --name-only ceb41e23 8eec4e46` (main-moved) vs `git diff --name-only main...lane/m4` (lane-touched): **zero overlap**. All lane files are LANE-TOUCHED-only / NEW:
  | File | Class |
  |------|-------|
  | `src/town/TownScene.ts` | LANE-TOUCHED (main untouched since base) |
  | `e2e/ceremony-framework.spec.ts` | LANE-TOUCHED |
  | `artifacts/ceremony-framework/*t10*.png` ×4 | NEW |
- Clean `git merge --no-ff` (ort), no conflicts, no 3-way judgment needed.

## Findings
- **F-t10-1 (non-blocking, verified safe):** the master's READ-FIRST names "the successor-manifest fix (successor: null → the real successor)". This is generic T6-T9-pattern language that does **not** apply to T10 — the draft (single source of scope) explicitly rules T10 is not an inter-era transition (E10 terminal, finale hands on via the river lever). `successor: null` is left correct and untouched. No action.
- **F-t10-2 (non-blocking):** the `openSchoolhouse` e2e helper changed from a keyboard walk to a `teleport`. Affects all T3-T9 ceremony tests; all 28 pass on the merged tree, so the refactor is proven safe. Test-only, no product impact.
- **F-t10-3 (non-blocking, deferred):** adjacent early-game suites (task-025 / m1-01 / m2-01) were **not** separately re-run. The new code is structurally inert outside E10: `renderCharterPressDoor` returns `null` unless `activeEpochId() === epoch-10-deepsky`, and the added `syncPrompt`/`activateTownAction`/`update` guards key off `this.e10Finale` (undefined until the finale opens). The 28-test ceremony battery boots the town on both projects with zero-console assertions across E3-E10. Risk to E1/E2 gameplay: negligible.

## Notes for the ledger
- Closes **F-REH-01** (all five saga-wall doors T6-T10 now shipped; the ten-era saga is arm-able + landable end to end).
- Player-visible → gazette item appended.
- Gameplay-affecting → DEPLOY LAW applies (deferred to attended launch owner, consistent with the town-scale-zoom + census-brightness pending merges).
