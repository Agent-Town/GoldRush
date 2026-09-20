# Gold Rush performance survey — 2026-09-05

**Slice** perf-optimization-survey · **branch** `lane/b` · **base** `44efbf3d6` · **salvage tip** `afc37ce35`
**Verdict — SURVEY COMPLETE WITH NAMED GAPS.** No game code changed. 40 of 42 board contracts plus
the town measured structurally; three E10 contracts cannot be launched at all (F-PERF-11) and one of
them, `e10-last-claim`, measured fine. **Every frame-timing number taken during the census is
untrustworthy and is labelled as such** — the host carried three other implementers all evening and
the 1-minute load moved between 3.3 and 114.0 (F-PERF-1). Structural counts — draw calls, triangles,
instance slots, textures, GPU bytes, wire bytes, heap after forced GC — are load independent, were
re-taken under widely different load, and are what this survey ranks on.

**A late quiet window let one trustworthy frame baseline be taken, and it changes the shape of the
answer (§1b).** Held below 1-minute load 12, median of three, nine arms across five maps — including
the 210-draw-call `e9-seed-run` under stress and the 156,240-triangle `e1-night-shift` — **all deliver
119–120 fps with 0.9–1.3 ms of render-submit CPU and 0–1 frames over 16.7 ms per 10 seconds.** On an
M4 Max at 1280×800 the renderer has roughly an order of magnitude of headroom against a 60 Hz budget.
**So this survey does not report a desktop frame problem, and none of the render-side rungs below
claims one.** They are headroom, GPU-memory and low-end-device arguments. The costs that *are* large
today are the sim (F-PERF-8: 59% of a replay in one clone), delivery (F-PERF-9/10) and resident
texture memory (F-PERF-5).

Two premises in the master were wrong and are corrected here: the board holds **42** contracts, not
36 (§0), and the sculpted terrains are **128×128 grids of 32,768 triangles**, so the "what would a
64-grid cost" question is a 4× reduction, not a 2× one (§6).

**The ranked answer is §10 (top ten) and §11 (the ladder).** Sections 0–9 are the evidence.

Instruments: `scripts/perf-survey/*.mjs`. Evidence: `artifacts/perf-survey/**` (126 MB, largest file
4.5 MB, no screenshots, no traces). `node scripts/perf-survey/validate.mjs` re-derives every
published quantile from the raw per-frame samples and **passes on all 227 rows**.

---

## 0. What the board actually contains — the missing six

`listBoardContracts()` returns **42** contracts, not the master's 36. Measured by
`node scripts/perf-survey/inventory.mjs` → `artifacts/perf-survey/inventory.json`.

The shape is epoch 1 with six contracts and epochs 2–10 with four each (6 + 9×4 = 42). The six that
the older count missed are the six whose `tileParams.render.terrainMesh` is **`off`** — the four
Deepwater boards (`e5-deepwater-claim`, `e5-regatta`, `e5-stillwater`, `e5-flotilla`) and two Deepsky
ones (`e10-last-claim`, `e10-river`). That is consistent with the master's own terrain arithmetic
surviving intact: **9 `required` + 20 `preferred` = 29 terrain-using maps**, exactly the "29 of 36"
it quoted, against a denominator that has since grown to 42. `e10-river` first appears in
`ContractFamilies.ts` on 2026-08-02 and `e10-last-claim` on 2026-07-22, both after the 36 figure was
written.

⚠️ `off` does **not** mean "no sculpted terrain". `e5-regatta` boots with `RegattaTerrain` **visible
at 32,768 triangles** and demand-fetches its 1.44 MB terrain GLB. The flag disables the *continuous
ground mesh* (`terrain.ground.enabled: false, mode: "fallback"` in its diagnostics), not the sculpt.

---

## 1. The measurement law this survey had to adopt (F-PERF-1)

The host is shared. `os.loadavg()` was recorded before and after every single sample.

| load band (1-min) | rows | delivered fps p50 | renderMs p95 p50 |
|---|---|---|---|
| 0–12 | 45 | 110 | 1.60 |
| 12–30 | 114 | 103 | 1.40 |
| 30–60 | 34 | 117 | 1.40 |
| 60–200 | 22 | 118 | 1.50 |

**170 of 215 measured rows were taken above 1-minute load 12.** The bands are not even monotonic,
which is itself the finding: two different confounds are in play and neither can be separated
tonight.

- `frameMs` **p50 is 8.3 ms in nearly every row** — that is the headless rAF pace (120 Hz), not the
  game's cost. The only frame-supply signal that carries information is the **delivered frame count**
  in the fixed 10 s window, and `renderMs` (the wrapped `renderer.render` CPU submit time).
- Identical arms disagree wildly with load: `the-claim` full/desktop/wave1 delivered 799 frames at
  load 25.0 with renderMs p95 6.4 ms, while `e6-showroom` full/desktop/stress delivered 1200 frames
  at load 3.3 with renderMs p95 1.1 ms. Those two numbers cannot be compared.

**Consequence for the ladder:** no fix below is justified by a frame number, and no gate below is a
frame number taken tonight. Every gate is either structural or must be re-taken on a quiet host.

### F-PERF-2 — The survey's own boot seam costs ~6% of main-thread CPU, and the player never pays it

`node scripts/perf-survey/debugcost.mjs` → `artifacts/perf-survey/debugcost.json`. Same map, same
browser, 6 s CDP CPU profile, `?debug&profile` vs a plain boot:

| map | arm | `get clientWidth`/`clientHeight` self | `updateMatrixWorld` self | frames in 5 s |
|---|---|---|---|---|
| the-claim | debug+profile | **322 ms** | 214 ms | 601 |
| the-claim | plain | **0 ms** | 253 ms | 600 |
| e9-seed-run | debug+profile | **353 ms** | 334 ms | 600 |
| e9-seed-run | plain | **0 ms** | 260 ms | 600 |

The forced-layout read is `Game.ts:5659`, inside the diagnostics object that `publishDiagnostics()`
builds — a `?debug`-only path. It is **not a player cost** and is deliberately kept out of the
ladder. It *is* a real cost for everything that boots with `?debug`: the e2e gate battery and the
county replay verifier. `updateMatrixWorld` at 214–334 ms per 6 s appears in **both** arms and is
real player cost (§2).

---

## 1b. The one trustworthy frame baseline (quiet host, median of three)

`node scripts/perf-survey/quiet.mjs` → `artifacts/perf-survey/quiet.json`. This instrument *enforces*
the measurement law rather than recording it: `os.loadavg()` before and after each sample, any sample
whose peak 1-minute load exceeds the ceiling **discarded and retaken**, the figure reported as the
**median of three surviving samples**, and a map that cannot yield three clean samples reported as
`insufficient-clean-samples` rather than estimated. Ceiling 12, up to 6 attempts per arm, full tier,
1280×800, DPR 1.

