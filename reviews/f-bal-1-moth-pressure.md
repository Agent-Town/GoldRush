# Review — f-bal-1: the migration threatens a dark claim

**Slice/branch/tip:** f-bal-1 (`tasks/lane-fbal1-moth-pressure.md`) · `lane/c` · tip `e7625b7c6` · merged to main (merge commit parent2) · drained attended 2026-08-08. Owner ruling folded verbatim: "Tighten it."

**Verdict: MERGED — gate green after one drain-side merge-interaction fix (below) and two documented instrument classes.**

**What it does:** Moth Season's migration no longer opts out for a lightless claim. Shared `MothSwarm.waveSize()` = `max(mothsBaselinePerWave, lights × mothsPerLightPerWave)`, config-driven (`mothsBaselinePerWave: 4` on e3-moth-season; optional field, zero-default for canyon-works compatibility — caught by the run's own independent review). The run's diagnosis moved the aim honestly: moths deal zero contact damage, so the lethal component is `night_runner` pressure (hpScale → 1.75). Acceptance measured both ways: **idle now dies at wave 4** (was: secured); **the competent lantern/turret/harvest fixture (`scripts/fixtures/moth-season-orders.json`) still secures at wave 12** — both byte-identical across node 23/26. F-BAL-1 CURED.

**Deviation, stated:** the master targeted idle failing "by ~wave 8-10"; the run reports the roster has a sharp deterministic threshold — the smallest failing tune dies at wave 4, the nearest weaker one secures. Wave-4 idle death satisfies the owner's "tighten it" and keeps competent play green; if trail now feels harsh in the browser, the revert lever is two knobs (`mothsBaselinePerWave`, runner `hpScale`) — one-word veto window noted for the owner.

**Drain-side fix (merge interaction, <20 lines):** lane-c branched before f-door-1 merged, so its updated `er01-e3-census.spec.ts` expected-object literals lacked f-door-1's new `costs` field; `expect.arrayContaining` deep-equality then red on the merged tree (2 failed, both projects). Fixed in the drain by adding `costs: [15×6]` / `costs: [20×3]` to the two literals — re-run: **er01-e3-census + e3-moth-season 10/10 both projects.**

**Evidence:**
| Gate | Result |
|---|---|
| tsc / build | rc=0 / rc=0 |
| own+adjacent round 1 | 2 failed (the merge interaction above) — attributed, fixed, re-run 10/10; task-025 + m1-01 green in round 1 |
| test:node-guards (v26.4.0) | 381 tests, 378 pass, 3 fail = the collection-guard class tripping on the LIVE lane-d worktree (mp-07b running); same fingerprint the f-door-2 drain documented; non-blocking |
| test:task-guards | red on `tasks/archive-CODEX-WALL-lifted-s1545.md` (a fire's retention-law archive with no disposition banner) — cured in this drain with a ⏸️ banner; audit now 944/0 rc=0 |
| Runner-side | idle `secured:false` w4 `fnv1a32:4ea9c0db` · fixture `secured:true` w12 `fnv1a32:b7d92c64` · engines identical · browser moth spec 2→4 updated, green both projects · E1 manifest fixture unchanged · 380/380 guards on its shell |
| Transcript | `artifacts/f-bal-1-gate.txt` |

**Merge classification:** base = lane-c's morning branch point; 12 files, all LANE-TOUCHED or NEW; auto-merged beside f-door-1/f-e2s-1/f-door-2's main movement (MechanicsManifest, HeadlessContractSim) — hunks disjoint, no conflicts. `ContractFamilies.ts` +1 (the optional config field's type home) and `Game.ts` +4/-1 (the explicitly-permitted MothSwarm feed site) judged lawful.

**Findings:** the census-spec class (complete-literal expectations red on any additive manifest field) will recur on every manifest addition — noted for the next author; non-blocking here.
