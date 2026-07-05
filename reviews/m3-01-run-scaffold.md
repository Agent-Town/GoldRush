# Review: M3-01 run-lifecycle scaffold (lane/m3 → main)

Slice: tasks/lane-a-m3-01-run-scaffold.md · Lane commit: `a6886f3` · Merge: `055ea68` (s31 fire, 2026-07-05)
Verdict: **PASS — merged.** First lane-branch drain under gate protocol v2 (evidence-first).

## What landed
- `src/game/RunManager.ts` (new): `install(game)` per ADR-002 §4; emits `run_started`/`run_ended(summary)`; summary is a pure replay of `economy.log` (goldPanned/Stolen/Reclaimed, buildingsBuilt = `gold_spent` events with `build_*` sinks — `repair_*` correctly excluded); waves from `waveSystem.diagnostics.wave` with `hero_died.wavesSurvived` fallback. Run boundary via wrap-and-restore patch of `game.resetRun` (own-property shadow; original always called; `dispose()` restores).
- `src/game/MetaProgress.ts` (new): `gr.meta.v1` versioned persistence, 4 tracks (`territory|science|hero|agent`), tolerant migration (junk → fresh defaults), `agent` a RESERVED numeric track, `agentAutonomyLevel()` = floor(agent) — exactly the ADR-002 M4 contract surface.
- `src/core/EventBus.ts`: append-only union additions (`RunSummary`, `run_started`, `run_ended`).
- `e2e/m3-01-run-scaffold.spec.ts`: 4 hermetic module tests + 1 in-page persistence test.
- **Merge-session work (mine, per ADR-002 §4, folded into `055ea68`):** Game.ts wiring — `installRunManager(this)` at constructor end + `runManager?.dispose()` first in `dispose()` (before `events.clear()`); EventBus three-way union merge (013's `building_*` + lane's `run_*` — both sides had appended at the same anchor, trivial keep-both); e2e `hero_died` emit gained `weaponToggles: 0, blastTime: 0` (013 widened the event after the lane branched — mechanical reconciliation, 2 lines).

## Gates (all green — sandbox /tmp/gr-s31, healthy VM, load ~0.2)
tsc 0 · vite build 0 (493ms) · m3-01 **8/8** (desktop+mobile, wiring live) · visual.spec **5/5** (new ?debug readout does NOT disturb HUD/canvas asserts) · m1-05 **6/6** (reset-heavy canary vs the resetRun patch) · vp-02 **11/11** · m2-07b **4/4** · boot probe desktop+390: zero console errors, readout renders both viewports (`reviews/shots-m3-01/`). Staged mount content md5-verified byte-identical to the gated tree before commit.

## Evidence context (v2)
- `reviews/evidence/mac-fullsuite-20260705-1059.md`: 116/119 — fails: m1-02 reset (known), m2-05b wave-12, soak-30.
- `reviews/evidence/mac-fullsuite-20260705-1147.md` (landed mid-fire, post-013/016 rebaseline): **118/119** — m2-05b 5/5 (1059 fail ⇒ one-off flake, keep as watch), soak-30 1/1 (**015's gate condition met** — landed `0f77122`), sole fail = m1-02 reset texture count (22→23; s10/s27 warm-depth family, s30 A/B'd the +Δ to 016's lazy mirror-bake — harness debt, NOT a leak).

## Findings (non-blocking)
1. **m1-02 harness debt (corrective written: `tasks/019-m1-02-reset-memory-modernization.md`):** the reset test still asserts absolute texture equality; needs the s27-law warm→grace→zero-growth modernization m1-05 got in s30. Only remaining red across both Mac sweeps.
2. **m3-01 page test is persistence-only:** it proves boot doesn't clobber `gr.meta.v1`, not that RunManager consumed it (it passed pre-wiring by design). Acceptable for a scaffold; m3-02 (suspend/resume) must add an in-page run-lifecycle assert (readout/meta reacting to a real run end).
3. **resetRun patch is an own-property shadow** — works against current Game.ts (internal `this.resetRun()` calls resolve through it), but a second patcher would stack silently. If M4's agent lane ever needs reset interception, promote to a real `run_reset` event instead of a second wrap. Noted in ADR-002's orbit; no action now.
4. Debug readout is a bare `<output>` in body flow, `?debug` only — visually harmless today (visual.spec green, shots clean); polish lane may reposition when it grows.

## Canon / invariants
Economy sole gold writer intact (RunManager is read-only over the log) · CombatSystem untouched · no new event writers beyond the two run events (M4 may subscribe, never emit, per ADR-002 §5) · naming clean · no client secrets.
