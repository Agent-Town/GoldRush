# Review: renderer-count-artifacts-under-shared-atlas — the exact texture pins the atlas dedupe moved (lane-d, Claude Opus 5 implementer, attended drain 2026-09-05)

**Slice/branch/tip:** `renderer-count-artifacts-under-shared-atlas` · `lane/d` · commits `010bf87d4`, `beb094e26 (archive: pruned by the A3 rewrite)`, `e824eba78` over base `c3884d89d` · merge `a0e1de8ce` (no-ff; BACKLOG union).
**Verdict:** MERGED. F-SAD-3 cured: the recorded renderer-count artifacts are re-MEASURED (never hand-edited — `e2e/renderer-count-artifact.ts:20-29` makes them a required input) and both wire specs are green again with no assertion changed.

## Old → new `textures`
| Spec | Project | Phase | Old | New |
|---|---|---|---:|---:|
| wire-crawler-3d | desktop | loadedBeforeKill / presentationBaseline / disposed | 40 / 39 / 36 | 39 / 38 / 35 |
| wire-crawler-3d | desktop | coldBaseline / mounted | 32 / 37 | unchanged |
| wire-crawler-3d | mobile | all five | 30/37/39/38/35 | unchanged (file byte-identical) |
| wire-railcar-3d | desktop | baseline / mounted / despawned / combatDeath | 39 / 42 / 38 / 38 | 37 / 39 / 35 / 35 |
| wire-railcar-3d | mobile | baseline / mounted / despawned / combatDeath | 37 / 41 / 37 / 37 | 35 / 39 / 35 / 35 |
One delta moved and was re-recorded exactly, not widened: railcar desktop baseline→mounted 3 → 2 (one railcar texture now shares an image already resident at baseline); mounted→despawned stays −4, so the dispose contract holds. `git diff` on the artifacts shows only `textures` numbers plus a provenance note.

## Evidence
| Gate | Result |
|---|---|
| Runner: two full 14/14 batteries (both specs × both projects) at host loads 11.8 and 6.0, crawler alone 3/3, zero console/page errors; tsc 0; build 0 | green; a final battery at load 43.4 came in 12/14 on the crawler's load-sensitive count (F-RCA-1) |
| Attended on the merged tree `a0e1de8ce` | see the drain commit message (the two specs on the drain port at load ≈ 8; era guard 5/5 — artifacts only; node-guards) |

## Findings
- **F-RCA-1 (pre-existing, inventoried, not re-recorded):** the crawler's `coldBaseline`/`mounted` counts drift UPWARD under host load on both projects (5 excursions of 36 observations, all above load 14, all on pins the atlas never moved); `wire-crawler-3d.spec.ts:117-119` samples at a fixed 800 ms after a `frame > 12` gate. A dedupe can only remove textures, and the railcar spec was exact across the same load range (the control). Spec-side cure (sample after a settle, not a fixed delay); fire-authorable.
- **F-RCA-2 (tooling, fire-authorable):** `artifacts/f1476-1/measure.mjs:21` deletes the artifact before each run, which F-1478-1 made a required input, so the documented measuring path dies at `:33`; `artifacts/s1477-noise/measure2.mjs:18` shares the defect. Verified by running it; the artifact was restored byte-identical.
