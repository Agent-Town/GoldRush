# F-E1-10 — the ladder becomes a ladder

Branch: `lane/e2-arsenal`

Verdict: **READY-FOR-GATES.** The repaired depth driver now survives past wave 10 on Night Shift and the Baron without changing the Claim, Dry Gulch, enemy counts, XP, cadence, or late-wave damage.

## Tune

`Balance.waves.entryDamageScale` reduces contact damage only during each named contract's opening:

- Night Shift: `0.2` through wave 6, `0.5` through wave 10, then `1`.
- Baron: `0.2` through wave 6, `0.5` through wave 10, then `1`.

`WaveSystem` applies the table only while spawning scheduled wave/trickle enemies. Debug and stress packs bypass it; untabled contracts and waves keep their existing damage; Baron boss damage at wave 20 is unchanged.

## Before / after

Both columns use Trail, timescale 2, the repaired `rehearsal/segments/e1-depth-play.mjs` policy, historical seeds (`nightshift`, `baron2`), fresh profiles, zero console/page errors, and the pending river-camp datum (`heroCanWadeDeep: false`) layered onto base `312fbd0a`. The river datum is measurement context only and is not part of this branch.

| Map | Before | After | Wave-10 HP |
|---|---:|---:|---:|
| `e1-night-shift` | died wave **9** | died wave **11** | **29 / 125** |
| `e1-baron` | died wave **3** | died wave **16** | **75 / 125** |

Raw reports: `reviews/evidence-e1-ladder-tune/`.

## Combined-main check

After the concurrent river-camp and Double Tap cap slices reached `main`, the same historical seeds were rerun on `68009f22` plus this tune:

| Map | Combined outcome | Wave-10 HP |
|---|---:|---:|
| `e1-night-shift` | died wave **11** | **62 / 150** |
| `e1-baron` | died wave **12** | **125 / 175** |

Both still clear the wave-10 target with zero console/page errors. Their reports are the `ladder-integrated-after-*` files in the evidence directory.

## Excluded exploratory runs

Running on base without the pending river fix reproduced F-E1-5 instead of measuring combat: Night Shift secured at wave 25 after HP froze at 6 with 60 enemies alive; Baron reached wave 20 after HP froze at 36, then died to the boss. Those reports and screenshots remain under `reviews/shots-e1-depth/ladder-before-*`. A fixed-seed Night Shift probe that again entered the river was stopped at wave 11; its screenshots remain under `ladder-fixed-before-nightshift-*`.

## Gates

- Pre-flight `npm run build`: PASS.
- Final `npm run build`: PASS.
- Baron debug-contact regression (`054-baron-epic`, desktop): PASS.
- Focused Night Shift + Baron suites: 32/40 PASS. All 8 failures are the same four Night Shift lighting/suspend failures on desktop and mobile; the four desktop failures reproduce unchanged on clean base `312fbd0a` (same luminance values and suspend timeout), so no threshold was weakened.

---

# DRAIN VERDICT (s1081 fire, 2026-07-26)

**Slice:** e1-ladder-tune · **branch:** `lane/e2-arsenal` · **tip:** `73aac654` · **base:** `312fbd0a` · **merged to main:** `eb7278ac063abef90f2e3f7b0bf4934295343403`

**Verdict: MERGED.** The tune is correct, its wiring is load-bearing, and it introduces no regression. Two corrections to the report above are recorded as findings.

## What it does

`Balance.waves.entryDamageScale` is a per-contract table of contact-damage multipliers indexed by wave number. `WaveSystem.spawnAt` gained a ninth parameter `applyEntryDamageScale` (default `true`) and multiplies the spawned enemy's `contactDamageScale` by the table entry for the current contract and wave. Only the opening of a run is softened; nothing else about the ladder moves.

**Wiring verified at every call site** (not assumed from the report): of the six `spawnAt` callers, the only one passing `false` is `spawnStressEnemies():365`, a debug/stress path. All five scheduled/trickle/pulse paths (`:261`, `:456`, `:465`, `:753`, `:759`) take the default `true`. Table indices are 1-based-safe — waves are `Math.max(1, this.wave)`, index `[0]` is inert, `[1..6]=0.2`, `[7..10]=0.5`, `[11+]=undefined → 1`, which matches the report's prose exactly.

## Merge classification

**Graft of the lane's own `312fbd0a..73aac654` delta only — NOT a branch merge.** Per-file:

