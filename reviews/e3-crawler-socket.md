# e3-crawler-socket — Crawler simulation socketed headlessly

- **Slice:** `e3-crawler-socket` (ER-01 census ladder, epoch-3 Voltage)
- **Branch / tip:** `lane/a` @ `94c0b76bb` ("crawl: socket Crawler simulation headlessly")
- **Merge-base:** `3e22423a` · **Merged to main as:** `a172eed0`
- **Drained by:** s1473 fire, 2026-08-06
- **Task master:** `tasks/done/20260806-035053-lane-e3-crawler-socket.md`

## VERDICT: MERGE

All prescribed gates green on the merged tree, including the one that decided the slice:
the browser `e3-canyon-works` spec stayed green, which is the proof the presentation/sim
seam was cut where it was supposed to be.

## What it does

`CrawlerBossSystem` previously did its act/burst/drain simulation and its GLB/scene work in a
single `update()`, so the Crawler consumer could not run without a renderer — the one thing
keeping `e3-canyon-works` out of the ER-01 census at DATA-GAP.

This slice splits that method in two: `step(at)` owns the deterministic half (act advancement,
burst timing, track-pin, drain-target selection) and `syncPresentation(at)` owns everything that
touches THREE objects, the GLB loader, and the canvas dataset. `update()` is now `step()` then
`syncPresentation()`, so **the browser path is unchanged by construction** — `Game.ts:2548` still
calls `update()` and never learns the seam exists.

`HeadlessContractSim` then constructs the system for `dynamo_crawler` contracts and calls
**`step()` only**, wiring `onWaveStarted` / `onComponentKilled` through the existing combat event
path. `e3-canyon-works` joins `SUPPORTED_CONTRACTS`, moving the census to **AGENT-READY: 3 of 4**.

Presentation state is deliberately excluded from the determinism hash: the event-log hash strips
`crawler3dState` from the diagnostics before hashing, and the acceptance run asserts that field
never leaves its initial value — that pairing is what makes "headless" a checkable claim rather
than an assertion.

## Evidence (merged tree, detached `gate-s1473` worktree, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, rc=0 |
| `npm run build` | green, built in 1.27s |
| `npm run test:node-guards` | **299 tests / 296 pass / 0 fail / 3 skipped, rc=0** |
| — of which `scripts/gr-sim.test.mjs` | **GREEN — no sim-pin drift** |
| `e3-canyon-works` + `e3-crawler-boss` + `wire-crawler-3d` + `er01-e3-census` | **26/26**, desktop + mobile, rc=0 |
| adjacent `er01-e2/e4/e5/e6-census` | **32/32**, rc=0 |
| console/page errors | **zero**, desktop-chrome + mobile-chrome (390×844) |
| determinism | acceptance pair `fnv1a32:f466d065` / `fnv1a32:f466d065`, consecutive-pair equality asserted in-spec |

**F-1460-1 duty discharged.** The diff touches `src/sim/` and `src/systems/`, so `test:node-guards`
was mandatory rather than optional. It was run and it is green — `gr-sim.test.mjs` (the Baron pin
that went stale under `4ab48743`) passed, so this routing-adjacent change moved no pinned number.
No re-pin was made or needed (F-1441-3).

**`e3-canyon-works` verified to actually contribute tests**, not collect zero: `--list` reports
4 tests in that file (2 per project), all inside the 26.

No screenshots: this slice renders nothing new. Its entire purpose is that the render path is
*untouched*, and that claim is carried by the browser specs plus the `crawler3dState` invariant,
which are stronger evidence here than an image would be.

## Merge classification

Two-dot `main..lane/a` names 23 files, but that is main's 9 commits showing through — the honest
question is what the lane's single commit touched, and what main did to those paths.

- **Lane commit content:** 4 files — `docs/bench/e3-readiness-census.md`,
  `e2e/er01-e3-census.spec.ts`, `src/sim/HeadlessContractSim.ts`, `src/systems/CrawlerBossSystem.ts`.
- **Main-side movement on those 4 paths since `3e22423a`:** `git diff --stat 3e22423a main -- <the four>`
  returned **empty**. All four are **LANE-TOUCHED only**; zero MAIN-MOVED, zero BOTH-MOVED.
- **Conflicts:** none. `ort` merged clean, +152/−48 across exactly those 4 files.
- **Custody:** gated in a **detached worktree** (`gate-s1473`) per §3.0b — undecided content never
  entered main's working tree. Main's tree was clean of this slice until the merge itself.
- **§3.0 block check:** `drain-block-check.mjs --strict` → `✅ CLEAR — lane-e3-crawler-socket.md
  [e3-crawler-socket] status="queued"`. Leaf ID read and confirmed to name *this* slice.

## Findings

### F-1473-1 — the GLB dispose guard silently broadened, and no spec asserts the new path (NON-BLOCKING)

`update()`'s old teardown line read:

```
if (components.size === 0 && (this.crawler3dState === 'loading' || this.crawler3dState === 'ready'))
```

`syncPresentation()`'s replacement reads:

```
if (components.size === 0 && this.crawler3dState !== 'disposed')
```

That is **strictly broader**. Two initial states reach it that previously could not: `'lite'`
(set in the constructor on the lite performance tier) and `'failed'` (set when the GLB is
unparseable). On those tiers the Crawler's death now flips `data-crawler3d-state` from
`lite`/`failed` to `disposed`, where before it stayed put.

**Why the greens do not cover it:** `wire-crawler-3d.spec.ts:151` and `:163` are the only tests
that reach those two states, and both assert immediately after `spawnCrawler(page)` — while the
boss is *alive*. Neither kills all three components, so neither ever executes the changed line.
Both passed, and their passing says nothing about this change.

**Why it is not blocking:** the new behaviour is arguably the more correct one — the boss is gone,
so `disposed` describes reality better than a lingering `lite` — and the sibling dataset fields
are unaffected (`crawler3dSource` is `placeholder` either way, `crawler3dMounted` false either
way, and `disposeCrawler3d` has no GLB group to release on those paths). The change is also
plainly incidental to the slice's goal; the task declared a presentation seam, not a lifecycle
revision, and nothing in the runner's report or the census mentions it.

**Owed:** a test that kills the full component ladder on the lite tier and pins the intended
post-death `crawler3dState`, so the next reader learns the answer from a spec instead of from a
diff. Cheap, and it closes an untested branch in a file this ladder will keep editing.

### Note — census wording checked against the code, not accepted from the prose

The census flips `e3-canyon-works` support from **NO** to **YES**. That claim is honest and
mechanical: `SUPPORTED_CONTRACTS` in `HeadlessContractSim.ts` gained the contract id, and the
tick genuinely calls `this.crawler?.step(...)`, so the gate flipped because the consumer now
exists — not because the definition of "support" was widened around it. The `AGENT-READY: 3 of 4`
headline is earned.

## Env exceptions

None. No known-red was invoked, no failure was fingerprint-matched, nothing was excused.
