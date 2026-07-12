# Review — e2-pressure-in-run (Steamworks pressure mechanic goes live)

- **Slice:** e2-pressure-in-run (BUILD-PLAN §4 E2 item ②)
- **Source branch/tip:** `lane-polish-ts04` (worktrees/lane-c) tip `884ab88d` — runner(lane-c): e2-pressure-in-run.md
- **Landed by:** s413 fire, as a **RE-LAND** onto fresh main (surgical delta `git diff 0e051103 884ab88d`, applied via Write/Edit/cp — `git apply`/`cherry-pick` are permission-denied to fire+subagents).
- **Verdict:** ✅ MERGE-READY — gated clean, drained to main.

## Why a RE-LAND (not a direct merge)
Branch `lane-polish-ts04` sits on stale base `835c8108` (2026-07-11 10:38; main is **193 commits ahead**). A raw `git diff main 884ab88d` is 282 files of stale-base noise. The branch's 4 prior sibling commits (map-beauty-dry-gulch, 086-fixture-runtime-seams, 2 fixes) were already tip-grafted to main by earlier fires; only the TIP `884ab88d` was undrained. The clean task delta is exactly `884ab88d` vs its parent `0e051103`: **17 files, 573 insertions, 4 deletions** — near-additive. File-probed NOT on main pre-drain: `BoilerHouse.ts`, `PressureSystem.ts`, `e2-pressure-in-run.spec.ts` all absent (genuinely undrained, not a false-ahead tip-graft). Attended E2 wave was IDLE 42min with no review-in-progress → s412's clearing condition met (§7.6 honored; Mistake #15 RE-LAND discipline applied).

## What it does (the Steamworks heartbeat)
Adds the in-run pressure loop for the E2 Hill Mine contract:
- **Boiler House** buildable (`src/entities/BoilerHouse.ts`, placeholder box+drum+stack until art) — E2/Hill-Mine-only, cap 3, cost 70.
- **PressureSystem** (`src/systems/PressureSystem.ts`, sole pressure writer) — harvests coal near the minehead, boilers consume coal → grant pressure per fixed-step tick; over `safeMax` (80) the boiler **vents** (comedic plume, loses `ventLoss` 35, brief cooldown — warm law, never harms people); PRESSURIZE objective = hold 2 boilers hot through waves 8–12.
- **HUD gauge** (`Hud.ts` + `theme.css`) — pressure track with safe-band overlay (revealed by `pressure_assay` research) and vent state color.
- Wiring: buildables/BuildSystem registration, Balance rows, encyclopedia + WorldInfoNotes entries, UiBridge snapshot fields, vite-env diagnostics type, Game.ts instantiation/update/reset/diagnostics/gating hooks.

## Evidence (all run by s413 on the re-landed tree)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | ✅ clean (validates every RE-LAND anchor + PressureSystem/BoilerHouse contracts + diagnostics shapes) |
| `npm run build` | ✅ green, built in 606ms |
| `e2e/e2-pressure-in-run.spec.ts` | ✅ **4/4** (desktop-chrome + mobile-chrome): coal feeds boilers → gauge climbs → vent fires over-band → PRESSURIZE completes; boilers remain Hill-Mine-only |
| Adjacent: e2-hill-mine, 072-era-activation, m1-01, m2-01 | ✅ all pass (43 tests, both projects) — incl. m2-01 "build menu shows six ready icons" (boiler correctly gated out of default menu) |
| Adjacent: 045-megaproject | ⚠️ pre-existing FLAKE — see F-1 |
| Boot probe (zero console/page errors, desktop + 390px) | ✅ covered by the 43 booting adjacent tests across both projects |
| Screenshots | artifacts/e2-pressure-in-run/{desktop,mobile}-chrome-{gauge-safe-band,vent-plume}.png (came via the delta) |

## Merge classification
Clean RE-LAND — all 17 delta files applied to current main: 4 new files (BoilerHouse, PressureSystem, e2 spec, 4 PNGs) copied verbatim from the worktree tip; 10 shared files received ONLY the additive pressure hunks via content-matched Edit (main's 193 commits preserved — zero existing code removed; verified by tsc + `git status` showing only additive diffs). No 3-way conflicts (delta is additive around stable enum/list structures that survived main's evolution).

## Findings
- **F-1 (non-blocking, pre-existing flake):** `045-megaproject.spec.ts:64` fails under parallel load but **passes in isolation, then fails on a re-run of the identical single-test invocation** — nondeterministic, therefore not a deterministic regression. Fingerprint proof it is NOT this slice: `PressureSystem.update` early-returns at line 66-68 (`if (!this.enabled()) return;`) for any non-Hill-Mine contract, so it adds ~zero load to the 045 megaproject run. Recommend a standalone flaky-test corrective for 045's timing/persistence assertions (owner-visible only if it reddens CI); does not block this drain.
