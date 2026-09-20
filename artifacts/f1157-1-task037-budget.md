# F-1157-1 — task-037 `:146` is over-budget by design, not flaky

**Fire:** s1157 · **Date:** 2026-07-28 · **Subject:** `e2e/task-037-assay-bench-ungate.spec.ts:146`
`debug play builds the Assay Office and posts an order at the bench` (desktop-chrome; mobile skips it)

## Why this was measured

F-1140-3 left an explicit method attached: *"Whoever takes it should measure on a **quiet** box first:
if the rate goes to 0/N quiet, it is a load artifact and the honest fix is the budget, not the game."*
s1140's 1/4 = 25% was taken on a **loaded** box (load avg 4.31→4.46, a lane-b `codex exec` live throughout).
This fire found all five queues empty and no `codex exec` running — the quiet arm the finding asked for.

**Box at measurement:** load avg **2.08 / 2.07 / 5.21** on 16 CPUs; no `codex exec`; no lane dev server
(port 5188 probed FREE). The long-running wrangler MP servers were left alone, as in s1156.

## Arm A — baseline, 30 s global cap (`playwright.config.ts:11`), 12 quiet runs

| batch | result |
|---|---|
| 1 (6 runs) | **1 timedOut**, 5 passed |
| 2 (6 runs) | **1 timedOut**, 5 passed |
| **combined** | **2 fail / 12 = 16.7%** |

Batch-2 per-run durations (batch 1 was line-reporter only):

| run | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| status | **timedOut** | passed | passed | passed | passed | passed |
| duration | 44.0 s | 28.4 s | 29.6 s | 26.9 s | 29.3 s | 28.9 s |

**Pass durations vs the 30 s cap: min 26.9 · median 28.9 · max 29.6 · mean 28.6 — worst-case margin 0.4 s.**

## The two findings this produces

### 1. F-1140-3's discriminator is REFUTED; its conclusion happens to be right

Quiet did **not** go to 0/N — it gave **2/12**. So the fault is *not* a load artifact, and a later fire
following F-1140-3's stated logic to the letter would have concluded "not load ⇒ therefore the game"
and gone hunting in `src/`. F-1140-3's *conclusion* ("the honest fix is the budget") was correct while
its *test for that conclusion* was wrong. Load raises the rate (25 % loaded vs 16.7 % quiet); it does
not cause it.

### 2. The failure signature is NOT the one F-1140-3 describes

F-1140-3 records a failure **inside `panGold()` at `:92`, having reached only 60 of 85 gold**.
**Both** of this fire's quiet failures show the opposite: page snapshot at the timeout has
**Gold = 5** and the order **already `Posted`**, with the pending-orders list populated —
i.e. `panGold` succeeded, the office was built (cost 80 of the 85), the bench opened and the order
posted. The test had finished its functional job and simply ran out of clock.

### The mechanism, directly measured

- `panGold()` alone budgets **20 s** (`:65`, `Date.now() + 20_000`).
- The remaining work — build-via-UI, two `walkTo`s, prompt assertions, bench open, fill, post, cleanup —
  measurably costs **~8.6 s**.
- **20 + 8.6 = 28.6 s mean against a 30 s cap.**

The test runs at **~95 % of its budget deterministically**. It is not intermittently broken; it is
over-budget by construction, so *any* jitter (load, GC, a slow process spawn) tips it over, and
**which step you die at is just wherever the clock happens to expire.** That explains the whole
history at once: s1140's 25 % loaded, this fire's 16.7 % quiet, and s1141's runner passing at
**29.1 s "right at the edge"** are all the same single fact.

`panGold`'s cost is dominated by Playwright IPC, not game time: it walks the hero physically via
keyboard in a 60 ms `page.evaluate` polling loop at `timescale=4`. That is why it is load-sensitive
without being load-caused.

## Arm B — control, 45 s scoped cap, 12 quiet runs, same box, same day, same n

| run | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| status | pass | pass | pass | pass | pass | pass | pass | pass | pass | pass | pass | pass |
| duration | 26.0 | 27.5 | 28.3 | 26.9 | 29.2 | 29.3 | 26.5 | 28.2 | 29.0 | 23.6 | 28.6 | 26.3 |

**12 / 12 passed** (playwright rc=0). min 23.6 · median 28.2 · max 29.3 · mean **27.5 s**.

**The fix hides no work:** pass durations are statistically unchanged (mean 27.5 vs 28.6, max 29.3 vs
29.6). The change stops runs being killed *just before succeeding*; it does not make anything slower,
and it weakens no assertion — every assertion in the test still has to pass.

⚠️ **Stated honestly:** 0/12 against a 16.7 % null is *p ≈ 0.11* — suggestive, not decisive on its own.
**The load-bearing evidence is the duration distribution, not the 0/12.** Passes cluster at 26–29.6 s
against a 30 s cap; that is a directly measured mechanism, and the control merely corroborates it.
Across all 24 quiet runs, work exceeded 30 s **2 times ≈ 8 %**.

## The corrective applied

`test.setTimeout(45_000)` scoped **inside the `:146` test callback only** (the file's other two tests
are untouched), with the measurement quoted in a comment. 45 s — not 60 s — deliberately: enough
headroom for jitter, still tight enough to catch a genuine 2× regression.

## Gates

| gate | result |
|---|---|
| `npx tsc --noEmit` | **clean** (`tsconfig.json:17` includes `e2e`, so the gate covers the changed file) |
| `npm run build` | **green, 1.37 s** |
| `task-037` spec, **both** projects | 3 passed / 2 skipped / **1 failed** |
| `:146` (the subject), both projects | **green** (desktop passes; mobile skips by design) |

The single red is `:202` mobile-chrome (`intersects(promptBox, #touch-controls) === false` at `:211`)
= **F-1141-3**, a deterministic 0/3 **owner-gated mobile-UX design fork** already on the OWNER'S DESK.
Pre-existing, unrelated, and unreachable by a `test.setTimeout` scoped to a different test callback.
Its line numbers shifted `:196`→`:202` and `:205`→`:211` by exactly the +6 lines added here.

**Adjacent suites:** empty set by construction — **zero `src/` changed**, and the only edit is a
per-test timeout scoped to one test callback, so no other suite's behaviour can be reached.

## What this does NOT close

F-1140-3's *underlying* question — whether `panGold`'s 20 s internal deadline is the right shape for a
test that also has ~8.6 s of tail work — is left open on purpose. Reducing that 20 s would reintroduce
exactly the 60-of-85 failure F-1140-3 documented. The cap was the lever; the helper's design is a
separate, larger call.
