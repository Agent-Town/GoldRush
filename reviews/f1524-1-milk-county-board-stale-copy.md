# f1524-1-milk-county-board-stale-copy — six stale full-text assertions re-pointed at the shipped copy

**Slice:** `f1524-1-milk-county-board-stale-copy` (F-1523-7 corrective)
**Branch:** `lane/a` · **tip:** `d0231980d` · **base:** `main` at gate time `4bebada01`
**Gated in:** detached worktree `worktrees/gate-s1525` (§3.0b custody), three-way merge commit `64eed189`
**Drained by:** s1525 · **Verdict:** ✅ **MERGE**

## What it does

s1521's `lane-fd3-boards-pass` (`7abee977`) deliberately rewrote the county board and field book empty
states into the county's voice — exactly what its own gazette item advertised — and left its neighbour's
six full-text `toHaveText` assertions pointing at the old copy. **The test went stale; the product is
correct.** Two fires (s1522, s1523) labelled the resulting reds "pre-existing" and each paid for a control
run without asking what they were.

This slice re-points exactly those six expected-string literals and nothing else. `toHaveText` is retained
on all six — F-1523-7's ruling is explicit that full-text strictness is what CAUGHT the divergence, and
loosening to `toContainText`/regex would blind the assertions to the next rewrite. The runner derived each
string from the render sites rather than from the master's table (scope 1) and reported **no disagreements**
with the table.

Direction matters here and was respected: the firewall named `src/encyclopedia/reader.ts` as forbidden
precisely because "fixing" the application to match an old assertion would silently revert shipped,
player-visible FD-3 copy. **`git diff --name-only` is one file; `src/` is untouched.**

## Evidence (measured s1525 on the merged tree, not inherited)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | **green**, built in 1.12s |
| `milk-county-board.spec.ts` · `desktop-chrome` `--workers=1` | **7/7 passed, rc=0** (6.5s) |
| `milk-county-board.spec.ts` · `mobile-chrome` `--workers=1` | **7/7 passed, rc=0** (6.6s) |
| Control: same server, same `src/`, spec reverted to main | **5 passed / 2 failed, rc=1** |
| Adjacent `e2e/field-book.spec.ts` | **3/3 passed, rc=0** |
| Adjacent `e2e/lb-01-county-standings.spec.ts` | **9/9 passed, rc=0** |
| Console/page errors | zero — both plain-boot arms assert this themselves (`:302`, `:326–:328`) and both pass |
| Diff | **1 file, +6/−6**, exactly the six literals; `src/` untouched |

### The derived pass count was checked against a control, not assumed

The master derived **5 → 7 per project** and required that the other five tests not move in either
direction. Verifying the *post* state alone cannot establish that, so this drain ran the control arm: in the
gate worktree, with **the same dev server and the same `src/`**, only `e2e/milk-county-board.spec.ts` was
reverted to main's version. Result **2 failed / 5 passed**, the two failures being exactly the tests
declared at `:281` and `:305`, each dying on its first assertion with:

```
Expected: "The county waits for its first name."
Received: "No standings yet — the door is open."
```

Post-fix the same two flip green and the other five are untouched. **5 → 7, both flips accounted for, no
collateral movement** — the master's predicate satisfied conjunct by conjunct rather than in aggregate.

### The instrument was proved before a single assertion was trusted (F-1524-1's cure, applied)

s1524 nearly shipped a phantom regression because `--strictPort` killed its vite while a foreign process
already owned the port and served a stale build — the HTTP-200 readiness probe, `--strictPort`, and
Playwright's own success were **all satisfied by the stranger**. That cure is now standing practice and was
executed here:

- Port **5361** confirmed genuinely free by an actual `net.createServer()` bind before starting anything.
- vite started in the **gate worktree**, pid confirmed as `npm exec vite --port 5361 --strictPort`.
- **The served tree was interrogated, not assumed:** `GET /src/encyclopedia/reader.ts` (200, 138,791 bytes)
  asserted `the door is open` **PRESENT** · `No posses in the field book yet` **PRESENT** ·
  `waits for its first name` **ABSENT** · `signed the county book` **ABSENT`.

Only then were the runs taken. Server stopped afterwards, pid re-verified as vite before the signal.

### The stale copy exists nowhere else (re-measured, not inherited)

`grep -rn` for all three stale phrases across `e2e/ src/ functions/` returns **exactly the six assertions
this slice re-points** and nothing else. Two other suites drive the same test-ids
(`field-book.spec.ts`, `lb-01-county-standings.spec.ts`); neither asserts the old copy, and both are green
above.

## Merge classification

Base `4bebada01`. Three-way `git merge --no-ff lane/a` in the gate worktree: **ort strategy, zero
conflicts**; merged-tree diff vs main is exactly one file, +6/−6.

| File | Class | Resolution |
|---|---|---|
| `e2e/milk-county-board.spec.ts` | **LANE-TOUCHED** (main never moved it in the window) | taken whole from gate merge commit `64eed189` |

Six regenerated screenshots under `reviews/shots-milk-county-board/` appeared as churn from the gate runs
and were **discarded, not merged** — evidence artifacts are never byte-identity gated (F-1266-1). The runner
discarded its own copies for the same reason.

## Findings

**None blocking.** No new F-ID: this slice does exactly what F-1523-7 ruled, at the size ruled, with the
strictness ruled.

⭐ Worth recording for the next reader: **two fires paid a control run each to re-measure these reds and
filed them as "pre-existing" without asking what they said.** The reds were neither flaky nor
environmental — they were a correct suite reporting a real, deliberate, *already-shipped* copy change. A red
that is re-measured but never read costs more than one that is simply investigated once; this is the
same shape as the `cross-engine`-labelled sim pin that sat red for five fires (F-1460-1).
