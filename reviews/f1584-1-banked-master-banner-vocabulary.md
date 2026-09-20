# F-1584-1 — banked-master banner vocabulary

**Slice:** `f1584-1-banked-master-banner-vocabulary`  
**Branch:** `lane/c`  
**Base:** `1a41ab975` (`main` at implementation start)  
**Tip at report time:** `1a41ab975` plus the three-file working-tree diff (runner auto-commit pending)  
**Verdict:** READY-FOR-GATES — the classifier now recognises the three refusal spellings already present in the corpus without matching queue-positive prose.

## What changed

`classifyRoot` now uses one named `NOT_QUEUEABLE` pattern for the existing `DO NOT QUEUE` / `DO-NOT-QUEUE` spellings plus `NEVER QUEUE`, `NOT QUEUEABLE`, `NOT-QUEUEABLE`, `NOT FIRE-QUEUEABLE`, and `NOT-FIRE-QUEUEABLE`. The six-line declaration window is unchanged. The site comment records that the banner gates only `CANDIDATES` among `NO-TRACE` masters: widening can only shrink the candidate list, so the risk is hiding real work rather than surfacing fake work.

This cures a fail-safe reporting defect, not an averted incident: the old headline over-reported three candidates that a reader could reject by opening the files.

## Live-corpus evidence

The live corpus is the main worktree at `/Users/robin/Claude/Projects/Gold Rush`; the lane-local worktree has only a subset of ignored runtime traces and is not the live trace corpus.

Before, rc=0:

```text
TOTAL 980 · SHIPPED 566 · RAN-UNMERGED 351 · NO-TRACE 63, of which 60 self-declare DO NOT QUEUE → 3 candidates · DISAGREES 96
```

After, rc=0:

```text
TOTAL 980 · SHIPPED 566 · RAN-UNMERGED 351 · NO-TRACE 63, of which 63 self-declare DO NOT QUEUE → 0 candidates · DISAGREES 96
```

`DISAGREES` is unchanged at 96; the verdict axis was not touched.

## Independently measured blast radius

The first six lines of all 980 current masters were tested against both patterns before editing.

| Measure | Count |
|---|---:|
| Old pattern matches | 95 |
| New pattern matches | 98 |
| Newly captured | 3 |

Every newly captured master:

- `058b-adjacent-reds-fingerprint.md`
- `archive-CODEX-WALL-dead-flag-s915.md`
- `art-era-motion-hero-e2.md`

There was zero collateral. Collateral among `SHIPPED` or `RAN-UNMERGED` masters would have been harmless to the headline anyway because `banner` gates only the `NO-TRACE`-scoped `CANDIDATES` count.

## Tests and manufactured red

The slice suite has 12 tests: the original 7 plus distinct real-wording arms for `NEVER QUEUE`, `NOT QUEUEABLE`, and `NOT FIRE-QUEUEABLE`; a labelled regression arm for `DO NOT QUEUE` and `DO-NOT-QUEUE`; and a non-refusal control using the exact wording **“Queue this after the drain”**. Existing arms continue to prove that a bannerless master is a candidate and a refusal below line six is ignored.

With the new tests present, restoring the old two-alternative pattern produced rc=1 and:

```text
ℹ tests 12
ℹ pass 9
ℹ fail 3

actual: ''
expected: 'NEVER QUEUE'

actual: ''
expected: 'NOT QUEUEABLE'

actual: ''
expected: 'NOT FIRE-QUEUEABLE'
```

The intended cure was restored and verified byte-identical by SHA-256 before/after the mutation: `3714b829a0500021d9dea1cb7a5268a7f67448f1147844c667076dd10a323ee7`. The restored suite passed 12/12.

## Gate evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | rc=0; Vite 1.19s; asset diet green |
| `node --test scripts/master-shipped-classifier.test.mjs` | 12 tests, 12 pass, 0 fail, 0 skipped |
| `npm run test:ledger-guards` | 138 core tests, 138 pass, 0 fail, then all chained leaves green |
| `npm run test:node-guards` on repo-pinned Node 26.4.0, run alone | 410 tests, 410 pass, 0 fail, 0 skipped; 191061ms |

The ledger battery's chained leaves were `test:findings-state`, `test:blocker-panel`, `test:ruling-propagation`, `test:citations`, `test:desk-declaration`, `test:desk-birth`, `status-archive-audit`, `attended-owed-audit`, `main-lock-gate-guard`, `janitor-request-rejection`, `lane-dispatch-safety-guard`, and `nul-audit`. `law-pointer-guard` did not redden, so no pointer was re-based.

An initial node-guards invocation inherited Node 23.11.1 and failed 3/410; its own timeout diagnostic required the `.nvmrc` runtime because Node 23 applies the harness timeout at file granularity. No code was changed for that environmental failure. Re-running alone on the installed, repo-pinned Node 26.4.0 cleared all three failures.

