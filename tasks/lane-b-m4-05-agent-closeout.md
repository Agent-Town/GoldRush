# Lane B / M4-05: Prospector agent close-out — edge-matrix hardening (LANE-B, branch lane/m4, commit prefix "m4:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b. READ FIRST: AGENTS.md; docs/GOLD_RUSH_BRIEF.md §6-7 (the agent = "the Prospector") + §9 (canon). This is a close-out hardening pass — no new agent design.

## Pre-flight (drain-gated — lane/m4 was VERIFIED 0-ahead-of-main at authoring s92, so the reset below is loss-free)
GUARD FIRST: run `git rev-list --count main..lane/m4`. If it is **0**, proceed. If it is **non-zero**, the lane carries unmerged predecessor output — **STOP and report** (do NOT reset; a fire owes this lane a drain first).
Then: `git checkout lane/m4 && git reset --hard main && git clean -fd && npm install --no-audit --no-fund` (sanctioned once). `npm run build` green first.

**FIRE-AUTHORED s92 (attended review welcome).** This is a REFRESH of the Jul-5 master, which was stale in a way that mattered: its central premise — "run snapshot includes agent task+budget; coordinate shape with m3-02 via install() contract" — is a **phantom**. Verified against current main (s92 scout, evidence below): there is NO run snapshot/serialize/deserialize anywhere in `RunManager` at all. M3 "suspend-resume" is the *Claim Secured / Stay-for-the-Rush* pause overlay (`state.setPaused(true)`), not a save-restore. So the old task's snapshot-round-trip edge case cannot be written and is DROPPED. The agent-vs-player run-summary stats half is a genuine **design fork** (no `actor` tag on economy events, no agent fields in `DeathLedger`/`EconomySummary`) → carved out to **M4-08** (see BACKLOG), NOT in this task.

What remains — and is fully authorable against existing, verified behavior — is an **edge-matrix e2e hardening pass** that closes out M4 by asserting the agent's safety invariants at run-boundary transitions. No product behavior is invented; this task writes assertions only (plus, if a listed invariant is found VIOLATED, the minimal fix to restore it — see F-gate below).

## Goal
Lock down the Prospector agent's behavior at the three run-boundary edges with e2e coverage, so M4 can be marked closed with evidence. Assert only invariants that are unambiguously correct (no orphan receipts, clean reset, live per-call permission enforcement). Where current behavior is a *design* question (should the Prospector sprite visually halt on death/victory?), RECORD it as an open question in the review — do NOT assert a specific answer.

## Evidence chain (why this is authorable, not invented)
- Existing shipped work: m4-06 embodiment (`e2e/m4-06-embodiment.spec.ts`, `src/agent/Embodiment.ts`), m4-01 tool surface (`e2e/m4-01-tool-surface.spec.ts`, `src/agent/ToolSurface.ts`), task-026 collect-xp, task-027 victory-payout.
- Diagnostics surface (all VERIFIED present in `src/game/Game.ts:816-880`): `window.__THREE_GAME_DIAGNOSTICS__.agent.stub` = `AgentStubState` with **`receiptCount:number`** and **`receiptFeed:readonly string[]`** (`src/agent/AgentStub.ts:20-28,55-64`); `.agent.embodiment` = `ProspectorEmbodimentSnapshot`; `.run.lastRunEndedReason`; `.runState`/`.state` (paused|playing|dead).
- Verified behavior (s92 scout): agent tool calls are **synchronous one-shot** (no long-running async task, no cancel API — `AgentStub` has no per-frame update; it acts only when a tool is invoked). `decideToolPermission()` / `readAgentPermissionLevel()` are **stateless, read live per call** (`PermissionLadder.ts`). `this.prospector.update()` runs every frame in `updatePresentation()` regardless of runState. `resetRun()` calls `this.prospector.reset()` (`Game.ts:1088`).

