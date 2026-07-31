# citation-titles-rung-masters — drain review (s1299)

**Slice:** `lane-b-citation-titles-rung-masters` · **branch:** `lane/m4` · **lane tip:** `af61e16d`
**Merged at:** `0bb729f1` (content) + the s1299 bookkeeping commit that follows it
**Verdict:** ✅ **MERGED — and the guard it targets went further than the master asked: 12 → 0, not 12 → 1.**

## What it does

`npm run test:citations` had been RED on main at **exactly 12 offenders for three consecutive fires**
(s1296, s1297, s1298 each measured it, each re-explained it from scratch, each moved on). Every one of
the 12 cited a **helper or an assertion line in the middle of a test** — the one coordinate shape the
guard cannot walk back to a `test(` declaration, and the shape that rots first when a spec gains a line
above the test.

The runner re-aimed 11 of them (the two `tasks/lane-c-agent-rung-honest-gate*.md` masters) at their
enclosing declarations and annotated each with the real test title. Where a citation pointed at a
*shared* helper it was **expanded to its actual caller tests** rather than left on the helper: the M4-05
pan helper became two citations (`:212`, `:280`), the M4-06 pan family three (`:248`, `:289`, `:364`).

The 12th — `tasks/BACKLOG.md::e2e/ss-01-beats.spec.ts:88` — was **firewalled OUT of the lane on purpose**
(every fire edits BACKLOG on every drain, so a lane holding that edit conflicts by construction). s1298
called it "a fire-side one-liner". It was, and this drain closed it: one quoted title added beside the
coordinate inside F-1295-2's own prose.

## Evidence

| Gate | Result |
|---|---|
| `citation-title-guard` (merged tree, before the 12th) | **1 offender** (was 12) · 363 scanned |
| `citation-title-guard` (after the fire-side one-liner) | ✅ **PASS — 0 offenders**, rc=0 · NUMBER-ONLY 264→263, CARRIES-TITLE 76→77 |
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | rc=0, **21.73 s** |
| `npm run test:node-guards` | rc=0 (runner measured 196/196 baseline and final) |
| Blob assertion vs lane tip `af61e16d` | **MATCH ×2** — `fc6dcbcc`, `7d58c44c` (F-1295-1: never a clean `git status`) |
| Classification | `ahead=1 paths=2` · **LANE-ONLY 2, BOTH-MOVED 0** → exact path-scoped apply, no 3-way |
| Playwright | **Not run, and that is the honest call, not a skipped duty** — the diff is three tracked `.md` files with zero runtime surface. Nothing a browser loads changed. |

## Merge classification

Base `main`, clean. Both lane files **LANE-TOUCHED only** (main never moved either), so the merge is an
exact `git checkout af61e16d -- <2 paths>` with both blobs hash-asserted equal to the lane tip. No
conflicts, none resolved, nothing withheld.

## Findings

**F-1299-1 — THE `test:citations` BASELINE IS NOW ZERO, AND EVERY FUTURE DRAIN MUST BE TOLD.**
Three fires ran their gate battery against a *recorded expectation of 12*. That expectation is now
wrong in the dangerous direction: a drain inheriting "known red at 12" would read a **real new
regression at 1..11 as an improvement** and merge it. From this commit on, `test:citations` is
**GREEN on main, and any non-zero count is a genuine contribution of the diff under test** — there is
no longer a known-red subtraction to perform. Broadcast, not blocking.

**F-1299-2 — THE GUARD'S CITE PATTERN REQUIRES THE `e2e/` PREFIX, WHICH MAKES ITS OFFENDER KEY MISLEADING.**
The offender printed as `tasks/BACKLOG.md::e2e/ss-01-beats.spec.ts:88`. BACKLOG contains **two**
occurrences of that coordinate; only one carries the `e2e/` prefix (`CITE` at
`scripts/citation-title-guard.mjs:32` demands it), and it is the one buried inside a quoted stack trace
— *not* the prominent prose coordinate a reader's eye lands on first. I annotated the wrong one first,
re-ran, and got an unchanged `1`. **The re-run is the only reason I know**; had I trusted the edit I
would have committed a no-op and reported a fix. Cheap ask: print the matched raw string, not just the
normalised key. Fire-authorable, non-blocking.

**A closing note that belongs in the evidence, not in a footnote.** Taking the guard to zero took
**three** annotation passes, because *writing the ledger entry about the offender created two more
offenders*: F-1299-2's own prose quotes the coordinate twice — once as the guard's output key, once as
a stack-trace excerpt — and each quotation is itself a bare citation the guard then catches. s1296 hit
this trap at 11→15, s1297 hit it, s1298 hit it at 12→20 while writing the warning about it, and I hit
it as the fourth. **That is a property of the guard, not of anyone's care**, and it is the strongest
argument that the offender line should name the raw text to edit.

## Non-blocking note

The guard reports **900 citations in 118 tracked `.md` outside `tasks/`** as `NOT GATED`, largest
`logs/suite-red-inventory.md` (644). That scope ruling is **F-1252-1, on the owner's desk** — untouched
here. Worth restating only because F-1295-2 proved the inventory's coordinate keys rot silently and
one-directionally: they can turn a known red into a mystery red, never the reverse.
