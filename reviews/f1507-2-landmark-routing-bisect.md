# f1507-2 — landmark-routing bisect (STOP report drained, then the bisect finished fire-side)

- **Slice:** `lane-f1507-2-landmark-routing-bisect`
- **Branch / tip:** `lane/a` @ `9e38976cc`
- **Base:** `61892d181`
- **Merged to main:** `ccd26fc8b` (docs-only)
- **Drained by:** s1510, 2026-08-07

## Verdict

**ACCEPT the runner's STOP as correct and complete** — its endpoint check was right, its refusal
to bisect was right, and its refusal to touch `Enemy.ts` was right. The task's proposed good
endpoint `c063b5e59` is itself red, so the master's premise was wrong and the runner said so
instead of manufacturing a culprit.

**And the bisect is now FINISHED, fire-side, in two probes.** The culprit is
**`531bd923adc97d9c288310f7f94f549e994c3f29`** — *drain(s1445): lane-night-stuck-census MERGED —
F-BW-10, enemies slide toward their goal, not their sign*.

## What it does

The runner validated both endpoints the master named, found the "good" one already failing,
stopped at the master's explicit endpoint-stop condition, and wrote a 66-line report
(`docs/bench/landmark-routing-regression.md`) containing a read-only 180-sample browser probe of
the actual enemy path. That probe is the reason this fire could finish the job in two runs rather
than eleven: it named the *shape* of the failure (an oscillation pinned to the blocker's south
face) precisely enough to pick the right suspect first.

## Evidence

### The merge (docs-only)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| Three-dot diff `main...lane/a` | **1 file, +66/-0**, `docs/bench/landmark-routing-regression.md` |
| Run surface touched | **none** — no `src/`, `e2e/`, `functions/`, `scripts/`, or config paths |
| Merged blob vs lane blob | **identical** (`git diff lane/a -- <path>` empty after commit) |

`npm run build` and a browser battery were **not** run and are **not** owed: the merge adds one
markdown file and changes no input to either. Stated explicitly rather than silently skipped.

### Merge classification

Base `61892d181`. Two-dot `main..lane/a` showed four paths; three-dot showed one. The difference
is the point:

| File | Class | Resolution |
|---|---|---|
| `docs/bench/landmark-routing-regression.md` | **LANE-TOUCHED, main-unmoved** | clean apply (new file) |
| `STATUS.md` | MAIN-MOVED only | not merged — main's s1509/s1510 lines win |
| `tasks/BACKLOG.md` | MAIN-MOVED only | not merged |
| `tasks/lane-f1507-2-landmark-routing-bisect.md` | MAIN-MOVED only | not merged |

### The bisect (this fire)

All arms `--workers=1`, both projects, detached worktree `gate-s1510`, external vite on scratch
port 5234, subject `e2e/landmark-collision.spec.ts:68` *"enemy blocker routing is deterministic
and goes around a county landmark"*.

