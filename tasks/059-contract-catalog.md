# Task 059-contract-catalog: the Contract Board becomes a VISUAL CATALOG — one page per contract (lane-b, town surface; commit prefix "feat:")
**OWNER ORDER 2026-07-09 (verbatim, with screenshot evidence): "here descriptions are repeated. It would be great to have some visual support here and make it a catalog where each experience is one page. Give it some space, make it visual."**
You are Codex in worktrees/lane-b. Pre-flight per LANE-SAFETY (safe-dupe wording). READ FIRST: the town Contract Board component (grep "Contract Board"/"contract" in src/town + src/ui), the contract descriptors (name/flavor/goals/rules/unlock/result), the Claim Ledger reader (`src/`, EN-01) for the parchment page pattern, `e2e/town-t3-board*` + screenshot above's card layout.

## Scope (in order)
0. **BUG FIRST, own commit (`fix:`):** every board card renders its flavor description TWICE ("The classic river claim." ×2 — all cards). Root-cause it (likely the same string rendered in a summary slot AND a description slot) and render it ONCE. e2e asserts the flavor text occurs exactly once per contract.
1. **THE CATALOG:** replace the cramped grid with one contract per PAGE — a spacious parchment spread: contract ART on top (**placeholder-first, registry-keyed**: reuse existing art per contract — the Claim = river tile art, Dry Gulch = mesa, Night Shift = dusk/lantern, Twin Banks = braided river, Baron = `kit-the-baron`, Hill Mine = steam terraces — so real plates swap in by key later, zero code change), type chip + Open/Locked state, the name BIG, flavor once, GOALS and RULES given air, the "No result yet"/best-result line, and the Launch button.
   **THE MYSTERY LAW (owner, same order, verbatim: "maybe don't even give the player so much details about future encounters - there should also be some mystery"):** LOCKED pages are TEASERS, not spec sheets — show the name, the art DIMMED/sketch-faded, ONE rumor-toned flavor line (reuse the existing flavor or a shortened cut of it), and the unlock requirement BIG. **HIDE goals and rules entirely until unlocked** ("The clerk draws up the terms when you're ready." as the placeholder line). Full details appear only when the contract unlocks — locked pages stay browsable; the catalog sells anticipation, not information.
2. **NAVIGATION:** prev/next arrows + page dots + "3 / 6" count; swipe on mobile (390px); keyboard arrows on desktop; reopening the board returns to the last-viewed page.
3. Entry point unchanged (tavern board button); board data unchanged.

## Firewall
Touch ONLY: the board UI component(s) + its styles, an art-registry key map, its e2e, artifacts. **NO sim, NO contract data/balance changes (beyond the dup fix if it proves data-side), NO other town surfaces.**

## Self-check
tsc/build · board e2e updated: dup-fix assertion, page navigation (arrows/dots/swipe), Launch works from page 1, a locked page shows its requirement, last-page memory · adjacent town-t3/story-loop suites green · zero console errors · desktop + 390px screenshots of two different pages → `artifacts/059/`.
End: **READY-FOR-GATES** + the screenshots + which art key each contract got.
