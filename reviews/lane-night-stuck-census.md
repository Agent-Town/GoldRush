# lane-night-stuck-census — F-BW-10: enemies stop wedging on the furniture

- **Slice:** `lane-night-stuck-census` (master `tasks/done/20260803-171707-lane-night-stuck-census.md`)
- **Branch / tip:** `lane/m4` — **per-commit patch of `a0412139` ONLY**
- **Lane base (merge-base with main):** `74f95634` — **735 commits behind**
- **Gated in:** detached worktree `worktrees/gate-s1445` (§3.0b), removed after
- **Drained by:** s1445

## VERDICT: MERGE

## What it does

The owner's gate walk of 2026-08-03 said *"the opponents get stuck a lot on the different
objects"*. The cliff-side cure (gt-03b, `33eaf580`) had already taught enemies to pick their
**goal side** when steering around terrain; object footprints never got the same lesson.

`ClaimJumperEnemy.resolveBlocker()` pins a blocked enemy to the outside face of a blocker and
then slides it along the tangent. Which way it slid was decided by `avoidanceSide()` — a
position-derived sign that knows nothing about where the enemy is trying to go. Against a wide
footprint that is a coin flip, and the losing half of the flips walks the enemy *away* from its
target and back into the same face next tick: the wedge the owner watched.

The slice threads `moveTarget` down to `blockerSlideDirection()` and makes the tangent
**goal-relative**, keeping `avoidanceSide()` only as the tie-break when the goal delta on that
axis is zero:

```ts
return Math.sign(moveTarget[axis] - this.group.position[axis]) || this.avoidanceSide();
```

That is the gt-03b law **extended, not forked** — one movement law, as the master demanded. The
gap-routing branch (`gapBlockerId !== null`) is untouched and still wins ahead of it.

It also lands the instrument the master asked for first: `scripts/night-stall-census.mjs`, a
replayable headless census, and a 24-route-per-blocker fuzz invariant in `never-trap.spec.ts`
built over `Terrain.landmarkBlockers()` — **object** footprints, which is what the owner
actually complained about, not just palisades. The invariant asserts its own subject is present
(`expect(result.blockerCount).toBeGreaterThan(0)`) before asserting anything about it.

## Evidence

Battery: `--workers=1`, serial, both projects, port 5188 `lsof`-verified FREE before gating.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green**, built in 952 ms |
| Own spec `never-trap.spec.ts` | **PASS both projects** |
| 7-suite battery, merged tree | **46 passed / 15 failed** |
| 7-suite battery, matched control | **44 passed / 17 failed** |
| Determinism | `f-bw-16-baron-siege` *"…its deterministic baseline"* **PASS both projects on the merged tree** |
| Console/page errors | `never-trap.spec.ts` collects and asserts `errors == []` on desktop **and** mobile-chrome (390px) — green |

### The 15 reds are main's, and this is how I know

All 15 titles are already in `logs/suite-red-inventory.md` — but membership in the inventory is
**not** exoneration when the failing suites are `enemy-gap-flow`, `gt-02` and `gt-03`, i.e.
exactly this slice's blast radius. So they were controlled, in the **matched** arrangement that
F-1444-2 was filed for: same seven suites, same worktree, same server, same port, `src/entities/Enemy.ts`
reverted to be **byte-identical to main** (`f589cd7c`, verified by `hash-object`), and the new
spec + census script **KEPT** so the file count and battery load matched.

| Title | merged | control |
|---|---|---|
| `e1-night-shift:271` ramps full/dusk/dark/dawn | D+M red | D+M red |
| `e1-night-shift:372` lantern post relights | D+M red | D+M red |
| `e1-night-shift:435` lantern pool readable | D+M red | D+M red |
| `enemy-gap-flow:136` multi-turn route | D+M red | D+M red |
| `enemy-gap-flow:160` connected U-wall | D+M red | D+M red |
| `gt-02-slope:254` slope movement / cliff blocking | D+M red | D+M red |
| `gt-02-slope:169` tile param debug-gated | **M** red | **D** red |
| `gt-03-enemy-elevation:125` enemies slow on slopes | D+M red | D+M red |
| **`never-trap:88` the fuzz invariant** | **PASS both** | **RED both** |
| | **15 failed** | **17 failed** |

