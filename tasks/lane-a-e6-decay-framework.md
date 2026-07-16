# Task lane-a-e6-decay-framework: the unified decay-timer framework (E6's grammar; E7's determinism foundation) — INERT until E6 arms (LANE-A, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; specs/epoch-saga/e6-atomic-bundle.md §C ("Decay-timer framework (unified tick system: buffs/hazards/enemies on one scheduler — E7's replay determinism depends on its cleanliness)"); src/game/Game.ts (the fixed-timestep loop + events bus — find the sim tick and the event emission pattern); src/diagnostics/DeterminismHarness.ts (the determinism proof surface this slice must satisfy); src/game/Balance.ts (where the config block lands).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

GROUND-TRUTH pre-flight: grep `DecayScheduler\|DecaySystem` across src/ — absent (this is a build-in-full). If present, STOP and report SHIPPED.

## Why (E6 engine prereq §C; era ladder opened 2026-07-17)
E6's thesis: "Everything in this era TICKS: buffs decay, hazards decay, enemies decay. Time itself becomes a resource you read on teal dials." Every E6 mechanic (decay puddles, wind-down wrangle, half-life caltrops, the Decay Clock's slow-aura, the Homemaker's timers) registers against ONE scheduler — and the bundle's own warning: E7's replay determinism depends on this scheduler's cleanliness. Built NOW, inert, ahead of E6 arming — the proven e5-03 pattern (shipped inert while its era was unarmed; zero effect on live play).

## Scope
1. **DecayScheduler** (new, src/systems/DecaySystem.ts or equivalent): deterministic, fixed-timestep-driven. API (shape per house patterns, names yours): `register({ id, durationTicks, paused?, onExpire? }) → handle`, `cancel(handle)`, `remaining(handle)/fraction(handle)` (the future dial-render query), `setAuraModifier(zone, factor)` stub for the Decay Clock's 10% slow (registered zones scale tick consumption — implement the math; nothing creates zones yet). Ticks ONLY from the sim's fixed timestep (never wall-clock); ordering stable and seed-independent (iteration order = registration order, ids deterministic).
2. **Event-log integration**: emits `decay_registered` / `decay_expired` through the existing events bus with tick stamps — the E7 replay contract (events are the truth; the scheduler must be fully reconstructable from them).
3. **Balance block**: `Balance.decay` — placeholder-reasonable defaults (aura factor 0.9 per the Decay Clock's 10%).
4. **INERT LAW**: NO existing system, effect, enemy, or building registers anything in this slice. The only consumers are the spec (below) and a `?debug`-gated harness registration hook for future probes. Plain-boot behavior byte-identical.
5. **New spec e2e/e6-decay-framework.spec.ts** (GATE-AUTHORSHIP — assert exactly, desktop AND mobile):
   a. DETERMINISM A/B: two same-seed `?debug` runs each registering the same N spec-driven decays (mixed durations, one paused-and-resumed, one aura-modified) produce IDENTICAL `decay_expired` tick sequences in the event log.
   b. Pause correctness: a paused entry's `remaining` freezes; resume completes at the shifted tick, deterministically.
   c. INERT proof: plain boot (no `?debug`) — zero decay events in the log; task-025 baseline unmodified-green.
   d. Zero console/page errors.

## Firewall
Touch ONLY: the new system file, ≤10-line install site in Game.ts (construct + tick call on the fixed step), Balance.ts additive block, the spec, diagnostics typing if needed.
NO changes to: any existing effect/buff/hazard timing (migration is E6-arming work, NOT this slice), CombatSystem, WaveSystem, existing e2e assertions, render/UI (dials are a later render slice).

## Self-check (evidence, not vibes)
tsc + `npm run build` green. e6-decay-framework.spec.ts green desktop+mobile. Adjacent unmodified-green both projects: task-025 baseline, the determinism harness spec if one exists (name what you ran). Zero console/page errors. Report the determinism A/B tick sequences as evidence.
No-op guard: if you exit without changes, WRITE WHY into your report first.
End: READY-FOR-GATES + report: the API as landed, the A/B sequences, and any fixed-timestep integration surprises as findings.
