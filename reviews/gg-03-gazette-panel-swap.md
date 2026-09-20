# gg-03-gazette-panel-swap — REJECTED (corrective queued)

**Slice:** GG-03, the engravings meet the newsprint
**Branch/tip:** `lane/perf` @ `06eeac68` (runner: `lane-d`, done-move `20260729-101734-lane-gg-03-gazette-panel-swap.md`)
**Base:** `43ec76d9` · **Salvage ref:** `archive/lane-perf-gg03-06eeac68` (pinned this fire — a lane pre-flight `reset --hard` would otherwise destroy it, Mistake #2)
**Reviewed:** s1208, 2026-07-29
**§3.0 `drain-block-check`:** ✅ CLEAR (`gg-03-gazette-panel-swap`, status `queued`) — ran FIRST, before classification.

## VERDICT: ⛔ BLOCKED — do not merge. The slice is well-built and it breaks a sibling suite at the canonical worker count.

> ⚠️ **SUPERSEDED s1455 (F-1455-1) — THE BLOCK WAS RIGHT AND IT HAS BEEN DISCHARGED; THE PANEL SWAP IS LIVE ON MAIN.**
> The corrective this review's own title promised (*"REJECTED (corrective queued)"*) landed as the **GG-03b →
> GG-03c** ladder: `5604776b` *"drain: GG-03c herald art dev-path weight — 9,443,241 B -> 962,188 B on a plain
> boot"*, whose **code commit is `15e00755`**. ⚠️ Read that commit by `--stat`, never by its subject line: it is
> headlined *"fix: goals.json schema — two violations turned test:node-guards red on main (F-1211-2)"* and in fact
> carries the six `assets/processed/gazette-panel-*.webp` plates, the herald engravings and the dev-path report —
> a commit headline names intent, `--stat` names content.
> **Verified in main, not inferred from the leaf:** `src/news/heraldReader.ts:177` carries exactly the swap
> described below — `<img class="claim-herald__art-slot" … data-testid="gazette-panel-engraving">` with the
> `<div …>Engraving reserved</div>` placeholder retained as the fallback. The blocking defect (the sibling suite
> reddening at the canonical worker count) was answered by routing the plates through `assets/processed/*.webp`
> instead of an eager raw glob, which is also what took the plain boot from 9.44 MB to 0.96 MB.
> ➡️ **Read `artifacts/gg-03c-herald-dev-path/report.md` for the shipped evidence.**
> ⓘ **Leaf caveat, recorded rather than silently fixed:** the leaf `gg-03-gazette-panel-swap` carries
> `taskFile: lane-gg-03c-herald-art-dev-path-weight.md` — i.e. the leaf id names the blocked slice while its
> taskFile names the successor that discharged it. That is why a `taskFile`-keyed lookup alone would not find this
> row. The BLOCKED text below is KEPT deliberately (retention law): it is the record of *why* the first attempt
> was correctly refused, and the refusal is the reason the cheaper `.webp` path exists at all.

## What it does

Wires the six GG-02 engravings into the `data-panel` slots GG-01 reserved. `renderFirstIssuePanel` swaps the
`<div class="claim-herald__art-slot">Engraving reserved</div>` placeholder for an `<img>` sourced from a new
eager `import.meta.glob` over `assets/raw/gazette-panel-*.png`, keyed by panel id, with the placeholder retained
as a fallback when a plate is missing. CSS pins the plates to the plates' own `1672/941` aspect ratio.
`scripts/asset-diet.mjs` gains a 4 MB `dist/` byte ceiling for the panel class, and the spec is hardened to assert
each panel's engraving is visible, `src`-matched to its panel id, and decoded (`naturalWidth > 0`).

The work is honest and the code is good. It is blocked on a measured consequence, not on its craft.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` | ✅ green, 1.86 s |
| `asset-diet` panel ceiling | ✅ `3,350,448 B` measured vs `4,000,000 B` ceiling (84% of budget — a real guard, not decoration) |
| Own spec `gazette-first-issue` | ✅ **4/4** desktop + mobile (48.1 s), including the new engraving assertions |
| Adjacent `gz-02-news-page` | ✅ 6/6 |
| Adjacent `gz-h1-newsie:114` | ⚠️ red — **known**, fingerprint-matched to `logs/suite-red-inventory.md:148/149` + `:408` (42.1% both projects). `Pip Quick` vs `Chen Mei`, F-1185-1. **Not caused by this slice.** |
| Adjacent `gazette-art-wiring:103` | ❌ **RED, AND CAUSED BY THIS SLICE** — see below |

## F-1208-1 (BLOCKING) — the slice turns `gazette-art-wiring:103` red at the canonical worker count

`e2e/gazette-art-wiring.spec.ts` is **absent from `logs/suite-red-inventory.md`** (grep returns only the
`gz-h1-newsie` rows), so this is not a known red. I measured both arms rather than reasoning about the diff.

**Interleaved control/treatment, canonical 2-worker config, both projects, same scratch server:**

| Run | Arm | Result |
|---|---|---|
| 1 | treatment (as-merged, under 6-worker load) | ❌ 4 failed |
| 2 | control (`heraldReader.{ts,css}` reverted to main) | ✅ 4 passed |
| 3 | treatment, 1 worker, desktop only | ✅ 2 passed |
| 4 | control | ✅ 4 passed |
| 5 | treatment | ❌ 2 failed (`:103` **both** projects) |

**Control 0/8 failures. Treatment 6/8. `:103` is red in 4/4 of its treatment cells and 0/4 of its control cells.**
The arms were interleaved because order is a confound, and the first treatment run was discarded as evidence
on its own because it ran at 6 workers against a 2-worker control — the matched pairs (2 and 5 vs 4) are what
the verdict rests on. Failure mode is a 30 s timeout inside `approachNewsie` (`gazette-art-wiring.spec.ts:74`),
not an assertion.

**Mechanism, measured not argued.** The dev server serves the panel plates **raw**:

```
200  3.64 MB  /assets/raw/gazette-panel-claim-goal.png
200  2.14 MB  /assets/raw/herald-engraving-board.png
```

Six panels ≈ **21.8 MB**, fetched every time the Claim Herald renders its pinned first issue — which is exactly
what `:103`'s plain boot does. At one worker that fits inside the 30 s timeout; at two concurrent browsers it is
~44 MB through a single vite dev server and it does not. **That is why the red is load-dependent, and why a
1-worker rerun "clears" it misleadingly** (a documented flake may be a load ceiling, not a line).

## F-1208-2 (HIGH) — the new byte guard cannot see the path that broke

`scripts/asset-diet.mjs` measures `filesUnder(distDir)`, where `asset-diet` has already cut the six panels to
**3.35 MB total**. The dev/e2e path loads the **21.8 MB raws** — **6.5×** the budgeted weight. So the guard the
slice added is green on the production path *while the path it actually regressed is unmeasured*. The ceiling is
correct and worth keeping; its **denominator is narrower than the defect**. A guard that passes on the arm that
works is not a guard for the arm that fails.

This also means the shipped game is very likely fine — it is the dev-served flow, which every e2e run and every
`npm run dev` playtest uses, that carries the weight.

## F-1208-3 (INFO, report-don't-act) — an inert duplicate of this slice was authored while it sat undrained

At 11:11 an attended session authored `tasks/lane-gazette-art-swap.md` (GG-03, "wire each panel's engraving …
+ the masthead vignette", seven images) and queued it to **lane-a**, ~54 min after this slice had already finished
the six-panel half at 10:17. The lane-a run **STOPPED lawfully at its own pre-flight** — `lane/m3 @ e834860a`
lacks the `97c6a257` + `8dff01fb` ancestors — so it changed nothing and there is no collision to untangle
(`tasks/runs/20260729-111057-lane-a-lane-gazette-art-swap.md.log`). Recorded because the two masters overlap and
the next fire should not treat them as independent work. The attended master's **masthead vignette** is genuine
new scope this slice does not cover.

## Merge classification (performed, then reverted)

Base `43ec76d9` is an ancestor of main. `git diff --stat 43ec76d9 main` over all four code files is **empty** —
main never moved them — so no 3-way graft was needed and the merge was a clean path-scoped checkout. The
two-dot `main..lane/perf` diff *looks* alarming (7,214-line `goals.json` churn, deletions of every s1207 file)
but that is pure stale-base artifact, not lane content: the true lane delta is **9 files, +29/−3**. Verified by
diffing against the merge-base, not against main.

Working tree restored to main. Screenshots preserved at `logs/session-scratch/s1208-unmerged-gg03/` and on
`archive/lane-perf-gg03-06eeac68`. The `artifacts/gazette-art-wiring/*.png` regenerated by my control runs were
reverted, not committed (F-1204-2 churn).

## Corrective

`tasks/queue/lane-d/lane-gg-03b-gazette-panel-weight.md` — re-lands this slice with the plate weight fixed at the
source and the guard's denominator widened to cover the dev path. Scope 1 is a **measure-first STOP gate**: it
re-runs the control/treatment pair before changing anything, and cancels the work if the tree no longer
reproduces. Goal leaf repointed, not duplicated.
