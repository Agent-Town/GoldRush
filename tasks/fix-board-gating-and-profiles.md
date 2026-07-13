# fix-board-gating-and-profiles — the board respects the eras and dresses its futures (lane-d; commit prefix "fix:")
ROLE: UI + data. WORKDIR: lane-d (worktrees/lane-d). CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-13 — owner findings (screenshots): (1) "Hill Mine is directly accessible to a new account." (2) "The later contracts are missing their profiles in the Contract Board."

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## WHY:
- F-1: a FRESH account sees e2-hill-mine OPEN with a Launch button. Steamworks content must not front-run the era fiction: pre-E2 profiles should see it LOCKED with the condition that unlocks it (the board already has lock/condition affordances — town-t3 gates them).
- F-2: the survey-pending rows (Trestle/Pressure Garden/Incline) + the era teaser render as bare stubs against fully-dressed contract cards — they read broken, not tantalizing. Pending entries deserve PROFILE-GRADE dress: name, teaser line, a muted/parchment-sketch plate area, and a SURVEY PENDING stamp; the next-era teaser row likewise (its own "awaits the town" state).

## READ-FIRST: the board render + lock/condition affordance (src/town/TownScene.ts board block; e2e/town-t3-board.spec.ts "manifest rows, locks, conditions" — the existing grammar) · how contract lock conditions are expressed for E1 contracts (unlock chains) · epochIsActive/activeEpochId (era truth) · the board-upcoming-surveys landed slice (69d06f1d — the rows to dress) · the plate registry (which plates exist per contract; pending contracts have NO plate — the sketch treatment is deliberate).

## SCOPE:
1. ERA GATE: contracts whose epoch is NOT yet active render LOCKED with condition copy ("The Steamworks awaits — raise the Stamp Mill." for E2 on a pre-E2 profile). Era-active profiles keep current behavior (Hill Mine open in E2 ✓). Data-driven off the contract's epoch, no per-contract hardcoding.
2. PENDING PROFILES: survey-pending rows render as full cards — name, ledger-voice teaser line (from the manifest upcoming entries), a parchment-sketch placeholder plate region (styled, not empty), SURVEY PENDING stamp, no Launch. The next-era teaser row gets the same dress with its era name + "awaits the town."
3. Pagination/count truth: the "N/M" counter counts PLAYABLE contracts only; dots may show all rows but pending/teaser dots render muted (the 6/6-vs-10-dots confusion in the owner screenshot).
4. e2e `e2e/board-gating-and-profiles.spec.ts`: fresh-profile boot → hill-mine LOCKED with condition + not launchable; E2-active profile → hill-mine OPEN; pending rows carry name+teaser+stamp+sketch region (probe styled elements, not blanks); counter counts playable only; zero console/page errors, both projects. town-t3-board + board-upcoming-surveys specs UNMODIFIED-green.

## Firewall
Touch ONLY: the board render block + its CSS, the era-gate condition derivation (read-only era/epoch queries), the new spec, artifacts/board-gating/. NO contract data/unlock-chain changes beyond the era gate, NO launch flow, NO other surfaces.

## Self-check
tsc + build green · new spec + t3 + upcoming specs green both projects · zero console errors · screenshots: fresh-account board (locked Hill Mine + dressed pending rows) and E2-account board.
If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the condition copy used.
