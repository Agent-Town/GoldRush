# Review — W1-01 Terrain relief + anti-tiling (lane-c, specs/w1-river-valley)

**Verdict: PASS — merge to main.** Reviewed s61 attended (Fable 5), 2026-07-06 ~05:30Z.
Three pre-existing regressions discovered during the gate were attributed and split out (F-033-2a/b/c + F-033-3 → `tasks/queue/main/036-f033-2-m2-01-regressions.md`); none are caused by this slice (proof below).

## Evidence

| Leg | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (387 ms) |
| e2e w1-01 relief spec | 2/2 GREEN, desktop + mobile projects (relief range 0.8 > 0.3; river probe < farBank; mobile segments knob 40; zero console/page errors; hero/enemy visual-Y tracks terrain, XZ planar) |
| e2e task-025 bandits-dont-swim (unmodified) | 12/12 GREEN both projects — river-barrier sim-drift proof |
| e2e m1-01 claim-jumpers-death (unmodified) | GREEN both projects |
| e2e m2-01 build-menu (unmodified) | 5 failures — **pre-existing at HEAD, not w1-01** (see Findings) |
| Perf (`artifacts/w1-01/perf-*.json`, 60 enemies) | draw calls 89 → 89; frameAvg 8.34 → 8.33 ms; p95 9.6 → 9.9 ms — within noise, no regression |
| Visual (`reviews/shots-w1-01/`) | before/after compared full-frame + far-bank & near-bank crops |

## Code review (staged diff, 21 files, +347/−50)

- `src/world/Terrain.ts` — analytic `sampleHeight` (valley profile, claim-side calm zone, south rise, 3-octave value noise, `Balance.world.terrainRelief` knob, clamp [-0.18, 0.62]); `samplePaddedHeight` 5-tap average = local pad flattening; `visualY` render-side helper; displaced `PlaneGeometry` (desktop 64 / mobile 40 segments, clamped 24–96) + recomputed normals; anti-tiling shader: per-cell UV jitter + 3-texture world-space noise blend (sand/dirt/shore-scrub) + macro tint. `WATER_Y` extracted, ford at +0.015.
- Entities/Game/BuildSystem — all call sites are presentation-only (`visualY(x, z, baseOffset)`); movement, collision, targeting validity, lead-velocity math untouched. **Rendering-only law holds in code**, and unmodified task-025/m1-01 green is the behavioral proof.
- `Balance.world` additive; `vite-env.d.ts` diagnostics typing additive (`terrain.height` block, `heroVisualY`).

## Visual review (brief §4 + spec laws)

- Tiling: the uniform repeated speckle is gone; macro tint + organic mottling reads parchment-warm and engraved, not photoreal. PASS.
- Relief: banks shade down to the river, far bank raised; ford still reads as THE crossing; hero/enemy silhouettes pop. Legibility law PASS.
- Minor (no action): faint periodic banding remains at extreme far-bank distance; W1-03 fog/atmosphere will cover it. Watch in W1-03 review.

## Findings (split out, NOT blockers for this slice)

Attribution method: identical m2-01 runs in a detached worktree — clean HEAD `a0e5272` vs pre-merge `bc8c220` vs main tree with w1-01 staged (same config clone, port 5232/5231).

- **F-033-2a** `beacon cost curve` (desktop+mobile): `ui.buildMenuOpen` stays true after Digit-select. Green at bc8c220, red at HEAD → **introduced by 033+035 merge bf8c4f7**.
- **F-033-2b** `stress draw calls` (desktop): 229 vs ≤200 — **byte-identical 229 at HEAD and with w1-01 staged** (w1-01 adds zero calls). Green at bc8c220 → **introduced by 033+035**.
- **F-033-2c** `390px build menu clear of HUD` (both): overlap assertion fails **already at bc8c220** → pre-dates 033; older origin, needs layout inspection.
- **F-033-3** m5-04 harness leak: every m5-04 gate run posts 2 `order_local_prospector_*.json` into `assets/crafting-queue/pending/` and never cleans them — 6 had accumulated (02:58×2, 03:10×2, 03:30×2), swept out of the tree this session. Systemic; fix in 036.
- One-off: mobile `palisade footprint` failed once at bc8c220 only (passes at HEAD and main tree ×2) — recorded as flake, not chased.

**Gate rule until 036 lands:** treat exactly these 5 m2-01 failures (this fingerprint) as known-red; any NEW m2-01 failure is real drift.
