# Review — f-door-1: the door publishes the buildable cost curve

**Slice/branch/tip:** f-door-1 (`tasks/lane-fdoor1-cost-curve.md`) · `lane/b` · tip `b6568ff3c0b0f91382f01e365c9842d2dca34ed5` · merged to main as `566b2c25abb9701fd520ce27ed6b44d6379ea100` (drained attended, 2026-08-08 morning).

**Verdict: MERGED — gate green.**

**What it does:** The mechanics manifest now publishes per-instance prices: every buildable entry gains a `costs` array (first `min(maxCount, 6)` instance prices from `costCurve(index)`), and the two curved buildables (`turret` [50,70,95,125], `sentry_beacon` [25,35,45,55,75,95]) additionally declare `costRule: "ceil-to-5"`. skill.md states the pricing truth in one paragraph (line 93). The E1 manifest fixture is re-derived; the enumerated view snapshot in agent-view.spec.ts follows. Cures F-DOOR-1 (the pi entrant burned runs reverse-engineering the rounding).

**Honest scope extension, judged acceptable:** turret and sentry_beacon were not IN the manifest's buildables list at all (it carried only twist-sourced entries), so publishing their curves required admitting them — the run added `registryBuildables`, gated to E1 contracts only after its own review caught them leaking into unsupported epochs (E4 reject-don't-stretch census 8/8 green). This serves the finding's WHY directly; the fixture diff therefore contains the two new entries plus the new fields, with every pre-existing field/value byte-identical (runner-verified, fixture matches live derivation byte-for-byte).

**Evidence:**
| Gate | Result |
|---|---|
| tsc --noEmit (merged tree) | rc=0 |
| npm run build | rc=0 |
| run-guards --changed-since f99869645 | 4/5; test:node-guards red = F-1507-1 node-major instrument class (attended shell v23.11.1) |
| test:node-guards re-run on pinned v26.4.0 | **379/379 pass, 0 fail, 0 skipped** |
| own+adjacent (agent-view + task-025 + m1-01 + m2-01, both projects, --workers=1) | **42/42 pass**, 179.5s, zero unexpected console/page errors (1 known GLTFLoader blob transient, suppressed by the spec's own known-transient rider) |
| Runner-side (lane, node 26) | 356/356 node guards · agent-view 10/10 both projects · the-claim CLI probe shows `costs` |
| Transcript | `artifacts/f-door-1-gate.txt` |

**Merge classification:** base `f99869645888f924e249bd651b2ec0325f261a25`, `git merge --no-ff` clean auto-merge. Files: `src/agent/MechanicsManifest.ts` LANE-TOUCHED · `public/skill.md` LANE-TOUCHED (auto-merged beside main's F-DOOR-4 door-contracts block, both survive) · `e2e/fixtures/e1-mechanics-manifests.json` LANE-TOUCHED · `e2e/agent-view.spec.ts` LANE-TOUCHED. No conflicts.

**Findings:** none blocking. (F-1507-1 re-observed on the attended shell — already ledgered, cure is the node pin, not this slice.)
