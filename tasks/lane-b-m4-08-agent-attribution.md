# Task M4-08: agent-vs-player attribution in run summaries (LANE-B, branch lane/m4, commit prefix "feat:")

**FIRE-AUTHORED s113 (attended review welcome)** — owner ruled it directly in the 2026-07-07 interactive session: *"M4-08 = YES full attribution → FIRE-AUTHORABLE NOW"* (tasks/BACKLOG.md, twelve-rulings block + lane-b ladder item 4). The s100/s92 design fork is CLOSED by that ruling — what remains is the economy-event plumbing the s92 scout already mapped. This is mechanical, not a design fork. Spec anchor: `specs/m4-agent-ux/README.md` line 21 (M4-08: "agent-vs-player attribution in run summaries — the economy-event plumbing question stands").

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.

## The one-sentence goal
Run summaries should attribute value-adding work agent-vs-player — e.g. the death/victory card reads **"Gold Panned — you 140 / Prospector 95"** instead of a single blended number — WITHOUT changing any gold total, run outcome, or determinism (this is a pure additive *display attribution*, nothing more).

## READ FIRST (verified surfaces — 2026-07-07)
- AGENTS.md; `specs/m4-agent-ux/README.md` (§The panel item 4 receipts + M4-08 line 21).
- `src/game/Economy.ts`: the `EconomyEvent` union (L11–22 — value-adding types are `gold_panned`, `gold_sluiced`, `gold_reclaimed`), `summarizeLog` (L73), `EconomySummary` (L29). Events are created at emit sites and applied via `economy.apply(...)`.
- `src/game/RunManager.ts`: `summarizeRun(log, wavesSurvived): RunSummary` (L266) — accumulates `goldPanned`/`goldStolen`/`goldReclaimed`/`buildingsBuilt`; and the run-summary overlay HTML that renders `<dt>Gold Panned</dt><dd>${summary.goldPanned}</dd>` (around **L207**) — THIS is the display target.
- `src/core/EventBus.ts`: the `RunSummary` type (add the attributed fields here).
- `src/agent/ToolSurface.ts`: `AgentCollectXpResult.collector?: 'prospector'` ALREADY EXISTS (L19) — the attribution vocabulary is half-wired; extend it, do not reinvent it.
- `src/agent/Embodiment.ts` + `src/systems/HarvestSystem.ts` (L180 `gold_panned` emit) + `src/game/Game.ts` (economy.apply sites ~L347/L505, and where the Prospector's collected value enters the economy): the emit sites you must classify player-vs-prospector.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
lane/m4 is currently **0-ahead of main** (verified at authoring). The runner auto-commits lane output, so an ahead lane branch is normal — but here there is none. So: `git checkout -B lane/m4 main && git clean -fd` and PROCEED. **STOP** only if the worktree holds uncommitted edits you did not make, or the branch is ahead of main with a commit whose PRODUCT is not already on main (would mean an undrained predecessor — do not `clean`/reset over it; report instead). Then `npm install --no-audit --no-fund`; `npm run build` green before you start.

## Design law (do not violate)
- **Attribution is display-only.** The `actor` tag adds information; it NEVER changes `reduce()` gold math, totals, run end conditions, or the economy replay. `summarizeLog`'s existing outputs must be byte-identical for any given log (add new fields, do not alter existing ones). This is the determinism/regression anchor.
- **Default = player.** An event with no `actor` tag counts as the player. Only actions the Prospector actually drives get `actor: 'prospector'`. This makes a no-agent run (and every existing test/replay) read exactly as today.
- **Honest zero.** If the Prospector contributed 0 to a metric, the card shows the single total as today (no "you N / Prospector 0" clutter). The split line appears ONLY when the Prospector's contribution > 0.
- Canon/voice: ledger voice, "the Prospector" (brief §9.4), agent-as-partner not tool (§3.2). "you" / "the Prospector" phrasing, never "AI" / "bot".

## Scope
1. **Tag the event type.** Add an optional `actor?: 'player' | 'prospector'` to the value-adding `EconomyEvent` variants that an agent can drive (at minimum `gold_panned` and `gold_reclaimed`; include `gold_sluiced` if an agent path reaches it). Keep it optional so all existing constructors and the replay stay valid.
2. **Tag the emit sites.** Trace every place a value-adding economy event is created (grep `economy.apply`, the HarvestSystem pan emit, any Embodiment/collect-xp path that credits gold). Player-driven sites stay untagged (or `'player'`). Agent-driven sites — the Prospector's autonomous collection/pan/reclaim, keyed off the same signal as `AgentCollectXpResult.collector` — emit `actor: 'prospector'`. If the Prospector currently drives NO gold event (only XP), scaffold the plumbing anyway and wire the one path that exists; the attributed number may legitimately be 0 today and grow as L2/L3 behaviors land — say so in your handoff.
3. **Split the summaries.** In `summarizeRun` (and `summarizeLog` if the death card uses it), accumulate a per-actor breakdown alongside the existing totals — e.g. add `goldPannedByProspector` / `goldReclaimedByProspector` (or a nested `byProspector: { panned, reclaimed }`) to `RunSummary`. Existing fields keep their current blended meaning (total across both actors) so nothing downstream breaks.
4. **Surface it on the card.** In the run-summary overlay (RunManager.ts ~L207), when the Prospector's contribution to a shown metric > 0, render the split ("you {player} / Prospector {prospector}") under/beside that metric; otherwise render the total as today. Keep it glanceable and in ledger voice. Give the split element a stable `data-testid` (e.g. `summary-gold-panned-split`) for the e2e.
5. Do NOT build new UI panels, NEW behaviors, or touch the ceiling/consent model — this is attribution of work that already happens.

## Firewall
Touch ONLY: `src/game/Economy.ts` (event `actor` field + `summarizeLog` breakdown), `src/game/RunManager.ts` (`summarizeRun` breakdown + overlay render), `src/core/EventBus.ts` (`RunSummary` attributed fields), `src/agent/ToolSurface.ts` + `src/agent/Embodiment.ts` + `src/systems/HarvestSystem.ts` + the minimal `src/game/Game.ts` emit-site tagging needed to set `actor`, `src/styles.css` (only if the split line needs a style), and new/edited e2e. **NO Balance / meta-threshold / victory-payout changes. NO PermissionLadder / AgentConsent changes. NO change to `reduce()` gold arithmetic or existing summary field meanings.** Do NOT touch other lanes' files (ResearchTree, BuildSystem tiers, StartMenu, terrain, vfx/RenderLayers).

## Self-check (acceptance)
- `npx tsc --noEmit` clean; `npm run build` green.
- **Determinism/regression proof:** existing economy + run-summary tests stay green with byte-identical totals; a run with NO agent activity renders the card exactly as before (single number, no split line). State this explicitly.
- New `e2e/m4-08-agent-attribution.spec.ts`, plain boot (NO ?debug), desktop + 390px:
  - Drive (or seed) a mix of player-panned and Prospector-collected gold, end the run, assert the card shows the split with the correct two numbers summing to the blended total.
  - Assert a player-only run shows NO split line for that metric (honest-zero).
- Regression green both projects: `m4-07-prospector-panel` (if present on main), `m4-06-embodiment`, `m4-05-agent-closeout`, `m4-01`, `task-027-victory-must-matter` (run serial if the 4-worker batch flakes — F-042-1/F-S106-1 concurrent-load family).
- Zero console/page errors both viewports.
- Screenshots into `artifacts/m4-08-attribution/`: card-with-split-desktop, card-with-split-mobile, player-only-no-split.
- Commit on lane/m4 (`feat:` prefix). End your run with: **READY-FOR-GATES** + files changed + WHERE you tagged `actor:'prospector'` (which emit sites) + whether any agent gold path exists today or the number is scaffolded-at-0 + any finding.
