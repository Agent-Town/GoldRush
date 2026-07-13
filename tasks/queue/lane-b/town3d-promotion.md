# town3d-promotion — the 3D town becomes THE town (lane-b; commit prefix "feat:")
ROLE: pilot promotion. WORKDIR: lane-b (worktrees/lane-b). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — OWNER RULING, verbatim: "This 3D version looks much better. Lets use this as the normal version."

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## READ-FIRST: the ?town3dPilot dispatch (TownScene/TownTavernPilot — the full mounted set: plate, 9 buildings, props) · the promotion requirements banked in HANDOVER §4-appendix item 6 (lazy loading, total-bytes budget, LITE law, owner verdict — the verdict is now GIVEN) · performance tiers · boot-byte budgets (perf-05 pattern).

## SCOPE:
1. DEFAULT ON: a plain town boot mounts the full 3D set (plate + buildings + props) with NO flag. `?town3d=off` opts out (debug/comparison); LITE tier keeps the painted town exactly as-is (law); any GLB failure falls back per-piece to its painted form (existing per-pilot fallbacks hold).
2. LAZY + BUDGETED: GLBs stay OUT of boot-critical bytes (assert vs baseline); load progressively (plate first, buildings by proximity/visibility, props last); publish a total-GLB-bytes diagnostic; painted facades render until each model arrives (no pop-to-empty).
3. The pilot flag remains honored for e2e (existing suites keep passing UNMODIFIED — they assert flag-on behavior which is now also default behavior; verify no spec asserted flag-OFF-means-painted on a PLAIN boot — update ONLY such assertions, listing each in the report).
4. e2e `e2e/town3d-default.spec.ts`: plain boot mounts 3D (probe pilot state without flag), ?town3d=off keeps painted, LITE keeps painted, boot-bytes unchanged, progressive-load order holds, p95 within 115% of painted boot; zero console errors; both projects.

## Firewall
Touch ONLY: the pilot dispatch default + opt-out flag, the progressive-load ordering, the new spec + minimally-adjusted plain-boot assertions (each listed), artifacts/town3d-promotion/. NO models, NO townLayout, NO sim.

## Self-check
tsc + build green · new spec + tavern + store + plate suites green both projects · zero console errors · boot-bytes table + load-order trace in the report. If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the bytes/load-order tables.
