# railcar-reference-art — the locomotive takes its painted body (lane-a; commit prefix "feat:")
ROLE: art processing + presentation. WORKDIR: lane-a (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-13 — owner, verbatim: "there are already references for the train boss - if we can use them, that would be amazing. I like them."

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. If the stop-reason is an undrained sibling, report "LADDER-STALL: waiting on drain of <slice>" (fires re-queue, pre-authorized). **RESET AUTHORIZATION (attended, 2026-07-13 ~08:30): lanes m3/m4/perf/e2-arsenal are all content-on-main via the morning drain train (sluice dc1bd775, railcar 21eea97d/fc581ab5, chapel 59932b79, assay 2b3c3a62, baron b85eb38e) — reset per safe-dupe and PROCEED.** Then `npm install --no-audit --no-fund`; `npm run build` green.

## WHY: `assets/raw/plate-e2-boss-component.png` is the bundle-specced boss composite the owner likes: full armored-locomotive side elevation (cow-catcher, teal-porthole boiler, armored cabin) + the three DAMAGED component states (bent wheels, venting boiler, cracked cabin) — drawn exactly for per-component damage cross-fades. The just-landed railcar mesh (fc581ab5) is the placeholder this replaces (placeholder-first law working as designed).

## READ-FIRST: assets/raw/plate-e2-boss-component.png (LOOK at it: top = intact car, bottom row = 3 damaged component crops) · specs/epoch-saga/e2-steamworks-bundle.md §A3 item 4 (the component-zone contract: wheels/boiler/cabin separable, cross-fade per component) · the landed mesh presentation (`git show fc581ab5`) — its rail-seating/fog-gating/orientation SURVIVES; only the LOOK changes · the TS-02 facade matte precedent (parchment-ground plates need matting — LEDGER #40 F-tsfac-2 note) · scripts/extract-alpha.mjs (NOT directly usable — no #ff00ff key; use a matte approach: rembg venv precedent from LEDGER #35, or luminance/border matte — document the method).

## SCOPE:
1. Matte + crop from the plate: intact car (full side) + the three damaged-state crops → assets/processed/boss-railcar-*.png with clean alpha (parchment fully removed, engraving edges intact; report the matte method + edge QA).
2. Presentation: railcar components render the painted car segments as rail-oriented billboards (orient along the RAIL direction in the object's frame — Mistake #6 law, never camera-billboard) replacing the placeholder mesh look; per-component damage state swaps to its damaged crop as that component's hp crosses its threshold (component hp/degrade fields exist). Keep: rail seating, off-field fog gating, spawn logic untouched.
3. e2e: extend e2e/fix-e2-railcar-read.spec.ts (additive assertions only): painted presentation active (texture-key probe), damage-state swap fires on a scripted component hit, orientation follows the rail at 2 sampled points. Existing assertions unmodified.
4. Owner contact sheet: intact + damaged states in-run → artifacts/railcar-reference-art/.

## Firewall
Touch ONLY: assets/processed/boss-railcar-*, the railcar presentation module (the fc581ab5 render path), the spec (additive), assets/LEDGER.md (processing entry, same-commit), artifacts/railcar-reference-art/. NO raw edits, NO spawn/HP/damage numbers, NO other bosses, NO CombatSystem.

## Self-check
tsc + build green · railcar + 057 + escort suites green both projects · zero console/page errors · contact sheet at exact path. If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + matte method + component-swap thresholds used.
