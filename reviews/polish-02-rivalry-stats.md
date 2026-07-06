# Review — lane-c polish-02 rivalry-stats (s96 drain attempt)

**Verdict: BLOCKED — NOT merged. Corrective re-run queued to lane-c.**
Source: `lane/polish 00dfa90` (runner done-move `tasks/done/20260707-020405-lane-c-polish-02-rivalry-stats.md`), rerun of the polish-02 lost to a lane reset (s61).

## What it did (feature is sound)
Expanded death/victory run ledger (waves, gold panned/sluiced/stolen/reclaimed, buildings built/lost/repaired, spark-vs-blast damage, upgrades by family) + Best Claims scoreboard **v2** with base-value + weapon-split + v1→v2 migration. Files: `src/game/Economy.ts` (+31 summary fields), `src/game/ProfileStorage.ts`, `src/game/Scoreboard.ts` (+93 migration), `src/systems/CombatSystem.ts` (+14 damageByOwner), `src/ui/DeathOverlay.ts` (+81), `src/ui/theme.css`, `src/vite-env.d.ts`, new `e2e/polish-02-rivalry-stats.spec.ts`, `e2e/m1-08-wave18-corrections.spec.ts` (+14).

## Merge mechanics (were clean)
3-way squash-merge onto clean main `9e8f534` (BT-00) went cleanly — the 3 files BT-00 also touched (Economy.ts, BuildSystem.ts, vite-env.d.ts) auto-merged with no conflict (disjoint regions; both BT-00 `demolish` source and polish-02 rivalry summary fields coexist). tsc clean, build green on the merged tree.

## BLOCKING FINDING — F-POLISH02-1: victory-meta double-count
`e2e/task-027-victory-must-matter.spec.ts` goes **RED** on the merged tree: a single real victory applies the claim payout to `meta.tracks` **twice** — expected `{territory:1,science:1,hero:1,agent:1}`, received `{2,2,2,2}`. Both projects, deterministic (30s run, exact doubling — not a flake). The UI claim-payout still shows `+1` per track (those assertions pass); only the persisted/applied meta doubles.

### Causation proven (not assumed)
- pure BT-00 main `9e8f534`: task-027 **2/2 PASS** (verified in isolation).
- BT-00 + polish-02 merged: task-027 **2/2 FAIL** (tracks doubled).
→ polish-02-introduced. (An intermediate file-by-file checkout gave a false `nearestBuildingTo is not a function` — that was an inconsistent-tree artifact of the causation probe, not the real merged tree; discounted.)

### Mechanism (lead for the corrective)
`addMetaPayout` (`src/game/MetaProgress.ts:69`) has ONE guarded call site: `RunManager.awardSecuredClaim()` (guard `securedRunId===runId || endedRunId===runId`). RunManager/MetaProgress are OUTSIDE polish-02's scope, so the second application is a side effect of polish-02's ledger/scoreboard code — likely the expanded DeathOverlay/claim-office render re-invoking the secure/award path, or `recordScore`/`migrateLegacyScores` writing localStorage during the victory frame and triggering a meta re-load+re-apply. Corrective instructs Codex to log `addMetaPayout` calls in the failing run and remove the accidental second trigger.

## Disposition
- Main stays at BT-00 `9e8f534` (clean).
- `00dfa90` is buggy + unmerged → its lane-reset destroys nothing merge-worthy.
- Corrective master updated (`tasks/lane-c-polish-02-rivalry-stats.md`, CORRECTIVE header + task-027 added as a MANDATORY regression gate) and re-queued (`tasks/queue/lane-c/`). Runner resets lane/polish→main, re-runs fresh.

## Gates that DID pass (evidence, merged tree, scratch 5236)
tsc clean; build green; `polish-02-rivalry-stats` + `bt-00-demolish` + `m1-08` = 24 passed in the same batch — only task-027 failed. So the feature and its own spec are healthy; the defect is the meta double-count alone.