| arm (full/desktop) | delivered fps | renderMs p95 | frames > 16.7 ms per 10 s | draw calls p95 | triangles p95 | peak load | kept / discarded |
|---|---|---|---|---|---|---|---|
| the-claim wave 1 | 120 | 1.20 | 0 | 86 | 110,330 | 10.9 | 3 / 3 |
| the-claim stress | 120 | 1.10 | 0 | 172 | 112,888 | 10.6 | 3 / 0 |
| e9-seed-run wave 1 | 120 | 1.20 | 1 | 128 | 102,740 | 10.5 | 3 / 0 |
| **e9-seed-run stress** (the 210-call map) | **119** | **1.30** | **1** | 210 | 103,022 | 9.2 | 3 / 0 |
| e2-hill-mine wave 1 | 120 | 1.10 | 0 | 87 | 116,722 | 10.5 | 3 / 3 |
| e2-hill-mine stress | 120 | 1.10 | 0 | 156 | 116,560 | 9.5 | 3 / 0 |
| **e1-night-shift wave 1** (the 156k-triangle map) | 120 | 1.10 | 0 | 86 | **156,240** | 12.0 | 3 / 3 |
| e4-long-road wave 1 | 120 | 1.00 | 1 | 63 | 98,194 | 10.3 | 3 / 0 |
| e4-long-road stress | 120 | 0.90 | 0 | 80 | 100,640 | 9.6 | 3 / 0 |
| town | — | — | — | — | — | — | 0 / 6 — **insufficient clean samples** |
| e1-night-shift stress | — | — | — | — | — | — | 1 / 5 — **insufficient clean samples** |

Sample-to-sample spread within each arm is negligible: delivered fps 119.3–120.0, renderMs p95 varies
by at most 0.10 ms. Two arms are reported as failures rather than filled in with a dirty number.

**Read it carefully.** 120 fps is the headless rAF ceiling, so this says *the renderer never misses
the pace*, not *the renderer runs at 120*. The load-independent statement is the second column:
**render submit costs 0.9–1.3 ms of CPU per frame at every arm measured**, against a 16.7 ms frame at
60 Hz. Triangle count varies by 60% across these arms and draw calls by 3.3×, and neither moves the
number — the desktop GPU is nowhere near saturated.

**What this does *not* say:** nothing about phones, nothing about the `lite` tier's real trigger path,
nothing about GPU memory pressure (§2, F-PERF-5), and nothing about a device where 215 MB of resident
texture actually matters. It removes "the desktop frame is slow" from the ranking; it does not remove
the structural findings, which are about what happens on the devices this box cannot imitate.

---

## 2. Per-map render census (scope 1)

`node scripts/perf-survey/run.mjs --all --resume [--tier T --viewport V]` →
`artifacts/perf-survey/census.json` (schema `scripts/perf-survey/census.schema.json`),
per-arm scene walks in `scenes/`, raw per-frame rows in `samples/`.

**227 rows over 43 targets; 215 measured, 12 failed (all three unlaunchable E10 contracts, F-PERF-11).
Zero console errors, zero page errors, zero failed requests across all 215 measured rows.**
Reproduce one row: `node scripts/perf-survey/run.mjs --map the-claim`.

Arms per map: full/desktop and lite/mobile at wave 1 and under `?stress=120&timescale=3`, 1280×800
and 390×844, DPR 1, fresh browser context per row so no stored tier verdict leaks. Wave 1 is entered
through the existing `__GR_TEST__.startWaveForTest(1)` seam because `nowaves` alone leaves the wave
at zero (that first calibration is retained separately in `calibration-wave0.json`).

Columns marked structural are load independent. `fps delivered` and `renderMs p95` are **under load**
and are printed only with the load they were taken at.

