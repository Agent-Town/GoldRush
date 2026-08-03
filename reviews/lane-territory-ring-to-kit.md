# lane-territory-ring-to-kit — the territory reward frees its feet (F-BW-6)

**Slice:** `lane-territory-ring-to-kit` · **branch:** `lane/perf` · **tip:** `44eda5bd` · **base:** `0f7f45fdea8f9fee0424750ec60af6af521c4bda`
**Gated by:** s1433 fire, 2026-08-03, in detached worktree `gate-s1433` (§3.0b — main's working tree never held this content)

## VERDICT: HOLD — NOT MERGED. One attributable regression (F-1433-1), precisely located and cheap to fix.

> ⏭️ **SUPERSEDED — see the s1435 ADDENDUM at the foot of this file.** The hold's written lift condition was
> satisfied (`f1433-1` landed as `d9235027`, the named test green 2/2 both projects and proven load-bearing by
> manufacturing the defect), and the stack **MERGED as `af463bd9`**. This section is kept as the record of why
> the slice was held, not as its current state. **The owner fork it surfaced is still OPEN.**

The slice is good work and the design is right. It is held on a single defect that its own master forbids in writing.

## What it does
Converts the Territory I meta reward from an auto-spawned palisade ring at the hero start into a **palisade kit**: N free, run-scoped placements the player puts anywhere, expiring at run end. No structure spawns on its own, so the Prospector's auto-repair only ever tends walls the player chose — which is exactly the owner's complaint ("they will just drain my gold because the prospector will repair them… I don't want to build a base at the starting position but where I can farm gold"). The ring-geometry code (`territoryRingSegments`) is deleted outright. Free placements flow through the **normal** build path: `economy.apply({type:'gold_spent', sink:'build_palisade', amount: 0, kit:true})`, with `palisade_kit_granted` reducing to `state` (no gold delta). The sole-gold-writer law is intact — there is no parallel economy, which was the main design risk and the slice avoided it cleanly.

## Merge classification
Base `0f7f45fd`; 19 files.

| Bucket | Files | Handling |
|---|---|---|
| LANE-TOUCHED | 14 (+4 screenshots) | `git log 0f7f45fd..main -- <14>` **EMPTY** → clean copy |
| BOTH-MOVED | `src/game/Game.ts` | main moved it via `9240479c` (drill-yard) and `e49fc4e3` (telemetry) → **GRAFTED**, 5 hunks, `+13/−50` |

The graft was mandatory, not defensive: the lane's base predates both of main's Game.ts commits, so a wholesale copy would have silently reverted the drill-yard separation *and* the render-demotion telemetry — the third consecutive drain where that trap was live.

**Post-graft invariants vs main's blob:** `reportRenderDemotion` **2 = 2** · drill-yard markers **10 occurrences / 9 lines = 10 / 9** · residual ring code **0** · diff vs main is exactly the 5 intended hunks, nothing else removed.

⚠️ **Method note worth keeping:** the drill-yard check first read as **9 vs 10 — an apparent lost hunk** — purely because `grep -c` counts matching *lines* while my regex counted *occurrences*. Measured the same way on both sides, they are identical. An instrument mismatch impersonated a merge defect; re-measure before believing a scare.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 970 ms |
| Battery 1 — own spec + 5 modified specs (`--workers=1`, both projects) | 37 passed / 8 failed / 1 skipped, 5.3 m |
| Battery 1 control (clean main, the 2 red files) | 9 failed / 11 passed, 4.6 m |
| Battery 2 — 8 grep-derived unmodified adjacents | 10 failed / 117 passed / 1 skipped, 13.3 m |
| Battery 2 control (clean main, identical batch) | 10 failed / 117 passed, 13.7 m |

**Battery 1's 8 reds are NOT attributable.** They match clean main by **test name**, not line — the lane added lines, so `town-t2-naming` 166→169 and `world-info-notes` 290→293 / 319→322. Main carries one *more* (`town-t2-naming:82`), which the merged tree fixes.

⚠️ **Battery 2's two totals are identical (10/117 vs 10/117) and the underlying sets are NOT.** Taking the count as the answer would have passed this slice.

| | merged tree | clean main |
|---|---|---|
| `bt-01-tiers:205`, `bt-01-tiers:430`, `tile-identity-pass:121` (×2 each) | RED | RED — pre-existing |
| `restore-validation` → *economy log rows are validated before replay…* (×2) | **RED** | **GREEN** |
| `restore-validation:656` | RED | RED in isolation (mobile) — pre-existing |
| `restore-validation:186` (×2), `run-suspend:193`, `tile-identity-pass:71` | green | RED — main-only |

**Isolated, both projects:** merged tree **2 failed**; clean main **2 passed in 5.6 s**. Attribution proven in both directions, same arrangement.

## Findings

### F-1433-1 (BLOCKING) — the kit grant writes an economy row on runs that earned no kit
`BuildSystem.setPalisadeKitCredits()` applies a `palisade_kit_granted` event whenever the log holds no prior grant — **including when the granted amount is 0**. Its only caller in `src/game/Game.ts` — the line `if (this.runManager) this.applyMetaProgress(this.runManager.metaProgress);` — passes no options, so the branch is taken on **every boot**. A tier-0 run therefore gains one economy log row it never earned, carrying a `crypto.randomUUID()` id.

Measured on `?contract=the-claim` with **no territory progress at all**: `logLength: 2`, expected `1` (`gold: 20` and `storedLogLength: 1` both correct — only the row count is wrong).

This contradicts the slice's own master, which required "**T0 profile unchanged**". The fix is small and local (do not apply the event when the grant is 0, while keeping replay idempotence for runs that did earn one, and keeping the decoder able to read rows written by this build). Corrective authored: `tasks/f1433-1-kit-grant-no-row-at-tier-zero.md`.

### F-1433-2 (non-blocking) — `prebuiltPalisades` now has zero consumers
The contract flag's only enforcement was the `applyMetaProgress` early return this slice deletes; `grep` over `src/` now finds only its declaration (`ContractFamilies.ts:675`) and a key list (`:1518`). It was introduced by the s744 Baron slice to honour the owner's July ruling that prebuilt palisades are "a GOLD TAX via agent auto-repair". **No contract currently sets it false, so there is no live regression** — under the kit design nothing is pre-placed anywhere, which satisfies the old intent more strongly. But it is now a dead declaration that would silently do nothing if a future contract set it. Remove it or re-wire it deliberately; do not leave it as a flag that lies.

### F-1433-3 (non-blocking) — `territoryRingPresent` can still be restored true with no ring
Game.ts now only ever assigns it `false`, but `RunSuspend.ts:962` still computes it as `meta.tracks.territory >= territoryTier1` on the **legacy no-`controls` restore** path, and `:979` assigns that into the game. `Game.ts:6007` then renders `territory_ring_gap` world-info hints for a ring that no longer exists. Reachable only for saves lacking a controls block (current builds always write one), so it is narrow — stale hint markers, not a crash.

## Owner fork — OPEN, and this review does not close it
The BACKLOG row records: *"If the owner prefers plain removal over the kit, one word flips the master — that word is still UNGIVEN, and a green gate battery is not it; the drain must surface the fork, not close it."* Surfaced accordingly. The kit is built and works; whether the earned reward should survive **as a kit** or simply be **removed** remains the owner's call, and nothing in this gate speaks to it.

---

# s1435 ADDENDUM — THE HOLD IS LIFTED BY SATISFACTION. VERDICT: MERGED `af463bd9`

**Drained by:** s1435 fire, 2026-08-03, in detached worktree `gate-s1435` (§3.0b — main's working tree never held undecided content)
**Stack merged:** `lane/perf` `44eda5bd` (kit slice) + `d9235027` (f1433-1 corrective) → main `af463bd97abf7f1552f0825a2b21d5c6fd6748d2`
**`main..lane/perf` after merge: EMPTY.**

## The hold was lifted by satisfying its written condition, not by a green battery

s1433 wrote the lift condition into the goal leaf: land `f1433-1` on `lane/perf @ 44eda5bd`, then re-run
`restore-validation.spec.ts → economy log rows are validated before replay and hostile deltas are dropped`
green **both projects**. That is exactly what was measured, in that order:

| Step | Result |
|---|---|
| `f1433-1` landed on the lane | `d9235027`, runner-committed 15:45:18, done-move un-prefixed (clean run) |
| Lift-condition test, merged tree | **2/2 passed both projects, 5.2s** |
| Lift-condition test, guard removed (manufactured defect) | **2 FAILED both projects** |
| Probe reverted | blob `acea8f8ecf0cdf24f6d53d7799b348ac37929226` — **byte-identical to the lane blob** |

⚠️ **The middle row is the one that matters.** A passing test never executes its violation path, so its green
is not evidence about the red (the s1299/s1300/s1434 standard). Removing the `granted > 0` guard from
`BuildSystem.setPalisadeKitCredits` reproduced s1433's F-1433-1 exactly — so this green is load-bearing, and
the corrective is the thing carrying it.

## The cure

`BuildSystem.ts` — the `palisade_kit_granted` economy row is now applied **only when the grant is positive**.
A tier-0 run that earned no kit writes no row, restoring the `logLength` the slice master required be unchanged.
One line, plus the spec assertions that pin it (`kitGrantAmounts` → `[]` at T0, `[KIT_SIZE]` at T1, and an
explicit `economy.logLength` → `0` at T0).

## Evidence table

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, **1.04s** |
| `task-046-territory-ring-pacing.spec.ts` (own spec) | **4/4 both projects, 19.7s** |
| Lift-condition test | **2/2 both projects, 5.2s** |
| Battery A — 5 lane-modified specs | 33 passed / 8 failed / 1 skipped, 4.7m |
| Battery B — 4 economy-log + territoryRing consumers | 62 passed / 12 failed, 9.0m |

Every playwright command `--workers=1` (§3.1). No red was accepted on reasoning — each was controlled.

## Every red controlled to clean main

**Battery A's 8 reds all reproduce on clean main by test NAME**, at the pre-lane line numbers exactly as s1433
predicted the shift (`town-t2-naming` 169→166, `world-info-notes` 293→290, 322→319, `:196` unchanged).
**Main carried one MORE than the merge does** — `town-t2-naming.spec.ts:82 › fresh town naming persists…` —
so the merged tree is strictly *less* red here.

**Battery B is the instructive one, and counting would have got it wrong** (12 merged vs 10 main — different
totals *and* different sets). Set-differenced, then each difference isolated:

| Red | Verdict | How it was decided |
|---|---|---|
| `bt-01-tiers:205`, `:430` (×2 each) · `restore-validation:656` (×2) · `tile-identity-pass:121` (×2) | pre-existing | present on clean main, same names |
| `tile-identity-pass:71` desktop | **main-only** | red on main, green on the merge |
| `restore-validation:186` mobile | load artifact | **passes in isolation**; only red inside the 4-spec battery |
| `run-suspend:193` desktop | pre-existing | **reproduces in isolation on clean main** |
| `run-suspend:193` mobile | **flake, not attributable** | see below |

### The one red that looked attributable — and wasn't

`run-suspend:193` mobile passed on main (battery *and* isolated) but failed on the merge (battery *and*
isolated). Two-for-two each way is a real signal, so it was read rather than reasoned about:

```
> 277 |   expect(errors.consoleErrors).toEqual([]);
+   "THREE.GLTFLoader: Couldn't load texture blob:http://127.0.0.1:5188/d4a237c7-…"   (×3)
```

The failure is **not** an economy assertion — `economy.gold` passes two lines earlier at `:275`, and the economy
log is the only surface this slice touches. It is the console-error collector catching GLTF texture-blob load
failures, the flake class the corrective's own run log had already named. **Re-run on the same merged tree: passed
in 43.3s.** Non-deterministic, no causal path to the kit, not attributable.

## Merge classification

Base `0f7f45fd`. Of 19 changed paths, **exactly one is BOTH-MOVED**: `src/game/Game.ts`. Everything else is
LANE-TOUCHED only (main never moved them since the base — measured, not assumed).

Main's three Game.ts hunks since the base are the drill-yard practice save line, the `reportRenderDemotion`
import, and its call site. The `ort` 3-way merge auto-resolved; the graft was then **verified by invariant count
against main**, because this is the fourth consecutive lane-d drain to hit this trap:

| Invariant | merged | main |
|---|---|---|
| `reportRenderDemotion` | 2 | 2 |
| `Practice resets when you leave.` | 1 | 1 |
| `activeContract.practice` | 16 | 16 |
| `runtime-tier-shed-` | 1 | 1 |

`setPalisadeKitCredits`: **1 in the merged tree, 0 on main** — confirming s1434's dispatch hazard was real and
that the corrective's subject genuinely existed only on the lane.

## ⚖️ THE OWNER FORK IS STILL OPEN AND THIS DRAIN DID NOT TOUCH IT

The kit is now **built, gated and shipped**. Whether the earned Territory I reward should survive **as a kit** or
simply be **removed** remains the owner's call. The BACKLOG row's word is still ungiven, and a green battery is
not it. Merging the implementation does not choose; it only means the implementation works.

## Findings carried forward from s1433 — still open, still non-blocking

**F-1433-2** (`prebuiltPalisades` now has zero consumers — a flag that would silently lie) and **F-1433-3**
(`territoryRingPresent` can still restore true with no ring, via the legacy no-`controls` path) both shipped
unchanged in this merge. Neither is a live regression; both remain owed cleanups.
