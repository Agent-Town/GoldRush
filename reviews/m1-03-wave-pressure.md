# Review: m1/03-wave-pressure

**Verdict: PASS** (1 correction round — a real alive-cap overshoot, found by supervisor live probe, fixed properly instead of softening the test). Codex session D `019f2701-f227-7710-a6f1-884cb5d10232` (fresh), session 3 orchestrator.

## Scope delivered

- `src/systems/WaveSystem.ts` — owns ALL enemy spawning (scheduled trickle + numbered wave pulses + debug packs + `?stress` ring, one internal spawn path). Sim-time driven with catch-up while-loops (correct under `?timescale`). Grace 5 s; trickle 1/2.4 s ×0.97 per 10 s, floor 0.8 s; wave every 30 s: pulse 3+3·wave from a random compass edge (ring 26 m, clamped ±38); HP ×1.12 / speed ×1.02 (cap ×1.3 absolute) per wave via spawn params; alive cap 60 recomputed before every single spawn (no partial overshoot — the correction).
- Banner slot is now **evented**: `UiBridge.announce(text, atSim)`; opening "Stake your claim." routed through it (feedback-fx e2e unchanged and green); wave banners rotate edge-matched flavor copy ("Rustlers on the north bank!", "They want the gold, not the glory." …) — frontier tone, no ethnic references, matches §9.3.
- HUD shows Wave N in vitals; death overlay Run Ledger gains WAVES SURVIVED ("CLAIM JUMPERS TURNED BACK" stays — prosperity framing ✓).
- Debug/test flags: `?nowaves` (scheduler idle, harness spawns still work), `?nokill` (combat deals no damage — cap testable), `?nospawn` unchanged as hard block.
- Diagnostics extend-only: `wave`, `nextWaveInSim`, `trickleInterval`, `waveSpawnedTotal`, `waveState`.
- `e2e/m1-03-wave-pressure.spec.ts` — 5 tests: grace window, wave banner + schedule, spawn accounting band (28–47 by sim-60; observed ~40), alive cap ≤60 sampled to sim-90 (max >50 asserted), resetRun mid-wave (wave→0, opening banner returns, counters reset).

## Correction round (evidence-driven)

e2e "alive cap" failed twice; Codex began re-running it (livelock pattern). Supervisor live probe at `?nokill&timescale=8` produced the curve: t5→0, t29→10 (trickle exact), t33→+6 (wave 1), t63→+9 (wave 2), **t91→61 alive (wave-3 pulse breached cap 60)**. Real bug: cap allowed partial pulse overshoot. Fix: remaining-cap recomputed before every spawn. Test asserts kept strict (≤60 every sample; max >50).

## Gates (all run by orchestrator, post-fix)

- `npx tsc --noEmit` clean; `npm run build` green.
- Full regression, serial, desktop-chrome (pw.reuse config, per-file/per-test batches): m1-01 **4 passed** · m1-02 **3 passed** · m1-03 **5 passed** · m1-04 **4 passed** · visual **5 passed** · feedback-fx **2 passed** → **23/23**.
- Zero console/page errors asserted inside every spec.
- Existing tests that assume no ambient spawning got `?nowaves` (m1-01, m1-02, m1-04, visual, feedback-fx gold test) — minimal-diff URL changes only.
- Screenshots: `reviews/m1-03-wave1-banner.png` (banner + WAVE 1 vitals + XP motes visible), `reviews/m1-03-death-overlay.png` (Run Ledger with waves survived, "Stake Again").

## Fun verdict

Recorded in `specs/m1-core-loop/slices/03-wave-pressure.md`: **NOT FLAT — no reslice.** Stationary dies t50/wave 1; instrumented kiting survives into wave 3 with HP eroding and gold income frozen by pressure — mining-under-threat tension is mechanically present. Tuning concerns (HP erosion slope, early-gold scarcity, trickle floor beyond wave 3) parked for 07 with lil-gui.

## Findings carried (not blockers)

- `?stress` ring bypasses the wave alive-cap by design (perf harness needs >60); respects pool capacity 96. Documented here so 07 doesn't "fix" it.
- WaveSystem.diagnostics getter allocates one object per frame (matches the existing publishDiagnostics pattern — fold into any future diagnostics dedup, not urgent).
- XP counter renders overflow ("21 / 12 XP") until 06 consumes levels — expected pre-06 state.
- Intermittent dark rectangle in `?debug` screenshots (bottom-right, canvas-rendered, screen-anchored, never in default views) — investigated extensively during the feedback slice (DOM ruled out; raycast hits plain ground; not reproducible after settling). Watch during 05/06 reviews; escalate only if seen without `?debug`.

## Ownership invariants checked

Only WaveSystem spawns (debug T + stress routed through it) ✓ · only CombatSystem damages enemies ✓ · Economy untouched by WaveSystem (no imports) ✓ · ui/ DOM-only ✓ · diagnostics/UiSnapshot extend-only ✓ · speed cap enforced absolute ✓ · zero per-frame allocation in spawn path (scratch vectors, static copy table) ✓ · no beacons/upgrades/persistence ✓.
