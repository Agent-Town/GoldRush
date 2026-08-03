# lane-territory-ring-to-kit — the territory reward frees its feet (F-BW-6)

**Slice:** `lane-territory-ring-to-kit` · **branch:** `lane/perf` · **tip:** `44eda5bd` · **base:** `0f7f45fdea8f9fee0424750ec60af6af521c4bda`
**Gated by:** s1433 fire, 2026-08-03, in detached worktree `gate-s1433` (§3.0b — main's working tree never held this content)

## VERDICT: HOLD — NOT MERGED. One attributable regression (F-1433-1), precisely located and cheap to fix.

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
| `restore-validation:86` (×2) | **RED** | **GREEN** |
| `restore-validation:656` | RED | RED in isolation (mobile) — pre-existing |
| `restore-validation:186` (×2), `run-suspend:193`, `tile-identity-pass:71` | green | RED — main-only |

**Isolated, both projects:** merged tree **2 failed**; clean main **2 passed in 5.6 s**. Attribution proven in both directions, same arrangement.

## Findings

### F-1433-1 (BLOCKING) — the kit grant writes an economy row on runs that earned no kit
`BuildSystem.setPalisadeKitCredits()` applies a `palisade_kit_granted` event whenever the log holds no prior grant — **including when the granted amount is 0**. Its only caller, `src/game/Game.ts:6229`, passes no options, so the branch is taken on **every boot**. A tier-0 run therefore gains one economy log row it never earned, carrying a `crypto.randomUUID()` id.

Measured on `?contract=the-claim` with **no territory progress at all**: `logLength: 2`, expected `1` (`gold: 20` and `storedLogLength: 1` both correct — only the row count is wrong).

This contradicts the slice's own master, which required "**T0 profile unchanged**". The fix is small and local (do not apply the event when the grant is 0, while keeping replay idempotence for runs that did earn one, and keeping the decoder able to read rows written by this build). Corrective authored: `tasks/f1433-1-kit-grant-no-row-at-tier-zero.md`.

### F-1433-2 (non-blocking) — `prebuiltPalisades` now has zero consumers
The contract flag's only enforcement was the `applyMetaProgress` early return this slice deletes; `grep` over `src/` now finds only its declaration (`ContractFamilies.ts:675`) and a key list (`:1518`). It was introduced by the s744 Baron slice to honour the owner's July ruling that prebuilt palisades are "a GOLD TAX via agent auto-repair". **No contract currently sets it false, so there is no live regression** — under the kit design nothing is pre-placed anywhere, which satisfies the old intent more strongly. But it is now a dead declaration that would silently do nothing if a future contract set it. Remove it or re-wire it deliberately; do not leave it as a flag that lies.

### F-1433-3 (non-blocking) — `territoryRingPresent` can still be restored true with no ring
Game.ts now only ever assigns it `false`, but `RunSuspend.ts:962` still computes it as `meta.tracks.territory >= territoryTier1` on the **legacy no-`controls` restore** path, and `:979` assigns that into the game. `Game.ts:6007` then renders `territory_ring_gap` world-info hints for a ring that no longer exists. Reachable only for saves lacking a controls block (current builds always write one), so it is narrow — stale hint markers, not a crash.

## Owner fork — OPEN, and this review does not close it
The BACKLOG row records: *"If the owner prefers plain removal over the kit, one word flips the master — that word is still UNGIVEN, and a green gate battery is not it; the drain must surface the fork, not close it."* Surfaced accordingly. The kit is built and works; whether the earned reward should survive **as a kit** or simply be **removed** remains the owner's call, and nothing in this gate speaks to it.
