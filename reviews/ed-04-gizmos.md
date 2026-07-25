# ED-04 — four editor guards were vacuous; they now reach their assertions

**Slice:** `lane-c-ed-04-gizmo-guards-vacuous` (the F-1026-5 class, acting on **F-1034-3**)
**Branch:** `lane/e2-arsenal` · **Tip:** `f63c4a0b` · **Base:** `81fa1c78` · **Drained by:** s1046 fire (ALT), 2026-07-25

## VERDICT: MERGE — with one finding against the factory, not the slice (F-1046-1, below)

## What it does

Four browser guards in `e2e/ed-04-gizmos.spec.ts` had been timing out **in their setup**, before
reaching a single assertion — the dangerous half of the F-1026-5 class: *a test that dies in its
setup can never fail for the reason it was written*. s1044 measured them 5/5 RED on an idle machine,
disproving the earlier "CPU load" attribution in F-1034-3.

The slice repairs the **waiting**, not the assertions. Every assertion in the four tests is
byte-identical to before (verified by diff — the only changed lines are helper calls, two
`scrollIntoView` calls, one `waitFor`, and the helper body).

**Two distinct repairs:**

1. **`commitAndReload` → `commitAndSettle`** (`:362`). The old helper was
   `Promise.all([page.waitForEvent('load'), action()])` — it assumed clicking undo/redo **reloads the
   page**. It does not, so the `load` event never came and the helper hung for the full 90 s. The new
   helper polls the editor's own state until `bytes` changes — awaiting the condition the product
   actually satisfies. This unblocks `:141`, `:177`, `:192` (the latter two via `dragWorld` `:294`).
2. **`:216` plain-boot wait.** Replaced `waitForFunction(frame > 10)` with a wait on the start-menu
   locator.

## The `:212` contradiction — settled, and it was a REAL defect, not collateral

The task asked whether `:212` differed from its control `m1-01` "in a way you can name at
`file:line`, or retire the hypothesis." ✓ **VERIFIED, named:**

| | boot | why `frame > 10` behaves differently |
|---|---|---|
| `m1-01:4` | `page.goto('/?nowaves&nolevel')` | query params **skip the start menu** → the game loop is running → `:6` `frame > 10` fires |
| `ed-04:214` | `page.goto('/')` — **plain** | parks on the start menu, where the loop has not started → `frame` never exceeds 10 |

So `:212` was never collateral and never a load flake: **on a plain boot the original wait could not
succeed.** Waiting for the start menu is the correct settle point for a plain boot, and the mutation
below proves the swap did not buy the green by weakening the guard.

## Evidence (measured by this fire on the merged tree, idle machine)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean (exit 0, no output) |
| `npm run build` | ✓ built in 1.08s |
| `ed-04` desktop, `--workers=1`, full file, run 1 | **4 passed**, 1 failed (`:17` only) — 34.8s |
| `ed-04` desktop, full file, run 2 | **4 passed**, 1 failed (`:17` only) — 35.3s |
| `ed-04` mobile, full file | **4 passed**, 1 failed (`:17` only) — 28.4s |
| Adjacent `m1-01` + `m2-05` desktop | **11 passed** — 1.3m |
| Adjacent `m1-01` + `m2-05` mobile | **11 passed** — 1.2m |
| Console/page errors | zero — the four tests each assert `consoleErrors`/`pageErrors` `toEqual([])` and passed |
| Screenshot | `reviews/shots-ed-04-gizmos/zone-gesture-desktop.png` (919,855 B) |

**Before (s1044, idle machine): 5/5 RED. After: 4/4 browser guards green, twice on desktop, once on
mobile.** `:17` stays red on both projects — it is the documented **F-cp00-1** (BACKLOG:425), a pure
model test that takes no page, explicitly carved out by scope 6. Identical red on desktop and mobile
is itself consistent with a page-less defect.

## Scope 5 — the mutation proof, twice over (independently)

⚠️ **Correction against myself, recorded rather than quietly fixed.** I first drafted this section
claiming the runner's report *did not exist*, because `logs/runs-archive/…ed-04….log` is **14 lines**.
That claim was **false** and I nearly merged it into the ledger. The real report is
`tasks/runs/20260725-204841-…log` — **2,490,071 bytes**, complete. This is precisely the trap F-1038
wrote up as *"A TRAP FOR THE NEXT READER"*, and it caught the next reader. Root cause now found and
fixed — see F-1046-1.

