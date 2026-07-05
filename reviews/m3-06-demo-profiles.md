# Review: m3-06 demo-profiles (lane-a) — VERIFIED IN-LANE, INTEGRATION DEFERRED

s45 fire 2026-07-05T14:36–14:52Z. Verdict: **slice GREEN in its own universe; do NOT merge to main yet** — see blockers.

## Evidence (snapshot /tmp/gr-s45a = worktrees/lane-a minus node_modules/.git, npm i warm cache)

- tsc EXIT 0; vite build EXIT 0.
- e2e/m3-06-demo-profiles.spec.ts: **2/2 desktop-chrome (24.7s), 2/2 mobile-chrome (27.4s)** — two-profile isolation (meta/suspend/Best Claims) incl. mid-run `switchProfile('bob') === false` assert (spec line 24); legacy single-profile migration → profile "Robin" with difficulty + hints defaults.
- Canary m3-01-run-scaffold: 4/4 desktop.
- Shots: reviews/shots-m3-06/title-desktop.png + title-390.png. Claim-Ledger picker parchment/teal, on-brief (§4); naming "ledger/claim" per §9.4; Robin profile carries "Trail" preset tag.

## Scope (from run log, tasks/runs/20260705-205938-…demo-profiles.md.log)

New: src/game/ProfileManager.ts, src/game/ProfileStorage.ts, e2e spec. Shared-file edits in-lane: main.ts (`installProfiles(game)` wiring), EventBus, Hero, Balance, Economy, MetaProgress, RunManager, Scoreboard, HarvestSystem, DeathOverlay, theme.css, vite-env.d.ts, index.html, Game.ts. Storage: gr.profile.v2 wrapping gr.meta.v1 / gr.run.v1 (suspend) / gr.scores.v1 / gr.history.v1.

## Findings

1. **Firewall respected in substance**: worktree Game.ts has ZERO Profile refs (wiring lives in main.ts). The Game.ts `diff --git` blocks in the run log are codex EXPLORATORY diffs vs main (a-side contains main-only src/agent imports) — not edits. Do not use run-log diffs as scope ground truth; they mix exploration with patches.
2. Coverage folded: task demanded 3 e2e scenarios, spec has 2 `test(` — mid-run-switch-block is asserted inside test 1. Acceptable; note for spec hygiene.
3. `difficultyPreset` stored as plain string, default 'trail' — exactly the plug 024 needs (024 is writing union 'greenhorn'|'trail'|'vein-hunter' into Balance right now). Interlock intentional per task text.
4. Non-blocking minor: at 390px the "P - back to the claim" chip grazes the Build button (cosmetic, pre-existing chip position).

## Integration blockers (why not merged this fire)

- **Live overlap with main-slot 024** (started 14:33:42Z): both touch Game.ts, Balance.ts, main.ts, vite-env.d.ts. Committing m3-06 into main mid-024 = race. Gate 024 first.
- **Chain dependency**: m3-06 sits on UNGATED lane-a backlog m3-02 (suspend gr.run.v1), m3-03, m3-04, m3-05 (gr.history.v1) + m5-01 crafting. Profiles wrap those stores; standalone cherry-pick won't type-check semantically.
- **Worktree git unregistered** (fatal: .git/worktrees/lane-a missing) → no mechanical per-slice diffs. Integration = orchestrator merge-sessions per slice, m3-02→06 order, s31/s32 pattern (in-lane evidence reused, on-main re-verify each).
- **Cross-lane crafting fork**: lane-a holds m5-01 src/crafting; lane-b m5-04 built its own src/crafting (AssayBench/CraftingQueue/Contract + contract.v1.json). Unify at integration — m5-04's contract.v1.json is the durable artifact. Robin decision may be needed on which shape wins.
