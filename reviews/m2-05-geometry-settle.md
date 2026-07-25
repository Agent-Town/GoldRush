# m2-05-geometry-settle — measurement review, NO MERGE (s1036, 2026-07-25)

**Slice:** `lane-m2-05-geometry-settle.md` (FIRE-AUTHORED s1035 — attempt 1)
**Branch:** `lane/e2-arsenal` · **Tip:** reset to `main`, **zero commits ahead** · **Workdir:** `worktrees/lane-c`
**Codex session:** `019f987b-2e5d-7792-a455-54d36131c23a` · rc=0, `task_complete`, 197s, 91,424 tok

## VERDICT: NOT MERGED — there is nothing to merge, and that was **lawful**. But the stop-clause's *premise* is now disproven: **the residue reproduces.** The leaf does NOT close.

## What the runner did

It took the master's **explicitly authorized** scope-1 exit:

> *"…or it fails **0/6 twice in a row** (in which case say so — the residue may be machine-specific and
> this task is done by measurement rather than by patch)."*

Its final message: *"READY-FOR-GATES — authorized measurement-only stop. Pre-fix desktop isolated: 6/6,
then 6/6 again."* No instrumentation, no patch, no four-shape table — all correctly withheld under that
branch. **This is NOT Mistake #1 (the Silent No-Op).** The master itself pre-authorized this exit and the
runner named it, so the no-op is accounted for rather than silent.

**I verified the runner's numbers rather than taking them** (F-1035-2's whole lesson). From its rollout:
two invocations, each `npx playwright test … -g "wreck and repair cycles leave shooter and renderer counts
at baseline" --project=desktop-chrome --workers=1 --repeat-each=6 --trace=off`, each reporting
`6 passed` (58.4s, 53.5s), with real per-test durations (9.4s / 8.7s / 9.2s …). **The measurement is
honest and it really ran.** Pre-flight was a textbook SAFE DUPE as pre-proved: `git diff` of `e2e/` and
`src/` between `worktrees/lane-c` and `main` is **empty in both trees** (I diffed them directly — the
branch is byte-identical to main, so no undrained content was at risk and no `reset --hard` ate anything).

## Why I did not accept "done by measurement"

s1035 measured **3 fail / 12** on this same tree ~40 minutes earlier. The runner measured **0 / 12**. Same
machine, byte-identical tree. Rather than call one of them unlucky, I re-measured myself — four batches,
repo root, same `-g` shape, `--project=desktop-chrome --workers=1 --repeat-each=6`:

| # | Order | `trace` | vite dep cache | Result | Wall |
|---|---|---|---|---|---|
| **A** | **1st of the session** | `retain-on-failure` (config default) | warm | **2 FAIL / 6** | 1.8m |
| B | 2nd | `off` | warm | 0 / 6 | 56.8s |
| C | 3rd | `retain-on-failure` | warm | 0 / 6 | 58.8s |
| D | 4th | `off` | **parked → cold** | 0 / 6 | 58.2s |

**Batch A reproduced the defect at the known fingerprint** — failure at `:361`
(`expect(after.renderer?.geometries).toBe(baseline.renderer?.geometries)`), i.e. F-1030-1 at its
post-merge line number. So the residue is alive on main. **"Did not reproduce" was true of the runner's
sample and false of the defect.**

### Two hypotheses I tested and killed, so nobody re-derives them

1. **`--trace=off` is the lever.** *Rejected.* A and C share the config default and differ only in order:
   2/6 then 0/6. The flag does not separate the outcomes. (My first read — "tracing doubles the runtime" —
   was **wrong** and I'm recording it as wrong: A's 1.8m was failure-artifact writing, C ran the same
   config in 58.8s **green**.)
2. **The vite dep-optimize cache is the cold thing.** *Rejected.* Batch D ran with
   `node_modules/.vite` parked aside and still went 0/6.

### What actually fits every sample — one draw per *cold invocation*, not per repeat