**The runner did mutation-prove all four guards** (verbatim: *"All four guards were mutation-proved
red and restored byte-exact"*), plus 8/8 isolated across both projects and 24/24 across three
repeated full browser-only runs per project. Its adjacent numbers — `m1-01` 8/8, `m2-05` 14/14 —
**reconcile exactly** with mine (11 passed per project × 2 = 22 = 8 + 14).

I had already produced my own two mutations before finding the report, so the acceptance evidence is
now **independent and agreeing**. A vacuous guard dies on a timeout; a live one yields
expected/received. Mine, restored byte-exact (`git diff` empty vs index after each):

| Mechanism | Mutation | Result |
|---|---|---|
| `:216` start-menu wait (`:212`) | `installed: false` → `installed: true` | **RED with a real diff** at `:224` — `- "installed": true / + "installed": false`. It **reaches** its assertion; it no longer dies at the 30 s timeout. |
| `commitAndSettle` (`:141`) | `:154` `toBe(before.bytes)` → `toBe(moved.bytes)` | **RED with a real byte diff** on the contract JSON. The helper genuinely observes the undo landing; previously the test hung in `commitAndReload` and never reached `:154`. |

**Honest scope note:** I ran **two** mutations, covering both distinct repair mechanisms; the runner
independently ran **four**, one per guard. The task's bar is therefore met by the runner's evidence
and corroborated by mine, from a different operator on a different tree.

## Merge classification

Base `81fa1c78`; `git diff --stat 81fa1c78 main` on both touched paths is **empty** — main never moved
on `e2e/ed-04-gizmos.spec.ts` or `reviews/shots-ed-04-gizmos/`. Both files are **LANE-TOUCHED,
MAIN-UNMOVED** → exact path-scoped graft, no 3-way, nothing of main's overwritten.

**Firewall: respected.** The commit touches exactly two paths — the spec and its screenshot. No
product code, no `src/`, no other spec, no `Balance.ts`. This also answers the task's closing
question: **no product code turned out to be at fault** — the defect was entirely stale test helpers.

## Findings

- **F-1046-1 (factory, REAL, FIXED THIS FIRE) — the Retention Law's tracked mirror was archiving
  fossils.** ✓ VERIFIED at `scripts/dashboard-gen.sh:73-76`: the mirror loop was
  `if not os.path.exists(_d): shutil.copy2(_p,_d)`. Because that script regenerates **every ~60 s**,
  the first copy fires **seconds into a live run**, capturing only Codex's 14-line header — and the
  existence guard then **froze that fossil permanently**. So the *tracked, git-durable* copy the
  Retention Law exists to guarantee was a header, while the only complete report sat in **untracked**
  `tasks/runs/`. Measured: ed-04's archive was **14 lines vs a 2,490,071-byte** live log. Not new and
  not lane-c-specific — **F-1038 hit it at 410 KB vs 644 KB** and wrote it up as *"A TRAP FOR THE NEXT
  READER"*; it then caught **me**, and I nearly filed "the reports are being lost" as a finding.
  **Fixed:** re-copy when the source is newer or a different size, so a run's archive converges on the
  complete log. **Verified after the fix: the archive copy is now 2,490,071 bytes, byte-matching the
  live log.** (No data was ever destroyed — the `+3d` prune that would have made this fatal was already
  removed by s1033/F-1028-3 under the same law. The exposure was that git's history was a stub.)
- **F-1046-2 (RESOLVED — do not inherit it as open).** I had flagged scope 2's (a)/(b)/(c) as only
  half-answered, because I could observe the product settling in place but not whether it ever *did*
  reload. The runner **did** observe it, and its report settles the question as **(a), the helper is
  stale**, by mechanism: *"Runtime observation showed descriptor bytes and history changing, with only
  same-document `history.replaceState` activity."* Same-document `replaceState` emits no `load` event —
  which is exactly why `commitAndReload` could hang forever with the app demonstrably alive. Closed.
- **Bonus detail worth keeping** (from the recovered report, else it would have been lost): the two
  `scrollIntoViewIfNeeded` → `scrollIntoView({block:'end'})` changes are **not cosmetic** — *"the sticky
  contract validator covered the desktop fixture hit point"*, so the gesture was landing on the wrong
  element. A second, independent defect the slice fixed in passing.
- **`:17` / F-cp00-1 unchanged** — still red on both projects, attended-owned, untouched by this
  slice. This slice produced no bonus explanation for it.

## Ledger

- **F-1034-3 is CLOSED by this merge** — its four guards are green *and* proven to reach their
  assertions. Its "CPU load" attribution was already disproved by s1044 and is now superseded.
- `F-cp00-1` stays open (BACKLOG:425), attended-owned.