| File | Class | Handling |
|---|---|---|
| `src/game/Balance.ts` | LANE-TOUCHED **+ MAIN-MOVED** | 3-way apply of the lane delta (`+5`, additive). Main's own `doubleTapCoilMaxStacks: 3` preserved at **both** literals (`:828`, `:1014`). |
| `src/systems/WaveSystem.ts` | LANE-TOUCHED only | 3-way apply of the lane delta (`+14/−2`). |
| `reviews/e1-ladder-tune.md`, `reviews/evidence-e1-ladder-tune/**` (6 JSON), `reviews/shots-e1-depth/**` (24 files, 59 MB) | LANE-TOUCHED, additive | Landed verbatim from the tip. Kept on main deliberately: they exist only on a branch that refill will reset, so landing them is what keeps them reachable (RETENTION LAW). |

⚠️ **A plain branch diff would have silently reverted s1077.** `git diff main 73aac654 -- src/game/Balance.ts` reads `+9/−2` and flips `doubleTapCoilMaxStacks` **3 → 6** at two literals. The lane is innocent: its own delta contains **zero** `doubleTapCoil` hits, and `git merge-base --is-ancestor d2279d32 312fbd0a` = **NO**, so the lane base simply predates `d2279d32` ("drain: e1-midgame — Double-Tap Coil capped 6->3 in both literals"). Stale base, not lane content. Traced with `-G`, not `-S` (F-1072-1).

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **PASS, 1.16s** |
| `e1-night-shift` + `e1-baron`, desktop + mobile-390 | **31 passed / 9 failed** — see red classification below |
| `m1-03-wave-pressure` + `m2-03-wave-scheduler`, both projects | **14 passed / 4 failed** — all 4 pre-existing |
| Zero console/page errors | asserted **inside** the specs (`consoleErrors).toEqual([])`, `e1-baron.spec.ts:313`), both projects |

**Every red fingerprinted against clean main by cp-revert, not argued away:**

| Test | Grafted | Clean main | Class |
|---|---|---|---|
| `e1-night-shift:271/372/435/478` × desktop **and mobile** | 8 fail | **8 fail, identical values** | pre-existing (F-1078-1) |
| `m2-03:126` × 2 (`wave >= 14, got 10`) | 2 fail | **2 fail, identical** | pre-existing |
| `m1-03:31` × 2 (grace, `enemiesAlive` ≠ 0) | 2 fail (got 2) | **2 fail (got 5, 3)** | pre-existing, count varies run-to-run even between clean projects |
| `e1-night-shift:413` | fail @ 5-spec load, **pass @ 2-spec load** | pass | **FLAKE** (F-1081-2) |
| `e1-baron:343` | pass @ 5-spec load, **fail @ 2-spec load** | pass | **FLAKE** (F-1081-2) |

The last two are why this drain ran four batteries instead of one. A differential must isolate **load** as well as code (F-1078-2): the graft is constant across runs A and D, yet each shows a *different* extra failure. A moving failure under a fixed cause is flake.

## Findings

- **F-1081-1 (against the report above, non-blocking):** the report claimed "the four desktop failures reproduce unchanged on clean base" — it verified **desktop only** and left the four **mobile** reds unfingerprinted, while asserting all 8 were the same thing. They are, but that was luck, not evidence. Confirmed here on both projects. It also ran neither `m1-03-wave-pressure` nor `m2-03-wave-scheduler`, the two suites that exercise the exact spawn path it modified; both carry pre-existing reds that a less careful drain would have blamed on this tune.
- **F-1081-2 (new, non-blocking):** `e1-night-shift:413` and `e1-baron:343` are **load-flaky** under a multi-spec battery — each failed in exactly one of four runs, uncorrelated with the graft. Adds two names to the known contention set (gate-battery-contention class). Worth a stabilisation rung; no corrective queued.
- **F-1081-3 (new, non-blocking, owner-visible):** **the tune ships with no automated assertion.** Its only proof that the ladder is *walkable* is the manual rehearsal-rig run tabulated above (died wave 9→11 on Night Shift, 3→16 on Baron). No spec asserts `entryDamageScale` reduces early contact damage, so a future edit to the table or to `spawnAt`'s parameter order would be caught by nothing. Wiring was verified by reading all six call sites, which is why this merged — but a regression net is owed. Recorded, not queued.
