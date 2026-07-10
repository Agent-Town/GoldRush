# Task 073-tier-param-crash: the tier URL param must not crash the Start Menu (MAIN slot; commit prefix "fix:")
CODEX: model=gpt-5.5 effort=medium
FROM swarm finding [high] `reviews/swarm-48h-confirmed.json` ("Tier URL param triggers infinite read→save→notify recursion, crashing the Start Menu") — root: `src/game/PerformanceTier.ts:156` region: the URL-param apply path writes the stored tier, the write notifies listeners, a listener re-reads/re-applies the param → unbounded recursion.
Pre-flight: main-slot tracked-clean (artifacts/logs/docs/tasks exempt). READ FIRST: the finding's full evidence JSON entry, `PerformanceTier.ts` (read/save/notify + the URL-param path from 058), `StartMenu.ts` tier control wiring.
## Scope
1. Break the cycle structurally (idempotent apply: skip save+notify when the value is unchanged; and/or a re-entrancy guard on the notify path) — pick the fix the evidence supports, not both blindly.
2. RELATED (same file, fold in): the stored tier is device-hardware-specific but travels with the profile via cloud sync (`ProfileStorage.ts:38` swarm finding) — move the tier key OUT of the synced profile-data key set (device-local key), with a read-through migration for existing values.
3. e2e: boot with `?tier=lite` → menu renders, tier applied once (spy/counter), no console errors; settings tier switch still live-applies; profile export/sync excludes the tier key.
Firewall: PerformanceTier.ts + the key-set line in ProfileStorage.ts + its e2e ONLY. NO render knob changes, NO 058 tier semantics changes.
End: READY-FOR-GATES + the recursion-fix explanation + e2e output.
