# Gate evidence — `sol-open-findings-astra` (s2644)

**Slice/branch/tip:** `sol-open-findings-astra` · `sol/open-findings-astra` · `9af35a84c`
**Base:** `de7eacd1714584ad73cb2d1245e5f907d213b9f1` · **trial merge gated on:** a detached `gate-s2644` worktree off `36cda7505` (§3.0b — undecided content never entered main's tree)

## Verdict

**HOLD — NOT MERGED.** Every gate I ran is GREEN on the *merged* tree, and that is a real result, not a hedge. What is missing is not my confidence in the slice; it is two things the runner itself named and deliberately left to the orchestrator:

1. the **broad browser and node reds** (23 and 10 respectively) of which the runner attributed 9 and explicitly refused to declare the rest unrelated, and
2. the **final merged engine identity**, which is unset.

I could not disposition (1) tonight for a *measured* reason rather than a budget one: the differential method this repo prescribes is **unreliable across two worktrees that share a symlinked `node_modules`**, which I proved in this gate (F-2644-3, below). Until that is handled, a broad merged-vs-main comparison would produce failures I could not attribute — the exact "manufactured finding" F-2462-1 forbids.

## What it does

Two findings in one branch. **F-ASTRA-6:** opaque scenery batching with per-prop camera culling (`src/town/OpaquePropBatchPilot.ts` new, `src/world/Scatter.ts`, `src/town/TownTavernPilot.ts`), measured at **2 / 2 / 3 / 2 fewer draw calls** for The Claim / town / Dry Gulch / Twin Banks. **F-ASTRA-2:** a finished diffuse 1024-square hero pilot with complete side/back UVs and a grounded exported walk. **The runtime still uses the sprite — promotion is Robin's call, and this slice does not take it.**

## Evidence — all on the MERGED tree

| gate | result | wall |
|---|---|---|
| `npx tsc --noEmit` | **rc=0 GREEN** | 13.8 s |
| `npm run build` | **rc=0 GREEN** | 30.9 s |
| `gate-caller-audit` | **PASS** — the slice's new `scripts/f-astra-6-census.test.mjs` is *reached*, no new orphan | 0.2 s |
| `nul-audit` | **CLEAN** — 23,336 text subjects, 22,972 read | 1.8 s |
| `scripts/f-astra-6-census.test.mjs` | **4/4 pass, 0 fail** | 0.3 s |
| `e2e/f-astra-6-plain-boot.spec.ts` | **8/8 pass** — desktop **and** 390 px mobile, four scenes, zero console/page errors | 65.9 s |
| `e2e/town-tavern-blender.spec.ts` (adjacent) | **6/6 pass** on a settled cache; **6/6 on main** as control | 48.7 s |

The plain-boot spec is worth naming separately: it answers Mistake #10 directly — *where does the player see this, in a plain boot?* — at both viewports, with no `?debug`.

⚠️ **The census guard's green was checked for vacuity rather than trusted.** My first read filtered on `^# tests` and printed nothing; `node --test` emits `ℹ tests` (the F-2633-2 trap), so a file registering **zero** tests would have looked identical to a pass. Re-read raw: **4 named tests, 4 pass**.

## The one red, and why it is not a red

Run #1 of the adjacent tavern spec failed one case — `Tavern pilot … stays inside the frame-time gate`, desktop-chrome, `p95 regression: {"calls":-17,"webglCallsPerFrame":-17,"trianglesPerFrame":21768,"p95Percent":79.79}`. Note `calls: -17` — that is the slice's *improvement* showing up in the same payload.

It does not reproduce. Four runs, same spec, no code change between them:

| run | tree | load | cache state | result |
|---|---|---|---|---|
| #1 | merged | ~12 | cold optimise | 5 pass / **1 fail (p95 79.79)** |
| control | main | 7.68 | re-optimised for main | **6 pass** |
| #2 | merged | 6.71 | just overwritten by the control | **6 fail** (`Failed to fetch dynamically imported module`) |
| #3 | merged | 6.43 | settled | **6 pass** |

Run #3 is the decisive one: the same tree that failed the p95 gate in run #1 passes it at lower load on a settled cache. **The p95 red was environmental**, which is precisely the strict timing condition the runner flagged as *unproved* and declined to claim — its caution was correct, and this gate does not overturn it in either direction. ⓘ Two mechanisms are consistent with run #1 (machine load at ~12, and the cold dep-optimisation a first run in a fresh tree pays). I did not separate them and do not assert which; the actionable rule below holds under both.

## F-2644-3 — the prescribed gate method cannot host its own differential

Run #2 failed **all six** cases with `TypeError: Failed to fetch dynamically imported module: …/src/town/TownTavernPilot.ts`. That is not the slice. Both `gate-s2644` and `control-s2644` symlink the **same** `node_modules` (the house pattern), so they share one vite dep cache at `node_modules/.vite`. Measured: `.vite/deps` mtime `2026-09-19T15:05:52.529Z` — **the minute run #2 started**, immediately after the control had re-optimised that cache for *main's* module graph. Run #3, with nothing changed but a settled cache, went green.

**Consequence for the drain law:** §3.0b tells you to gate undecided content in a detached worktree, and "gate a drain on a DIFFERENTIAL when the battery is already red" tells you to compare against main. Done the obvious way, those two instructions **interfere** — the second vite run silently invalidates the first's optimised deps, and the resulting failures look like slice defects.

➡️ **The cheap rule, measured rather than designed: after switching which worktree you run vite from, DISCARD THE FIRST RUN and re-run.** Run #3 is that rule working. A durable cure would give each gate worktree its own `cacheDir`; that is an implementation change, not a drain's drive-by, and is filed rather than done.

## Findings

- **F-2644-3** (above) — the shared-`node_modules` vite cache defeats a two-worktree differential. Filed in `tasks/BACKLOG.md`. Non-blocking for this slice; blocking for the broad differential the *next* fire needs.
- **No finding against the slice.** Nothing I ran attributes a defect to it.

## What the next fire needs to land this

1. Disposition the broad browser (23) and node (10) reds — 9 are already attributed by the runner to the original modules with `baseline-control-hits.jsonl` as proof; the rest are open. **Apply F-2644-3's discard-first-run rule or the comparison will lie.**
2. Compute and pin the final **merged** engine identity (the runner says so in its own handoff boundary).
3. F-ASTRA-2 promotion is an **owner call** and is not part of landing F-ASTRA-6.

The branch is clean, the merge is conflict-free, and nothing here needs redoing — this is a handoff of the remaining judgement, not of the work.
