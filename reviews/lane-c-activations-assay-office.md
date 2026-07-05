# Review — lane-c: jumper 8-way activation + build portraits + Assay Office (s9as drain)

**Verdict: MERGED with reconciliation.** Lane ran on fresh worktree (post-rebuild, base b231a85); main had moved (028, m5-04) — hand-merge drain, cat-law + anchored hunks.

## What landed
- **Jumper 8-way activation**: Enemy.ts gains OrientationResolver (7 hunks, re-anchored around 028's leadVelocity/scripted fields); pools.ts feeds `animationOrientation` + grab/flee clips to the animator. Probe: jumper walking east renders `char-jumper-sheet-rotation-r1c0.png`, direction 'e', mirrored:false, zero errors.
- **Build-menu portraits**: BuildButton/UiBridge/styles tile refactor (icon+copy grid); five bld portraits on tiles; blurb/portraitSlug in UiSnapshot.
- **Assay Office buildable**: river-adjacent placement (ghost invalid inland — e2e-asserted), cost 80, maxCount 1, repair entry; **Enter near office opens the Assay Bench** — bench finally leaves ?debug-land.

## Reconciliations (crafting fork, per s50 incumbency ruling)
- lane-c's OWN AssayBench.ts (295 lines, instant-craft mock + duplicate lab types) **DROPPED** — incumbent m5-04 offline-queue bench wins (owner decision); Game.ts wiring compatible as-is (same class name/ctor). Added 3-line `focus()` to incumbent (glue).
- Spec corrective (review-fix authority): office test asserted lane-c's instant `Accepted` flow → rewritten to incumbent post round-trip (`assay-post` → `Posted|JSON ready`).
- vite-env: GrBuildableId union refactor re-applied by hand (patch silently no-op'd); lane's sloppy `id: any` corrected to GrBuildableId (F-lane-c-1, fixed at merge).
- styles: only .hud-build-tile blocks grafted; .assay-bench styling stays incumbent's (m5-04 gated).
- SKIPPED (main-moved-only, zero lane delta): Projectile, main.ts, CombatSystem, TargetingSystem, m1-01 spec — 028 intact by construction.

## Evidence (in-VM, warm-server; Mac in-lane READY-FOR-GATES green prior)
tsc/build clean (vite via linux rolldown binding). lane-c spec 3/3 desktop + portraits mobile-chrome; m2-01 + m5-04 suite 3/3; m2-04 5/7 observed no-failures (wall-clock cut, sim scope untouched); vp-02b 2/5 observed no-failures (hero scope zero-diff). Direct animator probe JSON above; zero console/page errors. Shots: reviews/shots-lane-c-activations/ + lane worktree artifacts/.
First-run reds were env cold-start drift (webServer boot inside test window), not code — all green warm.

## Env lessons (binding)
- **Mount tree is now BUILDABLE in-VM**: `npm i @rolldown/binding-linux-arm64-gnu --no-save --ignore-scripts` (lands on Mac disk, harmless there). tsc always worked; vite needed the linux native.
- libXdamage wipe recurred → stub recipe re-ran (gcc → /tmp/locallibs, LD_LIBRARY_PATH).
- Chromium launch on full disks: TMPDIR=/sessions/.../tmpdir + PLAYWRIGHT_BROWSERS_PATH=/tmp/pw-browsers.

## Carried findings
- F-m5-04-1 (bench occludes HUD chips) now PLAYER-VISIBLE (office opens bench in normal play) — priority up, next polish slice adds collapse/close affordance (Esc should close).
- Office panel styling = incumbent debug-era parchment; visual pass fine in shots, polish later.
