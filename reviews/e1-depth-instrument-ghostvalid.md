# Review — E1 depth instrument: `ghostValid` build defect

**Slice:** `DRAFT-e1-depth-instrument-ghostvalid.md` (done-move `20260726-064537`)
**Source:** `save/lane-m3-2d0739f5` (`runner(lane-a)`, 2026-07-26T07:24:20+07:00), lane `lane/m3`
**Merged to main:** `fa645b6c` (s1069 fire, 2026-07-26)
**Verdict:** ✅ **MERGE — all four of the master's HOW-TO-VERIFY criteria met, and the causal hunk isolated by a mutation control.**

## What it does

`rehearsal/segments/e1-depth-play.mjs` is the honest-play instrument for the E1 depth
review: it boots a fresh profile, pans real gold, takes real upgrades and builds with
real pointer aiming. It could not build — the review recorded **0/49 attempts** — which
left four of five E1 maps unplayed and their difficulty/pacing findings unsayable.

Three hunks, one file:

1. **The projection fix (the cause).** `screenFor()` asked the engine where a world
   point sits on screen. The engine's signature is `screenPoint(x, z, y = 0.8)`
   (`src/game/Game.ts:1667`, typed `src/vite-env.d.ts:1026`). Main tried the shapes
   `[[wx, 0, wz], [wx, wz]]` **in that order** — so the first call passed `0` as *z*
   and the world-z as *y*. That returns **finite but meaningless** coordinates, the
   `Number.isFinite` guard passes, and the function returns immediately: **the correct
   second shape was never reached.** Every aim was at the wrong world point, so the
   build ghost never landed on legal ground.
2. **Defence-banking.** Economy builds (`sluice`, then anything) gate behind a real
   turret or beacon existing.
3. **End-state `build:{turrets,beacons}`.** The master's own verify criterion #2 — main
   could not answer it because the field did not exist in the end-state payload.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean**, no output |
| `npm run build` | **green**, `✓ built in 1.47s` |
| the-claim, timescale 1, budget 8 | **SECURED at wave 10**, `secureWaveReached: 10`, hp 109/125, 304s wall, fps~120 |
| builds | **76 attempted / 3 succeeded**; gold visibly debited `25→0`, `15→5`, `15→10` |
| end-state counters | `"build":{"turrets":0,"beacons":1}` — criterion #2 met (sum > 0) |
| console / page errors | **0 / 0** |
| screenshots | `reviews/shots-e1-depth/s1069-t1-*.png` (7), `s1069-control-*.png` (7), `s1069-graft-*.png` (5) |

**Master's HOW TO VERIFY, item by item:** (1) builds succeeded > 0 → **3** ✅ ·
(2) `build.turrets + build.beacons > 0` → **1** ✅ · (3) reaches `secured` at wave 10 on
the Claim → **yes, `secured`** ✅ · (4) zero console/page errors → **0/0** ✅.

### Mutation control — the causal hunk isolated

Hunk ① alone reverted, same map, same params, same timescale, everything else identical:

| | attempted | succeeded | `build` counters | level | kills | upgrades | gold panned |
|---|---|---|---|---|---|---|---|
| **control** (① reverted) | 0 | 0 | `{0,0}` | 1 | 1 | 0 | 20 |
| **grafted** | 76 | **3** | `{0,**1**}` | 3 | **47** | 2 | 60 |

The projection fix is the sole cause. It also improves *seam* aiming (60 gold panned
vs 20) — panning uses the same world→screen path.

## Merge classification

- **Base:** the lane branched at `2d0739f5^`, which predates the instrument's creation
  on main (`b702ebf5`, 2026-07-25T23:52) — an 11.5h-stale base (F-1067-3).
- **File:** `rehearsal/segments/e1-depth-play.mjs` — **the lane's content is main-current
  plus exactly these three hunks**: `git diff main 2d0739f5 -- <file>` = 5 insertions /
  8 deletions, read in full before grafting. So a path-scoped graft reproduces main's
  430-line file plus the intended hunks and nothing else.
- **Method:** hunks applied by hand to main's file, then proved byte-identical to the
  lane's version — `git diff save/lane-m3-2d0739f5 -- <file>` **empty**. No 3-way needed.
- **F-1067-2's wholesale-merge hazard does not apply here:** `git diff main
  save/lane-m3-2d0739f5 -- src/` is **empty** — this branch touches no engine code at
  all, so nothing of attended's `y`/`inView` threading was ever at risk from a
  path-scoped graft. (A *wholesale* merge would still have been wrong: the branch is
  685 files / −90,417 lines behind main.)
- Zero `src/`, zero assets, zero Balance, zero contracts — exactly its TOUCH-ONLY.

## Findings

**F-1069-1 — "Secured at wave 10" does not prove honest play; the master's criterion #3
is necessary but NOT sufficient.** The control run also **SECURED at wave 10** — while
building nothing, taking no upgrade, reaching level 1 and killing **one** enemy. The
Claim can be passively survived by standing still. Anyone using this instrument as an
acceptance gate must read criteria #1/#2 (builds succeeded, build counters) and the
depth signals (kills, level, upgrades) — outcome alone will pass a driver that does
nothing. Non-blocking for this merge; it *strengthens* the verdict, since the graft is
credited only on the discriminating numbers.

**F-1069-2 — hunk ② can deadlock the driver on a gold-starved map.** `anyBuild = turret
?? (hasDefence ? sluice ?? affordable[0] : null)` means that with **no** defence yet
built, `anyBuild` is `null` even when an affordable 10-gold `palisade` is in hand. In
the control that is exactly what produced **0 attempted** (gold stalled at 20, below the
25-gold beacon, so defence was unaffordable and every other build was gated off). On the
grafted run panning reached 25 and the bootstrap cleared. On any map/difficulty where
early gold is scarcer this gate will silently zero the build loop. Recommend a fallback:
allow the cheapest build when `affordable.length && !hasDefence` and gold cannot reach
the cheapest defence. Non-blocking (the instrument is a test rig, not shipped code) —
logged for the E1 depth review's next leg.

**F-1069-3 — build success rate is 3/76 (~4%).** `build palisade FAILED: no legal ghost
spot found in 10 nudges` recurs. The map is now playable end-to-end, which unblocks the
review, but the aiming is still coarse — the remaining rejections are placement-legality,
not projection. Worth a probe before the remaining four maps are read for pacing.

**F-1069-4 (observation, low) — `contract.secureWave` reads `null` at boot** for
`the-claim` in the diagnostics line, while the briefing states wave 10 and the end-state
reports `secureWaveReached: 10`. The field appears to populate late. Adjacent to
s1068's F-1068-1 secure-wave work; noted, not investigated.
