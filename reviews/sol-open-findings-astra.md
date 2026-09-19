# Drain review — `sol-open-findings-astra`: Astra closes the two open findings of its own 3D review — opaque scenery batched with per-prop culling (F-ASTRA-6), the hero GLB brought to its own bar as a pilot (F-ASTRA-2) (attended drain, 2026-09-19; gated first by fire s2644)

**Slice/branch/tip:** `sol/open-findings-astra` @ `9af35a84c` — three commits by Codex gpt-6-astra (xhigh) in lane-a on the owner's ChatGPT subscription; master `tasks/sol-open-findings-astra.md`; report `artifacts/sol/open-findings/report.md` (with `timing-tables.md`, the census JSONs, `hero-eight-heading-board.png`). Fire s2644 trial-merged and gated it GREEN and HELD it gate-side for the merged engine pin (`reviews/gate-s2644-open-findings-astra.md`); this drain pins and lands. **Merged as** `6733232e1`, null floors re-recorded, era-6 pin #13 appended, fast-forwarded.
**Owner words, verbatim:** 2026-09-19 "Also the open findings. I think this is going places today!" · "I agree with all your recommendations on the decisions - good work" (F-ASTRA-2's promotion stays an owner call from the board).

## VERDICT: LANDED — draw calls down on all four censused scenes with transparent ordering proved; the hero pilot finished at 5.33 MiB with complete side and back UVs and the walk grounded from all eight headings; the runtime still draws the sprite heroine

## 1. What landed, measured
| finding | what | measured |
|---|---|---|
| F-ASTRA-6 | `src/town/OpaquePropBatchPilot.ts` (new), `src/world/Scatter.ts`, `src/town/TownTavernPilot.ts`: repeated OPAQUE props batched with per-prop camera culling; transparent items untouched | draw calls **−2 / −2 / −3 / −2** on The Claim / the town / Dry Gulch / Twin Banks; the 20-case transparency matrix and both town comparisons pass; four paired same-scene runs per arm at both widths, zero console/page errors; the settled town mode unchanged (desktop 10.2–10.8 → 10.2–10.3 ms; mobile 10.3 → 10.4 ms); a new plain-boot spec `e2e/f-astra-6-plain-boot.spec.ts` 8/8 |
| F-ASTRA-2 | `assets/pilots/hero-3d/**`: the hero GLB unwrapped with complete side/back UVs, a diffuse 1024² atlas (base color, roughness 0.83, no emission; was black base + atlas emission), 16 float-noise vertices welded, the exported walk grounded; `compare.html` and the eight-heading board (GLB left, the runtime sprite right) | RGBA8 + mips **42.67 MiB → 5.33 MiB**; the runtime still uses the sprite (`src/entities/Hero.ts` untouched); NOT promoted — the owner rules from `artifacts/sol/open-findings/hero-eight-heading-board.png` |

## 2. Gate table
| gate | Astra (lane) | fire s2644 (trial merge) | drain (merged tree) |
|---|---|---|---|
| tsc / build / `GR_RELEASE=e1` | green | rc=0 / rc=0 | 0 / 0 / 0 |
| first-town payload | green | — | 34228448 bytes B |
| the slice's guard 4/4, its plain-boot spec 8/8 | green | 4/4, 8/8 desktop + mobile | 4 skipped   26 passed (2.1m) (the slice spec + townsfolk + landmark-brightness on the merged tree) |
| adjacent tavern spec | — | one p95 red (79.79 %) on a cold cache under load, green on runs 2 and 3 (F-2644-3: a shared-`node_modules` vite cache defeats a two-worktree differential) | see e2e; any red attributed in the gate summary |
| gate-caller audit / nul audit | — | PASS / CLEAN (23,336 subjects) | — |
| null floors | — | — | 83 of 83 null floors match assets/contracts/null-floors.json |
| engine era | — | held for the pin | pin #13 `eeaab417…`, guards ℹ pass 9 ℹ fail 0 |
| full `test:node-guards` | — | — | ℹ tests 929 ℹ pass 920 ℹ fail 3 ℹ skipped 5 — reds listed in artifacts/sol/open-findings/attended-gates-summary.txt, each the drain-owned pin or the contention advisory unless named |

## 3. Findings
- **F-OFA-1 (owner's desk, unchanged):** F-ASTRA-2 promotion — the finished pilot beside the sprite heroine, eight headings × eight phases, is on the board; promotion is the owner's word (fires carry it as the F-ASTRA-2 desk item).
- **F-OFA-2 (factory, from s2644's F-2644-3):** a two-worktree differential measured through one shared `node_modules` vite cache is not a differential; measure timing arms on settled caches or on separate installs.
- **F-OFA-3 (measurement):** the culling's draw-call savings are small on these scenes (2–3 calls) because the landmarks were already economical (Astra's own review said so); the value is the transparent-ordering proof and the census instrument, which the next scenery work can reuse.

## 4. What was touched
`src/town/OpaquePropBatchPilot.ts` (new), `src/world/Scatter.ts`, `src/town/TownTavernPilot.ts`, `e2e/f-astra-6-plain-boot.spec.ts` (new), a scripts guard for the culling, `assets/pilots/hero-3d/**` (blend, glb, atlas, builders, validators, compare page), `artifacts/sol/open-findings/**`; at the drain `assets/engine-era.json` (pin #13), the null-floor anchors, this review, `tasks/goals.json`, `tasks/BACKLOG.md`, `STATUS.md`, the desk register (the F-2627-1/F-NCS-5 text carried over).
