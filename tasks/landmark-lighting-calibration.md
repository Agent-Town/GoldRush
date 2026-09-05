# Task landmark-lighting-calibration: landmarks lit by the sun, not by themselves (LANE-C, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c` (branch `lane/c`).
READ FIRST: AGENTS.md; `docs/reviews/2026-09-05-astra-3d-review.md` §1 (F-ASTRA-1) and §4 (F-ASTRA-9: `keepLandmarkPaintReadable` at `src/world/Terrain3dClaimPilot.ts:638` routes the diffuse atlas into EMISSION, default intensity 3, tuned contracts ~1.45–1.5, so daylight landmarks light themselves while the terrain answers the sun; 443/443 pilot materials double-sided; `DoubleSide` at `:828`, `:959`, `:1722`); `src/world/LightRig.ts`; `src/core/Renderer.ts` (sRGB + ACES, exposure 1.05); `docs/GOLD_RUSH_BRIEF.md` §4 + §9 (illustrated, warm); `e2e/landmark-brightness.spec.ts` ("The Claim keeps daylight landmarks opaque, lit, and under the frame budget", "Night Shift keeps ground light pools without mutating landmark materials").
CODEX: model=gpt-6-astra effort=xhigh
SEQUENCING LAW: run after `lantern-true-world-reel` has MERGED to main (verify `git log --oneline main | grep -q 'lantern-true-world-reel'`) — else STOP and report "lantern stage not landed" (the reel must inherit the calibrated look, not a second one).
Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-c status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (Owner, 2026-09-05, verbatim: "Ok, then lets have it fix these findings. This is important stuff."; Astra F-ASTRA-9 + F-ASTRA-1, verified attended 2026-09-05 at `Terrain3dClaimPilot.ts:638`)
Astra: "calibrate representative terrain, landmark, building, and sprite together under one reference rig. Reduce whole-body emission gradually; retain emissive windows and teal systems. Enable backface culling on verified closed meshes, not through a global toggle." This is a LOOK change the owner will judge; ship it with A/B evidence and a one-word veto.

## Scope
1. **Reference rig harness** (`?debug` seam or a harness page): terrain + one landmark + one town building + the hero sprite under the SAME `LightRig`, with exposure and emission dials; produce the calibration table (values per family) in the report.
2. **Emission → lit diffuse:** the atlas becomes `map` under the sun with emissive intensity ≤ 0.6 for whole bodies; emissive windows/teal systems keep their glow; per-contract `LandmarkPaint` overrides preserved through the existing contract; the Night Shift ground pools untouched.
3. **Backface culling only where proven:** at load, classify each landmark/building mesh as closed (every edge shared by exactly two triangles) or open; closed → `FrontSide`, open → stays `DoubleSide`; log the census (closed/open counts per contract) in the report.
4. **Evidence:** A/B screenshots desktop + 390px for The Claim, Hill Mine, Mare Claim, Night Shift; frame p95 before/after; the landmark-brightness spec updated where its thresholds encode the old emission (name each changed assertion and why).
5. **Owner veto line** in your BACKLOG row: "reverse with the word REVERT-LIGHTING" (the drain records it on the desk).

## Firewall
Touch ONLY: `src/world/Terrain3dClaimPilot.ts` (paint/material functions only), `src/world/LightRig.ts` (intensity/exposure constants), the harness, `e2e/landmark-brightness.spec.ts`, `artifacts/landmark-lighting-calibration/**`, `tasks/BACKLOG.md` (your row). NO changes to: GLB/atlas files, the sim, town buildings' own material code (`src/town/**`), the Lantern stage.

## No-op / honesty guard
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate. If a scope item is impossible inside the firewall, STOP with the coupling points as file:line and the measured evidence; do not widen the firewall yourself.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` clean; `npm run build` green; `landmark-brightness` + `terrain3d-claim-pilot` + `perf-01-stress-budget` green desktop + 390px, zero console/page errors; the A/B screenshots and the p95 table; the closed/open census.
End: READY-FOR-GATES + the calibration table, the census, the changed assertions, the veto line.
