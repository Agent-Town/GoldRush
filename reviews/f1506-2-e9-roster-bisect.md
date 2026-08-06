# f1506-2-e9-roster-bisect

**Slice:** `tasks/lane-f1506-2-e9-roster-bisect.md` (FIRE-AUTHORED s1506)
**Branch/tip:** `lane/a` @ `cb7a09e79`
**Base:** `e36052976` · **Merged to main:** `39987a4252dad31fb8ba3d267dde1c288dc6dc42` (s1507)
**Gated in:** detached `gate-s1507` worktree (§3.0b), all playwright `--workers=1` (§3.1)

## Verdict

**MERGED.** The bisect did what it was authored to do, refused both cures it was forbidden, and
the cure it did propose is three lines that restore pre-culprit behaviour. Fifteen adjacent reds
were run down individually; **none is attributable to this merge**.

## What it does

`e2e/e9-roster.spec.ts` was 6 passed at `b66905c64` and 4 failed / 2 passed on main. The runner
bisected the window to first-bad `f3e2d102694d1c6f1c20a3fa3fcdcca1784d3962`
(`runner(lane-c): lane-tape-02-lantern-show.md`, 15 files / +841 / −41).

That commit made `Game.activeEpoch` derive from whichever epoch owns `activeContract`. Seed Run is
deliberately unavailable (`harvestAnchors: []`), so ordinary boots fell back to the **E1 Claim**
contract — and `E9ArsenalSystem` gates on `activeEpoch.order >= 9`. Every ordinary run was
therefore pinned to E1, which is exactly the two observed values: the terraform cannon never fires
(`0`) and diagnostics publish `eraActive: false`.

The cure (`src/game/Game.ts:634`) keeps contract-derived epochs **only** for `?replay=` Lantern
routes — the behaviour the culprit introduced them for — and returns ordinary and debug runs to
`selectActiveEpoch()`.

```ts
private readonly activeEpoch = new URLSearchParams(window.location.search).has('replay') && this.contractEpoch
  ? loadEpoch(this.contractEpoch.id)
  : selectActiveEpoch();
```

`this.contractEpoch` is untouched and still feeds `e6TileConsumers`, so the E6 path is unchanged.
`new URLSearchParams(window.location.search)` at class-field init is the established house pattern
in this file (`:645`, `:668`, `:1144`, `:1219`), and no node-side guard imports `Game.ts` — so the
line adds no new environmental assumption.

## The two forbidden cures were both refused

The master forbade refreshing the red inventory and forbade editing `e2e/e9-roster.spec.ts`
(making the test agree with the regression). **Verified by file list, not by the report's word:**
the diff is exactly `docs/bench/e9-roster-regression.md` (+90) and `src/game/Game.ts` (+3/−1).

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, 4.1 s |
| `npm run build` | green, 15.5 s |
| own spec `e2e/e9-roster.spec.ts` | **6 passed** — matches the GOOD endpoint exactly |
| culprit's own spec `e2e/tape-02-lantern-show.spec.ts` | **2 passed** (both projects) — the feature the culprit shipped still works |
| adjacent, 25 specs derived by grep at drain time | 162 tests: **146 passed, 15 failed, 1 skipped**, 1157.7 s |
| `test:node-guards` (pre-merge baseline, this fire) | rc=0, 345 tests, 342 pass, 0 fail, 3 skipped |

**The adjacent denominator was re-derived, not inherited.** The runner named a handful; I ran
`grep -rln 'eraActive|selectActiveEpoch|activeEpoch|epochOrder|era-active' e2e/` and got 26 specs,
25 after removing the own spec. A review's adjacent list is perishable and this cure changes
`activeEpoch` for *every* non-replay boot, so the wide denominator was the point.

## The 15 adjacent reds, attributed one at a time

Queried with `red-inventory-lookup`, never grep. ⚠️ Its **line 1 is a header**; the verdict is
line 2 — reading line 1 makes every spec look identical, and my first pass did exactly that.

**KNOWN-RED, fingerprint-matched on title *and* error shape** — `e9-arsenal` ×2 (`:92`, 75% blast
radius), `e6-arsenal` (`:45`), `e2-t2-dynamo-ceremony` (`:89`, `dynamo-hall` vs `stamp-mill`),
`ui-era-dressing` (`:65`, 90 s timeout), `wire-era-anchor-emitters` (`:95`, `5` vs `25`).

**CLEAN-IN-INVENTORY yet red — so NOT excused, and controlled instead.** `072-era-activation:226`
and `landmark-collision:68` (both projects). A control arm at pre-merge `a4556dca5`, same worktree,
same composition, same shell, reds them **identically**. Pre-existing, not this merge. They are
`CLEAN-IN-INVENTORY`, which means *ran and passed* — so they are live regressions from some other
window. Filed as **F-1507-2**.

**One candidate that survived to the end, and did not survive measurement.**
`town-dynamo-hall-blender:97` was red in the merged arm and green in the control arm — a genuine
3-vs-4 delta. Three further measurements killed it:

1. **N=3 alone, each arm:** 12 passed, 12 passed, 12 passed — **6/6 green**, both arms.
2. **Same composition on the CONTROL arm, ×2:** the test reds **there too**, both runs.
3. That control pair returned **3 failed then 6 failed on one commit**, and the assertion's own
   bound moved (`10.2 vs <=10.005`, then `18.1 vs <=11.155`).

So the bound is computed at runtime and the test is load-sensitive under co-scheduling. The
composition's failure *count* is unstable on a fixed commit, which means **a single-run cross-arm
comparison was never a valid instrument** — including the one that produced the 3-vs-4 delta.
Filed as **F-1507-3**.

⚠️ **A vacuous verdict was caught on the way.** My first attribution script printed *"no new reds
attributable to the merge"* while its title regex matched nothing — it compared two empty lists and
would have printed those words whatever the arms did. The second pass parses playwright's
end-of-run failure block and **refuses to conclude** when tallies report failures but no entries
parse.

## Merge classification

Three-way `git merge --no-ff`, never a two-dot diff. Base `e36052976`; main had advanced by three
s1507 commits (`690fa990d`, `a4556dca5`, plus the lock). **Merged by the `ort` strategy with zero
conflicts**: both files are LANE-TOUCHED only — `src/game/Game.ts` was not moved by main in the
window, and `docs/bench/e9-roster-regression.md` is a new file. Nothing MAIN-MOVED, nothing
BOTH-MOVED, so no graft was required.

## Findings

- **F-1507-2** (new) — `072-era-activation:226` and `landmark-collision:68` are `CLEAN-IN-INVENTORY`
  and reproducibly red on main in both arms. By the F-1506-2 rule these are bisectable regressions,
  not ledger gaps, and must **not** be cured by refreshing the inventory. Fire-authorable.
- **F-1507-3** (new, non-blocking) — `town-dynamo-hall-blender:97` asserts a **runtime-computed**
  bound and is load-sensitive under co-scheduling: 6/6 green alone, red under composition in both
  arms, with the bound itself moving 10.005 → 11.155. **REC: assert the invariant, not the sampled
  millisecond; do NOT re-pin to silence it (F-1441-3).**
- **F-1506-1 / F-1507-1** — the runner's own report again logged `node-guards` 343/345 with both
  failures in the timeout fixture, independently re-confirming F-1507-1 from the lane side.

## Duties

Player-visible (the E9 arsenal works again in ordinary play) → gazette item appended, deploy run.
