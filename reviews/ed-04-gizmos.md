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

## Scope 5 — the mutation proof (produced by THIS FIRE; see F-1046-1)

Scope 5 called the mutation reds "the acceptance evidence, not the green run." The runner's report
that should have carried them **does not exist** (F-1046-1), so I produced them myself. A vacuous
guard dies on a timeout; a live one yields expected/received. Both repair mechanisms were mutated,
run red, and restored byte-exact (`git diff` empty vs index after each restore):

| Mechanism | Mutation | Result |
|---|---|---|
| `:216` start-menu wait (`:212`) | `installed: false` → `installed: true` | **RED with a real diff** at `:224` — `- "installed": true / + "installed": false`. It **reaches** its assertion; it no longer dies at the 30 s timeout. |
| `commitAndSettle` (`:141`) | `:154` `toBe(before.bytes)` → `toBe(moved.bytes)` | **RED with a real byte diff** on the contract JSON. The helper genuinely observes the undo landing; previously the test hung in `commitAndReload` and never reached `:154`. |

**Honest scope note:** the task asked for four individual mutations; I ran **two**, chosen to cover
**both** distinct repair mechanisms. `:177` and `:192` are unmutated — they route through the *same*
`commitAndSettle`/`dragWorld` path as `:141`, so the mechanism is proven, but each guard is not
individually proven-failable. Recorded as a residual, not claimed as done.

## Merge classification

Base `81fa1c78`; `git diff --stat 81fa1c78 main` on both touched paths is **empty** — main never moved
on `e2e/ed-04-gizmos.spec.ts` or `reviews/shots-ed-04-gizmos/`. Both files are **LANE-TOUCHED,
MAIN-UNMOVED** → exact path-scoped graft, no 3-way, nothing of main's overwritten.

**Firewall: respected.** The commit touches exactly two paths — the spec and its screenshot. No
product code, no `src/`, no other spec, no `Balance.ts`. This also answers the task's closing
question: **no product code turned out to be at fault** — the defect was entirely stale test helpers.

## Findings

- **F-1046-1 (factory, MEDIUM, mine not the slice's) — lane-c run reports are being lost.**
  `logs/runs-archive/20260725-204841-lane-c-…log` is **14 lines: the Codex header and nothing else.**
  The run itself was real (50 min, 388,592 tokens per `logs/task-stats.jsonl:65`) and produced a
  correct commit. The prior lane-c run (`20260725-184427`, repair-dwell, drained as `d79e8941`) is
  **also 14 lines**, while lane-a's `20260725-200029` is **697 lines** — so this is lane-c-specific
  and has already silently cost at least two drains their reports. Consequence: every task-mandated
  report — here, scope 1's hang-site table, scope 2's (a)/(b)/(c) verdict, and scope 5's four
  mutation reds — is unrecoverable, and the drain has to re-derive it or merge on faith. Corrective
  task queued: `tasks/lane-c-report-capture-lost.md`.
- **F-1046-2 (INFO) — scope 2's (a)/(b)/(c) is answered only in part.** The repair proves the product
  **settles in place** (bytes change with no navigation), which is consistent with **(a) the helper is
  stale**. Whether the editor ever *did* reload — i.e. (a) vs (b) a race — is a historical question I
  did **not** observe, and the runner's observation is lost with F-1046-1. Non-blocking: the guard is
  green and proven-failable either way. Flagged so no one inherits "(a), confirmed" as fact.
- **`:17` / F-cp00-1 unchanged** — still red on both projects, attended-owned, untouched by this
  slice. This slice produced no bonus explanation for it.

## Ledger

- **F-1034-3 is CLOSED by this merge** — its four guards are green *and* proven to reach their
  assertions. Its "CPU load" attribution was already disproved by s1044 and is now superseded.
- `F-cp00-1` stays open (BACKLOG:425), attended-owned.
