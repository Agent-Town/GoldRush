# sol/town-blender-v3 — Tavern proof findings

Branch: `sol/town-blender-v3`
Parent: `22824e0d`
Verdict: **READY-FOR-GATES with two fingerprint-matched baseline reds; OWNER VISUAL VERDICT REQUIRED before any plaza/horizon work.**

## What changed

The Tavern facade shell can now be replaced by a locally authored Blender GLB only when `?town3dPilot` is present and the resolved device tier is not LITE. The loader uses the existing canonical Tavern slot and approach, validates the imported asset before mounting it, leaves the existing facade visible until success, restores it on any failure, and disposes loaded or late-arriving resources. No gameplay, collision, approach, footprint, or interaction data changed.

The plaza/horizon second commit was not started.

## Evidence

| Gate | Result | Evidence |
|---|---:|---|
| TypeScript | pass | `npx tsc --noEmit` |
| Production build | pass | `npm run build`; separate `TownTavernPilot`, `GLTFLoader`, and hashed GLB outputs |
| Pilot e2e, dev | 6/6 | desktop + 390 px mobile |
| Pilot e2e, production preview | 6/6 | desktop + 390 px mobile |
| Default-off network | pass | zero Tavern GLB requests before and after entering Town |
| FULL load | pass | exactly one GLB request; source `glb`; Tavern prompt and Board preserved |
| LITE law | pass | source `facade`; zero Tavern GLB requests |
| Load failure | pass | invalid GLB leaves facade and Tavern Board interaction intact |
| Cleanup | pass | loaded Town exit publishes `disposed`; loader uses `disposeObject3D` for loaded and late results |
| Console/page errors | pass | zero in flag-off, flag-on, LITE, and handled-load-failure paths |
| Asset contract | pass | 5,470 tris; 1 material; embedded 1024² PNG; 0 cameras; 0 lights; 4.230w × 3.349d; base-centered |
| Desktop renderer | pass | calls 90→78; p95 9.9→9.8 ms (−1.01%) |
| Mobile renderer | pass | calls 70→59; p95 9.7→9.8 ms (+1.03%) |
| Neutral visual review | pass to owner gate | final candidate rated “B less wrong”: complete gabled landmark instead of a hollow facade shell |
| Independent code review | pass | `codex review --uncommitted` via compatible local `gpt-5.4`; no discrete correctness findings |

Primary artifacts: `artifacts/town-blender-v3/contact-sheet-facade-vs-glb.png`, `contact-sheet-tavern-closeup.png`, `asset-contract.json`, `renderer-delta-desktop-chrome.json`, `renderer-delta-mobile-chrome.json`, and `gate-summary.md`.

## Findings

### F-01 — Owner eye remains the release gate (non-blocking-with-owner)

The final neutral comparison rates the GLB as materially more complete and readable: roof, chimney, walls, porch, and steps form one landmark silhouette. The remaining visible polish risks are a broad/uniform roof, flat pale window panels, and the dark porch/foreground-NPC overlap at gameplay scale. These are taste/readability calls for the mandated owner verdict, not grounds to start the plaza/horizon work automatically. Evidence: the two contact sheets above; runtime material treatment at `src/town/TownTavernPilot.ts:53`.

### F-02 — T4 requested regression is already red on the branch parent (fingerprint-matched baseline red)

The combined requested regression battery completed 58/62 green. In both projects, untouched `town-t4-growth.spec.ts` expects `town-growth-general-store`, but current main queues `ledger-page:the_claim` first. A detached, untouched `22824e0d` worktree reproduced the same received value in both projects (0/2). This branch does not touch story/beats and must not repair that drift. Evidence: `artifacts/town-blender-v3/gate-summary.md`.

### F-03 — T6 requested regression is already red on the branch parent (fingerprint-matched baseline red)

In both projects, untouched `town-t6-surfaces.spec.ts` expects `Enter Town`, `Profile`, and `Settings`; current main also renders `Claim Ledger`. A detached, untouched `22824e0d` worktree reproduced the same extra action in both projects (0/2). This branch does not touch StartMenu and must not repair that drift. Evidence: `artifacts/town-blender-v3/gate-summary.md`.

### F-04 — Scope and simulation invariants preserved (pass)

The TownScene integration is ten added lines at `src/town/TownScene.ts:227`, `:338`, and `:448`. Placement is read from the existing canonical descriptor in `src/town/TownTavernPilot.ts:84`; collision, footprints, approaches, prompt logic, run simulation, menus, scoreboard, and story files are byte-unchanged. The new e2e follows the live Tavern approach diagnostic rather than hard-coding coordinates (`e2e/town-tavern-blender.spec.ts:114`).

## Merge classification

- Base: `22824e0d`.
- Lane-touched: the two new Tavern source assets, one new loader module, the ten-line TownScene hook, one new e2e spec, this review, and `artifacts/town-blender-v3/*` only.
- Main-moved/conflicts: none during implementation.
- Asset provenance: local Blender authoring from the approved `assets/processed/bld-tavern.png` color/style anchor; no paid generator, external download, or new license obligation.
