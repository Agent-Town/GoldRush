# ADR-002: M3↔M4 interface contract (frozen for parallel lanes)

Date: 2026-07-04 · Decided by: Claude (orchestrator), Robin informed · Status: accepted

M3 (roguelite meta) and M4 (agent partner) build in PARALLEL lanes. To keep them independent:
1. M3 owns `MetaProgress` (persisted, versioned `gr.meta.v1`): dimensions `territory | science | hero | agent` — the `agent` dimension is a RESERVED numeric track M3 renders but does not interpret.
2. M4 consumes `MetaProgress.agentAutonomyLevel` (derived from the agent dimension) as the ONLY meta input to its permission ladder. M4 never writes MetaProgress.
3. M4's surface is typed tools in namespace `et.goldrush.*` (snake_case verbs, brief §9.4), approvals/receipts per the Foreman pattern (brief §6-7). Tool count/shape is M4-internal.
4. Neither milestone edits `Game.ts` in-lane: each exposes an `install(game)` module; wiring happens at MERGE by the gating session (orchestrator-owned integration).
5. Run lifecycle events (`run_started`, `run_ended` with summary) are emitted by M3's RunManager on the EventBus; M4 may subscribe, never emit them.
