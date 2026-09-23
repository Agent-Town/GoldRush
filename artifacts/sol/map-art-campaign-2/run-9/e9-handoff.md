# E9 fidelity — run 9 handoff

**READY-FOR-GATES. All four task maps completed in order; remaining task maps: none.** Each map is IMPROVED / HELD, not full concept acceptance. The clause-by-clause reviews retain the original quotes and the independent reviewers’ limitations.

Task: `sol-map-art-fidelity-2-e9`. Game branch `sol/map-art-campaign-2`; store branch `astra/fidelity-2`. Actual writable store: `/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets`. All four store commits were pushed and read back. The drain owns integration and the engine pin; neither is changed here.

| Map and detailed evidence | Result against its own earlier correction | Game commit | Store commit |
| --- | --- | --- | --- |
| [Dome Basin](e9-dome-basin/review.md) | Native masonry, attached bearings/feet and proportionate UVs. Lock 1,580→2,308 triangles; UV median/p95 3.75/38.52→1.00/1.08. HELD terrain contact, fine joints, chamber/rail context and monumental scale. | `7cc23fb59` | `60c635c2` |
| [Seed Run](e9-seed-run/review.md) | Vault 2,148→2,828 triangles; readable door/window hardware; UV 1.82/15.05→1.00/1.24. Quieter tapered ruts retain 110 centers and four rings. HELD facade depth, contact, crisp materials and regular spacing. | `87f218e98` | `0c64c935` |
| [Devil’s Alley](e9-devils-alley/review.md) | Three anchors 2,284/2,628/2,972 of 3,000 triangles; upper-body median 0.193/0.192→0.353/0.352. HELD fine metalwork, coil hierarchy, full scale, contact and landscape/VFX fidelity. | `e0fa15426` | `03ccce80` |
| [Old Canal](e9-old-canal/review.md) | Connected drives 2,156/2,168/2,180 triangles; low bands 552→2,184; bed transition 0.80→0.25 m. HELD tall/deep vista, fine joint/material/contact clarity and the straight terrain boundary. | containing this handoff | `c092e3d` |

No gameplay, height, mask, spawn, route, mount, collision, station or UI truth changes. Native image_gen supplied the atlas; no paid raster generator. All bodies remain within exact original source bounds and budgets. All 20 GLBs reexport and reproduce byte-identically; zero collapsed UV area on revised bodies. Old Canal’s presentation proof retains the 0.015–0.395 m low envelope, three choice states and 18-resource disposal. Its shared paint function produces identical Dome/Seed shader strings, uniforms and cache keys.

**Verification:** per map TypeScript/default/full builds, 34 render guards, three named guards, mirror closure, census 4/4, loading 8/8, repeat 2/2 and six mount/dispose cycles pass. Four ordinary boots, eight station captures and sixteen timing boots per map have zero console/page errors. No test assertion changed. [All mirror receipts](e9-mirror-gates.json) · [Structured completion evidence](e9-completion.json).

| Map | Browser pass / skip / baseline failures | p95 desktop before→after | p95 phone before→after | Calls desktop / phone |
| --- | --- | --- | --- | --- |
| Dome Basin | 50 / 4 / 4 | 9.65→9.55 ms | 9.30→9.45 ms | 94 / 53, unchanged |
| Seed Run | 49 / 5 / 2 | 9.95→9.85 ms | 9.80→9.85 ms | 126 / 72, unchanged |
| Devil’s Alley | 36 / 4 / 2 | 9.70→9.85 ms | 9.65→9.60 ms | 88 / 58, unchanged |
| Old Canal | 40 / 4 / 2 | 9.80→9.80 ms | 9.75→9.75 ms | 90 / 59, unchanged |

Every failure reproduces on that map’s exact starting code/store/engine with the same assertion fingerprint: plain roster on both viewports for all maps, plus arsenal on both for Dome Basin. Four opt-in brightness cases skip per map; Seed Run also skips the desktop-only seam case on phone. These remain failures, not a green full browser suite. Timing uses four fresh runs per arm/viewport; all comparisons have one mode and remain within 15%.

**HUD exceptions disclosed:** versus run 6, Dome’s declared station rises from 0 to 0.021266% desktop /0.066894% phone; Devil’s phone rises from 0.004104% to 0.008079%. Devil’s rise already exists in the current baseline (0.008084%); candidate A/B is slightly lower. Seed remains 0% at its station. Old Canal remains below prior limits at 0.036814%/0.066130%, while its current desktop A/B rises by 0.008288 percentage points. No station/camera/HUD adjustment hides these figures. Ordinary-entry obstructions and temporary story overlays remain visible in boards; intervening HUD work receives no art credit.

E1 release/payload delta: **N/A for this E9-only leg**. Earlier corrected ground medians are exact; own run-6 RMS drift is under 0.004% across all four maps.

**Exact engine pairs and published store commits:**

- **e9-dome-basin**: `984a9f2498c3445a6fe7f4e9b600f9334b4e7a394d0f3b284493b76dc39ba1a5` → `9103137b1b23675af890f27fb87c0ea568796246e79560bdf2153e2056ed48f1`; store `60c635c2e48eedc288ffcf34c685e862f959057d`.
- **e9-seed-run**: `9103137b1b23675af890f27fb87c0ea568796246e79560bdf2153e2056ed48f1` → `bfa5e66df8f7adb07081b40e77913ff03a6cf3b496bc868189ea70409fe21bdb`; store `0c64c9355000a0304978c31c81fdb70439f0730f`.
- **e9-devils-alley**: `bfa5e66df8f7adb07081b40e77913ff03a6cf3b496bc868189ea70409fe21bdb` → `fa80dda3304171f1c703a8baa2d6f304204e34ea9a1de4f10d2bf70caf71a4fa`; store `03ccce800126faf8f347b51e9a9e751b20b80d19`.
- **e9-old-canal**: `fa80dda3304171f1c703a8baa2d6f304204e34ea9a1de4f10d2bf70caf71a4fa` → `d4e4bfb1167e66755209b2f679bf8682e03286b48dc9f8d1b929a1465f264959`; store `c092e3de241f34163e903279bf071fe1f4fa6d56`.

Preflight: no ahead lane commits; both store worktrees clean; expected untracked `logs/guard-stats.jsonl` only; install and baseline build passed. Existing store branch retained; no reset, rebase, forced push or history rewrite. Test-generated evidence outside run 9 was restored; untracked generated images and raw logs retained in `_raw/run-9/`. Source-archive JSONs are part of the engine corpus: exact-base replays explicitly park the current map’s input contract and verify restoration. The UV join-layer defect caught during Dome iteration was corrected before final evidence. Obsidian project notes and session digest preserve these findings.
