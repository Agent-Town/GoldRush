# Review — night-shift-bite (the dark must BITE + the night gets its own geography)

- **Slice:** night-shift-bite (LANE-C)
- **Branch/tip:** `lane/polish` @ `197ac37` "fix: make night shift darkness bite"
- **Base (merge-base):** `3bee675` (the night-shift master commit; main's src tree byte-identical to base at drain time → all touched files purely LANE-TOUCHED, no 3-way needed)
- **Drained onto:** main @ `53db5ee` (s215 lock)
- **Verdict:** ✅ MERGE — gates green, firewall-respecting (render-only dark + additive relight mechanic, sim/targeting untouched), one non-blocking test-hardening finding.

## What it does
Answers Robin's 2026-07-08 ~21:00 playtest ("not so dark that I can't see… I don't really need lanterns… same geography"):
1. **TRUE DARK, gamma-robust.** `LightRig` drives dark background/fog to pure `#000000` and sun/fill intensity to **0** at full darkness; `Balance.nightShift` drops `minLight 0.16→0.045`, steepens `lightFalloff 5→1.25`, adds `renderVisibilityCutoff: 0.35` + `renderVisibleBoost: 12`. `EnemyPool` cubes the out-of-radius falloff (`(1-falloffT)**3`) so beyond the light enemies are functionally invisible (sampled luminance ≤ 0.06), and adds a camera-facing **night-readability** billboard layer so in-light enemies read cleanly (≥ 0.35). Turret acquisition/damage unchanged (sim/render split intact — verified by the dedicated combat test).
2. **Lanterns necessary.** Scripted seeded assault with vs without lantern coverage yields a decisive visible-threat delta; briefing/ledger copy sharpened to "The claim, gone dark, dotted with cold lanterns."
3. **The night's geography.** Cold-camp dressing: pre-placed **wrecked** lantern posts (`ContractBuildableFixture.wrecked/relightCost`) relight at a fixed cheap cost (`repairCostOverrides` store, persisted through run-suspend/continue), duskier palette + thicker edge fog — all `nightShift.enabled`-gated so other contracts are untouched.

## Evidence
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (302ms; index 1347.89 kB) |
| `e1-night-shift.spec.ts` desktop (7) | green on retry (see F-1) |
| `e1-night-shift.spec.ts` mobile (7) | green first-try |
| adjacent `m1-01` + `m2-01` both projects | green |
| modified `contract-briefings` + `ss-02-beats` + `tile-identity-pass` both projects | green (44/44 combined, incl. default-claim + dry-gulch byte-identity) |
| console/page errors | zero (spec `expectClean` + m1/m2 boots) |
| screenshots | `artifacts/night-bite/{desktop,mobile}-chrome-{true-dark-lantern-ring,cold-camp-dusk,dawn-wave-25}.png` |
| chosen values | minLight 0.045 · lightFalloff 1.25 · renderVisibilityCutoff 0.35 · renderVisibleBoost 12 · duskDarkness 0.62 · dark bg/fog #000000 · sun/fill →0 |

Gated on an isolated fire-owned vite dev (`playwright.s215.config.ts`, port 5231) to avoid contention with the live lane-b town-T6 runner on 5188.

## Merge classification
Base `3bee675` == main's current src tree (all 9 commits since base are bookkeeping/task-authoring, `git diff 3bee675..main -- src e2e assets artifacts` empty). Every one of the 21 touched files is **LANE-TOUCHED only** — checked out directly from `lane/polish`, no 3-way. Files: `src/world/LightRig.ts`, `src/entities/pools.ts`, `src/systems/BuildSystem.ts`, `src/game/{Game,Balance,RunSuspend}.ts`, `src/meta/ContractFamilies.ts`, `src/story/beats.ts`, `src/assets/generated.ts`, `src/vite-env.d.ts`, `assets/contracts/epoch-1-frontier/contracts.json`, `e2e/{e1-night-shift,contract-briefings,ss-02-beats,tile-identity-pass}.spec.ts`, `artifacts/night-bite/*.png` (6).

## Findings
- **F-nightshift-1 (non-blocking, test-hardening):** `e1-night-shift.spec.ts:348` ("cold lantern relight costs survive run suspend and continue") is load-flaky on **desktop only** — at `timescale=40`, when the renderer is slowed by 6 prior heavy tests, the claim is lost (death-overlay) before the setup `dismissBriefing` click lands, so the click is intercepted. Passes isolated (`-g`, 11.5s), passes on playwright retry (7/7), and mobile passes first-try — the relight/suspend GAME code is correct; the test setup races the sim. Harden by dismissing the briefing before the frame-advance gate or lowering the setup timescale. Corrective optional (owner/next-lane-c).
- **F-nightshift-2 (nit, non-blocking):** `generated.ts setTintScalar` clamp ceiling raised `0..1 → 0..12` to admit `renderVisibleBoost`; behavior-neutral for anything not requesting scalar>1 (only night-shift does).
- **Owner playtest welcome:** confirm the night-readability billboard highlight reads well in-game (camera-facing, consistent with the existing enemy-sprite billboard convention).
