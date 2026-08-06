# f1476-1 — renderer-count tolerance guard

- **Slice:** `f1476-1-renderer-count-tolerance` (cure for F-1476-1, gate disjunct **(a) tolerance-not-byte**)
- **Branch / tip:** `lane/a` @ `7b934b643` ("rct: guard renderer counts with measured tolerances")
- **Merge base:** `14028bd8e` · **Merged to main:** `3ab612ed647f8e2fe7a697faa2213ba9cdbf433e` (`--no-ff`)
- **Drained by:** s1478 fire, 2026-08-06
- **VERDICT: MERGED — all gates green, and both acceptance tests the master demanded were reproduced on the merged tree rather than inherited from the runner's report.**

## What it does

The four `artifacts/**/renderer-counts-*.json` files were **write-only evidence**: each run
serialised that run's raw renderer counts over the file, so they churned on every single run
(2 of the 12 tracked churning files in F-1477-1) while asserting nothing. Nothing read them —
s1477 verified `git grep renderer-count` returned only the two *writing* specs and prose.

This slice inverts them into **live expectations**. `e2e/renderer-count-artifact.ts` (new, 50
lines) reads the committed artifact, checks the run's actual counts against it, and only then
rewrites it — *unchanged*, because it re-serialises the object it read rather than the run's
values. Two kinds of expectation, chosen per metric from s1477's measured spreads:

- **exact** where the metric is hard-stable (`coldBaseline.geometries: 81`, 12/12 in s1477's n=12);
- **`{measured, tolerance}` bands** where it jitters, with headroom of one observed quantum past
  each measured edge (1 for `calls`/`geometries`, 2 for `triangles`);
- plus **exact phase-to-phase deltas** for `geometries`/`textures`, which s1477 measured as
  common-mode — every delta identical across all 10 railcar runs and all 6 phase pairs.

So the churn stops *and* the signal is now enforced instead of merely recorded. That is the
right half of the fork: disjunct (b) "stop writing" would have ended the churn by discarding
the evidence.

Each artifact carries its own `provenance` block (`n`, `commit`, `project`, `headroom`), so
every band is re-derivable — `artifacts/f1476-1/measure.mjs` plus the retained sample/spread
JSONs are the working. The master required the runner to measure `mobile-chrome` itself rather
than copy s1477's desktop bands; the retained `samples-*-mobile-chrome.json` files show it did.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, no output |
| `npm run build` | ✓ built in 2.28s; asset-diet ceilings respected (Herald 1,158,214 / 1,500,000 bytes) |
| Slice specs, **both projects**, `--workers=1` | **14 passed (1.2m)** — `wire-crawler-3d` + `wire-railcar-3d`, desktop-chrome + mobile-chrome |
| Zero console/page errors | asserted in-spec (`expect(errors).toEqual([])`) in both suites, both projects — passed |
| `npm run test:node-guards` | **rc=0 GREEN** (run because the slice adds a new `e2e/` module, i.e. a collection surface; `desk-declaration` correctly SKIPs under a live ACTIVE lock) |
| **Churn cured** | after a full gate run, `git status -- artifacts/` shows **0** `renderer-counts-*.json` entries (was: all 4 every run) |
| **Guard bites** | manufactured out-of-band value → `Error: renderer count coldBaseline.calls=74 outside band [0, 1]`, **1 failed**; probe restored byte-identical |
| Port hygiene | 5188 verified FREE before gating (strictPort — no other tree measured) |

Screenshots (written by the specs themselves): `artifacts/wire-crawler-3d/{desktop,mobile}-chrome-*.png`
and `artifacts/wire-railcar-3d/{desktop,mobile}-chrome-*.png`.

**The guard-bites test is the load-bearing one and was not taken on trust.** A passing guard
never executes its violation path, so its green says nothing about whether it can fail
(the s1299/s1300 standard). I perturbed one band to `[0, 1]`, watched the spec fail with the
band branch's own message, and restored the file to a byte-identical state (`git status` empty).

## Merge classification

Base `14028bd8e`. Every one of the 12 changed paths is **LANE-TOUCHED only** — main moved 16
files since the base (STATUS.md, `logs/*`, `tasks/BACKLOG.md`, `assets/pilots/…`, s1477/s1478
helper scripts) and the intersection with the lane's set is **empty**. No 3-way graft was
needed and no conflict was resolved; `--no-ff` merge applied cleanly.

`+1674 / -111` across: 2 spec files (12 lines each), 1 new helper, 4 rewritten expectation
artifacts, 5 new measurement-evidence files under `artifacts/f1476-1/`. **No `src/` bytes moved**,
so the F-1460-1 sim-pin trigger does not fire and DEPLOY correctly skips.

## Findings

**F-1478-1 (non-blocking, recorded not cured) — the artifact is now a required input, so these
two specs can no longer bootstrap from nothing.** `verifyAndWriteRendererCounts` opens the
artifact with `readFile` and will throw `ENOENT` if it is absent, where the old code called
`mkdir(…, { recursive: true })` and wrote unconditionally. Both specs still import `mkdir` for
their screenshot helper, so the directory keeps being created — but a fresh clone that deleted
`artifacts/` or a **new** contract added to either spec would fail with a filesystem error
rather than a useful "no baseline yet" message. This is the correct trade for a guard (a
self-creating baseline cannot detect a regression on its first run — it would simply bless
whatever it saw), so it should NOT be "fixed" by falling back to write-on-missing. Worth one
line of intent at the `readFile` call, and worth knowing before someone adds a third spec.

**Not a finding, stated to prevent a false one:** the 20 `*-broken.png` / `*-intact.png`
screenshots still churn on every run and were discarded rather than committed. That is
**F-1477-1**, which is open on the owner's desk and untouched by this slice — this slice never
claimed to cure it, and its own churn measurement excluded them.