| map | ep | terrain | model MB | calls w1 | calls stress | calls lite/mob | tris stress | unculled tris | unculled % | inst slots | uniq tex | GPU tex MB | sprites | heap MB p95 | fps delivered | renderMs p95 | load |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| e1-baron | e1 | default | 2.03 | 83 | 168 | 158 | 115068 | 73796 | 65% | 2286 | 51 | 138 | 101 | 62 | 119 | 1.4 | 58 |
| e1-drill-yard | e1 | default | 0.00 | 89 | 169 | 160 | 84202 | 65080 | 78% | 2288 | 50 | 89 | 102 | 46 | 117 | 1.5 | 56 |
| e1-dry-gulch | e1 | required | 3.25 | 90 | 153 | 136 | 113028 | 71922 | 64% | 2098 | 49 | 161 | 102 | 54 | 120 | 1.3 | 15 |
| e1-night-shift | e1 | default | 1.46 | 86 | 171 | 159 | 158796 | 75764 | 64% | 2368 | 49 | 148 | 103 | 50 | 118 | 1.5 | 50 |
| e1-twin-banks | e1 | default | 2.92 | 80 | 150 | 126 | 130820 | 75128 | 57% | 2385 | 55 | 139 | 102 | 53 | 118 | 1.5 | 55 |
| e10-last-claim | e10 | off | 0.00 | 84 | 154 | 147 | 110036 | 65636 | 60% | 2294 | 44 | 110 | 102 | 49 | 48 | 2.0 | 20 |
| e2-hill-mine | e2 | required | 2.40 | 87 | 159 | 110 | 116566 | 78753 | 67% | 2789 | 56 | 213 | 102 | 61 | 118 | 1.6 | 74 |
| e2-incline | e2 | required | 2.46 | 78 | 146 | 123 | 106336 | 72051 | 63% | 2707 | 57 | 183 | 103 | 54 | 120 | 1.2 | 28 |
| e2-pressure-garden | e2 | required | 2.21 | 92 | 171 | 151 | 103196 | 65163 | 60% | 2103 | 55 | 193 | 102 | 53 | 120 | 1.3 | 39 |
| e2-trestle | e2 | required | 2.36 | 84 | 161 | 147 | 114312 | 75517 | 65% | 2552 | 53 | 175 | 101 | 53 | 120 | 1.4 | 54 |
| e3-blackout-ridge | e3 | required | 2.54 | 83 | 128 | 105 | 141540 | 69592 | 63% | 2257 | 46 | 140 | 102 | 64 | 118 | 1.2 | 21 |
| e3-canyon-works | e3 | required | 2.90 | 74 | 146 | 144 | 150238 | 81308 | 65% | 3498 | 49 | 165 | 101 | 65 | 119 | 1.5 | 97 |
| e3-fairground | e3 | default | 2.55 | 85 | 153 | 147 | 134330 | 64424 | 59% | 2010 | 47 | 166 | 102 | 53 | 120 | 1.1 | 16 |
| e3-moth-season | e3 | default | 2.66 | 75 | 100 | 90 | 133940 | 64922 | 61% | 2303 | 48 | 162 | 30 | 53 | 120 | 1.1 | 18 |
| e4-boneyard | e4 | preferred | 4.23 | 65 | 151 | 153 | 99192 | 64806 | 61% | 2023 | 46 | 160 | 102 | 56 | 103 | 3.4 | 15 |
| e4-dust-flats | e4 | preferred | 3.03 | 80 | 165 | 155 | 99734 | 64150 | 60% | 2007 | 46 | 160 | 102 | 54 | 109 | 3.0 | 9 |
| e4-gusher-county | e4 | preferred | 4.63 | 76 | 162 | 157 | 102208 | 64580 | 61% | 2012 | 48 | 170 | 103 | 57 | 108 | 2.9 | 21 |
| e4-long-road | e4 | preferred | 3.07 | 63 | 80 | 82 | 100640 | 63888 | 59% | 1998 | 46 | 152 | 102 | 54 | 120 | 1.0 | 6 |
| e5-deepwater-claim | e5 | off | 2.23 | 77 | 154 | 159 | 102342 | 67924 | 50% | 2286 | 47 | 180 | 106 | 74 | 119 | 1.2 | 14 |
| e5-flotilla | e5 | off | 2.23 | 78 | 107 | 100 | 103016 | 67924 | 66% | 2286 | 45 | 156 | 101 | 75 | 115 | 1.3 | 16 |
| e5-regatta | e5 | off | 3.47 | 73 | 152 | 159 | 104072 | 67924 | 60% | 2286 | 47 | 163 | 102 | 77 | 119 | 1.1 | 14 |
| e5-stillwater | e5 | off | 2.23 | 69 | 154 | 160 | 102342 | 67924 | 67% | 2286 | 46 | 159 | 102 | 49 | 119 | 1.3 | 13 |
| e6-glow-mesa | e6 | preferred | 3.30 | 70 | 139 | 137 | 100874 | 65316 | 61% | 2194 | 47 | 148 | 102 | 54 | 120 | 1.0 | 5 |
| e6-half-life-hollow | e6 | required | 3.18 | 75 | 170 | 162 | 100778 | 65508 | 63% | 2194 | 46 | 145 | 101 | 54 | 115 | 1.8 | 8 |
| e6-picnic | e6 | preferred | 3.30 | 89 | 132 | 94 | 101268 | 65316 | 61% | 2194 | 46 | 146 | 102 | 53 | 46 | 7.0 | 8 |
| e6-showroom | e6 | required | 3.33 | 76 | 169 | 160 | 100806 | 65508 | 64% | 2194 | 47 | 148 | 102 | 57 | 120 | 1.1 | 3 |
| e7-dead-band | e7 | preferred | 2.97 | 79 | 163 | 156 | 102330 | 66373 | 62% | 2202 | 48 | 179 | 102 | 53 | 100 | 4.5 | 16 |
| e7-echo-canyon | e7 | preferred | 2.68 | 79 | 159 | 152 | 102806 | 66352 | 62% | 2202 | 49 | 199 | 101 | 52 | 118 | 1.5 | 21 |
| e7-relay-rush | e7 | preferred | 2.97 | 70 | 146 | 141 | 101382 | 66373 | 62% | 2202 | 50 | 206 | 102 | 53 | 117 | 1.7 | 18 |
| e7-relay-valley | e7 | preferred | 2.97 | 79 | 163 | 156 | 102332 | 65904 | 62% | 2194 | 51 | 215 | 103 | 53 | 112 | 2.9 | 11 |
| e8-eclipse | e8 | preferred | 1.78 | 80 | 164 | 157 | 104868 | 68716 | 64% | 2400 | 49 | 186 | 102 | 51 | 119 | 1.3 | 17 |
| e8-far-side | e8 | preferred | 1.78 | 64 | 148 | 134 | 100578 | 66361 | 63% | 2202 | 46 | 162 | 101 | 50 | 118 | 1.4 | 22 |
| e8-low-orbit | e8 | preferred | 1.82 | 79 | 162 | 155 | 103632 | 65508 | 62% | 2194 | 47 | 165 | 102 | 50 | 119 | 1.2 | 20 |
| e8-mare-claim | e8 | preferred | 1.78 | 80 | 164 | 157 | 104868 | 68268 | 64% | 2392 | 48 | 183 | 102 | 50 | 118 | 1.5 | 23 |
| e9-devils-alley | e9 | preferred | 2.70 | 90 | 169 | 160 | 102832 | 66468 | 63% | 2206 | 48 | 180 | 102 | 52 | 115 | 2.6 | 39 |
| e9-dome-basin | e9 | preferred | 2.80 | 98 | 171 | 158 | 107110 | 69888 | 65% | 2491 | 48 | 195 | 103 | 52 | 118 | 1.5 | 69 |
| e9-old-canal | e9 | preferred | 2.69 | 93 | 171 | 156 | 103358 | 66020 | 63% | 2198 | 49 | 197 | 102 | 52 | 119 | 1.4 | 16 |
| e9-seed-run | e9 | preferred | 2.80 | 128 | 210 | 174 | 103022 | 66468 | 63% | 2206 | 49 | 194 | 102 | 54 | 102 | 4.2 | 27 |
| the-claim | e1 | default | 2.51 | 86 | 172 | 158 | 112888 | 73961 | 66% | 2290 | 51 | 167 | 103 | 52 | 76 | 5.2 | 22 |
| town | town | — | 0.00 | 51 | 51 | 41 | 87726 | 1656 | 3% | 212 | 25 | 98 | 11 | 30 | 120 | 3.1 | 59 |

Across the 40 measured targets, structurally:

| quantity | min | median | max |
|---|---|---|---|
| draw calls p95 (full/desktop/stress) | 51 (town) | 159 | **210 (e9-seed-run)** |
| triangles p95 | 84,202 | 103,196 | 158,796 |
| triangles submitted with `frustumCulled=false` | 3% (town) | **63%** | 78% |
| instanced slots submitted | 212 (town) | 2,206 | 3,498 |
| estimated resident texture bytes | **88.9 MB** | **164.5 MB** | **214.9 MB** |

### F-PERF-3 — One map already exceeds the only draw-call budget the project has, and 41 maps are outside that budget's reach

`e2e/perf-01-stress-budget.spec.ts:117` asserts `maxDrawCalls <= 200`. It runs on **one** contract —
whatever `openGame` boots, i.e. `the-claim`. Measured under the same stress profile,
**`e9-seed-run` reaches 210 draw calls p95 and 211 max** (`e9-seed-run-full-desktop-stress`) — the
assertion is on the *max*, so it is over the ceiling by 11 — and eight further maps sit between 168
and 172. The budget is sound; its coverage is 1 map of 42.

### F-PERF-4 — 63% of every map's submitted triangles are submitted with frustum culling disabled

Measured from the scene walk in every `scenes/*.json` (`frustumCulled` per object group, triangles ×
instances × objects), and independently from the camera-zoom probe.

`node scripts/perf-survey/terrain.mjs` counts **72 `frustumCulled = false` sites in `src/`** — not the
four classes the master named. Top files: `entities/pools.ts` (9), `world/Water.ts` (7),
`world/LightRig.ts` (6), `world/Terrain3dClaimPilot.ts` (5), `systems/FreedWalkerVfx.ts` (4),
`world/Scatter.ts` (3), `systems/BuildSystem.ts` (3), `systems/CombatVfx.ts` (3).

`node scripts/perf-survey/zoom.mjs` → `artifacts/perf-survey/zoom.json` tests every instance's
bounding sphere against the six clip planes on a frozen stress scene:

| map | camera zoom | instance slots submitted | slots inside the frustum | offscreen triangles submitted anyway |
|---|---|---|---|---|
| the-claim | 1 (gameplay) | 2,290 | **292 (12.8%)** | 44,730 |
| the-claim | 2 | 2,290 | 163 | 50,068 |
| the-claim | 3 | 2,290 | 145 | 51,968 |
| e2-incline | 1 | 2,707 | **222 (8.2%)** | 62,320 |
| e6-showroom | 1 | 2,194 | **115 (5.2%)** | 47,622 |

The `EnemyPool` is the sharpest case: it submits its **full 96-instance capacity at wave 1 with
`enemiesAlive: 0`**. In the `the-claim-full-desktop-wave1` scene walk it has 14 instanced groups (8
of them visible), every one at `instances: 96, capacity: 96`, together submitting **39,360 triangles
of empty pool out of the frame's 110,328** while the diagnostics report `enemiesAlive: 0`. `SparkRigBoltPool`
submits 128 slots of which 2 are in view.

