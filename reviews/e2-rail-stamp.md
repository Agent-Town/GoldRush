# Review — e2-rail-entity + e2-stamp-mill (WP-E2 slices ① + ④)

**Slices:** e2-rail-entity, e2-stamp-mill-manifest · **Branch:** lane/perf · **Lane tip:** 3749f12 (d106a43 rail + 3749f12 stamp) · **Merge commit:** 08b336f · **Drained by:** s176 fire (2026-07-07, 2nd drain this fire — serial, after e2-pressure-economy a21821a)

## Verdict
**PASS — merged to main.** 3-way merge, single trivial import-union conflict on Game.ts resolved cleanly; tsc clean, build green, both own specs green + overlap regression (pressure) green + adjacent all green. 40/40 both projects.

## What it does
- **① Rail path entity** (`src/world/RailPath.ts`, 215 lines): render+routing socket for E2's rail spine per the Steamworks bundle. Epoch-1 renders zero rails (asserted); a dev key (`gt-test-basin&rails=dev`) renders a terrain-conforming rail spine. Rails do not change the sim hash and stay under the draw-call budget (render-only, sim-neutral per the rendering-vs-sim law).
- **④ Stamp Mill megaproject manifest** (epoch-1-frontier manifest + ResearchTree/ContractFamilies data): the Stamp Mill builds to its door manifest **without switching epochs** (no transition ceremony — that ships attended after the owner plays the buildup, per the E2 order). 045-megaproject-consuming site data.

## Evidence
- **tsc:** clean (validated the Game.ts import union — all of `activeEpoch`, `activeTileDescriptor`, `RailPathDescriptor`, `ContractManifest` export from ContractFamilies).
- **build:** green, ✓ built in 231ms (standing chunk warning only).
- **Playwright battery:** `playwright.s176.config.ts` (self-boot vite preview :5234), `--workers=1`, desktop + mobile. **40 passed / 0 failed (3.6m):**

| Suite | Tests (×2) | Result |
|---|---|---|
| e2-rail-entity (own ①) | 3×2 = 6 | ✅ epoch-1 zero rails · basin rail spine terrain-conforms · rails sim-hash-neutral + under draw budget |
| e2-stamp-mill (own ④) | 1×2 = 2 | ✅ manifest builds to door without epoch switch |
| e2-pressure-economy (overlap regression) | 3×2 = 6 | ✅ — confirms the Game.ts/ContractFamilies 3-way did not regress ② |
| sci-04-contract-registry | 3×2 = 6 | ✅ (ResearchTree/ContractFamilies touched) |
| m1-01-claim-jumpers-death | 4×2 = 8 | ✅ (WaveSystem touched) |
| m2-01-build-menu | 6×2 = 12 | ✅ |

## Merge classification
- **Base:** merge-base(main, lane/perf) = `9c6b693`. Lane = 2 commits (d106a43 rail, 3749f12 stamp).
- **Main moved since base:** the s176 drain of ② (a21821a) landed pressure-economy, which overlaps lane/perf on `src/game/Game.ts`, `src/meta/ContractFamilies.ts`, `src/vite-env.d.ts`.
- **Per-file 3-way:**
  - `src/game/Game.ts` — **CONFLICT (content), resolved.** Single both-add region in the ContractFamilies import block (lines 14–21): HEAD/② added `activeEpoch as selectActiveEpoch`; lane/perf added `activeTileDescriptor` + `type RailPathDescriptor`; both add `type ContractManifest`. Resolution = **union** (keep all, dedupe ContractManifest). Rest of Game.ts auto-merged (disjoint body regions). tsc + pressure-regression spec confirm correctness.
  - `src/meta/ContractFamilies.ts`, `src/vite-env.d.ts` — auto-merged (additive both-add).
  - NEW (free): `src/world/RailPath.ts`, `e2e/e2-rail-entity.spec.ts`, `e2e/e2-stamp-mill.spec.ts`, `artifacts/e2-rail/*`, `artifacts/e2-stage-*`.
  - `src/meta/ResearchTree.ts`, `src/systems/WaveSystem.ts`, `src/ui/ResearchChart.ts`, `assets/contracts/epoch-1-frontier/manifest.json` — lane-only, clean apply.

## Findings
- None blocking. The Game.ts union resolution is the only manual judgment; validated by tsc + the pressure-economy regression suite passing on the merged tree.
