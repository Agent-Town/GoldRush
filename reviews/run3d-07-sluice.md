# Review — run3d-07-sluice (drain)

**Slice:** run3d-07-sluice (first buildable in the RUN-3D proving-ground ladder; establishes `Run3dPilot.ts` grammar)
**Branch/tip:** `lane/e2-arsenal` `55078c6e` (`runner(lane-c): run3d-07-sluice.md`), parent `25b60452`
**Merged to main:** s446 fire, path-scoped re-land (no `git merge` — lane-b runner live, hijack-guard)
**Verdict:** PASS — merged.

## What it does
Introduces the **RUN-3D pilot harness** — a URL-param-gated proving ground for validating buildable 3D models against their 2D sprite baselines before any gameplay wiring. New `src/game/Run3dPilot.ts` (`installRun3dPilot`) mounts the sluice GLB (`assets/pilots/run3d/sluice.glb`, 764 tris / 1 mesh / 1 material / embedded 512² PNG) mirrored across live sluice instances, driven off `buildSystem.diagnostics`. `Game.ts` adds a 6-line lazy hook: reads `?run3dPilot=` from the URL, sets `canvas.dataset.run3dPilotState`, and dynamically imports the pilot only when the param is present (update + dispose wired into the frame loop / teardown).

**Where does the player see this in a plain boot?** — **NOWHERE, by design.** With no `?run3dPilot=` param, `run3dPilotState='off'` and nothing loads (verified: `flag-off keeps the sprite shell and requests no sluice GLB`, boot probe zero-err). This is ladder infrastructure, not a user-facing gameplay merge (Mistake #10 answered honestly) → **no gazette item** (GZ-01 filter: no player-visible change).

## Classification
Lane base `25b60452`; main advanced ~6 commits since (s445 handoff, s446 lock, stamp-mill drain, gazette, stamp refresh) — **none touched `src/game/Game.ts`**, so Game.ts base==main and the +6 additive hook applies clean. STATUS.md appeared in the raw `main..lane` diff **only** as main-moved (advanced on main, untouched by the runner commit — verified `25b60452..55078c6e` touches exactly 15 files, STATUS.md not among them); NOT copied.
- **All-new (auto):** `src/game/Run3dPilot.ts`, `e2e/run3d-sluice.spec.ts`, `assets/pilots/run3d/{sluice.blend,sluice.glb}`, `artifacts/run3d-sluice/*`.
- **MODIFIED (additive, base==main):** `src/game/Game.ts` (+6). Landed diff verified == runner commit diff exactly.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 522ms · Run3dPilot lazy-imported (boot bundle unchanged, R4) |
| own spec `run3d-sluice` | **8/8** desktop+mobile (flag-off no-GLB · load-once + instance-mirror + demolish-unmount · lite/invalid sprite fallback · three-instance p95 within 115% budget) |
| adjacent run suite `m1-01-claim-jumpers-death` | **10/10** desktop+mobile, unmodified-green |
| boot probe `_s106-prospector-boot-probe` | **2/2** zero console/page errors, plain boot |
| p95 (3 instances) | pilot vs sprite ratio **0.498** desktop / **0.535** mobile (pilot faster than sprite baseline) — well under 115% |
| model | 764 tris, 1 mesh/material, base-centered inside 2×1 footprint; re-export SHA-256 byte-identical (`6194e910…`) |

## Findings
- **F-1 (non-blocking, runner-reported honestly):** the task requested a 12-instance p95 sample, but `Balance.sluice.maxCount` is 3 and the debug seam is read-only — the runner correctly gated at the **maximum legal 3 simultaneous sluices** rather than stretch the cap or add a synthetic write path (would violate the slice firewall). Accepted: 3-instance sample is the honest ceiling. (Vocabulary-Stretch avoided — Mistake #14 spirit.)

## Follow-on
Run3dPilot.ts grammar now exists on main → **run3d-08..14 clones are unblocked** (they were held back to avoid the Run3dPilot.ts create-collision). Queue them this fire.

Merged; lane/e2-arsenal content now on main.