## Scope (files you MAY create/touch)
- CREATE `e2e/m4-05-agent-closeout.spec.ts` — the edge matrix. Use `e2e/m4-06-embodiment.spec.ts` as the reference pattern for booting the game, driving a debug receipt into the agent, and reading `__THREE_GAME_DIAGNOSTICS__`.
- ONLY if an invariant assertion below FAILS against current code: the **minimal** product fix to restore that invariant, in the owning file (`src/game/Game.ts` or `src/agent/AgentStub.ts`). A fix here must be additive/guarding, <=~15 lines, and called out explicitly in your close-out message. If a "fix" would need more than that, do NOT fix — write the finding and leave the assertion as `test.fixme` with a comment.

## Firewall — DO NOT TOUCH
- No changes to `src/game/Economy.ts`, `DeathLedger`/`DeathOverlay.ts`, `RunManager.summarizeRun`, or any economy-event type. Agent-attribution stats are **M4-08**, not this task.
- Do NOT add a run snapshot / serialize mechanism. Out of scope, and no consumer exists.
- Do NOT change the Prospector's movement/idle/work behavior to "stop on death/victory" — that is an owner design call; only record it as an open question.
- Do NOT touch other lanes' hot files (main.ts, Balance.ts, SpriteAnimator, lighting, water).

## Edge matrix — each row is one or more e2e assertions
1. **Hero death -> no orphan receipts.** Boot, drive one debug agent receipt (confirm `agent.stub.receiptCount` increments to N>=1). Kill the hero (existing test path / debug hero-damage). After `runState==='dead'` and `run.lastRunEndedReason` is set: advance several frames and assert `agent.stub.receiptCount` does NOT increase (no NEW receipts generated in the dead state) and no console/page errors. **Invariant — must hold.**
2. **Reset clears the Prospector.** After a run ends, trigger `resetRun()` (new-run path). Assert `agent.embodiment` snapshot returns to home/base pose (position back near spawn, no lingering target/workRemaining). **Invariant — must hold** (regression guard on `Game.ts:1088`).
3. **Permission level enforced live per call.** At agent level 0, a side-effecting tool call (e.g. `place_building`/`pan_at` via the debug surface, mirroring m4-01's level-0 refusal test) is refused and produces no state change. Then raise the level via meta (`meta.tracks.agent`) and assert the same call now succeeds — proving the check reads live, not cached. **Invariant — must hold.**
4. **Victory ceremony safety.** With `secureClaimChoicePending()` true (Claim Secured pause), assert agent tool calls during the pause do NOT bank gold into a stale/next run and produce no console errors. Assert whatever is observable via diagnostics; do NOT assert the sprite stops. **Record** (open question, review only): the Prospector sprite currently keeps animating/moving through the victory pause and the dead state — is that desired, or should it visibly halt? Flag for owner.

## Gates (native, full runs — no splits)
- `npx tsc --noEmit` clean; `npm run build` green.
- New `e2e/m4-05-agent-closeout.spec.ts` PASSES desktop + mobile (390px).
- Regression: `e2e/m4-06-embodiment.spec.ts`, `e2e/m4-01-tool-surface.spec.ts`, `e2e/task-027-victory-must-matter.spec.ts`, and a boot probe (m1-01) — all green, zero console/page errors.
- Close-out message: one-paragraph M4 evidence summary + the victory/death "sprite keeps moving" open question spelled out for the owner.

## Sequencing / self-check
- GATE: none extra — `src/agent/Voice.ts` + Embodiment already on main; independent of the lane-d r3a drain and of lane-c world work (touches only e2e + at most a tiny guard in Game.ts/AgentStub.ts).
- Self-check before READY: did you invent any product behavior? (You should not have — this is assertions + at most one <=15-line invariant-restore.) Did you touch anything in the firewall list? Did you keep the run-summary stats OUT? If an invariant genuinely can't be asserted without new plumbing, mark it `test.fixme` with a note rather than building the plumbing.
- READY-FOR-GATES when the four rows are covered (or explicitly `fixme`'d with findings) and gates are green.