| Commit | Date | Result |
|---|---|---|
| `1761da401` | 2026-07-28T09:56+07 | **GREEN — 10/10 passed** (whole spec, both projects, 56.8 s) |
| `7bb054510` (culprit's parent) | 2026-08-04T00:20+07 | **GREEN — 2/2 passed** (6.0 s) |
| **`531bd923a`** | **2026-08-04T00:48+07** | **RED — 2/2 failed**, both projects |
| `c063b5e59` | 2026-08-04 | RED (runner-measured) |
| `main` @ `61892d181` | 2026-08-07 | RED (s1509- and runner-measured) |

Transcripts: `artifacts/s1510-landmark-endpoint.txt`, `artifacts/s1510-landmark-bisect.txt`.

### Why `1761da401` is a *proven*-green endpoint and not an inherited one

The master's window came from `CLEAN-IN-INVENTORY`, and this fire did **not** take that on trust —
the memory rule is that CLEAN means *green on the snapshot's date*, and a spec that never ran is
also "clean". The inventory's markdown lists **failures only**, so its silence about this spec is
by construction ambiguous.

Resolved from `logs/suite-red-inventory-compact.json`, which carries the run's full `suites` tree
(332 spec files = the denominator, not just the reds). `landmark-collision.spec.ts` is present,
and its `:68` test carries an explicit per-test record:

```
"title": "enemy blocker routing is deterministic and goes around a county landmark",
"ok": true,  "status": "passed",  "duration": 4463,
"startTime": "2026-07-28T02:59:19.439Z"
```

That is *ran and passed*, not *absent*. `1761da401` is main at 2026-07-28T09:56+07 — three minutes
before that recorded pass — and this fire re-measured it green at `--workers=1`.

## Root cause — mechanism, not correlation

`531bd923a` is **9 insertions / 9 deletions in one file**, `src/entities/Enemy.ts`:

```diff
-  private blockerSlideDirection(axis: 'x' | 'z'): number {
+  private blockerSlideDirection(axis: 'x' | 'z', moveTarget: THREE.Vector3): number {
     if (this.gapBlockerId !== null) { ... }
-    return this.avoidanceSide();
+    return Math.sign(moveTarget[axis] - this.group.position[axis]) || this.avoidanceSide();
   }
```

`avoidanceSide()` is **position-derived and constant** for a given approach, so a blocked enemy
slid one way along the face until it cleared the corner — it went *around*. The goal-relative sign
is **not** constant: it flips whenever the enemy crosses the goal's axis value.

The spec scripts the enemy from directly south of `ruined_mining_operation` to directly north of
it, so goal-x equals blocker-x. The slide term therefore points back toward the blocker's centre
from either side, and the enemy oscillates around it forever. The runner's probe measured exactly
this — 180 samples pinned at `z=-8.652` with `1.845 ≤ x ≤ 2.061`, a **maximum x-deviation of
0.175** against `halfX=3.176`.

## Findings

### F-1510-1 — the F-BW-10 cure trades a flip-flop wedge for a head-on stall. OWNER QUESTION.

F-BW-10 was owner-driven (gate walk 2026-08-03, verbatim: *"the opponents get stuck a lot on the
different objects"*). The cure removed the wedge case. **Measured:** it creates a stall in the
head-on case — goal directly behind the blocker — where the enemy now never escapes the face.

⚠️ **Stated at its true strength: what is MEASURED is that the enemy does not route around and
does not clear the footprint within the 6-unit sim window (180 samples).** That it would stall
*indefinitely* in live play, and that a player would read it as the same complaint the owner
raised, are **INFERRED** — plausible from the geometry (the attractor is stable) but not measured
over a longer horizon or in a real wave.

**This is likely NOT a design fork.** The two behaviours look reconcilable by a deadband: keep the
goal-relative sign as the primary, but fall back to `avoidanceSide()` when
`|moveTarget[axis] - position[axis]|` is below a threshold, rather than only when it is exactly
zero. That is an engineering fix with a checkable gate (both `e2e/never-trap.spec.ts:88`
("Night Shift enemies always make goal progress around object footprints") and
`landmark-collision:68` green in one battery), so it is fire-authorable. **The owner word that IS
wanted:** whether "goes around the landmark" is still the intended enemy read at all, or whether
the E2-era routing is meant to be blunter. Parked as a desk item, not blocking the corrective.

Corrective authored this fire: `tasks/lane-f1510-1-blocker-slide-deadband.md`.

### F-1510-2 — the s1445 battery was chosen by suite name, not derived from the changed API

The s1445 drain was unusually rigorous — matched control with `Enemy.ts` reverted byte-identical,
a manufactured-defect proof for its own invariant, an honest 15-red control table. It still missed
this, and **not through carelessness**: its 7-suite adjacent list simply did not contain
`landmark-collision.spec.ts`.

The slice changed blocker resolution over `Terrain.landmarkBlockers()`. **Four** e2e specs consume
that API:

| Spec | In the s1445 battery? |
|---|---|
| `e2e/never-trap.spec.ts` | ✅ (the slice's own new spec) |
| `e2e/landmark-collision.spec.ts` | ❌ — **the regression landed here** |
| `e2e/fort-landmark-collision.spec.ts` | ❌ |
| `e2e/map-census.spec.ts` | ❌ |

One `grep -rl landmarkBlockers e2e/` would have surfaced all four in under a second. This is the
same class as F-1229-1 (*choose the battery FROM THE DIFF*), which is mechanised for the **node**
guards via `run-guards.mjs --changed-since` but has **no equivalent for e2e specs** — an e2e
adjacent list is still hand-written prose, and prose cannot see a call graph.

⇒ Recommended mechanism, **not built this fire** (it needs its own slice and its own corpus
measurement first — per the "run the predicate on the live corpus before building the gate" rule):
a helper that maps a diff's touched `src/` exports to the e2e specs referencing them and prints
the suggested adjacent list. Filed for the ladder, unowned.

### F-1510-3 (non-blocking) — the inventory records no snapshot commit

`logs/suite-red-inventory.md`'s provenance section records workers, Playwright version and the six
headline counts, but **not the commit the run was taken at**. This fire had to recover the tree by
timestamp-matching a per-test `startTime` against `git log`. Cheap fix for whoever next regenerates
it: write the `HEAD` sha into the provenance block.

## Gazette

**No item.** The merge is a docs-only investigation report — not player-visible (filter law). The
*cure* for F-1510-1, when it lands, is player-visible and should carry one.
