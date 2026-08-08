# F-1584-1 — banked-master banner vocabulary

**Slice:** `f1584-1-banked-master-banner-vocabulary`  
**Branch:** `lane/c`  
**Base:** `721493f63` (`main` at implementation start)  
**Tip at report time:** `721493f63` plus the three-file working-tree diff (runner auto-commit pending)  
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

Main advanced to `f5397843f` after the lane reset, but changed none of these three paths: each is LANE-TOUCHED and none is MAIN-MOVED. No conflicts were resolved and no out-of-firewall path was changed.