⚠️ "Outside" mixes genuinely off-camera instances with parked zero-scale slots; both cost vertex
work, neither is separated here.

### F-PERF-5 — Estimated resident texture memory is 89–215 MB per map, after the Astra atlas work

From each scene's reachable texture set, deduped by source + sampler, at `w × h × 4 × 4/3` for
mipmapped textures (formula recorded in every `scenes/*.json`). Excludes render targets, driver
overhead and depth buffers, so it is a floor, not a ceiling.

`the-claim` full/desktop: **137.6 MB at wave 1, 166.8 MB under stress**, over 49–51 unique textures.
The composition is not the terrain:

| texture | dimensions | est. resident |
|---|---|---|
| `the-claim-terrain-atlas` | 2048² | 22.4 MB |
| `the-claim-panorama-atlas` | 2048² | 22.4 MB |
| `LandYacht.{wheels,crane,wheelhouse}.{Intact,Damaged}` | 1672×941 ×6 | **50.3 MB** |
| `GeneratedClaimJumperSprites` + `…SpriteFades` | 512×4096 ×2 | 22.4 MB |

Six boss sprite variants at 1672×941 cost more than the terrain and panorama atlases combined. ⚠️
This is a **decoded-residency estimate**, not a driver allocation; a GPU-side measurement is a
named gap (§9).

---

## 3. Per-system attribution (scope 2)

`node scripts/perf-survey/attribution.mjs --rounds 2` → `artifacts/perf-survey/attribution.json`,
per-map Chrome CPU profiles in `profiles/*.cpuprofile`. Ranked by full/desktop/stress draw-call p95.
**Three of the six worst maps completed before the time budget closed** (`e9-seed-run`, `the-claim`,
`e9-dome-basin`); the remaining three are a named gap.

### F-PERF-6 — The per-system *millisecond* attribution did not resolve, and no system dominates the draw call budget

Toggling each system off and back on, 2 rounds each, produced ms deltas of ±0.1 to ±5 ms **in both
directions** — indistinguishable from the host noise of §1. That arm is reported as failed, not as
"no effect".

The draw-call deltas *are* structural and consistent across all three maps:

| system disabled | draw calls saved (median, 3 maps) |
|---|---|
| all `DetailScatter` | 6–7 |
| all sprites | 4–6 |
| VFX / points / renderOrder 3 | 4–6 |
| individual scatter class (ruts, rocks, stumps, dry grass, claim posts) | 1–2 each |
| water | 0–1 |
| shadow map | 0 |
| DOM HUD | 0 |

**Nothing in the frame is a single fat target.** ~170 stress draw calls are spread across many small
submitters, which is why F-PERF-4 (submit less of what is already batched) outranks "turn a system
off" in the ladder.

The one large structural lever measured here is the existing `&terrain2d` flag:

| map | triangles 3d → 2d | draw calls 3d → 2d |
|---|---|---|
| the-claim | 112,886 → **84,182** (−25%) | 171 → 165 |
| e9-seed-run | 102,836 → 81,672 (−21%) | 193 → 190 |
| e9-dome-basin | 105,480 → 84,706 (−20%) | 150 → 146 |

Browser CPU profile shape (5 s, `the-claim`, load 13.6, ⚠️ debug seam on): `(idle)` 2,330 ms,
`(program)` 480 ms, `get clientWidth` 418 ms (debug-only, F-PERF-2), **`updateMatrixWorld` 329 ms**,
**`multiplyMatrices` 194 ms**, `syncEnemySprite` 124 ms, `renderBufferDirect` 95 ms,
`getObjectByProperty` 67 ms, GC 66 ms. Matrix maintenance over 171 objects and ~2,300 instance slots
is the largest real main-thread item, and it is the same work F-PERF-4 proposes not to do.

---

## 4. Sim cost (scope 3)

`node scripts/perf-survey/sim.mjs --resume --map <ids>` (node `--cpu-prof`) and
`node scripts/perf-survey/worker.mjs` → `sim/*.json`, `worker.json`. `tapes.mjs` fetched the county
board: **31 of 42 contracts have a real played tape**; `e1-drill-yard` returns HTTP 400 and ten maps
have no reel. **25 county tapes and 29 null floors measured.**

⚠️ Two calibrations before reading the table. The node column runs under `--cpu-prof` at 1 ms
sampling inside a vite SSR module graph, so it is a **profiled** figure and pessimistic; the browser
worker column is the un-profiled path and is closer to what the assayer actually does. Both are wall
clock and therefore load-sensitive — the load at each sample is the last column, and it ranged 4 to
64. The **hash column is not load-sensitive**: it is a pure computation and is trustworthy.

| map | ticks | simulated s | node ×realtime (profiled) | tick p95 ms | browser worker ×realtime | browser verify s | hash | load |
|---|---|---|---|---|---|---|---|---|
| e10-last-claim | 7202 | 240 | 8 | 7.28 | — | — | ✅ | 23 |
| e8-low-orbit | 18600 | 620 | 11 | 5.56 | 19 | 31.6 | ✅ | 21 |
| e8-far-side | 18600 | 620 | 11 | 6.36 | 27 | 22.0 | ✅ | 21 |
| e6-half-life-hollow | 18001 | 600 | 12 | 5.42 | 16 | 38.2 | ✅ | 13 |
| e1-twin-banks | 18001 | 600 | 14 | 4.80 | 14 | 44.2 | ✅ | 6 |
| e6-picnic | 18001 | 600 | 14 | 4.15 | 18 | 33.4 | ✅ | 17 |
| e4-dust-flats | 13140 | 438 | 16 | 4.37 | 36 | 12.3 | ✅ | 39 |
| e1-night-shift | 22502 | 750 | 18 | 3.24 | 17 | 44.3 | ✅ | 7 |
| e4-long-road | 10801 | 360 | 19 | 3.41 | 47 | 7.8 | ✅ | 24 |
| e2-incline | 17782 | 593 | 19 | 3.35 | 19 | 31.8 | ✅ | 4 |
| e4-boneyard | 10801 | 360 | 23 | 2.61 | 29 | 12.4 | ✅ | 23 |
| the-claim | 9001 | 300 | 23 | 3.00 | 37 | 8.1 | ✅ | 14 |
| e9-devils-alley | 18600 | 620 | 24 | 2.63 | 47 | 12.8 | ✅ | 17 |
| e2-trestle | 19585 | 653 | 26 | 3.74 | 27 | 24.0 | ✅ | 5 |
| e1-dry-gulch | 18001 | 600 | 28 | 1.74 | 31 | 19.6 | ✅ | 8 |
| e6-glow-mesa | 10967 | 366 | 29 | 1.89 | 41 | 8.9 | ✅ | 13 |
| e2-hill-mine | 13627 | 454 | 31 | 2.05 | 32 | 14.4 | ✅ | 6 |
| e3-blackout-ridge | 10801 | 360 | 34 | 1.33 | 50 | 7.4 | ✅ | 42 |
| e5-flotilla | 8161 | 272 | 38 | 1.43 | 60 | 4.6 | ✅ | 11 |
| e3-moth-season | 16390 | 546 | 40 | 1.20 | 53 | 10.4 | **❌** | 64 |
| e4-gusher-county | 10801 | 360 | 41 | 1.46 | 59 | 6.2 | ✅ | 19 |
| e5-regatta | 8161 | 272 | 52 | 1.08 | 77 | 3.6 | ✅ | 13 |
| e2-pressure-garden | 10801 | 360 | 72 | 0.79 | 72 | 5.1 | ✅ | 4 |
| e5-stillwater | 10801 | 360 | 81 | 0.58 | 141 | 2.7 | ✅ | 12 |
| e5-deepwater-claim | 8161 | 272 | 96 | 0.54 | 171 | 1.7 | ✅ | 16 |

