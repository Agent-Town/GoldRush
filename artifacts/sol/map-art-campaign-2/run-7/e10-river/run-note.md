# River pack — run 7, READY-FOR-GATES

Task: `tasks/running/lane-c--20260922-100643-f-corr4-18-river-pack.md`. The owner authorized a dedicated raw River pack on 2026-09-22. This slice is complete; full visual fidelity remains held as detailed in [review.md](review.md).

Preflight: clean art store on main; lane zero ahead / thirteen behind before reset to main. Only expected `logs/guard-stats.jsonl` churn. No evidence discarded. Required raw plate and Claim GLB symlinks resolved; `npm install --no-audit --no-fund` and baseline build passed. Store branch `astra/f-corr4-18` was created before authoring. Base code/store/engine are preserved in [base.json](base.json).

Code branch: `sol/map-art-campaign-2`. Store branch: `astra/f-corr4-18`, pushed and remote-verified at `d5e25522490ae7342e497ce58f51239040a41eb3`. Land code and store together. The engine pair is [engine-pair.json](engine-pair.json); the drain retains pin ownership. No edits to STATUS, specs, tests, simulation, collision registry or any other map. The description is the sole gameplay-descriptor byte change.

Completed: 32,768-triangle terrain, 1,024-triangle panorama, four 2,240-triangle shore groups and one 1,600-triangle ford group; five nonblocking bodies, 44,352 total authored triangles, 132 stones. Grid vertices preserve visual fallback heights within 5.9125e-8 m. Both banks/ford remain open, water cleanup is proven, and the actual finale lever still lands on the separate Claim charter. Builds, task-scoped guards and requested browser suites pass; four runs per performance arm remain within the 15% observed budget after explicit timing-mode review.

The first regular stone rails and mixed-color swatches were rejected and revised into irregular neutral-stone groups. A near panorama apron was rejected for enlarged blurry plate projection and moved beyond the 128 m playfield. Remaining coarse-continuation joins, water/ford shape, material contact, one-pan framing and HUD overlap are documented holds. A false zero-error height probe caused by Vite module duplication was rejected; final proof samples the actual installer-imported module and asserts a nonzero off-grid control.

The following commands run from the lane checkout with `/opt/homebrew/bin` first on PATH. Use only port 5303 and run browser captures sequentially after asset/source writes and builds have settled, to avoid HMR invalidation.

```sh
export PATH=/opt/homebrew/bin:$PATH
npx vite --port 5303 --strictPort
```

In a second terminal, source verification and capture reproduction:

```sh
python3 artifacts/sol/map-art-campaign-2/run-7/e10-river/verify-source-boundary.py
python3 artifacts/sol/map-art-campaign-2/run-7/e10-river/verify-invariants.py
node artifacts/sol/map-art-campaign-2/run-7/e10-river/verify-height.mjs
MAP=e10-river MODE=plain node artifacts/sol/map-art-campaign-2/run-7/e10-river/paired-capture.mjs
MAP=e10-river MODE=stations node artifacts/sol/map-art-campaign-2/run-7/e10-river/paired-capture.mjs
MAP=e10-river MODE=performance FRESH_BROWSER_PER_RUN=1 node artifacts/sol/map-art-campaign-2/run-7/e10-river/paired-capture.mjs
node artifacts/sol/map-art-campaign-2/run-7/e10-river/walk-and-repeat.mjs
node artifacts/sol/map-art-campaign-2/run-7/e10-river/river-route-proof.mjs
python3 artifacts/sol/map-art-campaign-2/run-7/e10-river/metrics.py e10-river
python3 artifacts/sol/map-art-campaign-2/run-7/e10-river/boards.py e10-river
python3 artifacts/sol/map-art-campaign-2/run-7/e10-river/performance-summary.py e10-river
```

The explicit mode review describes the saved samples, so reassess it if new performance measurements replace them. The before arm uses committed frozen source and the base contract; it normalizes current Vite dependency/timestamp URLs while preserving old executable source. It does not temporarily overwrite working code or gameplay files.

Rebuild assets only while holding the shared-store writer slot:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --python-exit-code 1 --python assets/pilots/map-rebuild-spike/build_river_pack.py
/Applications/Blender.app/Contents/MacOS/Blender --background --python-exit-code 1 --python artifacts/sol/map-art-campaign-2/run-7/e10-river/verify-terrain-source.py
/Applications/Blender.app/Contents/MacOS/Blender --background --python-exit-code 1 --python artifacts/sol/map-art-campaign-2/run-7/e10-river/verify-pack-source.py
/Applications/Blender.app/Contents/MacOS/Blender --background --python-exit-code 1 --python artifacts/sol/map-art-campaign-2/run-7/e10-river/verify-stone-grounding.py
```

Gates:

```sh
python3 artifacts/sol/map-art-campaign-2/run-7/e10-river/run-build-gates.py
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 npx playwright test e2e/e10-river-boot-guard.spec.ts e2e/e10-finale-staging.spec.ts e2e/preview-unlock-all.spec.ts e2e/landmark-brightness.spec.ts e2e/landmark-collision.spec.ts --workers=1
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 node scripts/map-landmark-loading-check.mjs
GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5303 node scripts/map-landmark-repeat-check.mjs
node --test scripts/glb-contract-guard.test.mjs scripts/terrain-height-sampler.test.mjs scripts/landmark-walk-surfaces.test.mjs scripts/open-sea-water.test.mjs scripts/shared-atlas-plugin.test.mjs
GR_GUARD_NO_ARTIFACT=1 node scripts/run-guards.mjs --only test:task-guards,test:citations,test:gate-callers
```

The shared checks regenerated 25 tracked evidence files outside this slice; their contents were copied to `shared-gate-evidence/` before restoring those tracked paths. [Restoration receipt](churn-restoration.json). Existing expected log churn remains. Rejected candidates, duplicate source reexports, shared-check screenshots and raw body/mask images are preserved on disk and omitted from the commit; local Git excludes prevent the lane runner from scooping those duplicates into its later automatic commit. [Packaging receipt](evidence-packaging.json). Normal views, boards, crops, frozen before-source text, scripts, logs and numeric receipts are committed.