Every red survives the removal of the slice. `gt-02-slope:169` swapped which project it reddened
on between the two arms — inventory line 141 records it as MOBILE-ONLY, and it fired on desktop
in the control; that is flake behaviour in both directions and it indicts neither tree.

⭐ **The fix is proven by a manufactured defect, not by a green.** `never-trap:88` passes on the
merged tree and reds on **both** projects the moment the src is reverted with the spec kept. A
passing test never executes its violation path, so its green alone would not have been evidence;
the red in the control is.

### Runner claims, re-derived rather than inherited

The runner reported a census of **60/60 stalls before → 0/60 after**, clustered on the Lampworks
Yard. I did not verify the census numbers themselves (the script is committed as evidence and is
replayable); the claim that matters for the merge — *does the resolver change actually stop the
wedging* — is carried independently by the control above.

The runner also flagged that it could not run full tsc/build/browser suites because its lane base
was stale (`38528712` references terrain APIs and `SunMotes` absent from that base). Correct, and
that is precisely why this was gated on fresh main: **tsc clean, build green** here.

## Merge classification

Per-commit graft of `a0412139` onto clean main. Base `74f95634`.

| Path | Class | Resolution |
|---|---|---|
| `src/entities/Enemy.ts` | **BOTH-MOVED** | 3-way. Main moved via `b87f154b` (s1444 baron-siege). All **7** of main's substantive additions verified present line-by-line, **0 missing**; all 3 lane markers marker-probed PRESENT. Numstat 9/9 — identical to the lane's own. |
| `e2e/never-trap.spec.ts` | **LANE-TOUCHED only** | Main blob `6927b3ff` == lane parent blob; clean apply, 73/0, identical to the lane's own. |
| `scripts/night-stall-census.mjs` | **PURE ADD** | Absent from main. 146/0. |

All three landed blobs **sha256-identical** to the gated tree.

⚠️ **`lane/m4` was NOT merged at branch level and must never be** — its bottom commit `7c4f132f`
is the owner-BLOCKED `f1328-1` (`disputed` leaf). lane-b stays under DO-NOT-QUEUE.

## Findings

- **F-1445-1 🟡 (goal-leaf debt — TENTH consecutive fire).** `drain-block-check.mjs` answered
  **UNKNOWN** for this master (rc=0 *by default*, which per §3.0 is **not** a clearance).
  Registered on merge. This is now structural rather than anyone's carelessness and still wants
  the attended ruling F-1443-1 and F-1444-1 both asked for: **should authoring hard-STOP without
  a leaf?** Ten fires of identical findings is the signal that writing it up again will not fix it.

- **F-1445-2 🟢 (non-blocking, walk question).** The slice cures the *slide direction* at a
  blocker, which is the wedge the owner saw. It does not add a route-around planner, so an enemy
  whose goal sits directly behind the centre of a very wide footprint still takes the long way by
  tangent rather than by plan. The fuzz invariant proves **net progress every 3 s window over 24
  routes per blocker**, so nothing wedges — but "does not wedge" and "looks smart" are different
  bars, and only a walk answers the second. **OWNER: next night-shift walk — do the raiders now
  read as flowing around the buildings, or merely as no longer stuck?**

- **F-1445-3 🟡 (inventory upkeep, not this slice's debt).** `gt-02-slope:169` is recorded
  MOBILE-ONLY at inventory line 141 and reddened on **desktop** in this fire's control run. The
  MOBILE-ONLY qualifier is now falsified. Left unedited here deliberately — a drain should not
  quietly rewrite the inventory's history — but the next fire touching that file should widen the
  entry to BOTH with this citation.

## Screenshots / artifacts

Test-written artifacts refreshed by the battery under `artifacts/enemy-gap-flow/`,
`artifacts/gt-02b/`, `artifacts/gt-03/`, `artifacts/048/` — **not committed by this drain** (they
are churn from both arms and would misattribute the control arm's numbers to the merged tree).
