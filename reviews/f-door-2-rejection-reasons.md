# Review — f-door-2: refused builds name their cause

**Slice/branch/tip:** f-door-2 (`tasks/lane-fdoor2-rejection-reasons.md`) · `lane/b` · tip `5e44af0f5` · merged to main by drain commit (this commit's parent2) · drained attended 2026-08-08.

**Verdict: MERGED — gate green with two documented known-red classes.**

**What it does:** Build refusals now carry an additive `detail` cause through the door — `insufficient_gold | invalid_position | collision | out_of_zone | cap_reached` — decided in `src/systems/BuildSystem.ts` (+29, the scope-1 traced cause-decider, firewall-lifted by name), threaded through the receipt shape (`ToolSurface.ts` +5, enum untouched) into the order failure line (`StandingOrders.ts` +5: `FAILED (insufficient_gold): BUILD action was rejected.`). skill.md gains the cause vocabulary paragraph AND the F-DOOR-3 seam-respawn sentence (folded per that finding's gate, in its own section). Cures F-DOOR-2; carries F-DOOR-3's doc half.

**Evidence:**
| Gate | Result |
|---|---|
| tsc / build (merged tree) | rc=0 / rc=0 |
| run-guards --changed-since b6568ff3c | 4/5; node-guards red on the attended shell = F-1507-1 node-major class |
| test:node-guards re-run on v26.4.0 | 380 tests, **377 pass, 3 fail** — all three are the collection-class guards (cwd-invariance, fixture-teardown, vite-only collection) tripping on a live/stale lane worktree `?raw` JSON import; the f-door-2 runner reported the SAME fingerprint as pre-existing (353/356) BEFORE this merge existed. Two instruments, one pre-merge — not this slice's doing |
| own+adjacent (agent-view + task-025 + m1-01 + m2-01, both projects, --workers=1) | **42/42**, rc=0 |
| Runner-side | node-26 tsc/build green · gr-sim 12/12 with pins UNMOVED (detail never enters event log/hash) · skillmd guard 4/4 · new test asserts the exact new failure line |
| Transcript | `artifacts/f-door-2-gate.txt` |

**Merge classification:** base `b6568ff3c` (= f-door-1's lane tip; this slice stacked cleanly after its predecessor drained). All five files LANE-TOUCHED; skill.md + gr-sim.test auto-merged beside main's f-e2s-1 changes; no conflicts, no MAIN-MOVED judgment needed.

**Findings:**
- F-1507-1 re-observed (attended shell node 23) — ledgered, not this slice's.
- The collection-guard worktree sensitivity (3 reds on an instrument scanning live lanes) deserves its own row if it recurs on a QUIET board — this fire's board had lane-d live, so today's manifestation is explained. NON-BLOCKING.
