# Review — mp-03-second-hero (lane-d) — VERDICT: RE-LAND (NOT merged)

- **Slice:** mp-03-second-hero (per-player hero actors, determinism-critical MP slice)
- **Source:** `lane/perf` @ `8cca08f` (`runner(lane-d): mp-03-second-hero.md`); salvage-tagged **`save/mp-03-second-hero`**
- **Ruled by:** s279 fire

## Verdict
**RE-LAND — do NOT merge `8cca08f` as-is (Mistake #15: The Blind Hand-Merge).** The runner built mp-03 on a **stale, pre-MP-02 base**; grafting its diff would silently **revert three shipped features**. Nothing was merged; the work is preserved as `save/mp-03-second-hero` and a corrected re-land master is authored off current main.

## Why (verified, not inherited)
- **Base = `9f9ab52`** (`mkt: Stage-1 teaser briefs`, **2026-07-09 06:53** = ~18.5h stale vs main tip 2026-07-10 01:32). `git merge-base --is-ancestor 9f9ab52 HEAD` = YES → base is an ancestor of main, i.e. main has moved ~18h past it.
- **Base predates MP-02.** MP-02's lockstep core landed on main via **`ef5e802`** (`mp: MP-02 lockstep core → main`), which is *after* `9f9ab52`. So `src/mp/LockstepClient.ts` and `e2e/mp-02-lockstep.spec.ts` show as **Added (A)** in mp-03's diff — the runner **re-created** them (a fork) because its tree lacked the shipped MP-02. They already exist on main with the gated MP-02 content. Grafting mp-03's versions would overwrite shipped, gated MP-02 with an unreviewed fork.
- **mp-03's `Game.ts` REVERTS main features** (decisive). Its diff vs main *removes* imports that are live on main:
  - `discoverLedgerBuildable / discoverLedgerEntry / ledgerEnemyEntryId / revealLedgerEnemyStats` + `EnemyLedgerEntryId/LedgerEntryId` — the **encyclopedia ledger**.
  - `installRunTelemetry` (`telemetry/runBeacon`) — **tl-01 anonymous run telemetry** (`a47af3c`).
  - `performanceTierDiagnostics` (`PerformanceTier`) — **058 device tiers** (`8ba15b4`).
- **Hot-file divergence on both sides:** main changed `src/game/Game.ts`, `src/systems/CombatSystem.ts`, `src/game/RunSuspend.ts`, `e2e/mp-02-lockstep.spec.ts`, `src/mp/LockstepClient.ts`, `src/vite-env.d.ts` since the base; mp-03 changed the same. Determinism is this slice's explicit law — a 3-way graft across these carries exactly the "subtle merge corruption" Mistake #15 forbids trading agent-hours to avoid.

Drain-skill §1 STOP condition met verbatim: *"Base >~12h stale AND conflicts on hot files (Game.ts/CombatSystem/main.ts)? → STOP. Rule the RE-LAND path."*

## Action taken this fire
1. **NOT merged** — main is untouched by mp-03; no revert needed (nothing landed).
2. **Salvage preserved:** `git branch save/mp-03-second-hero 8cca08f` — the runner's work is durable independent of lane/perf. lane/perf may be reset safely for its next task, but **do not refill lane-d until the re-land ships** (LANE-SAFETY: lane/perf is still ahead of main at `8cca08f`).
3. **Done-move retired:** `tasks/done/…mp-03-second-hero.md` → `tasks/failed/reland-s279-mp-03-second-hero.md` (prevents a re-drain attempt by the next fire).
4. **Re-land master authored:** `tasks/mp-03-second-hero-reland.md` (FIRE-AUTHORED, attended review welcome) — same scope/firewall/owner-rulings, but based on **current main** (which already has shipped MP-02 + encyclopedia + tl-01 + 058), with `save/mp-03-second-hero` as the logic reference for the per-player-hero promotion.

## Findings
- **F-mp03-1 (blocking-for-this-graft, resolved by RE-LAND):** stale pre-MP-02 base → graft reverts encyclopedia/tl-01/058 and forks shipped MP-02. Resolution = re-land off current main (above), not a hand-merge.
- **F-mp03-2 (process, non-blocking):** the runner's lane-d pre-flight reset to `9f9ab52` rather than current main — that is why an ~18h-stale base was used. Worth a look at why the lane-d worktree wasn't at current main when mp-03 was picked up (2026-07-10 00:24), so future MP/sim lanes don't repeat it. (Flagged to owner/attended.)