Null floors (idle policy, same maps): **27× to 165× realtime**, i.e. the played input, not the map,
is what costs.

### F-PERF-7 — Ten of twenty-five played tapes replay below 20× realtime, and six more cannot be measured at all

Below 20× in node: `e10-last-claim` 8×, `e8-low-orbit` 11×, `e8-far-side` 11×, `e6-half-life-hollow`
12×, `e1-twin-banks` 14×, `e6-picnic` 14×, `e4-dust-flats` 16×, `e1-night-shift` 18×, `e4-long-road`
19×, `e2-incline` 19×. Six of those ten were sampled at load ≤ 17, and **three at load 4–7 — a
genuinely quiet host**: `e2-incline` 19× at load 3.6, `e1-twin-banks` 14× at load 5.7,
`e1-night-shift` 18× at load 6.7. Those three cannot be explained away by contention.

In the browser worker, six fall below 20×, worst `county-e6-picnic` at **11× — 56.5 s to verify a
600-second tape**. Four browser runs failed outright: `county-e1-baron` and `county-e7-relay-rush`
exceed the worker's own 60 s bound, and both `e10-last-claim` runs failed.

Six further county tapes could not be measured in node at all — `e1-baron`, `e3-fairground`,
`e7-echo-canyon`, `e7-dead-band`, `e7-relay-rush`, `e8-eclipse` were **SIGKILLed at the instrument's
60-second ceiling**, so they are slower than every tape in the table. **The flagged set is therefore
at least 16 of 31.**

### F-PERF-14 — One county tape replays to a different event-log hash than it records, reproducibly

`county-e3-moth-season` is the **only** hash mismatch in 25 tapes. It declares 10,801 ticks; the
replay runs to **16,390** and produces `fnv1a32:9be0399e` against the tape's recorded
`fnv1a32:64e32dde`. Every other measured tape replays to **exactly** its declared tick count and
matches its hash.

This is not instrument noise and not host load (a hash is a pure computation):

- reproduced twice by `sim-tape.mjs`, at load 63.9 and again at load ~16, both giving `9be0399e`;
- the repo's own independent verifier, `scripts/assay-replay-agent.mjs`, produces **the same
  `9be0399e` and the same 16,390 ticks** (`sim/county-e3-moth-season-assay.log`).

Two independent code paths agree with each other and disagree with the tape. Either the served reel
carries a hash from an older engine, or `e3-moth-season` has a real determinism divergence. **The
assayer verifies standings by exactly this hash**, so it needs a dedicated bisect; this survey does
not resolve which of the two it is. Reproduce:
`node scripts/perf-survey/sim-tape.mjs tapes/county-e3-moth-season.json recheck`.

### F-PERF-8 — 59% of the sim's replay time is `structuredClone`, and it has one address

`node scripts/perf-survey/hotpath.mjs profiles/county-e6-picnic-ticks.cpuprofile structuredClone 5`

`structuredClone` accounts for **24,539 ms of the 41,658 ms `county-e6-picnic` replay**. 99.9% of it
arrives through one chain:

```
(anonymous) :805  <-  copyRecords :804  <-  (anonymous) :193  <-  snapshot :189  <-  snapshotStandingOrders :425
```

That is `src/agent/StandingOrders.ts`. `copyRecords` (`:845`) deep-clones each record's order, and
`StandingOrdersExecutor.snapshot()` (`:290`) calls it **once per order plus once per history event**:

```ts
snapshot(): StandingOrdersView {
  return {
    needsRider: this.needsRiderValue,
    orders: copyRecords(this.records),
    log: this.history.map((event) => ({ ...event, ...(event.orders ? { orders: copyRecords(event.orders) } : {}) })),
  };
}
```

`HeadlessContractSim.ts:1283` exposes `standingOrders: () => snapshotStandingOrders()` to the agent
adapter, so the **whole history log is deep-cloned on every call, and the history grows with the
run** — quadratic in tape length. That is exactly the shape the table shows: null floors run at
27–165× while played tapes of the same maps fall to 8–19×, and the slowest tapes are the longest
ones. Runners-up in the same profile: `terrainSeed` 1,248 ms, `terrainHash` 873 ms, `diagnostics`
691 ms.

---

## 5. Delivery (scope 4)

`node scripts/perf-survey/delivery.mjs --map <id>` → `artifacts/perf-survey/delivery.json`. Fresh
context, empty HTTP cache, 390×844, DPR 1, full tier, CDP `Network.emulateNetworkConditions`.
Prefetches are identified exactly by the `x-gold-rush-prefetch` request header.

The production build: **377,040,673 bytes in 4,708 files** (`inventory.json`; the master's 589 MB /
4,694 predates the asset-diet manifest merge).

| target | first frame (unthrottled) | bytes to first frame | settled wire | requests | first frame Fast 3G | first frame 4G | prefetch-only |
|---|---|---|---|---|---|---|---|
| **town** | 845 ms | 6.64 MB | **23.99 MB** | 517 | **5,017 ms** | 1,343 ms | 9 files / 2.8 MB |
| the-claim | 1,155 ms | 7.53 MB | 28.75 MB | 485 | 7,249 ms | 1,468 ms | 12 / 0.0 MB |
| e4-gusher-county | 1,316 ms | 7.51 MB | 29.56 MB | 464 | 7,262 ms | 1,657 ms | 10 / 0.0 MB |
| e5-regatta | 1,316 ms | 7.11 MB | **31.49 MB** | 550 | 7,269 ms | 1,498 ms | 12 / 0.0 MB |
| e8-mare-claim | 1,306 ms | 5.52 MB | 21.29 MB | 454 | 7,267 ms | 1,585 ms | 10 / 0.0 MB |
| e1-drill-yard | 1,488 ms | 7.06 MB | 25.64 MB | 453 | 7,265 ms | 1,599 ms | 12 / 2.6 MB |

Top JS chunks by raw bytes (gzip in brackets): `BrowserAgentTapeWorker` 2,051 KB (508), `index`
1,359 KB (325), `Game` 970 KB (261), `Terrain3dClaimPilot` 455 KB (76), `SpriteAnimator` 287 KB (33),
`TownScene` 190 KB (56), `AssetLoading` 166 KB (54), `WorldInfoNotes` 123 KB (40). Full 20 in
`inventory.json.dist.top20Chunks`.

### F-PERF-9 — The town's first-load budget is real and nearly full: 23.99 MB over 517 requests

Against a 25 MB first-town budget, the measured settled figure is **23.99 MB** — 96% consumed. A
contract map settles at 21.3–31.5 MB, i.e. **`e5-regatta` already exceeds 25 MB by 26%**. Only
5.5–7.5 MB of that is needed to reach the first frame; the rest arrives after.

