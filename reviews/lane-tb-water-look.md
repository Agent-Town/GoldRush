# lane-tb-water-look — F-BW-13: the braid learns to look like a river

**Slice:** `lane-tb-water-look` · **branch:** `lane/m3` · **lane tip commit:** `4d4fc858`
**Merge-base:** `4983ce0385df3bee69a79bee7486c626e3d0b8f6` · **merged to main as:** `4db6254d662d22532eea766d04b046cd8bb03fcc`
**Drained by:** s1442 fire, 2026-08-03

## VERDICT: MERGED (full) — every landed path gated, all adjacent reds proven pre-existing by a control run.

## What it does

Owner, gate walk 2026-08-03, verbatim (with screenshots): *"the ends of the river don't continue as
expected... the river does not look like a river"*. The Twin Banks braid rendered as hard-edged
straight bands — mitre wedges where the channels cross, dead-stop ends at the tile boundary,
banding/dither on the surface, and dark bed voids flanking the ribbons.

The slice is **render-only**. `Water.ts` resamples the mask polylines into smoothed centrelines so no
straight-band read survives at gameplay zoom, treats the crossing as a confluence rather than a
mitred join, feathers the last metres into the haze so the river *leaves* the frame instead of
stopping, and darkens the bed beside the ribbons so nothing black flanks the water. The pilot's
ribbon config and the probe spec follow. **Mask data, sim water, crossings and shore width are
untouched** — the master's firewall, and it held.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (grafted tree) | clean |
| `npm run build` | ✓ built in **991 ms** |
| Own spec `beauty-twin-banks.spec.ts`, both projects, `--workers=1` | **8 passed / 2 skipped** (the 2 skips are by-design mobile skips), rc=0 |
| Console/page errors | `expectClean(errors)` asserted at 5 sites incl. the plain-boot board (`:105`→`:188`), desktop **and** 390px mobile — green |
| Adjacent battery (9 suites, derived BY GREP) | **32 passed / 10 failed** |
| **Control run, clean main, same worktree/server/port** | **32 passed / 10 failed — identical set** |

Gates ran in the detached worktree `gate-s1442` (§3.0b — removed after) on **scratch port 5199**;
every playwright command carried `--workers=1` (§3.1). Control-arm main-equivalence was proven by
`HEAD == main` plus an **empty** `git status --porcelain -- src e2e`, in the same worktree, against
the same dev server on the same port.

### The adjacent reds — all five reproduce on BOTH arms, with matching inner assertion lines

Titles alone are not evidence (F-1436-2 / F-1440-3). Each was diffed at the **assertion that actually
failed**:

| Suite / title | merged arm | control (clean main) | verdict |
|---|---|---|---|
| `e1-twin-banks:103` builds sluices | `> 48` `ghostValid` | `> 48` `ghostValid` | pre-existing |
| `e1-twin-banks:122` routes enemies through both fords | `> 211` predicate timeout | `> 211` predicate timeout | pre-existing |
| `terrain-seamless:121` de-tiles within budgets | `> 147` `after.p95 < before.p95` | `> 147` same | pre-existing |
| `terrain3d-claim-pilot:166` 115% p95 budget | `:174` `waitForFunction` timeout | `:174` same | pre-existing |
| `water-mask-engine:23` legacy water contract | `> 39` `toEqual` | `> 39` same | pre-existing |

Suites gated: `e1-twin-banks` · `w1-02-living-water` · `shore-truth` · `water-mask-engine` ·
`terrain3d-claim-pilot` · `lane-crossing-armed` · `freed-water-routing` · `terrain-seamless` ·
`tr-02-splat-ground`.

## Merge classification

Base `4983ce03`. Per-file:

| File | Class | Resolution |
|---|---|---|
| `e2e/beauty-twin-banks.spec.ts` | LANE-TOUCHED | clean apply |
| `src/world/Water.ts` | **BOTH-MOVED** | 3-way auto-merge, no conflict |
| `src/world/Terrain3dClaimPilot.ts` | **BOTH-MOVED** | 3-way auto-merge, no conflict |

Main's side of both BOTH-MOVED files is the s1440 perf drain plus the spring-pond damp-ground rework
— a **different function** from the braid geometry, hence the clean auto-merge. Verified surviving,
not assumed: `SpringPondDampGround`, `dampGroundRadius`, `dampBaseRadius` and
`RingGeometry(config.radius, outerRadius` all **PRESENT** in the merged `Water.ts`; **all 38** of
main's substantive added lines in `Terrain3dClaimPilot.ts` **present**, 0 missing.

**The 2-line stat delta is fully accounted for.** The graft reads `336+/55-` against the lane's own
`336+/57-`. Cause: main and the lane *independently* deleted the same two trailing blank lines at
`Water.ts` EOF, so the graft only has 55 left to delete. Read from both diffs, not inferred. No
content was lost.

All three landed files were **blob-verified sha256-identical** to the tree that was gated.

Artifacts (`artifacts/tb-water-look/`, 63 MB — before/after/compare boards + perf and water-probe
JSON) landed with the slice: the master's SELF-CHECK demanded them, and main already tracks 361
artifact directories including `lane-night-visibility`.

## Findings

**F-1442-1 (🟢 method, closed in this review — no corrective needed): a reporter filter can
impersonate exactly the discrimination the last two fires were saved by.**

My first adjacent battery appeared to show `e1-twin-banks` failing at **`:213`**
(`expect(track?.deepSamples).toBe(0)`) — the **F-1441-2 canon signature**, on a slice that is
render-only and touches no enemy code. That would have been a serious finding.

It was false, and it was **my own instrument**. To keep the output readable I filtered the playwright
report through `/✘|✓|passed|failed|skipped|Error:|expect\(/`. Line `211` is `.toBe(true);` and line
`212` is a `const track = ...` — **neither contains the literal `expect(`** — so the filter dropped
the `> 211` marker line and printed lines `213`/`214` as the only visible context. The failure
*looked* like it had moved inward. Re-run raw on the same grafted tree: **`> 211` on both projects**,
identical to the control.

The same regex made `e1-twin-banks:103` ambiguous too (`:48` uses `expect.poll(`, not `expect(`);
re-run raw, it is `> 48` on both arms.

**Why it matters:** F-1441-2 and F-1440-3 both established that only the *inner assertion line*
distinguishes a stale red from a new defect. A convenience filter that silently removes the `>`
marker destroys precisely that signal — and it fails toward *manufacturing* a finding, which is the
expensive direction. **When reading a red to decide a merge, print the reporter output raw, or at
minimum keep every line matching `^\s*>` .** Cost of the mistake here: one re-run. Cost if trusted:
a false canon-violation finding against an innocent slice, and a withheld merge the owner asked for.

## Player-visible

Yes — the river the owner complained about. GZ-01 item appended.
