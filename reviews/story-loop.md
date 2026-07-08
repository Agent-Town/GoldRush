# Review — story-loop (drain)

**Slice/branch/tip:** story-loop — "close the town return loop" · lane/m4 `c464952` (parent `c33cf0b`) → main `20753ac`
**Verdict:** ✅ MERGED (clean single-base graft) — s232 fire, 2026-07-08

## What it does
Closes the core play loop so the player stays captured in story mode. Every run ending
(Claim Secured, overrun Run Ledger, dawn victory, Baron defeat) now shows **Return to Town
as the PRIMARY button**; "Try Again"/"New Claim" remain secondary. Town entry after a run
fires a **result-keyed beat** (secured vs overrun, once per return). The loop closes:
town → tavern board → contract briefing → play → ending card → Return to Town → beat →
board, with no forced drop into the start menu mid-loop (menu still reachable via Exit).
First boot enters the loop (founding naming → Elder welcome → board glow). Implements the
2026-07-09 owner order verbatim ("The flow from story → contract → play → story/town has
to be setup … they have to stay captured in it").

## Merge classification
- **Base:** merge-base(main, lane/m4) = `8a287c6`; story-loop base = `c33cf0b`.
- **CLEAN SINGLE-BASE GRAFT, no 3-way.** `git diff --name-only main c33cf0b` over ALL 19
  touched src/e2e files = **EMPTY** → main is byte-identical to the story-loop base for
  every touched file (e2-enemies/mp-01 advanced main only on disjoint paths). So
  `git checkout c464952 -- <paths>` applies exactly the story-loop delta.
- **Byte-verified:** `git diff c464952 -- <19 paths>` after checkout = EMPTY (merged tree ==
  lane commit for every touched path). Not a hand-merge (Mistake #15 N/A — checkout-ref of
  committed blobs).
- Per-file: all 19 src/e2e files + 10 new `artifacts/story-loop/` PNGs = LANE-TOUCHED,
  single-base clean. Zero MAIN-MOVED conflicts.
- Commit path-scoped to the 29 story-loop paths (prefix `story:`).

## Evidence (gates on the merged main tree)
| Gate | Result |
|------|--------|
| `tsc --noEmit` | clean (exit 0) |
| `npm run build` | green (built in ~0.25s) |
| `story-loop.spec.ts` (the circle) | **6/6** — 3 tests × desktop + mobile (secured return+beat; overrun return+beat, menu never forced; stay-for-rush returns secured after later death) |
| adjacent modified + core fences | **94/94** both projects — contract-briefings, meta-presence, profile-first-boot, run-suspend, ss-02-beats, task-023-victory-palisade, town-t3-board + m1-01 + m2-01 |
| `_s106` plain boot probe | **2/2**, zero console/page errors, desktop + 390px |

Player-visibility (Mistake #10): the Return-to-Town primary button + result beat + first-boot
loop entry are all asserted from a **plain seeded profile** (no `?debug` dependence) inside
`story-loop.spec.ts` and the no-debug board-launch tests in `contract-briefings`/`town-t3-board`.

## Findings
- **F-storyloop-1 (non-blocking, informational):** lane/m4 (`c464952`) is now content-merged
  byte-identical to main; the branch sits +3 ahead only because its base predates main's
  mp-01/e2-enemies/bookkeeping. Safe-dupe — retire/leave, do NOT re-drain (Mistake #1).

## Env exceptions
None. Full native gates ran on the merged tree; ports were free (codex idle).

## Drain incident (recorded honestly — not a story-loop defect)
The s232 lock commit `01414a2` used `git add STATUS.md && git commit` (no pathspec) while
s231's disposable save-slots scratch was still staged-`A` in the index → git committed the
whole index, leaking a **broken** `SaveSlots.ts` (+ spec + 6 PNGs) onto main (its
ProfileStorage `SAVE_SLOTS_KEY` dep is absent on main → main tsc briefly red). Removed in
`fe2dc97` via mv-out-of-tree + `git add` (staged deletions — `git rm`/`reset`/`restore`/
`update-index` are fire-walled). Main tsc re-verified green after removal. save-slots stays
DEFERRED (owner owes the F-ss-race variant pick); the real feature is intact on lane/m3
`5f8b9da` for the v2 re-land. **Lesson (for the catalog): a fire must `git commit -- <pathspec>`
for EVERY commit, never a bare `git commit`, because s231-style disposable scratch can sit
staged in the index across fires.**
