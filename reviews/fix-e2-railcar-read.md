# Review — fix-e2-railcar-read (the E2 railcar reads as a train)

**Slice:** lane-a #2 fix-e2-railcar-read (branch `lane/m3`, railcar commit `21eea97d`) → grafted to main
**Fire:** s454 drain (attended-driven graft), 2026-07-13
**Verdict:** PASS — merged.

## What it does
Answers the owner E2 playtest verdict "it is not a train?": the Armored Railcar segmented boss's components had been borrowing bandit walk sprites and floating in the off-field fog. This slice gives each railcar component a procedural armored-car InstancedMesh (per the 057 rocket-cart precedent) that sits on the rail line and is fog-gated on approach. `pools.ts` gains `createRailcarParts` / `railcarPresentation` / `railcarVisible` plus `eliteKind==='railcar'` guards on `baseMatrix`/`normalVisible` so railcar components render as rolling stock (mesh, rail-seated at `railY`) instead of the generic bandit sprite path. `Game.ts` threads a per-enemy `presentation` object into the test/diagnostics enemy snapshot; `vite-env.d.ts` declares the new `presentation: { mesh; visible; railY }` field. Rendering-only — no WaveSystem spawn logic, HP, damage, rail-route data, or CombatSystem touched.

## Evidence (native full runs on the MERGED tree)
- `npx tsc --noEmit`: clean (exit 0).
- `npm run build`: green (exit 0) — `Game-Co6fC3Bi.js` 526.13 kB / `index-7tzO6Xz7.js` 1,171.37 kB gzip 262.99 kB, built in 799ms; pre-existing chunk-size warning only.
- Playwright **44 passed** (exit 0, 5.1m, `--workers=1`, `--project=desktop-chrome --project=mobile-chrome`), zero console/page errors (each spec asserts `expect(errors).toEqual([])`):
  - `fix-e2-railcar-read.spec.ts` — **2/2** (desktop + mobile): 3 railcar components spawn on wave 11 (e2-hill-mine), all `presentation.mesh === true` (mesh not sprite), some off-field `!presentation.visible` (fog-gated on approach), all in-field become visible, and every component's render `y` sits within 0.01 of `presentation.railY` (rail-seated) across 2/8/12s sim samples; approach + in-field screenshots captured.
  - Adjacent regression (unmodified-green both projects): `057-baron-rocket-cart` (the mesh-precedent boss), `e2-escort-mode`, `e2-rail-entity`, `task-025-bandits-dont-swim`, `m1-01-claim-jumpers-death`.
- Boot probe: the slice spec boots the real game (plain `page.goto`, `?debug` only for test hooks) on desktop + 390px mobile with console+pageerror listeners; both clean.
- Perf: no new always-on batch (railcar mesh rides the existing elite render path with `eliteKind` guards); `e2-rail-entity`'s draw-call-budget assertion stayed green, `m1-01` stress=120 pool/draw-call budget green.

## Merge classification
Base `9d86e6da` (railcar commit `21eea97d`; lane tip `dc1bd775` is an unrelated sluice NO-OP — IGNORED, not drained).

| File | Class | Resolution |
|------|-------|------------|
| `src/entities/pools.ts` | LANE-TOUCHED only | main byte-identical to base since `9d86e6da` → clean-copy the lane version wholesale; grafted tree diffs empty against `21eea97d`. |
| `src/game/Game.ts` | MAIN-MOVED (3-way) | main drifted (+7/-2, the music-survives-pause fix). Kept main's current file; Edited in railcar's single new line `presentation: this.enemies.railcarPresentation(enemy),` after `bossDegradeSpeedMult`. |
| `src/vite-env.d.ts` | MAIN-MOVED (additive union) | Edited in railcar's `presentation: { mesh: boolean; visible: boolean; railY: number };` field alongside main's other additions. |
| `e2e/fix-e2-railcar-read.spec.ts` | NEW | copied wholesale. |
| `artifacts/fix-e2-railcar-read/*.png` (4) | NEW | copied wholesale (desktop/mobile × approach/in-field). |

Graft technique: plain `cp` for clean-copy + new files; `Edit` tool for the two drifted files (checkout/apply/cherry-pick gated in this environment). Firewall held — only the railcar PRESENTATION render path, the new spec, and its artifacts.

## Findings
- **F-railcar-1 (non-blocking):** lane tip `dc1bd775` (`fix-e2-sluice-water`) is a NO-OP sitting above the railcar commit on `lane/m3`; NOT drained here. Left for the s454 fire to mark no-op / re-queue with a corrected premise as it owns lane refill.
- No blocking findings. The railcar now reads as rolling stock (mesh, rail-seated, fog-gated), closing the owner's "it is not a train?" verdict.
