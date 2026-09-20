# lane-pilot-fallback-telemetry — F-BW-4: silent demotions learn to speak

- **Slice:** `lane-pilot-fallback-telemetry` (queued by the attended session 2026-08-03 11:36)
- **Source commit:** `lane/m4` tip `38528712` (runner auto-commit), lane base `74f95634`
- **Drained by:** s1431 fire, 2026-08-03 — **re-landed on fresh main**, per CLAUDE.md Mistake #15
- **Gate tree:** detached worktree `gate-s1431` at main `de395a72` (§3.0b)
- **Supersedes:** the F-1430-2 HOLD. See "Why the blocker dissolved" below.

## Verdict

**MERGE**, as a re-land rather than a branch merge.

## Why the blocker dissolved — the measurement that changed the ruling

s1430 declined this drain and filed **F-1430-2**, reading it as *"a 754-line hunk in a player-facing
3D pilot file"* across a **634-commit** gap, governed by Mistake #15, needing an owner or attended
hand. Every one of those observations was accurate. The verdict still inverted, because the size was
measured **against the lane's own base** rather than against the tree the content would actually
merge into.

| Question | Answer |
|---|---|
| Tip's own commit diff for the pilot | `+741/−13` — the scary number |
| Tip's pilot blob vs **main's** pilot blob | **`+15/−7`** |
| Branch-level added lines absent from main (`lane-absorbed-lines`) | **14 of 713** |

Main had absorbed 699 of those 713 lines through the beauty ladder. The lane's copy of that file
**already contained main's work**, so the patch looked enormous while the *content* was 22 lines of
telemetry. `git apply --3way` reported a conflict for exactly this reason: it was replaying a diff
written against a base 634 commits stale, not resolving a genuine disagreement about the code.

This is the F-1081-9 lesson at file scope — a conservative verdict taken at the wrong resolution is
not safety, it is a different way of being wrong.

**Two further facts, established by reading rather than assumed:**

1. **No predecessor touches any of the tip's five files.** `git log 74f95634..743ea56b -- <the five>`
   is **empty**, so re-landing the tip imports nothing from the four un-ruled commits below it.
2. **The owner-gated commit `7c4f132f` is disjoint.** Its files are `072-era-activation.spec.ts`,
   `agent-view.spec.ts`, `e1-baron.spec.ts`, `e1-mechanics-manifests.json`, `TownScene.ts` — no
   overlap with this slice. The standing "do not touch the four files in `7c4f132f`" prohibition is
   **not engaged**, and lane-b's `disputed` leaf remains un-ruled and untouched by this merge.

## What it does

Owner, live on the public URL 2026-08-03: *"the graphics has reset to the old style from the new
map… What happened?"* — and nobody could answer from the server side. The 3D pilot's fail-soft
demotions published only to the canvas dataset, invisible unless a player opened devtools mid-run.

This slice fires one `render_demotion` beacon (reason, contractId, buildId, tier, dataset snapshot)
on each demotion path: contract unavailable, load failure, sculpt-water failure, WebGL context loss,
and runtime tier shed. Fire-and-forget, offline-silent. No demotion *behaviour* changes.

## Merge classification (per file)

| File | Class | Handling |
|---|---|---|
| `e2e/terrain3d-default.spec.ts` | LANE-TOUCHED | clean copy (`+64`, additive) |
| `functions/api/telemetry.ts` | LANE-TOUCHED | clean copy |
| `src/telemetry/runBeacon.ts` | LANE-TOUCHED | clean copy |
| `src/world/Terrain3dClaimPilot.ts` | MAIN-MOVED (18 commits) — **but the tip blob already contains main's content** | clean copy, verified `+15/−7` vs main and every `−` line paired with the same line extended (widened signature, `catch` given a binding, `failLoad` given an arg). **Zero main content removed; the beauty ladder is intact.** |
| `src/game/Game.ts` | MAIN-MOVED (9 commits), tip blob **112 lines** divergent | **GRAFTED — 2 lines only.** Wholesale copy here would have reverted main. |

The `Game.ts` graft was anchored **by content, with uniqueness asserted before writing** (both
anchors count exactly 1). It landed at `:4607` on main versus `:4584` on the lane — the coordinate
moved, the content anchor did not.

Total merged: **5 files, +182/−16** — not the 908 the branch diff advertises.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | green, 1.85s |
| `e2e/terrain3d-default.spec.ts` (own spec) + 3 adjacent | **26 passed, 2 failed** — both reds proven pre-existing below |
| Adjacent suites derived by **grep** (`runBeacon\|render_demotion\|installRunTelemetry\|api/telemetry`) | `tl-01-run-telemetry`, `release-base-path`, `locked-win` |

All playwright runs `--workers=1` per §3.1.

### The reds are not ours — proven by control, against my own prior

`tl-01-run-telemetry.spec.ts:229 › plain no-debug secure return keeps telemetry invisible to
gameplay` failed on **both projects, deterministically**, in a suite whose name matches this slice's
subject exactly. That is about as strong a circumstantial case for "the merge broke it" as a drain
ever gets, and it was **wrong**.

**Same 4-suite batch, clean main: 3 failed, 23 passed. Merged tree: 2 failed, 26 passed.**

| Test | Clean main | Merged tree |
|---|---|---|
| `tl-01:229` (desktop + mobile) | RED | RED — pre-existing |
| `terrain3d-default:81` p95 budget (desktop) | **RED** | green |

The merged tree carries **strictly fewer failures** than the tree it merges into.

**Fingerprint of the pre-existing red**, so a later fire can match it rather than re-derive it:

```
Error: expect(locator).toBeVisible() failed
Expected: visible
Error: element(s) not found
> 236 | await expect(page.getByTestId('claim-secured')).toBeVisible({ timeout: 18_000 });
    at e2e/tl-01-run-telemetry.spec.ts:236:51
```

Note **where** it fails: `claim-secured` never becomes visible — a **gameplay-progression** step at
`:236`. The test never reaches a telemetry assertion at all, which is why a telemetry slice cannot
be its cause. Filed as **F-1431-3**.

## Findings

- **F-1430-2 — RESOLVED / SUPERSEDED.** The slice was never stranded by its content, only by the
  resolution at which its content was measured. No owner word was required. The *dispatch* critique
  in F-1430-2 stands and is unaffected: lane-b remains 636 behind under a standing DO-NOT-RESET, and
  anything queued there will still be built stale. **Do not queue new work into lane-b.**
- **F-1431-3** (new, non-blocking) — `tl-01-run-telemetry.spec.ts:229` is **RED on clean main**, both
  projects, at the gameplay-progression assertion `:236` (`claim-secured` never visible within 18s).
  Pre-dates this merge; needs its own investigation. **Do not "cure" it by raising the timeout**
  until someone has established whether the claim genuinely fails to secure.
- **F-1431-4** (new, non-blocking) — `terrain3d-default.spec.ts:81 › promoted terrain stays inside
  the 115% p95 budget` reddened on **clean main** and passed on the merged tree in the same batch.
  A perf-budget assertion flipping on an unrelated tree is a load-ceiling signal, same family as
  F-1431-1. Worth measuring together.
- **Goal Registration** — this master reached the runner with **no goal leaf** (`drain-block-check`
  returned UNKNOWN, which is a bookkeeping finding and not a clearance). A leaf is registered in the
  drain bookkeeping commit.
