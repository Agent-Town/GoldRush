# Review — m1/05-sentry-beacon-build

**Verdict: PASS** (Codex implementation + 4 supervisor review-fixes, all ≤20 lines each, no correction round needed).
Codex session E: `019f2741-d3eb-7962-b9b3-7946d440d98c` (~16 chunks; write-livelock mid-run broken with "TWO patches, zero prose" nudge + reasoning_effort=low for the write phase).

## What shipped

- `src/entities/SentryBeacon.ts` — `SentryBeaconPool`: 6 InstancedMesh parts (3 legs, cap, glass, core) allocated once at construction, hide-matrix pattern (mirrors XpMotePool), pulsing teal lantern core, slot-tagged `bld.sentry_beacon`. Silhouette = brass surveyor tripod + teal lantern. Not a cannon.
- `src/systems/BuildSystem.ts` — build mode (B key / HUD button, sim keeps running), ghost with pointer ray→ground + grid snap, keyboard fallback ghost 2 m north of hero, validity = isBuildable ∧ ≤6 m ∧ no-overlap 1.2 ∧ affordable ∧ under cap; teal/rust ghost; `confirm` spends **only** via `economy.apply(gold_spent/build_sentry_beacon)`; `beaconCost(n) = ceil(25·1.3ⁿ/5)·5` → 25/35/45/55/75/95; reset() unregisters shooters + hides pool.
- `src/systems/CombatSystem.ts` — single-path extension: `registerShooter` returns disposer; `ShooterHandle.id?`; bolts carry `ownerId`; `killsByOwner` tally (reset-cleared). No second targeting/projectile path.
- `src/ui/BuildButton.ts` + Hud/UiBridge — ui/ contract respected (snapshot in, intent out, no three.js): cost label, disabled at cap/poor, pressed state.
- `src/systems/HarvestSystem.ts.reset()` (carried minor from 04) — channel/progress/nodes restored; wired into `Game.resetRun()` with `buildSystem.reset()`.
- Diagnostics: `build.{mode, ghostValid, ghostPos, beacons, beaconPositions, nextCost, killsByOwner}`; `__GR_TEST__.grantGold` (routes through Economy — sole-writer preserved) + `setBuildMode`.
- `e2e/m1-05-sentry-beacon-build.spec.ts` — 6 tests: keyboard build+spend, beacon kill attribution, river rejection (no spend), cost escalation 25→35→45, resetRun clears beacons+tallies with exact renderer-memory stability, harvest reset.

## Supervisor review-fixes (in-commit)

- **A. `confirm` intent edge-triggered** in Game (`lastConfirmIntent`) — was firing every held frame (masked by overlap check; wrong pattern).
- **B. `Balance.beacon.volley`** — beacon handle borrowed `Balance.sparkRig.volley`; beacons own their knob now.
- **C. Ghost keyboard-fallback offset +2 m north + opacity 0.62** — at hero position the ghost was fully swallowed by the hero mesh (probe-verified); now clearly readable (screenshots).
- **D. Deterministic kill test** — see finding below.

## Findings worth remembering

1. **Bolt-diffusion (root cause of a flaky kill assert):** bolts hit the first pool-ordered enemy within radius on the flight line, not the aimed target — in a clump, beacon damage diffuses (probe: 7/7 bolts HIT for 56 damage, zero kills across 6×28 HP). Receding/approaching targets are always caught (radial, no lateral drift); only crossers/clumps diffuse. Kill-attribution e2e now uses a **single Jumper** (all bolts concentrate → 4th kills) with the rig 30 m out of range. 3× stable, tracing on. Gameplay-wise dumb bolts stay (M1 feel is fine; diffusion in clumps is arguably charming) — revisit only if 07 tuning says otherwise.
2. **Playwright tracing is a fps/timing confounder** — `trace: retain-on-failure` records during passing runs too; it re-rolled the diffusion coin. Never chase "trace-on vs trace-off" as the bug itself; find the underlying nondeterminism.
3. **Renderer-memory leak gates need a warm cycle along the measured path** — camera sweep lazily uploads frustum-culled geometry (+1 on a mere teleport, probe-verified); m1-05's reset test does one full identical cycle before baselining. Same principle as the m1-02/m1-01 `warmVfx()` warm-ups added with the XP-float commit.
4. **Pre-existing dark props** (M0 claim-post + stump, `palette.wood`) read near-black at gameplay zoom — same tonal family as "dust-puff reads black". Not m1-05 scope → batched to m1-07 tuning / batch-001 art. Probe shots in `reviews/shots-m1-05/`.
5. Cost-table note: spec's example "(25/35/45/60)" was internally inconsistent with ×1.3; formula wins → 25/35/45/55/75/95 (all knobs in Balance for 07).

## Evidence (GATE-STD)

- `tsc --noEmit` clean; `npm run build` green.
- Full e2e regression **30/30** (visual 5, feedback-fx 3, m1-01 4, m1-02 3, m1-03 5, m1-04 4, m1-05 6) — serial, desktop-chrome, final code state; the two formerly-flaky m1-05 tests re-run 3× green.
- Draw calls **35** @ `?stress=120` + 6 beacons placed (budget ≤200). frameMs avg 48.9 SwiftShader headless (floor gate only; hardware gate at 07/Robin).
- Screenshots (`reviews/shots-m1-05/`): `final-ghost-valid-teal.png`, `final-ghost-invalid-rust.png` (readable validity colors), `desktop-beacons-firing.png` (placed beacon = tripod + teal lantern, kill attribution `{beacons:1, hero:1}` live), `desktop-stress-6beacons.png`, `mobile-build-mode.png`. Known ?debug-only dark rectangle present in debug shots (carried minor, watch).
- Playable checkpoint: pan gold → B → teal ghost → Enter → beacon holds a lane (kills attributed) while hero pans elsewhere; restart clears beacons/harvest → replayable.

## Deferred / notes for later slices

- Mobile ghost placement = hero-position fallback only (no touch-drag ghost) — acceptable M1; note for M2 build UX.
- Beacon lantern glow subtle at gameplay zoom — batch-001 real art / 07 emissive tune.
- Shared `shooterPos` scratch across beacon handles is safe today (TargetingSystem never retains the origin) — style note, don't copy the pattern into anything that stores positions.
