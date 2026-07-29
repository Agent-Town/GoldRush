# ap-08b — THE VIEW + the Almanac, collection-firewalled

**Slice:** `ap-08b-view-collection-firewall` (re-land of the s1213 F-1213-1 rejection)
**Branch:** `lane/e2-arsenal` · **Tip:** `90c54abc` · **Base (merge-base w/ main):** `1cd2a9f6`
**Drained:** s1215 fire, 2026-07-29 · **Merge:** see commit below

## VERDICT: MERGED — gates green, one adjacent red exonerated by a matched control.

## What it does

Re-lands AP-08 (THE VIEW) after s1213 rejected it for turning the whole e2e suite
uncollectable. `View.ts` composes the agent-facing state summary — now reading node
anchors **from diagnostics** instead of importing `../world/Terrain`, which was the
Vite-only import chain (`...layer-contract.v1.json?raw`) that killed node-side
collection for every spec importing `ToolSurface`. That is cure option 1 of the three
the master offered, and it is the smallest.

`ToolSurface.ts` adopts the s1213 WRAP ruling verbatim: the `et.goldrush.view` receipt
carries **both** readings — `result` (AP-06's `standingOrders.snapshot()`, unchanged)
and `state` (`buildView(game)`) — plus `economyLog: []`. `install()` additionally
exposes a lazy `view` getter on `window.__GR_AGENT__`.

## Merge classification

Real delta is 3 files off the merge-base; `main` has moved **none** of them since
(`git diff --numstat 1cd2a9f6 main -- <the three>` is empty), so this is a pure
**LANE-TOUCHED** merge — no 3-way graft, no conflict resolution.

| File | Delta | Class |
|---|---|---|
| `src/agent/View.ts` | +592 (new) | LANE-TOUCHED (pure add) |
| `e2e/agent-view.spec.ts` | +351 (new) | LANE-TOUCHED (pure add) |
| `src/agent/ToolSurface.ts` | +14 / −1 | LANE-TOUCHED (main untouched since base) |

## Evidence

| Gate | Result |
|---|---|
| `test:node-guards` (**run first**) | **74/74 pass**, incl. `whole suite collects without loading Vite-only modules` |
| `npx playwright test --list` | **2460 tests in 344 files** — exactly the corrected bar (`f0c912fc`) |
| `npx tsc --noEmit` | clean, no output |
| `npx vite build` | green, **1.43 s** |
| `e2e/agent-view.spec.ts` (own spec) | PASS, desktop + mobile |
| `m4-01` / `m4-05` / `m4-10` (adjacent) | PASS — **36 passed** in each of two `--workers=4 --repeat-each=2` batteries |
| Plain-boot console probe | **PROBE CLEAN** — 1280×800 and 390×844, 0 errors / 0 warnings / 0 pageErrors |
| `e2e/ap-standing-orders.spec.ts:80` | 🔴 RED at `--workers=4` — **see F-1215-1: pre-existing, not this merge** |

The `--list` number is the one s1213 got wrong and s1214 corrected: this cure
legitimately **adds** one two-project spec, so 344/2460 is the pass, not 343/2458.
Re-derived here, not inherited from the runner's self-report.

No screenshot/perf table: the slice adds no rendering surface. The boot probe is the
render-side evidence.

## Findings

### F-1215-1 — `ap-standing-orders.spec.ts:80` fails deterministically at `--workers=4`, on main, independent of this slice. NON-BLOCKING for this merge.

Failure is at `:121`:
`expect.poll(() => view(page).then((s) => s.log.some((e) => e.surprise === 'wave_early'))).toBe(true)`
— "Timeout 5000ms exceeded while waiting on the predicate".

This spec is exactly the one s1213 flagged as reading `.outcome.result`, so the merge
was the obvious suspect. It is not the cause, and the control says so rather than the
argument:

| Arm | `ToolSurface.ts` | Battery (identical, `agent-view` excluded from **both** so a failing neighbour cannot be the load) | Result |
|---|---|---|---|
| A (treatment) | merged | `ap-standing-orders` + `m4-01` + `m4-05` + `m4-10`, `--workers=4 --repeat-each=2` | **4/4 executions of `:80` FAILED**, 36 passed |
| B (control) | reverted to pre-merge `744c4633` | identical | **4/4 executions of `:80` FAILED**, 36 passed |

Identical failure with the merge's only relevant file reverted ⇒ pre-existing on main.

Read (not grepped) confirmation of why the merge cannot reach it: the spec's `view()`
helper returns `surface.tools.view().outcome.result`, and `result` is
`standingOrders.snapshot()` — **byte-identical** across the merge. `state` and
`economyLog` are sibling keys this spec never reads. The `economyLog: []` change
likewise cannot reach it: every `receipt.outcome.economyLog` assertion in `m4-01`
targets `get_state` / `place_building` / `pan_at` / `repair` / `chase_mark`, all of
which still call `readEconomyLog(game)`; only the `view` receipt's field became `[]`.

**It also passes 1/1 at `--workers=1`** — so this is the second confirmed member of
the F-1214-1 concurrency class, and the drain minimum's `--workers=1` default is
again structurally blind to it. Neither this nor `gazette-welcome` appears in
`logs/suite-red-inventory.md`.

### F-1215-2 — lane-d's gazette-welcome cure returned `PREMISE-NOT-REPRODUCED`, and its own numbers contradict s1214's. Recorded, not resolved.

The corrective s1214 authored stopped lawfully: its STOP was "the concurrent arm comes
back clean", and the runner's concurrent arm did (16/16, desktop+mobile, workers=4,
repeat 2). But the two measurements of nominally the same arm disagree on peak load —
runner **3.41 → 7.62**, s1214's failing arm **3.00 → 15.81** — while my own
`--workers=4` runs this fire reproduced a *different* spec's concurrency red 8/8.
Two fires, same nominal arm, opposite verdicts ⇒ **undersampled: this needs a measured
rate, not a third single-shot arm.** No cure was written and none should be until the
reproduction is characterised as a rate.

## Duties

- **Goal leaf** `ap-08b-view-collection-firewall` → `merged` + merge hash, in the drain commit.
- **Retention:** nothing deleted. The only discarded churn was two `artifacts/m4-10/*.png`
  regenerated by my own measurement runs, restored to main's bytes — never gate on
  byte-identity of a regenerated screenshot.
- Scratch vite ran on **port 5271**, never 5188, so lane-b's live run could not be starved;
  port verified released at exit.
