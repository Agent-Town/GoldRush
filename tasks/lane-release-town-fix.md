# Task lane-release-town-fix: P0 LAUNCH-BLOCKER — the frontier town must boot (LANE-A, commit prefix "fix:")
You are Codex (worktrees/lane-a). CODEX: model=gpt-5.6-sol effort=xhigh
READ FIRST: the owner's find (E1 preview, first-player path): `Uncaught Error: Expected 60 Mei world dispatches, found 0. TownScene:55` — account created, town never mounts · src/town/worldDispatches.ts + its TownScene validation (the 60-count assertion spans E1-E10) · the release-build exclusion scoping (RF-05b — what pattern swept the dispatch data) · specs/release-e1 §THE FRONTIER IS PHYSICAL.
Pre-flight: standard safe-dupe; npm i; tsc+build green + `GR_RELEASE=e1 npm run build:release` green.
## Scope
1. FRONTIER-AWARE DISPATCHES: E1's dispatch tables SHIP in the release build (Mei must bark on the frontier); the validation expects the RELEASED-frontier count derived from data present, never a hardcoded full-game 60; full build unchanged (60 still asserted there — derive both from one source).
2. Audit the exclusion scoping for the same class: any OTHER full-game-count assertions or cross-era data consumers that the E1 build breaks (encyclopedia/world-outside pages, ceremony postscripts, gazette) — table them, fix the same way (data-derived expectations).
3. THE SPEC LEARNS THE OWNER'S WALK: e2e/release-build.spec.ts gains THE FIRST-PLAYER PATH against the release-built preview — create profile → enter town (Mei barks) → open the Book → launch the Claim → return to town — zero console/page errors end to end, both projects.
## Firewall: dispatch data scoping + derived assertions + the spec. NO dispatch content changes, NO full-build behavior changes.
END: READY-FOR-GATES + the audit table of full-game-count consumers.
