# Review — board-layout-full-picture

**Slice/branch/tip:** board-layout-full-picture · lane/m4 · tip `ce524e1b` (runner lane-b) → landed on main as `87d1b052`
**Drained by:** s378 fire, 2026-07-12 (idle-attended wave drain #3 of 3)
**Verdict:** ✅ MERGED (tip-graft, not branch-merge) — with one non-blocking finding (F-board-1)

## What it does
The town contract board now presents "the full picture": art, briefing, best result, and launch button fit in view together, and the Ride Together card is tucked into a collapsible `<details>` disclosure that remembers its open/closed state per session (`sessionStorage['gold-rush:ride-together-open']`). A new toggle handler in `onBoardClick` flips the state; `formatBest` gets em-dashes. Collapsed by default so the contract picture reads cleanly; expands on click and stays open across board close/reopen within the session.

## Evidence
| Gate | Result |
|------|--------|
| tsc --noEmit | clean |
| npm run build | green (441ms; TownScene chunk 55.79→56.50 kB, consistent with additions) |
| e2e/town-t3-board.spec.ts | 12 passed (6 tests × desktop+mobile, 37.1s) incl. new "remembers the Ride Together disclosure" test (collapsed→hidden controls→toggle→open persists) |
| boot errors | zero (spec `assertNoErrors` clean both viewports) |
| adjacent | see F-board-1 (mp-02-lockstep — already-RED owner-gated) |

## Merge classification
- **Base:** lane/m4 tip `ce524e1b` sits over 085 `d38f46bc` (OWNER-GATED four-rider) → NOT branch-merged (would drag 085 onto main).
- **src/town/town.css, e2e/town-t3-board.spec.ts** — main == branch base (`git diff ce524e1b^ main -- <files>` EMPTY) → clean whole-file `git checkout ce524e1b -- <paths>`; verified `git diff ce524e1b -- <files>` EMPTY (byte-match tip).
- **src/town/TownScene.ts** — MAIN-MOVED (main independently evolved this file +119/−25 since the branch base). Applied board-layout's 5 hunks **surgically via Edit** (RIDE_DISCLOSURE_KEY const · rideExpanded field · onBoardClick toggle handler · `<aside>`→`<details>`/`<summary>`/ride-body wrapper · em-dash formatBest); every hunk's pre-image anchor verified present on main. Post-graft `git diff ce524e1b main -- TownScene.ts` == exactly +119/−25 (main's evolution only) → clean 3-way, both sides preserved. No whole-file checkout (would have reverted main's evolution).
- **artifacts/board-full-picture/** (14 PNGs) — LANE-TOUCHED new files → checkout. No collision with main's dirty `artifacts/town-t3/*` (attended-owned, different dir).

## Findings
- **F-board-1 (non-blocking; owner-gated dependency):** the Ride Together disclosure is collapsed by default and its controls are hidden when collapsed (proven by the passing disclosure test — `ride-together-controls` `not.toBeVisible()` at collapsed state). `e2e/mp-02-lockstep.spec.ts` clicks `ride-open-claim` (L512), `ride-start` (L516), `ride-join-*` (L520/L522) **without** first expanding the disclosure → those clicks now target hidden elements and will fail. mp-02-lockstep is **already a known-RED, owner-gated spec** (four-rider tick budget at :543, parked behind the 085 relay/tick-budget design fork) and is not part of any green gate, so this does NOT block board-layout. **Corrective when 085/mp-02 is un-parked:** add `await <page>.getByTestId('ride-together-toggle').click()` before the ride-control clicks in mp-02-lockstep (both alice and bob paths). Recorded on the owner's four-rider desk item in the handoff.
