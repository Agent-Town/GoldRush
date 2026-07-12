# process-e2-building-art — the depot, machine shop, rails, and icons take their true faces (lane-c; commit prefix "feat:")
CODEX: model=gpt-5.6-sol effort=medium
ATTENDED-AUTHORED 2026-07-12. QUEUE ORDER: runs AFTER wire-e2-enemy-walk4 (same lane, no shared files with it).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **RESET AUTHORIZATION (attended, 2026-07-12):** every lane-c ahead commit through tip `884ab88d` (e2-pressure-in-run) is CONTENT-ON-MAIN via attended cherry-picks this window (content-probed, not ancestry). Reset the lane-c branch to main per the safe-dupe rule and PROCEED — do NOT re-STOP on aheadness.

## WHY: assets/LEDGER.md "2026-07-12 — E2 completion batch drained": bld.rail_depot + bld.machine_shop PENDING-PROCESSING (384px promote), ter.rail_elements + icons.e2 PENDING-PROCESSING (extract-alpha ff00ff), bld.boiler_house PENDING-PROCESSING (384px promote — never regenerate). The E2 buildings/wiring SHIPPED on placeholders (placeholder-first law); the real paintings sit in assets/raw/.

## READ-FIRST: assets/LEDGER.md Process notes + the E2 completion batch table · scripts/extract-alpha.mjs · the SHIPPED building-art precedent: how bld-general-store.png / bld-chapel.png etc. were promoted into assets/processed/ + assets/layer-contracts/ (find the 384px promote convention in the LEDGER/done tasks) · the E2 buildings' current placeholder wiring (steam sluice/iron wall/saloon/strongbox + Boiler House/Depot/Machine Shop buildables from e2-buildings-wiring) · assets/raw/bld-rail-depot.png, bld-machine-shop.png, bld-boiler-house*.png, ter-rail-elements.png, icons-e2.png (inspect each BEFORE processing).

## SCOPE (each independently checkable):
1. Promote bld-rail-depot, bld-machine-shop, bld-boiler-house per the 384px building convention → assets/processed/ + layer-contract slots so the E2 buildables render the paintings (placeholders retired). NEVER regenerate any raw.
2. Extract ter-rail-elements + icons-e2 with `--key ff00ff` (grid per each sheet's own layout — inspect and report it) → processed cells; wire the icons into the E2 UI slots that currently show placeholders (research/build icons), and rail elements into the rail render slots if a placeholder sits there (rail SHIPPED — swap textures only, zero geometry/sim changes).
3. Visual QA per LEDGER law: no letters, no firearms, no gore, keyed cleanly, buildings read at billboard scale; screenshot each promoted building + the icon row in-game (artifacts/process-e2-building-art/).
4. e2e: extend or add a light spec asserting the E2 buildables render non-placeholder textures (texture-key/diagnostics probe) with zero console/page errors, desktop + mobile-390.
5. LEDGER: retire all five PENDING-PROCESSING lines same-commit (mark PROCESSED + date + evidence paths).

## Firewall
Touch ONLY: assets/processed/, assets/layer-contracts/*.json, the texture-slot references for E2 buildables/icons (texture keys only — NO building logic/cost/sim edits), assets/LEDGER.md, the new/extended e2e spec, artifacts/process-e2-building-art/. NO raw regeneration, NO geometry/collision/economy changes, NO enemy/townsfolk files (the other lane-c task owns walk4).

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green · new/extended spec green desktop+mobile-390 · the e2-buildings-wiring spec UNMODIFIED-green · zero console/page errors · in-game screenshots per building/icon set.
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.
END: READY-FOR-GATES + report per-asset promote/extract numbers and which placeholder each replaced.
