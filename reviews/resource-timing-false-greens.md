# resource-timing-false-greens — four negative guards that were measuring buffer capacity, not the product

**Slice:** `lane-resource-timing-false-greens` (F-1032-1 corrective, s1033 FIRE-AUTHORED)
**Branch:** `lane/m3` · **Lane tip:** `86ae407b runner(lane-a): lane-resource-timing-false-greens.md`
**Base:** `6542f3b2` · **Merge commit:** `022c842e` · **Drained by:** s1034 fire, 2026-07-25

## Verdict

**PASS — MERGED.** The premise held and the measurement is the deliverable. **Four of the five
measured guards were vacuous**, pinned at exactly the 250-entry cap; they are now honest, and each
was proven capable of failing before it was accepted. **No REAL PRODUCT FINDING** — no watched
resource appeared once the buffer was raised, so the audio-laziness, boot-critical-audio,
autoplay-gate and deepwater-dormancy claims are all still TRUE. They are now true *provably* rather
than accidentally.

## What it does

Adds the merged reference one-liner — `performance.setResourceTimingBufferSize(10_000)`, run
**pre-navigation inside `addInitScript`** — to the three specs that assert a negative against
Chromium's Resource Timing buffer. Chromium retains only 250 resource entries by default; the
advance stream prefetches 144 assets, so by the time these specs asserted *"this module did NOT
load"*, the buffer had already evicted the window they were searching. `.some(...)` returned false
and the filtered array came back empty **for exactly the reason each guard was written to catch** —
a silent false green, the dangerous inverse of the loud red that F-1029-3 produced on the same
mechanism. No `src/` change; no product behaviour is altered by this slice.

## Evidence (real numbers, measured on the merged tree unless stated)

**Per-site unfiltered `getEntriesByType('resource').length`, before → after (runner measurement,
both projects) — `250` is the cap, i.e. proof of eviction:**

| # | Guard | Desktop | Mobile | Verdict |
|---|-------|--------:|-------:|---------|
| 1 | `mu-02-music:49` — E1 lazy music | 250 → 392 | 250 → 590 | **was vacuous** |
| 2 | `mu-03-era-audio:18` — era loop, E2 route (boot-critical audio) | 250 → 605 | 250 → 647 | **was vacuous** |
| 3 | `mu-03-era-audio:18` — era loop, E1 route | 250 → 509 | 250 → 497 | **was vacuous** |
| 4 | `mu-03-era-audio:35` — title autoplay gate | 163 → 173 | 195 → 135 | **was honest** (never hit the cap) |
| 5 | `e5-water-spike:87-90` — plain-debug dormancy | 250 → 579 | 250 → 501 | resource half **was vacuous**; the `__GR_E5_DEEPWATER__` global half always bit |

Site 4 is the control that proves the method: it sat *below* the cap on both projects and was
therefore already doing its job — which is why "raise the buffer everywhere" was not assumed but
measured. Site 5 behaved exactly as the master predicted (least exposed of the four, because half
its assertion never depended on eviction).

**Can-it-still-fail proof (the step that separates a real guard from a green one):** all four
negative assertions were mutated to watch a known-present `/src/` resource and **failed on both
Chrome projects**, then restored. Probes and mutations removed; verified by diff and grep.