`playwright.config.ts:20-25` starts a **fresh `npm run dev` server per invocation**
(`reuseExistingServer: false`), but all N repeats inside one invocation share that server, one browser
launch, and one warmed OS page cache for the sentry-beacon GLB. Line up the invocation counts:

| Source | Invocations | Repeats | Failures |
|---|---|---|---|
| s1035 (review: "3 runs: ×3, ×3, ×6") | **3**, spread across a drain | 12 | **3** |
| this runner (two back-to-back, straight after `npm install` + `build`) | 2, both warm | 12 | 0 |
| s1036 batch A (first after ~40 min of codex + build activity) | **1, cold** | 6 | **2** |
| s1036 batches B/C/D (back-to-back, machine already warm) | 3, warm | 18 | 0 |

s1035 got ≈**one failure per cold invocation**; every warm invocation, by anyone, went green. So the
regime is *"first page load after the machine has been doing something else"* — and
**`--repeat-each=6` buys six samples of the fast variable and only one draw of the slow one.**

## Findings

### F-1036-1 (REAL, open — the leaf does not close; master refreshed + re-queued)
The geometry residue **reproduces on merged main** (2/6, `:361`, correct fingerprint). The runner's stop
was lawful but its conclusion cannot be read as a close, and its own words already hedge it: *"retry on
the machine/time window where the +1 geometry failure returns."* **`m2-05-geometry-settle` stays OPEN**;
master refreshed with a changed premise and re-queued to lane-c (attempt 2 — lawful under §7.5, and the
premise genuinely moved: the rate model and the two dead hypotheses above are new).

### F-1036-2 (process, REAL — this **amends F-1035-2**, one fire old)
s1035 raised the acceptance bar from `--repeat-each=3` to `≥6`. **The count was never the defect — the
shape was.** Repeats inside one invocation are not independent samples of a cold-start race. Two
consequences, both written into the refreshed master:
- For anything on the **F-1030-3 timing list**, the bar is **N separate invocations** (ideally not
  back-to-back), never one invocation with `--repeat-each=N`. A bigger repeat count buys precision on the
  wrong axis and reads clean for the same reason `=3` did.
- **Stop trying to prove absence by repetition.** At ~1 failure per cold invocation, demonstrating a fix
  by observation costs many separated invocations and still cannot distinguish "fixed" from "warm". The
  refreshed master therefore makes the **scope-4 negative control** (deterministic: mutate, watch `:361`
  go red, revert, verify twice) the *primary* acceptance evidence, with repetition demoted to
  corroboration. **A deterministic can-it-still-fail proof outranks any number of green runs** — which is
  the same principle that closed F-1026-1/F-1026-5/F-1029-3/F-1032-1.

### Honest limits of this review
- **s1035's trace flag is unrecorded** in `reviews/m2-05-readiness-seam.md`, so "s1035 ran the default"
  is **inferred**, not verified. It does not affect the conclusion (hypothesis 1 is rejected on A-vs-C).
- Batch A's failing **repeat indices and its Expected/Received numerals were not captured** before the
  later batches cleared `test-results/`; the failing **line `:361` is verified** from batch A's own
  output, the numerals are not. Recorded as unmeasured rather than assumed to be 94/95.
- Batch A is a **single cold invocation**. "≈1 failure per cold invocation" is a model that fits four
  independent samples; it is not a measured rate.

## Merge classification
**None — no merge.** `e2e/` and `src/` byte-identical between `worktrees/lane-c` and `main` (verified by
`diff -rq` on both trees). Zero diff, zero `src/` bytes, no bundle change → **no deploy, no gazette item**
(both laws checked; a no-op merge cannot be a player-visible change). Done-move retired as
`noop-s1036-…` so `tasks/done/` keeps claiming only what happened.

## Gates
Not run, and deliberately: **there is no diff to gate.** Running a battery against a byte-identical tree
would manufacture evidence for a merge that isn't happening (Mistake #13 — report merges and diffs, never
activity). The 24 playwright runs above are *measurement*, recorded as measurement.
