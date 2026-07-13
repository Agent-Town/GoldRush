# board-upcoming-surveys — the board promises more frontier (lane-d #2; commit prefix "feat:")
ROLE: UI + data. WORKDIR: lane-d (worktrees/lane-d). CODEX: model=gpt-5.6-sol effort=medium
ATTENDED-AUTHORED 2026-07-13 — owner, verbatim: "in the contract overview it ends after the first level of E2 - that is weird."

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. If the stop-reason is an undrained sibling, report "LADDER-STALL: waiting on drain of <slice>" (fires re-queue, pre-authorized). **RESET AUTHORIZATION (attended, 2026-07-13 ~08:30): lanes m3/m4/perf/e2-arsenal are all content-on-main via the morning drain train (sluice dc1bd775, railcar 21eea97d/fc581ab5, chapel 59932b79, assay 2b3c3a62, baron b85eb38e) — reset per safe-dupe and PROCEED.** Then `npm install --no-audit --no-fund`; `npm run build` green.

## WHY: the town board lists exactly the shipped contracts, so E2 shows ONE row and the world reads finished. It isn't: the Trestle is in build, Pressure Garden + Incline follow (BUILD-PLAN drip), and the Voltage Age waits behind the Dynamo. The board should SAY so — locked "survey pending" rows keep the horizon visible.

## READ-FIRST: the board render in src/town/TownScene.ts (contract rows, locked-row affordance if any) · assets/contracts/epoch-2-steamworks/manifest.json (add an `upcoming` teaser field — names/one-liners ONLY, no mechanics) · BUILD-PLAN E2 drip names (canon: "the Trestle", "the Pressure Garden", "the Incline") · the next-epoch teaser affordance in ResearchChart (renderNextEpoch — the visual grammar to echo).

## SCOPE:
1. Manifest channel: epoch manifests may carry `upcoming: [{ id, name, line }]` (display-only). Fill E2's with the three drip names + one-line ledger-voice teasers ("The gorge crossing wants holding." etc. — canon voice, no promises of mechanics).
2. Board: after the playable rows of the ACTIVE epoch, render upcoming entries as locked rows — "SURVEY PENDING" state, muted plate, not clickable; then the existing next-epoch teaser (Voltage) closes the list. When a real contract ships with a matching id, its teaser row is superseded automatically (playable row wins).
3. e2e `e2e/board-upcoming-surveys.spec.ts`: E2-active profile sees Hill Mine playable + 3 pending rows + the Voltage teaser; pending rows not launchable; when a contract exists with the same id (seed a fake), the pending row is gone; zero console/page errors, both projects. town-t3-board unmodified-green.

## Firewall
Touch ONLY: the board render block, the manifest `upcoming` field (E2 only) + its type, the new spec, artifacts/board-upcoming/. NO contract data/unlock logic, NO launch paths, NO other surfaces.

## Self-check
tsc + build green · new spec + town-t3-board green both projects · zero console/page errors · board screenshot. If you find yourself about to exit without changes, WRITE WHY into your report first.
END: READY-FOR-GATES + the teaser copy used.