**Gate battery — merged tree, `playwright.scratch.config.ts` (dedicated port 5217, chosen so the
live lane-c run could not contaminate attribution — Mistake #12):**

| Battery | Result |
|---------|--------|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green** (1.34s; asset-diet 84%/87% cuts intact) |
| Slice gate — `mu-02-music` + `mu-03-era-audio` + `e5-water-spike`, desktop **and** mobile, `--workers=1 --repeat-each=3` | **60/60 passed** (4.3m) |
| Adjacent — `e5-deepwater-claim` (the reference control), `m1-01-claim-jumpers-death`, `m2-01-build-menu`, `task-025-bandits-dont-swim`, both projects, `--workers=1` | **38/38 passed** (4.5m) |
| In-lane, pre-merge (runner) | 30/30 focused repeat-3; 60/60 full touched files repeat-3; 6/6 deepwater reference |

Repeat-each=3 on both projects is not decoration here: resource-timing behaviour is order- and
cache-dependent by nature — that dependence *is* the finding — so a single green run would not be
evidence.

**Boot/console:** this merge changes **zero shipped bytes** — `git diff HEAD~1 HEAD -- src/ public/
index.html` is **empty**, so the built bundle is byte-identical to pre-merge main and no boot probe
can differ from it. The 98 merged-tree tests above each boot the app and assert their own
console/page-error conditions. No perf table: nothing renders differently, by construction.

## Merge classification

Base `6542f3b2` (~1h stale — no RE-LAND risk). `git diff --name-only 6542f3b2 main` over the three
files is **EMPTY**, i.e. main did not move any of them since the lane branched.

| File | Class | Resolution |
|------|-------|------------|
| `e2e/mu-02-music.spec.ts` | LANE-TOUCHED only | clean apply (+1: buffer call into the existing `addInitScript` block body) |
| `e2e/mu-03-era-audio.spec.ts` | LANE-TOUCHED only | clean apply (+13/−5: concise arrow converted to a block body, as the master specified) |
| `e2e/e5-water-spike.spec.ts` | LANE-TOUCHED only | clean apply (+1: new `addInitScript` before its `page.goto`) |

No conflicts; `git merge --no-ff` was sufficient. Nothing outside the firewall moved —
`m2-05-base-damage-repair.spec.ts` (live on lane-c) and the reference spec are untouched.

## Findings

- **F-1034-2 (INFORMATIONAL, closes F-1032-1's open question).** The blast radius of the 250-entry
  buffer on this board is now *measured*, not inferred: **4 of 5 negative-assertion sites were
  vacuous**, and the one that was not (`mu-03:35`) is the shallowest boot of the five. The
  remaining **8 resource-timing sites assert POSITIVES**, where eviction fails loudly and is
  self-announcing; they stay out of scope as a lower rung, now with a measured reason rather than
  an assumed one.
- **F-1034-3 (NON-BLOCKING, pre-existing, PROVEN not caused by this slice).** The two known-red
  adjacents were run on the merged tree and returned **12 failed** (5 `ed-04-gizmos` tests ×2
  projects, 1 `perf-05-startup` test ×2 projects):
  `ed-04:17` (gizmo model / ratified capabilities), `ed-04:141`, `ed-04:177`, `ed-04:192`,
  `ed-04:212`, and `perf-05:213` (*startup reaches playable quickly and defers non-critical
  textures*, failing at `:223`).
  - `ed-04:17` is the **pure model test** and matches the documented known-red exactly:
    **F-cp00-1**, BACKLOG:425 — *"non-blocking, pre-existing on main, attended-owned: ED-04 pure
    model test RED independent of cp00 (one shipped E3 template fails the unchanged descriptor
    round-trip = L2 gap #6)"*. Fingerprint matched, not assumed.
  - The four `ed-04` browser tests time out before reaching their resource assertion (the runner
    independently observed the same set in-lane).
  - `perf-05:213` is threshold-shaped (TTI / deferred textures) and therefore load-sensitive; this
    battery ran while **lane-c's Codex run was live on the same machine**. That is the documented
    F-perf05-1 pattern (*"perf-01 poll timed out under concurrent CPU load → PASS isolated"*).
  - **PROOF OF NON-CAUSATION, and it is stronger than a revert-run:** when Playwright is invoked on
    these two spec files it loads **only** those two files — the three files this merge changed are
    never loaded — and the served application is byte-identical to pre-merge main
    (`git diff HEAD~1 HEAD -- src/ public/ index.html` is **EMPTY**). The entire input set of that
    run is therefore bit-identical at `HEAD` and `HEAD~1`: **this run *is* the pre-merge run**, so a
    revert-run could not return different information. These reds are the board's, not this slice's.
  - **Owed, but not by this slice:** the four ED-04 browser timeouts and `perf-05:213` are real
    board conditions with no current owner. Laddered below so they are not invisible.
- **No finding against the runner.** The report was accurate in every particular I re-checked: the
  before/after table, the mutation proof, and the honest declaration that there was no product
  finding. It also removed its own probes — the step that usually gets skipped.