### F-PERF-10 — On a slow link the first frame is latency- and parse-bound, not bandwidth-bound

On Fast 3G every contract map reaches its first frame in **7.25 s ± 0.02** having transferred only
**0.89 MB**. The variance across five very different maps is 20 ms. That is a fixed cost — the
critical JS chain (`index` 325 KB gz + `Game` 261 KB gz + `AssetLoading` 54 KB gz) plus its round
trips — and no amount of asset reduction moves it. The town reaches first frame in 5,017 ms on the
same link with 0.64 MB, because it needs a shorter chunk chain.

### F-PERF-11 — Three board contracts silently fall back to `the-claim`

`e10-ember-shore`, `e10-archive-world` and `e10-river` all report
`contract.fallbackReason: "unavailable-contract"` and land the player on `the-claim` with
`requestedId` preserved. `e10-last-claim` launches normally. These are listed by
`listBoardContracts()` and so are on the board; 12 census rows failed on them and they are the only
census failures. Probe:
`?debug&contract=e10-river&epoch=epoch-10-deepsky` → `activeId: "the-claim"`.

### First-visit path, measured

A genuine first visitor does not see "Enter Town". `StartMenu.ts:129` renders a first-boot profile
form; naming the claim-holder carries the player **straight into the town** with the town-naming card
already up, and the menu's Enter Town node lingers in the DOM un-actionable. Both survey instruments
had to be corrected for this; it is recorded here because any future delivery or onboarding
measurement will hit it.

---

## 6. The maps themselves (scope 6)

`node scripts/perf-survey/terrain.mjs` → `artifacts/perf-survey/terrain.json`. 32 unique source
grids across the 42 contracts (some shared: one grid serves `e5-deepwater-claim`/`e5-stillwater`/
`e5-flotilla`, another `e7-relay-valley`/`e7-dead-band`/`e7-relay-rush`, another `e8-mare-claim`/
`e8-far-side`/`e8-eclipse`, another `e6-glow-mesa`/`e6-picnic`).

**Every grid is 128×128 = 32,768 triangles** (`e1-twin-banks` alone is 160×160 = 51,200). A "64-grid"
is therefore a **4× reduction to 8,192 triangles**, not 2×.

### F-PERF-12 — A 64² terrain costs almost nothing on most maps and visibly wrecks the cliffs on eight

Every second X/Z vertex retained, the exported triangle diagonal preserved (read from the index
buffer, not assumed), then compared against **every original vertex** and **every original triangle
centroid**. "Steep" = original triangle height span > 0.25 world units.

| grid | vertex err p50 | vertex err p95 | steep-triangle centroid err p95 | verts > 0.25 |
|---|---|---|---|---|
| the-claim | 0.0006 | 0.023 | 0.009 | 0 |
| e1-dry-gulch | 0.0003 | 0.007 | 0.074 | 0 |
| e2-incline | 0.0002 | 0.020 | 0.000 | 0 |
| e6-showroom | 0.0000 | 0.039 | 0.247 | 109 |
| e4-gusher-county | 0.0000 | 0.164 | 0.210 | 372 |
| e9-old-canal | 0.0009 | 0.150 | 0.565 | 512 |
| e10-ember-shore | 0.0008 | 0.242 | 0.359 | 797 |
| e7-echo-canyon | 0.0000 | 0.103 | **1.667** | 455 |
| e8-mare-claim/far-side/eclipse | 0.0000 | **0.342** | **1.992** | **1,561** |

Median vertex error across all 32 grids is 0.0006 world units — invisible. The cliffs are where it
breaks: the Mare grid (three E8 maps) puts 1,561 vertices past 0.25 and its steep-triangle p95 error
is 1.99 world units. **The answer is per-grid, not global**: ~24 grids can drop to 64² for a 24,576-
triangle saving each; 8 cannot without a preserved-edge treatment.

⚠️ This measures the *height field*, not the drawn silhouette after the terrain shader and splat.

### Terrain actually on screen

From `zoom.json`, at the gameplay camera (zoom 1): `the-claim` has **14,136 of its 32,768 terrain
triangles intersecting the frustum (43%)**, and `TerrainVistaRing` (7,296 triangles) plus
`Terrain3dSculptContinuation` (6,656) have **zero** triangles inside the frustum at every zoom
tested, on all three probed maps. Frustum culling is per object, so the whole 32,768-triangle sculpt
is submitted whenever any part of it is visible.

---

## 7. Memory and leaks (scope 5)

`node scripts/perf-survey/memory.mjs` → `artifacts/perf-survey/memory.json`. Full tier, 390×844,
CDP `HeapProfiler.collectGarbage` before **every** reading.

### The run→town transition is a full document navigation

`Game.ts:8046`: `back_to_town` calls `window.location.assign(origin + pathname)` — deliberate, so
that the `?contract` auto-launch loop is left. Confirmed empirically: the `__SURVEY_DOCUMENT_ID__`
changes between the run reading and the menu reading in every cycle. Heap falls from **36.3–40.2 MB
in a run to 7.2–9.0 MB on the menu**, so run teardown is genuinely working — but the whole app is
re-parsed on the way back, and no cross-contract leak can be measured through that path.

### F-PERF-13 — The same-document town round trip leaks ~0.62 MB of JS heap per cycle, with GPU resources flat

Six town → start-menu → town round trips inside one document (`documentId` constant `81f3…`), GC
forced before every reading:

| round trip | JS heap after GC | geometries | textures | programs | est. resident texture MB |
|---|---|---|---|---|---|
| warm −1 | 22.00 MB | 66 | 42 | 24 | 100.8 |
| warm 0 | 22.70 MB | 66 | 41 | 24 | 100.8 |
| 1 | 23.29 MB | 66 | 41 | 24 | 100.8 |
| 2 | 24.18 MB | 66 | 41 | 24 | 100.8 |
| 3 | 24.54 MB | 66 | 41 | 24 | 100.8 |
| 4 | 25.37 MB | 66 | 41 | 24 | 100.8 |
| 5 | **25.71 MB** | 66 | 41 | 24 | 100.8 |

**+3.71 MB over six round trips, monotonic.** Every three.js counter is flat, so GPU resource
disposal is correct and the growth is **JS-side only** — retained closures, listeners or caches. The
owning module is **not identified**; that needs a heap-snapshot diff and is a named gap (§9).

---

## 8. Cross-reference: what the Astra wave already covers, so nothing is double-counted

Measured build is `44efbf3d6`. Verified by content, not by commit message:

