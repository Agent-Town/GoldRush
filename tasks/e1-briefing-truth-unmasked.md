# E1 BRIEFING TRUTH — two defects the copy-red was hiding
**FIRE-AUTHORED (attended review welcome)** — s1068, 2026-07-26.
**STATUS: QUEUED to lane-a by s1070, 2026-07-26T09:08Z — BOTH blockers now cleared, the second by
measurement rather than by waiting.**
~~`lane/m3` still carries the undrained `2d0739f5`~~ → **RESOLVED (s1069): drained at `fa645b6c`, salvage
retired to `archive/lane-m3-2d0739f5`.** s1070 re-verified this independently: all three commits ahead on
`lane/m3` (`4401778f`, `2d0739f5`, `428c01d5`) are **content-identical to main** on every file they touch,
so the lane is false-ahead and its pre-flight `reset --hard` destroys nothing. LANE-SAFETY satisfied.
~~THE REMAINING BLOCKER STANDS — coordinate before dispatch~~ → **CLEARED s1070. The writer-collision
premise was inherited for two fires and is measurably FALSE.** The attended E1 verdict does live on
`review/e1-gameplay-depth` (attended-owned `gr-task-e1-gameplay` worktree, 4 commits, tip `7dcdcdc7`
07:42, still unmerged) — but classified against the merge-base `b702ebf5`, that branch **never moved
either file this task edits**:
| file | branch moved | main moved |
|---|---|---|
| `assets/contracts/epoch-1-frontier/contracts.json` | **no** | yes |
| `e2e/contract-briefings.spec.ts` | **no** | yes |
| `rehearsal/segments/e1-depth-play.mjs` | yes | yes |
| `rehearsal/segments/e1-depth-rivercamp.mjs` | yes | **no** |
The apparent overlap on the first two is pure stale-base drift (main moved, the branch did not). Attended's
only real unmerged content is in `rehearsal/`, which this task's TOUCH-ONLY excludes entirely — so there is
no writer to collide with. Attended is also verifiably quiet (last write `bb57af63` 08:21; tree carries only
dashboard churn). **This is the F-1067-2 shape s1069 named: the caution was right to exist, its stated reason
did not apply.** ⚠️ Still true and NOT a blocker for this task: do **not** touch `rehearsal/` here.

ROLE: developer · WORKDIR: repo root (or an ANY-LANE worktree once lane-a is safe)

## READ FIRST
- `reviews/e1-secure-wave-truth.md` — findings F-1068-2 and F-1068-3, with the exact failing assertions.
- `e2e/contract-briefings.spec.ts:356` and `:367` — the two failing tests.
- `assets/contracts/epoch-1-frontier/contracts.json` — the contract rows and their `boardRow.unlock`.

## WHY
Merging `lane-e1-secure-wave-truth` (main `<see reviews/e1-secure-wave-truth.md>`) repaired a copy
contradiction on main (F-1068-1). Both tests below previously died *at that copy assertion*; with it
fixed they run further and hit real defects underneath. Quoted from the drain review, s1068:

> "fixing the copy contradiction lets both tests run *further*, where they hit pre-existing defects that
> the earlier red was concealing."

Neither was introduced by that slice — it changed only two `twist.secureWave` values and briefing copy.

## SCOPE (each item independently testable; do them in order and STOP after 1 if 1 explains 2)

1. **F-1068-2 — `fallbackReason: "debug-disabled"` on a plain boot.**
   `e2e/contract-briefings.spec.ts:363` asserts
   `__THREE_GAME_DIAGNOSTICS__.contract.fallbackReason` is `null` after a plain (no `?debug`) board
   launch of The Claim; it receives `"debug-disabled"`.
   **First decide which side is wrong, and say so in the report before changing anything:** either the
   engine is falling back on a normal player boot (a real Mistake-#10 defect — the player's default path
   is the one that must work), or `"debug-disabled"` is a benign, expected marker on a non-debug boot and
   the ASSERTION is wrong. Read the code that sets `fallbackReason` and quote it. Do not "fix" the test
   to green without that quote.

2. **F-1068-3 — `e1-baron` board card reads `data-contract-locked="true"`.**
   `:367` expects `"false"` because `e1-baron` is in the spec's `UNLOCKED_BOARD_CONTRACTS`. Same fork as
   above: either the unlock rule genuinely leaves the Baron locked under the profile the test builds (a
   real progression defect — the Baron is the E1 finale) or the spec's expectation is stale. Trace the
   unlock rule from `boardRow.unlock` to the rendered attribute and quote the deciding line.

3. Whichever side is wrong, fix THAT side only, and leave the other test's behaviour untouched.

## FIREWALL
TOUCH-ONLY: `e2e/contract-briefings.spec.ts` · the single `src/` file that owns whichever behaviour item
1 or 2 proves defective · `assets/contracts/epoch-1-frontier/contracts.json` (only if item 2 proves the
unlock DATA wrong).
NO: wave tables · `Balance.ts` · briefing copy (that just shipped — do not re-litigate it) · art · any
other spec · `061-first-claim-onboarding.spec.ts` (its 3 reds are pre-existing and out of scope, F-1068-4).

## SELF-CHECK
- `npx tsc --noEmit` clean · `npm run build` green.
- `npx playwright test e2e/contract-briefings.spec.ts --workers=1` → **7 passed / 0 failed** on BOTH
  `desktop-chrome` and `mobile-chrome` (baseline at authoring: 5 passed / 2 failed on each).
- Adjacent unchanged: `board-era-chapters` + `board-gating-and-profiles` stay **4/4 green**;
  `061-first-claim-onboarding` stays at its known 1 passed / 3 failed (do not fix, do not regress).
- Zero console/page errors, desktop + 390px; screenshots to `reviews/shots-e1-briefing-truth/`.
- If item 1 or 2 turns out to be a stale ASSERTION rather than a defect, say so plainly in the report —
  "the test was wrong" is a valid, valuable outcome here, but only with the quoted code that proves it.

READY-FOR-GATES + report: which side was wrong for each of the two, the quoted deciding lines, and the
before/after pass counts for both projects.
