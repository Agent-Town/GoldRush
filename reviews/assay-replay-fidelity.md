---
verdict: PASS-MERGED
slice: assay-replay-fidelity
base: 8f002fdaebc109fd79802fdbd290891a68409392
lane-tip: ebe038295063f13cd04c06162d399203c2d8e7fe
merge: 3a4a5d15d95a40c275776c68802a605e24d7e619
date: 2026-08-15
---

# Assay replay fidelity — passed and merged

## Verdict

**PASS — MERGED.** Tape v2 now carries the ratified run-start `{meta,research}` snapshot, replay applies that snapshot in isolated storage before boot, and client plus CF validation accept the same bounded v1/v2 shapes. Existing v1 tapes remain storable but are reported as `unverifiable-legacy` rather than falsely assayed.

The progressed-profile Territory-I counterexample that forced the s1796 hold now reproduces twice at `fnv1a32:9092c7a6` on both desktop and mobile. Live-play semantics did not change.

## Matrix and root cause

| Cell | Before | After |
| --- | --- | --- |
| Second legacy live reel | `a4025223` → `ae34aa2f` | `unverifiable-legacy` |
| Fresh single life | reproduced | reproduced |
| Death-screen restart | reproduced with a fresh tape/life | reproduced |
| Curated controls | reproduced | reproduced |
| Fresh Territory I | `d6ceecd8` → `168dafd5` | `9092c7a6` twice |

Normal live boot installs `RunManager` and applies saved meta/research progression. The replay-only constructor path returned before that owner existed, so v1 replay started from empty progression. The fix captures the native progression snapshot at tape birth and applies it through the existing storage-backed boot path; it does not special-case Territory I.

## Gate evidence

| Check | Result |
| --- | --- |
| Policy | `drain-block-check --strict` reported the inherited `gate-side` hold; this fire gathered detached evidence, merged, and removed the hold in the immediately following bookkeeping commit |
| Custody | detached worktree at s1815 main; only the seven intended paths landed; 15 generated screenshot churn paths were excluded |
| TypeScript / build | pass / pass |
| Focused Node | 2/2 pass |
| Round-trip desktop + mobile | 2/2 pass; progressed-profile hash `9092c7a6` twice |
| Existing tape desktop | 4/4 pass |
| Adjacent task-025 / m1-01 / m2-01 | 32/32 pass, both projects, `--workers=1` |
| Plain boot desktop + mobile | 2/2 pass, zero captured console/page errors |
| Full Node, repository-pinned Node 26.4.0 | 465 tests: 458 pass, 2 fail, 5 skip; both fail rows are the same inherited `news.html` link to missing `index.html#teaser` |
| Untouched-main control | reproduces the same direct `site-contract` red and its fixture-teardown duplicate |

Full transcript: `artifacts/assay-replay-fidelity-s1815-gate.txt`.

## Finding

### F-1815-1 — runner restart and repository Node baselines disagree

The sanctioned runner helper selected Node 23.11.1, while `.nvmrc` pins 26.4.0 and `scripts/node-guards-timeout.test.mjs` deterministically rejects Node 23 because its per-test timeout behavior differs. The same candidate under Node 23 produced 455 pass / 3 fail / 1 cancelled / 4 skipped; Node 26 removed the timeout/gr-sim failures, leaving only the control-confirmed site-contract red. This is factory evidence for the existing F-1507-1 owner fork, not a replay-slice defect.

## Retention

The prior diagnostic save remains historical evidence at `save/assay-replay-fidelity-s1796-hold`; the merge is `3a4a5d15d95a40c275776c68802a605e24d7e619`. No generated screenshots were admitted.
