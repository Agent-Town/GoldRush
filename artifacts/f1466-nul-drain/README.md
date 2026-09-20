# f1465-1 drain evidence (s1466)

`drawCallCensus()` output captured on the **merged tree** (`gate-s1466`, detached worktree at
main + `lane/a`), by `e2e/perf-r2-census.rig.ts` under `GR_CAPTURE_RUN=1`, `--workers=1`,
`--timeout=240000`. Both projects passed: **2 passed, 67.8s wall**.

These are the files behind the review's functional-proof claim — the two composite map keys the
slice re-encoded are the census's *grouping* mechanism, so a broken delimiter would collapse or
explode the rows. `report[0].empty.draws.byObject` holds **30 distinct rows** with coherent
label/material/kind triples.

| File | Project | Viewport |
|---|---|---|
| `draws-merged-desktop-chrome.json` | desktop-chrome | 1280×800 |
| `draws-merged-mobile-chrome.json` | mobile-chrome | 390×844 |

Renamed from the rig's default `draws-latest-*` on the way in, so they cannot be confused with the
perf-r2 thread's own staged captures in `artifacts/perf-e1-r2/` (which this drain never wrote to —
the run happened in a detached worktree, §3.0b custody, and main's tracked captures there are
untouched).

Merge: `206d6cffb4726405157b77f592ea7594365ad456` · Review: `reviews/f1465-1-nul-delimiters.md`
