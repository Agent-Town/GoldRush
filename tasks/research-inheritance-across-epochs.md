# research-inheritance-across-epochs — old science stays USEFUL and VISIBLE after a transition
ROLE: meta-systems implementer. WORKDIR: lane-a (worktrees/lane-a).
CODEX: model=gpt-5.6-sol effort=high

## WHY (owner, minutes after the FIRST epoch activation, 2026-07-12, verbatim): "what happened to the old science? It is still useful, right? I can't see the old science tree from before, it should be somewhere there?"
VERIFIED gaps (attended trace, same morning):
- **GAP A (mechanical):** `Game.researchState = loadResearchState(..., activeEpochId())` → post-activation this is the fresh `epoch-2` state (taken=[]). Every effect site reads it via `hasResearchNode(this.researchState, id)` — Game.ts:846 (family upgrade gates), :4772 (assay_grading cap), :4883 (second_order_slot), :4979; ResearchTree.ts:266 (contract tier via pattern_library/refined_assay). **All E1 taken-node effects are silently inert in E2-active runs.** The E1 state itself is SAFE (per-epoch key `gr.research.epoch-1-frontier.v1` untouched; science overflow DID bank forward via the 077 cursor). Law (saga master plan): epochs ADD, never replace — inheritance is the design; the wiring is the gap.
- **GAP B (visibility):** `renderResearchChart(activeProfileResearchState())` renders the ACTIVE epoch only; completed eras' trees are unreachable in the UI.

## READ-FIRST
- src/meta/ResearchTree.ts: loadResearchState (per-epoch keys, legacy migration, cursor), hasResearchNode, stateEpochId, normalizeResearchState + **THE CANONICAL LAW**: ResearchState round-trips through RunSuspend with canonical key order and strict normalize (see src/game/RunSuspend.ts decodeResearchState; the s-mega-drain unlocks lesson). **DO NOT ADD A PERSISTED FIELD TO ResearchState** — schema ripple breaks suspend canonicalization.
- src/ui/ResearchChart.ts (render seam), src/meta/ContractFamilies.ts loadEpoch (epoch order/successor chain), e2e/077-epoch-substrate.spec.ts (the substrate truths that must stay green).

## SCOPE
1. **Inheritance (GAP A), schema-free:** in ResearchTree, maintain a module-level inherited-taken lookup: when `loadResearchState(epochId)` runs, derive the UNION of `taken` from all PRIOR epochs in the successor chain (read their per-epoch keys; epoch-1 includes legacy fallback) and cache it keyed by (storage identity, epochId). `hasResearchNode(state, id)` returns `state.taken.includes(id) || inheritedTaken(stateEpochId(state)).has(id)`. ResearchState SHAPE UNCHANGED (suspend/canonical untouched — prove it: run-suspend + 077 suites unmodified-green). Node-id collisions: prior-epoch ids are namespaced-distinct today (verify with a one-off audit line in the report); if any collide, inherited set EXCLUDES ids redeclared by the active epoch (active wins).
2. **Visibility (GAP B):** the schoolhouse chart gains a small era row when >1 epoch has state: active era default + completed eras as read-only pages ("The Frontier — complete ✓", nodes shown taken/untaken, no interactions). Reuse renderResearchChart with a readonly flag rather than a new renderer.
3. e2e: (a) activate E2 with E1 nodes taken → in-run diagnostics show assay_grading cap + second_order_slot + a family gate STILL active; (b) chart shows the Frontier page read-only with his taken nodes; (c) suspend round-trip mid-E2-run stays canonical-green. Both projects.

## TOUCH-ONLY: src/meta/ResearchTree.ts, src/ui/ResearchChart.ts, src/town/TownScene.ts (chart-call plumbing only), one new e2e, artifacts/.
## NO: ResearchState schema/persisted keys, RunSuspend.ts, Game.ts effect sites (they must keep working UNCHANGED via hasResearchNode), Megaproject, epoch manifests.
## SELF-CHECK: tsc; build; new spec green BOTH projects; 077 + run-suspend + sci-01 + 072 suites unmodified-green; zero console; screenshots of the era row + Frontier read-only page.
END: READY-FOR-GATES + the collision-audit line + confirm suspend canonical hash unchanged.
