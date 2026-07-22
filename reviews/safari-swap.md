# Review — safari-swap (MQ-11, first external tester's Safari bug)

**Slice:** lane-safari-swap · **Branch:** lane/m4 · **Tip:** a830c0f5 · **Merged:** 086c9bfd (--no-ff) · **Base:** be391cf6 (2026-07-21 17:24, ~16h — but no hot-file conflict, see classification)
**Drained by:** s888 fire · 2026-07-22T09:xxZ · **Verdict:** ✅ PASS — merged to main.

## What it does (one paragraph)
Fixes MQ-11, reported by the game's first external tester (FrankieTown, on Safari, wave 11/level 17): on Safari the run HUD persisted into town after a swap-abort, and town buildings became walk-through (the one-error-two-symptoms hypothesis — a teardown exception left both the HUD mounted and collision state stale). The fix makes the run→town swap teardown exception-safe in `src/main.ts` (the swap path is restructured so a failure mid-teardown can't leave the HUD or collision registry half-torn), with a small `src/core/Renderer.ts` guard. A permanent **webkit** spot-gate is added (`playwright.scratch.config.ts` gains a Desktop Safari project on :5217) per the 058 real-webkit law, plus a new `e2e/safari-swap.spec.ts` that reproduces the fault on webkit and asserts the HUD is gone and town buildings are solid after a swap-abort. Chrome behaviour is untouched.

## Evidence (real numbers, s888 fire, merged tree)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean (0 errors) |
| `npm run build` | ✓ built in 1.18s |
| `e2e/safari-swap.spec.ts` (desktop-chrome + mobile-chrome + **webkit**) | **6 passed (10.1s)** — webkit repro green + no-`?debug` "plain boot is error-free" |
| `e2e/e1-baron.spec.ts` + `task-025-bandits-dont-swim` (desktop+mobile) | **32 passed (1.8m)** — full run/victory/town flow unregressed by the main.ts teardown refactor |
| Console/page errors | zero (spec collects page errors and asserts none; "plain boot error-free" green all 3 browsers) |

## Merge classification
Base `be391cf6` (~16h stale) but main moved **none** of the 4 touched files since base (`git log be391cf6..main -- src/core/Renderer.ts src/main.ts playwright.scratch.config.ts docs/MAP-QUALITY-REGISTER.md` → empty), and the same-fire locked-win merge (c21d1839) touched neither main.ts nor Renderer.ts → every file **LANE-TOUCHED only**, clean `git merge --no-ff`, zero conflicts. The base-staleness RE-LAND rule (Mistake #15) only triggers on hot-file conflicts; there were none. 5 files, +168/-32.

| File | Class |
|------|-------|
| `src/main.ts` | LANE — exception-safe run→town swap teardown (+51/-32) |
| `src/core/Renderer.ts` | LANE — teardown guard (+7) |
| `e2e/safari-swap.spec.ts` | NEW — webkit repro + plain-boot |
| `playwright.scratch.config.ts` | LANE — adds Desktop Safari (webkit) project on :5217 |
| `docs/MAP-QUALITY-REGISTER.md` | LANE — MQ-11 register entry |

## Findings
- No blocking findings. Firewall respected: Chrome path untouched (desktop+mobile chrome specs green), fix confined to the swap-teardown path + a webkit gate. The webkit project is now a permanent regression guard for Safari-only teardown faults.