No Playwright was run or claimed: this slice touches no `src/**`, `e2e/**`, simulation, system, or entity path.

## Merge classification

Lane-touched paths are limited to:

- `scripts/master-shipped-classifier.mjs`
- `scripts/master-shipped-classifier.test.mjs`
- `reviews/f1584-1-banked-master-banner-vocabulary.md`

Main advanced to `f5397843f (archive: pruned by the A3 rewrite)` after the lane reset, but changed none of these three paths: each is LANE-TOUCHED and none is MAIN-MOVED. No conflicts were resolved and no out-of-firewall path was changed.

---

> ## ✅ DRAINED s1585 — MERGED `5795cd836d6ceb0fcce998c3c3a87079c03dc72d`
>
> **Custody (§3.0b):** gated in a detached worktree `gate-s1585`, never in main's working tree. The three
> lane blobs were installed by `git show lane/c:<path>` and **verified by `hash-object` against
> `git rev-parse lane/c:<path>` before any gate ran** — `c54f36c3` / `4f91a67a` / `e5f26b1b`, three OKs.
> Since `lane-freeze-classify` reports all three paths **LANE-ONLY with `main == base` blobs**, main-at-HEAD
> plus those three paths *is* the merged tree exactly.
>
> **Battery on the merged tree:** `npx tsc --noEmit` **rc=0** · `npm run build` **green, Vite 1.30s**,
> asset-diet green · slice suite `master-shipped-classifier.test.mjs` **12 tests / 12 pass / 0 fail** ·
> `test:node-guards` **410 tests / 407 pass / 0 fail / 3 skipped, 318.8s, run ALONE** (F-1537-1's
> "run it alone" rule observed; `law-pointer-guard` is inside this battery and **did not redden**, so nothing
> was re-based). **No Playwright owed or claimed** — zero `src/**`, `e2e/**`, `src/sim/`, `src/systems/`,
> `src/entities/` paths, so neither the slice-spec rule nor F-1460-1 binds.
>
> **Acceptance re-derived by the drain rather than inherited (the master asked for exactly this):** the cured
> script was run against the **live corpus** via `--root .` — the gate worktree has no corpus, because
> `tasks/done/` is untracked and therefore empty in any fresh worktree, which would have made this
> measurement vacuous. Before `→ 3 candidates`, after `→ 0 candidates`; bannered **60 → 63**; `TOTAL 980`,
> `SHIPPED 566`, `RAN-UNMERGED 351`, `NO-TRACE 63`, `DISAGREES 96` **all unchanged**. **Newly matched:
> exactly 3** — the master's predicted count, independently confirmed.
>
> ⓘ **ONE CLARIFICATION THE DRAIN ADDS, because a careless reader will otherwise measure 13 and conclude the
> blast radius was understated.** Diffing the *banner string* across all 980 masters shows **13 changes**, not
> 3: the extra ten are `storybook-e2..e10` + `storybook-appendices`, whose banner text moves from
> `'do not queue'` to `'NEVER QUEUE'`. **They were already bannered** — the old pattern matched them
> case-insensitively — and the widened alternation merely captures a different phrase from the same
> first-six-line window. **Truthiness is unchanged for all ten, `CANDIDATES` is unchanged for all ten, and
> `0 of 980` verdicts moved.** The runner's "newly captured 3" counts *matches*, which is the correct figure
> for the number the banner actually gates; the 13 is a display-text delta with no consumer. *This drain
> raised it as a suspected under-report and disproved it by measurement — recorded so the next reader does
> not re-open it.*
>
> **Merge classification re-verified at drain time** (a review's classification is perishable):
> `lane-freeze-classify lane/c` → `paths=3 · DUPLICATE 0 · LANE-ONLY 3 · MAIN-ONLY 0 · BOTH-MOVED 0`. Main
> advanced past the review's `f5397843f (archive: pruned by the A3 rewrite)` to `1963f8dc7 (archive: pruned by the A3 rewrite)` during this fire and still moved none of the three.
> **No conflicts.**
>
> **One environmental difference from the runner's report, stated rather than smoothed over:** the runner
> recorded `410 pass / 0 skipped`; this drain measured `407 pass / 3 skipped` on the same battery. **Zero
> failures on both sides**, so the merge is unaffected; the delta is which arms self-skip in the fire shell
> versus the lane shell (F-1269-1 — they are not the same instrument). Not a finding, not a red.
>
> **GZ-01:** no news item written, deliberately. This slice changes a **factory probe**, not the game — no
> player-visible surface, so the filter law excludes it. This is the same judgement F-1585-1 documents for
> seven other merges in this window.
>
> **F-1584-1 CLOSED**; goal leaf `f1584-1-banked-master-banner-vocabulary` is `status:"merged"`.
