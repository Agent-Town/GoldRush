# Review — T7 THE STARSHIP (era door E7→E8), SAGA WALL slice 2/5

**Slice/branch/tip:** lane-t7-ceremony · lane/m4 · tip `9d2d5e45` (runner(lane-b))
**Base:** `8eccb2ea`. **Merged onto main after T6** (de956491) — real 3-way (both main-with-T6 and lane added to `src/ceremony/scripts.ts` + `e2e/ceremony-framework.spec.ts`).
**Verdict:** MERGED (s896), `git merge --no-ff lane/m4`, conflicts resolved by UNION.

## What it does
Adds the seventh era-door ceremony, closing the Signal era and arming the Orbital Frontier (E7→E8) — SAGA WALL slice 2/5 (F-REH-01). `T7_THE_STARSHIP` is a played-not-watched ceremony with a **new gating mechanic**: the door holds at a `needs-exit-beat` state until `e7SignalExitBeatReady()` (the switchboard chief keeps the patched jack lit until the last frequency goes dark), then a **timed-release hand** (charge 900ms / window 700ms) throws the final umbilical to start the countdown. Canon: the crew of made agents boards, the Prospector at a porthole; frontier-tech rocketry, no firearms. `CeremonySystem` gains the `needs-exit-beat` door-state + render branch + the timed-release early-release reset; `epoch-7-signal` manifest successor `null → epoch-8-orbital`.

## Merge classification (3-way)
| File | Class | Resolution |
|---|---|---|
| `src/ceremony/CeremonySystem.ts` | LANE-TOUCHED (main untouched since base) | auto-merged clean |
| `assets/contracts/epoch-7-signal/manifest.json` | LANE-TOUCHED | auto-merged clean |
| `src/ceremony/scripts.ts` | BOTH-MOVED (main added T6 block+registry; lane added T7 block+registry) | UNION — kept T6 + T7 blocks, registry `[T3,T4,T5,T6,T7]` |
| `e2e/ceremony-framework.spec.ts` | BOTH-MOVED (main added T6 test+registry assertion; lane added E7/E8 consts, `seed()` `e7ExitReady`, two T7 tests, assertion) | UNION — kept T6 test + both T7 tests sequential; consts + seed change (auto-merge preserved via `checkout -m`); registry assertion `[t3,t4,t5,t6,t7]` |

Deps verified present on main before merge: `src/systems/E7SignalSystem.ts::e7SignalExitBeatReady` ✓, `timed-release` hand kind (scripts.ts:24 type + CeremonySystem handling) ✓.

## Evidence (native macOS, self-server)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green ✓ 1.74s |
| ceremony-framework.spec **desktop-chrome** | **10/10** — T6 ✓, T7 door-waits ✓, T7 umbilical-arms E8 ✓, plain-boot ✓ (no flake this run) |
| ceremony-framework.spec **mobile-chrome** (390px) | **10/10** — same, zero flakes |
| arm-exactly-once E8 + kept-image + reload persistence | asserted green (T7 umbilical test) |
| needs-exit-beat gating | asserted green (T7 door-waits test) |
| zero console/page errors | every ceremony test asserts `errors = {console:[],page:[]}` |
| screenshots | artifacts/ceremony-framework/{desktop,mobile}-chrome-t7-{door-ready,countdown}.png (this gate) |

## Canon check (§9)
Frontier-tech rocketry (Starship on a river pad, relay towers, switchboard chief); no firearms; made-agent crew with the Prospector; illustrated/warm, never gory. PASS.

## Findings
- None blocking. Artifact churn for t3/t4/t5/t6 PNGs from the gate runs discarded (non-deterministic render noise); only new t7 shots committed.

Next: T8 (lane/perf, Orbital door E8→E9) — 3-way against main-with-T6-T7.