| Astra fix | in the measured build? | how the survey relates |
|---|---|---|
| asset-diet explicit manifest (F-ASTRA-3) | ✅ `scripts/asset-diet.manifest.json` present | The 377 MB / 4,708-file build in §5 is **post-diet**. Not re-litigated. |
| shared atlas / texture dedupe (F-ASTRA-4) | ✅ `SharedAtlasCache` in `src/assets/AssetLoading.ts` | The 89–215 MB residency of F-PERF-5 is **after** the dedupe. The remaining bulk is boss sprite sheets, not landmark atlases. |
| bounded prefetch (F-ASTRA-5) | ✅ base `44efbf3d6` *is* its lane commit | Measured: prefetch-only traffic is 0–2.8 MB per map (§5), no longer unbounded. Not re-litigated. |
| batch opaque repetitions (F-ASTRA-6) | n/a — a suggestion, not a merge | Astra asked for "a current census showing meaningful off-camera work" before spatial chunking. **F-PERF-4 is that census.** It extends F-ASTRA-6; it is not a new finding. |
| terrain triangle sampler (F-ASTRA-10) | ✅ `c3884d89d` is an ancestor | F-PERF-12 measures the *topology* question F-ASTRA-10 left open (what a coarser grid costs), not the sampler. |
| Lantern world stage (F-ASTRA-11) | ✅ `src/world/LanternWorldStage.ts` present | Untouched by this survey. |
| landmark lighting calibration (F-ASTRA-9) | ❌ **NOT in the measured build** — `a05abdf1d` is not an ancestor of `44efbf3d6`; `?lighting=legacy` is absent | Any lighting-related draw-call or program count here predates that merge and must be re-taken before it is trusted. |
| phone + delivery evidence (F-ASTRA-12) | open | §5 is headless Chromium on an M4 Max with CDP throttling — **not a phone**. It narrows F-ASTRA-12; it does not close it. |

---

## 9. What was not measured (named gaps)

1. **Every frame timing in the census proper.** 170 of 215 rows above load 12 (F-PERF-1). Partly
   closed by §1b: a late quiet window produced nine clean median-of-three arms across five maps, but
   **the town and `e1-night-shift` under stress never got three clean samples**, and no lite/mobile
   arm was re-taken clean at all.
2. **Per-system millisecond attribution** — attempted, noise-dominated, reported as failed (F-PERF-6).
3. **Three of six worst maps** for attribution (`e2-pressure-garden`, `e6-half-life-hollow`,
   `e2-hill-mine`) — the time budget closed first.
4. **Three board contracts** cannot be launched at all (F-PERF-11): `e10-ember-shore`,
   `e10-archive-world`, `e10-river`.
5. **Sim: 25 played tapes of the 31 that exist** (11 contracts have no county reel; `e1-drill-yard`
   returns HTTP 400). Six tapes — `e1-baron`, `e3-fairground`, `e7-echo-canyon`, `e7-dead-band`,
   `e7-relay-rush`, `e8-eclipse` — exceed the instrument's 60 s node ceiling and are unmeasured
   *because they are slow*, which is itself the finding. F-PERF-14 is diagnosed but not bisected.
6. **GPU-side texture allocation** — every residency figure is a decoded-bytes estimate from the
   scene walk, never a driver query.
7. **The leaking module** in F-PERF-13 — growth proven, owner not named.
8. **Real hardware.** No phone, no low-end GPU, no real network. `PerformanceTier`'s `lite` path was
   exercised by override, never by the runtime watchdog verdict.
9. **Overdraw** — sprite counts (101–103 per map) and clip-space coverage are recorded per scene, but
   no fill-rate measurement was taken.

---

## 10. The top ten

Ranked by measured evidence ÷ effort. Every "measured cost" is a number in this document with a file
behind it. Every "estimated win" is an **estimate** and carries its formula. No entry is justified by
a frame timing taken tonight.

🚨 **One finding does not belong on a performance ladder and should not wait behind it: F-PERF-14.**
`county-e3-moth-season` replays to a different event-log hash than the tape records — reproducibly,
across two runs of this survey's instrument *and* the repo's own `assay-replay-agent.mjs`, while all
24 other tapes match exactly. The assayer verifies standings by that hash. It is a correctness
question, not a speed one, and it is the first thing in this document a fire should pick up.

⚠️ **Read §1b first.** On a quiet M4 Max the desktop renderer has ~13× headroom (0.9–1.3 ms of submit
CPU against a 16.7 ms frame) at every arm measured, including the worst map under stress. **Entries
2, 4, 6 and 7 below are therefore headroom, GPU-memory and low-end-device arguments — not fixes for a
frame rate that is broken today.** The entries that address a cost which is large *right now* on the
hardware actually measured are 1 (sim), 5 (resident texture memory) and 10 (delivery).

| # | area | measured cost | estimated win (with formula) | effort | risk | proposed master |
|---|---|---|---|---|---|---|
| 1 | Sim — `StandingOrders.snapshot()` deep-clones the whole history every call (F-PERF-8) | 24,539 ms of the 41,658 ms `county-e6-picnic` replay = **59%**; quadratic in tape length; **10 of 25 played tapes are below 20× realtime and 6 more exceed a 60 s ceiling entirely** | est. replay → `replayMs − structuredCloneMs` = 17.1 s, i.e. **14× → ~34× realtime**, browser verify 56.5 s → ~24 s | **S** | L — callers may rely on receiving a mutable copy | `standing-orders-snapshot-without-the-history-clone` |
| 2 | `EnemyPool` submits its full 96-instance capacity with 0 enemies alive (F-PERF-4) | 14 instanced groups (8 visible) × 96 slots at wave 1 with `enemiesAlive: 0` = **39,360 triangles** of empty pool | est. wave-1 triangles **−36%** on `the-claim` (39,360 of 110,330), draw calls unchanged | **S** | L — `count` is already the documented three.js seam | `enemy-pool-submits-only-the-live-instances` |
| 3 | The only draw-call budget covers 1 map of 42, and another map already breaks it (F-PERF-3) | `e9-seed-run` **max 211** vs the `perf-01` `maxDrawCalls <= 200` ceiling; 8 more maps at 168–172 | no runtime win — it **stops the next regression**; converts 41 unguarded maps into guarded ones | **S** | L — additive test only | `stress-draw-call-budget-covers-the-board` |
| 4 | `TerrainVistaRing` + `Terrain3dSculptContinuation` have zero triangles in the frustum at every zoom (§6) | 13,952 triangles/frame on `the-claim`, 0 of them inside the clip frustum, on all 3 probed maps | est. **−12% submitted triangles** (13,952 of 112,888) at gameplay zoom; must confirm they are not the distant skyline the player sees | **S** | M — they may be deliberately unculled for the horizon | `vista-ring-earns-its-submission` |
| 5 | Boss sprite sheets dominate resident texture memory (F-PERF-5) | 6 × `LandYacht.*` at 1672×941 = **50.3 MB of `the-claim`'s 166.8 MB** | est. **−37 MB per boss map** by halving the sheet or dropping unused damage states (`w×h×4×4/3` at 1024×576) | **S/M** | L — sprite dimensions are a content decision, not a contract | `boss-sheet-residency-budget` |
| 6 | 87% of submitted instance slots are outside the frustum (F-PERF-4) | 2,290 slots submitted, **292 inside**; 44,730–62,320 offscreen triangles/frame across 3 maps; **72 `frustumCulled=false` sites** | est. **−40 to −55% submitted triangles** at gameplay zoom (offscreen ÷ scene triangles); no draw-call change | **M** | M — `reviews/perf-e1-r2.md` records a 60-call instancing win reverted for mobile transparent ordering | `instanced-pools-cull-what-the-camera-cannot-see` |
| 7 | Terrain grids are 128² everywhere; most maps do not need it (F-PERF-12) | 32,768 triangles/grid; median coarse-grid vertex error **0.0006 world units** | **−24,576 triangles per qualifying grid**; ~24 of 32 grids qualify, 8 (Mare, echo-canyon, ember-shore, old-canal…) do not | **M** | M — cliff silhouettes on the 8 excluded grids | `terrain-64-grid-where-the-cliffs-allow` |
| 8 | The town round trip leaks JS heap (F-PERF-13) | **+0.62 MB per cycle**, +3.71 MB over 6, monotonic after forced GC; three.js counters flat | est. bounded heap across a session; the win is stability on long sessions, not fps | **M** | L — no rendering change | `town-round-trip-heap-does-not-grow` |
| 9 | Three board contracts silently become `the-claim` (F-PERF-11) | `fallbackReason: "unavailable-contract"` on `e10-ember-shore`, `e10-archive-world`, `e10-river`; 12 of 12 census failures | coverage, not fps: **42 → 42 measurable contracts**, and the player stops being silently redirected | **S** | L | `three-e10-contracts-admit-or-leave-the-board` |
| 10 | First load is at 96% of the town budget and the slow-link first frame is a fixed chain (F-PERF-9, F-PERF-10) | town **23.99 MB** settled / 517 requests; `e5-regatta` **31.49 MB**; Fast 3G first frame **7.25 s ± 0.02** on 0.89 MB | est. −2 to −3 s on Fast 3G by shortening the critical chunk chain (`index`+`Game`+`AssetLoading` = 640 KB gz before first frame); asset reduction moves **none** of it | **M** | M — chunk-splitting touches every entry path | `first-frame-chain-under-a-slow-link` |

