# Task lane-board-era-chapters: the Contract Board becomes THE BOOK — era chapters, secrets kept (LADDER — queue at first free lane, commit prefix "feat:")

You are Codex, implementer for Gold Rush (worktree per your lane).
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md · src/town/TownScene.ts (the Contract Board render — the flat 1/41 carousel the owner just outgrew) · src/meta/ContractFamilies.ts (contracts grouped by epoch manifest; activeEpoch/epoch order — the reached-frontier truth) · the era accent system (canvas townEraAccent) · e2e board/tavern specs (extend, don't fork).

Pre-flight (LANE-SAFETY): standard safe-dupe rules; npm install; tsc+build green.

## Why (OWNER DIRECTIVE 2026-07-18, verbatim: "I think we have to reorganise them into eras - each epoch getss kind of their own chapter and in it there are the contracts for this epoch. And epochs that the user did not yet reach are not spilling their secrets, they stay hidden.")
41 flat contracts overwhelm and spoil. The board should read like the saga: chapters, in order, earned.

## Scope
1. CHAPTERS: the board groups contracts by epoch — a chapter header per era (era name + accent styling per the era-accent system), its contracts inside; navigation by chapter (the 1/41 dots become per-chapter, or chapter tabs — pick the simplest form that reads at kid-height).
2. SECRETS KEPT: epochs BEYOND the profile's reached frontier render NOTHING — not name, not count, not locked-card silhouettes; **absent from the DOM entirely** (no spoilers in markup). The frontier chapter is the last visible one. (Optional single warm line after the last chapter: "The book has more pages than these." — no era names.)
3. THE FRONTIER TRUTH: reached = the profile's highest activated epoch (the activeEpoch/reconcile pointer — read through the existing seam, no new writers).
4. DEBUG/TOUR: under `?debug`, all chapters visible (the owner's tour + the test plan depend on it).
5. Spec e2e/board-era-chapters.spec.ts (both projects): fresh profile sees ONLY the E1 chapter (and no E2+ text anywhere in the DOM) · with era-seeded frontier (the &era=N door) chapters 1..N visible, N+1.. absent · debug shows all · every contract of a visible chapter remains launchable · Ride Together + ledger surfaces unaffected · zero console.
## Firewall: TOUCH-ONLY the board render/nav in TownScene (+ its css) + your spec. NO contract data changes, NO launch-path changes, NO epoch-arming logic.
## Self-check: tsc+build · your spec + wd02-barks + a tavern boot green both projects · zero console.
No-op guard: exit-without-changes = WRITE WHY first.
END: READY-FOR-GATES + a screenshot of the E1-only fresh-profile board + the all-chapters debug board.