---

## 11. Proposed ladder, ordered by win ÷ effort

Each rung names the number it must move and the gate that proves it. **Gates that are frame timings
must be taken on a host below 1-minute load 12** — this survey could not supply that baseline, so a
frozen quiet-host baseline is a prerequisite for rungs that need one (see
`reviews/f1440-2-perf-gate-without-a-frozen-baseline.md`).

0. **`moth-season-replay-hash-divergence`** (correctness, not speed — ahead of everything below).
   Bisect whether `county-e3-moth-season`'s served reel carries a stale hash or the engine diverges
   on that contract; the replay also overruns its declared 10,801 ticks to 16,390.
   *Moves:* hash mismatches among measured county tapes 1 → 0.
   *GATE:* `node scripts/perf-survey/sim.mjs --resume --map e3-moth-season` reports
   `hashMatches: true` **and** `result.ticks === declaredDurationTicks`, with
   `scripts/assay-replay-agent.mjs` agreeing.
1. **`standing-orders-snapshot-without-the-history-clone`** — stop deep-cloning `this.history` in
   `StandingOrdersExecutor.snapshot()`; clone lazily or hand back a frozen view.
   *Moves:* `county-e6-picnic` node replay 41.7 s → under 20 s; the ten tapes below 20× → zero.
   *GATE:* `node scripts/perf-survey/sim.mjs --resume` shows `realtimeMultiple >= 20` on all 25
   measured county tapes **and** `hashMatches: true` on all of them except the F-PERF-14 outlier
   (determinism is the hard constraint, not speed); the six 60 s-ceiling tapes measure at all.
2. **`enemy-pool-submits-only-the-live-instances`** — drive `InstancedMesh.count` from the live enemy
   count instead of capacity.
   *Moves:* `the-claim-full-desktop-wave1` triangles p95 110,330 → under 75,000.
   *GATE:* the census row's `metrics.triangles.p95` from `run.mjs --map the-claim --state wave1`;
   structural, so no quiet host needed. Plus `e2e/perf-01-stress-budget.spec.ts` still green.
3. **`stress-draw-call-budget-covers-the-board`** — extend the `perf-01` 200-call assertion across the
   board, or add a census-driven budget test; file `e9-seed-run` at 210 as the first red.
   *Moves:* maps under a draw-call ceiling 1 → 42.
   *GATE:* the new test fails on today's `e9-seed-run` (max 211) and passes once its max is under 200.
4. **`vista-ring-earns-its-submission`** — either frustum-cull `TerrainVistaRing` and
   `Terrain3dSculptContinuation` or prove they are the visible horizon and document why they cannot be.
   *Moves:* `the-claim` stress triangles 112,888 → ≤ 99,000.
   *GATE:* `node scripts/perf-survey/zoom.mjs --map the-claim` plus a desktop **and** 390 px
   screenshot pair showing the skyline unchanged.
5. **`boss-sheet-residency-budget`** — cap generated boss sheet dimensions; drop damage variants that
   are never simultaneously resident.
   *Moves:* `the-claim-full-desktop-stress` `gpuEstimate.textureRgba8MipBytes` 166.8 MB → under 120 MB.
   *GATE:* the scene walk's texture list from `run.mjs --map the-claim --state stress`, plus a boss
   fight screenshot at both viewports.
6. **`instanced-pools-cull-what-the-camera-cannot-see`** — per-instance or per-chunk culling for the
   pools that carry `frustumCulled = false`, opaque classes first, transparent ordering untouched
   (the `perf-e1-r2` revert is the warning).
   *Moves:* `zoom.json` offscreen-triangles-submitted at zoom 1 on `the-claim` 44,730 → under 10,000.
   *GATE:* `zoom.mjs` on `the-claim`, `e2-incline`, `e6-showroom`; mobile transparent-ordering
   screenshots at 390 px; `perf-01` still green.
7. **`terrain-64-grid-where-the-cliffs-allow`** — decimate to 64² only the grids whose steep-triangle
   centroid p95 error stays under a ratified threshold; leave the eight cliff grids at 128².
   *Moves:* −24,576 triangles per qualifying map.
   *GATE:* `terrain.mjs` re-run showing the threshold held per grid, the `visualY` sampler still exact
   (F-ASTRA-10's centroid discrepancy stays at 1e-14), and a before/after screenshot per changed map.
8. **`town-round-trip-heap-does-not-grow`** — heap-snapshot diff across the same-document town loop,
   then fix the retainer.
   *Moves:* `memory.json.sameDocument` heap slope 0.62 MB/cycle → under 0.05 MB/cycle over 6 cycles.
   *GATE:* `node scripts/perf-survey/memory.mjs`; heap after forced GC, so load-independent.
9. **`three-e10-contracts-admit-or-leave-the-board`** — either make `e10-ember-shore`,
   `e10-archive-world` and `e10-river` admissible by id, or stop `listBoardContracts()` returning
   contracts that silently redirect.
   *Moves:* census failures 12 → 0.
   *GATE:* `node scripts/perf-survey/run.mjs --all --resume` reports every row `measured`.
10. **`first-frame-chain-under-a-slow-link`** — shorten the pre-first-frame chunk chain; re-budget the
    town's 23.99 MB and `e5-regatta`'s 31.49 MB against the 25 MB rule.
    *Moves:* Fast 3G first frame 7,250 ms → under 5,000 ms; every map's settled wire under 25 MB.
    *GATE:* `node scripts/perf-survey/delivery.mjs --map <id>` on town + the three heaviest maps,
    all three network profiles.

**Prerequisite for rungs 2, 4, 5, 6, 7:** a frozen quiet-host frame baseline. All five have
structural gates that stand without one, which is deliberate — they can land and be proven while the
frame baseline is still missing.

**Explicitly not on this ladder:** the `get clientWidth` forced layout (F-PERF-2 — debug-seam only,
not a player cost), anything already merged in the Astra wave (§8), and any ms-attribution claim
(F-PERF-6 — it did not resolve).
